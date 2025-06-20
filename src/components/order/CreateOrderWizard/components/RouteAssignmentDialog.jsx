import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { RadioButton } from 'primereact/radiobutton';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';

export default function RouteAssignmentDialog({ 
  visible, 
  onHide, 
  deliveryAddress, 
  onRouteAssigned 
}) {
  const [loading, setLoading] = useState(true);
  const [routeMatch, setRouteMatch] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state?.authReducer);
  
  useEffect(() => {
    if (visible && deliveryAddress) {
      checkRouteMatch();
    }
  }, [visible, deliveryAddress]);
  
  const checkRouteMatch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const addressString = [
        deliveryAddress.address1,
        deliveryAddress.address2,
        deliveryAddress.city,
        deliveryAddress.postcode,
        deliveryAddress.country
      ].filter(Boolean).join(', ');
      
      const response = await axios.post(
        `${BaseURL}/routes/match-address`,
        { address: addressString },
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );
      
      setRouteMatch(response.data.data);
      if (response.data.data.bestMatch) {
        setSelectedRoute(response.data.data.bestMatch._id);
      }
    } catch (error) {
      console.error('Failed to match route:', error);
      setError(error.response?.data?.message || 'Failed to match address to route');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirm = () => {
    if (!selectedRoute) return;
    
    const selectedRouteData = routeMatch?.matchingRoutes?.find(r => r._id === selectedRoute) || 
                             routeMatch?.bestMatch;
    
    onRouteAssigned({
      routeId: selectedRoute,
      routeName: selectedRouteData?.name,
      isManualOverride: manualOverride || !routeMatch?.bestMatch,
      overrideReason: manualOverride ? overrideReason : null
    });
    onHide();
  };
  
  const footerContent = (
    <div>
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        onClick={onHide} 
        className="p-button-text" 
      />
      <Button 
        label="Confirm Assignment" 
        icon="pi pi-check" 
        onClick={handleConfirm}
        disabled={!selectedRoute || (manualOverride && !overrideReason)}
      />
    </div>
  );
  
  return (
    <Dialog
      header="Route Assignment"
      visible={visible}
      onHide={onHide}
      style={{ width: '50vw' }}
      footer={footerContent}
      modal
      className="p-fluid"
    >
      {loading ? (
        <div className="flex justify-content-center align-items-center p-5">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} />
        </div>
      ) : error ? (
        <Message severity="error" text={error} className="mb-3" />
      ) : (
        <div>
          {routeMatch?.bestMatch ? (
            <>
              <Message 
                severity="success" 
                text={`We've detected this location falls within Route "${routeMatch.bestMatch.name}"`}
                className="mb-3"
              />
              
              <div className="mb-4">
                <h5 className="mb-3">Recommended Route</h5>
                <div className="surface-100 border-round p-3">
                  <div className="field-radiobutton">
                    <RadioButton
                      inputId="auto-assign"
                      value={routeMatch.bestMatch._id}
                      onChange={(e) => {
                        setSelectedRoute(e.value);
                        setManualOverride(false);
                        setOverrideReason('');
                      }}
                      checked={selectedRoute === routeMatch.bestMatch._id && !manualOverride}
                    />
                    <label htmlFor="auto-assign" className="ml-2">
                      <div>
                        <strong>{routeMatch.bestMatch.name}</strong>
                        <div className="text-sm text-600 mt-1">
                          {routeMatch.bestMatch.description && (
                            <span>{routeMatch.bestMatch.description}</span>
                          )}
                        </div>
                        <div className="mt-2">
                          <Tag 
                            value={`Capacity: ${routeMatch.bestMatch.capacity?.maxOrders || 'N/A'} orders`}
                            severity="info"
                            className="mr-2"
                          />
                          {routeMatch.bestMatch.schedule?.dayOfWeek !== undefined && (
                            <Tag 
                              value={getDayName(routeMatch.bestMatch.schedule.dayOfWeek)}
                              severity="success"
                            />
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Message 
              severity="warn" 
              text="No matching route found for this address. Please assign manually."
              className="mb-3"
            />
          )}
          
          {routeMatch?.matchingRoutes?.length > 1 && (
            <div className="mb-4">
              <h5 className="mb-3">Other Available Routes</h5>
              <div className="grid">
                {routeMatch.matchingRoutes
                  .filter(route => route._id !== routeMatch.bestMatch?._id)
                  .map(route => (
                    <div key={route._id} className="col-12">
                      <div className="surface-100 border-round p-3 mb-2">
                        <div className="field-radiobutton">
                          <RadioButton
                            inputId={`route-${route._id}`}
                            value={route._id}
                            onChange={(e) => {
                              setSelectedRoute(e.value);
                              setManualOverride(true);
                            }}
                            checked={selectedRoute === route._id}
                          />
                          <label htmlFor={`route-${route._id}`} className="ml-2">
                            <div>
                              <strong>{route.name}</strong>
                              {route.description && (
                                <div className="text-sm text-600 mt-1">{route.description}</div>
                              )}
                              <div className="mt-2">
                                <Tag 
                                  value={`Capacity: ${route.capacity?.maxOrders || 'N/A'} orders`}
                                  severity="info"
                                  className="mr-2"
                                />
                                {route.schedule?.dayOfWeek !== undefined && (
                                  <Tag 
                                    value={getDayName(route.schedule.dayOfWeek)}
                                    severity="success"
                                  />
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          {manualOverride && (
            <div className="mt-4">
              <div className="field">
                <label htmlFor="override-reason">
                  Reason for Manual Override <span className="text-red-500">*</span>
                </label>
                <InputTextarea
                  id="override-reason"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows={3}
                  placeholder="Please provide a reason for overriding the automatic route assignment..."
                  className={!overrideReason ? 'p-invalid' : ''}
                />
                {!overrideReason && (
                  <small className="p-error">Override reason is required</small>
                )}
              </div>
            </div>
          )}
          
          {routeMatch?.geocodedAddress && (
            <div className="mt-4 text-sm text-600">
              <i className="pi pi-map-marker mr-2"></i>
              Geocoded Address: {routeMatch.geocodedAddress}
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}

// Helper function to get day name
function getDayName(dayNumber) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
}