"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import apiServices from '../../../../services/apiService';

const SchedulingPreferences = () => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    automaticDeliveryScheduling: true,
    automaticReturnScheduling: true,
    schedulingRetryAttempts: 3,
    schedulingNotifications: true
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await apiServices.get('/vendor/preferences');
      if (response.data.success && response.data.data?.preferences) {
        const prefs = response.data.data.preferences;
        setPreferences({
          automaticDeliveryScheduling: prefs.automaticDeliveryScheduling !== false,
          automaticReturnScheduling: prefs.automaticReturnScheduling !== false,
          schedulingRetryAttempts: prefs.schedulingRetryAttempts || 3,
          schedulingNotifications: prefs.schedulingNotifications !== false
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load scheduling preferences',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiServices.put('/vendor/preferences', {
        preferences: {
          automaticDeliveryScheduling: preferences.automaticDeliveryScheduling,
          automaticReturnScheduling: preferences.automaticReturnScheduling,
          schedulingRetryAttempts: preferences.schedulingRetryAttempts,
          schedulingNotifications: preferences.schedulingNotifications
        }
      });

      if (response.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Scheduling preferences updated successfully',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save scheduling preferences',
        life: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card title="Scheduling Preferences" className="mb-4">
        <div className="flex items-center justify-center p-8">
          <ProgressSpinner />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <Card title="Scheduling Preferences" className="mb-4">
        <div className="space-y-6">
          <Message 
            severity="info" 
            text="Configure how deliveries and returns are automatically scheduled when orders are created or agreements are signed." 
          />

          {/* Automatic Delivery Scheduling */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Automatic Delivery Scheduling
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Automatically create delivery notes when orders are created or agreements are signed
              </p>
            </div>
            <InputSwitch
              checked={preferences.automaticDeliveryScheduling}
              onChange={(e) => setPreferences({ ...preferences, automaticDeliveryScheduling: e.value })}
            />
          </div>

          {/* Automatic Return Scheduling */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Automatic Return Scheduling
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Automatically create return notes based on expected return dates
              </p>
            </div>
            <InputSwitch
              checked={preferences.automaticReturnScheduling}
              onChange={(e) => setPreferences({ ...preferences, automaticReturnScheduling: e.value })}
            />
          </div>

          {/* Retry Attempts */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Retry Attempts
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Number of retry attempts if automatic scheduling fails (0-10)
              </p>
            </div>
            <InputNumber
              value={preferences.schedulingRetryAttempts}
              onValueChange={(e) => setPreferences({ ...preferences, schedulingRetryAttempts: e.value })}
              min={0}
              max={10}
              showButtons
              buttonLayout="horizontal"
              decrementButtonClassName="p-button-secondary"
              incrementButtonClassName="p-button-secondary"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              className="w-32"
            />
          </div>

          {/* Scheduling Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Scheduling Notifications
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Send notifications when deliveries/returns are automatically scheduled
              </p>
            </div>
            <InputSwitch
              checked={preferences.schedulingNotifications}
              onChange={(e) => setPreferences({ ...preferences, schedulingNotifications: e.value })}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              label="Save Preferences"
              icon="pi pi-save"
              onClick={handleSave}
              loading={saving}
              disabled={saving}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default SchedulingPreferences;