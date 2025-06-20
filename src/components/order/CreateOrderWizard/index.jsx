"use client";
import React, { Suspense, lazy, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { WizardProvider, useWizard } from './context/WizardContext';
import WizardProgress from './components/WizardProgress';
import OrderSummaryPanel from './components/OrderSummaryPanel';
import WizardNavigation from './components/WizardNavigation';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import axios from 'axios';
import { BaseURL } from '../../../../utils/baseUrl';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { HelpSidebar, OnboardingTour } from './components/ContextualHelp';
import './styles/wizard-animations.css';
import './styles/collapsible-summary.css';

// Lazy load steps for better performance
const steps = {
  1: lazy(() => import('./steps/SmartStartStep')), // Combined Customer + Timing
  2: lazy(() => import('./steps/ProductBuilderStep')), // Enhanced Product Selection
  3: lazy(() => import('./steps/DeliveryMagicStep')), // Address + Route Assignment
  4: lazy(() => import('./steps/ConfirmAndGoStep')), // Streamlined Review
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
      ease: [0.4, 0, 0.2, 1], // Custom easing
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

// Add page transition wrapper
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
};

function StepContent() {
  const { state } = useWizard();
  console.log(state)
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
        <Suspense
          fallback={
            <motion.div
              className="flex items-center justify-center p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                <p className="mt-2 text-sm text-gray-500">Loading step...</p>
              </div>
            </motion.div>
          }
        >
          <StepComponent />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function WizardContent() {
  const router = useRouter();
  const toast = useRef(null);
  const { state, setLoading, setError, resetWizard, saveDraft } = useWizard();
  const { token } = useSelector((state) => state?.authReducer);
  
  // Auto-save functionality
  const { lastSavedText, isSaving, saveNow } = useAutoSave(30000); // 30 seconds
  
  // Keyboard navigation
  const { shortcuts } = useKeyboardNavigation();
  
  // Help sidebar toggle
  const [showHelp, setShowHelp] = useState(false);
  
  // Order summary panel toggle state
  const [showOrderSummary, setShowOrderSummary] = useState(() => {
    // Initialize from session storage
    const saved = sessionStorage.getItem('renttix_order_summary_visible');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  // Save order summary visibility state to session storage
  useEffect(() => {
    sessionStorage.setItem('renttix_order_summary_visible', JSON.stringify(showOrderSummary));
  }, [showOrderSummary]);
  
  // Listen for help toggle events
  useEffect(() => {
    const handleToggleHelp = () => setShowHelp(prev => !prev);
    window.addEventListener('toggleHelpSidebar', handleToggleHelp);
    return () => window.removeEventListener('toggleHelpSidebar', handleToggleHelp);
  }, []);
  
  // Onboarding tour
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check if first time user
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('renttix_order_tour_completed');
    if (!hasSeenTour && state.currentStep === 1) {
      setShowOnboarding(true);
    }
  }, []);
  
  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('renttix_order_tour_completed', 'true');
  };
  
  // Check for existing draft on mount
  React.useEffect(() => {
    const draft = localStorage.getItem('renttix_order_draft');
    if (draft && state.currentStep === 1 && !state.draft.lastSaved) {
      // Small delay to ensure toast is ready
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
      
      // Transform wizard data to API format
      const orderPayload = {
        ...state.formData,
        invoiceRunCode: state.formData.invoiceRunCode,
        paymentTerm: state.formData.paymentTerm,
        depot: state.formData.depot || undefined,
        phoneNumber: state.formData.phoneNumber,
      };
      
      const response = await axios.post(
        `${BaseURL}/order/create-order`,
        orderPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        const orderData = response.data.data;
        
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Order created successfully!',
          life: 3000,
        });
        
        // Extract product IDs from the created order
        const productIds = orderData.products?.map(product => product._id) || [];
        
        // Prepare allocation data
        const allocationData = {
          orderId: orderData._id,
          productIds: productIds,
          reference: `REF-${Date.now()}`, // Generate a reference or use from form data
          bookDate: new Date().toISOString().split('T')[0], // Current date or use from form data
          charging: 0, // Default charging or use from form data
          invoiceRunCode: state.formData.customerDetails.invoiceRunCode?.code,
          paymentTerms: state.formData.customerDetails.paymentTerm?.days,
        };
        
        // Call the allocation API (bookout for allocated orders)
        try {
          const allocationResponse = await axios.post(
            `${BaseURL}/order/bookout`,
            allocationData,
            {
              headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${token}`,
              },
            }
          );
          
          if (allocationResponse.data.success) {
            // Clear draft and reset wizard
            resetWizard();
            
            // Navigate to the note page
            router.push(
              `/order/note/${allocationResponse.data.data.noteId}-${encodeURIComponent(
                allocationResponse.data.data.deliveryType
              )}`
            );
          } else {
            // If allocation fails, still navigate to the order but show warning
            toast.current?.show({
              severity: 'warn',
              summary: 'Warning',
              detail: 'Order created but allocation failed. Please allocate manually.',
              life: 5000,
            });
            
            resetWizard();
            router.push(`/order/${orderData._id}`);
          }
        } catch (allocationError) {
          console.error('Allocation error:', allocationError);
          
          toast.current?.show({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Order created but allocation failed. Please allocate manually.',
            life: 5000,
          });
          
          // Clear draft and navigate to order even if allocation fails
          resetWizard();
          router.push(`/order/${orderData._id}`);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create order');
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to create order',
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
                onClick={() => router.push('/order/list')}
                className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
              >
                <i className="pi pi-arrow-left mr-2"></i>
                Back to Orders
              </button>
              <h1 className="text-xl font-semibold">Create New Order</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  saveDraft();
                  toast.current?.show({
                    severity: 'info',
                    summary: 'Draft Saved',
                    detail: 'Your order draft has been saved',
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
                        detail: 'Your order draft has been deleted',
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
              <button className="text-gray-500 hover:text-gray-700">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-300">
          {/* Step Content */}
          <div className={`${showOrderSummary ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-300`}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.currentStep}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <StepContent />
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Navigation */}
            <WizardNavigation onSubmit={handleSubmit} />
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
                <div className="sticky top-24">
                  <OrderSummaryPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Toggle Button */}
        <motion.button
          className={`order-summary-toggle ${showOrderSummary ? 'summary-visible' : ''}`}
          onClick={() => setShowOrderSummary(!showOrderSummary)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={showOrderSummary ? 'Hide Order Summary' : 'Show Order Summary'}
          aria-label={showOrderSummary ? 'Hide Order Summary' : 'Show Order Summary'}
        >
          <i className={`pi ${showOrderSummary ? 'pi-chevron-right' : 'pi-chevron-left'} text-white text-lg`}></i>
        </motion.button>
      </div>
      
      {/* Help Sidebar */}
      <HelpSidebar
        currentStep={state.currentStep}
        shortcuts={shortcuts}
      />
      
      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour
          show={showOnboarding}
          onComplete={completeOnboarding}
        />
      )}
    </motion.div>
  );
}

export default function CreateOrderWizard() {
  const { user } = useSelector((state) => state?.authReducer);
  
  return (
    <WizardProvider vendorId={user?._id}>
      <WizardContent />
    </WizardProvider>
  );
}
