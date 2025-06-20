'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiClock, FiPackage, FiSave } from 'react-icons/fi';
import { Card } from 'primereact/card';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import DefaultLayout from '@/components/Layouts/DefaultLaout';
import apiServices from '../../../../../../services/apiService';

const RouteSettingsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Service Window States
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [serviceDuration, setServiceDuration] = useState<number>(15);

  // Capacity States
  const [maxOrders, setMaxOrders] = useState<number>(50);
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [maxDuration, setMaxDuration] = useState<number>(480);

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
        
        // Initialize service window
        if (routeData.serviceWindow) {
          if (routeData.serviceWindow.startTime) {
            const [hours, minutes] = routeData.serviceWindow.startTime.split(':');
            const start = new Date();
            start.setHours(parseInt(hours), parseInt(minutes), 0);
            setStartTime(start);
          }
          if (routeData.serviceWindow.endTime) {
            const [hours, minutes] = routeData.serviceWindow.endTime.split(':');
            const end = new Date();
            end.setHours(parseInt(hours), parseInt(minutes), 0);
            setEndTime(end);
          }
          if (routeData.serviceWindow.duration) {
            setServiceDuration(routeData.serviceWindow.duration);
          }
        }
        
        // Initialize capacity
        if (routeData.capacity) {
          setMaxOrders(routeData.capacity.maxOrders || 50);
          setMaxDistance(routeData.capacity.maxDistance || 100);
          setMaxDuration(routeData.capacity.maxDuration || 480);
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setError('Failed to load route settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!startTime || !endTime) {
      setError('Please set both start and end times');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    if (serviceDuration < 1) {
      setError('Service duration must be at least 1 minute');
      return;
    }

    if (maxOrders < 1) {
      setError('Maximum orders must be at least 1');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        serviceWindow: {
          startTime: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`,
          endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
          duration: serviceDuration
        },
        capacity: {
          maxOrders,
          maxDistance,
          maxDuration
        }
      };

      const response = await apiServices.put(`/routes/${params.id}`, updateData);
      
      if (response.data.success) {
        setSuccess('Route settings updated successfully!');
        setTimeout(() => {
          router.push('/system-setup/routing');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating route settings:', error);
      setError('Failed to update route settings');
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
              <p>Loading route settings...</p>
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
          
          <h1 className="text-3xl font-bold text-gray-900">Route Settings</h1>
          <p className="text-gray-600 mt-2">Configure service window and capacity for {route?.name}</p>
        </div>

        {error && (
          <Message severity="error" text={error} className="mb-4" />
        )}
        {success && (
          <Message severity="success" text={success} className="mb-4" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Window Card */}
          <Card title={
            <div className="flex items-center">
              <FiClock className="mr-2" />
              Service Window
            </div>
          }>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <Calendar 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.value as Date)}
                  timeOnly 
                  hourFormat="24"
                  className="w-full"
                  placeholder="Select start time"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <Calendar 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.value as Date)}
                  timeOnly 
                  hourFormat="24"
                  className="w-full"
                  placeholder="Select end time"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Service Duration (minutes)
                </label>
                <InputNumber 
                  value={serviceDuration} 
                  onValueChange={(e) => setServiceDuration(e.value || 15)}
                  min={1}
                  max={120}
                  suffix=" min"
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Average time spent at each delivery location
                </p>
              </div>
            </div>
          </Card>

          {/* Capacity Card */}
          <Card title={
            <div className="flex items-center">
              <FiPackage className="mr-2" />
              Capacity Limits
            </div>
          }>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Orders
                </label>
                <InputNumber 
                  value={maxOrders} 
                  onValueChange={(e) => setMaxOrders(e.value || 50)}
                  min={1}
                  max={500}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum number of orders this route can handle
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Distance (km)
                </label>
                <InputNumber 
                  value={maxDistance} 
                  onValueChange={(e) => setMaxDistance(e.value || 100)}
                  min={1}
                  max={1000}
                  suffix=" km"
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum total distance for the route
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Duration (minutes)
                </label>
                <InputNumber 
                  value={maxDuration} 
                  onValueChange={(e) => setMaxDuration(e.value || 480)}
                  min={60}
                  max={720}
                  suffix=" min"
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum total time for completing the route ({Math.floor(maxDuration / 60)}h {maxDuration % 60}m)
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={() => router.back()}
            disabled={saving}
          />
          <Button
            label="Save Settings"
            icon="pi pi-save"
            onClick={handleSave}
            loading={saving}
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default RouteSettingsPage;