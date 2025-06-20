"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { WizardProvider, useWizard } from './context/WizardContext';
import WizardProgress from './components/WizardProgress';
import WizardNavigation from './components/WizardNavigation';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import axios from 'axios';
import { BaseURL } from '../../../../utils/baseUrl';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import './styles/wizard-animations.css';

// Import all steps directly (no lazy loading to fix blank page issue)
import BasicInfoStep from './steps/BasicInfoStep';
import ContactStep from './steps/ContactStep';
import AddressStep from './steps/AddressStep';
import FinancialStep from './steps/FinancialStep';
import ReviewStep from './steps/ReviewStep';

const steps = {
  1: BasicInfoStep,
  2: ContactStep,
  3: AddressStep,
  4: FinancialStep,
  5: ReviewStep,
};

const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  }),
};

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
};

function StepContent() {
  const { state } = useWizard();
  const [direction, setDirection] = React.useState(0);
  const [prevStep, setPrevStep] = React.useState(state.currentStep);
  
  React.useEffect(() => {
    setDirection(state.currentStep > prevStep ? 1 : -1);
    setPrevStep(state.currentStep);
  }, [state.currentStep, prevStep]);
  
  const StepComponent = steps[state.currentStep];
  
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={state.currentStep}
        custom={direction}
        variants={stepVariants}
        initial="enter"
        animate="center"
        exit="exit"
        className="w-full"
      >
        <StepComponent />
      </motion.div>
    </AnimatePresence>
  );
}

function WizardContent() {
  const router = useRouter();
  const toast = useRef(null);
  const { state, setLoading, setError, resetWizard, saveDraft } = useWizard();
  const { token, user } = useSelector((state) => state?.authReducer);
  
  // Auto-save functionality
  const { saveStatus, lastSaved } = useAutoSave();
  
  // Keyboard navigation
  const { shortcuts } = useKeyboardNavigation();
  
  // Check for existing draft on mount
  React.useEffect(() => {
    const draft = localStorage.getItem('renttix_customer_draft');
    if (draft && state.currentStep === 1 && !state.draft.lastSaved) {
      setTimeout(() => {
        toast.current?.show({
          severity: 'info',
          summary: 'Draft Loaded',
          detail: 'A previously saved draft has been loaded.',
          life: 5000,
        });
      }, 500);
    }
  }, []);
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get a default customer type if not set
      let defaultCustomerTypeId = state.formData.customerTypeId;
      if (!defaultCustomerTypeId) {
        try {
          const response = await axios.get(
            `${BaseURL}/list/value-list/children?parentName=Customer Type`,
            {
              headers: { authorization: `Bearer ${token}` },
            }
          );
          if (response.data.success && response.data.children.length > 0) {
            defaultCustomerTypeId = response.data.children[0]._id;
          }
        } catch (error) {
          console.error('Failed to fetch default customer type:', error);
        }
      }
      
      // Prepare form data
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(state.formData).forEach((key) => {
        if (key === 'documents') {
          // Handle document uploads separately
          state.formData.documents.forEach((doc, index) => {
            if (doc.file) {
              formData.append(`documents[${index}]`, doc.file);
              formData.append(`documentTypes[${index}]`, doc.type);
              formData.append(`documentNames[${index}]`, doc.name);
            }
          });
        } else if (key === 'deliveryAddresses') {
          formData.append(key, JSON.stringify(state.formData[key]));
        } else if (key === 'customerTypeId') {
          // Map customerTypeId to type for backend compatibility
          formData.append('type', defaultCustomerTypeId || state.formData[key]);
        } else if (key === 'logo' && state.formData[key]) {
          // Handle logo upload
          formData.append('thumbnail', state.formData[key]);
        } else {
          formData.append(key, state.formData[key]);
        }
      });
      
      // Add required fields with default values if not present
      if (!state.formData.status) {
        formData.append('status', 'active'); // Default status
      }
      
      // Ensure type field is always sent (required by backend)
      if (!formData.has('type') && defaultCustomerTypeId) {
        formData.append('type', defaultCustomerTypeId);
      }
      
      const response = await axios.post(
        `${BaseURL}/customer/customer/add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        // Clear draft
        localStorage.removeItem('renttix_customer_draft');
        resetWizard();
        
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Customer created successfully!',
          life: 3000,
        });
        
        // Redirect to customer details
        setTimeout(() => {
          router.push(`/customer/listing`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      setError(error.response?.data?.message || 'Failed to create customer');
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to create customer',
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      {...pageTransition}
    >
      <Toast ref={toast} position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/customer/list')}
                className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
              >
                <i className="pi pi-arrow-left mr-2"></i>
                Back to Customers
              </button>
              <h1 className="text-xl font-semibold">Create New Customer</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Auto-save indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {saveStatus === 'saving' && (
                  <>
                    <i className="pi pi-spin pi-spinner text-blue-500"></i>
                    <span>Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && lastSaved && (
                  <>
                    <i className="pi pi-check-circle text-green-500"></i>
                    <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <i className="pi pi-exclamation-circle text-red-500"></i>
                    <span>Save failed</span>
                  </>
                )}
              </div>
              
              <button
                onClick={() => {
                  saveDraft();
                  toast.current?.show({
                    severity: 'info',
                    summary: 'Draft Saved',
                    detail: 'Your customer draft has been saved',
                    life: 2000,
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="pi pi-save mr-2"></i>
                Save Draft
              </button>
              
              {state.draft.lastSaved && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
                      resetWizard();
                      toast.current?.show({
                        severity: 'success',
                        summary: 'Draft Deleted',
                        detail: 'Your customer draft has been deleted',
                        life: 2000,
                      });
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <i className="pi pi-trash mr-2"></i>
                  Delete Draft
                </button>
              )}
              
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  toast.current?.show({
                    severity: 'info',
                    summary: 'Keyboard Shortcuts',
                    detail: 'Alt+←/→: Navigate steps, Ctrl+S: Save draft',
                    life: 3000,
                  });
                }}
              >
                <i className="pi pi-question-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <WizardProgress />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
     <div className="bg-white rounded-lg shadow-sm p-6 relative min-h-[300px]">
  <AnimatePresence mode="wait">
    <StepContent key={`step-${state.currentStep}`} />
  </AnimatePresence>
</div>
        
        {/* Navigation */}
        <WizardNavigation onSubmit={handleSubmit} />
      </div>
    </motion.div>
  );
}

export default function CreateCustomerWizard() {
  const { user } = useSelector((state) => state?.authReducer);
  
  return (
    <WizardProvider vendorId={user?._id}>
      <WizardContent />
    </WizardProvider>
  );
}