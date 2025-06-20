"use client";
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const WizardContext = createContext();

const initialState = {
  currentStep: 1,
  totalSteps: 5,
  formData: {
    // Basic Information
    customerType: 'company', // 'company' or 'individual'
    name: '',
    lastName: '',
    companyName: '',
    tradingName: '',
    registrationNumber: '',
    vatNumber: '',
    taxId: '',
    customerTypeId: '',
    logo: null,
    
    // Contact Information
    email: '',
    telephone: '',
    mobile: '',
    fax: '',
    website: '',
    preferredLanguage: 'en',
    communicationPreferences: {
      email: true,
      sms: false,
      phone: true,
      post: false
    },
    contacts: [], // Array of additional contacts
    
    // Address Information
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postCode: '',
    deliveryAddresses: [], // Array of delivery addresses
    deliveryInstructions: '',
    accessCodes: '',
    preferredDeliveryTimes: [],
    
    // Financial Information
    paymentTerm: '',
    invoiceRunCode: '',
    creditLimit: 0,
    creditStatus: 'pending',
    bankName: '',
    bankAccount: '',
    bankSortCode: '',
    paymentMethods: [],
    billingPeriod: '',
    invoiceInBatch: false,
    customerNotes: '',
    internalNotes: '',
    
    // Compliance & Documents
    documents: [], // Array of uploaded documents
    insuranceExpiry: null,
    contractExpiry: null,
    complianceStatus: 'pending',
    riskScore: null,
    
    // Settings
    active: true,
    onStop: false,
    cashCustomer: false,
    canTakePayments: true,
    requireSignature: false,
    sendConfirmationEmail: true,
    
    // System
    vendorId: '',
    createdBy: '',
    parentAccount: '',
  },
  validation: {
    1: {}, // Basic Info validation
    2: {}, // Contact validation
    3: {}, // Address validation
    4: {}, // Financial validation
    5: {}, // Review validation
  },
  completedSteps: [],
  loading: false,
  error: null,
  draft: {
    lastSaved: null,
    autoSaveEnabled: true,
  },
};

const wizardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
      
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
      };
      
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };
      
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };
      
    case 'SET_VALIDATION':
      return {
        ...state,
        validation: {
          ...state.validation,
          [action.payload.step]: action.payload.errors,
        },
      };
      
    case 'COMPLETE_STEP':
      const completedSteps = state.completedSteps.includes(action.payload)
        ? state.completedSteps
        : [...state.completedSteps, action.payload];
      return {
        ...state,
        completedSteps,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
      
    case 'SAVE_DRAFT':
      return {
        ...state,
        draft: {
          ...state.draft,
          lastSaved: new Date().toISOString(),
        },
      };
      
    case 'LOAD_DRAFT':
      return {
        ...state,
        ...action.payload,
        draft: {
          ...state.draft,
          lastSaved: action.payload.draft?.lastSaved || new Date().toISOString(),
        },
      };
      
    case 'RESET':
      return {
        ...initialState,
        formData: {
          ...initialState.formData,
          vendorId: state.formData.vendorId,
        },
      };
      
    case 'ADD_CONTACT':
      return {
        ...state,
        formData: {
          ...state.formData,
          contacts: [...state.formData.contacts, action.payload],
        },
      };
      
    case 'REMOVE_CONTACT':
      return {
        ...state,
        formData: {
          ...state.formData,
          contacts: state.formData.contacts.filter((_, index) => index !== action.payload),
        },
      };
      
    case 'ADD_DELIVERY_ADDRESS':
      return {
        ...state,
        formData: {
          ...state.formData,
          deliveryAddresses: [...state.formData.deliveryAddresses, action.payload],
        },
      };
      
    case 'REMOVE_DELIVERY_ADDRESS':
      return {
        ...state,
        formData: {
          ...state.formData,
          deliveryAddresses: state.formData.deliveryAddresses.filter((_, index) => index !== action.payload),
        },
      };
      
    case 'ADD_DOCUMENT':
      return {
        ...state,
        formData: {
          ...state.formData,
          documents: [...state.formData.documents, action.payload],
        },
      };
      
    case 'REMOVE_DOCUMENT':
      return {
        ...state,
        formData: {
          ...state.formData,
          documents: state.formData.documents.filter((_, index) => index !== action.payload),
        },
      };
      
    default:
      return state;
  }
};

export const WizardProvider = ({ children, vendorId }) => {
  const [state, dispatch] = useReducer(wizardReducer, {
    ...initialState,
    formData: {
      ...initialState.formData,
      vendorId,
    },
  });
  
  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('renttix_customer_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        dispatch({ type: 'LOAD_DRAFT', payload: draft });
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);
  
  // Auto-save draft
  useEffect(() => {
    if (state.draft.autoSaveEnabled && state.formData.name) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 30000); // 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [state.formData, state.draft.autoSaveEnabled]);
  
  const setStep = (step) => dispatch({ type: 'SET_STEP', payload: step });
  const nextStep = () => dispatch({ type: 'NEXT_STEP' });
  const prevStep = () => dispatch({ type: 'PREV_STEP' });
  const updateFormData = (data) => dispatch({ type: 'UPDATE_FORM_DATA', payload: data });
  const setValidation = (step, errors) => dispatch({ type: 'SET_VALIDATION', payload: { step, errors } });
  const completeStep = (step) => dispatch({ type: 'COMPLETE_STEP', payload: step });
  const setLoading = (loading) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error) => dispatch({ type: 'SET_ERROR', payload: error });
  const resetWizard = () => {
    localStorage.removeItem('renttix_customer_draft');
    dispatch({ type: 'RESET' });
  };
  
  const saveDraft = () => {
    const draftData = {
      ...state,
      draft: {
        ...state.draft,
        lastSaved: new Date().toISOString(),
      },
    };
    localStorage.setItem('renttix_customer_draft', JSON.stringify(draftData));
    dispatch({ type: 'SAVE_DRAFT' });
  };
  
  const goToStep = (step) => {
    if (step >= 1 && step <= state.totalSteps) {
      dispatch({ type: 'SET_STEP', payload: step });
    }
  };
  
  // Contact management
  const addContact = (contact) => dispatch({ type: 'ADD_CONTACT', payload: contact });
  const removeContact = (index) => dispatch({ type: 'REMOVE_CONTACT', payload: index });
  
  // Delivery address management
  const addDeliveryAddress = (address) => dispatch({ type: 'ADD_DELIVERY_ADDRESS', payload: address });
  const removeDeliveryAddress = (index) => dispatch({ type: 'REMOVE_DELIVERY_ADDRESS', payload: index });
  
  // Document management
  const addDocument = (document) => dispatch({ type: 'ADD_DOCUMENT', payload: document });
  const removeDocument = (index) => dispatch({ type: 'REMOVE_DOCUMENT', payload: index });
  
  const value = {
    state,
    setStep,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    setValidation,
    completeStep,
    setLoading,
    setError,
    resetWizard,
    saveDraft,
    addContact,
    removeContact,
    addDeliveryAddress,
    removeDeliveryAddress,
    addDocument,
    removeDocument,
  };
  
  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};