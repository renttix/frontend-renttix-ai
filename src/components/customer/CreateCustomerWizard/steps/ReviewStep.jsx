"use client";
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { formatCurrency } from '../../../../../utils/helper';
import { useSelector } from 'react-redux';

export default function ReviewStep() {
  const { state, setStep, updateFormData } = useWizard();
  const { formData } = state;
  const { user } = useSelector((state) => state?.authReducer);
  
  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);
  const [dataPrivacyAccepted, setDataPrivacyAccepted] = useState(formData.dataPrivacyAccepted || false);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(formData.sendWelcomeEmail !== false);
  
  // Update form data when checkboxes change
  useEffect(() => {
    updateFormData({
      termsAccepted,
      dataPrivacyAccepted,
      sendWelcomeEmail
    });
  }, [termsAccepted, dataPrivacyAccepted, sendWelcomeEmail]);
  
  const EditButton = ({ step, label }) => (
    <Button
      label={label || "Edit"}
      icon="pi pi-pencil"
      className="p-button-text p-button-sm"
      onClick={() => setStep(step)}
    />
  );
  
  const isFormValid = () => {
    return termsAccepted && dataPrivacyAccepted;
  };
  
  const getCustomerName = () => {
    if (formData.customerType === 'company') {
      return formData.companyName;
    }
    return `${formData.name} ${formData.lastName}`;
  };
  
  const getCreditStatusSeverity = (status) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'fair': return 'warning';
      case 'poor': return 'danger';
      default: return 'secondary';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
        <p className="text-gray-600">Please review all information before creating the customer account</p>
      </div>
      
      {/* Customer Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {formData.logo ? (
              <img
                src={URL?.createObjectURL(formData.logo)}
                alt="Customer logo"
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                <i className={`pi ${formData.customerType === 'company' ? 'pi-building' : 'pi-user'} text-2xl text-gray-400`}></i>
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold">{getCustomerName()}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Tag value={formData.customerType === 'company' ? 'Company' : 'Individual'} />
                {formData.creditStatus && (
                  <Tag 
                    value={formData.creditStatus.toUpperCase()} 
                    severity={getCreditStatusSeverity(formData.creditStatus)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Basic Information */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <EditButton step={1} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.customerType === 'company' ? (
            <>
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="font-medium">{formData.companyName}</p>
              </div>
              {formData.tradingName && (
                <div>
                  <p className="text-sm text-gray-600">Trading Name</p>
                  <p className="font-medium">{formData.tradingName}</p>
                </div>
              )}
              {formData.registrationNumber && (
                <div>
                  <p className="text-sm text-gray-600">Registration Number</p>
                  <p className="font-medium">{formData.registrationNumber}</p>
                </div>
              )}
              {formData.vatNumber && (
                <div>
                  <p className="text-sm text-gray-600">VAT Number</p>
                  <p className="font-medium">{formData.vatNumber}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{formData.name} {formData.lastName}</p>
              </div>
            </>
          )}
          {formData.taxId && (
            <div>
              <p className="text-sm text-gray-600">Tax ID</p>
              <p className="font-medium">{formData.taxId}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Industry</p>
            <p className="font-medium">{formData.industry || 'Not specified'}</p>
          </div>
        </div>
      </Card>
      
      {/* Contact Information */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <EditButton step={2} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{formData.email}</p>
          </div>
          {formData.telephone && (
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{formData.telephone}</p>
            </div>
          )}
          {formData.mobile && (
            <div>
              <p className="text-sm text-gray-600">Mobile</p>
              <p className="font-medium">{formData.mobile}</p>
            </div>
          )}
          {formData.website && (
            <div>
              <p className="text-sm text-gray-600">Website</p>
              <p className="font-medium">{formData.website}</p>
            </div>
          )}
        </div>
        
        {formData.contacts && formData.contacts.length > 0 && (
          <>
            <Divider />
            <div>
              <p className="text-sm font-medium mb-2">Additional Contacts ({formData.contacts.length})</p>
              <div className="space-y-2">
                {formData.contacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{contact.name} - {contact.role || 'No role'}</span>
                    <span className="text-gray-600">{contact.email}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
      
      {/* Address Information */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Address Information</h3>
          <EditButton step={3} />
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Billing Address</p>
            <p className="text-sm">
              {formData.addressLine1}
              {formData.addressLine2 && `, ${formData.addressLine2}`}
            </p>
            <p className="text-sm">
              {formData.city}, {formData.postCode}
            </p>
            <p className="text-sm">{formData.country}</p>
          </div>
          
          {formData.deliveryAddresses && formData.deliveryAddresses.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">
                Delivery Locations ({formData.deliveryAddresses.length})
              </p>
              <div className="space-y-1">
                {formData.deliveryAddresses.map((addr, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <span className="font-medium">{addr.name}:</span> {addr.addressLine1}, {addr.city}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Financial Information */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Financial & Compliance</h3>
          <EditButton step={4} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Payment Terms</p>
            <p className="font-medium">
              {formData.paymentTerm ? 'Payment terms set' : <span className="text-red-500">Not set</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Invoice Run Code</p>
            <p className="font-medium">
              {formData.invoiceRunCode ? 'Invoice code set' : <span className="text-red-500">Not set</span>}
            </p>
          </div>
          {formData.creditLimit > 0 && (
            <div>
              <p className="text-sm text-gray-600">Credit Limit</p>
              <p className="font-medium">{formatCurrency(formData.creditLimit, user?.currencyKey)}</p>
            </div>
          )}
          {formData.billingPeriod && (
            <div>
              <p className="text-sm text-gray-600">Billing Period</p>
              <p className="font-medium capitalize">{formData.billingPeriod}</p>
            </div>
          )}
        </div>
        
        {formData.documents && formData.documents.length > 0 && (
          <>
            <Divider />
            <div>
              <p className="text-sm font-medium mb-2">
                Compliance Documents ({formData.documents.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.documents.map((doc, index) => (
                  <Tag key={index} value={doc.name} icon="pi pi-file" />
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
      
      {/* Terms and Conditions */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              inputId="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="cursor-pointer flex-1">
              <span className="font-medium">I agree to the terms and conditions</span>
              <p className="text-sm text-gray-600 mt-1">
                By creating this customer account, I confirm that all information provided is accurate and complete.
              </p>
            </label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              inputId="privacy"
              checked={dataPrivacyAccepted}
              onChange={(e) => setDataPrivacyAccepted(e.checked)}
              className="mt-1"
            />
            <label htmlFor="privacy" className="cursor-pointer flex-1">
              <span className="font-medium">I agree to the data privacy policy</span>
              <p className="text-sm text-gray-600 mt-1">
                Customer data will be processed and stored in accordance with our privacy policy and GDPR regulations.
              </p>
            </label>
          </div>
          
          <Divider />
          
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="welcome"
              checked={sendWelcomeEmail}
              onChange={(e) => setSendWelcomeEmail(e.checked)}
            />
            <label htmlFor="welcome" className="cursor-pointer">
              Send welcome email to customer with account details
            </label>
          </div>
        </div>
      </Card>
      
      {(!termsAccepted || !dataPrivacyAccepted) && (
        <Message 
          severity="warn" 
          text="Please accept the terms and conditions and data privacy policy to continue" 
        />
      )}
      
      {/* Success Preview */}
      <Card className="bg-green-50">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <i className="pi pi-check-circle text-green-600"></i>
          What happens next?
        </h4>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <i className="pi pi-check text-green-600"></i>
            Customer account will be created and activated
          </li>
          {sendWelcomeEmail && (
            <li className="flex items-center gap-2">
              <i className="pi pi-check text-green-600"></i>
              Welcome email sent to {formData.email}
            </li>
          )}
          <li className="flex items-center gap-2">
            <i className="pi pi-check text-green-600"></i>
            Payment terms and invoice settings will be applied to all orders
          </li>
          <li className="flex items-center gap-2">
            <i className="pi pi-check text-green-600"></i>
            You can immediately create orders for this customer
          </li>
        </ul>
      </Card>
    </motion.div>
  );
}