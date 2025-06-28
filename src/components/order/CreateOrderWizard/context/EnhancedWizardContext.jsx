"use client";
import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';

const EnhancedWizardContext = createContext();

const initialState = {
  currentStep: 1,
  completedSteps: new Set(),
  formData: {
    // Step 1: Smart Start (Customer + Timing) - Enhanced
    customerId: '',
    customerDetails: null,
    customerType: null, // 'account', 'prepay', 'walk-in'
    customerIntelligence: null, // New: customer intelligence data
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
    deliveryTime: '09:00',
    chargingStartDate: '',
    useExpectedReturnDate: false,
    expectedReturnDate: '',
    rentalDuration: 1,
    isOpenEnded: false, // New: for open-ended rentals
    suggestedDuration: null, // New: AI-suggested duration
    
    // Step 2: Product Builder - Enhanced
    products: [],
    productBundles: [],
    assetConflicts: [], // New: detected conflicts
    bulkAssignments: {}, // New: bulk asset assignments
    maintenanceRules: {}, // New: maintenance configurations
    productAttachments: {}, // New: product documentation
    
    // Step 3: Delivery Magic (Address + Route) - Enhanced
    deliveryPlaceName: '',
    deliveryAddress1: '',
    deliveryAddress2: '',
    deliveryCity: '',
    deliveryCountry: '',
    deliveryPostcode: '',
    deliveryCoordinates: null,
    locationVerified: false,
    phoneNumber: '',
    deliveryContactName: '',
    deliveryContactPhone: '',
    deliveryInstructions: '',
    assignedRoute: null,
    routeOverrideReason: '',
    estimatedRouteCost: null, // New: route cost estimation
    deliveryWindow: null, // New: estimated delivery window
    recurringDelivery: null, // New: recurring delivery setup
    
    // Step 4: Review & Confirm (Settings moved here)
    depot: '',
    salesPerson: '',
    invoiceRunCode: '',
    paymentTerm: '',
    purchaseOrderNumber: '',
    reference: '',
    orderedBy: '',
    invoiceInBatch: 0,
    requireSignature: false,
    sendConfirmationEmail: true,
    termsAccepted: false,
    
    // Vendor info (from Redux)
    vendorId: '',
  },
  validation: {},
  pricing: {
    subtotal: 0,
    tax: 0,
    total: 0,
    routeCost: 0, // New: route cost
    totalWithDelivery: 0, // New: total including delivery
  },
  draft: {
    lastSaved: null,
    isDirty: false,
  },
  isLoading: false,
  error: null,
  // New state properties
  customerIntelligenceLoading: false,
  assetAvailabilityLoading: false,
  routeEstimationLoading: false,
  suggestions: {
    duration: null,
    products: [],
    routes: [],
  },
};

function enhancedWizardReducer(state, action) {
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
      
    // New action types
    case 'SET_CUSTOMER_INTELLIGENCE':
      return {
        ...state,
        formData: {
          ...state.formData,
          customerIntelligence: action.payload,
          customerType: action.payload?.customerType || state.formData.customerType,
        },
      };
      
    case 'SET_ASSET_CONFLICTS':
      return {
        ...state,
        formData: {
          ...state.formData,
          assetConflicts: action.payload,
        },
      };
      
    case 'SET_ROUTE_ESTIMATION':
      return {
        ...state,
        formData: {
          ...state.formData,
          estimatedRouteCost: action.payload.cost,
          deliveryWindow: action.payload.window,
        },
        pricing: {
          ...state.pricing,
          routeCost: action.payload.cost || 0,
          totalWithDelivery: state.pricing.total + (action.payload.cost || 0),
        },
      };
      
    case 'SET_SUGGESTIONS':
      return {
        ...state,
        suggestions: { ...state.suggestions, ...action.payload },
      };
      
    case 'SET_INTELLIGENCE_LOADING':
      return { ...state, customerIntelligenceLoading: action.payload };
      
    case 'SET_AVAILABILITY_LOADING':
      return { ...state, assetAvailabilityLoading: action.payload };
      
    case 'SET_ROUTE_LOADING':
      return { ...state, routeEstimationLoading: action.payload };
      
    case 'ADD_BULK_ASSIGNMENT':
      return {
        ...state,
        formData: {
          ...state.formData,
          bulkAssignments: {
            ...state.formData.bulkAssignments,
            [action.payload.productId]: action.payload.assets,
          },
        },
      };
      
    case 'SET_MAINTENANCE_RULE':
      return {
        ...state,
        formData: {
          ...state.formData,
          maintenanceRules: {
            ...state.formData.maintenanceRules,
            [action.payload.productId]: action.payload.rule,
          },
        },
      };
      
    default:
      return state;
  }
}

// Utility functions for localStorage
const DRAFT_KEY = 'renttix_enhanced_order_draft';

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

