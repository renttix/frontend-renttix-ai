"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';

// Help content for each field
const helpContent = {
  // Smart Start Step
  customerSearch: {
    title: "Customer Selection",
    content: "Start typing to search for existing customers by name, email, or account number. Recent customers are shown for quick selection.",
    tips: ["Use the account number for exact matches", "Click on recent customers for quick selection"]
  },
  deliveryDate: {
    title: "Delivery Date",
    content: "Select when the items should be delivered to the customer. This date determines when rental charges begin.",
    tips: ["Delivery is typically between 9 AM - 5 PM", "Weekend deliveries may have additional charges"]
  },
  rentalDuration: {
    title: "Rental Duration",
    content: "Choose how long the customer will rent the items. This affects the total price calculation.",
    tips: ["Longer rentals often have better daily rates", "Custom duration allows specific end dates"]
  },
  paymentTerms: {
    title: "Payment Terms",
    content: "Defines when and how the customer will pay for this order. This affects invoice generation and payment collection.",
    tips: ["Terms are usually set per customer", "Common terms: Net 30, Net 60, Due on Receipt"]
  },
  invoiceRunCode: {
    title: "Invoice Run Code",
    content: "Groups orders for batch invoicing. Orders with the same code are invoiced together on the scheduled run date.",
    tips: ["Use different codes for different billing cycles", "Essential for customers with regular orders"]
  },
  
  // Product Builder Step
  productBundle: {
    title: "Product Bundles",
    content: "Pre-configured packages that include multiple products at a discounted rate. Perfect for common event types.",
    tips: ["Bundles save 10-20% compared to individual items", "All bundle items can be customized after selection"]
  },
  productSearch: {
    title: "Product Search",
    content: "Search for products by name, SKU, or category. Real-time stock levels are shown for each item.",
    tips: ["Use filters to narrow down results", "Check stock availability before adding large quantities"]
  },
  maintenance: {
    title: "Maintenance Schedule",
    content: "Set how often this product needs maintenance during the rental period. Required for certain equipment.",
    tips: ["More frequent maintenance ensures equipment reliability", "Some items have mandatory maintenance schedules"]
  },
  
  // Delivery Magic Step
  deliveryAddress: {
    title: "Delivery Address",
    content: "The location where items will be delivered. This address is used for route assignment and delivery planning.",
    tips: ["Ensure the postcode is accurate for proper routing", "Add delivery instructions for complex locations"]
  },
  routeAssignment: {
    title: "Route Assignment",
    content: "Orders are automatically assigned to the best route based on the delivery address. You can override if needed.",
    tips: ["Green routes have the most capacity", "Floating tasks are for addresses outside normal routes"]
  },
  
  // Confirm & Go Step
  orderTotal: {
    title: "Order Pricing",
    content: "The total includes product rental, delivery fees, and VAT. Bundle discounts are automatically applied.",
    tips: ["Prices are calculated per day", "VAT is added at 20% for UK orders"]
  },
  termsConditions: {
    title: "Terms & Conditions",
    content: "By accepting, you confirm the order details are correct and agree to the rental terms including payment and return policies.",
    tips: ["Orders can be modified until delivery", "Cancellation policies vary by product type"]
  }
};

// Keyboard shortcuts
const shortcuts = [
  { key: "Tab", description: "Navigate between fields" },
  { key: "Enter", description: "Submit form / Next step" },
  { key: "Esc", description: "Close dialogs" },
  { key: "?", description: "Show keyboard shortcuts" },
  { key: "Ctrl+S", description: "Save draft" },
  { key: "←/→", description: "Previous/Next step" }
];

