"use client";
import React, { Suspense, lazy, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { EnhancedWizardProvider, useEnhancedWizard } from './context/EnhancedWizardContext';
import { Toast } from 'primereact/toast';
import { Panel } from 'primereact/panel';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Skeleton } from 'primereact/skeleton';
import { Dialog } from 'primereact/dialog';
import { Chip } from 'primereact/chip';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import axios from 'axios';
import { BaseURL } from '../../../../utils/baseUrl';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import ErrorBoundary from './ErrorBoundary';
import './styles/enhanced-wizard.css';

// Lazy load enhanced steps
const steps = {
  1: lazy(() => import('./steps/enhanced/SmartStartStepEnhanced')),
  2: lazy(() => import('./steps/enhanced/ProductBuilderStepEnhanced')),
  3: lazy(() => import('./steps/enhanced/DeliveryMagicStepEnhanced')),
  4: lazy(() => import('./steps/enhanced/ConfirmAndGoStepEnhanced')),
};

const stepInfo = [
  { label: 'Smart Start', icon: 'pi pi-user-plus', description: 'Customer & Timeline' },
  { label: 'Product Builder', icon: 'pi pi-box', description: 'Select & Configure' },
  { label: 'Delivery Magic', icon: 'pi pi-truck', description: 'Address & Route' },
  { label: 'Confirm & Go', icon: 'pi pi-check-circle', description: 'Review & Submit' }
];

