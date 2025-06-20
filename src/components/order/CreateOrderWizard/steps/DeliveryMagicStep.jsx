"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import useDebounce from '@/hooks/useDebounce';
import RouteSelector from '../components/RouteSelector';
import DeliveryMap from '../components/DeliveryMap';
import { ContextualHelp } from '../components/ContextualHelp';

export default function DeliveryMagicStep() {
  const { state, updateFormData, completeStep, setValidation } = useWizard();
  const { formData } = state;
  const { token } = useSelector((state) => state?.authReducer);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [useCustomerAddress, setUseCustomerAddress] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Google Places API state
  const [locations, setLocations] = useState([]);
  const [query, setQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);

  // Fetch suggestions for address search
  useEffect(() => {
    if (!debouncedQuery) {
      setLocations([]);
      return;
    }
    setSearchLoading(true);
    axios
      .get(`${BaseURL}/google/location-suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: debouncedQuery },
      })
      .then((res) => setLocations(res.data.suggestions || []))
      .catch(console.error)
      .finally(() => setSearchLoading(false));
  }, [debouncedQuery, token]);

  // On suggestion select
  const handleLocationSelect = async (loc) => {
    setIsReadOnly(true);
    setQuery("");
    setLocations([]);
    setSearchLoading(true);
    try {
      const { data: place } = await axios.get(
        `${BaseURL}/google/place-details`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { place_id: loc.place_id },
        },
      );
      updateFormData({
        deliveryAddress1: place.formattedAddress,
        deliveryAddress2: `${place.city || ""}, ${place.state || ""}, ${place.country || ""}`,
        deliveryCity: place.city,
        deliveryCountry: place.country,
        deliveryPostcode: place.postalCode,
        deliveryCoordinates:{lat:place.latitude,lng:place.longitude}
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Clear the autocomplete
  const clearAddressSearch = () => {
    setIsReadOnly(false);
    setQuery("");
    setLocations([]);
    updateFormData({
      deliveryAddress1: "",
      deliveryAddress2: "",
      deliveryCity: "",
      deliveryCountry: "",
      deliveryPostcode: "",
    });
  };
  
  // Auto-fill with customer address if available
  useEffect(() => {
    if (formData.customerDetails && !formData.deliveryAddress1) {
      const customer = formData.customerDetails;
      if (customer.address1) {
        setUseCustomerAddress(true);
        updateFormData({
          deliveryAddress1: customer.address1,
          deliveryAddress2: customer.address2 || '',
          deliveryCity: customer.city || '',
          deliveryCountry: customer.country || '',
          deliveryPostcode: customer.postcode || '',
        });
      }
    }
  }, []);
  
  // Geocode address when all fields are filled
  useEffect(() => {
    const { deliveryAddress1, deliveryCity, deliveryPostcode, deliveryCountry } = formData;
    if (deliveryAddress1 && deliveryCity && deliveryPostcode && deliveryCountry) {
      geocodeAddress();
    }
  }, [
    formData.deliveryAddress1,
    formData.deliveryCity,
    formData.deliveryPostcode,
    formData.deliveryCountry
  ]);
  
  const geocodeAddress = async () => {
    try {
      setGeocoding(true);
      const fullAddress = `${formData.deliveryAddress1}, ${formData.deliveryCity}, ${formData.deliveryPostcode}, ${formData.deliveryCountry}`;
      
      const response = await axios.post(
        `${BaseURL}/geocoding/geocode`,
        { address: fullAddress },
        {
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data?.coordinates) {
        updateFormData({
          deliveryCoordinates: response.data.coordinates,
          locationVerified: true
        });
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      updateFormData({
        deliveryCoordinates: null,
        locationVerified: false
      });
    } finally {
      setGeocoding(false);
    }
  };
  
  const handleUseCustomerAddress = () => {
    const customer = formData.customerDetails;
    if (customer) {
      updateFormData({
        deliveryAddress1: customer.addressLine1 || '',
        deliveryAddress2: customer.addressLine2 || '',
        deliveryCity: customer.city || '',
        deliveryCountry: customer.country || '',
        deliveryPostcode: customer.postCode || '',
        deliveryContactName: customer.name || '',
        deliveryContactPhone: customer.mobile || ''
      });
      
      // Set the Google search field with customer address
      if (customer.address1) {
        setQuery(customer.address1);
        setIsReadOnly(true);
      }
      
      setUseCustomerAddress(true);
    }
  };
  
  const validateStep = () => {
    const newErrors = {};
    
    if (!formData.deliveryAddress1) {
      newErrors.address1 = 'Address is required';
    }
    
    if (!formData.deliveryCity) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.deliveryPostcode) {
      newErrors.postcode = 'Postcode is required';
    }
    
    if (!formData.deliveryCountry) {
      newErrors.country = 'Country is required';
    }
    
    if (!formData.deliveryContactName) {
      newErrors.contactName = 'Contact name is required';
    }
    
    if (!formData.deliveryContactPhone) {
      newErrors.contactPhone = 'Contact phone is required';
    }
    
    if (!formData.assignedRoute) {
      newErrors.route = 'Please assign a route or create a floating task';
    }
    
    setErrors(newErrors);
    setValidation(3, newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  const handleContinue = () => {
    if (validateStep()) {
      completeStep(3);
    }
  };
  
  const handleRouteAssignment = (routeData) => {
    updateFormData({
      assignedRoute: routeData.route,
      routeOverrideReason: routeData.overrideReason || ''
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Delivery Details</h2>
        <p className="text-gray-600">Set up delivery address and route assignment</p>
      </div>
      
      {/* Delivery Address */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">📍</span> Delivery Address
            </h3>
            {formData.customerDetails && (
              <Button
                label="Use Customer Address"
                icon="pi pi-copy"
                className="p-button-sm p-button-outlined"
                onClick={handleUseCustomerAddress}
                disabled={useCustomerAddress}
              />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <ContextualHelp fieldId="deliveryAddress">
                <div className="relative">
                  <div className="p-inputgroup flex-1">
                    <InputText
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Start typing to search addresses..."
                      className="w-full delivery-address"
                      disabled={isReadOnly}
                    />
                    {isReadOnly ? (
                      <Button
                        icon="pi pi-times"
                        className="p-button-danger"
                        onClick={clearAddressSearch}
                        tooltip="Clear and search again"
                      />
                    ) : (
                      searchLoading && (
                        <span className="p-inputgroup-addon">
                          <i className="pi pi-spin pi-spinner"></i>
                        </span>
                      )
                    )}
                  </div>
                  
                  {/* Suggestions dropdown */}
                  {locations.length > 0 && !isReadOnly && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {locations.map((location, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleLocationSelect(location)}
                        >
                          <div className="flex items-start">
                            <i className="pi pi-map-marker text-gray-400 mt-1 mr-2"></i>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {location.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
              </ContextualHelp>
              {errors.address1 && (
                <small className="text-red-500">{errors.address1}</small>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Address Line 2</label>
              <InputText
                value={formData.deliveryAddress2 || ''}
                onChange={(e) => updateFormData({ deliveryAddress2: e.target.value })}
                className="w-full"
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <ContextualHelp fieldId="deliveryCity">
                <InputText
                  value={formData.deliveryCity || ''}
                  onChange={(e) => updateFormData({ deliveryCity: e.target.value })}
                  className="w-full delivery-city"
                  placeholder="Birmingham"
                />
              </ContextualHelp>
              {errors.city && (
                <small className="text-red-500">{errors.city}</small>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Postcode <span className="text-red-500">*</span>
              </label>
              <ContextualHelp fieldId="deliveryPostcode">
                <InputText
                  value={formData.deliveryPostcode || ''}
                  onChange={(e) => updateFormData({ deliveryPostcode: e.target.value })}
                  className="w-full delivery-postcode"
                  placeholder="B1 1AA"
                />
              </ContextualHelp>
              {errors.postcode && (
                <small className="text-red-500">{errors.postcode}</small>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.deliveryCountry || ''}
                onChange={(e) => updateFormData({ deliveryCountry: e.target.value })}
                className="w-full"
                placeholder="United Kingdom"
              />
              {errors.country && (
                <small className="text-red-500">{errors.country}</small>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {geocoding && (
                <div className="flex items-center gap-2 text-blue-600">
                  <ProgressSpinner style={{ width: '20px', height: '20px' }} />
                  <span className="text-sm">Verifying address...</span>
                </div>
              )}
              {formData.locationVerified && !geocoding && (
                <Tag value="Address Verified" icon="pi pi-check" severity="success" />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.deliveryContactName || ''}
                onChange={(e) => updateFormData({ deliveryContactName: e.target.value })}
                className="w-full"
                placeholder="John Smith"
              />
              {errors.contactName && (
                <small className="text-red-500">{errors.contactName}</small>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.deliveryContactPhone || ''}
                onChange={(e) => updateFormData({ deliveryContactPhone: e.target.value })}
                className="w-full"
                placeholder="07700900000"
              />
              {errors.contactPhone && (
                <small className="text-red-500">{errors.contactPhone}</small>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Smart Route Assignment */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">🚚</span> Smart Route Assignment
          </h3>
          
          {errors.route && (
            <Message severity="error" text={errors.route} />
          )}
          
          {formData.deliveryCoordinates ? (
            <RouteSelector
              deliveryCoordinates={formData.deliveryCoordinates}
              deliveryAddress={{
                address1: formData.deliveryAddress1,
                address2: formData.deliveryAddress2,
                city: formData.deliveryCity,
                postcode: formData.deliveryPostcode,
                country: formData.deliveryCountry
              }}
              onRouteChange={handleRouteAssignment}
              selectedRoute={formData.assignedRoute}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="pi pi-map-marker text-4xl mb-2"></i>
              <p>Enter delivery address to see available routes</p>
            </div>
          )}
          
          {/* Map Preview Button */}
          {formData.deliveryCoordinates && formData.assignedRoute && (
            <div className="flex justify-center pt-4">
              <Button
                label="View on Map"
                icon="pi pi-map"
                className="p-button-outlined"
                onClick={() => setShowMap(true)}
              />
            </div>
          )}
        </div>
      </Card>
      
      {/* Delivery Instructions */}
      <Card>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowInstructions(!showInstructions)}
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">📝</span> Delivery Instructions
            <Tag value="Optional" severity="secondary" />
          </h3>
          <i className={`pi ${showInstructions ? 'pi-chevron-up' : 'pi-chevron-down'}`}></i>
        </div>
        
        {showInstructions && (
          <div className="mt-4">
            <InputTextarea
              value={formData.deliveryInstructions || ''}
              onChange={(e) => updateFormData({ deliveryInstructions: e.target.value })}
              rows={4}
              className="w-full"
              placeholder="Special delivery instructions, gate codes, etc."
            />
          </div>
        )}
      </Card>
      
      {/* Navigation */}
      {/* <div className="flex justify-between">
        <Button
          label="Back"
          icon="pi pi-arrow-left"
          className="p-button-text"
          onClick={() => updateFormData({ currentStep: 2 })}
        />
        <Button
          label="Review Order"
          icon="pi pi-arrow-right"
          iconPos="right"
          onClick={handleContinue}
          disabled={!formData.assignedRoute || geocoding}
        />
      </div> */}
      
      {/* Map Dialog */}
      <Dialog
        header="Delivery Route Preview"
        visible={showMap}
        style={{ width: '90vw', maxWidth: '1200px' }}
        onHide={() => setShowMap(false)}
        maximizable
      >
        <DeliveryMap
          deliveryCoordinates={formData.deliveryCoordinates}
          deliveryAddress={{
            address1: formData.deliveryAddress1,
            address2: formData.deliveryAddress2,
            city: formData.deliveryCity,
            postcode: formData.deliveryPostcode,
            country: formData.deliveryCountry
          }}
          assignedRoute={formData.assignedRoute}
          height="500px"
        />
      </Dialog>
    </motion.div>
  );
}
