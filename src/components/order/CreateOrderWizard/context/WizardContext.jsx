"use client";
import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';

const WizardContext = createContext();

const initialState = {
  currentStep: 1,
  completedSteps: new Set(),
  formData: {
    // Step 1: Smart Start (Customer + Timing)
    customerId: '',
    customerDetails: null,
    account: '',
    email: '',
    cunstomerQuickbookId: '',
    billingPlaceName: '',
    address1: '',
    address2: '',
    city: '',
    country: '',
    postcode: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    deliveryTime: '09:00', // Added delivery time
    chargingStartDate: '',
    useExpectedReturnDate: false,
    expectedReturnDate: '',
    rentalDuration: 1, // Added for quick duration selection
    orderDiscount:0,
    // Step 2: Product Builder
    products: [],
    productBundles: [], // Added for bundle selection
    
    // Step 3: Delivery Magic (Address + Route)
    deliveryPlaceName: '',
    deliveryAddress1: '',
    deliveryAddress2: '',
    deliveryCity: '',
    deliveryCountry: '',
    deliveryPostcode: '',
    deliveryCoordinates: null,
    locationVerified: false,
    phoneNumber: '',
    deliveryContactName: '', // Renamed from siteContact
    deliveryContactPhone: '', // Added separate phone for delivery contact
    deliveryInstructions: '', // Renamed from instruction
    assignedRoute: null, // Added for route assignment
    routeOverrideReason: '', // Added for manual route override
    
    // Step 4: Review & Confirm (Settings moved here)
    depot: '',
    salesPerson: '',
    invoiceRunCode: '',
    paymentTerm: '',
    purchaseOrderNumber: '', // Renamed from customerReference
    reference: '', // Added separate reference field
    orderedBy: '',
    invoiceInBatch: 0,
    requireSignature: false, // Added
    sendConfirmationEmail: true, // Added
    termsAccepted: false, // Added
    
    // Vendor info (from Redux)
    vendorId: '',
  },
  validation: {},
  pricing: {
    subtotal: 0,
    tax: 0,
    total: 0,
  },
  draft: {
    lastSaved: null,
    isDirty: false,
  },
  isLoading: false,
  error: null,
};

function wizardReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
      
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
        draft: { ...state.draft, isDirty: true },
      };
      
    case 'COMPLETE_STEP':
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.add(action.payload);
      return {
        ...state,
        completedSteps: newCompletedSteps,
      };
      
    case 'SET_VALIDATION':
      return {
        ...state,
        validation: { ...state.validation, [action.step]: action.errors },
      };
      
    case 'UPDATE_PRICING':
      return { ...state, pricing: action.payload };
      
    case 'SAVE_DRAFT':
      return {
        ...state,
        draft: { lastSaved: new Date(), isDirty: false },
      };
      
    case 'LOAD_DRAFT':
      return { ...state, ...action.payload };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'RESET_WIZARD':
      return initialState;
      
    default:
      return state;
  }
}

// Utility functions for localStorage
const DRAFT_KEY = 'renttix_order_draft';

const saveDraftToStorage = (state) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      formData: state.formData,
      currentStep: state.currentStep,
      completedSteps: Array.from(state.completedSteps),
      savedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
};

const loadDraftFromStorage = () => {
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const parsed = JSON.parse(draft);
      return {
        formData: parsed.formData,
        currentStep: parsed.currentStep,
        completedSteps: new Set(parsed.completedSteps),
      };
    }
  } catch (error) {
    console.error('Failed to load draft:', error);
  }
  return null;
};

const clearDraftFromStorage = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
};

export function WizardProvider({ children, vendorId }) {
  const [state, dispatch] = useReducer(wizardReducer, {
    ...initialState,
    formData: { ...initialState.formData, vendorId },
  });
  
  // Auto-save draft
  useEffect(() => {
    if (state.draft.isDirty) {
      const timer = setTimeout(() => {
        saveDraftToStorage(state);
        dispatch({ type: 'SAVE_DRAFT' });
      }, 30000); // Save every 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [state]);
  
  // Load draft on mount
  useEffect(() => {
    const draft = loadDraftFromStorage();
    if (draft) {
      dispatch({ type: 'LOAD_DRAFT', payload: draft });
    }
  }, []);
  
  // Save draft on unmount
  useEffect(() => {
    return () => {
      if (state.draft.isDirty) {
        saveDraftToStorage(state);
      }
    };
  }, [state]);
  
  // Memoize functions to prevent re-creation on every render
  const updateFormData = useCallback((data) => dispatch({ type: 'UPDATE_FORM_DATA', payload: data }), []);
  const setStep = useCallback((step) => dispatch({ type: 'SET_STEP', payload: step }), []);
  const completeStep = useCallback((step) => dispatch({ type: 'COMPLETE_STEP', payload: step }), []);
  const setValidation = useCallback((step, errors) => dispatch({ type: 'SET_VALIDATION', step, errors }), []);
  const updatePricing = useCallback((pricing) => dispatch({ type: 'UPDATE_PRICING', payload: pricing }), []);
  const setLoading = useCallback((loading) => dispatch({ type: 'SET_LOADING', payload: loading }), []);
  const setError = useCallback((error) => dispatch({ type: 'SET_ERROR', payload: error }), []);
  
  const resetWizard = useCallback(() => {
    clearDraftFromStorage();
    dispatch({ type: 'RESET_WIZARD' });
  }, []);
  
  const saveDraft = useCallback(() => {
    saveDraftToStorage(state);
    dispatch({ type: 'SAVE_DRAFT' });
  }, [state]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    state,
    dispatch,
    updateFormData,
    setStep,
    completeStep,
    setValidation,
    updatePricing,
    setLoading,
    setError,
    resetWizard,
    saveDraft
  }), [
    state,
    updateFormData,
    setStep,
    completeStep,
    setValidation,
    updatePricing,
    setLoading,
    setError,
    resetWizard,
    saveDraft
  ]);
  
  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context;
};