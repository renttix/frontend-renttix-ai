"use client";
import React from "react";
import ZohoIntegration from "@/components/system-setup/integrations/integration-account/ZohoIntegration";
import { Card } from "primereact/card";
import { BreadCrumb } from "primereact/breadcrumb";
import { useRouter } from "next/navigation";

const ZohoIntegrationPage = () => {
  const router = useRouter();
  
  const breadcrumbItems = [
    { label: "System Setup", command: () => router.push("/system-setup") },
    { label: "Integrations", command: () => router.push("/system-setup/integrations") },
    { label: "Zoho Books" }
  ];
  
  const home = { icon: "pi pi-home", command: () => router.push("/dashboard") };

  return (
    <div className="p-4">
      <BreadCrumb model={breadcrumbItems} home={home} className="mb-4" />
      
      <div className="grid">
        <div className="col-12 lg:col-8">
          <h1 className="text-2xl font-bold mb-4">Zoho Books Integration</h1>
          <ZohoIntegration />
        </div>
        
        <div className="col-12 lg:col-4">
          <Card title="About Zoho Books" className="shadow-sm">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Zoho Books is a comprehensive cloud-based accounting software designed for businesses of all sizes.
              </p>
              
              <div>
                <h4 className="font-semibold mb-2">Key Features:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Available in 180+ countries</li>
                  <li>Multi-currency support</li>
                  <li>Automatic tax calculation</li>
                  <li>Real-time collaboration</li>
                  <li>Mobile apps for iOS and Android</li>
                  <li>40+ payment gateway integrations</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Regional Support:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>GST compliance (India, Australia)</li>
                  <li>VAT support (Europe)</li>
                  <li>Sales tax (US)</li>
                  <li>16+ language support</li>
                </ul>
              </div>
              
              <div className="pt-3 border-t">
                <a 
                  href="https://www.zoho.com/books/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  Learn more about Zoho Books
                  <i className="pi pi-external-link text-xs"></i>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ZohoIntegrationPage;