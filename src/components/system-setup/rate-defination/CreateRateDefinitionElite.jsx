"use client";
import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";
import CanceButton from "@/components/Buttons/CanceButton";
import { motion, AnimatePresence } from "framer-motion";
import { Steps } from "primereact/steps";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";
import { 
  FaCalculator, 
  FaChartLine, 
  FaCalendarAlt, 
  FaInfoCircle,
  FaLightbulb,
  FaRocket,
  FaShieldAlt,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaArrowLeft,
  FaMagic,
  FaBook,
  FaPlay,
  FaPause,
  FaQuestionCircle,
  FaChevronRight,
  FaChevronLeft
} from "react-icons/fa";
import { MdPreview, MdSettings, MdInfo } from "react-icons/md";

// Template configurations
const rateTemplates = [
  {
    id: 'standard',
    name: 'Standard Weekly',
    description: 'Common 5-day rental week with 1-week minimum',
    icon: FaCalculator,
    color: 'blue',
    config: {
      rentalDaysPerWeek: 5,
      minimumRentalPeriod: 5,
      rateType: 'Percentage',
      dayRates: Array(7).fill({ active: false, rate: "" })
    }
  },
  {
    id: 'flexible',
    name: 'Flexible Daily',
    description: 'Daily rentals with 1-day minimum',
    icon: FaClock,
    color: 'green',
    config: {
      rentalDaysPerWeek: 7,
      minimumRentalPeriod: 1,
      rateType: 'Percentage',
      dayRates: Array(7).fill({ active: false, rate: "" })
    }
  },
  {
    id: 'monthly',
    name: 'Monthly Contract',
    description: '30-day minimum for long-term rentals',
    icon: FaCalendarAlt,
    color: 'purple',
    config: {
      rentalDaysPerWeek: 7,
      minimumRentalPeriod: 30,
      rateType: 'Percentage',
      dayRates: Array(7).fill({ active: false, rate: "" })
    }
  },
  {
    id: 'weekend',
    name: 'Weekend Special',
    description: '2-day weekend minimum',
    icon: FaRocket,
    color: 'orange',
    config: {
      rentalDaysPerWeek: 2,
      minimumRentalPeriod: 2,
      rateType: 'Percentage',
      dayRates: Array(7).fill({ active: false, rate: "" })
    }
  }
];

