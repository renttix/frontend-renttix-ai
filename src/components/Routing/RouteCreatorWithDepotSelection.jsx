import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, Marker, DrawingManager } from '@react-google-maps/api';
import Link from 'next/link';
import apiServices from '../../../services/apiService';

const RouteCreatorWithDepotSelection = ({ onRouteCreated }) => {
  const [routeName, setRouteName] = useState('');
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [polygon, setPolygon] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Depot states
  const [depots, setDepots] = useState([]);
  const [selectedDepot, setSelectedDepot] = useState(null);
  const [loadingDepots, setLoadingDepots] = useState(true);
  const [error, setError] = useState('');
  
  // Address search states
  const [searchAddress, setSearchAddress] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [searchMarker, setSearchMarker] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [depotMarker, setDepotMarker] = useState(null);
  
  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['drawing', 'geometry']
  });

  // Fetch depots on component mount
  useEffect(() => {
    fetchDepots();
  }, []);

  // Geocode depot when selectedDepot changes
  useEffect(() => {
    if (selectedDepot && depots.length > 0) {
      const depot = depots.find(d => d._id === selectedDepot);
      if (depot) {
        console.log('Geocoding depot:', depot);
        // Try to geocode the depot
        if (depot.latitude && depot.longitude) {
          const location = {
            lat: depot.latitude,
            lng: depot.longitude
          };
          setDepotMarker(location);
          if (mapRef.current) {
            mapRef.current.panTo(location);
          }
        } else if (depot.address1 || depot.postCode) {
          apiServices.post('/routes/check-location', {
            address: depot.address1,
            postalCode: depot.postCode,
            country: depot.country
          }).then(response => {
            console.log('Geocoding response:', response.data);
            if (response.data.point) {
              const location = {
                lat: response.data.point.latitude,
                lng: response.data.point.longitude
              };
              setDepotMarker(location);
              if (mapRef.current) {
                mapRef.current.panTo(location);
              }
            }
          }).catch(err => {
            console.error('Failed to geocode depot:', err);
          });
        }
      }
    }
  }, [selectedDepot, depots]);

  const fetchDepots = async () => {
    try {
      setLoadingDepots(true);
      const response = await apiServices.get('/depots/list');
      if (response.data.data && Array.isArray(response.data.data)) {
        setDepots(response.data.data);
        // If there's only one depot, select it automatically
        if (response.data.data.length === 1) {
          const singleDepot = response.data.data[0];
          setSelectedDepot(singleDepot._id);
          // Try to set depot marker if it has coordinates
          if (singleDepot.latitude && singleDepot.longitude) {
            setDepotMarker({
              lat: singleDepot.latitude,
              lng: singleDepot.longitude
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching depots:', error);
      setError('Failed to load depots');
    } finally {
      setLoadingDepots(false);
    }
  };

  const mapOptions = {
    center: { lat: 51.5074, lng: -0.1278 }, // Default to London
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

  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) {
      setError('Please enter an address or postal code');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      // Search for the address using the geocoding service
      const searchData = {
        address: searchAddress
      };
      
      // Add country if specified
      if (searchCountry) {
        searchData.country = searchCountry;
      }

      // Check if it's likely a postal code (various formats)
      const postalCodePattern = /^[A-Z0-9\s-]+$/i;
      if (postalCodePattern.test(searchAddress.trim()) && searchAddress.length <= 10) {
        searchData.postalCode = searchAddress;
        delete searchData.address;
      }

      const response = await apiServices.post('/routes/check-location', searchData);
      
      if (response.data.point) {
        const { latitude, longitude } = response.data.point;
        const newPosition = { lat: latitude, lng: longitude };
        
        // Set marker at searched location
        setSearchMarker(newPosition);
        
        // Center map on the location
        if (mapRef.current) {
          mapRef.current.panTo(newPosition);
          mapRef.current.setZoom(14);
        }

        // Show matching routes if any
        if (response.data.matchingRoutes && response.data.matchingRoutes.length > 0) {
          const routeNames = response.data.matchingRoutes.map(r => r.name).join(', ');
          setError(`Location found! This area is covered by: ${routeNames}`);
        } else {
          setError('Location found! Draw a polygon around this area to create a route.');
        }
      }
    } catch (err) {
      console.error('Address search error:', err);
      setError(err.response?.data?.message || 'Failed to search address. Please try again.');
    } finally {
      setIsSearching(false);
    }
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
      if (!depot) {
        setError('Selected depot not found');
        setIsSaving(false);
        return;
      }
      
      // We need to geocode the depot address if it doesn't have coordinates
      let depotCoordinates = [0, 0]; // Default coordinates
      
      if (depot.latitude && depot.longitude) {
        depotCoordinates = [depot.longitude, depot.latitude];
      } else if (depot.address1 || depot.postCode) {
        // Try to geocode the depot address
        try {
          const geocodeResponse = await apiServices.post('/routes/check-location', {
            address: depot.address1,
            postalCode: depot.postCode,
            country: depot.country
          });
          
          if (geocodeResponse.data.point) {
            depotCoordinates = [
              geocodeResponse.data.point.longitude,
              geocodeResponse.data.point.latitude
            ];
          }
        } catch (geocodeError) {
          console.error('Failed to geocode depot address:', geocodeError);
          // Continue with default coordinates
        }
      }
      
      const routeData = {
        name: routeName,
        depot: {
          location: {
            type: 'Point',
            coordinates: depotCoordinates
          },
          address: depot.address1 || depot.address || '',
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
        setSearchMarker(null);
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
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Create New Route</h2>
      
      {error && (
        <div className={`mb-4 px-4 py-3 rounded ${
          error.includes('found!') 
            ? 'bg-blue-100 border border-blue-400 text-blue-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
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
              value={selectedDepot || ''}
              onChange={(e) => {
                const depotId = e.target.value;
                setSelectedDepot(depotId);
                
                // Try to geocode and center map on depot
                const depot = depots.find(d => d._id === depotId);
                if (depot && mapRef.current) {
                  // If depot has coordinates, use them
                  if (depot.latitude && depot.longitude) {
                    const depotLocation = {
                      lat: depot.latitude,
                      lng: depot.longitude
                    };
                    mapRef.current.panTo(depotLocation);
                    setDepotMarker(depotLocation);
                  } else if (depot.address1 || depot.postCode) {
                    // Otherwise, try to geocode the address
                    apiServices.post('/routes/check-location', {
                      address: depot.address1,
                      postalCode: depot.postCode,
                      country: depot.country
                    }).then(response => {
                      if (response.data.point) {
                        const depotLocation = {
                          lat: response.data.point.latitude,
                          lng: response.data.point.longitude
                        };
                        mapRef.current.panTo(depotLocation);
                        setDepotMarker(depotLocation);
                      }
                    }).catch(err => {
                      console.error('Failed to geocode depot location:', err);
                    });
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              required
            >
              <option value="">-- Select a depot --</option>
              {depots.map((depot) => (
                <option key={depot._id} value={depot._id}>
                  {depot.name} - {depot.address1 || depot.address || 'No address'}
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
          
          {/* Global Address Search */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Location (Global)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Enter any address, postal code, or what3words
            </p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Address, postal code, or what3words..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Country (optional)"
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={handleAddressSearch}
                disabled={isSearching}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          
          <div className="space-y-2 border-t pt-4">
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
            mapContainerStyle={{ width: '100%', height: '100%' }}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {/* Depot Marker with House Icon */}
            {depotMarker && (
              <Marker
                position={depotMarker}
                title="Depot Location"
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                    '<svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
                    '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="#4B5563" stroke="#ffffff" stroke-width="1"/>' +
                    '</svg>'
                  ),
                  scaledSize: new window.google.maps.Size(40, 40),
                  anchor: new window.google.maps.Point(20, 40)
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

export default RouteCreatorWithDepotSelection;