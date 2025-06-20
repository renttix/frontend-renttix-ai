"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { InputSwitch } from 'primereact/inputswitch';
import { formatDate, calculateDaysBetween } from '../../../../../utils/helper';


export default function OrderTimingStep() {
  const { state, updateFormData, setValidation } = useWizard();
  const { formData } = state;
  
  const [orderDate, setOrderDate] = useState(formData.orderDate ? new Date(formData.orderDate) : new Date());
  const [deliveryDate, setDeliveryDate] = useState(formData.deliveryDate ? new Date(formData.deliveryDate) : null);
  const [chargingStartDate, setChargingStartDate] = useState(formData.chargingStartDate ? new Date(formData.chargingStartDate) : null);
  const [useExpectedReturnDate, setUseExpectedReturnDate] = useState(formData.useExpectedReturnDate || false);
  const [expectedReturnDate, setExpectedReturnDate] = useState(formData.expectedReturnDate ? new Date(formData.expectedReturnDate) : null);
  const [errors, setErrors] = useState({});
  
  // Calculate rental duration
  const rentalDuration = chargingStartDate && expectedReturnDate && useExpectedReturnDate
    ? calculateDaysBetween(chargingStartDate, expectedReturnDate)
    : null;
  
  // Validate dates
  useEffect(() => {
    const newErrors = {};
    
    if (!deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    } else if (deliveryDate < orderDate) {
      newErrors.deliveryDate = 'Delivery date cannot be before order date';
    }
    
    if (!chargingStartDate) {
      newErrors.chargingStartDate = 'Charging start date is required';
    } else if (chargingStartDate && deliveryDate && chargingStartDate < deliveryDate) {
      newErrors.chargingStartDate = 'Charging start date cannot be before delivery date';
    }
    
    if (useExpectedReturnDate && !expectedReturnDate) {
      newErrors.expectedReturnDate = 'Expected return date is required when enabled';
    } else if (useExpectedReturnDate && expectedReturnDate && chargingStartDate && expectedReturnDate < chargingStartDate) {
      newErrors.expectedReturnDate = 'Return date cannot be before charging start date';
    }
    
    setErrors(newErrors);
    setValidation(2, newErrors);
  }, [orderDate, deliveryDate, chargingStartDate, expectedReturnDate, useExpectedReturnDate, setValidation]);
  
  const handleDateChange = (field, value) => {
    switch (field) {
      case 'orderDate':
        setOrderDate(value);
        updateFormData({ orderDate: value });
        break;
      case 'deliveryDate':
        setDeliveryDate(value);
        updateFormData({ deliveryDate: value });
        // Auto-set charging start date if not set
        if (!chargingStartDate && value) {
          setChargingStartDate(value);
          updateFormData({ chargingStartDate: value });
        }
        break;
      case 'chargingStartDate':
        setChargingStartDate(value);
        updateFormData({ chargingStartDate: value });
        break;
      case 'expectedReturnDate':
        setExpectedReturnDate(value);
        updateFormData({ expectedReturnDate: value });
        break;
    }
  };
  
  const handleUseExpectedReturnDateChange = (value) => {
    setUseExpectedReturnDate(value);
    updateFormData({ useExpectedReturnDate: value });
    if (!value) {
      // Clear expected return date if toggle is turned off
      setExpectedReturnDate(null);
      updateFormData({ expectedReturnDate: null });
    }
  };
  
  const suggestedDurations = [
    { label: '1 Day', days: 1 },
    { label: '1 Week', days: 7 },
    { label: '2 Weeks', days: 14 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
  ];
  
  const applySuggestedDuration = (days) => {
    if (chargingStartDate) {
      const newReturnDate = new Date(chargingStartDate);
      newReturnDate.setDate(newReturnDate.getDate() + days);
      setExpectedReturnDate(newReturnDate);
      updateFormData({ expectedReturnDate: newReturnDate });
      if (!useExpectedReturnDate) {
        setUseExpectedReturnDate(true);
        updateFormData({ useExpectedReturnDate: true });
      }
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
        <h2 className="text-2xl font-bold mb-2">When do you need it?</h2>
        <p className="text-gray-600">Set your order timeline and rental period.</p>
      </div>
      
      {/* Date Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Date <span className="text-red-500">*</span>
          </label>
          <Calendar
            value={orderDate}
            onChange={(e) => handleDateChange('orderDate', e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">When the order is placed</p>
        </div>
        
        {/* Delivery Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Date <span className="text-red-500">*</span>
          </label>
          <Calendar
            value={deliveryDate}
            onChange={(e) => handleDateChange('deliveryDate', e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
            minDate={orderDate}
          />
          {errors.deliveryDate && (
            <small className="text-red-500 block mt-1">{errors.deliveryDate}</small>
          )}
          <p className="text-xs text-gray-500 mt-1">When items will be delivered</p>
        </div>
        
        {/* Charging Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Charging Start Date <span className="text-red-500">*</span>
          </label>
          <Calendar
            value={chargingStartDate}
            onChange={(e) => handleDateChange('chargingStartDate', e.value)}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-full"
            minDate={deliveryDate || orderDate}
          />
          {errors.chargingStartDate && (
            <small className="text-red-500 block mt-1">{errors.chargingStartDate}</small>
          )}
          <p className="text-xs text-gray-500 mt-1">When rental charges begin</p>
        </div>
        
        {/* Expected Return Date Toggle and Field */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm font-medium text-gray-700">
              Set Expected Return Date
            </label>
            <InputSwitch
              checked={useExpectedReturnDate}
              onChange={(e) => handleUseExpectedReturnDateChange(e.value)}
            />
          </div>
          {useExpectedReturnDate && (
            <>
              <Calendar
                value={expectedReturnDate}
                onChange={(e) => handleDateChange('expectedReturnDate', e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                className="w-full"
                minDate={chargingStartDate || deliveryDate || orderDate}
              />
              {errors.expectedReturnDate && (
                <small className="text-red-500 block mt-1">{errors.expectedReturnDate}</small>
              )}
              <p className="text-xs text-gray-500 mt-1">When items are expected back</p>
            </>
          )}
        </div>
      </div>
      
      {/* Suggested Durations */}
      {chargingStartDate && (
        <Card title="Quick Duration Selection" className="mt-6">
          <div className="flex flex-wrap gap-2">
            {suggestedDurations.map((duration) => (
              <button
                key={duration.days}
                onClick={() => applySuggestedDuration(duration.days)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
              >
                {duration.label}
              </button>
            ))}
          </div>
        </Card>
      )}
      
      {/* Rental Duration Summary */}
      {rentalDuration !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Message 
            severity="info" 
            text={`Rental Duration: ${rentalDuration} day${rentalDuration !== 1 ? 's' : ''}`}
            className="w-full"
          />
        </motion.div>
      )}
      
      {/* Visual Timeline */}
      {deliveryDate && chargingStartDate && (
        <Card title="Order Timeline">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300"></div>
            
            <div className="space-y-6">
              {/* Order Date */}
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full -ml-2 z-10"></div>
                <div className="ml-6">
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-gray-500">{formatDate(orderDate)}</p>
                </div>
              </div>
              
              {/* Delivery Date */}
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full -ml-2 z-10"></div>
                <div className="ml-6">
                  <p className="font-medium">Delivery</p>
                  <p className="text-sm text-gray-500">{formatDate(deliveryDate)}</p>
                </div>
              </div>
              
              {/* Charging Start */}
              {chargingStartDate && chargingStartDate.getTime() !== deliveryDate.getTime() && (
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full -ml-2 z-10"></div>
                  <div className="ml-6">
                    <p className="font-medium">Charging Starts</p>
                    <p className="text-sm text-gray-500">{formatDate(chargingStartDate)}</p>
                  </div>
                </div>
              )}
              
              {/* Return Date */}
              {useExpectedReturnDate && expectedReturnDate && (
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full -ml-2 z-10"></div>
                  <div className="ml-6">
                    <p className="font-medium">Expected Return</p>
                    <p className="text-sm text-gray-500">{formatDate(expectedReturnDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}