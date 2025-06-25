"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Chips } from 'primereact/chips';
import { AutoComplete } from 'primereact/autocomplete';
import { Message } from 'primereact/message';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import useDebounce from '@/hooks/useDebounce';

export default function AddressStep() {
  const { state, updateFormData, completeStep, setValidation, addDeliveryAddress, removeDeliveryAddress } = useWizard();
  const { formData } = state;
  const { token } = useSelector((state) => state?.authReducer);
  
  const [errors, setErrors] = useState({});
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [locations, setLocations] = useState([]);
  const [query, setQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [newDeliveryAddress, setNewDeliveryAddress] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    lat:'',
    lng:'',
    city: '',
    state: '',
    country: '',
    postCode: '',
    instructions: '',
    accessCode: '',
    isDefault: false,
  });
  const [deliveryErrors, setDeliveryErrors] = useState({});
  const [deliveryQuery, setDeliveryQuery] = useState('');
  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const [deliverySearchLoading, setDeliverySearchLoading] = useState(false);
  const [deliveryIsReadOnly, setDeliveryIsReadOnly] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);
  const debouncedDeliveryQuery = useDebounce(deliveryQuery, 500);

  // Fetch suggestions for billing address
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

  // Fetch suggestions for delivery address
  useEffect(() => {
    if (!debouncedDeliveryQuery) {
      setDeliveryLocations([]);
      return;
    }
    setDeliverySearchLoading(true);
    axios
      .get(`${BaseURL}/google/location-suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: debouncedDeliveryQuery },
      })
      .then((res) => setDeliveryLocations(res.data.suggestions || []))
      .catch(console.error)
      .finally(() => setDeliverySearchLoading(false));
  }, [debouncedDeliveryQuery, token]);

  // On suggestion select for billing address
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
        addressLine1: place.formattedAddress,
        addressLine2: `${place.city || ""}, ${place.state || ""}, ${place.country || ""}`,
        city: place.city,
        country: place.country,
        lat:place.latitude,
        lng:place.longitude,
        postCode: place.postalCode,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // On suggestion select for delivery address
  const handleDeliveryLocationSelect = async (loc) => {
    setDeliveryIsReadOnly(true);
    setDeliveryQuery("");
    setDeliveryLocations([]);
    setDeliverySearchLoading(true);
    try {
      const { data: place } = await axios.get(
        `${BaseURL}/google/place-details`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { place_id: loc.place_id },
        },
      );
      setNewDeliveryAddress((prev) => ({
        ...prev,
        addressLine1: place.formattedAddress,
        addressLine2: `${place.city || ""}, ${place.state || ""}, ${place.country || ""}`,
        city: place.city,
        country: place.country,
        postCode: place.postalCode,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setDeliverySearchLoading(false);
    }
  };

  // Clear the autocomplete for billing address
  const clearAddressSearch = () => {
    setIsReadOnly(false);
    setQuery("");
    setLocations([]);
    updateFormData({
      addressLine1: "",
      addressLine2: "",
      city: "",
      country: "",
      postCode: "",
      lat:'',
      lng:""
    });
  };

  // Clear the autocomplete for delivery address
  const clearDeliveryAddressSearch = () => {
    setDeliveryIsReadOnly(false);
    setDeliveryQuery("");
    setDeliveryLocations([]);
    setNewDeliveryAddress((prev) => ({
      ...prev,
      addressLine1: "",
      addressLine2: "",
      city: "",
      country: "",
      postCode: "",
    }));
  };
  
  const validateStep = () => {
    const newErrors = {};
    
    if (!formData.addressLine1) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.postCode) {
      newErrors.postCode = 'Postcode is required';
    }
    
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    setValidation(3, newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  const validateDeliveryAddress = () => {
    const errors = {};
    
    if (!newDeliveryAddress.name) {
      errors.name = 'Location name is required';
    }
    
    if (!newDeliveryAddress.addressLine1) {
      errors.addressLine1 = 'Address is required';
    }
    
    if (!newDeliveryAddress.city) {
      errors.city = 'City is required';
    }
    
    if (!newDeliveryAddress.postCode) {
      errors.postCode = 'Postcode is required';
    }
    
    setDeliveryErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAddDeliveryAddress = () => {
    if (validateDeliveryAddress()) {
      addDeliveryAddress(newDeliveryAddress);
      resetDeliveryForm();
    }
  };

  const resetDeliveryForm = () => {
    setNewDeliveryAddress({
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postCode: '',
      instructions: '',
      accessCode: '',
      isDefault: false,
    });
    setDeliveryQuery('');
    setDeliveryLocations([]);
    setDeliveryIsReadOnly(false);
    setShowAddAddress(false);
    setDeliveryErrors({});
  };
  
  // Validate on form data changes
  useEffect(() => {
    validateStep();
  }, [formData.addressLine1, formData.city, formData.country, formData.postCode]);
  
  const addressTemplate = (address, index) => {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{address.name}</p>
          <p className="text-sm text-gray-600">
            {address.addressLine1}, {address.city} {address.postCode}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {address.isDefault && (
            <Tag value="Default" severity="success" />
          )}
          <Button
            icon="pi pi-trash"
            className="p-button-text p-button-danger p-button-sm"
            onClick={() => removeDeliveryAddress(index)}
          />
        </div>
      </div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Address Information</h2>
        <p className="text-gray-600">Where is your customer located?</p>
      </div>
      
      {/* Billing Address */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
        
        <div className="space-y-4">
          {/* Address Search */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Search Address
            </label>
            <div className="relative">
              <div className="p-inputgroup flex-1">
                <InputText
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Start typing to search addresses..."
                  className="w-full"
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
            
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.addressLine1 || ''}
                onChange={(e) => updateFormData({ addressLine1: e.target.value })}
                className={`w-full ${errors.addressLine1 ? 'p-invalid' : ''}`}
                placeholder="Street address"
              />
              {errors.addressLine1 && (
                <small className="text-red-500">{errors.addressLine1}</small>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Address Line 2
              </label>
              <InputText
                value={formData.addressLine2 || ''}
                onChange={(e) => updateFormData({ addressLine2: e.target.value })}
                className="w-full"
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.city || ''}
                onChange={(e) => updateFormData({ city: e.target.value })}
                className={`w-full ${errors.city ? 'p-invalid' : ''}`}
                placeholder="City"
              />
              {errors.city && (
                <small className="text-red-500">{errors.city}</small>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                State/Province
              </label>
              <InputText
                value={formData.state || ''}
                onChange={(e) => updateFormData({ state: e.target.value })}
                className="w-full"
                placeholder="State or province"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Postcode <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.postCode || ''}
                onChange={(e) => updateFormData({ postCode: e.target.value })}
                className={`w-full ${errors.postCode ? 'p-invalid' : ''}`}
                placeholder="Postal code"
              />
              {errors.postCode && (
                <small className="text-red-500">{errors.postCode}</small>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.country || ''}
                onChange={(e) => updateFormData({ country: e.target.value })}
                className={`w-full ${errors.country ? 'p-invalid' : ''}`}
                placeholder="Country"
              />
              {errors.country && (
                <small className="text-red-500">{errors.country}</small>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Delivery Addresses */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Delivery Addresses</h3>
            <p className="text-sm text-gray-600">
              Add multiple delivery locations if different from billing
            </p>
          </div>
          <Button
            label="Add Location"
            icon="pi pi-plus"
            className="p-button-sm"
            onClick={() => setShowAddAddress(true)}
          />
        </div>
        
        {formData.deliveryAddresses && formData.deliveryAddresses.length > 0 ? (
          <DataTable value={formData.deliveryAddresses} className="p-datatable-sm">
            <Column field="name" header="Location Name" />
            <Column field="addressLine1" header="Address" />
            <Column field="city" header="City" />
            <Column field="postCode" header="Postcode" />
            <Column body={addressTemplate} style={{ width: '150px' }} />
          </DataTable>
        ) : (
          <Message 
            severity="info" 
            text="No additional delivery addresses. Orders will use the billing address by default."
          />
        )}
      </Card>
      
      {/* Delivery Preferences */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Delivery Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              General Delivery Instructions
            </label>
            <InputTextarea
              value={formData.deliveryInstructions || ''}
              onChange={(e) => updateFormData({ deliveryInstructions: e.target.value })}
              rows={3}
              className="w-full"
              placeholder="Any special instructions for deliveries..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Access Codes
            </label>
            <InputText
              value={formData.accessCodes || ''}
              onChange={(e) => updateFormData({ accessCodes: e.target.value })}
              className="w-full"
              placeholder="Gate codes, building access, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred Delivery Times
            </label>
            <Chips
              value={formData.preferredDeliveryTimes || []}
              onChange={(e) => updateFormData({ preferredDeliveryTimes: e.value })}
              placeholder="Add time slots (e.g., 9AM-12PM)"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Press Enter after each time slot
            </p>
          </div>
        </div>
      </Card>
      
      {/* Add Delivery Address Dialog */}
      <Dialog
        header="Add Delivery Location"
        visible={showAddAddress}
        onHide={resetDeliveryForm}
        style={{ width: '600px' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Location Name <span className="text-red-500">*</span>
            </label>
            <InputText
              value={newDeliveryAddress.name}
              onChange={(e) => setNewDeliveryAddress({ ...newDeliveryAddress, name: e.target.value })}
              className={`w-full ${deliveryErrors.name ? 'p-invalid' : ''}`}
              placeholder="e.g., Warehouse, Event Venue"
            />
            {deliveryErrors.name && (
              <small className="text-red-500">{deliveryErrors.name}</small>
            )}
          </div>

          {/* Delivery Address Search */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Search Delivery Address
            </label>
            <div className="relative">
              <div className="p-inputgroup flex-1">
                <InputText
                  value={deliveryQuery}
                  onChange={(e) => setDeliveryQuery(e.target.value)}
                  placeholder="Start typing to search addresses..."
                  className="w-full"
                  disabled={deliveryIsReadOnly}
                />
                {deliveryIsReadOnly ? (
                  <Button
                    icon="pi pi-times"
                    className="p-button-danger"
                    onClick={clearDeliveryAddressSearch}
                    tooltip="Clear and search again"
                  />
                ) : (
                  deliverySearchLoading && (
                    <span className="p-inputgroup-addon">
                      <i className="pi pi-spin pi-spinner"></i>
                    </span>
                  )
                )}
              </div>
              
              {/* Delivery Suggestions dropdown */}
              {deliveryLocations.length > 0 && !deliveryIsReadOnly && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {deliveryLocations.map((location, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleDeliveryLocationSelect(location)}
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
          
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <InputText
                value={newDeliveryAddress.addressLine1}
                onChange={(e) => setNewDeliveryAddress({ ...newDeliveryAddress, addressLine1: e.target.value })}
                className={`w-full ${deliveryErrors.addressLine1 ? 'p-invalid' : ''}`}
                placeholder="Street address"
              />
              {deliveryErrors.addressLine1 && (
                <small className="text-red-500">{deliveryErrors.addressLine1}</small>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Address Line 2
              </label>
              <InputText
                value={newDeliveryAddress.addressLine2}
                onChange={(e) => setNewDeliveryAddress({ ...newDeliveryAddress, addressLine2: e.target.value })}
                className="w-full"
                placeholder="Apartment, suite, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <InputText
                value={newDeliveryAddress.city}
                onChange={(e) => setNewDeliveryAddress({ ...newDeliveryAddress, city: e.target.value })}
                className={`w-full ${deliveryErrors.city ? 'p-invalid' : ''}`}
                placeholder="City"
              />
              {deliveryErrors.city && (
                <small className="text-red-500">{deliveryErrors.city}</small>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Postcode <span className="text-red-500">*</span>
              </label>
              <InputText
                value={newDeliveryAddress.postCode}
                onChange={(e) => setNewDeliveryAddress({ ...newDeliveryAddress, postCode: e.target.value })}
                className={`w-full ${deliveryErrors.postCode ? 'p-invalid' : ''}`}
                placeholder="Postal code"
              />
              {deliveryErrors.postCode && (
                <small className="text-red-500">{deliveryErrors.postCode}</small>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Delivery Instructions
            </label>
            <InputTextarea
              value={newDeliveryAddress.instructions}
              onChange={(e) => setNewDeliveryAddress({ ...newDeliveryAddress, instructions: e.target.value })}
              rows={2}
              className="w-full"
              placeholder="Special instructions for this location"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Access Code
            </label>
            <InputText
              value={newDeliveryAddress.accessCode}
              onChange={(e) => setNewDeliveryAddress({ ...newDeliveryAddress, accessCode: e.target.value })}
              className="w-full"
              placeholder="Gate code, etc."
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button
            label="Cancel"
            className="p-button-text"
            onClick={resetDeliveryForm}
          />
          <Button
            label="Add Location"
            icon="pi pi-check"
            onClick={handleAddDeliveryAddress}
          />
        </div>
      </Dialog>
    </motion.div>
  );
}
