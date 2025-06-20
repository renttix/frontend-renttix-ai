"use client";
import React, { useState, useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';
import { motion } from 'framer-motion';
import { Panel } from 'primereact/panel';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { Timeline } from 'primereact/timeline';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge } from 'primereact/badge';
import { Chip } from 'primereact/chip';
import { Avatar } from 'primereact/avatar';
import { Fieldset } from 'primereact/fieldset';
import { formatDate, formatCurrency, calculateDaysBetween } from '../../../../../../utils/helper';
import { useSelector } from 'react-redux';

export default function EnhancedConfirmStep() {
  const { state, setStep, updateFormData } = useWizard();
  const { formData, pricing, isLoading } = state;
  const { user } = useSelector((state) => state?.authReducer);
  
  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);
  const [quickActions, setQuickActions] = useState({
    sendEmail: formData.sendConfirmationEmail !== false,
    requireSignature: formData.requireSignature || false,
    createRecurring: false,
    printDeliveryNote: true
  });
  const [activeAccordion, setActiveAccordion] = useState([0, 1, 2, 3]); // All open by default
  
  const rentalDuration = calculateDaysBetween(
    new Date(formData.chargingStartDate || formData.deliveryDate), 
    new Date(formData.expectedReturnDate)
  ) || 1;
  
  // Timeline events for order process
  const timelineEvents = [
    {
      status: 'Order Created',
      date: new Date().toLocaleDateString(),
      icon: 'pi pi-shopping-cart',
      color: '#9333ea'
    },
    {
      status: 'Delivery Scheduled',
      date: formatDate(formData.deliveryDate),
      icon: 'pi pi-truck',
      color: '#3b82f6'
    },
    {
      status: 'Expected Return',
      date: formatDate(formData.expectedReturnDate),
      icon: 'pi pi-calendar-times',
      color: '#f59e0b'
    }
  ];
  
  const handleTermsChange = (checked) => {
    setTermsAccepted(checked);
    updateFormData({ termsAccepted: checked });
  };
  
  const handleQuickActionChange = (action, value) => {
    setQuickActions(prev => ({ ...prev, [action]: value }));
    if (action === 'sendEmail') {
      updateFormData({ sendConfirmationEmail: value });
    } else if (action === 'requireSignature') {
      updateFormData({ requireSignature: value });
    }
  };
  
  const EditButton = ({ step, label }) => (
    <Button
      label={label || "Edit"}
      icon="pi pi-pencil"
      className="p-button-text p-button-sm p-button-rounded"
      onClick={() => setStep(step)}
    />
  );
  
  const isOrderValid = () => {
    return termsAccepted &&
           formData.customerId &&
           formData.products?.length > 0 &&
           formData.assignedRoute &&
           formData.paymentTerm &&
           formData.invoiceRunCode;
  };
  
  // Customer summary section
  const customerSummary = () => (
    <Card className="shadow-none border-1 border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar 
            label={formData.customerDetails?.name?.charAt(0).toUpperCase()} 
            size="large" 
            shape="circle"
            style={{ backgroundColor: '#3b82f6', color: 'white' }}
          />
          <div>
            <h5 className="font-semibold m-0">{formData.customerDetails?.name}</h5>
            <p className="text-sm text-gray-600 m-0">{formData.customerDetails?.email}</p>
            <p className="text-sm text-gray-600 m-0">
              <i className="pi pi-phone mr-1"></i>
              {formData.customerDetails?.phoneNumber || 'No phone'}
            </p>
          </div>
        </div>
        <EditButton step={1} />
      </div>
      
      <Divider />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600">Account:</span>
          <span className="ml-2 font-medium">{formData.account || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-600">Payment Terms:</span>
          <Tag value={formData.paymentTermDetails?.name || 'Not set'} severity="info" className="ml-2" />
        </div>
        <div>
          <span className="text-gray-600">Invoice Run:</span>
          <span className="ml-2 font-medium">{formData.invoiceRunCodeDetails?.name || 'Not set'}</span>
        </div>
        <div>
          <span className="text-gray-600">PO Number:</span>
          <span className="ml-2 font-medium">{formData.purchaseOrderNumber || 'None'}</span>
        </div>
      </div>
    </Card>
  );
  
  // Products summary section
  const productsSummary = () => (
    <Card className="shadow-none border-1 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h6 className="font-semibold m-0">
          Products ({formData.products?.length || 0} items)
        </h6>
        <EditButton step={2} />
      </div>
      
      <DataTable 
        value={formData.products || []} 
        className="p-datatable-sm"
        scrollable 
        scrollHeight="200px"
      >
        <Column 
          field="name" 
          header="Product"
          body={(rowData) => (
            <div>
              <div className="font-medium">{rowData.name}</div>
              <div className="text-xs text-gray-500">{rowData.sku}</div>
            </div>
          )}
        />
        <Column 
          field="quantity" 
          header="Qty"
          style={{ width: '60px' }}
          body={(rowData) => (
            <Badge value={rowData.quantity} severity="info" />
          )}
        />
        <Column 
          field="dailyRate" 
          header="Rate"
          style={{ width: '80px' }}
          body={(rowData) => `£${rowData.dailyRate.toFixed(2)}`}
        />
        <Column 
          header="Total"
          style={{ width: '100px' }}
          body={(rowData) => (
            <span className="font-semibold">
              £{(rowData.quantity * rowData.dailyRate * rentalDuration).toFixed(2)}
            </span>
          )}
        />
      </DataTable>
      
      <Divider />
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Rental Duration:</span>
          <span className="font-medium">{rentalDuration} days</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-medium">£{pricing.subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>VAT (20%):</span>
          <span className="font-medium">£{pricing.tax?.toFixed(2) || '0.00'}</span>
        </div>
        <Divider />
        <div className="flex justify-between text-lg">
          <span className="font-bold">Total:</span>
          <span className="font-bold text-primary">£{pricing.total?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </Card>
  );
  
  // Delivery summary section
  const deliverySummary = () => (
    <Card className="shadow-none border-1 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h6 className="font-semibold m-0">Delivery Information</h6>
        <EditButton step={3} />
      </div>
      
      <div className="space-y-3">
        {/* Timeline */}
        <Timeline 
          value={timelineEvents} 
          opposite={(item) => item.status} 
          content={(item) => (
            <small className="text-gray-600">{item.date}</small>
          )}
          marker={(item) => (
            <span 
              className="flex w-8 h-8 items-center justify-center text-white rounded-full shadow-lg"
              style={{ backgroundColor: item.color }}
            >
              <i className={item.icon}></i>
            </span>
          )}
          className="customized-timeline"
        />
        
        <Divider />
        
        {/* Delivery Address */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Delivery Address:</p>
          <div className="bg-gray-50 p-3 rounded">
            <p className="m-0 font-medium">{formData.deliveryAddress1}</p>
            {formData.deliveryAddress2 && <p className="m-0">{formData.deliveryAddress2}</p>}
            <p className="m-0">{formData.deliveryCity}, {formData.deliveryPostcode}</p>
            <p className="m-0">{formData.deliveryCountry}</p>
          </div>
        </div>
        
        {/* Route Info */}
        {formData.routeDetails && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Assigned Route:</p>
            <div className="flex items-center gap-2">
              <Tag value={formData.routeDetails.name} severity="success" icon="pi pi-truck" />
              <span className="text-sm">
                {formData.routeDetails.driver?.name || 'Driver TBA'}
              </span>
            </div>
          </div>
        )}
        
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Contact Person:</p>
            <p className="font-medium m-0">{formData.deliveryContactPerson || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Contact Phone:</p>
            <p className="font-medium m-0">{formData.deliveryContactPhone || 'Not specified'}</p>
          </div>
        </div>
        
        {/* Instructions */}
        {(formData.deliveryInstructions || formData.accessInstructions) && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Special Instructions:</p>
            <div className="bg-yellow-50 p-3 rounded">
              {formData.deliveryInstructions && (
                <p className="m-0 text-sm">
                  <strong>Delivery:</strong> {formData.deliveryInstructions}
                </p>
              )}
              {formData.accessInstructions && (
                <p className="m-0 text-sm mt-1">
                  <strong>Access:</strong> {formData.accessInstructions}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
  
  // Documents summary section
  const documentsSummary = () => {
    if (!formData.selectedDocuments || formData.selectedDocuments.length === 0) {
      return null;
    }
    
    return (
      <Card className="shadow-none border-1 border-gray-200">
        <h6 className="font-semibold m-0 mb-3">
          Additional Documents ({formData.selectedDocuments.length})
        </h6>
        <div className="flex flex-wrap gap-2">
          {formData.selectedDocuments.map((docId, index) => (
            <Chip 
              key={index}
              label={`Document ${index + 1}`} 
              icon="pi pi-file"
              className="bg-blue-100"
            />
          ))}
        </div>
      </Card>
    );
  };
  
  // Quick actions section
  const quickActionsSection = () => (
    <Fieldset legend="Quick Actions" toggleable>
      <div className="space-y-3">
        <div className="flex items-center">
          <Checkbox
            inputId="send-email"
            checked={quickActions.sendEmail}
            onChange={(e) => handleQuickActionChange('sendEmail', e.checked)}
          />
          <label htmlFor="send-email" className="ml-2 cursor-pointer">
            Send confirmation email to customer
          </label>
        </div>
        
        <div className="flex items-center">
          <Checkbox
            inputId="require-signature"
            checked={quickActions.requireSignature}
            onChange={(e) => handleQuickActionChange('requireSignature', e.checked)}
          />
          <label htmlFor="require-signature" className="ml-2 cursor-pointer">
            Require signature on delivery
          </label>
        </div>
        
        <div className="flex items-center">
          <Checkbox
            inputId="print-delivery"
            checked={quickActions.printDeliveryNote}
            onChange={(e) => handleQuickActionChange('printDeliveryNote', e.checked)}
          />
          <label htmlFor="print-delivery" className="ml-2 cursor-pointer">
            Print delivery note after creation
          </label>
        </div>
        
        <div className="flex items-center">
          <Checkbox
            inputId="create-recurring"
            checked={quickActions.createRecurring}
            onChange={(e) => handleQuickActionChange('createRecurring', e.checked)}
          />
          <label htmlFor="create-recurring" className="ml-2 cursor-pointer">
            Set up as recurring order
          </label>
        </div>
      </div>
    </Fieldset>
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <i className="pi pi-check-circle text-primary"></i>
          Review & Confirm
        </h2>
        <p className="text-gray-600">Review all details before creating the order</p>
      </div>
      
      {/* Order Summary Header */}
      <Panel 
        header={
          <div className="flex items-center justify-between w-full">
            <span className="text-lg font-semibold">
              Order Summary
            </span>
            <div className="flex items-center gap-3">
              <Tag 
                value={`${formData.products?.length || 0} items`} 
                severity="info" 
              />
              <Tag 
                value={`£${pricing.total?.toFixed(2) || '0.00'}`} 
                severity="success" 
                icon="pi pi-pound"
              />
            </div>
          </div>
        }
        className="bg-gradient-to-r from-blue-50 to-indigo-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <i className="pi pi-calendar text-3xl text-blue-600 mb-2"></i>
            <p className="text-sm text-gray-600 m-0">Delivery Date</p>
            <p className="font-semibold m-0">{formatDate(formData.deliveryDate)}</p>
          </div>
          <div>
            <i className="pi pi-clock text-3xl text-green-600 mb-2"></i>
            <p className="text-sm text-gray-600 m-0">Rental Duration</p>
            <p className="font-semibold m-0">{rentalDuration} days</p>
          </div>
          <div>
            <i className="pi pi-map-marker text-3xl text-purple-600 mb-2"></i>
            <p className="text-sm text-gray-600 m-0">Delivery Location</p>
            <p className="font-semibold m-0">{formData.deliveryCity}</p>
          </div>
        </div>
      </Panel>
      
      {/* Detailed Sections */}
      <Accordion multiple activeIndex={activeAccordion} onTabChange={(e) => setActiveAccordion(e.index)}>
        <AccordionTab header="Customer Details">
          {customerSummary()}
        </AccordionTab>
        
        <AccordionTab header="Products & Pricing">
          {productsSummary()}
        </AccordionTab>
        
        <AccordionTab header="Delivery Information">
          {deliverySummary()}
        </AccordionTab>
        
        {formData.selectedDocuments && formData.selectedDocuments.length > 0 && (
          <AccordionTab header="Additional Documents">
            {documentsSummary()}
          </AccordionTab>
        )}
      </Accordion>
      
      {/* Quick Actions */}
      {quickActionsSection()}
      
      {/* Terms and Conditions */}
      <Card className="bg-gray-50">
        <div className="flex items-start gap-2">
          <Checkbox
            inputId="terms"
            checked={termsAccepted}
            onChange={(e) => handleTermsChange(e.checked)}
            className="mt-1"
          />
          <label htmlFor="terms" className="cursor-pointer">
            I confirm that all order details are correct and agree to the{' '}
            <a href="#" className="text-primary hover:underline">
              terms and conditions
            </a>
            {' '}of rental service.
          </label>
        </div>
      </Card>
      
      {/* Validation Messages */}
      {!isOrderValid() && (
        <Message 
          severity="warn" 
          text="Please ensure all required information is provided and terms are accepted before proceeding." 
        />
      )}
      
      {/* Notes */}
      {formData.customerNotes && (
        <Message 
          severity="info" 
          icon="pi pi-info-circle"
          content={
            <div>
              <strong>Customer Notes:</strong>
              <p className="m-0 mt-1">{formData.customerNotes}</p>
            </div>
          }
        />
      )}
    </motion.div>
  );
}