"use client";
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { FileUpload } from 'primereact/fileupload';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { ProgressBar } from 'primereact/progressbar';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import { formatCurrency } from '../../../../../utils/helper';

const billingPeriods = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Fortnightly', value: 'fortnightly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Annually', value: 'annually' }
];

const documentTypes = [
  { label: 'Insurance Certificate', value: 'insurance' },
  { label: 'Business License', value: 'license' },
  { label: 'Tax Certificate', value: 'tax' },
  { label: 'Bank Statement', value: 'bank' },
  { label: 'Credit Reference', value: 'credit' },
  { label: 'Contract', value: 'contract' },
  { label: 'NDA', value: 'nda' },
  { label: 'Other', value: 'other' }
];

export default function FinancialStep() {
  const { state, updateFormData, completeStep, setValidation, addDocument, removeDocument } = useWizard();
  const { formData } = state;
  const { token, user } = useSelector((state) => state?.authReducer);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [invoiceRunCodes, setInvoiceRunCodes] = useState([]);
  const [creditCheckLoading, setCreditCheckLoading] = useState(false);
  const [creditCheckResult, setCreditCheckResult] = useState(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [newDocument, setNewDocument] = useState({
    type: '',
    name: '',
    file: null,
    expiryDate: null,
  });
  
  // Fetch payment terms and invoice run codes
  useEffect(() => {
    // Only fetch if user is available
    if (user && user._id) {
      fetchPaymentTerms();
      fetchInvoiceRunCodes();
    }
  }, [user]);
  
  const fetchPaymentTerms = async () => {
    try {
      // Check if user and user._id exist before making the API call
      if (!user || !user._id) {
        console.warn('User or user ID not available for fetching payment terms');
        return;
      }
      
      const response = await axios.get(
        `${BaseURL}/payment-terms`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setPaymentTerms(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payment terms:', error);
    }
  };
  
  const fetchInvoiceRunCodes = async () => {
    try {
      // Check if user and user._id exist before making the API call
      if (!user || !user._id) {
        console.warn('User or user ID not available for fetching invoice run codes');
        return;
      }
      
      const response = await axios.get(
        `${BaseURL}/invoice-run-code`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setInvoiceRunCodes(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch invoice run codes:', error);
    }
  };
  
  const runCreditCheck = async () => {
    setCreditCheckLoading(true);
    try {
      // Simulate credit check API call
      setTimeout(() => {
        const mockScore = Math.floor(Math.random() * 300) + 500; // 500-800
        const mockResult = {
          score: mockScore,
          rating: mockScore >= 700 ? 'Excellent' : mockScore >= 650 ? 'Good' : mockScore >= 600 ? 'Fair' : 'Poor',
          recommendedLimit: mockScore >= 700 ? 50000 : mockScore >= 650 ? 25000 : mockScore >= 600 ? 10000 : 5000,
          lastChecked: new Date().toISOString(),
        };
        setCreditCheckResult(mockResult);
        updateFormData({
          creditStatus: mockResult.rating.toLowerCase(),
          creditLimit: mockResult.recommendedLimit,
          riskScore: mockResult.score,
        });
        setCreditCheckLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Credit check failed:', error);
      setCreditCheckLoading(false);
    }
  };
  
  const handleDocumentUpload = (event) => {
    const file = event.files[0];
    setNewDocument({ ...newDocument, file });
  };
  
  const addNewDocument = () => {
    if (newDocument.file && newDocument.type && newDocument.name) {
      addDocument({
        ...newDocument,
        uploadDate: new Date().toISOString(),
        size: newDocument.file.size,
      });
      setNewDocument({
        type: '',
        name: '',
        file: null,
        expiryDate: null,
      });
      setShowDocumentUpload(false);
    }
  };
  
  const validateStep = () => {
    const newErrors = {};
    
    if (!formData.paymentTerm) {
      newErrors.paymentTerm = 'Payment terms are required';
    }
    
    if (!formData.invoiceRunCode) {
      newErrors.invoiceRunCode = 'Invoice run code is required';
    }
    
    if (formData.creditLimit && formData.creditLimit < 0) {
      newErrors.creditLimit = 'Credit limit cannot be negative';
    }
    
    setErrors(newErrors);
    setValidation(4, newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate on form data changes
  useEffect(() => {
    validateStep();
  }, [formData.paymentTerm, formData.invoiceRunCode]);
  
  const documentTemplate = (doc, index) => {
    const docType = documentTypes.find(t => t.value === doc.type);
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="pi pi-file-pdf text-2xl text-red-500"></i>
          <div>
            <p className="font-medium">{doc.name}</p>
            <p className="text-sm text-gray-600">
              {docType?.label || 'Document'} • {(doc.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {doc.expiryDate && (
            <Tag 
              value={`Expires: ${new Date(doc.expiryDate).toLocaleDateString()}`}
              severity={new Date(doc.expiryDate) < new Date() ? 'danger' : 'info'}
            />
          )}
          <Button
            icon="pi pi-download"
            className="p-button-text p-button-sm"
            tooltip="Download"
          />
          <Button
            icon="pi pi-trash"
            className="p-button-text p-button-danger p-button-sm"
            onClick={() => removeDocument(index)}
          />
        </div>
      </div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Financial & Compliance</h2>
        <p className="text-gray-600">Set up payment terms, credit limits, and compliance documents</p>
      </div>
      
      {/* Payment Settings */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Terms <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.paymentTerm || ''}
              onChange={(e) => updateFormData({ paymentTerm: e.value })}
              options={paymentTerms}
              optionLabel="name"
              optionValue="_id"
              placeholder="Select payment terms"
              className={`w-full ${errors.paymentTerm ? 'p-invalid' : ''}`}
              showClear
            />
            {errors.paymentTerm && (
              <small className="text-red-500">{errors.paymentTerm}</small>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Invoice Run Code <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.invoiceRunCode || ''}
              onChange={(e) => updateFormData({ invoiceRunCode: e.value })}
              options={invoiceRunCodes}
              optionLabel="name"
              optionValue="_id"
              placeholder="Select invoice run code"
              className={`w-full ${errors.invoiceRunCode ? 'p-invalid' : ''}`}
              showClear
            />
            {errors.invoiceRunCode && (
              <small className="text-red-500">{errors.invoiceRunCode}</small>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Billing Period</label>
            <Dropdown
              value={formData.billingPeriod || ''}
              onChange={(e) => updateFormData({ billingPeriod: e.value })}
              options={billingPeriods}
              placeholder="Select billing period"
              className="w-full"
              showClear
            />
          </div>
          
          <div className="flex items-end">
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="invoiceInBatch"
                checked={formData.invoiceInBatch || false}
                onChange={(e) => updateFormData({ invoiceInBatch: e.checked })}
              />
              <label htmlFor="invoiceInBatch" className="cursor-pointer">
                Include in batch invoicing
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Customer Invoice Notes
          </label>
          <InputTextarea
            value={formData.customerNotes || ''}
            onChange={(e) => updateFormData({ customerNotes: e.target.value })}
            rows={3}
            className="w-full"
            placeholder="Notes that will appear on customer invoices..."
          />
        </div>
      </Card>
      
      {/* Credit & Risk Assessment */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Credit & Risk Assessment</h3>
        
        <div className="space-y-4">
          {!creditCheckResult ? (
            <div className="text-center py-8">
              <i className="pi pi-chart-line text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-600 mb-4">No credit check performed yet</p>
              <Button
                label="Run Credit Check"
                icon="pi pi-search"
                onClick={runCreditCheck}
                loading={creditCheckLoading}
                className="p-button-outlined"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Credit Score</p>
                <p className="text-2xl font-bold">{creditCheckResult.score}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Rating</p>
                <Tag 
                  value={creditCheckResult.rating} 
                  severity={
                    creditCheckResult.rating === 'Excellent' ? 'success' :
                    creditCheckResult.rating === 'Good' ? 'info' :
                    creditCheckResult.rating === 'Fair' ? 'warning' : 'danger'
                  }
                  className="text-lg"
                />
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Recommended Limit</p>
                <p className="text-2xl font-bold">{formatCurrency(creditCheckResult.recommendedLimit, user?.currencyKey)}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Credit Limit
              </label>
              <InputNumber
                value={formData.creditLimit || 0}
                onValueChange={(e) => updateFormData({ creditLimit: e.value })}
                mode="currency"
                currency={user?.currencyKey || 'GBP'}
                locale="en-GB"
                className={`w-full ${errors.creditLimit ? 'p-invalid' : ''}`}
              />
              {errors.creditLimit && (
                <small className="text-red-500">{errors.creditLimit}</small>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Internal Notes
              </label>
              <InputText
                value={formData.internalNotes || ''}
                onChange={(e) => updateFormData({ internalNotes: e.target.value })}
                className="w-full"
                placeholder="Internal risk notes (not visible to customer)"
              />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Bank Details */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Bank Details (Optional)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bank Name</label>
            <InputText
              value={formData.bankName || ''}
              onChange={(e) => updateFormData({ bankName: e.target.value })}
              className="w-full"
              placeholder="Bank name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Account Number</label>
            <InputText
              value={formData.bankAccount || ''}
              onChange={(e) => updateFormData({ bankAccount: e.target.value })}
              className="w-full"
              placeholder="Account number"
              type="password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Sort Code</label>
            <InputText
              value={formData.bankSortCode || ''}
              onChange={(e) => updateFormData({ bankSortCode: e.target.value })}
              className="w-full"
              placeholder="Sort code"
            />
          </div>
        </div>
        
        <Message 
          severity="info" 
          text="Bank details are encrypted and stored securely"
          className="mt-3"
        />
      </Card>
      
      {/* Compliance Documents */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Compliance Documents</h3>
            <p className="text-sm text-gray-600">
              Upload insurance certificates, licenses, and other compliance documents
            </p>
          </div>
          <Button
            label="Upload Document"
            icon="pi pi-upload"
            className="p-button-sm"
            onClick={() => setShowDocumentUpload(true)}
          />
        </div>
        
        {formData.documents && formData.documents.length > 0 ? (
          <DataTable value={formData.documents} className="p-datatable-sm">
            <Column body={documentTemplate} />
          </DataTable>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="pi pi-folder-open text-3xl mb-2"></i>
            <p>No documents uploaded yet</p>
          </div>
        )}
      </Card>
      
      {/* Document Upload Dialog */}
      <Dialog
        header="Upload Document"
        visible={showDocumentUpload}
        onHide={() => setShowDocumentUpload(false)}
        style={{ width: '500px' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={newDocument.type}
              onChange={(e) => setNewDocument({ ...newDocument, type: e.value })}
              options={documentTypes}
              placeholder="Select document type"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Name <span className="text-red-500">*</span>
            </label>
            <InputText
              value={newDocument.name}
              onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
              className="w-full"
              placeholder="e.g., General Liability Insurance 2024"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Expiry Date (if applicable)
            </label>
            <Calendar
              value={newDocument.expiryDate}
              onChange={(e) => setNewDocument({ ...newDocument, expiryDate: e.value })}
              dateFormat="dd/mm/yy"
              showIcon
              className="w-full"
              minDate={new Date()}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Select File <span className="text-red-500">*</span>
            </label>
            <FileUpload
              mode="basic"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxFileSize={10000000}
              onSelect={handleDocumentUpload}
              chooseLabel="Choose File"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, DOCX, JPG, PNG (max 10MB)
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button
            label="Cancel"
            className="p-button-text"
            onClick={() => setShowDocumentUpload(false)}
          />
          <Button
            label="Upload"
            icon="pi pi-upload"
            onClick={addNewDocument}
            disabled={!newDocument.file || !newDocument.type || !newDocument.name}
          />
        </div>
      </Dialog>
    </motion.div>
  );
}