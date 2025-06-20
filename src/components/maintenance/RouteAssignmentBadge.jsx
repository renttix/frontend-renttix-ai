import React from 'react';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import './RouteAssignmentBadge.css';

const RouteAssignmentBadge = ({ order, size = 'normal' }) => {
  // Check if order has maintenance configuration and route assignment
  const hasMaintenanceRoute = order?.maintenanceConfig?.enabled && order?.assignedRoute;
  
  if (!hasMaintenanceRoute) {
    return null;
  }

  const route = order.assignedRoute;
  const routeColor = route.routeColor || '#6B7280';
  const routeName = route.routeName || 'Unassigned';
  const isManualOverride = route.isManualOverride || false;

  const getSeverity = () => {
    if (!route.routeId) return 'danger';
    if (isManualOverride) return 'warning';
    return 'success';
  };

  const getIcon = () => {
    if (!route.routeId) return 'pi pi-exclamation-triangle';
    if (isManualOverride) return 'pi pi-user-edit';
    return 'pi pi-map-marker';
  };

  const tooltipContent = () => {
    let content = `Maintenance Route: ${routeName}`;
    if (isManualOverride && route.overrideReason) {
      content += `\nManual Override: ${route.overrideReason}`;
    }
    if (route.assignedAt) {
      content += `\nAssigned: ${new Date(route.assignedAt).toLocaleDateString()}`;
    }
    return content;
  };

  const badgeId = `route-badge-${order._id}`;

  return (
    <>
      <Tooltip target={`.${badgeId}`} position="top" />
      <Tag
        className={`route-assignment-badge ${badgeId} ${size}`}
        value={routeName}
        icon={getIcon()}
        severity={getSeverity()}
        style={{
          backgroundColor: route.routeId ? `${routeColor}20` : undefined,
          borderColor: routeColor,
          color: route.routeId ? routeColor : undefined
        }}
        data-pr-tooltip={tooltipContent()}
      />
    </>
  );
};

export default RouteAssignmentBadge;