import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { RadioButton } from 'primereact/radiobutton';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import '../styles/RouteSelector.css';

export default function RouteSelector({
  deliveryCoordinates,
  vendorId,
  currentRoute,
  onRouteChange,
  productId,
  productName,
  maintenanceDate
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routeSuggestions, setRouteSuggestions] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [error, setError] = useState(null);
  const toast = React.useRef(null);
  
  const { token,user } = useSelector((state) => state?.authReducer);

  // Fetch route suggestions when coordinates are available
  useEffect(() => {
    if (deliveryCoordinates && !currentRoute) {
      fetchRouteSuggestions();
    }
  }, [deliveryCoordinates,user]);

  const fetchRouteSuggestions = async () => {
    if (!deliveryCoordinates) {
      setError('No delivery coordinates available');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${BaseURL}/routes/match-maintenance`,
        {
          coordinates: deliveryCoordinates,
          maintenanceDate,
          vendorId: user?._id
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const { matchedRoute, suggestions } = response.data.data;
        
        if (matchedRoute) {
          // Auto-assign the matched route
          onRouteChange({
            routeId: matchedRoute._id || matchedRoute.routeId,
            routeName: matchedRoute.name || matchedRoute.routeName,
            color: matchedRoute.color || '#3B82F6',
            assignmentType: 'automatic',
            assignedAt: new Date()
          });
          
          // Show success toast
          if (toast.current) {
            toast.current.show({
              severity: 'success',
              summary: 'Route Assigned',
              detail: `Automatically assigned to ${matchedRoute.name || matchedRoute.routeName}`,
              life: 3000
            });
          }
        }
        
        setRouteSuggestions(suggestions || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch routes');
      }
    } catch (error) {
      console.error('Error fetching route suggestions:', error);
      
      // Determine error message
      let errorMessage = 'Failed to fetch route suggestions';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Route matching service not available';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Set demo suggestions for development/fallback
      if (!token || process.env.NODE_ENV === 'development') {
        setRouteSuggestions([
          {
            routeId: 'demo-1',
            routeName: 'Birmingham North Route',
            color: '#3B82F6',
            isInGeofence: true,
            distance: 0
          },
          {
            routeId: 'demo-2',
            routeName: 'Birmingham South Route',
            color: '#10B981',
            isInGeofence: false,
            distance: 5.2
          },
          {
            routeId: 'demo-3',
            routeName: 'Central Birmingham Route',
            color: '#8B5CF6',
            isInGeofence: false,
            distance: 7.8
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRouteChange = () => {
    // if (!selectedRoute) return;
    
    const isManualOverride = currentRoute && selectedRoute.routeId !== currentRoute.routeId;
    const requiresReason = isManualOverride || selectedRoute.assignmentType === 'floating';
    
    if (requiresReason && !overrideReason.trim()) {
      setError('Please provide a reason for the route change');
      return;
    }
    
    onRouteChange({
      ...selectedRoute,
      assignmentType: selectedRoute.assignmentType || 'manual',
      overrideReason: overrideReason.trim(),
      assignedAt: new Date()
    });
    
    setShowDialog(false);
    setOverrideReason('');
    setError(null);
  };

  const getRouteStatusTag = () => {
    if (!currentRoute) return null;
    
    switch (currentRoute.assignmentType) {
      case 'automatic':
        return <Tag value="Auto-assigned" severity="success" icon="pi pi-check-circle" />;
      case 'manual':
        return <Tag value="Manually assigned" severity="warning" icon="pi pi-user" />;
      case 'floating':
        return <Tag value="Floating Route" severity="info" icon="pi pi-clock" />;
      default:
        return null;
    }
  };

  const dialogFooter = (
    <div>
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        onClick={() => {
          setShowDialog(false);
          setOverrideReason('');
          setError(null);
        }} 
        className="p-button-text" 
      />
      <Button 
        label="Confirm" 
        icon="pi pi-check" 
        onClick={handleRouteChange}
        disabled={!selectedRoute || (selectedRoute.assignmentType === 'floating' && !overrideReason.trim())}
      />
    </div>
  );

  if (loading && !currentRoute) {
    return (
      <div className="route-loading">
        <ProgressSpinner />
        <span className="route-loading-text">Finding best route...</span>
      </div>
    );
  }

  return (
    <div className="route-selector">
      <Toast ref={toast} position="top-right" />
      
      {currentRoute ? (
        <div className={`route-assignment-box has-route`}>
          <div className="route-header">
            <div className="route-info">
              <i className="pi pi-map-marker route-icon" style={{ color: currentRoute.color || '#3B82F6' }}></i>
              <span className="route-name">{currentRoute.routeName}</span>
              {getRouteStatusTag()}
            </div>
            <Button
              icon="pi pi-pencil"
              className="p-button-text p-button-sm"
              onClick={() => setShowDialog(true)}
              tooltip="Change route"
            />
          </div>
          {currentRoute.overrideReason && (
            <div className="route-override-reason">
              <i className="pi pi-info-circle mr-1"></i>
              {currentRoute.overrideReason}
            </div>
          )}
        </div>
      ) : (
        <div className="no-route-box">
          <div className="no-route-info">
            <i className="pi pi-map"></i>
            <span>No route assigned</span>
          </div>
          <Button
            label="Assign Route"
            icon="pi pi-plus"
            className="p-button-sm"
            onClick={() => {
              fetchRouteSuggestions();
              setShowDialog(true);
            }}
            disabled={!deliveryCoordinates}
          />
        </div>
      )}

      <Dialog
        header={`Route Assignment - ${productName}`}
        visible={showDialog}
        style={{ width: '500px' }}
        footer={dialogFooter}
        onHide={() => {
          setShowDialog(false);
          setOverrideReason('');
          setError(null);
        }}
        className="route-dialog"
      >
        <div className="p-fluid">
          {error && (
            <Message severity="error" text={error} className="route-error" />
          )}
          
          {currentRoute && (
            <div className="current-assignment">
              <label className="current-assignment-label">Current Assignment:</label>
              <div className="current-assignment-info">
                <i className="pi pi-map-marker" style={{ color: currentRoute.color }}></i>
                <span className="font-medium">{currentRoute.routeName}</span>
                {getRouteStatusTag()}
              </div>
            </div>
          )}
          
          <div className="route-options-container">
            <label className="route-options-label">Available Routes:</label>
            <div className="route-options">
              {routeSuggestions.map((route) => (
                <div
                  key={route.routeId}
                  className={`route-option ${selectedRoute?.routeId === route.routeId ? 'selected' : ''}`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="route-option-header">
                    <div className="route-option-name">
                      <RadioButton
                        inputId={route.routeId}
                        name="route"
                        value={route}
                        onChange={(e) => setSelectedRoute(e.value)}
                        checked={selectedRoute?.routeId === route.routeId}
                      />
                      <label htmlFor={route.routeId} className="ml-2 cursor-pointer">
                        <i className="pi pi-map-marker" style={{ color: route.color || '#3B82F6' }}></i>
                        <strong>{route.routeName}</strong>
                      </label>
                    </div>
                    <div className="route-option-status">
                      {route.isInGeofence ? (
                        <span className="in-area">✅ In area</span>
                      ) : (
                        <span className="distance">📍 {route.distance} km away</span>
                      )}
                      {route.availability && !route.hasCapacity && (
                        <Tag
                          value={route.availability.reason}
                          severity="danger"
                          className="ml-2 text-xs"
                        />
                      )}
                    </div>
                  </div>
                  {route.description && (
                    <div className="route-option-description">{route.description}</div>
                  )}
                </div>
              ))}
              
              {/* Floating Route Option */}
              <div
                className={`route-option floating-route-option ${selectedRoute?.routeId === 'floating' ? 'selected' : ''}`}
                onClick={() => setSelectedRoute({
                  routeId: 'floating',
                  routeName: 'Floating Route',
                  assignmentType: 'floating'
                })}
              >
                <div className="route-option-header">
                  <div className="route-option-name">
                    <RadioButton
                      inputId="floating-route"
                      name="route"
                      value={{
                        routeId: 'floating',
                        routeName: 'Floating Route',
                        assignmentType: 'floating'
                      }}
                      onChange={(e) => setSelectedRoute(e.value)}
                      checked={selectedRoute?.routeId === 'floating'}
                    />
                    <label htmlFor="floating-route" className="ml-2 cursor-pointer">
                      <div className="floating-route-info">
                        <i className="pi pi-clock floating-route-icon"></i>
                        <strong>Floating Route</strong>
                        <Tag value="Manual scheduling" severity="info" className="floating-route-tag" />
                      </div>
                    </label>
                  </div>
                </div>
                <div className="route-option-description">
                  For manual scheduling or when no route matches
                </div>
              </div>
            </div>
          </div>
          
          {(selectedRoute && (selectedRoute.assignmentType === 'floating' ||
            (currentRoute && selectedRoute?.routeId !== currentRoute.routeId))) && (
            <div className="override-reason-container">
              <label htmlFor="override-reason" className="override-reason-label">
                Reason for {selectedRoute.assignmentType === 'floating' ? 'floating assignment' : 'override'}:
                <span className="override-reason-required">*</span>
              </label>
              <InputTextarea
                id="override-reason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={3}
                placeholder="Please provide a reason..."
                className="override-reason-textarea"
              />
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}