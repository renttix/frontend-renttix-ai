"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const deliveryIcon = {
  iconUrl: '/images/markers/delivery-pin.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
};

export default function DeliveryMap({
  deliveryCoordinates,
  deliveryAddress,
  onLocationChange,
  height = "400px"
}) {
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(
    deliveryCoordinates
      ? [parseFloat(deliveryCoordinates.lat), parseFloat(deliveryCoordinates.lng)]
      : [52.4862, -1.8904]
  );
  const [currentAddress, setCurrentAddress] = useState(deliveryAddress);

  useEffect(() => {
    if (deliveryCoordinates) {
      const newPos = [parseFloat(deliveryCoordinates.lat), parseFloat(deliveryCoordinates.lng)];
      setPosition(newPos);
      map?.setView(newPos, 14);
    }
  }, [deliveryCoordinates, map]);

  const handleDragEnd = async (e) => {
    const marker = e.target;
    const newLatLng = marker.getLatLng();
    const updated = { lat: newLatLng.lat, lng: newLatLng.lng };
    setPosition([updated.lat, updated.lng]);

    if (onLocationChange) {
      onLocationChange(updated);
    }

    // Get new address
    const address = await fetchAddressFromCoordinates(updated.lat, updated.lng);
    if (address) setCurrentAddress(address);
  };

  // Simple reverse geocoding using Nominatim (OpenStreetMap)
  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return {
        address1: data?.display_name || "Unknown Address",
        city: data?.address?.city || data?.address?.town || data?.address?.village || '',
        postcode: data?.address?.postcode || ''
      };
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return null;
    }
  };

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

      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        whenCreated={(mapInstance) => {
          setMap(mapInstance);
          setTimeout(() => mapInstance.invalidateSize(), 100);
        }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={position}
          draggable={true}
          icon={L.icon(deliveryIcon)}
          eventHandlers={{ dragend: handleDragEnd }}
        >
          <Popup>
            <div className="p-2">
              <h4 className="font-semibold mb-1">Delivery Location</h4>
              <p className="text-sm">{currentAddress?.address1}</p>
              <p className="text-sm">{currentAddress?.city}, {currentAddress?.postcode}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
