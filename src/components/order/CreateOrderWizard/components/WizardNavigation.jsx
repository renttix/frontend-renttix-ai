"use client";
import React from 'react';
import { useWizard } from '../context/WizardContext';
import { Button } from 'primereact/button';
import { motion } from 'framer-motion';

const TOTAL_STEPS = 4;

export default function WizardNavigation({ onSubmit }) {
  const { state, setStep, completeStep, saveDraft, resetWizard } = useWizard();
  const { currentStep, validation, isLoading, formData } = state;
  
  const canGoBack = currentStep > 1;
  const canGoForward = currentStep < TOTAL_STEPS;
  const isLastStep = currentStep === TOTAL_STEPS;
  
  // Check if current step has validation errors
  const hasErrors = validation[currentStep] && Object.keys(validation[currentStep]).length > 0;
  
  // Check if terms are accepted on last step
  const termsAccepted = formData.termsAccepted || false;
  const canSubmit = isLastStep && !hasErrors && termsAccepted;
  
  const handlePrevious = () => {
    if (canGoBack) {
      setStep(currentStep - 1);
    }
  };
  
  const handleNext = () => {
    if (canGoForward && !hasErrors) {
      completeStep(currentStep);
      setStep(currentStep + 1);
    }
  };
  
  const handleSaveAndExit = () => {
    saveDraft();
    // Navigate back to orders list
    window.location.href = '/order/list';
  };
  
  const handleSubmit = async () => {
    if (canSubmit && onSubmit) {
      await onSubmit();
    }
  };
  
  return (
    <motion.div 
      className="mt-8 border-t pt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left side - Previous button */}
        <div className="order-2 sm:order-1">
          {canGoBack && (
            <Button
              label="Previous Step"
              icon="pi pi-arrow-left"
              className="p-button-text p-button-secondary"
              onClick={handlePrevious}
              disabled={isLoading}
            />
          )}
        </div>
        
        {/* Center - Save & Exit */}
        <div className="order-1 sm:order-2 w-full sm:w-auto">
          <Button
            label="Save & Exit"
            icon="pi pi-save"
            className="p-button-outlined p-button-secondary w-full sm:w-auto"
            onClick={handleSaveAndExit}
            disabled={isLoading}
          />
        </div>
        
        {/* Right side - Next/Submit button */}
        <div className="order-3">
          {isLastStep ? (
            <Button
              label={isLoading ? "Creating Order..." : "Create Order"}
              icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-check"}
              className="p-button-success"
              onClick={handleSubmit}
              disabled={!canSubmit || isLoading}
              loading={isLoading}
            />
          ) : (
            <Button
              label="Next Step"
              icon="pi pi-arrow-right"
              iconPos="right"
              className="p-button-primary"
              onClick={handleNext}
              disabled={hasErrors || isLoading}
            />
          )}
        </div>
      </div>
      
      {/* Error message */}
      {hasErrors && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md"
        >
          <p className="text-sm text-red-600 flex items-center">
            <i className="pi pi-exclamation-circle mr-2"></i>
            Please fix the errors above before proceeding.
          </p>
        </motion.div>
      )}
      
      {/* Terms not accepted message */}
      {isLastStep && !termsAccepted && !hasErrors && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
        >
          <p className="text-sm text-yellow-600 flex items-center">
            <i className="pi pi-info-circle mr-2"></i>
            Please accept the terms and conditions to submit the order.
          </p>
        </motion.div>
      )}
      
      {/* Draft saved indicator and delete button */}
      {state.draft.lastSaved && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-center space-y-2"
        >
          <p className="text-xs text-gray-500">
            Draft saved {new Date(state.draft.lastSaved).toLocaleTimeString()}
          </p>
          <Button
            label="Delete Draft"
            icon="pi pi-trash"
            className="p-button-text p-button-danger p-button-sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
                resetWizard();
                window.location.href = '/order/list';
              }
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
