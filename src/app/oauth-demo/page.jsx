"use client";
import React from "react";
import { Button } from "primereact/button";
import { BaseURL } from "../../../utils/baseUrl";

const OAuthDemoPage = () => {
  // Demo vendor ID for testing
  const demoVendorId = "demo-vendor-123";
  
  const testQuickBooksAuth = () => {
    window.location.href = `${BaseURL}/auth?vendorId=${demoVendorId}&redirctURL=${window.location.href}`;
  };
  
  const testXeroAuth = () => {
    window.location.href = `${BaseURL}/xero/auth?vendorId=${demoVendorId}&redirectURL=${window.location.href}`;
  };
  
  const testSageAuth = () => {
    window.location.href = `${BaseURL}/sage/auth?vendorId=${demoVendorId}&redirectURL=${window.location.href}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">OAuth Integration Demo</h1>
          <p className="text-gray-600 mt-2">
            Test the OAuth flows for all three accounting integrations
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test OAuth Flows</h2>
          <p className="text-sm text-gray-600 mb-6">
            Click any button below to test the OAuth authentication flow. You'll be redirected to the respective platform's login page.
          </p>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">QuickBooks</h3>
              <p className="text-sm text-gray-600 mb-3">
                Test QuickBooks OAuth 2.0 authentication flow
              </p>
              <Button 
                label="Connect to QuickBooks" 
                icon="pi pi-check" 
                className="p-button-primary"
                onClick={testQuickBooksAuth}
              />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Xero</h3>
              <p className="text-sm text-gray-600 mb-3">
                Test Xero OAuth 2.0 with PKCE authentication flow
              </p>
              <Button 
                label="Connect to Xero" 
                icon="pi pi-check" 
                className="p-button-primary"
                onClick={testXeroAuth}
              />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Sage Business Cloud</h3>
              <p className="text-sm text-gray-600 mb-3">
                Test Sage OAuth 2.0 authentication flow
              </p>
              <Button 
                label="Connect to Sage" 
                icon="pi pi-check" 
                className="p-button-primary"
                onClick={testSageAuth}
              />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a demo page. In production, you need valid OAuth credentials configured in your .env file:
            </p>
            <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
              <li>QUICKBOOK_CLIENT_ID and QUICKBOOK_CLIENT_SECRET</li>
              <li>XERO_CLIENT_ID and XERO_CLIENT_SECRET</li>
              <li>SAGE_CLIENT_ID and SAGE_CLIENT_SECRET</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthDemoPage;