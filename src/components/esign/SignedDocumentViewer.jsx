"use client";
import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Dialog } from "primereact/dialog";
import { toast } from "primereact/toast";
import PdfViewer from "./PdfViewer";
import SignaturePad from "./SignaturePad";
import { BaseURL } from "@/components/BaseURL";
import { useSelector } from "react-redux";
import axios from "axios";

const SignedDocumentViewer = ({ orderId, className = "" }) => {
  const { user } = useSelector((state) => state?.authReducer);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignature, setShowSignature] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchDocument();
    }
  }, [orderId]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch order e-sign status
      const response = await axios.get(`${BaseURL}/esign/${orderId}/status`, {
        headers: {
          Authorization: `Bearer ${user?.token || ''}`
        }
      });

      setDocument(response.data.data);
    } catch (error) {
      console.error("Error fetching document:", error);
      setError(error.response?.data?.message || "Failed to load document");
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load signed document",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadSignedDocument = async () => {
    try {
      setIsDownloading(true);

      const response = await axios.get(
        `${BaseURL}/esign/${orderId}/download-signed`,
        {
          headers: {
            Authorization: `Bearer ${user?.token || ''}`
          },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const filename = document.esignSignedDocument?.filename ||
                      `signed_document_${document?.orderId || orderId}.pdf`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Signed document downloaded successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Error downloading signed document:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to download signed document",
        life: 3000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getSignatureStatusLabel = (status) => {
    switch (status) {
      case 'signed':
        return { label: 'Signed', severity: 'success' };
      case 'sent':
        return { label: 'Sent', severity: 'info' };
      case 'pending':
        return { label: 'Pending', severity: 'warning' };
      case 'expired':
        return { label: 'Expired', severity: 'danger' };
      case 'failed':
        return { label: 'Failed', severity: 'danger' };
      default:
        return { label: 'Not Required', severity: 'secondary' };
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin border-4 border-blue-600 border-t-transparent rounded-full w-8 h-8 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading signed document...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Document</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              label="Retry"
              icon="pi pi-refresh"
              onClick={fetchDocument}
              className="p-button-outlined"
            />
          </div>
        </div>
      </Card>
    );
  }

  if (!document || document.esignStatus === 'not_required') {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <i className="pi pi-file-o text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No E-Signature Required</h3>
            <p className="text-gray-600">This order does not require an electronic signature.</p>
          </div>
        </div>
      </Card>
    );
  }

  const statusInfo = getSignatureStatusLabel(document.esignStatus);

  return (
    <div className={className}>
      <Card className="shadow-lg">
        {/* Document Header */}
        <div className="flex items-center justify-between mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-4">
            <i className="pi pi-file-pdf text-3xl text-red-500"></i>
            <div>
              <h3 className="text-xl font-semibold">
                Signed Document - Order {document.orderId}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <Badge
                  value={statusInfo.label}
                  severity={statusInfo.severity}
                  className="capitalize"
                />
                {document.esignSignedAt && (
                  <span className="text-sm text-gray-600">
                    Signed: {new Date(document.esignSignedAt).toLocaleString()}
                  </span>
                )}
                {document.esignSignedBy && (
                  <span className="text-sm text-gray-600">
                    Signed by: {document.esignSignedBy}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {document.esignStatus === 'signed' && (
              <Button
                label="Download Signed PDF"
                icon="pi pi-download"
                onClick={downloadSignedDocument}
                loading={isDownloading}
                className="p-button-primary"
              />
            )}
            {document.esignStatus === 'signed' && document.esignSignatureData && (
              <Button
                label="Show Signature"
                icon="pi pi-pencil"
                onClick={() => setShowSignature(true)}
                className="p-button-secondary"
              />
            )}
          </div>
        </div>

        {/* Signed Document Display */}
        {document.esignStatus === 'signed' && document.esignSignedDocument && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <PdfViewer
              pdfUrl={`${BaseURL}/esign/${orderId}/download-signed`}
              height={600}
            />
          </div>
        )}

        {/* Original Document (when signed) */}
        {document.esignStatus === 'signed' && document.esignDocument && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Original Document</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden opacity-60">
              <PdfViewer
                pdfUrl={`${BaseURL}/esign/${orderId}/download-original`}
                height={400}
              />
            </div>
          </div>
        )}

        {/* Pending/Not Signed Status */}
        {document.esignStatus !== 'signed' && (
          <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg">
            <i className={`pi pi-${document.esignStatus === 'pending' ? 'clock' : document.esignStatus === 'sent' ? 'send' : document.esignStatus === 'expired' ? 'times-circle' : 'exclamation-triangle'} text-4xl text-gray-400 mb-4`}></i>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {document.esignStatus === 'pending' && 'E-Signature Not Started'}
              {document.esignStatus === 'sent' && 'Waiting for Signature'}
              {document.esignStatus === 'expired' && 'E-Signature Expired'}
              {document.esignStatus === 'failed' && 'E-Signature Failed'}
            </h3>
            <p className="text-gray-600 text-center">
              {document.esignStatus === 'pending' && 'The electronic signature process has not been initiated for this order.'}
              {document.esignStatus === 'sent' && 'The e-signature request has been sent to the customer. Waiting for their signature.'}
              {document.esignStatus === 'expired' && 'The e-signature link has expired. Please generate a new signature request.'}
              {document.esignStatus === 'failed' && 'The e-signature process failed. Please try again.'}
            </p>
          </div>
        )}
      </Card>

      {/* Signature View Modal */}
      <Dialog
        header="Captured Signature"
        visible={showSignature}
        onHide={() => setShowSignature(false)}
        style={{ width: '90vw', maxWidth: '600px' }}
        className="p-fluid"
      >
        <div className="flex flex-col items-center">
          <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-semibold mb-2">Signature Details</h4>
            <div className="text-sm text-gray-600">
              <p><strong>Document:</strong> {document.orderId}</p>
              <p><strong>Signed by:</strong> {document.esignSignedBy}</p>
              <p><strong>Signed at:</strong> {new Date(document.esignSignedAt).toLocaleString()}</p>
              {document.esignSignerEmail && (
                <p><strong>Signer email:</strong> {document.esignSignerEmail}</p>
              )}
              {document.esignSignerCompany && (
                <p><strong>Signer company:</strong> {document.esignSignerCompany}</p>
              )}
            </div>
          </div>

          {document.esignSignatureData && (
            <img
              src={`data:image/png;base64,${document.esignSignatureData}`}
              alt="Captured signature"
              className="border border-gray-200 rounded-lg max-w-full h-auto"
              style={{ maxHeight: '200px' }}
            />
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default SignedDocumentViewer;