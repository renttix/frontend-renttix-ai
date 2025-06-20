'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import DefaultLayout from '@/components/Layouts/DefaultLaout';
import apiServices from '../../../../../../services/apiService';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

// Dynamically import map component with SSR disabled
const EnhancedGeofenceEditor = dynamic(
  () => import('../../../../../components/Routing/EnhancedGeofenceEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading map...</p>
        </div>
      </div>
    )
  }
);

const RouteEditPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [route, setRoute] = useState<any>(null);
  const [routeName, setRouteName] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [geofence, setGeofence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const weekDays = [
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
    { label: 'Sunday', value: 0 }
  ];

  useEffect(() => {
    if (params.id) {
      fetchRoute();
    }
  }, [params.id]);

  const fetchRoute = async () => {
    try {
      setLoading(true);
      const response = await apiServices.get(`/routes/${params.id}`);
      if (response.data.success) {
        const routeData = response.data.data;
        setRoute(routeData);
        setRouteName(routeData.name);
        setSelectedDay(routeData.schedule?.dayOfWeek || 1);
        
        // Convert geofence to the format expected by the editor
        if (routeData.geofence && routeData.geofence.coordinates) {
          const coords = routeData.geofence.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
          setGeofence(coords);
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setError('Failed to load route details');
    } finally {
      setLoading(false);
    }
  };

  const handleGeofenceChange = (newGeofence: any) => {
    setGeofence(newGeofence);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!routeName.trim()) {
      setError('Please enter a route name');
      return;
    }

    if (!geofence || geofence.length < 3) {
      setError('Please draw a service area with at least 3 points');
      return;
    }

    setSaving(true);

    try {
      // Ensure polygon is closed
      const closedGeofence = [...geofence];
      if (closedGeofence.length > 0) {
        const firstPoint = closedGeofence[0];
        const lastPoint = closedGeofence[closedGeofence.length - 1];
        if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
          closedGeofence.push([...firstPoint]);
        }
      }

      const updateData = {
        name: routeName.trim(),
        geofence: {
          type: 'Polygon',
          coordinates: [closedGeofence.map(coord => [coord[1], coord[0]])] // Convert [lat, lng] to [lng, lat]
        },
        schedule: {
          pattern: 'weekly',
          dayOfWeek: selectedDay
        }
      };

      const response = await apiServices.put(`/routes/${params.id}`, updateData);
      
      if (response.data.success) {
        setSuccess('Route updated successfully!');
        setTimeout(() => {
          router.push('/system-setup/routing');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating route:', error);
      setError('Failed to update route');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading route details...</p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error && !route) {
    return (
      <DefaultLayout>
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Edit Route</h1>
        </div>

        <Card title="Edit Maintenance Route">
          {error && (
            <Message severity="error" text={error} className="mb-3" />
          )}
          {success && (
            <Message severity="success" text={success} className="mb-3" />
          )}

          <div className="grid">
            <div className="col-12 md:col-6 lg:col-4">
              <div className="field">
                <label htmlFor="routeName">Route Name *</label>
                <InputText
                  id="routeName"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="e.g., North Birmingham Route"
                  className="w-full"
                />
              </div>
            </div>

            <div className="col-12 md:col-6 lg:col-4">
              <div className="field">
                <label htmlFor="serviceDay">Service Day</label>
                <Dropdown
                  id="serviceDay"
                  value={selectedDay}
                  options={weekDays}
                  onChange={(e) => setSelectedDay(e.value)}
                  placeholder="Select service day"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {route && route.depot && (
            <div className="mt-3">
              <EnhancedGeofenceEditor
                initialGeofence={geofence}
                depotId={route.depot._id || route.depot}
                onGeofenceChange={handleGeofenceChange}
                mode="edit"
              />
            </div>
          )}

          <div className="flex justify-content-between align-items-center mt-4">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-outlined"
              onClick={() => router.back()}
              disabled={saving}
            />
            <Button
              label="Save Changes"
              icon="pi pi-save"
              className="p-button-success"
              onClick={handleSave}
              loading={saving}
              disabled={!routeName || !geofence || geofence.length < 3}
            />
          </div>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default RouteEditPage;