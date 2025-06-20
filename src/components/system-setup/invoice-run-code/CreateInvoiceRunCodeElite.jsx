"use client";
import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
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
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from "primereact/dropdown";
import { 
  FaBarcode, 
  FaChartLine, 
  FaFileInvoice, 
  FaInfoCircle,
  FaLightbulb,
  FaRocket,
  FaShieldAlt,
  FaClock,
  FaUsers,
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
  FaChevronLeft,
  FaCode,
  FaHashtag,
  FaClipboard,
  FaRandom,
  FaCog,
  FaEye
} from "react-icons/fa";
import { MdPreview, MdSettings, MdInfo, MdAutorenew } from "react-icons/md";

// Code format templates
const codeTemplates = [
  {
    id: 'monthly',
    name: 'Monthly Billing',
    description: 'For regular monthly invoice runs',
    icon: FaCalendarAlt,
    color: 'blue',
    format: 'MON-{YYYY}-{MM}',
    example: 'MON-2024-01',
    pattern: /^MON-\d{4}-\d{2}$/
  },
  {
    id: 'customer-type',
    name: 'Customer Type',
    description: 'Group by customer categories',
    icon: FaUsers,
    color: 'green',
    format: '{TYPE}-{NNN}',
    example: 'RES-001',
    pattern: /^[A-Z]{3}-\d{3}$/
  },
  {
    id: 'department',
    name: 'Department Code',
    description: 'For departmental billing',
    icon: FaBuilding,
    color: 'purple',
    format: 'DEPT-{AAA}',
    example: 'DEPT-FIN',
    pattern: /^DEPT-[A-Z]{3}$/
  },
  {
    id: 'sequential',
    name: 'Sequential Number',
    description: 'Simple numeric sequence',
    icon: FaHashtag,
    color: 'orange',
    format: '{NNNN}',
    example: '0001',
    pattern: /^\d{4}$/
  },
  {
    id: 'custom',
    name: 'Custom Format',
    description: 'Create your own pattern',
    icon: FaCog,
    color: 'gray',
    format: 'Custom',
    example: 'Your format',
    pattern: null
  }
];

// Import missing icons
import { FaCalendarAlt, FaBuilding } from "react-icons/fa";

