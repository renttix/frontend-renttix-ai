import React from 'react';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';

export default function RouteAssignmentDisplay({ assignedRoute, deliveryAddress }) {
  if (!deliveryAddress || (!deliveryAddress.address1 && !deliveryAddress.city)) {
    return null;
  }

  const formatAddress = () => {
    const parts = [
      deliveryAddress.address1,
      deliveryAddress.address2,
      deliveryAddress.city,
      deliveryAddress.postcode,
      deliveryAddress.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <div className="route-assignment-display mt-3">
      <div className="text-sm text-600 mb-2">
        <i className="pi pi-map-marker mr-2"></i>
        Delivery Location: {formatAddress()}
      </div>
      
      {assignedRoute ? (
        <div className="flex align-items-center gap-2">
          <span className="text-sm font-medium">Assigned Route:</span>
          <Tag 
            value={assignedRoute.routeName} 
            style={{ 
              backgroundColor: assignedRoute.color || '#3B82F6',
              color: 'white'
            }}
            icon="pi pi-route"
          />
          {assignedRoute.isManualOverride && (
            <Tag 
              value="Manual Override" 
              severity="warning"
              icon="pi pi-exclamation-triangle"
            />
          )}
        </div>
      ) : (
        <Message 
          severity="info" 
          text="Route will be automatically assigned based on delivery location"
          className="mt-2"
        />
      )}
      
      {assignedRoute && (
        <div className="mt-2 text-sm text-600">
          <i className="pi pi-info-circle mr-1"></i>
          Maintenance jobs for this order will be assigned to the {assignedRoute.routeName} route
        </div>
      )}
    </div>
  );
}