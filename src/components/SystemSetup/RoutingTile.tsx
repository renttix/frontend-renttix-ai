import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMapPin, FiMap, FiSettings } from 'react-icons/fi';
import apiServices from '../../../services/apiService';

interface DepotLocation {
  name: string;
  address: string;
  coordinates: [number, number];
}

const RoutingTile: React.FC = () => {
  const router = useRouter();
  const [depot, setDepot] = useState<DepotLocation | null>(null);
  const [routeCount, setRouteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoutingConfig();
  }, []);

  const fetchRoutingConfig = async () => {
    try {
      const response = await apiServices.get('/routes');
      if (response.data.success) {
        setRouteCount(response.data.count);
        // For now, we'll get depot info from the first route if available
        if (response.data.data.length > 0 && response.data.data[0].depot) {
          setDepot(response.data.data[0].depot);
        }
      }
    } catch (error) {
      console.error('Failed to fetch routing config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    router.push('/system-setup/routing');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <FiMap className="w-6 h-6 text-blue-600" />
        </div>
        <FiSettings className="w-5 h-5 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Routing
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        Configure service routes and delivery areas
      </p>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {depot ? (
            <div className="flex items-center text-sm text-gray-700">
              <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate">{depot.name}</span>
            </div>
          ) : (
            <div className="text-sm text-amber-600">
              No depot configured
            </div>
          )}
          
          <div className="text-sm text-gray-700">
            {routeCount} active route{routeCount !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutingTile;