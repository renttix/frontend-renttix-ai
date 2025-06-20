'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { InputNumber } from 'primereact/inputnumber';
import { ToggleButton } from 'primereact/togglebutton';
import { Toast } from 'primereact/toast';
import apiServices from '../../../services/apiService';
import EnhancedGeofenceEditor from './EnhancedGeofenceEditor';

const RouteEditForm = () => {
  const { routeId } = useParams();
  const router = useRouter();
  const toast = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [depots, setDepots] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    depotId: null,
    isActive: true,
    schedule: 'weekly',
    serviceDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    serviceWindow: { start: '08:00', end: '17:00' },
    maxCapacity: 50,
    geofence: []
  });

  const weekDays = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, [routeId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch depots
      const depotsResponse = await apiServices.get('/depots');
      if (depotsResponse.data.success) {
        setDepots(depotsResponse.data.data.map(d => ({
          label: d.name,
          value: d._id
        })));
      }

      // Fetch route details
      const routeResponse = await apiServices.get(`/routes/${routeId}`);
      if (routeResponse.data.success) {
        const route = routeResponse.data.data;
        setFormData({
          name: route.name,
          depotId: route.depotId,
          isActive: route.isActive,
          schedule: route.schedule?.pattern || 'weekly',
          serviceDays: route.serviceDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          serviceWindow: route.serviceWindow || { start: '08:00', end: '17:00' },
          maxCapacity: route.maxCapacity || 50,
          geofence: route.geofence || []
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to load route data' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const response = await apiServices.put(`/routes/${routeId}`, formData);
      if (response.data.success) {
        toast.current.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Route updated successfully' 
        });
        setTimeout(() => {
          router.push('/system-setup/routing');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating route:', error);
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to update route' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGeofenceUpdate = (geofence) => {
    setFormData(prev => ({ ...prev, geofence }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toast ref={toast} />
      <Card title="Edit Route">
        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="name">Route Name</label>
              <InputText 
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="depot">Depot</label>
              <Dropdown 
                id="depot"
                value={formData.depotId}
                options={depots}
                onChange={(e) => setFormData(prev => ({ ...prev, depotId: e.value }))}
                placeholder="Select a depot"
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="serviceDays">Service Days</label>
              <MultiSelect 
                id="serviceDays"
                value={formData.serviceDays}
                options={weekDays}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceDays: e.value }))}
                placeholder="Select service days"
                className="w-full"
              />
            </div>

            <div className="field">
              <label htmlFor="capacity">Max Daily Capacity</label>
              <InputNumber 
                id="capacity"
                value={formData.maxCapacity}
                onValueChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: e.value }))}
                min={1}
                max={200}
              />
            </div>

            <div className="field">
              <label htmlFor="active">Route Status</label>
              <div>
                <ToggleButton 
                  id="active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.value }))}
                  onLabel="Active" 
                  offLabel="Inactive"
                />
              </div>
            </div>
          </div>

          <div className="col-12">
            <EnhancedGeofenceEditor
              initialGeofence={formData.geofence}
              depotId={formData.depotId}
              onGeofenceChange={handleGeofenceUpdate}
              currentRouteId={routeId}
              mode="edit"
            />
          </div>
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button 
            label="Cancel" 
            className="p-button-secondary"
            onClick={() => router.push('/system-setup/routing')}
          />
          <Button 
            label="Save Changes" 
            icon="pi pi-save"
            loading={saving}
            onClick={handleSubmit}
          />
        </div>
      </Card>
    </>
  );
};

export default RouteEditForm;