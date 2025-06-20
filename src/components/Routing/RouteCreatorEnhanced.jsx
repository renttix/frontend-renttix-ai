import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import apiServices from '../../../services/apiService';
import EnhancedGeofenceEditor from './EnhancedGeofenceEditor';

const RouteCreatorEnhanced = ({ onRouteCreated }) => {
  const [routeName, setRouteName] = useState('');
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [selectedDepot, setSelectedDepot] = useState('');
  const [geofence, setGeofence] = useState([]);
  const [depots, setDepots] = useState([]);
  const [loadingDepots, setLoadingDepots] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    fetchDepots();
  }, []);

  const fetchDepots = async () => {
    try {
      setLoadingDepots(true);
      const response = await apiServices.get('/depots/list');
      if (response.data.data && Array.isArray(response.data.data)) {
        const depotOptions = response.data.data.map(depot => ({
          label: depot.name,
          value: depot._id
        }));
        setDepots(depotOptions);
        
        // Auto-select if only one depot
        if (depotOptions.length === 1) {
          setSelectedDepot(depotOptions[0].value);
        }
      }
    } catch (error) {
      console.error('Error fetching depots:', error);
      setError('Failed to load depots');
    } finally {
      setLoadingDepots(false);
    }
  };

  const handleGeofenceChange = (newGeofence) => {
    setGeofence(newGeofence);
  };

  const validateForm = () => {
    if (!routeName.trim()) {
      setError('Please enter a route name');
      return false;
    }
    if (!selectedDepot) {
      setError('Please select a depot');
      return false;
    }
    if (geofence.length < 3) {
      setError('Please draw a service area with at least 3 points');
      return false;
    }
    return true;
  };

  const handleSaveRoute = async () => {
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

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

      const routeData = {
        name: routeName.trim(),
        depot: selectedDepot,
        geofence: {
          type: 'Polygon',
          coordinates: [closedGeofence.map(coord => [coord[1], coord[0]])] // Convert [lat, lng] to [lng, lat] for MongoDB
        },
        schedule: {
          pattern: 'weekly',
          dayOfWeek: selectedDay
        },
        serviceWindow: {
          startTime: '08:00',
          endTime: '17:00',
          duration: 15
        },
        capacity: {
          maxOrders: 50,
          maxDistance: 100,
          maxDuration: 480
        },
        isActive: true
      };

      const response = await apiServices.post('/routes', routeData);
      
      if (response.data.success) {
        setSuccess('Route created successfully!');
        // Reset form
        setRouteName('');
        setGeofence([]);
        setSelectedDay(1);
        
        // Notify parent component
        if (onRouteCreated) {
          onRouteCreated(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error creating route:', error);
      setError(error.response?.data?.message || 'Failed to create route');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearArea = () => {
    setGeofence([]);
  };

  return (
    <Card title="Create Maintenance Route">
      {error && (
        <Message severity="error" text={error} className="mb-3" />
      )}
      {success && (
        <Message severity="success" text={success} className="mb-3" />
      )}

      <div className="grid">
        <div className="col-12 md:col-6 lg:col-4">
          <div className="field">
            <label htmlFor="depot">Select Depot *</label>
            <Dropdown
              id="depot"
              value={selectedDepot}
              options={depots}
              onChange={(e) => setSelectedDepot(e.value)}
              placeholder="Select a depot"
              className="w-full"
              loading={loadingDepots}
              disabled={loadingDepots}
            />
          </div>
        </div>

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

      {selectedDepot && (
        <div className="mt-3">
          <EnhancedGeofenceEditor
            initialGeofence={geofence}
            depotId={selectedDepot}
            onGeofenceChange={handleGeofenceChange}
            mode="create"
          />
        </div>
      )}

      <div className="flex justify-content-between align-items-center mt-4">
        <Button
          label="Clear Area"
          icon="pi pi-trash"
          className="p-button-outlined"
          onClick={handleClearArea}
          disabled={geofence.length === 0 || isSaving}
        />
        <Button
          label="Save Route"
          icon="pi pi-save"
          className="p-button-success"
          onClick={handleSaveRoute}
          loading={isSaving}
          disabled={!selectedDepot || geofence.length < 3}
        />
      </div>
    </Card>
  );
};

export default RouteCreatorEnhanced;