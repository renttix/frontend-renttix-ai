"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEnhancedWizard } from '../../context/EnhancedWizardContext';
import { useRouteEstimation } from '../../hooks/useRouteEstimation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Panel } from 'primereact/panel';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import { TabView, TabPanel } from 'primereact/tabview';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { useSelector } from 'react-redux';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import RouteEstimator from '../../components/RouteEstimator';
import RecurringDeliveryConfig from '../../components/RecurringDeliveryConfig';
import DeliveryMap from '../../components/DeliveryMap';
import { addressAPI, routeEstimationAPI } from '../../../../../services/apiService';

const DeliveryMagicStepEnhanced = () => {
  const { state, updateFormData, goToNextStep, goToPreviousStep } = useEnhancedWizard();
  const { formData, routeEstimationLoading } = state;
  const { user } = useSelector((state) => state?.authReducer);
  
  const [activeTab, setActiveTab] = useState(0);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [deliveryWindows, setDeliveryWindows] = useState([]);
  const [loadingWindows, setLoadingWindows] = useState(false);
  const [routeDetails, setRouteDetails] = useState(null);
  const [showDriverInstructions, setShowDriverInstructions] = useState(false);
  
  const mapRef = useRef(null);

  // Use route estimation hook
  const {
    estimateRoute,
    getDeliveryWindows,
    setupRecurringDelivery,
    optimizeRoute,
    loading: routeLoading,
    error: routeError,
  } = useRouteEstimation();

  // Fetch delivery windows when date changes
  useEffect(() => {
    if (formData.deliveryDate) {
      fetchDeliveryWindows();
    }
  }, [formData.deliveryDate]);

  // Estimate route when address changes
  useEffect(() => {
    if (formData.deliveryAddress1 && formData.deliveryPostcode) {
      handleRouteEstimation();
    }
  }, [formData.deliveryAddress1, formData.deliveryPostcode]);

  const fetchDeliveryWindows = async () => {
    setLoadingWindows(true);
    try {
      const windows = await getDeliveryWindows({
        date: formData.deliveryDate,
        vendorId: user?._id,
      });
      setDeliveryWindows(windows);
    } catch (error) {
      console.error('Error fetching delivery windows:', error);
    } finally {
      setLoadingWindows(false);
    }
  };

  const handleRouteEstimation = async () => {
    try {
      const estimation = await estimateRoute({
        origin: {
          address: `${formData.address1}, ${formData.city}, ${formData.postcode}`,
          coordinates: formData.billingCoordinates,
        },
        destination: {
          address: `${formData.deliveryAddress1}, ${formData.deliveryCity}, ${formData.deliveryPostcode}`,
          coordinates: formData.deliveryCoordinates,
        },
        deliveryDate: formData.deliveryDate,
        products: formData.products,
      });
      
      setRouteDetails(estimation);
      updateFormData({
        estimatedRouteCost: estimation.cost,
        deliveryWindow: estimation.estimatedWindow,
        suggestedRoute: estimation.suggestedRoute,
      });
    } catch (error) {
      console.error('Error estimating route:', error);
    }
  };

  const handleAddressSelect = async (address) => {
    updateFormData({
      deliveryPlaceName: address.name || '',
      deliveryAddress1: address.street || '',
      deliveryCity: address.city || '',
      deliveryPostcode: address.postcode || '',
      deliveryCountry: address.country || 'United Kingdom',
      deliveryCoordinates: address.coordinates,
      locationVerified: true,
    });
    
    setShowMap(true);
  };

  const handleRecurringSetup = (recurringConfig) => {
    updateFormData({
      recurringDelivery: recurringConfig,
    });
  };

  const validateStep = () => {
    const errors = [];
    
    if (!formData.deliveryAddress1) {
      errors.push('Delivery address is required');
    }
    if (!formData.deliveryPostcode) {
      errors.push('Delivery postcode is required');
    }
    if (!formData.deliveryContactName) {
      errors.push('Delivery contact name is required');
    }
    if (!formData.deliveryContactPhone) {
      errors.push('Delivery contact phone is required');
    }
    if (!formData.deliveryTime) {
      errors.push('Delivery time window is required');
    }
    
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep();
    if (errors.length === 0) {
      goToNextStep();
    } else {
      // Show validation errors
      console.error('Validation errors:', errors);
    }
  };

  const deliveryTimeOptions = [
    { label: '09:00 - 12:00', value: '09:00-12:00' },
    { label: '12:00 - 15:00', value: '12:00-15:00' },
    { label: '15:00 - 18:00', value: '15:00-18:00' },
    { label: 'All Day', value: 'all-day' },
    { label: 'Specific Time', value: 'specific' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="delivery-magic-step-enhanced"
    >
      <Card className="mb-4">
        <h2 className="text-2xl font-bold mb-4">
          <i className="pi pi-map-marker mr-2"></i>
          Delivery Magic
        </h2>
        <p className="text-gray-600 mb-6">
          Set up your delivery details with smart address lookup and route optimization
        </p>

        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Delivery Address" leftIcon="pi pi-home">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="field">
                  <label htmlFor="deliveryAddress" className="font-semibold">
                    Delivery Address *
                  </label>
                  <AddressAutocomplete
                    value={formData.deliveryAddress1}
                    onSelect={handleAddressSelect}
                    placeholder="Start typing address..."
                    className="w-full"
                  />
                  {formData.locationVerified && (
                    <small className="text-green-600">
                      <i className="pi pi-check-circle mr-1"></i>
                      Address verified
                    </small>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="deliveryAddress2" className="font-semibold">
                    Address Line 2
                  </label>
                  <InputText
                    id="deliveryAddress2"
                    value={formData.deliveryAddress2 || ''}
                    onChange={(e) => updateFormData({ deliveryAddress2: e.target.value })}
                    className="w-full"
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="field">
                    <label htmlFor="deliveryCity" className="font-semibold">
                      City *
                    </label>
                    <InputText
                      id="deliveryCity"
                      value={formData.deliveryCity || ''}
                      onChange={(e) => updateFormData({ deliveryCity: e.target.value })}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="deliveryPostcode" className="font-semibold">
                      Postcode *
                    </label>
                    <InputText
                      id="deliveryPostcode"
                      value={formData.deliveryPostcode || ''}
                      onChange={(e) => updateFormData({ deliveryPostcode: e.target.value })}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <Divider />

                <div className="field">
                  <label htmlFor="deliveryContactName" className="font-semibold">
                    Delivery Contact Name *
                  </label>
                  <InputText
                    id="deliveryContactName"
                    value={formData.deliveryContactName || ''}
                    onChange={(e) => updateFormData({ deliveryContactName: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="deliveryContactPhone" className="font-semibold">
                    Contact Phone *
                  </label>
                  <InputText
                    id="deliveryContactPhone"
                    value={formData.deliveryContactPhone || ''}
                    onChange={(e) => updateFormData({ deliveryContactPhone: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                {showMap && formData.deliveryCoordinates && (
                  <DeliveryMap
                    ref={mapRef}
                    origin={formData.billingCoordinates}
                    destination={formData.deliveryCoordinates}
                    height="300px"
                    showRoute={true}
                  />
                )}

                {routeDetails && (
                  <RouteEstimator
                    routeDetails={routeDetails}
                    loading={routeEstimationLoading}
                    onRefresh={handleRouteEstimation}
                  />
                )}
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Delivery Schedule" leftIcon="pi pi-calendar">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="field">
                  <label htmlFor="deliveryTime" className="font-semibold">
                    Delivery Time Window *
                  </label>
                  <Dropdown
                    id="deliveryTime"
                    value={formData.deliveryTime}
                    options={deliveryTimeOptions}
                    onChange={(e) => updateFormData({ deliveryTime: e.value })}
                    placeholder="Select time window"
                    className="w-full"
                  />
                </div>

                {formData.deliveryTime === 'specific' && (
                  <div className="field">
                    <label htmlFor="specificTime" className="font-semibold">
                      Specific Time
                    </label>
                    <Calendar
                      id="specificTime"
                      value={formData.specificDeliveryTime}
                      onChange={(e) => updateFormData({ specificDeliveryTime: e.value })}
                      timeOnly
                      hourFormat="24"
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {loadingWindows ? (
                <div className="text-center py-4">
                  <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                </div>
              ) : deliveryWindows.length > 0 && (
                <Panel header="Available Delivery Slots" toggleable>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {deliveryWindows.map((window, index) => (
                      <Button
                        key={index}
                        label={window.label}
                        severity={window.available ? 'secondary' : 'danger'}
                        outlined
                        disabled={!window.available}
                        onClick={() => updateFormData({ deliveryTime: window.value })}
                        className="w-full"
                      />
                    ))}
                  </div>
                </Panel>
              )}

              <RecurringDeliveryConfig
                value={formData.recurringDelivery}
                onChange={handleRecurringSetup}
                startDate={formData.deliveryDate}
              />
            </div>
          </TabPanel>

          <TabPanel header="Delivery Instructions" leftIcon="pi pi-info-circle">
            <div className="space-y-4">
              <div className="field">
                <label htmlFor="deliveryInstructions" className="font-semibold">
                  Customer Delivery Instructions
                </label>
                <InputTextarea
                  id="deliveryInstructions"
                  value={formData.deliveryInstructions || ''}
                  onChange={(e) => updateFormData({ deliveryInstructions: e.target.value })}
                  rows={4}
                  className="w-full"
                  placeholder="Any special instructions for delivery..."
                />
                <small className="text-gray-500">
                  These instructions will be visible to the customer
                </small>
              </div>

              <div className="field">
                <div className="flex items-center mb-2">
                  <Checkbox
                    inputId="showDriverInstructions"
                    checked={showDriverInstructions}
                    onChange={(e) => setShowDriverInstructions(e.checked)}
                  />
                  <label htmlFor="showDriverInstructions" className="ml-2 font-semibold">
                    Add Internal Driver Instructions
                  </label>
                </div>
                
                {showDriverInstructions && (
                  <div className="mt-2">
                    <InputTextarea
                      id="driverInstructions"
                      value={formData.driverInstructions || ''}
                      onChange={(e) => updateFormData({ driverInstructions: e.target.value })}
                      rows={4}
                      className="w-full"
                      placeholder="Internal notes for the driver (not visible to customer)..."
                    />
                    <small className="text-orange-600">
                      <i className="pi pi-lock mr-1"></i>
                      Internal use only - not visible to customer
                    </small>
                  </div>
                )}
              </div>

              <div className="field">
                <div className="flex items-center">
                  <Checkbox
                    inputId="requireSignature"
                    checked={formData.requireSignature}
                    onChange={(e) => updateFormData({ requireSignature: e.checked })}
                  />
                  <label htmlFor="requireSignature" className="ml-2">
                    Require signature on delivery
                  </label>
                </div>
              </div>

              <div className="field">
                <div className="flex items-center">
                  <Checkbox
                    inputId="photographDelivery"
                    checked={formData.photographDelivery}
                    onChange={(e) => updateFormData({ photographDelivery: e.checked })}
                  />
                  <label htmlFor="photographDelivery" className="ml-2">
                    Photograph delivery location
                  </label>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>

        <Divider />

        <div className="flex justify-between items-center mt-6">
          <Button
            label="Previous"
            icon="pi pi-arrow-left"
            onClick={goToPreviousStep}
            severity="secondary"
            outlined
          />
          
          <div className="flex items-center gap-4">
            {routeDetails && (
              <div className="text-right">
                <small className="text-gray-500">Estimated Delivery Cost</small>
                <div className="text-xl font-bold text-primary">
                  £{routeDetails.cost?.toFixed(2) || '0.00'}
                </div>
              </div>
            )}
            
            <Button
              label="Next: Confirm & Go"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={handleNext}
              disabled={routeEstimationLoading}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DeliveryMagicStepEnhanced;