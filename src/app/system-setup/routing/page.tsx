'use client';

import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiPlus, FiMap, FiSettings, FiCalendar } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import DefaultLayout from '@/components/Layouts/DefaultLaout';
import apiServices from '../../../../services/apiService';
import RouteManager from '../../../components/Routing/RouteManager';
import UnroutedTasksPanel from '../../../components/maintenance/UnroutedTasksPanel';
import RouteCapacityDashboard from '../../../components/maintenance/RouteCapacityDashboard';

// Dynamically import RouteCreatorEnhanced with SSR disabled
const RouteCreatorEnhanced = dynamic(
  () => import('../../../components/Routing/RouteCreatorEnhanced'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading route creator...</p>
        </div>
      </div>
    )
  }
);

const RoutingSetupPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage' | 'capacity'>('overview');
  const [routeStats, setRouteStats] = useState({
    activeRoutes: 0,
    totalCoverage: 0,
    ordersInRoutes: 0,
    unroutedTasks: 0
  });

  useEffect(() => {
    fetchRouteStats();
  }, []);

  const fetchRouteStats = async () => {
    try {
      const response = await apiServices.get('/routes');
      if (response.data.success) {
        const routes = response.data.data;
        setRouteStats({
          activeRoutes: routes.length,
          totalCoverage: routes.filter((r: any) => r.geofence).length,
          ordersInRoutes: routes.reduce((sum: number, r: any) => sum + (r.orderCount || 0), 0),
          unroutedTasks: 0 // This would come from a separate API
        });
      }
    } catch (error) {
      console.error('Error fetching route stats:', error);
    }
  };

  const handleRouteCreated = () => {
    fetchRouteStats();
    setActiveTab('manage');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{routeStats.activeRoutes}</p>
                </div>
                <FiMap className="text-3xl text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Coverage Areas</p>
                  <p className="text-2xl font-bold text-gray-900">{routeStats.totalCoverage}</p>
                </div>
                <FiSettings className="text-3xl text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Orders in Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{routeStats.ordersInRoutes}</p>
                </div>
                <FiCalendar className="text-3xl text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unrouted Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{routeStats.unroutedTasks}</p>
                </div>
                <FiPlus className="text-3xl text-orange-500" />
              </div>
            </div>
          </div>
        );
      
      case 'create':
        return <RouteCreatorEnhanced onRouteCreated={handleRouteCreated} />;
      
      case 'manage':
        return <RouteManager />;
      
      case 'capacity':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RouteCapacityDashboard onCapacityUpdate={() => fetchRouteStats()} />
            <UnroutedTasksPanel
              onAssign={() => fetchRouteStats()}
              onRefresh={() => fetchRouteStats()}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Routing Configuration</h1>
          <p className="text-gray-600 mt-2">Manage maintenance routes and service areas</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiMap className="inline mr-2" />
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiPlus className="inline mr-2" />
              Create Maintenance Route
            </button>
            
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiSettings className="inline mr-2" />
              Manage Maintenance Routes
            </button>
            
            <button
              onClick={() => setActiveTab('capacity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'capacity'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiCalendar className="inline mr-2" />
              Route Capacity
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </DefaultLayout>
  );
};

export default RoutingSetupPage;