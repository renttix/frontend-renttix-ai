'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component with SSR disabled
const EnhancedGeofenceEditor = dynamic(
  () => import('../../../../components/Routing/EnhancedGeofenceEditor'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '500px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Loading map...</p>
    </div>
  }
);

export default function TestMapPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Map Test Page</h1>
      <p className="mb-4">This page tests if the Leaflet map is loading correctly.</p>
      
      <div className="card">
        <EnhancedGeofenceEditor
          initialGeofence={null}
          depotId="6745e8c6e3b2f6a9d4c8e123" // Birmingham Central Depot ID
          onGeofenceChange={(geofence) => console.log('Geofence changed:', geofence)}
          mode="create"
        />
      </div>
    </div>
  );
}