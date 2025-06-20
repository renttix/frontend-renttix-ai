'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressSpinner } from 'primereact/progressspinner';
import apiServices from '../../../services/apiService';
import RouteMapVisualization from './RouteMapVisualization';
import RouteOrdersList from './RouteOrdersList';
import RouteStatistics from './RouteStatistics';

const RouteDetailsView = () => {
  const { routeId } = useParams();
  const router = useRouter();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchRouteDetails();
  }, [routeId]);

  const fetchRouteDetails = async () => {
    try {
      setLoading(true);
      const response = await apiServices.get(`/routes/${routeId}`);
      if (response.data.success) {
        setRoute(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching route details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (!route) {
    return <div>Route not found</div>;
  }

  const headerTemplate = (
    <div className="flex justify-content-between align-items-center">
      <div>
        <h2 className="m-0">{route.name}</h2>
        <p className="text-500 mt-2">
          Depot: {route.depot?.name} | Created: {new Date(route.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Tag 
          value={route.isActive ? 'Active' : 'Inactive'} 
          severity={route.isActive ? 'success' : 'danger'} 
        />
        <Button 
          label="Edit" 
          icon="pi pi-pencil" 
          className="p-button-outlined"
          onClick={() => router.push(`/system-setup/routing/edit/${routeId}`)}
        />
        <Button 
          label="Back" 
          icon="pi pi-arrow-left" 
          className="p-button-secondary"
          onClick={() => router.push('/system-setup/routing')}
        />
      </div>
    </div>
  );

  return (
    <Card header={headerTemplate}>
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header="Overview">
          <div className="grid">
            <div className="col-12 md:col-8">
              <RouteMapVisualization route={route} />
            </div>
            <div className="col-12 md:col-4">
              <RouteStatistics route={route} />
            </div>
          </div>
        </TabPanel>
        
        <TabPanel header="Assigned Orders">
          <RouteOrdersList routeId={routeId} />
        </TabPanel>
        
        <TabPanel header="Schedule">
          <div className="p-4">
            <h4>Service Schedule</h4>
            <div className="grid">
              <div className="col-12 md:col-6">
                <p><strong>Schedule Type:</strong> {route.schedule?.pattern || 'Weekly'}</p>
                <p><strong>Service Days:</strong> {route.serviceDays?.join(', ') || 'Mon-Fri'}</p>
                <p><strong>Service Window:</strong> {route.serviceWindow || '8:00 AM - 5:00 PM'}</p>
              </div>
              <div className="col-12 md:col-6">
                <p><strong>Max Capacity:</strong> {route.maxCapacity || 50} orders/day</p>
                <p><strong>Average Duration:</strong> {route.avgDuration || 15} min/stop</p>
                <p><strong>Total Distance:</strong> {route.totalDistance || 'N/A'} km</p>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </Card>
  );
};

export default RouteDetailsView;