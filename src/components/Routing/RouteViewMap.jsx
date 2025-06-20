import React, { useEffect, useRef } from 'react';
import { getPolygonCentroid, getRouteDisplayNumber, createRouteLabel } from '../../utils/mapHelpers';

// Dynamic imports for Leaflet to avoid SSR issues
let L;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
  
  // Fix Leaflet default icon issue
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}

const RouteViewMap = ({ route }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !route || typeof window === 'undefined' || !L) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Error removing map:', e);
      }
      mapInstanceRef.current = null;
    }

    // Check if container already has a map
    if (mapRef.current._leaflet_id) {
      mapRef.current._leaflet_id = null;
    }

    // Initialize map
    const map = L.map(mapRef.current);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add depot marker if available
    if (route.depot && route.depot.location && route.depot.location.coordinates) {
      const [lng, lat] = route.depot.location.coordinates;
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${route.depot.name}</b><br>Depot Location`);
    }

    // Add geofence polygon if available
    if (route.geofence && route.geofence.coordinates && route.geofence.coordinates[0]) {
      const coordinates = route.geofence.coordinates[0].map(coord => [coord[1], coord[0]]); // Convert [lng, lat] to [lat, lng]
      const polygon = L.polygon(coordinates, {
        color: route.color || '#3B82F6',
        fillOpacity: 0.3,
        weight: 2
      }).addTo(map);

      // Add route number label at polygon center
      const centroid = getPolygonCentroid(coordinates);
      const routeNumber = getRouteDisplayNumber(route.name);
      const labelIcon = createRouteLabel(L, routeNumber, route.color || '#3B82F6');
      
      L.marker([centroid.lat, centroid.lng], {
        icon: labelIcon,
        interactive: false,
        zIndexOffset: 1000
      }).addTo(map);

      // Fit map to polygon bounds
      map.fitBounds(polygon.getBounds());
    } else if (route.depot && route.depot.location && route.depot.location.coordinates) {
      // If no geofence, center on depot
      const [lng, lat] = route.depot.location.coordinates;
      map.setView([lat, lng], 13);
    } else {
      // Default view
      map.setView([52.5, -1.9], 10);
    }

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error cleaning up map:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [route]);

  // Don't render anything on server side
  if (typeof window === 'undefined') {
    return <div style={{ height: '500px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Loading map...</p>
    </div>;
  }

  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default RouteViewMap;