import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import './LocationVerificationModal.css';

const LocationVerificationModal = ({ 
  visible, 
  onHide, 
  address, 
  postcode,
  countryCode,
  onConfirm,
  token 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [geocodingMethod, setGeocodingMethod] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (visible && address) {
      geocodeAddress();
    }
  }, [visible, address, postcode]);

  useEffect(() => {
    if (coordinates && mapLoaded && mapRef.current) {
      initializeMap();
    }
  }, [coordinates, mapLoaded]);

  const geocodeAddress = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${BaseURL}/geocoding/geocode`,
        {
          postcode,
          address,
          countryCode
        },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const { lat, lng, formatted_address, method } = response.data.data;
        
        // Validate coordinates before setting
        if (typeof lat === 'number' && typeof lng === 'number' &&
            !isNaN(lat) && !isNaN(lng) &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180) {
          setCoordinates({ lat, lng });
          setGeocodingMethod(method);
          
          // Load Google Maps if not already loaded
          if (!window.google) {
            loadGoogleMaps();
          } else {
            setMapLoaded(true);
          }
        } else {
          setError('Invalid coordinates received from geocoding service');
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setError(error.response?.data?.message || 'Failed to geocode address');
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleMaps = () => {
    // Check if script is already loading
    if (window.googleMapsLoading) {
      window.googleMapsCallbacks.push(() => setMapLoaded(true));
      return;
    }

    // Check if already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    window.googleMapsLoading = true;
    window.googleMapsCallbacks = [() => setMapLoaded(true)];

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      window.googleMapsLoading = false;
      window.googleMapsCallbacks.forEach(cb => cb());
      window.googleMapsCallbacks = [];
    };

    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: coordinates,
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    // Create draggable marker
    const marker = new window.google.maps.Marker({
      position: coordinates,
      map: map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      title: 'Drag to adjust location'
    });

    // Handle marker drag
    marker.addListener('dragstart', () => {
      setIsDragging(true);
    });

    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      setCoordinates({
        lat: position.lat(),
        lng: position.lng()
      });
      setIsDragging(false);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
  };

  const handleConfirm = async () => {
    if (!coordinates) return;

    // Get the final address for the adjusted coordinates
    try {
      const response = await axios.post(
        `${BaseURL}/geocoding/reverse-geocode`,
        coordinates,
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );

      const finalAddress = response.data.data.formatted_address;
      
      onConfirm({
        coordinates,
        verifiedAddress: finalAddress,
        originalAddress: address,
        geocodingMethod,
        verified: true
      });
    } catch (error) {
      // If reverse geocoding fails, still proceed with coordinates
      onConfirm({
        coordinates,
        verifiedAddress: address,
        originalAddress: address,
        geocodingMethod,
        verified: true
      });
    }
  };

  const footer = (
    <div className="location-modal-footer">
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        onClick={onHide} 
        className="p-button-text" 
      />
      <Button 
        label="Confirm Location" 
        icon="pi pi-check" 
        onClick={handleConfirm}
        disabled={!coordinates || loading}
        className="p-button-success"
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Verify Delivery Location"
      footer={footer}
      className="location-verification-modal"
      style={{ width: '90vw', maxWidth: '800px' }}
      modal
      closable={!loading}
    >
      <div className="location-verification-content">
        {loading && (
          <div className="loading-container">
            <ProgressSpinner />
            <p>Locating address...</p>
          </div>
        )}

        {error && (
          <Message 
            severity="error" 
            text={error}
            className="mb-3"
          />
        )}

        {!loading && coordinates && (
          <>
            <div className="location-info">
              <div className="info-item">
                <MapPin size={20} />
                <div>
                  <strong>Address:</strong>
                  <p>{address}</p>
                </div>
              </div>
              
              {geocodingMethod && (
                <div className="info-item">
                  <CheckCircle size={20} className="text-success" />
                  <div>
                    <strong>Located using:</strong>
                    <p>{geocodingMethod === 'postcode' ? 'Postcode' : 'Full address'}</p>
                  </div>
                </div>
              )}

              <div className="info-item">
                <AlertCircle size={20} className="text-warning" />
                <div>
                  <strong>Instructions:</strong>
                  <p>Please verify the pin location on the map. You can drag the pin to adjust if needed.</p>
                </div>
              </div>
            </div>

            <div className="map-container">
              <div ref={mapRef} className="google-map" />
              {isDragging && (
                <div className="dragging-indicator">
                  <span>Drop pin at correct location</span>
                </div>
              )}
            </div>

            {coordinates && coordinates.lat != null && coordinates.lng != null && (
              <div className="coordinates-display">
                <small>
                  Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </small>
              </div>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
};

export default LocationVerificationModal;