// Step components
const BasicInfoStep = ({ formData, handleChange, errors }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-blue-500 text-xl mt-1" />
          <div>
            <h4 className="font-bold text-blue-900 mb-1">What are Rate Definitions?</h4>
            <p className="text-sm text-blue-800">
              Rate definitions control how your rental products are priced over time. 
              They determine minimum rental periods, billing cycles, and how rates change 
              based on rental duration.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Rate Definition Name
            <span className="text-red-500 ml-1">*</span>
            <Tooltip target=".name-help" />
            <FaQuestionCircle 
              className="inline ml-2 text-gray-400 cursor-help name-help" 
              data-pr-tooltip="Give your rate a descriptive name that explains its purpose"
            />
          </label>
          <InputText
            value={formData.name}
            onChange={(e) => handleChange(e, "name")}
            placeholder="e.g., Standard Weekly Rate, Weekend Special"
            className={`w-full ${errors.name ? 'p-invalid' : ''}`}
          />
          {errors.name && (
            <small className="text-red-500 text-xs mt-1">{errors.name}</small>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Description
            <Tooltip target=".desc-help" />
            <FaQuestionCircle 
              className="inline ml-2 text-gray-400 cursor-help desc-help" 
              data-pr-tooltip="Describe when and how this rate should be used"
            />
          </label>
          <InputTextarea
            value={formData.description}
            onChange={(e) => handleChange(e, "description")}
            placeholder="Describe the purpose and use case for this rate definition..."
            rows={4}
            className="w-full"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" />
            Examples of Rate Definitions
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <div>
                <strong>Standard Weekly:</strong> 5-day rental week, minimum 1 week
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <div>
                <strong>Flexible Daily:</strong> Pay per day, no minimum
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <div>
                <strong>Monthly Contract:</strong> 30-day minimum for discounts
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TemplateSelectionStep = ({ onSelectTemplate }) => {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaMagic className="text-purple-500 text-xl mt-1" />
          <div>
            <h4 className="font-bold text-purple-900 mb-1">Choose a Template</h4>
            <p className="text-sm text-purple-800">
              Start with a pre-configured template to save time, or create a custom rate from scratch.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rateTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              onClick={() => onSelectTemplate(template)}
              className={`
                relative cursor-pointer rounded-lg border-2 p-4 transition-all
                ${hoveredTemplate === template.id 
                  ? `border-${template.color}-400 shadow-lg` 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg bg-${template.color}-100`}>
                  <Icon className={`text-2xl text-${template.color}-600`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{template.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt />
                      {template.config.minimumRentalPeriod} day min
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {template.config.rentalDaysPerWeek} days/week
                    </span>
                  </div>
                </div>
              </div>
              {hoveredTemplate === template.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-2 right-2"
                >
                  <FaChevronRight className={`text-${template.color}-500`} />
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* Custom option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectTemplate(null)}
          className="relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-gray-400 transition-all"
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="p-3 rounded-lg bg-gray-100 inline-block mb-3">
                <MdSettings className="text-2xl text-gray-600" />
              </div>
              <h4 className="font-bold text-gray-700">Custom Configuration</h4>
              <p className="text-sm text-gray-500 mt-1">Start from scratch</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const RateConfigurationStep = ({ formData, handleChange, handleSwitchChange, errors }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaChartLine className="text-green-500 text-xl mt-1" />
          <div>
            <h4 className="font-bold text-green-900 mb-1">Configure Your Rate Structure</h4>
            <p className="text-sm text-green-800">
              Set up how many days per week are billable and the minimum rental period. 
              These settings determine how rental charges are calculated.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Rental Days Per Week
            <span className="text-red-500 ml-1">*</span>
            <Tooltip target=".rental-days-help" />
            <FaQuestionCircle 
              className="inline ml-2 text-gray-400 cursor-help rental-days-help" 
              data-pr-tooltip="How many days per week are charged? (e.g., 5 for Mon-Fri, 7 for every day)"
            />
          </label>
          <div className="relative">
            <InputNumber
              value={formData.rentalDaysPerWeek}
              onValueChange={(e) => handleChange(e, "rentalDaysPerWeek")}
              min={1}
              max={7}
              showButtons
              className={`w-full ${errors.rentalDaysPerWeek ? 'p-invalid' : ''}`}
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <FaInfoCircle />
              <span>Typically 5 for business days or 7 for all days</span>
            </div>
          </div>
          {errors.rentalDaysPerWeek && (
            <small className="text-red-500 text-xs mt-1">{errors.rentalDaysPerWeek}</small>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Minimum Rental Period (Days)
            <span className="text-red-500 ml-1">*</span>
            <Tooltip target=".min-period-help" />
            <FaQuestionCircle 
              className="inline ml-2 text-gray-400 cursor-help min-period-help" 
              data-pr-tooltip="The minimum number of days a customer must rent for"
            />
          </label>
          <div className="relative">
            <InputNumber
              value={formData.minimumRentalPeriod}
              onValueChange={(e) => handleChange(e, "minimumRentalPeriod")}
              min={1}
              showButtons
              className={`w-full ${errors.minimumRentalPeriod ? 'p-invalid' : ''}`}
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <FaInfoCircle />
              <span>Customers will be charged for at least this many days</span>
            </div>
          </div>
          {errors.minimumRentalPeriod && (
            <small className="text-red-500 text-xs mt-1">{errors.minimumRentalPeriod}</small>
          )}
        </div>
      </div>

      {/* Visual Example */}
      <div className="bg-gray-50 rounded-lg p-6 mt-6">
        <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FaCalculator className="text-blue-500" />
          How It Works - Example Calculation
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-semibold text-gray-700 mb-2">Your Settings:</h5>
            <ul className="space-y-1 text-sm">
              <li>• Rental Days/Week: <strong>{formData.rentalDaysPerWeek}</strong></li>
              <li>• Minimum Period: <strong>{formData.minimumRentalPeriod} days</strong></li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-semibold text-gray-700 mb-2">Example Rental:</h5>
            <ul className="space-y-1 text-sm">
              <li>• Customer rents for 3 days</li>
              <li>• Charged for: <strong>{Math.max(3, formData.minimumRentalPeriod)} days</strong></li>
              <li className="text-green-600">
                {3 < formData.minimumRentalPeriod && '✓ Minimum period applied'}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
        <div>
          <label className="text-sm font-bold text-gray-700">
            Activate Rate Definition
          </label>
          <p className="text-xs text-gray-600 mt-1">
            Make this rate available for use immediately
          </p>
        </div>
        <InputSwitch
          checked={formData.isActive}
          onChange={(e) => handleSwitchChange("isActive", e.value)}
        />
      </div>
    </motion.div>
  );
};

const PreviewStep = ({ formData }) => {
  const [testDays, setTestDays] = useState(7);
  const [showCalculation, setShowCalculation] = useState(false);

  // Calculate test rental
  const calculateRental = () => {
    const chargedDays = Math.max(testDays, formData.minimumRentalPeriod);
    const weeks = Math.floor(chargedDays / 7);
    const remainingDays = chargedDays % 7;
    const billableDays = Math.min(remainingDays, formData.rentalDaysPerWeek);
    const totalBillableDays = (weeks * formData.rentalDaysPerWeek) + billableDays;

    return {
      requestedDays: testDays,
      chargedDays,
      weeks,
      remainingDays,
      billableDays,
      totalBillableDays
    };
  };

  const rental = calculateRental();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <MdPreview className="text-orange-500 text-xl mt-1" />
          <div>
            <h4 className="font-bold text-orange-900 mb-1">Preview & Test</h4>
            <p className="text-sm text-orange-800">
              Review your rate definition and test how it calculates rental charges.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FaCalculator />
            {formData.name || 'Untitled Rate Definition'}
          </h3>
          <p className="text-sm text-white/90 mt-1">{formData.description || 'No description provided'}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FaCalendarAlt className="text-3xl text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Minimum Rental</p>
              <p className="text-2xl font-bold text-gray-800">{formData.minimumRentalPeriod} days</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <FaClock className="text-3xl text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Billable Days/Week</p>
              <p className="text-2xl font-bold text-gray-800">{formData.rentalDaysPerWeek} days</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Tag 
              severity={formData.isActive ? "success" : "warning"}
              value={formData.isActive ? "Active" : "Inactive"}
              icon={formData.isActive ? "pi pi-check" : "pi pi-exclamation-triangle"}
            />
          </div>
        </div>
      </div>

      {/* Test Calculator */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FaPlay className="text-green-500" />
          Test Rate Calculator
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test with rental duration (days):
            </label>
            <div className="flex items-center gap-4">
              <InputNumber
                value={testDays}
                onValueChange={(e) => setTestDays(e.value || 1)}
                min={1}
                showButtons
                className="flex-1"
              />
              <Button
                label="Calculate"
                icon="pi pi-calculator"
                onClick={() => setShowCalculation(true)}
                className="bg-green-500 hover:bg-green-600"
              />
            </div>
          </div>

          <AnimatePresence>
            {showCalculation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <h5 className="font-semibold text-gray-700 mb-3">Calculation Result:</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Customer requests:</span>
                    <strong>{rental.requestedDays} days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Minimum period applied:</span>
                    <strong className={rental.chargedDays > rental.requestedDays ? 'text-orange-600' : ''}>
                      {rental.chargedDays} days
                    </strong>
                  </div>
                  <Divider />
                  <div className="flex justify-between">
                    <span>Full weeks:</span>
                    <strong>{rental.weeks} × {formData.rentalDaysPerWeek} days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining days:</span>
                    <strong>{rental.billableDays} days</strong>
                  </div>
                  <Divider />
                  <div className="flex justify-between text-lg font-bold text-green-600">
                    <span>Total billable days:</span>
                    <span>{rental.totalBillableDays} days</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
const CreateRateDefinitionElite = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rentalDaysPerWeek: 5,
    minimumRentalPeriod: 5,
    rateType: "Percentage",
    isActive: true,
    dayRates: Array(7).fill({ active: false, rate: "" }),
  });
  const [errors, setErrors] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const toast = useRef(null);
  const router = useRouter();
  const { token } = useSelector((state) => state?.authReducer);

  const steps = [
    { label: 'Basic Info', icon: 'pi pi-info-circle' },
    { label: 'Template', icon: 'pi pi-th-large' },
    { label: 'Configuration', icon: 'pi pi-cog' },
    { label: 'Preview & Create', icon: 'pi pi-eye' }
  ];

  const handleChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target?.value !== undefined ? e.target.value : e.value,
    });
    // Clear error when user types
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: null });
    }
  };

  const handleSwitchChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    if (template) {
      setFormData({
        ...formData,
        ...template.config,
        name: formData.name || `${template.name} Rate`,
        description: formData.description || template.description
      });
    }
    setActiveStep(2); // Skip to configuration
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Rate definition name is required';
      }
    }

    if (step === 2) {
      if (!formData.rentalDaysPerWeek || formData.rentalDaysPerWeek < 1 || formData.rentalDaysPerWeek > 7) {
        newErrors.rentalDaysPerWeek = 'Must be between 1 and 7';
      }
      if (!formData.minimumRentalPeriod || formData.minimumRentalPeriod < 1) {
        newErrors.minimumRentalPeriod = 'Must be at least 1 day';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${BaseURL}/rate-definition`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        },
      );
      
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Rate definition created successfully!",
        life: 3000,
      });

      setTimeout(() => {
        router.push("/system-setup/rate-definition/");
      }, 1000);
    } catch (error) {
      setLoading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to create rate definition",
        life: 3000,
      });
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <BasicInfoStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 1:
        return <TemplateSelectionStep onSelectTemplate={handleTemplateSelect} />;
      case 2:
        return <RateConfigurationStep 
          formData={formData} 
          handleChange={handleChange} 
          handleSwitchChange={handleSwitchChange}
          errors={errors} 
        />;
      case 3:
        return <PreviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FaCalculator className="text-orange-500" />
                Create Rate Definition
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Set up a new pricing structure for your rental products
              </p>
            </div>
            <CanceButton onClick={() => router.back()} />
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-6">
        <Card className="mb-6">
          <Steps 
            model={steps} 
            activeIndex={activeStep} 
            onSelect={(e) => setActiveStep(e.index)}
            readOnly={false}
            className="custom-steps"
          />
        </Card>

        {/* Step Content */}
        <Card className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <Divider />
          <div className="flex justify-between items-center">
            <div>
              {activeStep > 0 && (
                <Button
                  label="Back"
                  icon="pi pi-arrow-left"
                  onClick={handleBack}
                  className="p-button-text"
                />
              )}
            </div>
            <div className="flex gap-2">
              {activeStep < steps.length - 1 ? (
                <Button
                  label="Next"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  onClick={handleNext}
                  className="bg-blue-500 hover:bg-blue-600"
                />
              ) : (
                <Button
                  label="Create Rate Definition"
                  icon="pi pi-check"
                  iconPos="right"
                  onClick={handleSubmit}
                  loading={loading}
                  className="bg-green-500 hover:bg-green-600"
                />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Help Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white"
        onClick={() => {
          toast.current.show({
            severity: "info",
            summary: "Need Help?",
            detail: "Rate definitions control how your products are priced over rental periods.",
            life: 5000,
          });
        }}
      >
        <FaQuestionCircle className="text-xl" />
      </motion.button>

      {/* Tooltips */}
      <Tooltip target=".custom-tooltip" />
    </div>
  );
};

export default CreateRateDefinitionElite;