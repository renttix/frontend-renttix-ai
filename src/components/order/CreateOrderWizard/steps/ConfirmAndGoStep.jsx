"use client";
import React, { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { formatDate, formatCurrency, calculateDaysBetween } from '../../../../../utils/helper';
import { useSelector } from 'react-redux';
import RouteAssignmentDisplay from '../components/RouteAssignmentDisplay';

export default function ConfirmAndGoStep() {
  const { state, setStep, updateFormData } = useWizard();
  const { formData, pricing, isLoading } = state;
  const { user } = useSelector((state) => state?.authReducer);
  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);
  const [quickActions, setQuickActions] = useState({
    sendEmail: formData.sendConfirmationEmail !== false,
    requireSignature: formData.requireSignature || false,
    addToRecurring: false
  });
  
  const rentalDuration = calculateDaysBetween(
    new Date(formData.chargingStartDate || formData.deliveryDate), 
    new Date(formData.expectedReturnDate)
  ) || 1;
  
  // Calculate pricing
  const calculatePricing = () => {
    if (!formData.products || formData.products.length === 0) {
      return { subtotal: 0, tax: 0, total: 0 };
    }
    
    const subtotal = formData.products.reduce((total, product) =>
      total + (product.quantity * product.dailyRate * rentalDuration), 0
    );
    const tax = subtotal * 0.20; // 20% VAT
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };
  
  const calculatedPricing = calculatePricing();
  
  const handleTermsChange = (checked) => {
    setTermsAccepted(checked);
    updateFormData({ termsAccepted: checked });
  };
  
  const handleQuickActionChange = (action, value) => {
    setQuickActions(prev => ({ ...prev, [action]: value }));
    if (action === 'sendEmail') {
      updateFormData({ sendConfirmationEmail: value });
    } else if (action === 'requireSignature') {
      updateFormData({ requireSignature: value });
    }
  };
  
  const EditButton = ({ step, label }) => (
    <Button
      label={label || "Edit"}
      icon="pi pi-pencil"
      className="p-button-text p-button-sm"
      onClick={() => setStep(step)}
    />
  );
  
  const isOrderValid = () => {
    return termsAccepted &&
           formData.customerId &&
           formData.products?.length > 0 &&
           formData.assignedRoute &&
           formData.paymentTerm &&
           formData.invoiceRunCode;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
        <p className="text-gray-600">Almost there! Review your order details and confirm</p>
      </div>
      
      {/* Order Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Order Summary for {formData.customerDetails?.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <i className="pi pi-calendar text-blue-600"></i>
              <span>{formatDate(formData.deliveryDate)} - {formatDate(formData.expectedReturnDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="pi pi-map-marker text-blue-600"></i>
              <span>{formData.deliveryCity}, {formData.deliveryPostcode}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="pi pi-truck text-blue-600"></i>
              <span>Route: {formData.assignedRoute?.name || 'Floating Task'}</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Products & Services */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Products & Services</h3>
          <EditButton step={2} />
        </div>
        
        <div className="space-y-3">
          {formData.products?.map((product) => (
            <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{product.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{product.quantity} × £{product.dailyRate}/day</span>
                    {product.maintenanceConfig && (
                      <>
                        <span>•</span>
                        <Tag 
                          value={`Maintenance: ${product.maintenanceConfig.frequency}`} 
                          severity="info" 
                          className="text-xs"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  £{(product.quantity * product.dailyRate * rentalDuration).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <Divider />
        
        {/* Single Pricing Display */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({rentalDuration} days):</span>
            <span>{formatCurrency(calculatedPricing.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">VAT (20%):</span>
            <span>{formatCurrency(calculatedPricing.tax)}</span>
          </div>
          <Divider />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span className="text-blue-600">{formatCurrency(calculatedPricing.total)}</span>
          </div>
        </div>
      </Card>
      
      {/* Delivery Details */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Delivery Details</h3>
          <EditButton step={3} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Delivery Address</p>
            <p className="font-medium">
              {formData.deliveryAddress1}
              {formData.deliveryAddress2 && `, ${formData.deliveryAddress2}`}
            </p>
            <p className="font-medium">
              {formData.deliveryCity}, {formData.deliveryPostcode}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Contact</p>
            <p className="font-medium">{formData.deliveryContactName}</p>
            <p className="text-sm">{formData.deliveryContactPhone}</p>
          </div>
        </div>
        
        {formData.deliveryInstructions && (
          <div className="mt-4 p-3 bg-yellow-50 rounded">
            <p className="text-sm font-medium text-yellow-800">Delivery Instructions:</p>
            <p className="text-sm text-yellow-700 mt-1">{formData.deliveryInstructions}</p>
          </div>
        )}
        
        <Divider />
        
        <RouteAssignmentDisplay
          assignedRoute={formData.assignedRoute}
          deliveryAddress={{
            address1: formData.deliveryAddress1,
            address2: formData.deliveryAddress2,
            city: formData.deliveryCity,
            postcode: formData.deliveryPostcode,
            country: formData.deliveryCountry
          }}
        />
      </Card>
      
      {/* Invoice & Payment Settings */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Invoice & Payment</h3>
          <EditButton step={1} label="Edit in Step 1" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Payment Terms</p>
            <p className="font-medium">
              {formData.paymentTerm ?
                (typeof formData.paymentTerm === 'object' ? formData.paymentTerm.name : 'Payment Term Set') :
                <span className="text-red-500">Not Set</span>
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Invoice Run Code</p>
            <p className="font-medium">
              {formData.invoiceRunCode ?
                (typeof formData.invoiceRunCode === 'object' ? formData.invoiceRunCode.name : 'Invoice Code Set') :
                <span className="text-red-500">Not Set</span>
              }
            </p>
          </div>
          {formData.billingPeriod && (
            <div>
              <p className="text-sm text-gray-600">Billing Period</p>
              <p className="font-medium capitalize">{formData.billingPeriod}</p>
            </div>
          )}
          {formData.purchaseOrderNumber && (
            <div>
              <p className="text-sm text-gray-600">PO Number</p>
              <p className="font-medium">{formData.purchaseOrderNumber}</p>
            </div>
          )}
        </div>
        
        {formData.invoiceInBatch && (
          <div className="mt-3 flex items-center gap-2">
            <Tag value="Batch Invoicing" severity="info" icon="pi pi-check" />
            <span className="text-sm text-gray-600">This order will be included in batch invoicing</span>
          </div>
        )}
        
        {formData.customerNotes && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-800">Customer Invoice Notes:</p>
            <p className="text-sm text-blue-700 mt-1">{formData.customerNotes}</p>
          </div>
        )}
      </Card>
      
      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <Checkbox
              inputId="sendEmail"
              checked={quickActions.sendEmail}
              onChange={(e) => handleQuickActionChange('sendEmail', e.checked)}
            />
            <label htmlFor="sendEmail" className="ml-2 cursor-pointer">
              Send confirmation email to customer
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              inputId="requireSignature"
              checked={quickActions.requireSignature}
              onChange={(e) => handleQuickActionChange('requireSignature', e.checked)}
            />
            <label htmlFor="requireSignature" className="ml-2 cursor-pointer">
              Require signature on delivery
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              inputId="addToRecurring"
              checked={quickActions.addToRecurring}
              onChange={(e) => handleQuickActionChange('addToRecurring', e.checked)}
            />
            <label htmlFor="addToRecurring" className="ml-2 cursor-pointer">
              Add to recurring orders
            </label>
          </div>
        </div>
      </Card>
      
      {/* Terms and Conditions */}
      <Card className={!termsAccepted ? 'border-2 border-red-200' : ''}>
        <div className="flex items-start gap-3">
          <Checkbox
            inputId="terms"
            checked={termsAccepted}
            onChange={(e) => handleTermsChange(e.checked)}
            className="mt-1"
          />
          <label htmlFor="terms" className="cursor-pointer flex-1">
            <span className="font-medium">I agree to the terms and conditions</span>
            <p className="text-sm text-gray-600 mt-1">
              By creating this order, I confirm that all information is correct and I accept the rental terms and conditions.
            </p>
          </label>
        </div>
      </Card>
      
      {!termsAccepted && (
        <Message severity="warn" text="Please accept the terms and conditions to continue" />
      )}
      
      {(!formData.paymentTerm || !formData.invoiceRunCode) && (
        <Message
          severity="error"
          text="Missing required invoice settings. Please go back to Step 1 to set Payment Terms and Invoice Run Code."
        />
      )}
      
      {/* Post-Submit Actions Preview */}
      <Card className="bg-green-50">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <i className="pi pi-bolt text-green-600"></i>
          After Creating This Order:
        </h4>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <i className="pi pi-check text-green-600"></i>
            View order details and track status
          </li>
          <li className="flex items-center gap-2">
            <i className="pi pi-check text-green-600"></i>
            Print delivery note for driver
          </li>
          <li className="flex items-center gap-2">
            <i className="pi pi-check text-green-600"></i>
            Create similar order with one click
          </li>
          {quickActions.sendEmail && (
            <li className="flex items-center gap-2">
              <i className="pi pi-check text-green-600"></i>
              Confirmation email will be sent to {formData.customerDetails?.email}
            </li>
          )}
        </ul>
      </Card>
      
      {/* Navigation */}
      {/* <div className="flex justify-between items-center">
        <Button
          label="Back"
          icon="pi pi-arrow-left"
          className="p-button-text"
          onClick={() => setStep(3)}
        />
        
        <div className="flex gap-2">
          <Button
            label="Save Draft"
            icon="pi pi-save"
            className="p-button-outlined"
            onClick={() => {
              // Save draft logic
              alert('Draft saved!');
            }}
          />
          <Button
            label={isLoading ? "Creating Order..." : "Create Order"}
            icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-check"}
            iconPos="right"
            className="p-button-success"
            disabled={!isOrderValid() || isLoading}
            loading={isLoading}
            onClick={() => {
              // Trigger the order submission through a custom event
              const submitEvent = new CustomEvent('submitOrder', {
                detail: { formData }
              });
              window.dispatchEvent(submitEvent);
            }}
          />
        </div>
      </div> */}
    </motion.div>
  );
}
