"use client";
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { isValidEmail, isValidPostalCode } from '../../../../../utils/helper';
import RouteAssignmentDialog from '../components/RouteAssignmentDialog';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import LocationVerificationModal from '../components/LocationVerificationModal';
import { MapPin, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function DeliveryDetailsStep() {
  const { state, updateFormData, setValidation } = useWizard();
  const { formData } = state;
  
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [errors, setErrors] = useState({});
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [assignedRoute, setAssignedRoute] = useState(formData.assignedRoute || null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationVerified, setLocationVerified] = useState(formData.locationVerified || false);
  const [verifiedCoordinates, setVerifiedCoordinates] = useState(formData.deliveryCoordinates || null);
  
  const { token } = useSelector((state) => state?.authReducer);
  
  // Form fields
  const [deliveryData, setDeliveryData] = useState({
    deliveryPlaceName: formData.deliveryPlaceName || '',
    deliveryAddress1: formData.deliveryAddress1 || '',
    deliveryAddress2: formData.deliveryAddress2 || '',
    deliveryCity: formData.deliveryCity || '',
    deliveryCountry: formData.deliveryCountry || 'United States',
    deliveryPostcode: formData.deliveryPostcode || '',
    deliveryContactName: formData.deliveryContactName || '',
    deliveryContactEmail: formData.deliveryContactEmail || '',
    deliveryContactPhone: formData.deliveryContactPhone || '',
    instruction: formData.instruction || '', // This is delivery instructions in the original
    phoneNumber: formData.phoneNumber || '', // Site contact phone
    siteContact: formData.siteContact || '', // Site contact name
  });
  
  const countries = [
    { label: 'United States', value: 'United States' },
    { label: 'Canada', value: 'Canada' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    { label: 'Australia', value: 'Australia' },
  ];
  
  // Validate form
  useEffect(() => {
    const newErrors = {};
    
    if (!deliveryData.deliveryAddress1) {
      newErrors.deliveryAddress1 = 'Delivery address is required';
    }
    
    if (!deliveryData.deliveryCity) {
      newErrors.deliveryCity = 'City is required';
    }
    
    if (!deliveryData.deliveryPostcode) {
      newErrors.deliveryPostcode = 'Postal code is required';
    } else if (!isValidPostalCode(deliveryData.deliveryPostcode, deliveryData.deliveryCountry === 'Canada' ? 'CA' : 'US')) {
      newErrors.deliveryPostcode = 'Invalid postal code format';
    }
    
    if (deliveryData.deliveryContactEmail && !isValidEmail(deliveryData.deliveryContactEmail)) {
      newErrors.deliveryContactEmail = 'Invalid email format';
    }
    
    // Add location verification requirement
    if (!locationVerified) {
      newErrors.locationVerification = 'Please verify the delivery location on the map';
    }
    
    setErrors(newErrors);
    setValidation(3, newErrors);
  }, [deliveryData, locationVerified, setValidation]);
  
  const handleFieldChange = (field, value) => {
    const newData = { ...deliveryData, [field]: value };
    setDeliveryData(newData);
    updateFormData(newData);
  };
  
  const handleLocationConfirm = (locationData) => {
    setVerifiedCoordinates(locationData.coordinates);
    setLocationVerified(true);
    updateFormData({
      deliveryCoordinates: locationData.coordinates,
      verifiedAddress: locationData.verifiedAddress,
      locationVerified: true,
      geocodingMethod: locationData.geocodingMethod
    });
    setShowLocationModal(false);
  };
  
  // Check for route assignment when address is complete
  const checkRouteAssignment = () => {
    const hasCompleteAddress = deliveryData.deliveryAddress1 &&
                              deliveryData.deliveryCity &&
                              deliveryData.deliveryPostcode;
    
    if (hasCompleteAddress && !assignedRoute) {
      setShowRouteDialog(true);
    }
  };
  
  const handleRouteAssigned = (routeData) => {
    setAssignedRoute(routeData);
    updateFormData({ assignedRoute: routeData });
  };
  
  const handleSameAsBilling = (checked) => {
    setSameAsBilling(checked);
    if (checked && formData.customerDetails) {
      const billingData = {
        deliveryPlaceName: formData.billingPlaceName || formData.customerDetails.name?.name || '',
        deliveryAddress1: formData.address1 || formData.customerDetails.addressLine1 || '',
        deliveryAddress2: formData.address2 || formData.customerDetails.addressLine2 || '',
        deliveryCity: formData.city || formData.customerDetails.city || '',
        deliveryCountry: formData.country || formData.customerDetails.country || 'United States',
        deliveryPostcode: formData.postcode || formData.customerDetails.postCode || '',
        deliveryContactName: formData.customerDetails.name?.name || '',
        deliveryContactEmail: formData.customerDetails.email || '',
        deliveryContactPhone: formData.customerDetails.phoneNumber || '',
      };
      setDeliveryData({ ...deliveryData, ...billingData });
      updateFormData(billingData);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Where should we deliver?</h2>
        <p className="text-gray-600">Enter the delivery address and contact information.</p>
      </div>
      
      {/* Same as Billing Checkbox */}
      {formData.customerDetails && (
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
          <Checkbox
            inputId="sameAsBilling"
            checked={sameAsBilling}
            onChange={(e) => handleSameAsBilling(e.checked)}
          />
          <label htmlFor="sameAsBilling" className="cursor-pointer">
            Use customer's billing address for delivery
          </label>
        </div>
      )}
      
      {/* Delivery Address */}
      <Card title="Delivery Address">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Place Name
            </label>
            <InputText
              value={deliveryData.deliveryPlaceName}
              onChange={(e) => handleFieldChange('deliveryPlaceName', e.target.value)}
              className="w-full"
              placeholder="Company name or location name"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <InputText
              value={deliveryData.deliveryAddress1}
              onChange={(e) => handleFieldChange('deliveryAddress1', e.target.value)}
              className={`w-full ${errors.deliveryAddress1 ? 'p-invalid' : ''}`}
              placeholder="123 Main Street"
            />
            {errors.deliveryAddress1 && (
              <small className="text-red-500">{errors.deliveryAddress1}</small>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <InputText
              value={deliveryData.deliveryAddress2}
              onChange={(e) => handleFieldChange('deliveryAddress2', e.target.value)}
              className="w-full"
              placeholder="Apartment, suite, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <InputText
              value={deliveryData.deliveryCity}
              onChange={(e) => handleFieldChange('deliveryCity', e.target.value)}
              className={`w-full ${errors.deliveryCity ? 'p-invalid' : ''}`}
              placeholder="New York"
            />
            {errors.deliveryCity && (
              <small className="text-red-500">{errors.deliveryCity}</small>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={deliveryData.deliveryCountry}
              onChange={(e) => handleFieldChange('deliveryCountry', e.value)}
              options={countries}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <InputText
              value={deliveryData.deliveryPostcode}
              onChange={(e) => handleFieldChange('deliveryPostcode', e.target.value)}
              className={`w-full ${errors.deliveryPostcode ? 'p-invalid' : ''}`}
              placeholder="10001"
            />
            {errors.deliveryPostcode && (
              <small className="text-red-500">{errors.deliveryPostcode}</small>
            )}
          </div>
        </div>
        
        {/* Location Verification */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className={locationVerified ? 'text-green-600' : 'text-gray-400'} size={24} />
              <div>
                <h4 className="font-medium">
                  {locationVerified ? 'Location Verified' : 'Location Verification Required'}
                </h4>
                <p className="text-sm text-gray-600">
                  {locationVerified
                    ? 'Delivery location has been confirmed on the map'
                    : 'Please verify the delivery location on map for accurate routing'
                  }
                </p>
              </div>
            </div>
            <Button
              label={locationVerified ? 'Re-verify Location' : 'Verify Location'}
              icon={locationVerified ? 'pi pi-refresh' : 'pi pi-map-marker'}
              onClick={() => setShowLocationModal(true)}
              className={locationVerified ? 'p-button-success' : 'p-button-warning'}
              disabled={!deliveryData.deliveryAddress1 || !deliveryData.deliveryCity}
            />
          </div>
          {locationVerified && verifiedCoordinates && (
            <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>Coordinates: {verifiedCoordinates.lat.toFixed(6)}, {verifiedCoordinates.lng.toFixed(6)}</span>
            </div>
          )}
        </div>
      </Card>
      
      {/* Delivery Contact */}
      <Card title="Delivery Contact">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <InputText
              value={deliveryData.deliveryContactName}
              onChange={(e) => handleFieldChange('deliveryContactName', e.target.value)}
              className="w-full"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <InputText
              value={deliveryData.deliveryContactEmail}
              onChange={(e) => handleFieldChange('deliveryContactEmail', e.target.value)}
              className={`w-full ${errors.deliveryContactEmail ? 'p-invalid' : ''}`}
              placeholder="john@example.com"
            />
            {errors.deliveryContactEmail && (
              <small className="text-red-500">{errors.deliveryContactEmail}</small>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <InputText
              value={deliveryData.deliveryContactPhone}
              onChange={(e) => handleFieldChange('deliveryContactPhone', e.target.value)}
              className="w-full"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Contact Name
            </label>
            <InputText
              value={deliveryData.siteContact}
              onChange={(e) => handleFieldChange('siteContact', e.target.value)}
              className="w-full"
              placeholder="Site contact person"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Phone Number
            </label>
            <InputText
              value={deliveryData.phoneNumber}
              onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
              className="w-full"
              placeholder="Site phone number"
            />
          </div>
        </div>
      </Card>
      
      {/* Delivery Instructions */}
      <Card title="Delivery Instructions">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions
          </label>
          <InputTextarea
            value={deliveryData.instruction}
            onChange={(e) => handleFieldChange('instruction', e.target.value)}
            rows={4}
            className="w-full"
            placeholder="Gate code, specific delivery times, handling instructions, etc."
          />
          <p className="text-xs text-gray-500 mt-1">
            Any special instructions for the delivery driver
          </p>
        </div>
      </Card>
      
      {/* Route Assignment */}
      <Card title="Route Assignment">
        {assignedRoute ? (
          <div className="space-y-3">
            <Message
              severity="success"
              text={`This order has been assigned to route: ${assignedRoute.routeName}`}
            />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assigned Route</p>
                <p className="font-semibold">{assignedRoute.routeName}</p>
                {assignedRoute.isManualOverride && (
                  <Tag value="Manual Override" severity="warning" className="mt-1" />
                )}
              </div>
              <Button
                label="Change Route"
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => setShowRouteDialog(true)}
              />
            </div>
            {assignedRoute.overrideReason && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium">Override Reason:</p>
                <p className="text-sm text-gray-600">{assignedRoute.overrideReason}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <i className="pi pi-map text-4xl text-gray-400 mb-2"></i>
            <p className="text-gray-600 mb-3">No route assigned yet</p>
            <Button
              label="Check Route Assignment"
              icon="pi pi-search"
              onClick={checkRouteAssignment}
              disabled={!deliveryData.deliveryAddress1 || !deliveryData.deliveryCity || !deliveryData.deliveryPostcode}
            />
            {(!deliveryData.deliveryAddress1 || !deliveryData.deliveryCity || !deliveryData.deliveryPostcode) && (
              <p className="text-sm text-gray-500 mt-2">
                Complete the delivery address to check route assignment
              </p>
            )}
          </div>
        )}
      </Card>
      
      {/* Map Preview Placeholder */}
      <Card title="Delivery Location">
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <i className="pi pi-map-marker text-4xl text-gray-400 mb-2"></i>
            <p className="text-gray-500">Map preview would appear here</p>
            <p className="text-sm text-gray-400">Google Maps integration</p>
          </div>
        </div>
      </Card>
      
      {/* Route Assignment Dialog */}
      <RouteAssignmentDialog
        visible={showRouteDialog}
        onHide={() => setShowRouteDialog(false)}
        deliveryAddress={{
          address1: deliveryData.deliveryAddress1,
          address2: deliveryData.deliveryAddress2,
          city: deliveryData.deliveryCity,
          postcode: deliveryData.deliveryPostcode,
          country: deliveryData.deliveryCountry
        }}
        onRouteAssigned={handleRouteAssigned}
      />
      
      {/* Location Verification Modal */}
      <LocationVerificationModal
        visible={showLocationModal}
        onHide={() => setShowLocationModal(false)}
        address={`${deliveryData.deliveryAddress1} ${deliveryData.deliveryAddress2}, ${deliveryData.deliveryCity}, ${deliveryData.deliveryCountry}`}
        postcode={deliveryData.deliveryPostcode}
        countryCode={deliveryData.deliveryCountry === 'United Kingdom' ? 'GB' :
                     deliveryData.deliveryCountry === 'United States' ? 'US' :
                     deliveryData.deliveryCountry === 'Canada' ? 'CA' : 'AU'}
        onConfirm={handleLocationConfirm}
        token={token}
      />
    </motion.div>
  );
}