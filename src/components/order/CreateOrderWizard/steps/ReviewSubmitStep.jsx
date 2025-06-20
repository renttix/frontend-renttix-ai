"use client";
import React, { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { formatDate, formatCurrency, calculateDaysBetween } from '../../../../../utils/helper';
import { useSelector } from 'react-redux';
import RouteAssignmentDisplay from '../components/RouteAssignmentDisplay';

export default function ReviewSubmitStep() {
  const { state, setStep, updateFormData } = useWizard();
  const { formData, pricing } = state;
  const { user } = useSelector((state) => state?.authReducer);
  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);
  
  const rentalDuration = calculateDaysBetween(formData.chargingStartDate, formData.expectedReturnDate) || 1;
  
  // Calculate pricing based on products
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
  
  const EditButton = ({ step, label }) => (
    <Button
      label={label}
      icon="pi pi-pencil"
      className="p-button-text p-button-sm"
      onClick={() => setStep(step)}
    />
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Your Order</h2>
        <p className="text-gray-600">Please review all details before submitting your order.</p>
      </div>
      
      {/* Customer Information */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Customer Information</h3>
          <EditButton step={1} label="Edit" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Customer Name</p>
            <p className="font-medium">{formData.customerDetails?.name?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{formData.customerDetails?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Terms</p>
            <p className="font-medium">{formData.customerDetails?.paymentTerm?.name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer ID</p>
            <p className="font-medium">{formData.customerId}</p>
          </div>
        </div>
      </Card>
      
      {/* Order Timeline */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Order Timeline</h3>
          <EditButton step={2} label="Edit" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-medium">{formatDate(formData.orderDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Delivery Date</p>
            <p className="font-medium">{formatDate(formData.deliveryDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Charging Start Date</p>
            <p className="font-medium">{formatDate(formData.chargingStartDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expected Return Date</p>
            <p className="font-medium">{formatDate(formData.expectedReturnDate)}</p>
          </div>
        </div>
        {rentalDuration && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Total Rental Duration:</span> {rentalDuration} days
            </p>
          </div>
        )}
      </Card>
      
      {/* Delivery Information */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Delivery Information</h3>
          <EditButton step={4} label="Edit" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">Delivery Address</p>
            <p className="font-medium">
              {formData.deliveryAddress1}
              {formData.deliveryAddress2 && `, ${formData.deliveryAddress2}`}
            </p>
            <p className="font-medium">
              {[formData.deliveryCity, formData.deliveryCountry, formData.deliveryPostcode]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
          {formData.deliveryContactName && (
            <div>
              <p className="text-sm text-gray-600">Contact Name</p>
              <p className="font-medium">{formData.deliveryContactName}</p>
            </div>
          )}
          {formData.deliveryContactPhone && (
            <div>
              <p className="text-sm text-gray-600">Contact Phone</p>
              <p className="font-medium">{formData.deliveryContactPhone}</p>
            </div>
          )}
        </div>
        {formData.deliveryInstructions && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Delivery Instructions</p>
            <p className="text-sm mt-1">{formData.deliveryInstructions}</p>
          </div>
        )}
      </Card>
      
      {/* Order Settings */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Order Settings</h3>
          <EditButton step={5} label="Edit" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.depot && (
            <div>
              <p className="text-sm text-gray-600">Depot</p>
              <p className="font-medium">Depot Selected</p>
            </div>
          )}
          {formData.purchaseOrderNumber && (
            <div>
              <p className="text-sm text-gray-600">PO Number</p>
              <p className="font-medium">{formData.purchaseOrderNumber}</p>
            </div>
          )}
          {formData.reference && (
            <div>
              <p className="text-sm text-gray-600">Reference</p>
              <p className="font-medium">{formData.reference}</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {formData.requireSignature && (
            <Tag value="Signature Required" severity="warning" />
          )}
          {formData.sendConfirmationEmail && (
            <Tag value="Email Confirmation" severity="info" />
          )}
        </div>
        
        {/* Route Assignment Display */}
        <div className="mt-4 pt-4 border-top-1 surface-border">
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
        </div>
      </Card>
      
      {/* Products */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Products</h3>
          <EditButton step={3} label="Edit" />
        </div>
        {formData.products && formData.products.length > 0 ? (
          <div className="space-y-3">
            {formData.products.map((product) => (
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
                    <p className="text-sm text-gray-600">
                      SKU: {product.sku} | {product.category}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.quantity} × £{product.dailyRate.toFixed(2)}/day
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    £{(product.quantity * product.dailyRate * rentalDuration).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {rentalDuration} day{rentalDuration !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Products Total:</span>
                <span className="text-lg font-semibold">
                  £{formData.products.reduce((total, p) =>
                    total + (p.quantity * p.dailyRate * rentalDuration), 0
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="pi pi-box text-4xl mb-2"></i>
            <p>No products selected</p>
          </div>
        )}
      </Card>
      
      {/* Pricing Summary */}
      <Card className="border-2 border-blue-200">
        <h3 className="text-lg font-semibold mb-4">Order Total</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(calculatedPricing.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (20%):</span>
            <span>{formatCurrency(calculatedPricing.tax)}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-blue-600">{formatCurrency(calculatedPricing.total)}</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Terms and Conditions */}
      <Card>
        <div className="flex items-center gap-3">
          <Checkbox
            inputId="terms"
            checked={termsAccepted}
            onChange={(e) => handleTermsChange(e.checked)}
          />
          <label htmlFor="terms" className="cursor-pointer">
            I agree to the terms and conditions and confirm that all information is correct
          </label>
        </div>
      </Card>
      
      {/* Submit Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <i className="pi pi-info-circle text-green-600 mt-1"></i>
          <div>
            <p className="font-medium text-green-800">Ready to Submit</p>
            <p className="text-sm text-green-700 mt-1">
              Please review all information carefully. Once submitted, the order will be processed
              and the customer will receive a confirmation email.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Note about missing terms acceptance */}
      {!termsAccepted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-500"
        >
          Please accept the terms and conditions to submit the order
        </motion.div>
      )}
    </motion.div>
  );
}