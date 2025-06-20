"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useEnhancedWizard } from '../../context/EnhancedWizardContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { Message } from 'primereact/message';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import ValidationPanel from '../../components/ValidationPanel';
import FileAttachmentZone from '../../components/FileAttachmentZone';
import { orderAPI } from '../../../../../services/apiService';
import axios from 'axios';
import { BaseURL } from '../../../../../../utils/baseUrl';

const ConfirmAndGoStepEnhanced = () => {
  const router = useRouter();
  const { state, updateFormData, goToPreviousStep, submitOrder, saveDraft } = useEnhancedWizard();
  const { formData, pricing, validation } = state;
  const { user, token } = useSelector((state) => state?.authReducer);
  
  const [activeTab, setActiveTab] = useState(0);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState(new Set());
  const [attachments, setAttachments] = useState([]);
  const [additionalEmails, setAdditionalEmails] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [saveAsQuote, setSaveAsQuote] = useState(false);
  const [recurringContract, setRecurringContract] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [depots, setDepots] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [invoiceRunCodes, setInvoiceRunCodes] = useState([]);
  const [paymentTerms] = useState([
    { label: 'Net 30', value: 'net30' },
    { label: 'Net 15', value: 'net15' },
    { label: 'Due on Receipt', value: 'immediate' },
    { label: 'Net 60', value: 'net60' },
  ]);

  // Fetch reference data on mount
  useEffect(() => {
    fetchReferenceData();
    validateOrder();
  }, []);

  const fetchReferenceData = async () => {
    try {
      // Fetch depots
      const depotsResponse = await axios.get(
        `${BaseURL}/depot?vendorId=${user?._id}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (depotsResponse.data.success) {
        setDepots(depotsResponse.data.data.map(d => ({
          label: d.name,
          value: d._id
        })));
      }

      // Fetch sales persons
      const salesResponse = await axios.get(
        `${BaseURL}/user/sales-persons?vendorId=${user?._id}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (salesResponse.data.success) {
        setSalesPersons(salesResponse.data.data.map(s => ({
          label: s.name,
          value: s._id
        })));
      }

      // Fetch invoice run codes
      const invoiceResponse = await axios.get(
        `${BaseURL}/invoice-run-code?vendorId=${user?._id}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (invoiceResponse.data.success) {
        setInvoiceRunCodes(invoiceResponse.data.data.map(i => ({
          label: i.code,
          value: i._id
        })));
      }
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const validateOrder = async () => {
    try {
      const response = await orderAPI.validateOrder(formData);
      if (response.data.warnings) {
        setValidationWarnings(response.data.warnings);
      }
    } catch (error) {
      console.error('Error validating order:', error);
    }
  };

  const handleFileUpload = (files) => {
    setAttachments(files);
    updateFormData({ attachments: files });
  };

  const handleWarningAcknowledge = (warningId) => {
    setAcknowledgedWarnings(prev => new Set([...prev, warningId]));
  };

  const calculateTotals = () => {
    const subtotal = formData.products.reduce((sum, product) => {
      return sum + (product.quantity * product.price);
    }, 0);
    
    const deliveryCost = pricing.routeCost || 0;
    const tax = subtotal * 0.2; // 20% VAT
    const total = subtotal + deliveryCost + tax;
    
    return { subtotal, deliveryCost, tax, total };
  };

  const handleSubmit = async () => {
    // Check if all warnings are acknowledged
    const unacknowledgedWarnings = validationWarnings.filter(
      w => !acknowledgedWarnings.has(w.id)
    );
    
    if (unacknowledgedWarnings.length > 0) {
      // Show warnings that need acknowledgment
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmDialog(false);
    setSubmitting(true);
    
    try {
      const orderData = {
        ...formData,
        saveAsQuote,
        recurringContract,
        additionalEmails: additionalEmails.split(',').map(e => e.trim()).filter(e => e),
        customerMessage,
        attachments,
        acknowledgedWarnings: Array.from(acknowledgedWarnings),
      };
      
      const result = await submitOrder(orderData);
      
      if (result.success) {
        router.push(`/order/view/${result.orderId}`);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft();
      // Show success message
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const totals = calculateTotals();

  const orderSummaryHeader = (
    <div className="flex justify-between items-center">
      <span>Order Summary</span>
      <Tag value={saveAsQuote ? 'Quote' : 'Order'} severity={saveAsQuote ? 'warning' : 'success'} />
    </div>
  );

  const productBodyTemplate = (product) => {
    return (
      <div>
        <div className="font-semibold">{product.name}</div>
        {product.selectedAssets && product.selectedAssets.length > 0 && (
          <small className="text-gray-500">
            Assets: {product.selectedAssets.map(a => a.barcode).join(', ')}
          </small>
        )}
      </div>
    );
  };

  const priceBodyTemplate = (product) => {
    return `£${(product.quantity * product.price).toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="confirm-go-step-enhanced"
    >
      <Card className="mb-4">
        <h2 className="text-2xl font-bold mb-4">
          <i className="pi pi-check-circle mr-2"></i>
          Confirm & Go
        </h2>
        <p className="text-gray-600 mb-6">
          Review your order details and submit
        </p>

        {validationWarnings.length > 0 && (
          <ValidationPanel
            warnings={validationWarnings}
            acknowledgedWarnings={acknowledgedWarnings}
            onAcknowledge={handleWarningAcknowledge}
            className="mb-4"
          />
        )}

        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Order Summary" leftIcon="pi pi-list">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Panel header={orderSummaryHeader} className="mb-4">
                  <div className="space-y-4">
                    {/* Customer Information */}
                    <div>
                      <h4 className="font-semibold mb-2">Customer Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Customer:</span>
                          <span className="ml-2">{formData.customerDetails?.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <span className="ml-2">{formData.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <span className="ml-2">{formData.phoneNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Account:</span>
                          <span className="ml-2">{formData.account}</span>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Delivery Information */}
                    <div>
                      <h4 className="font-semibold mb-2">Delivery Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Delivery Date:</span>
                          <span className="ml-2">{new Date(formData.deliveryDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time Window:</span>
                          <span className="ml-2">{formData.deliveryTime}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Address:</span>
                          <span className="ml-2">
                            {formData.deliveryAddress1}, {formData.deliveryCity}, {formData.deliveryPostcode}
                          </span>
                        </div>
                        {formData.recurringDelivery && (
                          <div className="col-span-2">
                            <Tag 
                              value={`Recurring: ${formData.recurringDelivery.pattern}`} 
                              severity="info" 
                              icon="pi pi-refresh"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <Divider />

                    {/* Products */}
                    <div>
                      <h4 className="font-semibold mb-2">Products</h4>
                      <DataTable value={formData.products} size="small">
                        <Column field="name" header="Product" body={productBodyTemplate} />
                        <Column field="quantity" header="Qty" style={{ width: '80px' }} />
                        <Column field="price" header="Unit Price" body={(p) => `£${p.price.toFixed(2)}`} />
                        <Column header="Total" body={priceBodyTemplate} style={{ width: '100px' }} />
                      </DataTable>
                    </div>
                  </div>
                </Panel>
              </div>

              <div>
                {/* Pricing Summary */}
                <Panel header="Total Cost" className="mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold">£{totals.subtotal.toFixed(2)}</span>
                    </div>
                    {totals.deliveryCost > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span className="font-semibold">£{totals.deliveryCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>VAT (20%):</span>
                      <span className="font-semibold">£{totals.tax.toFixed(2)}</span>
                    </div>
                    <Divider />
                    <div className="flex justify-between text-xl">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-primary">£{totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </Panel>

                {/* Quick Actions */}
                <Panel header="Quick Actions" className="mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Checkbox
                        inputId="saveAsQuote"
                        checked={saveAsQuote}
                        onChange={(e) => setSaveAsQuote(e.checked)}
                      />
                      <label htmlFor="saveAsQuote" className="ml-2">
                        Save as Quote Only
                      </label>
                    </div>
                    {formData.recurringDelivery && (
                      <div className="flex items-center">
                        <Checkbox
                          inputId="recurringContract"
                          checked={recurringContract}
                          onChange={(e) => setRecurringContract(e.checked)}
                        />
                        <label htmlFor="recurringContract" className="ml-2">
                          Create Recurring Contract
                        </label>
                      </div>
                    )}
                    <Button
                      label="Save as Draft"
                      icon="pi pi-save"
                      severity="secondary"
                      outlined
                      className="w-full"
                      onClick={handleSaveDraft}
                    />
                  </div>
                </Panel>
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Additional Settings" leftIcon="pi pi-cog">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="field">
                  <label htmlFor="depot" className="font-semibold">
                    Depot *
                  </label>
                  <Dropdown
                    id="depot"
                    value={formData.depot}
                    options={depots}
                    onChange={(e) => updateFormData({ depot: e.value })}
                    placeholder="Select depot"
                    className="w-full"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="salesPerson" className="font-semibold">
                    Sales Person
                  </label>
                  <Dropdown
                    id="salesPerson"
                    value={formData.salesPerson}
                    options={salesPersons}
                    onChange={(e) => updateFormData({ salesPerson: e.value })}
                    placeholder="Select sales person"
                    className="w-full"
                  />
                </div>

                <div className="field">
                  <label htmlFor="invoiceRunCode" className="font-semibold">
                    Invoice Run Code
                  </label>
                  <Dropdown
                    id="invoiceRunCode"
                    value={formData.invoiceRunCode}
                    options={invoiceRunCodes}
                    onChange={(e) => updateFormData({ invoiceRunCode: e.value })}
                    placeholder="Select invoice run code"
                    className="w-full"
                  />
                </div>

                <div className="field">
                  <label htmlFor="paymentTerm" className="font-semibold">
                    Payment Terms
                  </label>
                  <Dropdown
                    id="paymentTerm"
                    value={formData.paymentTerm}
                    options={paymentTerms}
                    onChange={(e) => updateFormData({ paymentTerm: e.value })}
                    placeholder="Select payment terms"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="field">
                  <label htmlFor="purchaseOrderNumber" className="font-semibold">
                    Purchase Order Number
                  </label>
                  <InputText
                    id="purchaseOrderNumber"
                    value={formData.purchaseOrderNumber || ''}
                    onChange={(e) => updateFormData({ purchaseOrderNumber: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="field">
                  <label htmlFor="reference" className="font-semibold">
                    Reference
                  </label>
                  <InputText
                    id="reference"
                    value={formData.reference || ''}
                    onChange={(e) => updateFormData({ reference: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="field">
                  <label htmlFor="orderedBy" className="font-semibold">
                    Ordered By
                  </label>
                  <InputText
                    id="orderedBy"
                    value={formData.orderedBy || ''}
                    onChange={(e) => updateFormData({ orderedBy: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="field">
                  <div className="flex items-center mb-2">
                    <Checkbox
                      inputId="invoiceInBatch"
                      checked={formData.invoiceInBatch === 1}
                      onChange={(e) => updateFormData({ invoiceInBatch: e.checked ? 1 : 0 })}
                    />
                    <label htmlFor="invoiceInBatch" className="ml-2">
                      Include in batch invoicing
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Communications" leftIcon="pi pi-envelope">
            <div className="space-y-6">
              <div className="field">
                <label htmlFor="additionalEmails" className="font-semibold">
                  Additional Recipient Emails
                </label>
                <InputText
                  id="additionalEmails"
                  value={additionalEmails}
                  onChange={(e) => setAdditionalEmails(e.target.value)}
                  className="w-full"
                  placeholder="email1@example.com, email2@example.com"
                />
                <small className="text-gray-500">
                  Separate multiple emails with commas
                </small>
              </div>

              <div className="field">
                <label htmlFor="customerMessage" className="font-semibold">
                  Message to Customer
                </label>
                <InputTextarea
                  id="customerMessage"
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  rows={4}
                  className="w-full"
                  placeholder="Add a message that will be included in the order confirmation email..."
                />
              </div>

              <div className="field">
                <div className="flex items-center">
                  <Checkbox
                    inputId="sendConfirmationEmail"
                    checked={formData.sendConfirmationEmail}
                    onChange={(e) => updateFormData({ sendConfirmationEmail: e.checked })}
                  />
                  <label htmlFor="sendConfirmationEmail" className="ml-2">
                    Send confirmation email to customer
                  </label>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel header="Attachments" leftIcon="pi pi-paperclip">
            <FileAttachmentZone
              onFilesChange={handleFileUpload}
              maxFiles={5}
              maxSize={10 * 1024 * 1024} // 10MB
              acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.png']}
            />
          </TabPanel>
        </TabView>

        <Divider />

        <div className="flex justify-between items-center mt-6">
          <Button
            label="Previous"
            icon="pi pi-arrow-left"
            onClick={goToPreviousStep}
            severity="secondary"
            outlined
          />
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Checkbox
                inputId="termsAccepted"
                checked={formData.termsAccepted}
                onChange={(e) => updateFormData({ termsAccepted: e.checked })}
              />
              <label htmlFor="termsAccepted" className="ml-2">
                I accept the terms and conditions
              </label>
            </div>
            
            <Button
              label={saveAsQuote ? "Create Quote" : "Create Order"}
              icon="pi pi-check"
              iconPos="right"
              onClick={handleSubmit}
              disabled={!formData.termsAccepted || submitting}
              loading={submitting}
            />
          </div>
        </div>
      </Card>

      <Dialog
        visible={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        header="Confirm Order Submission"
        modal
        style={{ width: '450px' }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              severity="secondary"
              outlined
              onClick={() => setShowConfirmDialog(false)}
            />
            <Button
              label="Confirm"
              icon="pi pi-check"
              onClick={confirmSubmit}
              autoFocus
            />
          </div>
        }
      >
        <div className="space-y-4">
          <p>Are you sure you want to submit this {saveAsQuote ? 'quote' : 'order'}?</p>
          <div className="bg-gray-100 p-3 rounded">
            <div className="font-semibold mb-2">Summary:</div>
            <div className="text-sm space-y-1">
              <div>Customer: {formData.customerDetails?.name}</div>
              <div>Products: {formData.products.length} items</div>
              <div>Total: £{totals.total.toFixed(2)}</div>
              <div>Delivery: {new Date(formData.deliveryDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </Dialog>
    </motion.div>
  );
};

export default ConfirmAndGoStepEnhanced;