"use client";
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { InputSwitch } from 'primereact/inputswitch';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function AdditionalSettingsStep() {
  const { state, updateFormData, setValidation } = useWizard();
  const { formData } = state;
  const { user, token } = useSelector((state) => state?.authReducer);
  
  const [loading, setLoading] = useState(false);
  const [depots, setDepots] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [invoiceRunCodes, setInvoiceRunCodes] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Form fields
  const [settingsData, setSettingsData] = useState({
    depot: formData.depot || '',
    paymentTerm: formData.paymentTerm || formData.customerDetails?.paymentTerm?._id || '',
    invoiceRunCode: formData.invoiceRunCode || formData.customerDetails?.invoiceRunCode?._id || '',
    purchaseOrderNumber: formData.purchaseOrderNumber || '',
    reference: formData.reference || '',
    customerReference: formData.customerReference || '',
    siteContact: formData.siteContact || '',
    salesPerson: formData.salesPerson || '',
    orderedBy: formData.orderedBy || '',
    billingPeriod: formData.billingPeriod || '',
    phoneNumber: formData.phoneNumber || '',
    notes: formData.notes || '',
    internalNotes: formData.internalNotes || '',
    requireSignature: formData.requireSignature || false,
    sendConfirmationEmail: formData.sendConfirmationEmail || true,
    invoiceInBatch: formData.invoiceInBatch || false,
  });
  
  // Fetch dropdown data
  useEffect(() => {
    fetchDropdownData();
  }, []);
  
  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      // Fetch depots
      const depotsResponse = await axios.get(
        `${BaseURL}/depot/get-depots?vendorId=${user?._id}`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      if (depotsResponse.data.success) {
        setDepots(depotsResponse.data.data);
      }
      
      // Fetch payment terms
      const paymentTermsResponse = await axios.get(
        `${BaseURL}/payment-terms/get-payment-terms?vendorId=${user?._id}`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      if (paymentTermsResponse.data.success) {
        setPaymentTerms(paymentTermsResponse.data.data);
      }
      
      // Fetch invoice run codes
      const invoiceRunCodesResponse = await axios.get(
        `${BaseURL}/invoice-run-code/get-invoice-run-codes?vendorId=${user?._id}`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      if (invoiceRunCodesResponse.data.success) {
        setInvoiceRunCodes(invoiceRunCodesResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Validate form
  useEffect(() => {
    const newErrors = {};
    
    if (!settingsData.paymentTerm) {
      newErrors.paymentTerm = 'Payment terms are required';
    }
    
    if (!settingsData.invoiceRunCode) {
      newErrors.invoiceRunCode = 'Invoice run code is required';
    }
    
    setErrors(newErrors);
    setValidation(4, newErrors);
  }, [settingsData, setValidation]);
  
  const handleFieldChange = (field, value) => {
    const newData = { ...settingsData, [field]: value };
    setSettingsData(newData);
    updateFormData({ [field]: value });
  };
  
  const billingPeriods = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Annually', value: 'annually' },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Additional Order Details</h2>
        <p className="text-gray-600">Configure payment terms, depot, and other settings.</p>
      </div>
      
      {/* Required Settings */}
      <Card title="Required Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Terms <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={settingsData.paymentTerm}
              onChange={(e) => handleFieldChange('paymentTerm', e.value)}
              options={paymentTerms}
              optionLabel="name"
              optionValue="_id"
              placeholder="Select payment terms"
              className={`w-full ${errors.paymentTerm ? 'p-invalid' : ''}`}
              loading={loading}
            />
            {errors.paymentTerm && (
              <small className="text-red-500">{errors.paymentTerm}</small>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Run Code <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={settingsData.invoiceRunCode}
              onChange={(e) => handleFieldChange('invoiceRunCode', e.value)}
              options={invoiceRunCodes}
              optionLabel="name"
              optionValue="_id"
              placeholder="Select invoice run code"
              className={`w-full ${errors.invoiceRunCode ? 'p-invalid' : ''}`}
              loading={loading}
            />
            {errors.invoiceRunCode && (
              <small className="text-red-500">{errors.invoiceRunCode}</small>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depot
            </label>
            <Dropdown
              value={settingsData.depot}
              onChange={(e) => handleFieldChange('depot', e.value)}
              options={depots}
              optionLabel="name"
              optionValue="_id"
              placeholder="Select depot (optional)"
              className="w-full"
              loading={loading}
              showClear
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Period
            </label>
            <Dropdown
              value={settingsData.billingPeriod}
              onChange={(e) => handleFieldChange('billingPeriod', e.value)}
              options={billingPeriods}
              placeholder="Select billing period"
              className="w-full"
              showClear
            />
          </div>
        </div>
      </Card>
      
      {/* Contact Information */}
      <Card title="Contact Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Contact
            </label>
            <InputText
              value={settingsData.siteContact}
              onChange={(e) => handleFieldChange('siteContact', e.target.value)}
              className="w-full"
              placeholder="Site contact person"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sales Person
            </label>
            <InputText
              value={settingsData.salesPerson}
              onChange={(e) => handleFieldChange('salesPerson', e.target.value)}
              className="w-full"
              placeholder="Sales representative"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordered By
            </label>
            <InputText
              value={settingsData.orderedBy}
              onChange={(e) => handleFieldChange('orderedBy', e.target.value)}
              className="w-full"
              placeholder="Person who placed the order"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <PhoneInput
              country={'us'}
              value={settingsData.phoneNumber}
              onChange={(phone) => handleFieldChange('phoneNumber', phone)}
              inputClass="w-full"
              containerClass="w-full"
            />
          </div>
        </div>
      </Card>
      
      {/* Reference Information */}
      <Card title="Reference Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Order Number
            </label>
            <InputText
              value={settingsData.purchaseOrderNumber}
              onChange={(e) => handleFieldChange('purchaseOrderNumber', e.target.value)}
              className="w-full"
              placeholder="PO-12345"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Reference
            </label>
            <InputText
              value={settingsData.customerReference}
              onChange={(e) => handleFieldChange('customerReference', e.target.value)}
              className="w-full"
              placeholder="Customer's reference"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Reference
            </label>
            <InputText
              value={settingsData.reference}
              onChange={(e) => handleFieldChange('reference', e.target.value)}
              className="w-full"
              placeholder="Internal reference"
            />
          </div>
        </div>
      </Card>
      
      {/* Notes */}
      <Card title="Notes">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Notes
            </label>
            <InputTextarea
              value={settingsData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Notes visible to the customer on invoices..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <InputTextarea
              value={settingsData.internalNotes}
              onChange={(e) => handleFieldChange('internalNotes', e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Internal notes for staff only..."
            />
          </div>
        </div>
      </Card>
      
      {/* Additional Options */}
      <Card title="Additional Options">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="requireSignature"
              checked={settingsData.requireSignature}
              onChange={(e) => handleFieldChange('requireSignature', e.checked)}
            />
            <label htmlFor="requireSignature" className="cursor-pointer">
              Require signature on delivery
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="sendConfirmationEmail"
              checked={settingsData.sendConfirmationEmail}
              onChange={(e) => handleFieldChange('sendConfirmationEmail', e.checked)}
            />
            <label htmlFor="sendConfirmationEmail" className="cursor-pointer">
              Send order confirmation email to customer
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="invoiceInBatch"
              checked={settingsData.invoiceInBatch}
              onChange={(e) => handleFieldChange('invoiceInBatch', e.checked)}
            />
            <label htmlFor="invoiceInBatch" className="cursor-pointer">
              Include in batch invoicing
            </label>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}