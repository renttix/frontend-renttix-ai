import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import axios from 'axios';
import { BaseURL } from '../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import RouteCapacityIndicator from './RouteCapacityIndicator';
import './RouteCapacityDashboard.css';

const RouteCapacityDashboard = ({ onCapacityUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [capacityData, setCapacityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [newCapacity, setNewCapacity] = useState(50);
  
  const { token } = useSelector((state) => state?.authReducer);

  useEffect(() => {
    fetchCapacityData();
  }, [selectedDate]);

  const fetchCapacityData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${BaseURL}/routes/capacity`,
        {
          params: {
            date: selectedDate.toISOString()
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Ensure capacity data has the expected structure
      const data = response.data.data;
      if (data && data.routes && Array.isArray(data.routes)) {
        setCapacityData(data);
      } else {
        console.warn('Unexpected capacity data format:', data);
        setCapacityData({
          summary: {
            totalRoutes: 0,
            averageUtilization: 0,
            fullRoutes: 0,
            nearCapacityRoutes: 0
          },
          routes: []
        });
      }
    } catch (error) {
      console.error('Error fetching capacity data:', error);
      setError('Failed to load capacity data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCapacity = (route) => {
    setSelectedRoute(route);
    setNewCapacity(route.maxCapacity);
    setShowEditDialog(true);
  };

  const handleUpdateCapacity = async () => {
    try {
      const response = await axios.put(
        `${BaseURL}/routes/${selectedRoute.routeId}/capacity`,
        {
          maxOrders: newCapacity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setShowEditDialog(false);
        fetchCapacityData();
        if (onCapacityUpdate) {
          onCapacityUpdate();
        }
      }
    } catch (error) {
      console.error('Error updating capacity:', error);
    }
  };

  const getSummaryIcon = () => {
    if (!capacityData?.summary) return 'pi pi-info-circle';
    if (capacityData.summary.fullRoutes > 0) return 'pi pi-exclamation-triangle';
    if (capacityData.summary.nearCapacityRoutes > 0) return 'pi pi-exclamation-circle';
    return 'pi pi-check-circle';
  };

  const getSummarySeverity = () => {
    if (!capacityData?.summary) return 'info';
    if (capacityData.summary.fullRoutes > 0) return 'error';
    if (capacityData.summary.nearCapacityRoutes > 0) return 'warn';
    return 'success';
  };

  const header = (
    <div className="capacity-dashboard-header">
      <div className="header-left">
        <h3 className="m-0">Route Capacity Management</h3>
        <p className="text-sm text-gray-600 mt-1">
          Monitor and manage route utilization
        </p>
      </div>
      <div className="header-right">
        <Calendar
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.value)}
          dateFormat="dd/mm/yy"
          showIcon
          className="capacity-date-picker"
        />
        <Button
          icon="pi pi-refresh"
          className="p-button-text"
          onClick={fetchCapacityData}
          loading={loading}
          tooltip="Refresh"
        />
      </div>
    </div>
  );

  if (loading && !capacityData) {
    return (
      <Card className="route-capacity-dashboard">
        <div className="flex justify-content-center align-items-center p-5">
          <ProgressSpinner />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="route-capacity-dashboard">
        {header}
        
        {error && (
          <Message severity="error" text={error} className="mb-3" />
        )}

        {capacityData && (
          <>
            {/* Summary Section */}
            <div className="capacity-summary mb-4">
              <Message
                severity={getSummarySeverity()}
                icon={getSummaryIcon()}
                text={`${capacityData.summary.totalRoutes} routes • ${capacityData.summary.averageUtilization}% average utilization • ${capacityData.summary.fullRoutes} full • ${capacityData.summary.nearCapacityRoutes} near capacity`}
              />
            </div>

            {/* Routes Grid */}
            <div className="routes-capacity-grid">
              {(capacityData.routes || []).map((route) => (
                <div key={route.routeId} className="route-capacity-card">
                  <RouteCapacityIndicator
                    capacity={route}
                    showDetails={true}
                    size="normal"
                  />
                  <div className="route-actions mt-2">
                    <Button
                      icon="pi pi-pencil"
                      className="p-button-text p-button-sm"
                      onClick={() => handleEditCapacity(route)}
                      tooltip="Edit Capacity"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {capacityData.routes.length === 0 && (
              <div className="empty-state">
                <i className="pi pi-inbox text-4xl text-gray-400"></i>
                <p className="text-gray-600 mt-2">No routes found for this date</p>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Edit Capacity Dialog */}
      <Dialog
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        header={`Edit Capacity - ${selectedRoute?.routeName}`}
        style={{ width: '400px' }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowEditDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Update"
              icon="pi pi-check"
              onClick={handleUpdateCapacity}
              disabled={newCapacity < 1}
            />
          </div>
        }
      >
        <div className="field">
          <label htmlFor="maxCapacity">Maximum Orders</label>
          <InputNumber
            id="maxCapacity"
            value={newCapacity}
            onValueChange={(e) => setNewCapacity(e.value)}
            min={1}
            max={200}
            showButtons
            className="w-full mt-2"
          />
          <small className="text-gray-600">
            Current utilization: {selectedRoute?.currentLoad || 0} orders
          </small>
        </div>
      </Dialog>
    </>
  );
};

export default RouteCapacityDashboard;