import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Steps } from "primereact/steps";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Calendar, 
  Settings, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";

const PaymentTermsWizard = ({ visible, onHide, onSave }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    code: `PT-${Math.floor(Math.random() * 9000) + 1000}`,
    description: "",
    periodType: "Days",
    days: 30,
    earlyPaymentDiscount: 0,
    lateFee: 0,
    notes: ""
  });

  const steps = [
    { label: "Basic Info", icon: <FileText size={20} /> },
    { label: "Payment Period", icon: <Calendar size={20} /> },
    { label: "Advanced Settings", icon: <Settings size={20} /> },
    { label: "Review", icon: <CheckCircle size={20} /> }
  ];

  const periodTypeOptions = [
    { label: "Days", value: "Days" },
    { label: "Months", value: "Months" },
    { label: "End of Month", value: "EOM" },
    { label: "Net", value: "Net" }
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="elite-wizard-step"
          >
            <h3 className="elite-wizard-step-title">Basic Information</h3>
            <p className="elite-wizard-step-subtitle">
              Enter the basic details for your payment term
            </p>
            
            <div className="elite-wizard-form">
              <div className="elite-form-field">
                <label>Term Name *</label>
                <InputText
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Net 30"
                  className="elite-input"
                />
                <small>Choose a descriptive name for this payment term</small>
              </div>
              
              <div className="elite-form-field">
                <label>Code *</label>
                <InputText
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="PT-1234"
                  className="elite-input"
                />
                <small>Unique identifier (auto-generated)</small>
              </div>
              
              <div className="elite-form-field">
                <label>Description</label>
                <InputTextarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe when this payment term should be used..."
                  rows={3}
                  className="elite-textarea"
                />
              </div>
            </div>
          </motion.div>
        );
        
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="elite-wizard-step"
          >
            <h3 className="elite-wizard-step-title">Payment Period</h3>
            <p className="elite-wizard-step-subtitle">
              Configure when payment is due
            </p>
            
            <div className="elite-wizard-form">
              <div className="elite-form-row">
                <div className="elite-form-field">
                  <label>Period Type *</label>
                  <Dropdown
                    value={formData.periodType}
                    options={periodTypeOptions}
                    onChange={(e) => setFormData({ ...formData, periodType: e.value })}
                    placeholder="Select period type"
                    className="elite-dropdown"
                  />
                </div>
                
                <div className="elite-form-field">
                  <label>Number of {formData.periodType} *</label>
                  <InputNumber
                    value={formData.days}
                    onValueChange={(e) => setFormData({ ...formData, days: e.value })}
                    min={1}
                    max={365}
                    className="elite-input"
                  />
                </div>
              </div>
              
              <div className="elite-payment-preview">
                <h4>Payment Due Date Preview</h4>
                <div className="elite-preview-card">
                  <Calendar size={24} className="elite-preview-icon" />
                  <div>
                    <p>Invoice Date: Today</p>
                    <p className="elite-preview-due">
                      Due Date: {formData.days} {formData.periodType} from invoice date
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="elite-wizard-step"
          >
            <h3 className="elite-wizard-step-title">Advanced Settings</h3>
            <p className="elite-wizard-step-subtitle">
              Optional settings for discounts and fees
            </p>
            
            <div className="elite-wizard-form">
              <div className="elite-form-field">
                <label>Early Payment Discount (%)</label>
                <InputNumber
                  value={formData.earlyPaymentDiscount}
                  onValueChange={(e) => setFormData({ ...formData, earlyPaymentDiscount: e.value })}
                  min={0}
                  max={100}
                  suffix="%"
                  className="elite-input"
                />
                <small>Discount offered for early payment</small>
              </div>
              
              <div className="elite-form-field">
                <label>Late Payment Fee (%)</label>
                <InputNumber
                  value={formData.lateFee}
                  onValueChange={(e) => setFormData({ ...formData, lateFee: e.value })}
                  min={0}
                  max={100}
                  suffix="%"
                  className="elite-input"
                />
                <small>Fee charged for late payments</small>
              </div>
              
              <div className="elite-form-field">
                <label>Internal Notes</label>
                <InputTextarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes for internal use..."
                  rows={3}
                  className="elite-textarea"
                />
              </div>
              
              <div className="elite-ai-suggestion">
                <Sparkles size={16} className="elite-ai-icon" />
                <p>
                  <strong>AI Suggestion:</strong> Based on your industry, 
                  offering a 2% early payment discount can improve cash flow by 15%
                </p>
              </div>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="elite-wizard-step"
          >
            <h3 className="elite-wizard-step-title">Review & Confirm</h3>
            <p className="elite-wizard-step-subtitle">
              Review your payment term configuration
            </p>
            
            <div className="elite-review-section">
              <div className="elite-review-card">
                <h4>Basic Information</h4>
                <div className="elite-review-item">
                  <span>Name:</span>
                  <strong>{formData.name || "Not set"}</strong>
                </div>
                <div className="elite-review-item">
                  <span>Code:</span>
                  <strong>{formData.code}</strong>
                </div>
                <div className="elite-review-item">
                  <span>Description:</span>
                  <strong>{formData.description || "No description"}</strong>
                </div>
              </div>
              
              <div className="elite-review-card">
                <h4>Payment Period</h4>
                <div className="elite-review-item">
                  <span>Due:</span>
                  <strong>{formData.days} {formData.periodType}</strong>
                </div>
                {formData.earlyPaymentDiscount > 0 && (
                  <div className="elite-review-item">
                    <span>Early Payment Discount:</span>
                    <strong>{formData.earlyPaymentDiscount}%</strong>
                  </div>
                )}
                {formData.lateFee > 0 && (
                  <div className="elite-review-item">
                    <span>Late Payment Fee:</span>
                    <strong>{formData.lateFee}%</strong>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  const customHeader = (
    <div className="elite-wizard-header">
      <h2 className="elite-wizard-title">Create Payment Term</h2>
      <Steps
        model={steps.map((step, index) => ({
          ...step,
          className: index === activeStep ? 'elite-step-active' : ''
        }))}
        activeIndex={activeStep}
        className="elite-wizard-steps"
      />
    </div>
  );

  const customFooter = (
    <div className="elite-wizard-footer">
      <Button
        label="Previous"
        icon={<ArrowLeft size={16} />}
        onClick={handlePrevious}
        disabled={activeStep === 0}
        className="elite-wizard-btn-secondary"
      />
      
      <div className="elite-wizard-footer-right">
        <Button
          label="Cancel"
          onClick={onHide}
          className="elite-wizard-btn-text"
          text
        />
        {activeStep < steps.length - 1 ? (
          <Button
            label="Next"
            icon={<ArrowRight size={16} />}
            iconPos="right"
            onClick={handleNext}
            className="elite-wizard-btn-primary"
          />
        ) : (
          <Button
            label="Create Payment Term"
            icon={<CheckCircle size={16} />}
            iconPos="right"
            onClick={handleSave}
            className="elite-wizard-btn-success"
          />
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={customHeader}
      footer={customFooter}
      className="elite-wizard-dialog"
      modal
      style={{ width: '50vw' }}
      breakpoints={{ '960px': '75vw', '640px': '95vw' }}
    >
      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>
    </Dialog>
  );
};

export default PaymentTermsWizard;