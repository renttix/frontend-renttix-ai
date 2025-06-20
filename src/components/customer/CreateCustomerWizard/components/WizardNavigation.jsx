"use client";
import React from 'react';
import { useWizard } from '../context/WizardContext';
import { Button } from 'primereact/button';
import { motion } from 'framer-motion';

export default function WizardNavigation({ onSubmit }) {
  const { state, prevStep, nextStep, completeStep } = useWizard();
  const { currentStep, totalSteps, validation, loading } = state;
  
  const canProceed = () => {
    const currentStepErrors = validation[currentStep] || {};
    const hasNoErrors = Object.keys(currentStepErrors).length === 0;
    
    // Special check for review step - ensure terms are accepted
    if (currentStep === totalSteps) {
      const { formData } = state;
      return hasNoErrors && formData.termsAccepted && formData.dataPrivacyAccepted;
    }
    
    return hasNoErrors;
  };
  
  const handleNext = () => {
    if (canProceed()) {
      completeStep(currentStep);
      if (currentStep === totalSteps) {
        onSubmit();
      } else {
        nextStep();
      }
    }
  };
  
  const getNextButtonLabel = () => {
    if (currentStep === totalSteps) {
      return loading ? 'Creating Customer...' : 'Create Customer';
    }
    return 'Continue';
  };
  
  const getNextButtonIcon = () => {
    if (currentStep === totalSteps) {
      return loading ? 'pi pi-spin pi-spinner' : 'pi pi-check';
    }
    return 'pi pi-arrow-right';
  };
  
  return (
    <motion.div
      className="mt-8 flex items-center justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div>
        {currentStep > 1 && (
          <Button
            label="Previous"
            icon="pi pi-arrow-left"
            className="p-button-text"
            onClick={prevStep}
            disabled={loading}
          />
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Step indicator for desktop */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <span>Step {currentStep} of {totalSteps}</span>
        </div>
        
        <Button
          label={getNextButtonLabel()}
          icon={getNextButtonIcon()}
          iconPos="right"
          onClick={handleNext}
          disabled={loading || !canProceed()}
          className={currentStep === totalSteps ? 'p-button-success' : ''}
          loading={loading}
        />
      </div>
    </motion.div>
  );
}