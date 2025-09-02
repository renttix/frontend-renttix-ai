"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import SignaturePad from "@/components/esign/SignaturePad";
import axios from "axios";
import {  imageBaseURL } from "../../../../../utils/baseUrl";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";

const EsignPage = () => {
  const { orderId, tokens } = useParams();
  const router = useRouter();
  const toast = useRef(null);
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingDocument, setSigningDocument] = useState(false);
  const [signature, setSignature] = useState(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    loadDocument();
  }, [orderId, tokens]);

  // Debug useEffect for tracking signature changes
  useEffect(() => {
    console.log('Signature state changed:', {
      hasSignature,
      signatureLength: signature?.length || 0,
      fullNameLength: fullName?.trim()?.length || 0,
      canSignDocument: hasSignature && fullName.trim().length > 0
    });
  }, [signature, hasSignature, fullName]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${imageBaseURL}/public/esign/${orderId}/${tokens}/document`,
        {
         
        
          responseType: 'blob'
        }
      );
console.log({response:response.data})
      // Create blob URL for PDF display
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);
      setDocumentData({ pdfUrl });
      console.log({response})
    } catch (error) {
      console.error("Error loading document:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to load document",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureChange = (signatureData, hasSign) => {
    console.log('Signature change:', { hasSignature: hasSign, signatureDataLength: signatureData?.length });
    setSignature(signatureData);
    setHasSignature(hasSign);
  };

  const handleSignDocument = async () => {
    if (!hasSignature) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please provide your signature",
        life: 3000,
      });
      return;
    }

    if (!fullName.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please enter your full name",
        life: 3000,
      });
      return;
    }

    setSigningDocument(true);

    try {
      const signatureData = {
        signature: signature.replace('data:image/png;base64,', ''),
        signerName: fullName.trim(),
        signerEmail: email.trim(),
        signerCompany: companyName.trim(),
        signedAt: new Date().toISOString(),
        token: tokens,
      };

      // Prepare URL parameters for dynamic success page
      const successParams = new URLSearchParams({
        orderId: orderId,
        signerName: fullName.trim(),
        signerEmail: email.trim(),
        // Add other dynamic parameters here
      });

      const response = await axios.post(
        `${imageBaseURL}/public/esign/${orderId}/${tokens}/sign`,
        signatureData
      );

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Document signed successfully!",
        life: 5000,
      });

      // Redirect to success page with dynamic parameters
      setTimeout(() => {
        router.push(`/esign/success?${successParams.toString()}`);
      }, 2000);

    } catch (error) {
      console.error("Error signing document:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.error || "Failed to sign document",
        life: 5000,
      });
    } finally {
      setSigningDocument(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-4 border-blue-600 border-t-transparent rounded-full w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <i className="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h3 className="text-xl font-bold mb-2">Document Not Found</h3>
            <p className="text-gray-600 mb-4">
              The e-sign document you're looking for is not available or has expired.
            </p>
            <Button
              label="Go Home"
              onClick={() => router.push('/')}
              className="p-button-outlined"
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
            <Toast ref={toast} position="top-right" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document E-Signature</h1>
          <p className="text-gray-600">
            Please review the document and provide your electronic signature
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Display Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Document for Review</h3>

            {documentData.pdfUrl && (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <iframe
                  src={documentData.pdfUrl}
                  className="w-full h-96 border-0"
                  title="E-Sign Document"
                />
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Please review the entire document carefully</li>
                <li>• Your signature will be legally binding</li>
                <li>• This process is secure and encrypted</li>
                <li>• You can save a copy of this document for your records</li>
              </ul>
            </div>
          </div>

          {/* Signature Section */}
          <div className="space-y-6">
            {/* Signer Information */}
            <Card className="shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Your Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <InputText
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (optional)"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <InputText
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name (optional)"
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
            {/* Signature Pad */}
            <Card className="shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Your Signature</h3>

              <SignaturePad
                width={400}
                height={200}
                onSignatureChange={handleSignatureChange}
                className="w-full"
              />

              {/* Sign Document Button */}
              <div className="mt-6">
                <Button
                  label="Sign Document"
                  icon="pi pi-check"
                  onClick={handleSignDocument}
                  loading={signingDocument}
                  disabled={!hasSignature || !fullName.trim()}
                  className="w-full p-button-lg"
                  style={{
                    backgroundColor: hasSignature && fullName.trim() ? "#0891b2" : "#6b7280",
                    borderColor: hasSignature && fullName.trim() ? "#0891b2" : "#6b7280",
                  }}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EsignPage;