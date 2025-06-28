"use client";
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import PhoneInputField from '../../../PhoneInputField/PhoneInputField';

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Arabic', value: 'ar' },
];

export default function ContactStep() {
  const { state, updateFormData, completeStep, setValidation, addContact, removeContact } = useWizard();
  const { formData } = state;
  
  const [errors, setErrors] = useState({});
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    mobile: '',
    isPrimary: false,
  });
  const [contactErrors, setContactErrors] = useState({});
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validateStep = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Primary email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.telephone && !formData.mobile) {
      newErrors.phone = 'At least one phone number is required';
    }
    
    setErrors(newErrors);
    setValidation(2, newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  const validateNewContact = () => {
    const errors = {};
    
    if (!newContact.name) {
      errors.name = 'Contact name is required';
    }
    
    if (!newContact.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(newContact.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!newContact.phone && !newContact.mobile) {
      errors.phone = 'At least one phone number is required';
    }
    
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAddContact = () => {
    if (validateNewContact()) {
      addContact(newContact);
      setNewContact({
        name: '',
        role: '',
        email: '',
        phone: '',
        mobile: '',
        isPrimary: false,
      });
      setShowAddContact(false);
      setContactErrors({});
    }
  };
  
  // Validate on form data changes
  useEffect(() => {
    validateStep();
  }, [formData.email, formData.telephone]);
  
  const contactTemplate = (contact, index) => {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{contact.name}</p>
          <p className="text-sm text-gray-600">{contact.role || 'No role specified'}</p>
        </div>
        <div className="flex items-center gap-2">
          {contact.isPrimary && (
            <Tag value="Primary" severity="success" />
          )}
          <Button
            icon="pi pi-trash"
            className="p-button-text p-button-danger p-button-sm"
            onClick={() => removeContact(index)}
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
        <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
        <p className="text-gray-600">How can we reach your customer?</p>
      </div>
      
      {/* Primary Contact Information */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Primary Contact Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-envelope"></i>
              </span>
              <InputText
              type='email'
                value={formData.email || ''}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                placeholder="email@example.com"
              />
            </div>
            {errors.email && (
              <small className="text-red-500">{errors.email}</small>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number {!formData.mobile && <span className="text-red-500">*</span>}
            </label>
            <PhoneInputField
              value={formData.telephone}
              onChange={(value) => updateFormData({ telephone: value })}
              placeholder="Enter phone number"
              className={errors.phone && !formData.mobile ? 'p-invalid' : ''}
            />
            {errors.phone && !formData.mobile && (
              <small className="text-red-500">{errors.phone}</small>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Mobile Number {!formData.telephone && <span className="text-red-500">*</span>}
            </label>
            <PhoneInputField
              value={formData.mobile}
              onChange={(value) => updateFormData({ mobile: value })}
              placeholder="Enter mobile number"
              className={errors.phone && !formData.telephone ? 'p-invalid' : ''}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Fax Number</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-print"></i>
              </span>
              <InputText
              type='number'
                value={formData.fax || ''}
                onChange={(e) => updateFormData({ fax: e.target.value })}
                className="w-full"
                placeholder="Fax number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <i className="pi pi-globe"></i>
              </span>
              <InputText
              type='url'
                value={formData.website || ''}
                onChange={(e) => updateFormData({ website: e.target.value })}
                className="w-full"
                placeholder="www.example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Language</label>
            <Dropdown
              value={formData.preferredLanguage}
              onChange={(e) => updateFormData({ preferredLanguage: e.value })}
              options={languages}
              placeholder="Select language"
              className="w-full"
            />
          </div>
        </div>
      </Card>
      
      {/* Communication Preferences */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Communication Preferences</h3>
        <p className="text-sm text-gray-600 mb-4">
          How would the customer like to receive updates and notifications?
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Checkbox
              inputId="pref-email"
              checked={formData.communicationPreferences?.email || false}
              onChange={(e) => updateFormData({
                communicationPreferences: {
                  ...formData.communicationPreferences,
                  email: e.checked
                }
              })}
            />
            <label htmlFor="pref-email" className="ml-2 cursor-pointer">
              <i className="pi pi-envelope mr-2"></i>
              Email notifications
            </label>
          </div>
          
          <div className="flex items-center">
            <Checkbox
              inputId="pref-sms"
              checked={formData.communicationPreferences?.sms || false}
              onChange={(e) => updateFormData({
                communicationPreferences: {
                  ...formData.communicationPreferences,
                  sms: e.checked
                }
              })}
            />
            <label htmlFor="pref-sms" className="ml-2 cursor-pointer">
              <i className="pi pi-mobile mr-2"></i>
              SMS notifications
            </label>
          </div>
          
          <div className="flex items-center">
            <Checkbox
              inputId="pref-phone"
              checked={formData.communicationPreferences?.phone || false}
              onChange={(e) => updateFormData({
                communicationPreferences: {
                  ...formData.communicationPreferences,
                  phone: e.checked
                }
              })}
            />
            <label htmlFor="pref-phone" className="ml-2 cursor-pointer">
              <i className="pi pi-phone mr-2"></i>
              Phone calls
            </label>
          </div>
          
          <div className="flex items-center">
            <Checkbox
              inputId="pref-post"
              checked={formData.communicationPreferences?.post || false}
              onChange={(e) => updateFormData({
                communicationPreferences: {
                  ...formData.communicationPreferences,
                  post: e.checked
                }
              })}
            />
            <label htmlFor="pref-post" className="ml-2 cursor-pointer">
              <i className="pi pi-send mr-2"></i>
              Postal mail
            </label>
          </div>
        </div>
      </Card>
      
      {/* Additional Contacts */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Additional Contacts</h3>
          <Button
            label="Add Contact"
            icon="pi pi-plus"
            className="p-button-sm"
            onClick={() => setShowAddContact(true)}
          />
        </div>
        
        {formData.contacts && formData.contacts.length > 0 ? (
          <DataTable value={formData.contacts} className="p-datatable-sm">
            <Column field="name" header="Name" />
            <Column field="role" header="Role" />
            <Column field="email" header="Email" />
            <Column field="phone" header="Phone" />
            <Column body={contactTemplate} style={{ width: '150px' }} />
          </DataTable>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="pi pi-users text-3xl mb-2"></i>
            <p>No additional contacts added yet</p>
          </div>
        )}
      </Card>
      
      {/* Add Contact Dialog */}
      <Dialog
        header="Add New Contact"
        visible={showAddContact}
        onHide={() => {
          setShowAddContact(false);
          setContactErrors({});
        }}
        style={{ width: '500px' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <InputText
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className={`w-full ${contactErrors.name ? 'p-invalid' : ''}`}
              placeholder="John Doe"
            />
            {contactErrors.name && (
              <small className="text-red-500">{contactErrors.name}</small>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Role/Title</label>
            <InputText
              value={newContact.role}
              onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
              className="w-full"
              placeholder="e.g., Accounts Payable"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <InputText
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              className={`w-full ${contactErrors.email ? 'p-invalid' : ''}`}
              type='email'
              placeholder="email@example.com"
            />
            {contactErrors.email && (
              <small className="text-red-500">{contactErrors.email}</small>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <InputText
                value={newContact.phone}
                type='telephone'
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className={`w-full ${contactErrors.phone && !newContact.mobile ? 'p-invalid' : ''}`}
                placeholder="Phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Mobile</label>
              <InputText
                value={newContact.mobile}
                onChange={(e) => setNewContact({ ...newContact, mobile: e.target.value })}
                className="w-full"
                type='telephone'
                placeholder="Mobile number"
              />
            </div>
          </div>
          {contactErrors.phone && (
            <small className="text-red-500">{contactErrors.phone}</small>
          )}
          
          <div className="flex items-center">
            <Checkbox
              inputId="isPrimary"
              checked={newContact.isPrimary}
              onChange={(e) => setNewContact({ ...newContact, isPrimary: e.checked })}
            />
            <label htmlFor="isPrimary" className="ml-2 cursor-pointer">
              Set as primary contact for specific communications
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button
            label="Cancel"
            className="p-button-text"
            onClick={() => {
              setShowAddContact(false);
              setContactErrors({});
            }}
          />
          <Button
            label="Add Contact"
            icon="pi pi-check"
            onClick={handleAddContact}
          />
        </div>
      </Dialog>
    </motion.div>
  );
}