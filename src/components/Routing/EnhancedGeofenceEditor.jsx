import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import apiServices from '../../../services/apiService';
import { getPolygonCentroid, getRouteDisplayNumber, createRouteLabel } from '../../utils/mapHelpers';

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

const EnhancedGeofenceEditor = ({ 
  initialGeofence, 
  depotId, 
  onGeofenceChange,
  currentRouteId = null,
  mode = 'edit' // 'edit' or 'create'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const routeLayersRef = useRef({});
  
  const [depot, setDepot] = useState(null);
  const [allRoutes, setAllRoutes] = useState([]);
  const [visibleRoutes, setVisibleRoutes] = useState({});
  const [showCoverageGaps, setShowCoverageGaps] = useState(false);
  const [routeColors] = useState([
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ]);

  // Fetch depot and routes data
  useEffect(() => {
    if (depotId) {
      fetchDepotData();
      fetchRoutesForDepot();
    }
  }, [depotId]);

  const fetchDepotData = async () => {
    try {
      const response = await apiServices.get(`/depots/detail/${depotId}`);
      if (response.data.success) {
        setDepot(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching depot:', error);
    }
  };

  const fetchRoutesForDepot = async () => {
    try {
      const response = await apiServices.get(`/routes?depotId=${depotId}`);
      if (response.data.success) {
        const routes = response.data.data.filter(route =>
          currentRouteId ? route._id !== currentRouteId : true
        );
        setAllRoutes(routes);
        
        // Initialize all routes as visible
        const initialVisibility = {};
        routes.forEach(route => {
          initialVisibility[route._id] = true;
        });
        setVisibleRoutes(initialVisibility);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !depot || typeof window === 'undefined' || !L) return;

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

    // Check if depot has valid coordinates
    if (!depot.latitude || !depot.longitude) {
      console.error('Depot missing coordinates:', depot);
      return;
    }

    // Check if container already has a map
    if (mapRef.current._leaflet_id) {
      mapRef.current._leaflet_id = null;
    }

    // Create new map
    const map = L.map(mapRef.current).setView(
      [depot.latitude, depot.longitude],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add depot marker
    L.marker([depot.latitude, depot.longitude])
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
          allowIntersection: true,
          showArea: true,
          shapeOptions: {
            color: '#3B82F6',
            fillOpacity: 0.3
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
      
      const coordinates = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
      
      if (onGeofenceChange) {
        onGeofenceChange(coordinates);
      }
    });

    map.on(L.Draw.Event.EDITED, (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        const coordinates = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
        
        if (onGeofenceChange) {
          onGeofenceChange(coordinates);
        }
      });
    });

    map.on(L.Draw.Event.DELETED, () => {
      if (onGeofenceChange) {
        onGeofenceChange([]);
      }
    });

    mapInstanceRef.current = map;

    // Load initial geofence if provided
    if (initialGeofence && initialGeofence.length > 0) {
      const coordinates = initialGeofence.map(coord => [coord[0], coord[1]]);
      const polygon = L.polygon(coordinates, {
        color: '#3B82F6',
        fillOpacity: 0.3
      });
      drawnItems.addLayer(polygon);
      map.fitBounds(polygon.getBounds());
    }

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
  }, [depot, initialGeofence]);

  // Update route overlays when visibility changes
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;

    // Clear existing route layers
    Object.values(routeLayersRef.current).forEach(layers => {
      if (layers.polygon) {
        mapInstanceRef.current.removeLayer(layers.polygon);
      }
      if (layers.label) {
        mapInstanceRef.current.removeLayer(layers.label);
      }
    });
    routeLayersRef.current = {};

    // Add visible routes
    allRoutes.forEach((route, index) => {
      if (visibleRoutes[route._id] && route.geofence && route.geofence.coordinates) {
        const coordinates = route.geofence.coordinates[0].map(coord => [coord[1], coord[0]]);
        const color = routeColors[index % routeColors.length];
        
        const polygon = L.polygon(coordinates, {
          color: color,
          fillColor: color,
          fillOpacity: 0.2,
          weight: 2,
          dashArray: '5, 5'
        });
        
        polygon.bindPopup(`<b>${route.name}</b><br>${route.serviceDay}`);
        polygon.addTo(mapInstanceRef.current);
        
        // Add route number label at polygon center
        const centroid = getPolygonCentroid(coordinates);
        const routeNumber = getRouteDisplayNumber(route.name);
        const labelIcon = createRouteLabel(L, routeNumber, color);
        
        const labelMarker = L.marker([centroid.lat, centroid.lng], {
          icon: labelIcon,
          interactive: false, // Make it non-clickable so it doesn't interfere with polygon
          zIndexOffset: 1000 // Ensure it appears above the polygon
        });
        
        labelMarker.addTo(mapInstanceRef.current);
        
        // Store both polygon and label for removal
        routeLayersRef.current[route._id] = {
          polygon: polygon,
          label: labelMarker
        };
      }
    });
  }, [visibleRoutes, allRoutes]);

  const toggleRouteVisibility = (routeId) => {
    setVisibleRoutes(prev => ({
      ...prev,
      [routeId]: !prev[routeId]
    }));
  };

  const toggleAllRoutes = () => {
    const allVisible = Object.values(visibleRoutes).every(v => v);
    const newVisibility = {};
    Object.keys(visibleRoutes).forEach(routeId => {
      newVisibility[routeId] = !allVisible;
    });
    setVisibleRoutes(newVisibility);
  };

  const detectCoverageGaps = () => {
    // This is a placeholder for coverage gap detection
    // In a real implementation, you would use spatial analysis
    // to find areas not covered by any route
    setShowCoverageGaps(!showCoverageGaps);
    
    if (!showCoverageGaps) {
      console.log('Analyzing coverage gaps...');
      // TODO: Implement actual gap detection algorithm
    }
  };

  // Don't render anything on server side
  if (typeof window === 'undefined') {
    return <div style={{ height: '500px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Loading map...</p>
    </div>;
  }

  return (
    <div className="enhanced-geofence-editor">
      <div className="grid">
        <div className="col-12 md:col-8">
          <Card title="Draw Service Area">
            <div ref={mapRef} style={{ height: '500px', width: '100%' }} />
            <div className="mt-3">
              <Button 
                label="Clear Area" 
                icon="pi pi-trash" 
                className="p-button-secondary mr-2"
                onClick={() => {
                  if (drawnItemsRef.current) {
                    drawnItemsRef.current.clearLayers();
                    if (onGeofenceChange) onGeofenceChange(null);
                  }
                }}
              />
              <Button 
                label="Detect Coverage Gaps" 
                icon="pi pi-search" 
                className={showCoverageGaps ? 'p-button-warning' : ''}
                onClick={detectCoverageGaps}
              />
            </div>
          </Card>
        </div>
        
        <div className="col-12 md:col-4">
          <Card title="Route Overlays">
            <div className="mb-3">
              <Button 
                label={Object.values(visibleRoutes).every(v => v) ? "Hide All" : "Show All"}
                icon="pi pi-eye"
                className="p-button-sm w-full"
                onClick={toggleAllRoutes}
              />
            </div>
            
            <div className="route-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {allRoutes.length === 0 ? (
                <p className="text-center text-500">No other routes for this depot</p>
              ) : (
                allRoutes.map((route, index) => (
                  <div key={route._id} className="flex align-items-center mb-2 p-2 border-round hover:surface-100">
                    <Checkbox 
                      inputId={`route-${route._id}`}
                      checked={visibleRoutes[route._id] || false}
                      onChange={() => toggleRouteVisibility(route._id)}
                    />
                    <label 
                      htmlFor={`route-${route._id}`} 
                      className="ml-2 flex-1 cursor-pointer"
                    >
                      <div className="flex align-items-center">
                        <Badge 
                          value=" " 
                          style={{ 
                            backgroundColor: routeColors[index % routeColors.length],
                            width: '20px',
                            height: '20px',
                            marginRight: '8px'
                          }}
                        />
                        <div>
                          <div className="font-semibold">{route.name}</div>
                          <div className="text-sm text-500">{route.serviceDay}</div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
            
            {showCoverageGaps && (
              <div className="mt-3 p-3 surface-100 border-round">
                <h4 className="mt-0 mb-2">Coverage Analysis</h4>
                <p className="text-sm">Gap detection will highlight areas not covered by any route.</p>
                <p className="text-sm text-orange-500">⚠️ Feature in development</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedGeofenceEditor;