"use client";
import React from "react";
import IntegrationsEnhanced from "@/components/system-setup/integrations/IntegrationsEnhanced";

const IntegrationsDemoPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integrations Demo</h1>
          <p className="text-gray-600 mt-2">
            This is a demo page showing the Xero and Sage integrations alongside QuickBooks
          </p>
        </div>
        <IntegrationsEnhanced />
      </div>
    </div>
  );
};

export default IntegrationsDemoPage;