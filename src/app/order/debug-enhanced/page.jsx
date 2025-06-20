"use client";
import { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const EnhancedCreateOrderWizard = dynamic(
  () => import("@/components/order/CreateOrderWizard/EnhancedCreateOrderWizard"),
  { 
    ssr: false,
    loading: () => <div className="p-6">Loading Enhanced Wizard...</div>
  }
);

const DebugEnhancedWizardPage = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set a test user in Redux state to bypass authentication
    if (typeof window !== 'undefined') {
      // This is just for testing - we'll load the wizard after mount
      setShowWizard(true);
    }
  }, []);

  const handleLoadWizard = () => {
    try {
      setShowWizard(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4">
      <Card title="Enhanced Order Wizard Debug Page" className="mb-4">
        <Message 
          severity="warn" 
          text="This is a debug page to test the enhanced wizard component loading" 
          className="mb-4"
        />
        
        {error && (
          <Message 
            severity="error" 
            text={`Error: ${error}`} 
            className="mb-4"
          />
        )}

        {!showWizard ? (
          <div className="text-center">
            <p className="mb-4">Click the button below to load the enhanced wizard component:</p>
            <Button 
              label="Load Enhanced Wizard" 
              icon="pi pi-play" 
              onClick={handleLoadWizard}
              severity="success"
            />
          </div>
        ) : (
          <div>
            <Message 
              severity="success" 
              text="Enhanced wizard component loaded!" 
              className="mb-4"
            />
            <div className="border-2 border-dashed border-gray-300 p-4 rounded">
              <EnhancedCreateOrderWizard />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DebugEnhancedWizardPage;