export function ContextualHelp({ fieldId, children, position = "top" }) {
  const help = helpContent[fieldId];
  
  if (!help) return children;
  
  return (
    <div className="relative inline-block w-full">
      {children}
      <Tooltip 
        target={`.help-${fieldId}`} 
        position={position}
        className="max-w-sm"
      >
        <div className="p-2">
          <h4 className="font-semibold mb-1">{help.title}</h4>
          <p className="text-sm mb-2">{help.content}</p>
          {help.tips.length > 0 && (
            <ul className="text-xs space-y-1">
              {help.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-1">
                  <i className="pi pi-info-circle text-blue-400 mt-0.5" style={{ fontSize: '10px' }}></i>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Tooltip>
      <i 
        className={`help-${fieldId} pi pi-question-circle absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 cursor-help transition-colors`}
        style={{ fontSize: '14px' }}
      />
    </div>
  );
}

export function HelpSidebar({ currentStep, shortcuts = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Listen for help toggle events
  useEffect(() => {
    const handleToggleHelp = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleHelpSidebar', handleToggleHelp);
    return () => window.removeEventListener('toggleHelpSidebar', handleToggleHelp);
  }, []);
  
  // Listen for ? key press
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '?' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  const stepHelp = {
    1: {
      title: "Getting Started",
      items: [
        "Select an existing customer or create a new one",
        "Choose your delivery date and time",
        "Set the rental duration"
      ]
    },
    2: {
      title: "Building Your Order",
      items: [
        "Browse product bundles for quick selection",
        "Search and add individual products",
        "Configure maintenance schedules as needed"
      ]
    },
    3: {
      title: "Delivery Setup",
      items: [
        "Verify or enter the delivery address",
        "Review automatic route assignment",
        "Add special delivery instructions"
      ]
    },
    4: {
      title: "Final Review",
      items: [
        "Check all order details are correct",
        "Review pricing and discounts",
        "Accept terms to complete the order"
      ]
    }
  };
  
  const currentHelp = stepHelp[currentStep];
  
  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Button
          icon="pi pi-question"
          className="p-button-rounded p-button-help shadow-lg"
          onClick={() => setIsOpen(true)}
          tooltip="Need help?"
          tooltipOptions={{ position: 'left' }}
        />
      </motion.div>
      
      {/* Help Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Help & Tips</h2>
                <Button
                  icon="pi pi-times"
                  className="p-button-text p-button-rounded"
                  onClick={() => setIsOpen(false)}
                />
              </div>
              
              {currentHelp && (
                <Card className="mb-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      {currentStep}
                    </span>
                    {currentHelp.title}
                  </h3>
                  <ul className="space-y-2">
                    {currentHelp.items.map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <i className="pi pi-check-circle text-green-500 mt-0.5" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              )}
              
              <Card className="mb-4">
                <h3 className="font-semibold mb-3">Quick Tips</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <i className="pi pi-lightbulb text-yellow-500" />
                    <p>Use product bundles to save time and money on common event setups.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="pi pi-clock text-blue-500" />
                    <p>Orders are auto-saved every 30 seconds to prevent data loss.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="pi pi-map text-green-500" />
                    <p>Routes are assigned automatically based on delivery address.</p>
                  </div>
                </div>
              </Card>
              
              <Button
                label="Keyboard Shortcuts"
                icon="pi pi-keyboard"
                className="p-button-outlined w-full"
                onClick={() => setShowShortcuts(true)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Keyboard Shortcuts Dialog */}
      <Dialog
        header="Keyboard Shortcuts"
        visible={showShortcuts}
        onHide={() => setShowShortcuts(false)}
        style={{ width: '400px' }}
      >
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                {shortcut.keys}
              </kbd>
              <span className="text-sm">{shortcut.description}</span>
            </div>
          ))}
        </div>
      </Dialog>
    </>
  );
}

// Onboarding tour component
export function OnboardingTour({ show, onComplete }) {
  const [step, setStep] = useState(0);
  
  const tourSteps = [
    {
      target: '.customer-search',
      title: 'Start with Customer',
      content: 'Search for existing customers or quickly select from recent orders.'
    },
    {
      target: '.delivery-date',
      title: 'Set Delivery Date',
      content: 'Choose when items should be delivered. Rental charges start from this date.'
    },
    {
      target: '.product-bundles',
      title: 'Quick Product Selection',
      content: 'Use bundles for common event setups or browse individual products.'
    },
    {
      target: '.route-assignment',
      title: 'Smart Routing',
      content: 'Orders are automatically assigned to the best delivery route.'
    }
  ];
  
  if (!show || step >= tourSteps.length) return null;
  
  const currentTourStep = tourSteps[step];
  
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute bg-white p-4 rounded-lg shadow-xl max-w-sm"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <h3 className="font-semibold mb-2">{currentTourStep.title}</h3>
        <p className="text-sm mb-4">{currentTourStep.content}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Step {step + 1} of {tourSteps.length}
          </span>
          <div className="space-x-2">
            {step > 0 && (
              <Button
                label="Back"
                className="p-button-text p-button-sm"
                onClick={() => setStep(step - 1)}
              />
            )}
            <Button
              label={step === tourSteps.length - 1 ? "Finish" : "Next"}
              className="p-button-sm"
              onClick={() => {
                if (step === tourSteps.length - 1) {
                  onComplete();
                } else {
                  setStep(step + 1);
                }
              }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}