export function EnhancedWizardProvider({ children, vendorId, token }) {
  const [state, dispatch] = useReducer(enhancedWizardReducer, {
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
  
  // New enhanced functions
  const setCustomerIntelligence = useCallback((data) => 
    dispatch({ type: 'SET_CUSTOMER_INTELLIGENCE', payload: data }), []);
  
  const setAssetConflicts = useCallback((conflicts) => 
    dispatch({ type: 'SET_ASSET_CONFLICTS', payload: conflicts }), []);
  
  const setRouteEstimation = useCallback((estimation) => 
    dispatch({ type: 'SET_ROUTE_ESTIMATION', payload: estimation }), []);
  
  const setSuggestions = useCallback((suggestions) => 
    dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions }), []);
  
  const setIntelligenceLoading = useCallback((loading) => 
    dispatch({ type: 'SET_INTELLIGENCE_LOADING', payload: loading }), []);
  
  const setAvailabilityLoading = useCallback((loading) => 
    dispatch({ type: 'SET_AVAILABILITY_LOADING', payload: loading }), []);
  
  const setRouteLoading = useCallback((loading) => 
    dispatch({ type: 'SET_ROUTE_LOADING', payload: loading }), []);
  
  const addBulkAssignment = useCallback((productId, assets) => 
    dispatch({ type: 'ADD_BULK_ASSIGNMENT', payload: { productId, assets } }), []);
  
  const setMaintenanceRule = useCallback((productId, rule) => 
    dispatch({ type: 'SET_MAINTENANCE_RULE', payload: { productId, rule } }), []);
  
  // API integration functions
  const fetchCustomerIntelligence = useCallback(async (customerId) => {
    if (!customerId || !token) return;
    
    setIntelligenceLoading(true);
    try {
      const response = await axios.get(
        `${BaseURL}/api/intelligence/customer/${customerId}`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data.success) {
        setCustomerIntelligence(response.data.data);
        
        // Auto-fill form data if repeat customer
        if (response.data.data.isRepeatCustomer && response.data.data.lastOrderDetails) {
          const lastOrder = response.data.data.lastOrderDetails;
          updateFormData({
            deliveryAddress1: lastOrder.deliveryAddress1 || '',
            deliveryAddress2: lastOrder.deliveryAddress2 || '',
            deliveryCity: lastOrder.deliveryCity || '',
            deliveryPostcode: lastOrder.deliveryPostcode || '',
            deliveryContactName: lastOrder.deliveryContactName || '',
            deliveryContactPhone: lastOrder.deliveryContactPhone || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching customer intelligence:', error);
      setError('Failed to fetch customer intelligence');
    } finally {
      setIntelligenceLoading(false);
    }
  }, [token, setIntelligenceLoading, setCustomerIntelligence, updateFormData, setError]);
  
  const checkAssetAvailability = useCallback(async (productId, quantity, dates) => {
    if (!productId || !token) return;
    
    setAvailabilityLoading(true);
    try {
      const response = await axios.post(
        `${BaseURL}/api/assets/check-availability`,
        {
          productId,
          quantity,
          startDate: dates.startDate,
          endDate: dates.endDate,
          vendorId: state.formData.vendorId,
        },
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data.success) {
        if (response.data.data.conflicts?.length > 0) {
          setAssetConflicts(response.data.data.conflicts);
        }
        return response.data.data;
      }
    } catch (error) {
      console.error('Error checking asset availability:', error);
      setError('Failed to check asset availability');
    } finally {
      setAvailabilityLoading(false);
    }
  }, [token, state.formData.vendorId, setAvailabilityLoading, setAssetConflicts, setError]);
  
  const estimateRoute = useCallback(async (deliveryAddress, products) => {
    if (!deliveryAddress || !token) return;
    
    setRouteLoading(true);
    try {
      const response = await axios.post(
        `${BaseURL}/routes/estimate`,
        {
          deliveryAddress,
          products,
          vendorId: state.formData.vendorId,
          deliveryDate: state.formData.deliveryDate,
        },
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data.success) {
        setRouteEstimation(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error estimating route:', error);
      setError('Failed to estimate route');
    } finally {
      setRouteLoading(false);
    }
  }, [token, state.formData.vendorId, state.formData.deliveryDate, setRouteLoading, setRouteEstimation, setError]);
  
  const submitOrder = useCallback(async (orderPayload) => {
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${BaseURL}/api/orders`,
        orderPayload,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data.success) {
        clearDraftFromStorage();
        return {
          success: true,
          orderId: response.data.data._id,
          orderNumber: response.data.data.orderNumber,
        };
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setError(error.response?.data?.message || error.message || 'Failed to submit order');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, setError]);
  
  const goToNextStep = useCallback(() => {
    if (state.currentStep < 4) {
      completeStep(state.currentStep);
      setStep(state.currentStep + 1);
    }
  }, [state.currentStep, completeStep, setStep]);
  
  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > 1) {
      setStep(state.currentStep - 1);
    }
  }, [state.currentStep, setStep]);

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
    saveDraft,
    // Enhanced functions
    setCustomerIntelligence,
    setAssetConflicts,
    setRouteEstimation,
    setSuggestions,
    setIntelligenceLoading,
    setAvailabilityLoading,
    setRouteLoading,
    addBulkAssignment,
    setMaintenanceRule,
    // API functions
    fetchCustomerIntelligence,
    checkAssetAvailability,
    estimateRoute,
    submitOrder,
    goToNextStep,
    goToPreviousStep,
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
    saveDraft,
    setCustomerIntelligence,
    setAssetConflicts,
    setRouteEstimation,
    setSuggestions,
    setIntelligenceLoading,
    setAvailabilityLoading,
    setRouteLoading,
    addBulkAssignment,
    setMaintenanceRule,
    fetchCustomerIntelligence,
    checkAssetAvailability,
    estimateRoute,
    submitOrder,
    goToNextStep,
    goToPreviousStep,
  ]);
  
  return (
    <EnhancedWizardContext.Provider value={value}>
      {children}
    </EnhancedWizardContext.Provider>
  );
}

export const useEnhancedWizard = () => {
  const context = useContext(EnhancedWizardContext);
  if (!context) {
    throw new Error('useEnhancedWizard must be used within EnhancedWizardProvider');
  }
  return context;
};