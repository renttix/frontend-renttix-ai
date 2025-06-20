import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import apiServices from '../../../services/apiService';

// Dynamic imports for Leaflet to avoid SSR issues
let L;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
  require('leaflet-draw/dist/leaflet.draw.css');
  require('leaflet-draw');
  
  // Fix Leaflet default icon issue
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}

const GeofenceEditor = ({ initialGeofence, depotId, onGeofenceChange }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const [depot, setDepot] = useState(null);

  useEffect(() => {
    if (depotId) {
      fetchDepotDetails();
    }
  }, [depotId]);

  const fetchDepotDetails = async () => {
    try {
      const response = await apiServices.get(`/depots/${depotId}`);
      if (response.data.success) {
        setDepot(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching depot:', error);
    }
  };

  useEffect(() => {
    if (!mapRef.current || !depot || mapInstanceRef.current || typeof window === 'undefined' || !L) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(
      [depot.coordinates.lat, depot.coordinates.lng],
      12
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add depot marker
    L.marker([depot.coordinates.lat, depot.coordinates.lng])
      .addTo(map)
      .bindPopup(`<b>${depot.name}</b><br>Depot Location`)
      .openPopup();

    // Initialize drawing controls
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        remove: true
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#3B82F6'
          }
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false
      }
    });
    map.addControl(drawControl);

    // Handle drawing events
    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      drawnItems.clearLayers(); // Only allow one geofence at a time
      drawnItems.addLayer(layer);
      
      const coordinates = layer.getLatLngs()[0].map(latlng => [latlng.lng, latlng.lat]);
      coordinates.push(coordinates[0]); // Close the polygon
      
      if (onGeofenceChange) {
        onGeofenceChange({
          type: 'Polygon',
          coordinates: [coordinates]
        });
      }
    });

    map.on(L.Draw.Event.EDITED, (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        const coordinates = layer.getLatLngs()[0].map(latlng => [latlng.lng, latlng.lat]);
        coordinates.push(coordinates[0]); // Close the polygon
        
        if (onGeofenceChange) {
          onGeofenceChange({
            type: 'Polygon',
            coordinates: [coordinates]
          });
        }
      });
    });

    map.on(L.Draw.Event.DELETED, () => {
      if (onGeofenceChange) {
        onGeofenceChange(null);
      }
    });

    mapInstanceRef.current = map;

    // Load initial geofence if provided
    if (initialGeofence && initialGeofence.coordinates) {
      const coordinates = initialGeofence.coordinates[0].map(coord => [coord[1], coord[0]]);
      const polygon = L.polygon(coordinates, {
        color: '#3B82F6'
      });
      drawnItems.addLayer(polygon);
      map.fitBounds(polygon.getBounds());
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [depot, initialGeofence]);

  // Don't render anything on server side
  if (typeof window === 'undefined') {
    return <div style={{ height: '500px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Loading map...</p>
    </div>;
  }

  return (
    <div>
      <div ref={mapRef} style={{ height: '500px', width: '100%' }} />
      <div className="mt-3">
        <Button 
          label="Clear Geofence" 
          icon="pi pi-trash" 
          className="p-button-secondary"
          onClick={() => {
            if (drawnItemsRef.current) {
              drawnItemsRef.current.clearLayers();
              if (onGeofenceChange) {
                onGeofenceChange(null);
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default GeofenceEditor;