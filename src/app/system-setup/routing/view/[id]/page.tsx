'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import DefaultLayout from '@/components/Layouts/DefaultLaout';
import apiServices from '../../../../../../services/apiService';

// Dynamically import map component with SSR disabled
const RouteViewMap = dynamic(
  () => import('../../../../../components/Routing/RouteViewMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading map...</p>
        </div>
      </div>
    )
  }
);

const RouteViewPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchRoute();
    }
  }, [params.id]);

  const fetchRoute = async () => {
    try {
      setLoading(true);
      const response = await apiServices.get(`/routes/${params.id}`);
      if (response.data.success) {
        setRoute(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setError('Failed to load route details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/system-setup/routing/edit/${params.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete route "${route.name}"?`)) {
      try {
        const response = await apiServices.delete(`/routes/${params.id}`);
        if (response.data.success) {
          router.push('/system-setup/routing');
        }
      } catch (error) {
        console.error('Error deleting route:', error);
        alert('Failed to delete route');
      }
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading route details...</p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error || !route) {
    return (
      <DefaultLayout>
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Route not found'}
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
        </div>
      </DefaultLayout>
    );
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{route.name}</h1>
              {route.description && (
                <p className="text-gray-600 mt-2">{route.description}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiEdit className="mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FiTrash2 className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Route Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Route Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <p className="font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      route.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {route.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Depot</label>
                  <p className="font-medium">{route.depot?.name || 'N/A'}</p>
                  {route.depot?.address && (
                    <p className="text-sm text-gray-500">{route.depot.address}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600">Schedule</label>
                  <p className="font-medium">
                    {route.schedule?.pattern || 'N/A'}
                    {route.schedule?.dayOfWeek !== undefined && (
                      <span className="text-gray-500">
                        {' '}({dayNames[route.schedule.dayOfWeek]})
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Service Window</label>
                  <p className="font-medium">
                    {route.serviceWindow?.startTime || '08:00'} - {route.serviceWindow?.endTime || '17:00'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Duration: {route.serviceWindow?.duration || 15} minutes
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Capacity</label>
                  <p className="text-sm">
                    Max Orders: {route.capacity?.maxOrders || 50}<br />
                    Max Distance: {route.capacity?.maxDistance || 100} km<br />
                    Max Duration: {route.capacity?.maxDuration || 480} minutes
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Created</label>
                  <p className="font-medium">
                    {new Date(route.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Service Area</h2>
              <RouteViewMap route={route} />
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default RouteViewPage;