function EnhancedWizardProgress({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="enhanced-wizard-progress">
      <ProgressBar 
        value={progress} 
        showValue={false}
        style={{ height: '8px' }}
        className="mb-4"
      />
      <div className="flex justify-between items-center px-2">
        {stepInfo.map((step, index) => (
          <div 
            key={index}
            className={`flex flex-col items-center ${
              index + 1 <= currentStep ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <div className={`rounded-full p-2 mb-2 ${
              index + 1 <= currentStep ? 'bg-primary text-white' : 'bg-gray-200'
            }`}>
              <i className={`${step.icon} text-lg`}></i>
            </div>
            <span className="text-xs text-center hidden md:block">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepContent() {
  const { state } = useEnhancedWizard();
  const StepComponent = steps[state.currentStep];
  
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <Skeleton className="mb-4" height="2rem" />
          <Skeleton className="mb-4" height="4rem" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height="10rem" />
            <Skeleton height="10rem" />
          </div>
        </div>
      }
    >
      <StepComponent />
    </Suspense>
  );
}

function OrderSummarySidebar({ visible, onHide }) {
  const { state } = useEnhancedWizard();
  const { formData, pricing } = state;
  
  return (
    <Sidebar 
      visible={visible} 
      onHide={onHide}
      position="right"
      className="w-full md:w-25rem"
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-shopping-cart text-2xl"></i>
          <span className="font-semibold text-xl">Order Summary</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Customer Info */}
        {formData.customerDetails && (
          <Card className="shadow-none border-1 border-gray-200">
            <div className="flex items-center gap-3">
              <i className="pi pi-user text-2xl text-primary"></i>
              <div>
                <p className="font-semibold m-0">{formData.customerDetails.name}</p>
                <p className="text-sm text-gray-600 m-0">{formData.customerDetails.email}</p>
              </div>
            </div>
          </Card>
        )}
        
        {/* Timeline */}
        {formData.deliveryDate && (
          <Card className="shadow-none border-1 border-gray-200">
            <div className="flex items-center gap-3">
              <i className="pi pi-calendar text-2xl text-primary"></i>
              <div>
                <p className="font-semibold m-0">Rental Period</p>
                <p className="text-sm text-gray-600 m-0">
                  {new Date(formData.deliveryDate).toLocaleDateString()} - 
                  {formData.expectedReturnDate && new Date(formData.expectedReturnDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        )}
        
        {/* Products */}
        {formData.products && formData.products.length > 0 && (
          <Card className="shadow-none border-1 border-gray-200">
            <h6 className="mt-0 mb-3">Products ({formData.products.length})</h6>
            <div className="space-y-2">
              {formData.products.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{product.name}</span>
                  <Badge value={`×${product.quantity}`} severity="info" />
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Pricing */}
        {pricing.total > 0 && (
          <Card className="shadow-none border-1 border-gray-200 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">£{pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (20%)</span>
                <span className="font-semibold">£{pricing.tax.toFixed(2)}</span>
              </div>
              <Divider />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">£{pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Sidebar>
  );
}

function ConfirmationModal({ visible, onHide, onConfirm, orderData }) {
  const [emailAddresses, setEmailAddresses] = useState([orderData?.customerDetails?.email || '']);
  const [newEmail, setNewEmail] = useState('');
  const [sendOptions, setSendOptions] = useState({
    email: true,
    download: false,
    print: false
  });
  
  const addEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      setEmailAddresses([...emailAddresses, newEmail]);
      setNewEmail('');
    }
  };
  
  const removeEmail = (index) => {
    setEmailAddresses(emailAddresses.filter((_, i) => i !== index));
  };
  
  const footer = (
    <div className="flex justify-between items-center w-full">
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        onClick={onHide} 
        className="p-button-text" 
      />
      <div className="flex gap-2">
        {sendOptions.download && (
          <Button 
            label="Download" 
            icon="pi pi-download" 
            className="p-button-outlined"
            onClick={() => console.log('Download order')}
          />
        )}
        {sendOptions.print && (
          <Button 
            label="Print" 
            icon="pi pi-print" 
            className="p-button-outlined"
            onClick={() => window.print()}
          />
        )}
        <Button 
          label="Confirm Order" 
          icon="pi pi-check" 
          onClick={() => onConfirm(emailAddresses, sendOptions)}
          disabled={sendOptions.email && emailAddresses.length === 0}
        />
      </div>
    </div>
  );
  
  return (
    <Dialog 
      header="Confirm Order" 
      visible={visible} 
      onHide={onHide}
      footer={footer}
      style={{ width: '50vw' }}
      breakpoints={{ '960px': '75vw', '641px': '100vw' }}
    >
      <div className="space-y-4">
        <div>
          <h5 className="mt-0 mb-3">Order Summary</h5>
          <div className="bg-gray-50 p-3 rounded">
            <p className="m-0"><strong>Customer:</strong> {orderData?.customerDetails?.name}</p>
            <p className="m-0"><strong>Delivery:</strong> {orderData?.deliveryDate && new Date(orderData.deliveryDate).toLocaleDateString()}</p>
            <p className="m-0"><strong>Total:</strong> £{orderData?.pricing?.total?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
        
        <Divider />
        
        <div>
          <h5 className="mt-0 mb-3">Send Options</h5>
          <div className="flex flex-column gap-3">
            <div className="flex align-items-center">
              <input 
                type="checkbox" 
                id="send-email" 
                checked={sendOptions.email}
                onChange={(e) => setSendOptions({...sendOptions, email: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="send-email">Send confirmation email</label>
            </div>
            
            {sendOptions.email && (
              <div className="ml-4">
                <label className="block mb-2 text-sm font-medium">Email Recipients:</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {emailAddresses.map((email, index) => (
                    <Chip 
                      key={index} 
                      label={email} 
                      removable 
                      onRemove={() => removeEmail(index)} 
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <InputText 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Add email address"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                  />
                  <Button 
                    icon="pi pi-plus" 
                    onClick={addEmail}
                    disabled={!newEmail || !newEmail.includes('@')}
                  />
                </div>
              </div>
            )}
            
            <div className="flex align-items-center">
              <input 
                type="checkbox" 
                id="download-pdf" 
                checked={sendOptions.download}
                onChange={(e) => setSendOptions({...sendOptions, download: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="download-pdf">Download PDF copy</label>
            </div>
            
            <div className="flex align-items-center">
              <input 
                type="checkbox" 
                id="print-order" 
                checked={sendOptions.print}
                onChange={(e) => setSendOptions({...sendOptions, print: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="print-order">Print order</label>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function WizardContent() {
  const router = useRouter();
  const toast = useRef(null);
  const { state, updateFormData, goToNextStep, goToPreviousStep, submitOrder, saveDraft } = useEnhancedWizard();
  const { token, user } = useSelector((state) => state?.authReducer);
  
  const [showSummary, setShowSummary] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Auto-save functionality
  const { lastSavedText, isSaving, saveNow } = useAutoSave(30000);
  
  // Keyboard navigation
  const { shortcuts } = useKeyboardNavigation();
  
  const handleSubmit = async (emailAddresses, sendOptions) => {
    try {
      const orderPayload = {
        ...state.formData,
        emailRecipients: sendOptions.email ? emailAddresses : [],
        sendConfirmation: sendOptions.email,
        downloadPdf: sendOptions.download,
        printOrder: sendOptions.print
      };
      
      const result = await submitOrder(orderPayload);
      
      if (result.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Order created successfully!',
          life: 3000,
        });
        
        setShowConfirmModal(false);
        
        setTimeout(() => {
          router.push(`/order/${result.orderId}`);
        }, 1000);
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to create order',
        life: 5000,
      });
    }
  };
  
  const canProceed = () => {
    switch (state.currentStep) {
      case 1:
        return state.formData.customerId && state.formData.deliveryDate;
      case 2:
        return state.formData.products && state.formData.products.length > 0;
      case 3:
        return state.formData.deliveryAddress1 && state.formData.assignedRoute;
      case 4:
        return state.formData.termsAccepted;
      default:
        return false;
    }
  };
  
  return (
    <div className="enhanced-wizard-container">
      <Toast ref={toast} position="top-right" />
      
      {/* Header */}
      <Panel 
        header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Button 
                icon="pi pi-arrow-left" 
                className="p-button-text p-button-rounded"
                onClick={() => router.push('/order/list')}
              />
              <h2 className="m-0">Create New Order</h2>
            </div>
            <div className="flex items-center gap-2">
              {state.draft.lastSaved && (
                <span className="text-sm text-gray-500">
                  {lastSavedText}
                </span>
              )}
              <Button 
                icon="pi pi-save" 
                label="Save Draft"
                className="p-button-text"
                onClick={() => {
                  saveDraft();
                  toast.current?.show({
                    severity: 'info',
                    summary: 'Draft Saved',
                    detail: 'Your order draft has been saved',
                    life: 2000,
                  });
                }}
                loading={isSaving}
              />
              <Button 
                icon="pi pi-bars" 
                className="p-button-text p-button-rounded"
                onClick={() => setShowSummary(true)}
                badge={state.formData.products?.length || 0}
                badgeClassName="p-badge-info"
              />
            </div>
          </div>
        }
        className="mb-4"
      >
        <EnhancedWizardProgress 
          currentStep={state.currentStep} 
          totalSteps={4} 
        />
      </Panel>
      
      {/* Main Content */}
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-2">
            <StepContent />
            
            {/* Navigation */}
            <Divider />
            <div className="flex justify-between items-center">
              <Button
                label="Previous"
                icon="pi pi-chevron-left"
                onClick={goToPreviousStep}
                disabled={state.currentStep === 1}
                className="p-button-text"
              />
              
              <div className="flex gap-2">
                {state.currentStep < 4 ? (
                  <Button
                    label="Continue"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    onClick={goToNextStep}
                    disabled={!canProceed()}
                  />
                ) : (
                  <Button
                    label="Create Order"
                    icon="pi pi-check"
                    iconPos="right"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={!canProceed()}
                    className="p-button-success"
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Order Summary Sidebar */}
      <OrderSummarySidebar 
        visible={showSummary} 
        onHide={() => setShowSummary(false)} 
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleSubmit}
        orderData={{
          customerDetails: state.formData.customerDetails,
          deliveryDate: state.formData.deliveryDate,
          pricing: state.pricing
        }}
      />
    </div>
  );
}

export default function EnhancedCreateOrderWizard() {
  const { user, token } = useSelector((state) => state?.authReducer);
  
  return (
    <ErrorBoundary>
      <EnhancedWizardProvider vendorId={user?._id} token={token}>
        <WizardContent  />
      </EnhancedWizardProvider>
    </ErrorBoundary>
  );
}