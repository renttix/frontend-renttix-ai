"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useWizard } from '../../context/WizardContext';
import { motion } from 'framer-motion';
import { Panel } from 'primereact/panel';
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
import { Skeleton } from 'primereact/skeleton';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Fieldset } from 'primereact/fieldset';
import { Chip } from 'primereact/chip';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import axios from 'axios';
import { BaseURL } from '../../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import { formatDate } from '../../../../../../utils/helper';

// Helper function to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Loading skeleton component
const CustomerSkeleton = () => (
  <div className="space-y-4">
    <Skeleton width="100%" height="3rem" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Skeleton width="100%" height="5rem" />
      <Skeleton width="100%" height="5rem" />
      <Skeleton width="100%" height="5rem" />
    </div>
  </div>
);

export default function EnhancedSmartStartStep() {
  const { state, updateFormData, completeStep, setValidation } = useWizard();
  const { formData } = state;
  const { token, user } = useSelector((state) => state?.authReducer);
  
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeAccordion, setActiveAccordion] = useState([0, 1]); // Both sections open by default
  
  // Invoice settings state
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [invoiceRunCodes, setInvoiceRunCodes] = useState([]);
  const [loadingInvoiceData, setLoadingInvoiceData] = useState(true);
  
  // Duration presets with icons
  const durationPresets = [
    { label: '1 Day', value: 1, icon: 'pi-calendar' },
    { label: '3 Days', value: 3, icon: 'pi-calendar' },
    { label: '1 Week', value: 7, icon: 'pi-calendar-plus' },
    { label: '2 Weeks', value: 14, icon: 'pi-calendar-plus' },
    { label: '1 Month', value: 30, icon: 'pi-calendar-times' },
    { label: 'Custom', value: 'custom', icon: 'pi-cog' }
  ];
  
  // Billing periods
  const billingPeriods = [
    { label: 'Weekly', value: 'weekly', icon: 'pi-refresh' },
    { label: 'Fortnightly', value: 'fortnightly', icon: 'pi-refresh' },
    { label: 'Monthly', value: 'monthly', icon: 'pi-calendar' },
    { label: 'Quarterly', value: 'quarterly', icon: 'pi-calendar-plus' },
    { label: 'Annually', value: 'annually', icon: 'pi-calendar-times' }
  ];
  
  // Delivery time options with better structure
  const deliveryTimeSlots = {
    morning: [
      { label: '09:00 AM', value: '09:00', period: 'Morning' },
      { label: '10:00 AM', value: '10:00', period: 'Morning' },
      { label: '11:00 AM', value: '11:00', period: 'Morning' },
    ],
    afternoon: [
      { label: '12:00 PM', value: '12:00', period: 'Afternoon' },
      { label: '01:00 PM', value: '13:00', period: 'Afternoon' },
      { label: '02:00 PM', value: '14:00', period: 'Afternoon' },
      { label: '03:00 PM', value: '15:00', period: 'Afternoon' },
    ],
    evening: [
      { label: '04:00 PM', value: '16:00', period: 'Evening' },
      { label: '05:00 PM', value: '17:00', period: 'Evening' },
    ]
  };
  
  const allDeliveryTimes = [
    ...deliveryTimeSlots.morning,
    ...deliveryTimeSlots.afternoon,
    ...deliveryTimeSlots.evening
  ];
  
  // Fetch customers and invoice data
  useEffect(() => {
    fetchCustomers();
    fetchInvoiceSettings();
  }, []);
  
  const fetchInvoiceSettings = async () => {
    try {
      setLoadingInvoiceData(true);
      
      const [paymentTermsRes, invoiceRunCodesRes] = await Promise.all([
        axios.get(`${BaseURL}/payment-terms?vendorId=${user?._id}`, {
          headers: { authorization: `Bearer ${token}` }
        }),
        axios.get(`${BaseURL}/invoice-run-code?vendorId=${user?._id}`, {
          headers: { authorization: `Bearer ${token}` }
        })
      ]);
      
      if (paymentTermsRes.data.success) {
        setPaymentTerms(paymentTermsRes.data.data);
      }
      
      if (invoiceRunCodesRes.data.success) {
        setInvoiceRunCodes(invoiceRunCodesRes.data.data);
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
        // Get recent customers with better sorting
        const recent = response.data.data
          .filter(c => c.lastOrderDate)
          .sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate))
          .slice(0, 5);
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
      customer.account?.toLowerCase().includes(query) ||
      customer.phoneNumber?.includes(query)
    );
    setFilteredCustomers(filtered);
  };
  
  const selectCustomer = (customer) => {
    // Auto-fill all customer-related fields
    updateFormData({
      customerId: customer._id,
      customerDetails: customer,
      account: customer.account,
      email: customer.email,
      phoneNumber: customer.phoneNumber || '',
      billingPlaceName: customer.billingPlaceName || customer.name,
      // Delivery address auto-fill
      deliveryAddress1: customer.address1 || '',
      deliveryAddress2: customer.address2 || '',
      deliveryCity: customer.city || '',
      deliveryCountry: customer.country || '',
      deliveryPostcode: customer.postcode || '',
      // Payment settings auto-fill
      paymentTerm: customer.paymentTerm?._id || formData.paymentTerm || '',
      invoiceRunCode: customer.invoiceRunCode?._id || formData.invoiceRunCode || '',
      invoiceInBatch: customer.invoiceInBatch ?? formData.invoiceInBatch ?? false,
      billingPeriod: customer.billingPeriod || formData.billingPeriod || '',
      // Additional auto-fills
      purchaseOrderNumber: customer.defaultPONumber || '',
      customerNotes: customer.defaultNotes || ''
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
  
  const customerTemplate = (customer) => {
    if (!customer) return null;
    return (
      <div className="flex items-center gap-3 p-2">
        <Avatar 
          label={customer.name?.charAt(0).toUpperCase()} 
          size="normal" 
          shape="circle"
          style={{ backgroundColor: '#3b82f6', color: 'white' }}
        />
        <div className="flex-1">
          <div className="font-semibold">{customer.name}</div>
          <div className="text-sm text-gray-500">{customer.email}</div>
          {customer.account && (
            <Tag value={`Account: ${customer.account}`} severity="info" className="mt-1" />
          )}
        </div>
      </div>
    );
  };
  
  const timeSlotTemplate = (option) => {
    return (
      <div className="flex items-center justify-between p-2">
        <span>{option.label}</span>
        <Tag value={option.period} severity="info" />
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
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <i className="pi pi-sparkles text-primary"></i>
          Smart Start Setup
        </h2>
        <p className="text-gray-600">Let's quickly set up your order with intelligent defaults</p>
      </div>
      
      <Accordion multiple activeIndex={activeAccordion} onTabChange={(e) => setActiveAccordion(e.index)}>
        {/* Customer Selection Section */}
        <AccordionTab 
          header={
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <i className="pi pi-users"></i>
                Customer Selection
              </span>
              {formData.customerDetails && (
                <Chip 
                  label={formData.customerDetails.name} 
                  icon="pi pi-check" 
                  className="mr-2"
                />
              )}
            </div>
          }
        >
          {loading ? (
            <CustomerSkeleton />
          ) : (
            <div className="space-y-4">
              <div className="form-field">
                <label htmlFor="customer-search">
                  Search Customers
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <AutoComplete
                  id="customer-search"
                  value={formData.customerDetails}
                  suggestions={filteredCustomers}
                  completeMethod={searchCustomers}
                  field="name"
                  itemTemplate={customerTemplate}
                  selectedItemTemplate={customerTemplate}
                  onChange={(e) => selectCustomer(e.value)}
                  placeholder="Search by name, email, account, or phone..."
                  className={`w-full ${errors.customer ? 'p-invalid' : ''}`}
                  dropdown
                  forceSelection
                />
                {errors.customer && (
                  <small className="p-error">{errors.customer}</small>
                )}
              </div>
              
              {/* Recent Customers Grid */}
              {recentCustomers.length > 0 && !formData.customerId && (
                <Fieldset legend="Recent Customers" toggleable>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recentCustomers.map((customer) => (
                      <Card
                        key={customer._id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => selectCustomer(customer)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar 
                            label={customer.name?.charAt(0).toUpperCase()} 
                            size="large" 
                            shape="circle"
                            style={{ backgroundColor: '#3b82f6', color: 'white' }}
                          />
                          <div className="flex-1">
                            <h6 className="m-0 font-semibold">{customer.name}</h6>
                            <p className="text-sm text-gray-600 m-0 mt-1">{customer.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Tag 
                                value={`Last: ${formatDate(customer.lastOrderDate)}`} 
                                severity="info" 
                                className="text-xs"
                              />
                              {customer.orderCount && (
                                <Badge value={`${customer.orderCount} orders`} severity="success" />
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Fieldset>
              )}
              
              {/* Selected Customer Info */}
              {formData.customerDetails && (
                <Message 
                  severity="success" 
                  className="w-full"
                  content={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          label={formData.customerDetails.name?.charAt(0).toUpperCase()} 
                          size="large" 
                          shape="circle"
                          style={{ backgroundColor: '#10b981', color: 'white' }}
                        />
                        <div>
                          <p className="font-semibold m-0">{formData.customerDetails.name}</p>
                          <p className="text-sm m-0">{formData.customerDetails.email}</p>
                          {formData.customerDetails.phoneNumber && (
                            <p className="text-sm m-0">
                              <i className="pi pi-phone mr-1"></i>
                              {formData.customerDetails.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        icon="pi pi-times"
                        className="p-button-rounded p-button-text p-button-sm"
                        onClick={() => updateFormData({ 
                          customerId: '', 
                          customerDetails: null,
                          email: '',
                          account: '',
                          deliveryAddress1: '',
                          deliveryAddress2: '',
                          deliveryCity: '',
                          deliveryCountry: '',
                          deliveryPostcode: ''
                        })}
                      />
                    </div>
                  }
                />
              )}
            </div>
          )}
        </AccordionTab>
        
        {/* Timeline & Duration Section */}
        <AccordionTab 
          header={
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <i className="pi pi-calendar"></i>
                Timeline & Duration
              </span>
              {formData.deliveryDate && formData.expectedReturnDate && (
                <Chip 
                  label={`${Math.ceil((new Date(formData.expectedReturnDate) - new Date(formData.deliveryDate)) / (1000 * 60 * 60 * 24))} days`}
                  icon="pi pi-clock" 
                  className="mr-2"
                />
              )}
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Delivery Date */}
              <div className="form-field">
                <label htmlFor="delivery-date">
                  Delivery Date
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Calendar
                  id="delivery-date"
                  value={formData.deliveryDate ? new Date(formData.deliveryDate) : null}
                  onChange={(e) => handleDeliveryDateChange(e.value)}
                  minDate={new Date()}
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                  className={`w-full ${errors.deliveryDate ? 'p-invalid' : ''}`}
                  placeholder="Select delivery date"
                />
                {errors.deliveryDate && (
                  <small className="p-error">{errors.deliveryDate}</small>
                )}
              </div>
              
              {/* Delivery Time */}
              <div className="form-field">
                <label htmlFor="delivery-time">
                  Delivery Time
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Dropdown
                  id="delivery-time"
                  value={formData.deliveryTime}
                  options={allDeliveryTimes}
                  onChange={(e) => updateFormData({ deliveryTime: e.value })}
                  placeholder="Select time slot"
                  className={`w-full ${errors.deliveryTime ? 'p-invalid' : ''}`}
                  itemTemplate={timeSlotTemplate}
                  optionGroupLabel="label"
                  optionGroupChildren="items"
                />
                {errors.deliveryTime && (
                  <small className="p-error">{errors.deliveryTime}</small>
                )}
              </div>
            </div>
            
            {/* Duration Selection */}
            <div className="form-field">
              <label>
                Rental Duration
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {durationPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    label={preset.label}
                    icon={`pi ${preset.icon}`}
                    className={`p-button-sm ${
                      formData.rentalDuration === preset.value
                        ? ''
                        : 'p-button-outlined'
                    }`}
                    onClick={() => handleDurationChange(preset.value)}
                  />
                ))}
              </div>
              {errors.duration && (
                <small className="p-error">{errors.duration}</small>
              )}
            </div>
            
            {/* Custom Return Date */}
            {formData.rentalDuration === 'custom' && (
              <div className="form-field">
                <label htmlFor="return-date">
                  Return Date
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Calendar
                  id="return-date"
                  value={formData.expectedReturnDate ? new Date(formData.expectedReturnDate) : null}
                  onChange={(e) => updateFormData({ 
                    expectedReturnDate: e.value.toISOString().split('T')[0] 
                  })}
                  minDate={formData.deliveryDate ? new Date(formData.deliveryDate) : new Date()}
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                  className={`w-full ${errors.returnDate ? 'p-invalid' : ''}`}
                  placeholder="Select return date"
                />
                {errors.returnDate && (
                  <small className="p-error">{errors.returnDate}</small>
                )}
              </div>
            )}
            
            {/* Duration Summary */}
            {formData.deliveryDate && formData.expectedReturnDate && (
              <Message 
                severity="info" 
                icon="pi pi-info-circle"
                text={`Total rental period: ${
                  Math.ceil((new Date(formData.expectedReturnDate) - new Date(formData.deliveryDate)) / (1000 * 60 * 60 * 24))
                } days (${new Date(formData.deliveryDate).toLocaleDateString()} to ${new Date(formData.expectedReturnDate).toLocaleDateString()})`}
              />
            )}
          </div>
        </AccordionTab>
      </Accordion>
      
      {/* Invoice & Payment Settings - Always Visible */}
      <Panel 
        header={
          <div className="flex items-center gap-2">
            <i className="pi pi-credit-card"></i>
            <span>Invoice & Payment Settings</span>
            <Tag value="Required" severity="danger" />
          </div>
        }
        toggleable
      >
        {loadingInvoiceData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton height="3rem" />
              <Skeleton height="3rem" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton height="3rem" />
              <Skeleton height="3rem" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-field">
                <label htmlFor="payment-terms">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  id="payment-terms"
                  value={formData.paymentTerm || ''}
                  onChange={(e) => updateFormData({ paymentTerm: e.value })}
                  options={paymentTerms}
                  optionLabel="name"
                  optionValue="_id"
                  placeholder="Select payment terms"
                  className={`w-full ${errors.paymentTerm ? 'p-invalid' : ''}`}
                  showClear
                  filter
                />
                {errors.paymentTerm && (
                  <small className="p-error">{errors.paymentTerm}</small>
                )}
              </div>
              
              <div className="form-field">
                <label htmlFor="invoice-run-code">
                  Invoice Run Code <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  id="invoice-run-code"
                  value={formData.invoiceRunCode || ''}
                  onChange={(e) => updateFormData({ invoiceRunCode: e.value })}
                  options={invoiceRunCodes}
                  optionLabel="name"
                  optionValue="_id"
                  placeholder="Select invoice run code"
                  className={`w-full ${errors.invoiceRunCode ? 'p-invalid' : ''}`}
                  showClear
                  filter
                />
                {errors.invoiceRunCode && (
                  <small className="p-error">{errors.invoiceRunCode}</small>
                )}
              </div>
            </div>
            
            {/* Optional Fields */}
            <Divider align="left">
              <span className="text-sm text-gray-600">Optional Settings</span>
            </Divider>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-field">
                <label htmlFor="billing-period">Billing Period</label>
                <Dropdown
                  id="billing-period"
                  value={formData.billingPeriod || ''}
                  onChange={(e) => updateFormData({ billingPeriod: e.value })}
                  options={billingPeriods}
                  placeholder="Select billing period"
                  className="w-full"
                  showClear
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="po-number">Purchase Order Number</label>
                <InputText
                  id="po-number"
                  value={formData.purchaseOrderNumber || ''}
                  onChange={(e) => updateFormData({ purchaseOrderNumber: e.target.value })}
                  placeholder="Enter PO number"
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Batch Invoice Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="invoice-batch"
                checked={formData.invoiceInBatch || false}
                onChange={(e) => updateFormData({ invoiceInBatch: e.checked })}
              />
              <label htmlFor="invoice-batch" className="cursor-pointer">
                Include in batch invoicing
              </label>
            </div>
            
            {/* Customer Notes */}
            <div className="form-field">
              <label htmlFor="customer-notes">
                Customer Invoice Notes
                <Tag value="Visible on invoice" severity="info" className="ml-2" />
              </label>
              <InputTextarea
                id="customer-notes"
                value={formData.customerNotes || ''}
                onChange={(e) => updateFormData({ customerNotes: e.target.value })}
                rows={3}
                className="w-full"
                placeholder="Notes that will appear on the customer's invoice..."
                autoResize
              />
            </div>
          </div>
        )}
      </Panel>
    </motion.div>
  );
}