// Step components
const PurposeStep = ({ formData, handleChange, errors }) => {
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
            <h4 className="font-bold text-blue-900 mb-1">What are Invoice Run Codes?</h4>
            <p className="text-sm text-blue-800">
              Invoice run codes are unique identifiers used to group and process invoices in batches. 
              They help organize your billing by customer type, billing cycle, department, or any 
              custom criteria that fits your business workflow.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Code Name
            <span className="text-red-500 ml-1">*</span>
            <Tooltip target=".name-help" />
            <FaQuestionCircle 
              className="inline ml-2 text-gray-400 cursor-help name-help" 
              data-pr-tooltip="Give your code a descriptive name that explains its purpose"
            />
          </label>
          <InputText
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Monthly Residential Billing, Corporate Accounts"
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
              data-pr-tooltip="Describe when and how this code should be used"
            />
          </label>
          <InputTextarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the purpose and usage of this invoice run code..."
            rows={4}
            className="w-full"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" />
            Common Use Cases
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <div>
                <strong>Monthly Billing:</strong> Process all monthly subscriptions on the 1st
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <div>
                <strong>Customer Groups:</strong> Bill residential and commercial separately
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <div>
                <strong>Department Billing:</strong> Track invoices by department or cost center
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <div>
                <strong>Special Campaigns:</strong> Group promotional or seasonal billing
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FormatSelectionStep = ({ onSelectTemplate, selectedTemplate }) => {
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
            <h4 className="font-bold text-purple-900 mb-1">Choose a Code Format</h4>
            <p className="text-sm text-purple-800">
              Select a pre-defined format that matches your billing workflow, or create a custom pattern.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {codeTemplates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate?.id === template.id;
          
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
                ${isSelected 
                  ? `border-${template.color}-500 bg-${template.color}-50 shadow-lg` 
                  : hoveredTemplate === template.id 
                    ? `border-${template.color}-300 shadow-md` 
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
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <FaCode className="text-gray-400" />
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {template.format}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <FaEye className="text-gray-400" />
                      <span className="text-gray-600">Example: </span>
                      <Tag value={template.example} severity="success" />
                    </div>
                  </div>
                </div>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <FaCheckCircle className={`text-${template.color}-500 text-xl`} />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FaLightbulb className="text-yellow-500 text-lg mt-1" />
          <div className="text-sm">
            <h5 className="font-bold text-yellow-900 mb-1">Format Placeholders</h5>
            <ul className="space-y-1 text-yellow-800">
              <li>• <code className="bg-yellow-100 px-1">{'{YYYY}'}</code> - 4-digit year (2024)</li>
              <li>• <code className="bg-yellow-100 px-1">{'{MM}'}</code> - 2-digit month (01-12)</li>
              <li>• <code className="bg-yellow-100 px-1">{'{NNN}'}</code> - 3-digit number (001-999)</li>
              <li>• <code className="bg-yellow-100 px-1">{'{AAA}'}</code> - 3 letters (ABC)</li>
              <li>• <code className="bg-yellow-100 px-1">{'{TYPE}'}</code> - Custom prefix</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CodeConfigurationStep = ({ formData, handleChange, selectedTemplate, errors }) => {
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCode = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let code = '';
      
      switch (selectedTemplate?.id) {
        case 'monthly':
          const now = new Date();
          code = `MON-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'customer-type':
          const types = ['RES', 'COM', 'IND', 'GOV'];
          const type = types[Math.floor(Math.random() * types.length)];
          const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
          code = `${type}-${num}`;
          break;
        case 'department':
          const depts = ['FIN', 'OPS', 'SAL', 'MKT', 'HRM'];
          code = `DEPT-${depts[Math.floor(Math.random() * depts.length)]}`;
          break;
        case 'sequential':
          code = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
          break;
        default:
          code = formData.code || 'CUSTOM-001';
      }
      
      setGeneratedCode(code);
      handleChange('code', code);
      setIsGenerating(false);
    }, 500);
  };

  useEffect(() => {
    if (selectedTemplate && !formData.code) {
      generateCode();
    }
  }, [selectedTemplate]);

  const validateCode = (code) => {
    if (!code) return { valid: false, message: 'Code is required' };
    
    if (selectedTemplate?.pattern) {
      const isValid = selectedTemplate.pattern.test(code);
      return {
        valid: isValid,
        message: isValid ? 'Valid format' : `Must match pattern: ${selectedTemplate.format}`
      };
    }
    
    // Basic validation for custom codes
    if (code.length < 3) return { valid: false, message: 'Code must be at least 3 characters' };
    if (code.length > 20) return { valid: false, message: 'Code must be less than 20 characters' };
    if (!/^[A-Z0-9-]+$/.test(code)) return { valid: false, message: 'Only uppercase letters, numbers, and hyphens allowed' };
    
    return { valid: true, message: 'Valid code format' };
  };

  const validation = validateCode(formData.code);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaCode className="text-green-500 text-xl mt-1" />
          <div>
            <h4 className="font-bold text-green-900 mb-1">Configure Your Code</h4>
            <p className="text-sm text-green-800">
              {selectedTemplate?.id === 'custom' 
                ? 'Create your own unique code format'
                : `Generate or customize your ${selectedTemplate?.name} code`
              }
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Code Generator */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Invoice Run Code
            <span className="text-red-500 ml-1">*</span>
          </label>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <InputText
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="Enter or generate code"
                className={`w-full font-mono text-lg ${errors.code || !validation.valid ? 'p-invalid' : ''}`}
              />
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${validation.valid ? 'text-green-500' : 'text-red-500'}`}>
                {validation.valid ? <FaCheckCircle /> : <FaExclamationTriangle />}
              </div>
            </div>
            
            <Button
              icon={isGenerating ? "pi pi-spin pi-spinner" : "pi pi-refresh"}
              onClick={generateCode}
              disabled={isGenerating}
              className="bg-blue-500 hover:bg-blue-600"
              tooltip="Generate new code"
            />
          </div>
          
          <small className={`text-xs mt-1 ${validation.valid ? 'text-green-600' : 'text-red-500'}`}>
            {errors.code || validation.message}
          </small>
        </div>

        {/* Code Preview */}
        <div className="bg-gray-900 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-400 mb-2">Your Invoice Run Code</p>
          <div className="text-3xl font-mono text-green-400 mb-4">
            {formData.code || 'XXXX-XXX'}
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FaBarcode />
              Format: {selectedTemplate?.name || 'Custom'}
            </span>
            <span className="flex items-center gap-1">
              <FaShieldAlt />
              {validation.valid ? 'Valid' : 'Invalid'}
            </span>
          </div>
        </div>

        {/* Format Information */}
        {selectedTemplate && selectedTemplate.id !== 'custom' && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FaInfoCircle />
              About {selectedTemplate.name} Format
            </h5>
            <div className="space-y-2 text-sm text-blue-800">
              <p>{selectedTemplate.description}</p>
              <div className="flex items-center gap-2">
                <span>Pattern:</span>
                <code className="bg-blue-100 px-2 py-1 rounded font-mono">
                  {selectedTemplate.format}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span>Example:</span>
                <Tag value={selectedTemplate.example} severity="info" />
              </div>
            </div>
          </div>
        )}

        {/* Best Practices */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" />
            Best Practices
          </h5>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Keep codes short and meaningful</li>
            <li>• Use consistent formatting across your organization</li>
            <li>• Include date elements for time-based billing</li>
            <li>• Avoid special characters except hyphens</li>
            <li>• Document the meaning of code prefixes</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

const PreviewStep = ({ formData, selectedTemplate }) => {
  const [showExample, setShowExample] = useState(false);

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
            <h4 className="font-bold text-orange-900 mb-1">Review Your Invoice Run Code</h4>
            <p className="text-sm text-orange-800">
              Confirm all details before creating your invoice run code.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FaBarcode />
            {formData.name || 'Untitled Invoice Run Code'}
          </h3>
          <p className="text-sm text-white/90 mt-1">{formData.description || 'No description provided'}</p>
        </div>
        
        <div className="p-6">
          {/* Code Display */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Invoice Run Code</p>
            <div className="text-4xl font-mono text-green-400 mb-4">
              {formData.code}
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <Tag 
                severity="success" 
                value={selectedTemplate?.name || 'Custom Format'}
                icon="pi pi-check"
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FaCode className="text-3xl text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Format Type</p>
              <p className="text-lg font-bold text-gray-800">{selectedTemplate?.name || 'Custom'}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <FaCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-bold text-gray-800">Ready to Create</p>
            </div>
          </div>

          {/* Usage Example */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowExample(!showExample)}
              className="w-full text-left flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <FaEye />
                How it will appear on invoices
              </span>
              <FaChevronRight className={`text-gray-400 transition-transform ${showExample ? 'rotate-90' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showExample && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 rounded-lg mt-2">
                    <div className="bg-white border border-gray-200 rounded p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h5 className="font-bold text-gray-800">INVOICE</h5>
                          <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Run Code</p>
                          <p className="font-mono font-bold text-lg">{formData.code}</p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600">
                          This invoice is part of batch: <strong>{formData.name}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <FaRocket />
          What happens next?
        </h5>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <FaCheckCircle className="text-green-500 mt-0.5" />
            <span>Your invoice run code will be created and ready to use immediately</span>
          </li>
          <li className="flex items-start gap-2">
            <FaCheckCircle className="text-green-500 mt-0.5" />
            <span>You can assign this code to customers and orders</span>
          </li>
          <li className="flex items-start gap-2">
            <FaCheckCircle className="text-green-500 mt-0.5" />
            <span>Use it to generate batch invoices with a single click</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

// Main Component
const CreateInvoiceRunCodeElite = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: ""
  });
  const [errors, setErrors] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const toast = useRef(null);
  const router = useRouter();
  const { token } = useSelector((state) => state?.authReducer);

  const steps = [
    { label: 'Purpose', icon: 'pi pi-info-circle' },
    { label: 'Format', icon: 'pi pi-th-large' },
    { label: 'Configure', icon: 'pi pi-cog' },
    { label: 'Review & Create', icon: 'pi pi-eye' }
  ];

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Clear the code when switching templates
    setFormData({ ...formData, code: '' });
    if (template) {
      setActiveStep(2); // Go to configuration
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Code name is required';
      }
    }

    if (step === 2) {
      if (!formData.code.trim()) {
        newErrors.code = 'Invoice run code is required';
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
        `${BaseURL}/invoice-run-code/`,
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
        detail: "Invoice run code created successfully!",
        life: 3000,
      });

      setTimeout(() => {
        router.push("/system-setup/invoice-run-code/");
      }, 1000);
    } catch (error) {
      setLoading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to create invoice run code",
        life: 3000,
      });
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <PurposeStep formData={formData} handleChange={handleChange} errors={errors} />;
      case 1:
        return <FormatSelectionStep onSelectTemplate={handleTemplateSelect} selectedTemplate={selectedTemplate} />;
      case 2:
        return <CodeConfigurationStep 
          formData={formData} 
          handleChange={handleChange} 
          selectedTemplate={selectedTemplate}
          errors={errors} 
        />;
      case 3:
        return <PreviewStep formData={formData} selectedTemplate={selectedTemplate} />;
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
                <FaBarcode className="text-blue-500" />
                Create Invoice Run Code
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Set up a new code for batch invoice processing
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
                  label="Create Invoice Run Code"
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white"
        onClick={() => {
          toast.current.show({
            severity: "info",
            summary: "Need Help?",
            detail: "Invoice run codes help organize your billing by grouping invoices for batch processing.",
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

export default CreateInvoiceRunCodeElite;