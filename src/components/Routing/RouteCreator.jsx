import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, Marker, DrawingManager } from '@react-google-maps/api';
import apiServices from '../../../services/apiService';

const RouteCreator = ({ depot, onRouteCreated }) => {
  const [routeName, setRouteName] = useState('');
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [polygon, setPolygon] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['drawing', 'geometry']
  });

  const mapOptions = {
    center: {
      lat: depot.location.coordinates[1],
      lng: depot.location.coordinates[0]
    },
    zoom: 13,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onPolygonComplete = useCallback((polygon) => {
    const path = polygon.getPath();
    const coordinates = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      coordinates.push(path.getAt(i));
    }
    
    setPolygon(coordinates);
    setIsDrawing(false);
    
    // Remove the polygon from map as we'll render it separately
    polygon.setMap(null);
  }, []);

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setPolygon([]);
  };

  const handleClearPolygon = () => {
    setPolygon([]);
  };

  const handleSaveRoute = async () => {
    if (!routeName.trim()) {
      alert('Please enter a route name');
      return;
    }
    
    if (polygon.length < 3) {
      alert('Please draw a valid route area');
      return;
    }

    setIsSaving(true);
    
    try {
      const coordinates = polygon.map(point => [point.lng(), point.lat()]);
      // Close the polygon
      coordinates.push(coordinates[0]);
      
      const routeData = {
        name: routeName,
        depot: depot,
        geofence: {
          type: 'Polygon',
          coordinates: [coordinates]
        },
        schedule: {
          pattern: 'weekly',
          dayOfWeek: selectedDay
        },
        serviceWindow: {
          startTime: '08:00',
          endTime: '17:00',
          duration: 15
        },
        capacity: {
          maxOrders: 50,
          maxDistance: 100,
          maxDuration: 480
        }
      };
      
      const response = await apiServices.post('/routes', routeData);
      
      if (response.data.success) {
        alert('Route created successfully');
        onRouteCreated();
        // Reset form
        setRouteName('');
        setPolygon([]);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create route');
    } finally {
      setIsSaving(false);
    }
  };

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Create New Route</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Route Name
            </label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="e.g., North District Route"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Day
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              {daysOfWeek.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Depot Location
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm text-gray-600 dark:text-gray-400">
              {depot.name}
            </div>
          </div>
          
          <div className="space-y-2">
            {!isDrawing && polygon.length === 0 && (
              <button
                onClick={handleStartDrawing}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Draw Route Area
              </button>
            )}
            
            {isDrawing && (
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Click on the map to draw your route area. Click the first point to close the polygon.
              </div>
            )}
            
            {polygon.length > 0 && (
              <>
                <button
                  onClick={handleClearPolygon}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear Area
                </button>
                
                <button
                  onClick={handleSaveRoute}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Route'}
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Map Section */}
        <div className="lg:col-span-2 h-[500px] rounded-lg overflow-hidden">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {/* Depot Marker */}
            <Marker
              position={{
                lat: depot.location.coordinates[1],
                lng: depot.location.coordinates[0]
              }}
              title={depot.name}
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE,
                scale: 10,
                fillColor: '#EF4444',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }}
            />
            
            {/* Rendered Polygon */}
            {polygon.length > 0 && (
              <Polygon
                paths={polygon}
                options={{
                  fillColor: '#3B82F6',
                  fillOpacity: 0.2,
                  strokeColor: '#3B82F6',
                  strokeOpacity: 0.8,
                  strokeWeight: 2
                }}
              />
            )}
            
            {/* Search Marker */}
            {searchMarker && (
              <Marker
                position={searchMarker}
                title="Searched Location"
                icon={{
                  path: window.google?.maps?.SymbolPath?.BACKWARD_CLOSED_ARROW,
                  scale: 8,
                  fillColor: '#10B981',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  rotation: 180
                }}
              />
            )}
            
            {/* Drawing Manager */}
            {isDrawing && (
              <DrawingManager
                onLoad={(drawingManager) => {
                  drawingManagerRef.current = drawingManager;
                }}
                onPolygonComplete={onPolygonComplete}
                options={{
                  drawingControl: false,
                  polygonOptions: {
                    fillColor: '#3B82F6',
                    fillOpacity: 0.2,
                    strokeColor: '#3B82F6',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    clickable: true,
                    editable: true
                  }
                }}
                drawingMode={window.google?.maps?.drawing?.OverlayType?.POLYGON}
              />
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
};

export default RouteCreator;