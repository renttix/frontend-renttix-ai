"use client";
import React, { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../../../../utils/helper';

export default function OrderSummaryPanel() {
  const { state } = useWizard();
  const { formData, pricing } = state;
  
  // Calculate rental duration if dates are set
  const getRentalDuration = () => {
    if (formData.chargingStartDate && formData.expectedReturnDate) {
      const start = new Date(formData.chargingStartDate);
      const end = new Date(formData.expectedReturnDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return null;
  };
  
  const rentalDuration = getRentalDuration();
  
  // Calculate pricing based on products
  const calculatePricing = () => {
    if (!formData.products || formData.products.length === 0) {
      return { subtotal: 0, tax: 0, total: 0 };
    }
    
    const duration = rentalDuration || 1;
    const subtotal = formData.products.reduce((total, product) =>
      total + (product.quantity * product.dailyRate * duration), 0
    );
    const tax = subtotal * 0.20; // 20% VAT
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };
  
  const calculatedPricing = calculatePricing();
  
  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Order Summary</h3>
      </div>
      
      <div className="p-4 space-y-4">
              {/* Customer Section */}
              {formData.customerDetails && (
                <div className="pb-4 border-b">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customer</h4>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{formData.customerDetails.name?.name}</p>
                    {formData.customerDetails.email && (
                      <p className="text-xs text-gray-500">{formData.customerDetails.email}</p>
                    )}
                    {formData.customerDetails.paymentTerm && (
                      <p className="text-xs text-gray-500">
                        Terms: {formData.customerDetails.paymentTerm.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Dates Section */}
              {(formData.orderDate || formData.deliveryDate || formData.chargingStartDate) && (
                <div className="pb-4 border-b">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                  <div className="space-y-2">
                    {formData.orderDate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Order Date:</span>
                        <span>{new Date(formData.orderDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {formData.deliveryDate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Delivery:</span>
                        <span>{new Date(formData.deliveryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {formData.chargingStartDate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Charging Starts:</span>
                        <span>{new Date(formData.chargingStartDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {rentalDuration && (
                      <div className="mt-2 p-2 bg-blue-50 rounded">
                        <p className="text-xs text-blue-700">
                          Rental Duration: <strong>{rentalDuration} days</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Delivery Address Section */}
              {formData.deliveryAddress1 && (
                <div className="pb-4 border-b">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Location</h4>
                  <div className="text-xs text-gray-600">
                    <p>{formData.deliveryAddress1}</p>
                    {formData.deliveryAddress2 && <p>{formData.deliveryAddress2}</p>}
                    <p>
                      {[formData.deliveryCity, formData.deliveryCountry, formData.deliveryPostcode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Products Section */}
              {formData.products && formData.products.length > 0 && (
                <div className="pb-4 border-b">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Products ({formData.products.length})
                  </h4>
                  <div className="space-y-2">
                    {formData.products.map((product) => (
                      <div key={product.productId} className="text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{product.name}</span>
                          <span className="text-gray-800">
                            {product.quantity} × £{product.dailyRate.toFixed(2)}
                          </span>
                        </div>
                        {rentalDuration && (
                          <div className="text-right text-gray-500">
                            = £{(product.quantity * product.dailyRate * rentalDuration).toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}
                    {rentalDuration && (
                      <div className="pt-2 mt-2 border-t">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Products Total:</span>
                          <span>
                            £{formData.products.reduce((total, p) =>
                              total + (p.quantity * p.dailyRate * rentalDuration), 0
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Pricing Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Pricing Estimate</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal:</span>
                    <span>{formatCurrency(calculatedPricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax (20%):</span>
                    <span>{formatCurrency(calculatedPricing.tax)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        {formatCurrency(calculatedPricing.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
        {/* Status Indicators */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Status:</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
              Draft
            </span>
          </div>
          {state.draft.lastSaved && (
            <p className="text-xs text-gray-500 mt-2">
              Auto-saved {new Date(state.draft.lastSaved).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}