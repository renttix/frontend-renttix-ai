import { useEffect } from 'react';
import { useWizard } from '../context/WizardContext';

export function useKeyboardNavigation() {
  const { state, goToStep } = useWizard();
  const { currentStep, totalSteps } = state;

  useEffect(() => {
    const handleKeyPress = (event) => {
      // Don't trigger if user is typing in an input
      if (event.target.tagName === 'INPUT' || 
          event.target.tagName === 'TEXTAREA' || 
          event.target.tagName === 'SELECT') {
        return;
      }

      // Alt + Arrow keys for navigation
      if (event.altKey) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            if (currentStep > 1) {
              goToStep(currentStep - 1);
            }
            break;
          case 'ArrowRight':
            event.preventDefault();
            if (currentStep < totalSteps) {
              goToStep(currentStep + 1);
            }
            break;
          case 'ArrowUp':
            event.preventDefault();
            goToStep(1); // Go to first step
            break;
          case 'ArrowDown':
            event.preventDefault();
            goToStep(totalSteps); // Go to last step
            break;
        }
      }

      // Number keys for direct step navigation
      if (event.ctrlKey && event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const stepNumber = parseInt(event.key);
        if (stepNumber <= totalSteps) {
          goToStep(stepNumber);
        }
      }

      // Help toggle
      if (event.key === '?' && event.shiftKey) {
        event.preventDefault();
        // Trigger help sidebar toggle
        const helpToggleEvent = new CustomEvent('toggleHelpSidebar');
        window.dispatchEvent(helpToggleEvent);
      }

      // Save shortcut
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        // Trigger save
        const saveEvent = new CustomEvent('triggerAutoSave');
        window.dispatchEvent(saveEvent);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, totalSteps, goToStep]);

  return {
    shortcuts: [
      { keys: 'Alt + ←', description: 'Previous step' },
      { keys: 'Alt + →', description: 'Next step' },
      { keys: 'Alt + ↑', description: 'First step' },
      { keys: 'Alt + ↓', description: 'Last step' },
      { keys: 'Ctrl + 1-4', description: 'Jump to step' },
      { keys: 'Shift + ?', description: 'Toggle help' },
      { keys: 'Ctrl + S', description: 'Save progress' },
    ]
  };
}