import React, { useEffect, useRef } from 'react';
import { getPolygonCentroid, getRouteDisplayNumber, createRouteLabel } from '../../utils/mapHelpers';

// Dynamic imports for Leaflet to avoid SSR issues
let L;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
  require('leaflet-draw/dist/leaflet.draw.css');
  
  // Fix Leaflet default icon issue
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}

const RouteMapVisualization = ({ route }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || typeof window === 'undefined' || !L) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(
      [route.depot?.coordinates?.lat || 52.4862, route.depot?.coordinates?.lng || -1.8904],
      12
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add depot marker
    if (route.depot?.coordinates) {
      L.marker([route.depot.coordinates.lat, route.depot.coordinates.lng])
        .addTo(map)
        .bindPopup(`<b>Depot:</b> ${route.depot.name}`);
    }

    // Draw geofence
    if (route.geofence && route.geofence.coordinates) {
      const coordinates = route.geofence.coordinates[0].map(coord => [coord[1], coord[0]]);
      const polygon = L.polygon(coordinates, {
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.3
      }).addTo(map);
      
      // Add route number label at polygon center
      const centroid = getPolygonCentroid(coordinates);
      const routeNumber = getRouteDisplayNumber(route.name);
      const labelIcon = createRouteLabel(L, routeNumber, '#3B82F6');
      
      L.marker([centroid.lat, centroid.lng], {
        icon: labelIcon,
        interactive: false,
        zIndexOffset: 1000
      }).addTo(map);
      
      map.fitBounds(polygon.getBounds());
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [route]);

  // Don't render anything on server side
  if (typeof window === 'undefined') {
    return <div style={{ height: '400px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Loading map...</p>
    </div>;
  }

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
};

export default RouteMapVisualization;