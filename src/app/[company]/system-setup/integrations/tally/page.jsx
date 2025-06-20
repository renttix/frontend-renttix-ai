"use client";
import React from "react";
import TallyIntegration from "@/components/system-setup/integrations/integration-account/TallyIntegration";
import { Card } from "primereact/card";
import { BreadCrumb } from "primereact/breadcrumb";
import { useRouter } from "next/navigation";

const TallyIntegrationPage = () => {
  const router = useRouter();
  
  const breadcrumbItems = [
    { label: "System Setup", command: () => router.push("/system-setup") },
    { label: "Integrations", command: () => router.push("/system-setup/integrations") },
    { label: "Tally" }
  ];
  
  const home = { icon: "pi pi-home", command: () => router.push("/dashboard") };

  return (
    <div className="p-4">
      <BreadCrumb model={breadcrumbItems} home={home} className="mb-4" />
      
      <div className="grid">
        <div className="col-12 lg:col-8">
          <h1 className="text-2xl font-bold mb-4">Tally Integration</h1>
          <TallyIntegration />
        </div>
        
        <div className="col-12 lg:col-4">
          <Card title="About Tally" className="shadow-sm">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Tally is India's leading business management software, trusted by over 2 million businesses for accounting and compliance.
              </p>
              
              <div>
                <h4 className="font-semibold mb-2">Key Features:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Complete GST compliance</li>
                  <li>Real-time business insights</li>
                  <li>Multi-company management</li>
                  <li>Offline capability</li>
                  <li>XML-based data exchange</li>
                  <li>Customizable voucher types</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Requirements:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Tally Prime with API access</li>
                  <li>Tally running on same network</li>
                  <li>Port 9000 (default) open</li>
                  <li>Valid API key configured</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Indian Compliance:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>GST returns & e-invoicing</li>
                  <li>TDS/TCS management</li>
                  <li>State-specific requirements</li>
                  <li>Audit trail maintenance</li>
                </ul>
              </div>
              
              <div className="pt-3 border-t">
                <a 
                  href="https://tallysolutions.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  Learn more about Tally
                  <i className="pi pi-external-link text-xs"></i>
                </a>
              </div>
            </div>
          </Card>
          
          <Card title="Setup Instructions" className="shadow-sm mt-3">
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
              <li>Ensure Tally Prime is running</li>
              <li>Enable API access in Tally settings</li>
              <li>Note down your server URL and port</li>
              <li>Generate an API key in Tally</li>
              <li>Click "Connect Tally" and enter details</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TallyIntegrationPage;