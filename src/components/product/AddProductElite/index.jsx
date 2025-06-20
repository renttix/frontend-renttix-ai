"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setDirty, clearDirty } from "../../../store/dirtySlice";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";

// Import wizard steps
import BasicInfoStep from "./steps/BasicInfoStep";
import CategoriesStep from "./steps/CategoriesStep";
import PricingStep from "./steps/PricingStep";
import SpecificationsStep from "./steps/SpecificationsStep";
import MaintenanceStepWithAlerts from "./steps/MaintenanceStepWithAlerts";
import MediaStep from "./steps/MediaStep";
import ReviewStep from "./steps/ReviewStep";

// Import components
import WizardProgress from "./components/WizardProgress";
import WizardNavigation from "./components/WizardNavigation";
import ProductPreview from "./components/ProductPreview";
import QuickActions from "./components/QuickActions";

// Icons
import {
  FiPackage, FiTag, FiDollarSign, FiSettings,
  FiTool, FiImage, FiCheckCircle, FiSave, FiX
} from "react-icons/fi";

const generateRandomAssetNo = () =>
  `ASSET-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const wizardSteps = [
  { id: 1, name: "Basic Info", icon: FiPackage, component: BasicInfoStep },
  { id: 2, name: "Categories", icon: FiTag, component: CategoriesStep },
  { id: 3, name: "Pricing", icon: FiDollarSign, component: PricingStep },
  { id: 4, name: "Specifications", icon: FiSettings, component: SpecificationsStep },
  { id: 5, name: "Maintenance", icon: FiTool, component: MaintenanceStepWithAlerts },
  { id: 6, name: "Media", icon: FiImage, component: MediaStep },
  { id: 7, name: "Review", icon: FiCheckCircle, component: ReviewStep }
];

export default function AddProductElite() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  
  const toast = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state?.authReducer);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    productName: "",
    companyProductName: "",
    productDescription: "",
    status: "Rental",
    uniqueAssetNo: generateRandomAssetNo(),
    
    // Categories
    category: "",
    subCategory: "",
    depots: "",
    
    // Pricing
    rentPrice: "",
    salePrice: "",
    rateDefinition: "",
    taxClass: "",
    
    // Specifications
    quantity: 1,
    lengthUnit: "cm",
    weightUnit: "kg",
    weight: "",
    length: "",
    width: "",
    height: "",
    
    // Additional fields
    rate: "daily",
    range: "",
    vat: "",
    
    // Barcode fields
    barcode: "",
    barcodeType: "CODE128",
    barcodeEnabled: false,
  });
  
  // Supporting data states
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [taxClasses, setTaxClasses] = useState([]);
  const [depots, setDepots] = useState([]);
  const [rateDefinitions, setRateDefinitions] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.productName) {
        saveDraft();
      }
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [formData]);
  
  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    const draft = {
      formData,
      currentStep,
      completedSteps,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('productDraft', JSON.stringify(draft));
    setIsDraftSaved(true);
    
    toast.current?.show({
      severity: "info",
      summary: "Draft Saved",
      detail: "Your progress has been saved",
      life: 2000,
    });
  }, [formData, currentStep, completedSteps]);
  
  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('productDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      const draftAge = new Date() - new Date(draft.timestamp);
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (draftAge < oneDay) {
        toast.current?.show({
          severity: "info",
          summary: "Draft Found",
          detail: "Would you like to continue from your saved draft?",
          sticky: true,
          content: (props) => (
            <div className="flex flex-col gap-2">
              <div>{props.message.detail}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData(draft.formData);
                    setCurrentStep(draft.currentStep);
                    setCompletedSteps(draft.completedSteps);
                    toast.current.clear();
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Continue
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('productDraft');
                    toast.current.clear();
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          )
        });
      }
    }
  }, []);
  
  // Validate current step
  const validateStep = (stepId) => {
    const stepErrors = {};
    
    switch (stepId) {
      case 1: // Basic Info
        if (!formData.productName) stepErrors.productName = "Product name is required";
        if (!formData.productDescription) stepErrors.productDescription = "Description is required";
        break;
      case 2: // Categories
        if (!formData.category) stepErrors.category = "Category is required";
        if (!formData.depots) stepErrors.depots = "Depot is required";
        break;
      case 3: // Pricing
        if (formData.status === "Rental") {
          if (!formData.rentPrice) stepErrors.rentPrice = "Rental price is required";
          if (!formData.rateDefinition) stepErrors.rateDefinition = "Rate definition is required";
        } else {
          if (!formData.salePrice) stepErrors.salePrice = "Sale price is required";
        }
        if (!formData.taxClass) stepErrors.taxClass = "Tax class is required";
        break;
      case 4: // Specifications
        if (!formData.quantity || formData.quantity < 1) stepErrors.quantity = "Valid quantity is required";
        break;
      case 5: // Media
        // Optional step, no validation required
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };
  
  // Handle step navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      if (currentStep < wizardSteps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Please fill in all required fields",
        life: 3000,
      });
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleStepClick = (stepId) => {
    // Allow navigation to completed steps or the next step
    if (completedSteps.includes(stepId) || stepId === currentStep || stepId === currentStep + 1) {
      if (stepId > currentStep && !validateStep(currentStep)) {
        toast.current?.show({
          severity: "error",
          summary: "Complete Current Step",
          detail: "Please complete the current step before proceeding",
          life: 3000,
        });
        return;
      }
      setCurrentStep(stepId);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    dispatch(clearDirty());
    setIsSubmitting(true);
    
    try {
      const productData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          productData.append(key, value);
        }
      });
      
      // Add vendor ID
      const vendorId = ["Editor", "Operator"].includes(user?.role) ? user?.vendor : user?._id;
      productData.append("vendorId", vendorId);
      
      // Add files
      files.forEach((file) => {
        productData.append("image", file);
      });
      
      // Remove rate definition for sale items
      if (formData.status === "Sale") {
        productData.delete("rateDefinition");
      }
      
      const response = await axios.post(
        `${BaseURL}/product/add-product`,
        productData,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        // Clear draft
        localStorage.removeItem('productDraft');
        
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Product created successfully!",
          life: 3000,
        });
        
        setTimeout(() => {
          router.push("/product/product-list");
        }, 1500);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to create product",
        life: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update form data
  const updateFormData = (updates) => {
    dispatch(setDirty());
    setFormData(prev => ({ ...prev, ...updates }));
  };
  
  // Get current step component
  const CurrentStepComponent = wizardSteps[currentStep - 1].component;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/product/product-list")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
              {isDraftSaved && (
                <span className="text-sm text-gray-500">Draft saved</span>
              )}
            </div>
            
            <QuickActions
              onSaveDraft={saveDraft}
              onTogglePreview={() => setShowPreview(!showPreview)}
              showPreview={showPreview}
            />
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <WizardProgress
        steps={wizardSteps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className={`lg:col-span-${showPreview ? '2' : '3'}`}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <CurrentStepComponent
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
                files={files}
                setFiles={setFiles}
                previews={previews}
                setPreviews={setPreviews}
                categories={categories}
                setCategories={setCategories}
                subCategories={subCategories}
                setSubCategories={setSubCategories}
                taxClasses={taxClasses}
                setTaxClasses={setTaxClasses}
                depots={depots}
                setDepots={setDepots}
                rateDefinitions={rateDefinitions}
                setRateDefinitions={setRateDefinitions}
                token={token}
                user={user}
              />
            </motion.div>
            
            {/* Navigation */}
            <WizardNavigation
              currentStep={currentStep}
              totalSteps={wizardSteps.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              canGoBack={currentStep > 1}
              canGoNext={currentStep < wizardSteps.length}
              isLastStep={currentStep === wizardSteps.length}
            />
          </div>
          
          {/* Preview Section */}
          {showPreview && (
            <div className="lg:col-span-1">
              <ProductPreview
                formData={formData}
                previews={previews}
                user={user}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}