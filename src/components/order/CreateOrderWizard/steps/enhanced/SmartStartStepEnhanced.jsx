"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useEnhancedWizard } from '../../context/EnhancedWizardContext';
import { useCustomerIntelligence } from '../../hooks/useCustomerIntelligence';
import { motion, AnimatePresence } from 'framer-motion';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Chip } from 'primereact/chip';
import { Skeleton } from 'primereact/skeleton';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BaseURL } from '../../../../../../utils/baseUrl';
import CustomerTypeBadge from '../../components/CustomerTypeBadge';

const SmartStartStepEnhanced = () => {
  const { 
    state, 
    updateFormData, 
    fetchCustomerIntelligence,
    setSuggestions 
  } = useEnhancedWizard();
  const { formData, customerIntelligenceLoading } = state;
  const { user, token } = useSelector((state) => state?.authReducer);
  
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showAutofillMessage, setShowAutofillMessage] = useState(false);
  const [durationOptions] = useState([
    { label: '1 Day', value: 1 },
    { label: '1 Week', value: 7 },
    { label: '2 Weeks', value: 14 },
    { label: '1 Month', value: 30 },
    { label: '3 Months', value: 90 },
    { label: '6 Months', value: 180 },
    { label: '1 Year', value: 365 },
    { label: 'Custom', value: 'custom' },
  ]);

  // Use customer intelligence hook
  const {
    data: customerIntelligence,
    loading: intelligenceLoading,
    getAutofillData,
    getCustomerType,
    getSuggestedDuration,
    detectRepeatCustomer,
  } = useCustomerIntelligence(formData.customerId);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle customer intelligence data
  useEffect(() => {
    if (customerIntelligence && formData.customerId) {
      // Update customer type
      updateFormData({
        customerType: getCustomerType(),
        customerIntelligence: customerIntelligence,
      });

      // Show autofill message for repeat customers
      if (detectRepeatCustomer()) {
        setShowAutofillMessage(true);
        setTimeout(() => setShowAutofillMessage(false), 5000);
      }

      // Set suggested duration
      const suggestedDuration = getSuggestedDuration();
      if (suggestedDuration) {
        setSuggestions({ duration: suggestedDuration });
      }
    }
  }, [customerIntelligence, formData.customerId]);

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await axios.get(
        `${BaseURL}/order/customer?vendorId=${user?._id}&limit=1000`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleCustomerChange = async (customerId) => {
    const selectedCustomer = customers.find(c => c._id === customerId);
    
    updateFormData({
      customerId,
      customerDetails: selectedCustomer,
      account: selectedCustomer?.account || '',
      email: selectedCustomer?.email || '',
      cunstomerQuickbookId: selectedCustomer?.cunstomerQuickbookId || '',
      billingPlaceName: selectedCustomer?.placeName || '',
      address1: selectedCustomer?.address1 || '',
      address2: selectedCustomer?.address2 || '',
      city: selectedCustomer?.city || '',
      country: selectedCustomer?.country || '',
      postcode: selectedCustomer?.postcode || '',
    });

    // Fetch customer intelligence
    if (customerId) {
      await fetchCustomerIntelligence(customerId);
    }
  };

  const handleAutofill = () => {
    const autofillData = getAutofillData();
    if (autofillData) {
      updateFormData(autofillData);
      setShowAutofillMessage(false);
    }
  };

  const handleDurationChange = (value) => {
    if (value === 'custom') {
      updateFormData({ 
        rentalDuration: null,
        useExpectedReturnDate: true 
      });
    } else {
      updateFormData({ 
        rentalDuration: value,
        useExpectedReturnDate: false 
      });
      
      // Calculate expected return date
      if (formData.deliveryDate) {
        const deliveryDate = new Date(formData.deliveryDate);
        deliveryDate.setDate(deliveryDate.getDate() + value);
        updateFormData({ 
          expectedReturnDate: deliveryDate.toISOString().split('T')[0] 
        });
      }
    }
  };

  const calculateChargingStartDate = (deliveryDate) => {
    if (!deliveryDate) return '';
    const date = new Date(deliveryDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const customerOptionTemplate = (option) => {
    return (
      <div className="flex align-items-center justify-content-between">
        <div>
          <div className="font-semibold">{option.account}</div>
          <div className="text-sm text-500">{option.placeName}</div>
        </div>
        {option.customerType && (
          <CustomerTypeBadge type={option.customerType} />
        )}
      </div>
    );
  };

  const selectedCustomerTemplate = (option) => {
    if (!option) return <span>Select a customer...</span>;
    return (
      <div className="flex align-items-center gap-2">
        <span>{option.account}</span>
        {formData.customerType && (
          <CustomerTypeBadge type={formData.customerType} />
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid">
        {/* Customer Selection Section */}
        <div className="col-12">
          <Card className="mb-3">
            <h3 className="text-xl font-semibold mb-3">Customer Selection</h3>
            
            {/* Autofill Message */}
            <AnimatePresence>
              {showAutofillMessage && detectRepeatCustomer() && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <Message 
                    severity="info" 
                    text="Repeat customer detected! Click to autofill from last order."
                    className="w-full"
                    content={
                      <div className="flex align-items-center justify-content-between w-full">
                        <span>Repeat customer detected! Click to autofill from last order.</span>
                        <Button 
                          label="Autofill" 
                          size="small" 
                          className="ml-2"
                          onClick={handleAutofill}
                        />
                      </div>
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="field">
                  <label htmlFor="customer" className="font-semibold">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  {loadingCustomers ? (
                    <Skeleton height="3rem" />
                  ) : (
                    <Dropdown
                      id="customer"
                      value={formData.customerId}
                      options={customers}
                      onChange={(e) => handleCustomerChange(e.value)}
                      optionLabel="account"
                      optionValue="_id"
                      filter
                      showClear
                      filterPlaceholder="Search customers..."
                      placeholder="Select a customer"
                      className="w-full"
                      itemTemplate={customerOptionTemplate}
                      valueTemplate={selectedCustomerTemplate}
                    />
                  )}
                </div>
              </div>

              {/* Customer Intelligence Loading */}
              {(customerIntelligenceLoading || intelligenceLoading) && (
                <div className="col-12 md:col-6">
                  <div className="flex align-items-center gap-2 mt-4">
                    <ProgressSpinner 
                      style={{ width: '30px', height: '30px' }} 
                      strokeWidth="4" 
                    />
                    <span className="text-500">Analyzing customer data...</span>
                  </div>
                </div>
              )}

              {/* Customer Details */}
              {formData.customerDetails && (
                <>
                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label className="font-semibold">Email</label>
                      <InputText 
                        value={formData.email} 
                        disabled 
                        className="w-full" 
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="field">
                      <label className="font-semibold">Billing Address</label>
                      <div className="surface-100 border-round p-3">
                        <div>{formData.billingPlaceName}</div>
                        <div className="text-500 text-sm mt-1">
                          {formData.address1}
                          {formData.address2 && `, ${formData.address2}`}
                          {formData.city && `, ${formData.city}`}
                          {formData.postcode && ` ${formData.postcode}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Order Timing Section */}
        <div className="col-12">
          <Card>
            <h3 className="text-xl font-semibold mb-3">Order Timing</h3>
            
            <div className="grid">
              <div className="col-12 md:col-4">
                <div className="field">
                  <label htmlFor="orderDate" className="font-semibold">
                    Order Date <span className="text-red-500">*</span>
                  </label>
                  <Calendar
                    id="orderDate"
                    value={new Date(formData.orderDate)}
                    onChange={(e) => updateFormData({ orderDate: e.value.toISOString().split('T')[0] })}
                    dateFormat="dd/mm/yy"
                    className="w-full"
                    showIcon
                  />
                </div>
              </div>

              <div className="col-12 md:col-4">
                <div className="field">
                  <label htmlFor="deliveryDate" className="font-semibold">
                    Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <Calendar
                    id="deliveryDate"
                    value={formData.deliveryDate ? new Date(formData.deliveryDate) : null}
                    onChange={(e) => {
                      const deliveryDate = e.value.toISOString().split('T')[0];
                      updateFormData({ 
                        deliveryDate,
                        chargingStartDate: calculateChargingStartDate(deliveryDate)
                      });
                    }}
                    dateFormat="dd/mm/yy"
                    className="w-full"
                    showIcon
                    minDate={new Date(formData.orderDate)}
                  />
                </div>
              </div>

              <div className="col-12 md:col-4">
                <div className="field">
                  <label htmlFor="deliveryTime" className="font-semibold">
                    Delivery Time
                  </label>
                  <Dropdown
                    id="deliveryTime"
                    value={formData.deliveryTime}
                    options={[
                      { label: 'Morning (9:00 AM)', value: '09:00' },
                      { label: 'Midday (12:00 PM)', value: '12:00' },
                      { label: 'Afternoon (3:00 PM)', value: '15:00' },
                      { label: 'Evening (6:00 PM)', value: '18:00' },
                    ]}
                    onChange={(e) => updateFormData({ deliveryTime: e.value })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Rental Duration */}
              <div className="col-12">
                <div className="field">
                  <label className="font-semibold mb-2">Rental Duration</label>
                  
                  {/* Open-ended rental option */}
                  <div className="flex align-items-center mb-3">
                    <Checkbox
                      inputId="openEnded"
                      checked={formData.isOpenEnded}
                      onChange={(e) => updateFormData({ isOpenEnded: e.checked })}
                    />
                    <label htmlFor="openEnded" className="ml-2">
                      Open-ended rental (no fixed return date)
                    </label>
                  </div>

                  {!formData.isOpenEnded && (
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <Dropdown
                          value={formData.useExpectedReturnDate ? 'custom' : formData.rentalDuration}
                          options={durationOptions}
                          onChange={(e) => handleDurationChange(e.value)}
                          className="w-full"
                          placeholder="Select duration"
                        />
                        {state.suggestions.duration && (
                          <div className="mt-2">
                            <Chip 
                              label={`Suggested: ${state.suggestions.duration} days`}
                              icon="pi pi-lightbulb"
                              className="bg-orange-100 text-orange-800"
                            />
                          </div>
                        )}
                      </div>

                      {formData.useExpectedReturnDate && (
                        <div className="col-12 md:col-6">
                          <Calendar
                            value={formData.expectedReturnDate ? new Date(formData.expectedReturnDate) : null}
                            onChange={(e) => updateFormData({ 
                              expectedReturnDate: e.value.toISOString().split('T')[0] 
                            })}
                            dateFormat="dd/mm/yy"
                            className="w-full"
                            showIcon
                            minDate={formData.deliveryDate ? new Date(formData.deliveryDate) : new Date()}
                            placeholder="Select return date"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Charging Start Date */}
              <div className="col-12 md:col-6">
                <div className="field">
                  <label htmlFor="chargingStartDate" className="font-semibold">
                    Charging Start Date
                  </label>
                  <Calendar
                    id="chargingStartDate"
                    value={formData.chargingStartDate ? new Date(formData.chargingStartDate) : null}
                    onChange={(e) => updateFormData({ 
                      chargingStartDate: e.value.toISOString().split('T')[0] 
                    })}
                    dateFormat="dd/mm/yy"
                    className="w-full"
                    showIcon
                    minDate={formData.deliveryDate ? new Date(formData.deliveryDate) : new Date()}
                  />
                  <small className="text-500">
                    Default: Day after delivery
                  </small>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(SmartStartStepEnhanced);