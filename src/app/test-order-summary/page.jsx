"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../components/order/CreateOrderWizard/styles/collapsible-summary.css';

export default function TestOrderSummary() {
  const [showOrderSummary, setShowOrderSummary] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('renttix_order_summary_visible');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    sessionStorage.setItem('renttix_order_summary_visible', JSON.stringify(showOrderSummary));
  }, [showOrderSummary]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-8">Test Order Summary Collapsible Feature</h1>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-300">
          {/* Main Content */}
          <div className={`${showOrderSummary ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-300`}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Form</h2>
              <p className="text-gray-600 mb-4">
                This is the main order form content. When the order summary is hidden, 
                this section expands to take up the full width of the screen.
              </p>
              <div className="space-y-4">
                <div className="border rounded p-4">
                  <label className="block text-sm font-medium mb-2">Customer Name</label>
                  <input type="text" className="w-full border rounded px-3 py-2" placeholder="Enter customer name" />
                </div>
                <div className="border rounded p-4">
                  <label className="block text-sm font-medium mb-2">Product</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>Select a product</option>
                    <option>Product 1</option>
                    <option>Product 2</option>
                  </select>
                </div>
                <div className="border rounded p-4">
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <input type="number" className="w-full border rounded px-3 py-2" placeholder="1" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <AnimatePresence>
            {showOrderSummary && (
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="bg-white rounded-lg shadow-sm border sticky top-8">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Order Summary</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="pb-4 border-b">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Customer</h4>
                      <p className="text-sm">John Doe</p>
                      <p className="text-xs text-gray-500">john.doe@example.com</p>
                    </div>
                    <div className="pb-4 border-b">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Products</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Product 1 x 2</span>
                          <span>£100.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Product 2 x 1</span>
                          <span>£50.00</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Subtotal:</span>
                        <span>£150.00</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Tax (20%):</span>
                        <span>£30.00</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-base font-semibold">
                          <span>Total:</span>
                          <span className="text-blue-600">£180.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle Button */}
        <motion.button
          className={`order-summary-toggle ${showOrderSummary ? 'summary-visible' : ''}`}
          onClick={() => {
            console.log('Toggle clicked, current state:', showOrderSummary);
            setShowOrderSummary(!showOrderSummary);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={showOrderSummary ? 'Hide Order Summary' : 'Show Order Summary'}
          aria-label={showOrderSummary ? 'Hide Order Summary' : 'Show Order Summary'}
        >
          <i className={`pi ${showOrderSummary ? 'pi-chevron-right' : 'pi-chevron-left'} text-white text-lg`}></i>
        </motion.button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">
          <strong>Current State:</strong> Order Summary is {showOrderSummary ? 'VISIBLE' : 'HIDDEN'}
        </p>
        <p className="text-xs text-blue-600 mt-2">
          Click the blue toggle button on the right to show/hide the order summary panel.
        </p>
      </div>
    </div>
  );
}