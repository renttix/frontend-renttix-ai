"use client";
import { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import Link from "next/link";

const TestEnhancedWizardPage = () => {
  const [featureFlagEnabled, setFeatureFlagEnabled] = useState(
    typeof window !== 'undefined' && localStorage.getItem('useEnhancedOrderWizard') === 'true'
  );

  const toggleFeatureFlag = () => {
    const newValue = !featureFlagEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('useEnhancedOrderWizard', newValue.toString());
      setFeatureFlagEnabled(newValue);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-4">
        <Card title="Enhanced Order Wizard Test Page" className="mb-4">
          <Message 
            severity="info" 
            text="Use the links below to test different methods of accessing the enhanced order wizard" 
            className="mb-4"
          />
          
          <div className="space-y-4">
            <div className="p-4 border rounded">
              <h3 className="text-lg font-semibold mb-2">Method 1: Direct Route</h3>
              <p className="text-gray-600 mb-3">Access the enhanced wizard directly without any checks</p>
              <Link href="/order/create-enhanced">
                <Button label="Open Enhanced Wizard (Direct)" icon="pi pi-arrow-right" />
              </Link>
            </div>

            <div className="p-4 border rounded">
              <h3 className="text-lg font-semibold mb-2">Method 2: Query Parameter</h3>
              <p className="text-gray-600 mb-3">Access via query parameter (?enhanced=true)</p>
              <Link href="/order/create?enhanced=true">
                <Button label="Open Enhanced Wizard (Query Param)" icon="pi pi-arrow-right" />
              </Link>
            </div>

            <div className="p-4 border rounded">
              <h3 className="text-lg font-semibold mb-2">Method 3: Feature Flag</h3>
              <p className="text-gray-600 mb-3">
                Feature flag is currently: <strong>{featureFlagEnabled ? 'ENABLED' : 'DISABLED'}</strong>
              </p>
              <div className="flex gap-2 items-center">
                <Button 
                  label={featureFlagEnabled ? "Disable Feature Flag" : "Enable Feature Flag"}
                  icon={featureFlagEnabled ? "pi pi-times" : "pi pi-check"}
                  onClick={toggleFeatureFlag}
                  severity={featureFlagEnabled ? "danger" : "success"}
                />
                {featureFlagEnabled && (
                  <Link href="/order/create">
                    <Button label="Open Order Create (Flag Active)" icon="pi pi-arrow-right" />
                  </Link>
                )}
              </div>
            </div>

            <div className="p-4 border rounded bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Regular Order Wizard</h3>
              <p className="text-gray-600 mb-3">Access the standard order wizard</p>
              <Link href="/order/create">
                <Button label="Open Standard Wizard" icon="pi pi-arrow-right" severity="secondary" />
              </Link>
            </div>
          </div>
        </Card>

        <Card title="Debug Information" className="mb-4">
          <div className="space-y-2">
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>Feature Flag Value:</strong> {featureFlagEnabled ? 'true' : 'false'}</p>
            <p><strong>LocalStorage Available:</strong> {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
          </div>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default TestEnhancedWizardPage;