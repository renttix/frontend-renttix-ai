import React from "react";
import { motion } from "framer-motion";

export default function WizardProgress({ steps, currentStep, completedSteps, onStepClick }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = completedSteps.includes(stepNumber);
            const isClickable = isCompleted || stepNumber === currentStep || stepNumber === currentStep + 1;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <button
                    onClick={() => isClickable && onStepClick(stepNumber)}
                    disabled={!isClickable}
                    className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full
                      transition-all duration-300 
                      ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110' 
                        : isCompleted 
                          ? 'bg-green-500 text-white hover:shadow-md' 
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {isCompleted && !isActive ? (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                    
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    )}
                  </button>
                  
                  <div className={`ml-3 ${!isClickable ? 'opacity-50' : ''}`}>
                    <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      Step {stepNumber}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                      {step.name}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className="relative h-0.5 bg-gray-200 rounded">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded"
                        initial={{ width: "0%" }}
                        animate={{ 
                          width: completedSteps.includes(stepNumber) ? "100%" : "0%" 
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}