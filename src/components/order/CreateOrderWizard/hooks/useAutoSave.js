import { useEffect, useRef, useState } from 'react';
import { useWizard } from '../context/WizardContext';

export function useAutoSave(interval = 30000) { // 30 seconds default
  const { state, saveDraft } = useWizard();
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);
  const lastFormDataRef = useRef(null);
  
  // Check if form data has changed
  const hasFormDataChanged = () => {
    const currentData = JSON.stringify(state.formData);
    const lastData = lastFormDataRef.current;
    return currentData !== lastData;
  };
  
  // Auto-save function
  const autoSave = async () => {
    if (!hasFormDataChanged() || isSaving) {
      return;
    }
    
    try {
      setIsSaving(true);
      await saveDraft();
      setLastSaved(new Date());
      lastFormDataRef.current = JSON.stringify(state.formData);
      
      // Show success notification (you can customize this)
      if (window.showNotification) {
        window.showNotification('Draft saved', 'success');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      if (window.showNotification) {
        window.showNotification('Failed to save draft', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Set up auto-save interval
  useEffect(() => {
    // Initial save of current state
    lastFormDataRef.current = JSON.stringify(state.formData);
    
    // Set up interval
    const intervalId = setInterval(() => {
      autoSave();
    }, interval);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [interval]);
  
  // Save on form data changes with debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Don't save immediately, wait for user to stop typing
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 5000); // 5 seconds after last change
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.formData]);
  
  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000); // seconds
    
    if (diff < 60) {
      return 'Saved just now';
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `Saved ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
      const hours = Math.floor(diff / 3600);
      return `Saved ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
  };
  
  return {
    lastSaved,
    lastSavedText: getLastSavedText(),
    isSaving,
    saveNow: autoSave
  };
}