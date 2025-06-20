import React, { useState, useEffect, useRef } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import BaseWidget from '../BaseWidget';
import { formatTime } from '../../../utils/formatters';
import { todaysDeliveriesService, handleApiError } from '../../../services/widgetServices';

const TodaysDeliveriesWidget = ({ widgetId, config = {} }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRoutes, setExpandedRoutes] = useState([]);
  const toast = useRef(null);

  // Fetch today's deliveries and collections
  useEffect(() => {
    fetchTodaysDeliveries();
    
    // Set up refresh interval if configured
    const refreshInterval = config.refreshInterval || 60000; // 1 minute default
    const interval = setInterval(fetchTodaysDeliveries, refreshInterval);
    
    return () => clearInterval(interval);
  }, [config]);

  const fetchTodaysDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params based on config
      const params = {
        date: new Date().toISOString().split('T')[0],
        ...(config.depotId && { depotId: config.depotId }),
        ...(config.includeCompleted !== undefined && { includeCompleted: config.includeCompleted })
      };
      
      const data = await todaysDeliveriesService.fetchTodaysRoutes(params);
      const routesData = data.routes || data || [];
      setRoutes(routesData);
      
      // Auto-expand routes that are in progress
      const inProgressRoutes = routesData
        ?.filter(route => route.status === 'in_progress')
        ?.map(route => route._id) || [];
      setExpandedRoutes(inProgressRoutes);
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to load today\'s deliveries');
      setError(errorMessage);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion percentage
  const getCompletionPercentage = (route) => {
    if (!route.jobs || route.jobs.length === 0) return 0;
    const completed = route.jobs.filter(job => job.status === 'completed').length;
    return Math.round((completed / route.jobs.length) * 100);
  };

  // Get route status severity
  const getRouteSeverity = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'not_started':
        return 'warning';
      case 'delayed':
      case 'cancelled':
        return 'danger';
      default:
        return null;
    }
  };

  // Get job type icon
  const getJobTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'delivery':
        return 'pi-arrow-down';
      case 'collection':
        return 'pi-arrow-up';
      case 'service':
        return 'pi-wrench';
      case 'inspection':
        return 'pi-search';
      default:
        return 'pi-circle';
    }
  };

  // Route header template
  const routeHeaderTemplate = (route) => {
    const completion = getCompletionPercentage(route);
    const completedJobs = route.jobs?.filter(job => job.status === 'completed').length || 0;
    const totalJobs = route.jobs?.length || 0;
    
    return (
      <div className="flex flex-column gap-3 w-full">
        <div className="flex align-items-center justify-content-between">
          <div className="flex align-items-center gap-3">
            <div 
              className="route-color-indicator"
              style={{ 
                width: '4px', 
                height: '40px', 
                backgroundColor: route.color || '#6B7280',
                borderRadius: '2px'
              }}
            />
            <div className="flex flex-column">
              <div className="flex align-items-center gap-2">
                <span className="font-semibold text-lg">{route.name}</span>
                <Tag 
                  value={route.status} 
                  severity={getRouteSeverity(route.status)}
                  style={{ textTransform: 'capitalize' }}
                />
              </div>
              <div className="flex align-items-center gap-3 text-500 text-sm">
                {route.driver && (
                  <div className="flex align-items-center gap-2">
                    <Avatar 
                      icon="pi pi-user" 
                      size="small" 
                      shape="circle"
                      style={{ width: '20px', height: '20px' }}
                    />
                    <span>{route.driver.name}</span>
                  </div>
                )}
                {route.vehicle && (
                  <div className="flex align-items-center gap-1">
                    <i className="pi pi-truck text-xs" />
                    <span>{route.vehicle.registration}</span>
                  </div>
                )}
                <div className="flex align-items-center gap-1">
                  <i className="pi pi-map-marker text-xs" />
                  <span>{totalJobs} stops</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex align-items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-semibold">{completion}%</div>
              <div className="text-sm text-500">{completedJobs}/{totalJobs} completed</div>
            </div>
            {route.status === 'in_progress' && (
              <Button
                icon="pi pi-map"
                className="p-button-text p-button-sm"
                tooltip="Track Route"
                tooltipOptions={{ position: 'top' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTrackRoute(route);
                }}
              />
            )}
          </div>
        </div>
        <ProgressBar 
          value={completion} 
          showValue={false}
          style={{ height: '8px' }}
          color={completion === 100 ? '#10B981' : undefined}
        />
      </div>
    );
  };

  // Job item template
  const jobItemTemplate = (job) => {
    const getJobSeverity = (status) => {
      switch (status?.toLowerCase()) {
        case 'completed':
          return 'success';
        case 'in_progress':
          return 'info';
        case 'pending':
          return 'warning';
        case 'failed':
        case 'cancelled':
          return 'danger';
        default:
          return null;
      }
    };

    return (
      <div className="flex align-items-center justify-content-between p-3 border-round surface-hover">
        <div className="flex align-items-center gap-3">
          <div className="flex align-items-center justify-content-center"
               style={{ 
                 width: '40px', 
                 height: '40px', 
                 borderRadius: '50%',
                 backgroundColor: job.status === 'completed' ? '#10B98120' : '#F3F4F6'
               }}>
            <i className={`pi ${getJobTypeIcon(job.type)} text-xl`}
               style={{ color: job.status === 'completed' ? '#10B981' : '#6B7280' }} />
          </div>
          <div className="flex flex-column">
            <div className="flex align-items-center gap-2">
              <span className="font-semibold">{job.customerName}</span>
              <Badge value={job.orderNumber} severity="info" />
            </div>
            <div className="text-sm text-500">
              {job.address.street}, {job.address.city}
            </div>
            {job.timeWindow && (
              <div className="text-sm text-500">
                <i className="pi pi-clock text-xs mr-1" />
                {formatTime(job.timeWindow.start)} - {formatTime(job.timeWindow.end)}
              </div>
            )}
          </div>
        </div>
        <div className="flex align-items-center gap-2">
          <Tag 
            value={job.status} 
            severity={getJobSeverity(job.status)}
            style={{ textTransform: 'capitalize' }}
          />
          {job.completedAt && (
            <span className="text-sm text-500">
              {formatTime(job.completedAt)}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Route content template
  const routeContentTemplate = (route) => {
    if (!route.jobs || route.jobs.length === 0) {
      return (
        <div className="flex align-items-center justify-content-center p-4 text-500">
          <i className="pi pi-inbox mr-2" />
          No jobs assigned to this route
        </div>
      );
    }

    return (
      <div className="flex flex-column gap-2">
        {route.jobs.map(job => (
          <div key={job._id}>
            {jobItemTemplate(job)}
          </div>
        ))}
      </div>
    );
  };

  // Handle track route
  const handleTrackRoute = (route) => {
    window.open(`/routes/${route._id}/tracking`, '_blank');
  };

  // Loading skeleton
  const loadingContent = () => {
    return (
      <div className="flex flex-column gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-column gap-2 p-3">
            <Skeleton width="100%" height="40px" />
            <Skeleton width="100%" height="8px" />
          </div>
        ))}
      </div>
    );
  };

  // Empty state
  const emptyContent = () => {
    return (
      <div className="flex flex-column align-items-center justify-content-center p-5">
        <i className="pi pi-truck text-5xl text-300 mb-3" />
        <span className="text-xl text-500 mb-2">No deliveries scheduled for today</span>
        <span className="text-sm text-400">Routes will appear here when scheduled</span>
      </div>
    );
  };

  // Summary statistics
  const renderSummary = () => {
    if (loading || !routes.length) return null;

    const totalRoutes = routes.length;
    const completedRoutes = routes.filter(r => r.status === 'completed').length;
    const inProgressRoutes = routes.filter(r => r.status === 'in_progress').length;
    const totalJobs = routes.reduce((sum, r) => sum + (r.jobs?.length || 0), 0);
    const completedJobs = routes.reduce((sum, r) => 
      sum + (r.jobs?.filter(j => j.status === 'completed').length || 0), 0);

    return (
      <div className="flex justify-content-around p-3 border-bottom-1 surface-border">
        <div className="text-center">
          <div className="text-2xl font-semibold text-primary">{totalRoutes}</div>
          <div className="text-sm text-500">Total Routes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-green-500">{completedRoutes}</div>
          <div className="text-sm text-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-blue-500">{inProgressRoutes}</div>
          <div className="text-sm text-500">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold">{completedJobs}/{totalJobs}</div>
          <div className="text-sm text-500">Jobs Done</div>
        </div>
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <div className="flex align-items-center gap-2">
      <Button
        icon="pi pi-map"
        className="p-button-text p-button-sm p-button-rounded"
        onClick={() => window.open('/routes/map', '_blank')}
        tooltip="View All Routes on Map"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-refresh"
        className="p-button-text p-button-sm p-button-rounded"
        onClick={fetchTodaysDeliveries}
        tooltip="Refresh"
        tooltipOptions={{ position: 'top' }}
        disabled={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <BaseWidget
        widgetId={widgetId}
        title="Today's Deliveries & Collections"
        icon="truck"
        headerActions={headerActions}
        loading={loading && routes.length === 0}
        error={error}
        minWidth={6}
        maxWidth={12}
      >
        <div className="todays-deliveries-widget">
          {renderSummary()}
          
          {loading ? (
            loadingContent()
          ) : routes.length === 0 ? (
            emptyContent()
          ) : (
            <Accordion 
              multiple 
              activeIndex={expandedRoutes.map(id => 
                routes.findIndex(r => r._id === id)
              ).filter(i => i !== -1)}
              onTabChange={(e) => {
                const newExpanded = e.index.map(i => routes[i]?._id).filter(Boolean);
                setExpandedRoutes(newExpanded);
              }}
              className="route-accordion"
            >
              {routes.map((route, index) => (
                <AccordionTab
                  key={route._id}
                  header={routeHeaderTemplate(route)}
                  headerClassName="route-accordion-header"
                  contentClassName="route-accordion-content"
                >
                  {routeContentTemplate(route)}
                </AccordionTab>
              ))}
            </Accordion>
          )}
        </div>
      </BaseWidget>
    </>
  );
};

export default TodaysDeliveriesWidget;