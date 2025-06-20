"use client";
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { RadioButton } from 'primereact/radiobutton';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Tooltip } from 'primereact/tooltip';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';

export default function BasicInfoStep() {
  const { state, updateFormData, completeStep, setValidation } = useWizard();
  const { formData } = state;
  const { token, user } = useSelector((state) => state?.authReducer);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  
  
  // Check for duplicate company name - DISABLED (endpoint doesn't exist)
  // const checkDuplicateName = async (name) => {
  //   if (!name || name.length < 3) return;
    
  //   try {
  //     setCheckingDuplicate(true);
  //     const response = await axios.get(
  //       `${BaseURL}/customer/check-duplicate?name=${encodeURIComponent(name)}`,
  //       {
  //         headers: { authorization: `Bearer ${token}` },
  //       }
  //     );
  //     setDuplicateFound(response.data.exists);
  //   } catch (error) {
  //     console.error('Failed to check duplicate:', error);
  //   } finally {
  //     setCheckingDuplicate(false);
  //   }
  // };
  
  // Debounced name check - DISABLED
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (formData.customerType === 'company' && formData.companyName) {
  //       checkDuplicateName(formData.companyName);
  //     } else if (formData.customerType === 'individual' && formData.name) {
  //       checkDuplicateName(`${formData.name} ${formData.lastName || ''}`);
  //     }
  //   }, 500);
    
  //   return () => clearTimeout(timer);
  // }, [formData.companyName, formData.name, formData.lastName, formData.customerType]);
  
  const handleLogoUpload = (event) => {
    const file = event.files[0];
    if (file) {
      updateFormData({ logo: file });
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };
  
  const validateStep = () => {
    const newErrors = {};
    
    if (formData.customerType === 'company') {
      if (!formData.companyName) {
        newErrors.companyName = 'Company name is required';
      }
    } else {
      if (!formData.name) {
        newErrors.name = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
    }
    
    
    setErrors(newErrors);
    setValidation(1, newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate on form data changes
  useEffect(() => {
    validateStep();
  }, [formData.customerType, formData.companyName, formData.name, formData.lastName]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with the essential details about your customer</p>
      </div>
      
      {/* Customer Type Selection */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Customer Type</h3>
        <div className="flex gap-6 mb-6">
          <div className="flex items-center">
            <RadioButton
              inputId="company"
              name="customerType"
              value="company"
              onChange={(e) => updateFormData({ customerType: e.value })}
              checked={formData.customerType === 'company'}
            />
            <label htmlFor="company" className="ml-2 cursor-pointer">
              <i className="pi pi-building mr-2"></i>
              Company
            </label>
          </div>
          <div className="flex items-center">
            <RadioButton
              inputId="individual"
              name="customerType"
              value="individual"
              onChange={(e) => updateFormData({ customerType: e.value })}
              checked={formData.customerType === 'individual'}
            />
            <label htmlFor="individual" className="ml-2 cursor-pointer">
              <i className="pi pi-user mr-2"></i>
              Individual
            </label>
          </div>
        </div>
        
        {/* Dynamic fields based on customer type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.customerType === 'company' ? (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <InputText
                    value={formData.companyName || ''}
                    onChange={(e) => updateFormData({ companyName: e.target.value })}
                    className={`w-full ${errors.companyName ? 'p-invalid' : ''}`}
                    placeholder="Enter company name"
                  />
                </div>
                {errors.companyName && (
                  <small className="text-red-500">{errors.companyName}</small>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Trading Name</label>
                <InputText
                  value={formData.tradingName || ''}
                  onChange={(e) => updateFormData({ tradingName: e.target.value })}
                  className="w-full"
                  placeholder="DBA or trading as"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Registration Number</label>
                <InputText
                  value={formData.registrationNumber || ''}
                  onChange={(e) => updateFormData({ registrationNumber: e.target.value })}
                  className="w-full"
                  placeholder="Company registration"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">VAT Number</label>
                <InputText
                  value={formData.vatNumber || ''}
                  onChange={(e) => updateFormData({ vatNumber: e.target.value })}
                  className="w-full"
                  placeholder="VAT registration"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tax ID</label>
                <InputText
                  value={formData.taxId || ''}
                  onChange={(e) => updateFormData({ taxId: e.target.value })}
                  className="w-full"
                  placeholder="Tax identification"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={formData.name || ''}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  className={`w-full ${errors.name ? 'p-invalid' : ''}`}
                  placeholder="Enter first name"
                />
                {errors.name && (
                  <small className="text-red-500">{errors.name}</small>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={formData.lastName || ''}
                  onChange={(e) => updateFormData({ lastName: e.target.value })}
                  className={`w-full ${errors.lastName ? 'p-invalid' : ''}`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <small className="text-red-500">{errors.lastName}</small>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tax ID / SSN</label>
                <InputText
                  value={formData.taxId || ''}
                  onChange={(e) => updateFormData({ taxId: e.target.value })}
                  className="w-full"
                  placeholder="Tax identification"
                />
              </div>
            </>
          )}
        </div>
      </Card>
      
      {/* Logo/Avatar Upload */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">
          {formData.customerType === 'company' ? 'Company Logo' : 'Profile Picture'}
        </h3>
        <div className="flex items-center gap-6">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo preview"
              className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
              <i className="pi pi-image text-2xl text-gray-400"></i>
            </div>
          )}
          
          <div className="flex-1">
            <FileUpload
              mode="basic"
              accept="image/*"
              maxFileSize={5000000}
              onSelect={handleLogoUpload}
              chooseLabel="Upload Image"
              className="p-button-outlined"
            />
            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG or GIF (max. 5MB)
            </p>
          </div>
        </div>
      </Card>
      
      {/* KYC Documents */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">KYC Documents</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload identification documents for compliance (optional at this stage)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <i className="pi pi-id-card text-3xl text-gray-400 mb-2"></i>
            <p className="text-sm font-medium mb-2">ID Document</p>
            <Button
              label="Upload"
              icon="pi pi-upload"
              className="p-button-sm p-button-outlined"
              onClick={() => {/* Will implement document upload */}}
            />
          </div>
          
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <i className="pi pi-home text-3xl text-gray-400 mb-2"></i>
            <p className="text-sm font-medium mb-2">Proof of Address</p>
            <Button
              label="Upload"
              icon="pi pi-upload"
              className="p-button-sm p-button-outlined"
              onClick={() => {/* Will implement document upload */}}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}