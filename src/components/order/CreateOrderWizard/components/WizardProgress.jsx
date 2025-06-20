"use client";
import React from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';

const steps = [
  { id: 1, name: 'Smart Start', icon: '🚀' },
  { id: 2, name: 'Products', icon: '📦' },
  { id: 3, name: 'Delivery', icon: '🚚' },
  { id: 4, name: 'Confirm', icon: '✅' },
];

export default function WizardProgress() {
  const { state } = useWizard();
  const { currentStep, completedSteps } = state;

  return (
    <div className="bg-white border-b sticky top-16 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Desktop Progress */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = completedSteps.has(step.id);
                const isClickable = isCompleted || step.id < currentStep;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex items-center">
                      <button
                        className={`
                          relative flex items-center justify-center w-10 h-10 rounded-full
                          transition-all duration-200 
                          ${isActive 
                            ? 'bg-blue-600 text-white shadow-lg scale-110' 
                            : isCompleted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }
                          ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                        `}
                        disabled={!isClickable}
                      >
                        <span className="text-lg">{isCompleted && !isActive ? '✓' : step.icon}</span>
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-blue-600"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </button>
                      <span className={`
                        ml-3 text-sm font-medium
                        ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                      `}>
                        {step.name}
                      </span>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-4">
                        <div className="relative h-1 bg-gray-200 rounded">
                          <motion.div
                            className="absolute h-full bg-green-500 rounded"
                            initial={{ width: 0 }}
                            animate={{ 
                              width: completedSteps.has(step.id) ? '100%' : '0%' 
                            }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                          />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {steps[currentStep - 1]?.name}
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}