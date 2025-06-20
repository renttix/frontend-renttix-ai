import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, Marker, DrawingManager } from '@react-google-maps/api';
import Link from 'next/link';
import apiServices from '../../../services/apiService';

// Define libraries as a constant outside the component to prevent re-renders
const GOOGLE_MAPS_LIBRARIES = ['drawing', 'geometry'];

const RouteCreatorSimple = ({ onRouteCreated }) => {
  const [routeName, setRouteName] = useState('');
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [polygon, setPolygon] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Depot states
  const [depots, setDepots] = useState([]);
  const [selectedDepot, setSelectedDepot] = useState('');
  const [loadingDepots, setLoadingDepots] = useState(true);
  const [error, setError] = useState('');
  const [depotLocation, setDepotLocation] = useState(null);
  
  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  // Fetch depots on component mount
  useEffect(() => {
    fetchDepots();
  }, []);

  const fetchDepots = async () => {
    try {
      setLoadingDepots(true);
      const response = await apiServices.get('/depots/list');
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Fetched depots:', response.data.data); // Debug
        setDepots(response.data.data);
        // If there's only one depot, select it automatically
        if (response.data.data.length === 1) {
          setSelectedDepot(response.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching depots:', error);
      setError('Failed to load depots');
    } finally {
      setLoadingDepots(false);
    }
  };

  // Geocode depot when selected
  useEffect(() => {
    const geocodeDepot = async () => {
      if (selectedDepot && depots.length > 0) {
        const depot = depots.find(d => d._id === selectedDepot);
        console.log('Selected depot:', depot); // Debug
        console.log('Depot details:', {
          name: depot?.name,
          city: depot?.city,
          postCode: depot?.postCode,
          address1: depot?.address1,
          country: depot?.country
        });
        
        if (depot) {
          let location;
          
          // Check if depot already has coordinates
          if (depot.latitude && depot.longitude) {
            console.log('Using stored coordinates:', depot.latitude, depot.longitude); // Debug
            location = {
              lat: depot.latitude,
              lng: depot.longitude
            };
          } else if (depot.postCode || depot.postcode || depot.address1) {
            // Build a clean address for geocoding
            const addressParts = [];
            
            // Add address components in order
            if (depot.address1) addressParts.push(depot.address1);
            if (depot.address2) addressParts.push(depot.address2);
            if (depot.city) addressParts.push(depot.city);
            
            // Add postcode if available
            const postcode = depot.postCode || depot.postcode;
            if (postcode) addressParts.push(postcode);
            
            // Add country
            if (depot.country) addressParts.push(depot.country);
            
            const fullAddress = addressParts.filter(Boolean).join(', ');
            
            if (fullAddress) {
              try {
                console.log('Geocoding depot address:', fullAddress);
                
                const response = await apiServices.post('/routes/geocode', {
                  address: fullAddress
                });
                
                if (response.data.success && response.data.coordinates) {
                  location = {
                    lat: response.data.coordinates[1],
                    lng: response.data.coordinates[0]
                  };
                  console.log('Successfully geocoded depot:', location);
                } else {
                  console.error('Geocoding returned no coordinates');
                }
              } catch (error) {
                console.error('Geocoding failed:', error.message);
              }
            }
            
            // If no location was found, log error
            if (!location) {
              console.error('Geocoding failed for depot:', depot.name);
              location = { lat: 51.5074, lng: -0.1278 };
            }
          } else {
            // Default location if no address
            location = { lat: 51.5074, lng: -0.1278 };
          }
          
          console.log('Setting depot location:', location); // Debug
          setDepotLocation(location);
          
          // Pan map to new location
          if (mapRef.current && location) {
            console.log('Panning map to:', location); // Debug
            mapRef.current.panTo(location);
            mapRef.current.setZoom(13);
          } else {
            console.log('Map ref not ready or no location'); // Debug
          }
        }
      }
    };
    
    geocodeDepot();
  }, [selectedDepot, depots]);

  // Separate effect to handle map panning when depot location changes
  useEffect(() => {
    if (mapRef.current && depotLocation) {
      console.log('Depot location changed, panning to:', depotLocation);
      mapRef.current.panTo(depotLocation);
      mapRef.current.setZoom(13);
    }
  }, [depotLocation]);

  const mapOptions = {
    center: depotLocation || { lat: 51.5074, lng: -0.1278 }, // Use depot location if available, otherwise default to London
    zoom: 13,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    // If we already have a depot location, center on it
    if (depotLocation) {
      map.panTo(depotLocation);
      map.setZoom(13);
    }
  }, [depotLocation]);

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
      setError('Please enter a route name');
      return;
    }
    
    if (!selectedDepot) {
      setError('Please select a depot');
      return;
    }
    
    if (polygon.length < 3) {
      setError('Please draw a valid route area');
      return;
    }

    setIsSaving(true);
    setError('');
    
    try {
      const coordinates = polygon.map(point => [point.lng(), point.lat()]);
      // Close the polygon
      coordinates.push(coordinates[0]);
      
      // Find the selected depot
      const depot = depots.find(d => d._id === selectedDepot);
      
      const routeData = {
        name: routeName,
        depot: {
          location: {
            type: 'Point',
            coordinates: [
              depot.longitude || -0.1278,
              depot.latitude || 51.5074
            ]
          },
          address: depot.address1 || '',
          name: depot.name
        },
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
        if (onRouteCreated) onRouteCreated();
        // Reset form
        setRouteName('');
        setPolygon([]);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create route');
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

  // Show loading state
  if (loadingDepots) {
    return (
      <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading depots...</p>
      </div>
    );
  }

  // Show message if no depots exist
  if (depots.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-semibold">No depots found</p>
          <p className="mt-1">
            You need to create at least one depot before creating routes.{' '}
            <Link
              href="/system-setup/depots/add"
              className="underline font-semibold hover:text-yellow-800"
            >
              Click here to add a depot
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Create Maintenance Route</h2>
      
      {error && (
        <div className="mb-4 px-4 py-3 rounded bg-red-100 border border-red-400 text-red-700">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="space-y-4">
          {/* Depot Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Depot <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDepot}
              onChange={(e) => setSelectedDepot(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              required
            >
              <option value="">-- Select a depot --</option>
              {depots.map((depot) => (
                <option key={depot._id} value={depot._id}>
                  {depot.name} - {depot.address1 || 'No address'}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Route Name <span className="text-red-500">*</span>
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
          
          <div className="space-y-2 border-t pt-4">
            {!isDrawing && polygon.length === 0 && (
              <button
                onClick={handleStartDrawing}
                disabled={!selectedDepot}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isSaving || !selectedDepot}
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
            key={`map-${selectedDepot}-${depotLocation?.lat}-${depotLocation?.lng}`} // Force re-render when depot changes
            mapContainerStyle={{ width: '100%', height: '100%' }}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {/* Depot Marker */}
            {depotLocation && (
              <Marker
                position={depotLocation}
                title={depots.find(d => d._id === selectedDepot)?.name || "Depot Location"}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
                      <text x="20" y="27" font-size="20" text-anchor="middle" fill="white">🏠</text>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(40, 40),
                  anchor: new window.google.maps.Point(20, 20)
                }}
              />
            )}
            
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

export default RouteCreatorSimple;