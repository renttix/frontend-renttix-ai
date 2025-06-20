import { useState, useEffect, useRef } from 'react';
import { useWizard } from '../context/WizardContext';

export function useAutoSave(interval = 30000) {
  const { state, saveDraft } = useWizard();
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(state.draft.lastSaved);
  const previousDataRef = useRef(state.formData);
  const saveTimeoutRef = useRef(null);
  
  // Check if data has changed
  const hasDataChanged = () => {
    return JSON.stringify(state.formData) !== JSON.stringify(previousDataRef.current);
  };
  
  // Save function
  const performSave = async () => {
    if (!hasDataChanged()) return;
    
    try {
      setSaveStatus('saving');
      await saveDraft();
      previousDataRef.current = state.formData;
      setLastSaved(new Date().toISOString());
      setSaveStatus('saved');
      
      // Reset to idle after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };
  
  // Auto-save effect
  useEffect(() => {
    if (state.draft.autoSaveEnabled && state.formData.name) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout
      saveTimeoutRef.current = setTimeout(() => {
        performSave();
      }, interval);
      
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [state.formData, state.draft.autoSaveEnabled, interval]);
  
  // Listen for manual save events
  useEffect(() => {
    const handleManualSave = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        performSave();
      }
    };
    
    const handleSaveEvent = () => {
      performSave();
    };
    
    window.addEventListener('keydown', handleManualSave);
    window.addEventListener('triggerAutoSave', handleSaveEvent);
    
    return () => {
      window.removeEventListener('keydown', handleManualSave);
      window.removeEventListener('triggerAutoSave', handleSaveEvent);
    };
  }, []);
  
  return {
    saveStatus,
    lastSaved,
    saveNow: performSave,
  };
}