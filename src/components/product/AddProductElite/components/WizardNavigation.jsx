import React from "react";
import { Button } from "primereact/button";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck, FiLoader } from "react-icons/fi";

export default function WizardNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  canGoBack,
  canGoNext,
  isLastStep
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 flex items-center justify-between"
    >
      <div>
        {canGoBack && (
          <Button
            label="Previous"
            icon={<FiArrowLeft className="mr-2" />}
            onClick={onPrevious}
            className="p-button-text p-button-secondary"
            disabled={isSubmitting}
          />
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </span>
        
        {isLastStep ? (
          <Button
            label={isSubmitting ? "Creating Product..." : "Create Product"}
            icon={isSubmitting ? <FiLoader className="mr-2 animate-spin" /> : <FiCheck className="mr-2" />}
            onClick={onSubmit}
            className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 px-6"
            disabled={isSubmitting}
          />
        ) : (
          <Button
            label="Next"
            icon={<FiArrowRight className="ml-2" />}
            iconPos="right"
            onClick={onNext}
            className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 px-6"
            disabled={!canGoNext || isSubmitting}
          />
        )}
      </div>
    </motion.div>
  );
}