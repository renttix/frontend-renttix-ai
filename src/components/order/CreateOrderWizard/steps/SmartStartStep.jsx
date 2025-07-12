"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { Card } from 'primereact/card';
import { AutoComplete } from 'primereact/autocomplete';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import { formatDate } from '../../../../../utils/helper';
import { ContextualHelp } from '../components/ContextualHelp';
import { InputText } from 'primereact/inputtext';

// Helper function to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export default function SmartStartStep() {
  const { state, updateFormData, completeStep, setValidation } = useWizard();
  const { formData } = state;
  const { token, user } = useSelector((state) => state?.authReducer);
  
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Invoice settings state
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [invoiceRunCodes, setInvoiceRunCodes] = useState([]);
  const [loadingInvoiceData, setLoadingInvoiceData] = useState(true);
  
  // Duration presets
  const durationPresets = [
    { label: '1 Day', value: 1 },
    { label: '3 Days', value: 3 },
    { label: '1 Week', value: 7 },
    { label: '2 Weeks', value: 14 },
    { label: '1 Month', value: 30 },
    { label: 'Custom', value: 'custom' }
  ];
  
  // Billing periods
  const billingPeriods = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Fortnightly', value: 'fortnightly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Annually', value: 'annually' }
  ];
  
  // Delivery time options
  const deliveryTimes = [
    { label: '09:00 AM', value: '09:00' },
    { label: '10:00 AM', value: '10:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '01:00 PM', value: '13:00' },
    { label: '02:00 PM', value: '14:00' },
    { label: '03:00 PM', value: '15:00' },
    { label: '04:00 PM', value: '16:00' },
    { label: '05:00 PM', value: '17:00' }
  ];
  
  // Fetch customers and invoice data
  useEffect(() => {
    fetchCustomers();
    fetchInvoiceSettings();
  }, []);
  
  const fetchInvoiceSettings = async () => {
    try {
      setLoadingInvoiceData(true);
      
      // Fetch payment terms
      const paymentTermsResponse = await axios.get(
        `${BaseURL}/payment-terms?vendorId=${user?._id}`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      if (paymentTermsResponse.data.success) {
        setPaymentTerms(paymentTermsResponse.data.data);
      }
      
      // Fetch invoice run codes
      const invoiceRunCodesResponse = await axios.get(
        `${BaseURL}/invoice-run-code?vendorId=${user?._id}`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      if (invoiceRunCodesResponse.data.success) {
        setInvoiceRunCodes(invoiceRunCodesResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch invoice settings:', error);
    } finally {
      setLoadingInvoiceData(false);
    }
  };
  
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BaseURL}/customer?vendorId=${user._id}&limit=1000`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          }
        }
      );
      
      if (response.data?.data) {
        setCustomers(response.data.data);
        // Get recent customers (last 5 orders)
        const recent = response.data.data
          .filter(c => c.lastOrderDate)
          .sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate))
          .slice(0, 3);
        setRecentCustomers(recent);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const searchCustomers = (event) => {
    const query = event.query.toLowerCase();
    const filtered = customers.filter(customer => 
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.account?.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
  };
  
  const selectCustomer = (customer) => {
    updateFormData({
      customerId: customer._id,
      customerDetails: customer,
      account: customer.account,
      email: customer.email,
      billingPlaceName: customer.billingPlaceName || customer.name,
      address1: customer.address1 || '',
      address2: customer.address2 || '',
      city: customer.city || '',
      country: customer.country || '',
      postcode: customer.postcode || '',
      paymentTerm: customer.paymentTerm?._id || formData.paymentTerm || '',
      invoiceRunCode: customer.invoiceRunCode?._id || formData.invoiceRunCode || '',
      invoiceInBatch: customer.invoiceInBatch ?? formData.invoiceInBatch ?? false,
      billingPeriod: customer.billingPeriod || formData.billingPeriod || '',
      cunstomerQuickbookId: customer?.customerID || '',

    });
  };
  
  const handleDurationChange = (value) => {
    if (value === 'custom') {
      updateFormData({ 
        rentalDuration: value,
        useExpectedReturnDate: true 
      });
    } else {
      const deliveryDate = formData.deliveryDate || new Date();
      const returnDate = addDays(new Date(deliveryDate), value);
      updateFormData({
        rentalDuration: value,
        expectedReturnDate: returnDate.toISOString().split('T')[0],
        useExpectedReturnDate: true
      });
    }
  };
  
  const handleDeliveryDateChange = (date) => {
    updateFormData({
      deliveryDate: date.toISOString().split('T')[0],
      chargingStartDate: date.toISOString().split('T')[0],
    });
    
    // Update return date if duration is set
    if (formData.rentalDuration && formData.rentalDuration !== 'custom') {
      const returnDate = addDays(date, formData.rentalDuration);
      updateFormData({
        expectedReturnDate: returnDate.toISOString().split('T')[0]
      });
    }
  };
  
  const validateStep = () => {
    const newErrors = {};
    
    if (!formData.customerId) {
      newErrors.customer = 'Please select a customer';
    }
    
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Please select a delivery date';
    }
    
    if (!formData.deliveryTime) {
      newErrors.deliveryTime = 'Please select a delivery time';
    }
    
    if (!formData.rentalDuration) {
      newErrors.duration = 'Please select rental duration';
    }
    
    if (formData.rentalDuration === 'custom' && !formData.expectedReturnDate) {
      newErrors.returnDate = 'Please select a return date';
    }
    
    // Invoice validation
    if (!formData.paymentTerm) {
      newErrors.paymentTerm = 'Payment terms are required';
    }
    
    if (!formData.invoiceRunCode) {
      newErrors.invoiceRunCode = 'Invoice run code is required';
    }
    
    setErrors(newErrors);
    setValidation(1, newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  const handleContinue = () => {
    if (validateStep()) {
      completeStep(1);
    }
  };
  
  const customerTemplate = (customer) => {
    if (!customer) return null;
    return (
      <div className="flex items-center gap-2">
        <div>
          <div className="font-medium">{customer.name}</div>
          <div className="text-sm text-gray-500">{customer.email}</div>
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
        <h2 className="text-2xl font-bold mb-2">Let's Get Started</h2>
        <p className="text-gray-600">Select your customer and set up the rental timeline</p>
      </div>
      
      {/* Customer Selection */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">👤</span> Customer Quick Select
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Customers</label>
              <ContextualHelp fieldId="customerSearch">
                <AutoComplete
                  value={formData.customerDetails}
                  suggestions={filteredCustomers}
                  completeMethod={searchCustomers}
                  field="name"
                  itemTemplate={customerTemplate}
                  selectedItemTemplate={customerTemplate}
                  onChange={(e) => selectCustomer(e.value)}
                  placeholder="Search by name, email, or account..."
                  className="w-full customer-search"
                  dropdown
                />
              </ContextualHelp>
              {errors.customer && (
                <small className="text-red-500">{errors.customer}</small>
              )}
            </div>
            
            {/* Recent Customers */}
            {recentCustomers.length > 0 && !formData.customerId && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Recent Customers:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recentCustomers.map((customer) => (
                    <button
                      key={customer._id}
                      onClick={() => selectCustomer(customer)}
                      className="p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">
                        Last order: {formatDate(customer.lastOrderDate)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Selected Customer Info */}
            {formData.customerDetails && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{formData.customerDetails.name}</p>
                    <p className="text-sm text-gray-600">{formData.customerDetails.email}</p>
                    {formData.customerDetails.paymentTerm && (
                      <Tag value={formData.customerDetails.paymentTerm.name} severity="info" />
                    )}
                  </div>
                  <Button
                    icon="pi pi-times"
                    className="p-button-text p-button-sm"
                    onClick={() => updateFormData({ 
                      customerId: '', 
                      customerDetails: null,
                      email: '',
                      account: ''
                    })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* Smart Timeline */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">📅</span> Smart Timeline
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Date & Time */}
            <div>
              <label className="block text-sm font-medium mb-2">Delivery Date</label>
              <ContextualHelp fieldId="deliveryDate">
                <Calendar
                  value={formData.deliveryDate ? new Date(formData.deliveryDate) : null}
                  onChange={(e) => handleDeliveryDateChange(e.value)}
                  minDate={new Date()}
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-full delivery-date"
                  placeholder="Select delivery date"
                />
              </ContextualHelp>
              {errors.deliveryDate && (
                <small className="text-red-500">{errors.deliveryDate}</small>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Delivery Time</label>
              <Dropdown
                value={formData.deliveryTime}
                options={deliveryTimes}
                onChange={(e) => updateFormData({ deliveryTime: e.value })}
                placeholder="Select time"
                className="w-full"
              />
              {errors.deliveryTime && (
                <small className="text-red-500">{errors.deliveryTime}</small>
              )}
            </div>
          </div>
          
          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Rental Duration</label>
            <ContextualHelp fieldId="rentalDuration">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {durationPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    label={preset.label}
                    className={`p-button-sm ${
                      formData.rentalDuration === preset.value
                        ? 'p-button-primary'
                        : 'p-button-outlined'
                    }`}
                    onClick={() => handleDurationChange(preset.value)}
                  />
                ))}
              </div>
            </ContextualHelp>
            {errors.duration && (
              <small className="text-red-500">{errors.duration}</small>
            )}
          </div>
          
          {/* Return Date */}
          {formData.rentalDuration === 'custom' && (
            <div>
              <label className="block text-sm font-medium mb-2">Return Date</label>
              <Calendar
                value={formData.expectedReturnDate ? new Date(formData.expectedReturnDate) : null}
                onChange={(e) => updateFormData({ 
                  expectedReturnDate: e.value.toISOString().split('T')[0] 
                })}
                minDate={formData.deliveryDate ? new Date(formData.deliveryDate) : new Date()}
                dateFormat="dd/mm/yy"
                showIcon
                className="w-full"
                placeholder="Select return date"
              />
              {errors.returnDate && (
                <small className="text-red-500">{errors.returnDate}</small>
              )}
            </div>
          )}
          
          {/* Duration Summary */}
          {formData.deliveryDate && formData.expectedReturnDate && (
            <Message 
              severity="info" 
              text={`Total rental period: ${
                Math.ceil((new Date(formData.expectedReturnDate) - new Date(formData.deliveryDate)) / (1000 * 60 * 60 * 24))
              } days`}
            />
          )}
        </div>
      </Card>
      
      {/* Invoice & Payment Settings */}
      <Card>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <span className="text-2xl">💳</span> Invoice & Payment Settings
          <Tag value="Required" severity="danger" />
        </h3>
        
        {loadingInvoiceData ? (
          <div className="flex justify-center p-4">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Required Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-0">
              <div>
                <label className="block text-sm font-medium">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <ContextualHelp fieldId="paymentTerms">
                  <Dropdown
                    value={formData.paymentTerm || ''}
                    onChange={(e) => updateFormData({ paymentTerm: e.value })}
                    options={paymentTerms}
                    optionLabel="name"
                    optionValue="_id"
                    placeholder="Select payment terms"
                    className={`w-full payment-terms ${errors.paymentTerm ? 'p-invalid' : ''}`}
                    showClear
                  />
                </ContextualHelp>
                {errors.paymentTerm && (
                  <small className="text-red-500">{errors.paymentTerm}</small>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium ">
                  Invoice Run Code <span className="text-red-500">*</span>
                </label>
                <ContextualHelp fieldId="invoiceRunCode">
                  <Dropdown
                    value={formData.invoiceRunCode || ''}
                    onChange={(e) => updateFormData({ invoiceRunCode: e.value })}
                    options={invoiceRunCodes}
                    optionLabel="name"
                    optionValue="_id"
                    placeholder="Select invoice run code"
                    className={`w-full invoice-run-code ${errors.invoiceRunCode ? 'p-invalid' : ''}`}
                    showClear
                  />
                </ContextualHelp>
                {errors.invoiceRunCode && (
                  <small className="text-red-500">{errors.invoiceRunCode}</small>
                )}
              </div>
            </div>
            
            {/* Optional Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
              <div>
                <label className="block text-sm font-medium mb-2">Billing Period</label>
                <Dropdown
                  value={formData.billingPeriod || ''}
                  onChange={(e) => updateFormData({ billingPeriod: e.value })}
                  options={billingPeriods}
                  placeholder="Select billing period"
                  className="w-full"
                  showClear
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Purchase Order Number</label>
                <InputText
                  type="text"
                  value={formData.purchaseOrderNumber || ''}
                  onChange={(e) => updateFormData({ purchaseOrderNumber: e.target.value })}
                  className="w-full min-w-full  border rounded"
                  placeholder="Enter PO number"
                />
              </div>
            </div>
            
            {/* Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="invoiceInBatch"
                checked={formData.invoiceInBatch || false}
                onChange={(e) => updateFormData({ invoiceInBatch: e.checked })}
              />
              <label htmlFor="invoiceInBatch" className="cursor-pointer">
                Include in batch invoicing
              </label>
            </div>
            
            {/* Customer Invoice Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Customer Invoice Notes
              </label>
              <InputTextarea
                value={formData.customerNotes || ''}
                onChange={(e) => updateFormData({ customerNotes: e.target.value })}
                rows={3}
                className="w-full"
                placeholder="Notes visible to the customer on invoices..."
              />
            </div>
          </div>
        )}
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-end">
        {/* <Button
          label="Continue to Products"
          icon="pi pi-arrow-right"
          iconPos="right"
          onClick={handleContinue}
          disabled={loading}
        /> */}
      </div>
    </motion.div>
  );
}