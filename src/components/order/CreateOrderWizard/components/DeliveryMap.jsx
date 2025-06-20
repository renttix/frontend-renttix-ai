"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

// Custom icon for delivery location
const deliveryIcon = {
  iconUrl: '/images/markers/delivery-pin.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
};

// Custom icon for depot
const depotIcon = {
  iconUrl: '/images/markers/depot-pin.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
};

export default function DeliveryMap({ 
  deliveryCoordinates, 
  deliveryAddress, 
  assignedRoute,
  showRouteDetails = true,
  height = "400px"
}) {
  const [map, setMap] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Center map on delivery location
  const center = deliveryCoordinates 
    ? [deliveryCoordinates.lat, deliveryCoordinates.lng]
    : [52.4862, -1.8904]; // Default to Birmingham
    
  useEffect(() => {
    if (map && deliveryCoordinates) {
      map.setView([deliveryCoordinates.lat, deliveryCoordinates.lng], 14);
    }
  }, [map, deliveryCoordinates]);
  
  // Simulate route path calculation
  useEffect(() => {
    if (assignedRoute && deliveryCoordinates) {
      // In production, this would call a routing API
      setTimeout(() => {
        // Simulated route path
        const simulatedPath = [
          [assignedRoute.depot?.coordinates?.lat || 52.4862, assignedRoute.depot?.coordinates?.lng || -1.8904],
          [deliveryCoordinates.lat + 0.01, deliveryCoordinates.lng - 0.01],
          [deliveryCoordinates.lat + 0.005, deliveryCoordinates.lng + 0.005],
          [deliveryCoordinates.lat, deliveryCoordinates.lng]
        ];
        setRoutePath(simulatedPath);
        setEstimatedTime(Math.floor(Math.random() * 20) + 10); // 10-30 minutes
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
    }
  }, [assignedRoute, deliveryCoordinates]);
  
  // Convert route boundary to polygon coordinates
  const getRouteBoundary = () => {
    if (!assignedRoute?.geofence?.coordinates?.[0]) return null;
    
    // Handle GeoJSON format
    return assignedRoute.geofence.coordinates[0].map(coord => [coord[1], coord[0]]);
  };
  
  const routeBoundary = getRouteBoundary();
  
  return (
    <div className="delivery-map-container">
      <style jsx global>{`
        .leaflet-container {
          height: ${height};
          width: 100%;
          border-radius: 8px;
          z-index: 1;
        }
      `}</style>
      
      <div style={{ height, position: 'relative' }}>
        {typeof window !== 'undefined' && (
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={false}
            ref={setMap}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Delivery Location Marker */}
            {deliveryCoordinates && (
              <Marker 
                position={[deliveryCoordinates.lat, deliveryCoordinates.lng]}
                icon={L.icon(deliveryIcon)}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold mb-1">Delivery Location</h4>
                    <p className="text-sm">{deliveryAddress.address1}</p>
                    <p className="text-sm">{deliveryAddress.city}, {deliveryAddress.postcode}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Route Boundary */}
            {routeBoundary && (
              <Polygon
                positions={routeBoundary}
                pathOptions={{
                  color: '#3B82F6',
                  fillColor: '#3B82F6',
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />
            )}
            
            {/* Depot Marker */}
            {assignedRoute?.depot?.coordinates && (
              <Marker
                position={[
                  assignedRoute.depot.coordinates.lat,
                  assignedRoute.depot.coordinates.lng
                ]}
                icon={L.icon(depotIcon)}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold mb-1">Depot</h4>
                    <p className="text-sm">{assignedRoute.depot.name}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Route Path */}
            {routePath.length > 0 && (
              <Polyline
                positions={routePath}
                pathOptions={{
                  color: '#10B981',
                  weight: 4,
                  opacity: 0.7,
                  dashArray: '10, 10'
                }}
              />
            )}
          </MapContainer>
        )}
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
            <div className="text-center">
              <i className="pi pi-spin pi-spinner text-2xl mb-2"></i>
              <p className="text-sm">Calculating route...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Route Details */}
      {showRouteDetails && assignedRoute && (
        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Route Details</h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <i className="pi pi-map-marker text-blue-500"></i>
                  <span>{assignedRoute.name}</span>
                </div>
                {estimatedTime && (
                  <div className="flex items-center gap-2">
                    <i className="pi pi-clock text-green-500"></i>
                    <span>~{estimatedTime} minutes</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <i className="pi pi-user text-purple-500"></i>
                  <span>{assignedRoute.driver?.name || 'Unassigned'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                icon="pi pi-directions"
                label="Get Directions"
                className="p-button-sm p-button-outlined"
                onClick={() => {
                  // Open in Google Maps
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${deliveryCoordinates.lat},${deliveryCoordinates.lng}`;
                  window.open(url, '_blank');
                }}
              />
              <Button
                icon="pi pi-refresh"
                className="p-button-sm p-button-text"
                onClick={() => {
                  if (map) {
                    map.setView([deliveryCoordinates.lat, deliveryCoordinates.lng], 14);
                  }
                }}
                tooltip="Reset view"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}