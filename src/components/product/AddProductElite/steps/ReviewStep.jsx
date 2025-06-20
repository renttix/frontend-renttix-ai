import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { motion } from "framer-motion";
import {
  FiCheck, FiEdit2, FiAlertCircle, FiPackage,
  FiDollarSign, FiImage, FiFileText, FiTag,
  FiCheckCircle, FiXCircle, FiClock, FiTruck,
  FiTool, FiCalendar
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { BaseURL } from "../../../../../utils/baseUrl";
import axios from "axios";

export default function ReviewStep({ 
  formData, 
  files, 
  previews, 
  onStepChange,
  isSubmitting 
}) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [listingConfirmed, setListingConfirmed] = useState(false);
  const [loadingTaxClasses, setLoadingTaxClasses] = useState(false);
  const [taxClasses, setTaxClasses] = useState([])
  const { token } = useSelector((state) => state?.authReducer);


    useEffect(() => {
      const fetchTaxClasses = async () => {
        setLoadingTaxClasses(true);
        try {
          const response = await axios.get(`${BaseURL}/tax-classes/product`, {
            headers: { authorization: `Bearer ${token}` },
          });
          setTaxClasses(response.data?.data || []);
        } catch (err) {
          console.error("Error fetching tax classes:", err);
        } finally {
          setLoadingTaxClasses(false);
        }
      };
      
      fetchTaxClasses();
    }, [ token]);

      const selectedTaxClass = taxClasses?.find(tc => tc._id === formData.taxClass);

  
  const getValidationStatus = () => {
    const issues = [];
    console.log({formData})
    
    // Check required fields
    if (!formData.productName?.trim()) issues.push("Product name is required");
    if (!formData.productDescription?.trim()) issues.push("Product description is required");
    if (!formData.category) issues.push("Category selection is required");
    if (!formData.rentPrice  || formData.rentPrice <= 0) issues.push("Valid price is required");
    if (!formData.quantity || formData.quantity <= 0) issues.push("Valid quantity is required");
    if (files.length === 0) issues.push("At least one product image is required");
    
    // Check optional but recommended fields
    const warnings = [];
    // if (!formData.brand) warnings.push("Adding a brand improves searchability");
    // if (!formData.model) warnings.push("Model information helps customers");
    // if (!formData.specifications?.length) warnings.push("Specifications provide important details");
    // if (files.length < 3) warnings.push("Multiple images increase rental likelihood");
    
    return { issues, warnings };
  };
  
  const { issues, warnings } = getValidationStatus();
  const isValid = issues.length === 0 && termsAccepted && listingConfirmed;
  console.log({isValid,issues,warnings})
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  const SectionCard = ({ title, icon, children, stepIndex, hasIssue }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: stepIndex * 0.1 }}
      className={`
        bg-white rounded-xl shadow-sm border p-6
        ${hasIssue ? 'border-red-200' : 'border-gray-200'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </h3>
        <Button
          icon={<FiEdit2 />}
          className="p-button-text p-button-sm"
          onClick={() => onStepChange(stepIndex)}
          tooltip="Edit this section"
          tooltipOptions={{ position: 'left' }}
        />
      </div>
      {children}
    </motion.div>
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiFileText className="mr-3 text-blue-600" />
          Review Your Listing
        </h2>
        <p className="mt-2 text-gray-600">
          Review all details before publishing your product
        </p>
      </div>
      
      {/* Validation Status */}
      {(issues.length > 0 || warnings.length > 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          {issues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 flex items-center mb-2">
                <FiXCircle className="mr-2" />
                Required Information Missing
              </h4>
              <ul className="space-y-1">
                {issues.map((issue, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start">
                    <span className="mr-2">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 flex items-center mb-2">
                <FiAlertCircle className="mr-2" />
                Recommendations
              </h4>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start">
                    <span className="mr-2">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Review Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <SectionCard
          title="Basic Information"
          icon={<FiPackage className="text-blue-600" />}
          stepIndex={0}
          hasIssue={!formData.name || !formData.description}
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Product Name</p>
              <p className="font-medium text-gray-900">{formData.productName || 'Not provided'}</p>
            </div>
            {/* <div>
              <p className="text-sm text-gray-500">Brand</p>
              <p className="font-medium text-gray-900">{formData.brand || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <p className="font-medium text-gray-900">{formData.model || 'Not specified'}</p>
            </div> */}
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-700 text-sm line-clamp-3">
                {formData.productDescription || 'No description provided'}
              </p>
            </div>
          </div>
        </SectionCard>
        
        {/* Categories */}
        <SectionCard
          title="Categories"
          icon={<FiTag className="text-purple-600" />}
          stepIndex={1}
          hasIssue={!formData.category}
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Main Category</p>
              <p className="font-medium text-gray-900">
                {formData.category || 'Not selected'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subcategory</p>
              <p className="font-medium text-gray-900">
                {formData.subcategory || 'Not selected'}
              </p>
            </div>
            {formData.tags?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
        
        {/* Pricing */}
        <SectionCard
          title="Pricing"
          icon={<FiDollarSign className="text-green-600" />}
          stepIndex={2}
          hasIssue={!formData.price || formData.price <= 0}
        >
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Rental Price</p>
              <p className="text-2xl font-bold text-green-700">
                {formatPrice(formData.salePrice ||formData.rentPrice || 0)}
                <span className="text-sm font-normal text-gray-600 ml-2">
                  per {formData.priceUnit || 'day'}
                </span>
              </p>
            </div>
            
            {formData.pricingTiers?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Volume Discounts</p>
                <div className="space-y-1">
                  {formData.pricingTiers.map((tier, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {tier.minDays}+ days
                      </span>
                      <span className="font-medium text-gray-900">
                        {tier.discount}% off
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Deposit</p>
                <p className="font-medium">
                  {formData.depositRequired 
                    ? formatPrice(formData.depositAmount || 0)
                    : 'Not required'
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-500">Tax Rate</p>
                <p className="font-medium">{selectedTaxClass?.taxRate}%</p>
              </div>
            </div>
          </div>
        </SectionCard>
        
        {/* Specifications */}
        <SectionCard
          title="Specifications"
          icon={<FiFileText className="text-orange-600" />}
          stepIndex={3}
          hasIssue={!formData.quantity || formData.quantity <= 0}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500">Quantity Available</p>
                <p className="font-medium text-gray-900">{formData.quantity || 0} units</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="font-medium text-gray-900">{formData.condition || 'Not specified'}</p>
              </div>
            </div>
            
            {(formData.width || formData.height || formData.length || formData.weight) && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Dimensions & Weight</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {formData.width && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Width:</span>
                      <span className="font-medium">{formData.width} {formData.dimensionUnit}</span>
                    </div>
                  )}
                  {formData.height && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Height:</span>
                      <span className="font-medium">{formData.height} {formData.dimensionUnit}</span>
                    </div>
                  )}
                  {formData.length && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Length:</span>
                      <span className="font-medium">{formData.length} {formData.dimensionUnit}</span>
                    </div>
                  )}
                  {formData.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{formData.weight} {formData.weightUnit}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {formData.specifications?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Custom Specifications</p>
                <div className="space-y-1">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{spec.name}:</span>
                      <span className="font-medium text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
        
        {/* Maintenance */}
        {formData.maintenanceConfig?.requiresMaintenance && (
          <SectionCard
            title="Maintenance"
            icon={<FiTool className="text-orange-600" />}
            stepIndex={4}
            hasIssue={false}
          >
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Maintenance Required</p>
                <p className="font-medium text-gray-900">Yes</p>
              </div>
              
              {formData.maintenanceConfig?.schedules?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Maintenance Schedules</p>
                  <div className="space-y-2">
                    {formData.maintenanceConfig.schedules.map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
                        <div className="flex items-center">
                          <FiCalendar className="text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{schedule.name || 'Unnamed Schedule'}</p>
                            <p className="text-xs text-gray-600">
                              Every {schedule.frequency.value} {schedule.frequency.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${schedule.estimatedCost || 0}</p>
                          <p className="text-xs text-gray-600">{schedule.priority} priority</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.maintenanceConfig?.returnInspection?.required && (
                <div>
                  <p className="text-sm text-gray-500">Return Inspection</p>
                  <p className="font-medium text-gray-900">Required</p>
                </div>
              )}
              
              <div className="bg-blue-50 rounded p-3">
                <p className="text-sm font-medium text-blue-900">
                  Estimated Annual Cost: ${
                    formData.maintenanceConfig?.schedules?.reduce((total, schedule) => {
                      const yearlyOccurrences = schedule.type === 'regular'
                        ? Math.floor(365 / (schedule.frequency.value || 1))
                        : 12;
                      return total + ((schedule.estimatedCost || 0) * yearlyOccurrences);
                    }, 0).toFixed(2)
                  }
                </p>
              </div>
            </div>
          </SectionCard>
        )}
      </div>
      
      {/* Media Summary */}
      <SectionCard
        title="Media"
        icon={<FiImage className="text-indigo-600" />}
        stepIndex={5}
        hasIssue={files.length === 0}
      >
        {files.length > 0 ? (
          <div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-3">
              {previews.slice(0, 5).map((item, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {item.type === 'image' && (
                    <img
                      src={item.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {item.type === 'video' && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <FiVideo className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {item.type === 'document' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiFile className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
              {files.length > 5 && (
                <div className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">+{files.length - 5}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {files.length} file{files.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No media uploaded</p>
        )}
      </SectionCard>
      
      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Listing Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FiClock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Availability</p>
              <p className="font-medium text-gray-900">
                {formData.availableNow ? 'Immediately' : 'Scheduled'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FiTruck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivery</p>
              <p className="font-medium text-gray-900">
                {formData.deliveryAvailable ? 'Available' : 'Pickup only'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Insurance</p>
              <p className="font-medium text-gray-900">
                {formData.insuranceRequired ? 'Required' : 'Optional'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Terms and Confirmation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Terms & Confirmation
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <Checkbox
              inputId="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="ml-3 text-sm text-gray-700 cursor-pointer">
              I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and 
              <a href="#" className="text-blue-600 hover:underline ml-1">Rental Agreement</a>. 
              I understand that false or misleading information may result in account suspension.
            </label>
          </div>
          
          <div className="flex items-start">
            <Checkbox
              inputId="confirm"
              checked={listingConfirmed}
              onChange={(e) => setListingConfirmed(e.checked)}
              className="mt-1"
            />
            <label htmlFor="confirm" className="ml-3 text-sm text-gray-700 cursor-pointer">
              I confirm that all information provided is accurate and that I have the right to rent this product.
            </label>
          </div>
        </div>
      </motion.div>
      
      {/* Submit Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center"
      >
        <FiCheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ready to Publish?
        </h3>
        <p className="text-gray-600 mb-6">
          Your product will be live immediately after submission
        </p>
        
        <Button
          label={isSubmitting ? "Publishing..." : "Publish Product"}
          icon={<FiCheck className="mr-2" />}
          className="p-button-lg"
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
        />
        
        {!isValid && (
          <p className="text-sm text-red-600 mt-3">
            Please complete all required fields and accept the terms
          </p>
        )}
      </motion.div>
    </div>
  );
}