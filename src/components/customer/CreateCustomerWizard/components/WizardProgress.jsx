"use client";
import React from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';

const steps = [
  { number: 1, title: 'Basic Info', icon: 'pi-user' },
  { number: 2, title: 'Contact', icon: 'pi-phone' },
  { number: 3, title: 'Address', icon: 'pi-map-marker' },
  { number: 4, title: 'Financial', icon: 'pi-credit-card' },
  { number: 5, title: 'Review', icon: 'pi-check-circle' },
];

export default function WizardProgress() {
  const { state } = useWizard();
  const { currentStep, completedSteps } = state;
  
  const getStepStatus = (stepNumber) => {
    if (stepNumber === currentStep) return 'current';
    if (completedSteps.includes(stepNumber)) return 'completed';
    return 'pending';
  };
  
  const getProgressWidth = () => {
    const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
    return `${progress}%`;
  };
  
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative">
          {/* Progress Bar Background */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
          
          {/* Progress Bar Fill */}
          <motion.div
            className="absolute top-5 left-0 h-1 bg-blue-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: getProgressWidth() }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
          
          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step) => {
              const status = getStepStatus(step.number);
              
              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      transition-all duration-300 relative z-10
                      ${status === 'current' ? 'bg-blue-600 text-white shadow-lg scale-110' : ''}
                      ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                      ${status === 'pending' ? 'bg-gray-200 text-gray-500' : ''}
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {status === 'completed' ? (
                      <i className="pi pi-check text-sm"></i>
                    ) : (
                      <i className={`pi ${step.icon} text-sm`}></i>
                    )}
                  </motion.div>
                  
                  <div className="mt-2 text-center">
                    <p className={`
                      text-xs font-medium
                      ${status === 'current' ? 'text-blue-600' : ''}
                      ${status === 'completed' ? 'text-green-600' : ''}
                      ${status === 'pending' ? 'text-gray-500' : ''}
                    `}>
                      {step.title}
                    </p>
                  </div>
                  
                  {status === 'current' && (
                    <motion.div
                      className="absolute -bottom-1 w-2 h-2 bg-blue-600 rounded-full"
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Mobile Progress Text */}
        <div className="mt-4 text-center sm:hidden">
          <p className="text-sm text-gray-600">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </p>
        </div>
      </div>
    </div>
  );
}