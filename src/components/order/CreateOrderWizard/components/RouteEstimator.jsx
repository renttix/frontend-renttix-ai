"use client";
import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const RouteEstimator = ({ 
  routeDetails, 
  loading = false, 
  onRefresh,
  showRefreshButton = true,
  compact = false 
}) => {
  const [expanded, setExpanded] = useState(!compact);
  const [animateValue, setAnimateValue] = useState(false);

  useEffect(() => {
    if (routeDetails?.cost) {
      setAnimateValue(true);
      setTimeout(() => setAnimateValue(false), 1000);
    }
  }, [routeDetails?.cost]);

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDistance = (meters) => {
    if (!meters) return 'N/A';
    const km = (meters / 1000).toFixed(1);
    const miles = (meters / 1609.34).toFixed(1);
    return `${km} km (${miles} mi)`;
  };

  const getCostSeverity = (cost) => {
    if (!cost) return 'secondary';
    if (cost < 10) return 'success';
    if (cost < 25) return 'warning';
    return 'danger';
  };

  const getTrafficSeverity = (level) => {
    switch (level) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card className="route-estimator">
        <div className="space-y-3">
          <Skeleton width="100%" height="2rem" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton width="100%" height="4rem" />
            <Skeleton width="100%" height="4rem" />
          </div>
          <Skeleton width="100%" height="1rem" />
        </div>
      </Card>
    );
  }

  if (!routeDetails) {
    return (
      <Card className="route-estimator">
        <div className="text-center py-4">
          <i className="pi pi-map text-4xl text-gray-300 mb-2"></i>
          <p className="text-gray-500">No route information available</p>
          {showRefreshButton && onRefresh && (
            <Button
              label="Calculate Route"
              icon="pi pi-refresh"
              size="small"
              className="mt-2"
              onClick={onRefresh}
            />
          )}
        </div>
      </Card>
    );
  }

  const header = (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <i className="pi pi-route text-primary"></i>
        <span className="font-semibold">Route Estimation</span>
      </div>
      <div className="flex items-center gap-2">
        {routeDetails.optimized && (
          <Tag value="Optimized" severity="success" icon="pi pi-check" />
        )}
        {showRefreshButton && onRefresh && (
          <Button
            icon="pi pi-refresh"
            rounded
            text
            size="small"
            onClick={onRefresh}
            tooltip="Refresh route"
          />
        )}
        {compact && (
          <Button
            icon={expanded ? "pi pi-chevron-up" : "pi pi-chevron-down"}
            rounded
            text
            size="small"
            onClick={() => setExpanded(!expanded)}
          />
        )}
      </div>
    </div>
  );

  return (
    <Card className="route-estimator" header={header}>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {/* Cost Display */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Estimated Delivery Cost</p>
                <div className={`text-3xl font-bold ${animateValue ? 'animate-pulse' : ''}`}>
                  <span className="text-primary">£{routeDetails.cost?.toFixed(2) || '0.00'}</span>
                </div>
                <Tag 
                  value={getCostSeverity(routeDetails.cost) === 'success' ? 'Low Cost' : 
                         getCostSeverity(routeDetails.cost) === 'warning' ? 'Moderate Cost' : 
                         'High Cost'}
                  severity={getCostSeverity(routeDetails.cost)}
                  className="mt-2"
                />
              </div>

              {/* Route Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="pi pi-map-marker text-blue-600"></i>
                    <span className="text-sm font-medium text-blue-800">Distance</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-900">
                    {formatDistance(routeDetails.distance)}
                  </p>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="pi pi-clock text-purple-600"></i>
                    <span className="text-sm font-medium text-purple-800">Duration</span>
                  </div>
                  <p className="text-lg font-semibold text-purple-900">
                    {formatDuration(routeDetails.duration)}
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              {routeDetails.traffic && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-car text-gray-600"></i>
                    <span className="text-sm font-medium">Traffic Conditions</span>
                  </div>
                  <Tag 
                    value={routeDetails.traffic.charAt(0).toUpperCase() + routeDetails.traffic.slice(1)}
                    severity={getTrafficSeverity(routeDetails.traffic)}
                  />
                </div>
              )}

              {/* Route Breakdown */}
              {routeDetails.breakdown && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Cost Breakdown</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base Rate:</span>
                      <span>£{routeDetails.breakdown.baseRate?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Distance Charge:</span>
                      <span>£{routeDetails.breakdown.distanceCharge?.toFixed(2) || '0.00'}</span>
                    </div>
                    {routeDetails.breakdown.timeCharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time Charge:</span>
                        <span>£{routeDetails.breakdown.timeCharge?.toFixed(2) || '0.00'}</span>
                      </div>
                    )}
                    {routeDetails.breakdown.surcharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Peak Hour Surcharge:</span>
                        <span>£{routeDetails.breakdown.surcharge?.toFixed(2) || '0.00'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Window */}
              {routeDetails.estimatedWindow && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-calendar-times text-green-600"></i>
                    <div>
                      <p className="text-sm font-medium text-green-800">Estimated Delivery Window</p>
                      <p className="text-sm text-green-600">
                        {routeDetails.estimatedWindow.start} - {routeDetails.estimatedWindow.end}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Route */}
              {routeDetails.suggestedRoute && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="pi pi-truck text-blue-600"></i>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Suggested Route</p>
                        <p className="text-sm text-blue-600">{routeDetails.suggestedRoute.name}</p>
                      </div>
                    </div>
                    <Tag 
                      value={`${routeDetails.suggestedRoute.capacity}% Full`}
                      severity={routeDetails.suggestedRoute.capacity < 70 ? 'success' : 
                               routeDetails.suggestedRoute.capacity < 90 ? 'warning' : 'danger'}
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              {routeDetails.notes && (
                <div className="text-sm text-gray-600 italic">
                  <i className="pi pi-info-circle mr-1"></i>
                  {routeDetails.notes}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default React.memo(RouteEstimator);