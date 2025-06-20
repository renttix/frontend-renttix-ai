import React from 'react';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import './RouteCapacityIndicator.css';

const RouteCapacityIndicator = ({ 
  capacity, 
  showDetails = true, 
  size = 'normal',
  orientation = 'horizontal' 
}) => {
  if (!capacity) return null;

  const {
    routeName,
    currentLoad,
    maxCapacity,
    utilizationPercentage,
    availableCapacity,
    isFull,
    isNearCapacity,
    color
  } = capacity;

  const getSeverity = () => {
    if (isFull) return 'danger';
    if (isNearCapacity) return 'warning';
    if (utilizationPercentage > 50) return 'info';
    return 'success';
  };

  const getStatusText = () => {
    if (isFull) return 'Full';
    if (isNearCapacity) return 'Near Capacity';
    if (utilizationPercentage > 50) return 'Moderate';
    return 'Available';
  };

  const getProgressBarColor = () => {
    if (isFull) return '#ef4444';
    if (isNearCapacity) return '#f59e0b';
    if (utilizationPercentage > 50) return '#3b82f6';
    return '#10b981';
  };

  const tooltipId = `capacity-${routeName?.replace(/\s+/g, '-')}`;

  const progressBarContent = (
    <div className={`route-capacity-progress ${size}`}>
      <ProgressBar 
        value={utilizationPercentage} 
        showValue={false}
        style={{
          height: size === 'small' ? '6px' : size === 'large' ? '12px' : '8px',
          backgroundColor: '#e5e7eb'
        }}
        color={getProgressBarColor()}
      />
    </div>
  );

  if (!showDetails) {
    return (
      <>
        <Tooltip target={`.${tooltipId}`} position="top" />
        <div 
          className={`route-capacity-indicator ${tooltipId} ${orientation}`}
          data-pr-tooltip={`${routeName}: ${currentLoad}/${maxCapacity} (${utilizationPercentage}%)`}
        >
          {progressBarContent}
        </div>
      </>
    );
  }

  return (
    <div className={`route-capacity-indicator detailed ${size} ${orientation}`}>
      <div className="capacity-header">
        <div className="route-info">
          <span className="route-name" style={{ color }}>{routeName}</span>
          <Tag 
            value={getStatusText()} 
            severity={getSeverity()}
            className="capacity-status-tag"
          />
        </div>
        <div className="capacity-numbers">
          <span className="current-load">{currentLoad}</span>
          <span className="separator">/</span>
          <span className="max-capacity">{maxCapacity}</span>
        </div>
      </div>
      
      {progressBarContent}
      
      <div className="capacity-footer">
        <span className="utilization-text">
          {utilizationPercentage}% utilized
        </span>
        {availableCapacity > 0 && (
          <span className="available-text">
            {availableCapacity} slots available
          </span>
        )}
      </div>
    </div>
  );
};

export default RouteCapacityIndicator;