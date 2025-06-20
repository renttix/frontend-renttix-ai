"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Steps } from "primereact/steps";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import { Image } from "primereact/image";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { ProgressSpinner } from "primereact/progressspinner";
import { format, differenceInDays } from "date-fns";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { useSelector } from "react-redux";
import DamageReportForm from "./DamageReportForm";
import DocumentUploader from "./DocumentUploader";
import TerminationSummary from "./TerminationSummary";

const TerminateRentalModal = ({ visible, onHide, rental, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const toast = useRef(null);
  const { token, user } = useSelector((state) => state?.authReducer);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Off-hire details
    actualOffHireDate: new Date(),
    offHireReason: null,
    notes: "",
    documents: [],
    
    // Step 2: Asset condition
    productConditions: [],
    
    // Step 3: Damage report (conditional)
    hasDamage: false,
    damageReport: {
      description: "",
      responsibility: null,
      chargeCustomer: false,
      damageCharge: 0,
      photos: []
    },
    
    // Step 4: Final details
    generateInvoice: true,
    sendNotification: true,
    collectionArrangements: "",
    
    // Calculations
    calculations: null
  });

  const steps = [
    { label: "Contract Summary" },
    { label: "Off-Hire Details" },
    { label: "Asset Condition" },
    { label: "Damage Report" },
    { label: "Review & Confirm" }
  ];

  const offHireReasons = [
    { label: "Contract Completed", value: "contract_completed" },
    { label: "Early Termination", value: "early_termination" },
    { label: "Customer Request", value: "customer_request" },
    { label: "Non-Payment", value: "non_payment" },
    { label: "Equipment Issue", value: "equipment_issue" },
    { label: "Other", value: "other" }
  ];

  const responsibilityOptions = [
    { label: "Customer", value: "customer" },
    { label: "Internal", value: "internal" },
    { label: "Unknown", value: "unknown" }
  ];

  useEffect(() => {
    if (rental && visible) {
      initializeFormData();
      calculateCharges();
    }
  }, [rental, visible]);

  const initializeFormData = () => {
    // Initialize product conditions based on rental products
    const productConditions = rental.products?.map(product => ({
      productId: product.productId || product._id,
      productName: product.productName,
      originalQuantity: product.quantity,
      returnedQuantity: product.quantity,
      condition: "good",
      damageDescription: "",
      photos: []
    })) || [];

    setFormData(prev => ({
      ...prev,
      productConditions
    }));
  };

  const calculateCharges = async () => {
    setCalculating(true);
    try {
      const response = await axios.post(
        `${BaseURL}/termination/calculate-charges`,
        {
          orderId: rental._id,
          terminationDate: formData.actualOffHireDate
        },
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          calculations: response.data.calculations
        }));
      }
    } catch (error) {
      console.error("Error calculating charges:", error);
      // Use mock calculations for development
      setFormData(prev => ({
        ...prev,
        calculations: getMockCalculations()
      }));
    } finally {
      setCalculating(false);
    }
  };

  const getMockCalculations = () => {
    const days = differenceInDays(new Date(), new Date(rental.deliveryDate));
    const dailyRate = rental.products?.reduce((sum, p) => sum + (p.price * p.quantity), 0) || 0;
    const rentalCharge = dailyRate * days;
    const deliveryCharge = 50;
    const collectionCharge = 50;
    const lateFee = 0;
    const subtotal = rentalCharge + deliveryCharge + collectionCharge + lateFee;
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

    return {
      rentalDays: days,
      dailyRate,
      rentalCharge,
      deliveryCharge,
      collectionCharge,
      lateFee,
      damageCharge: 0,
      subtotal,
      tax,
      total
    };
  };

  const validateStep = (step) => {
    switch (step) {
      case 1: // Off-hire details
        if (!formData.actualOffHireDate) {
          toast.current?.show({
            severity: "warn",
            summary: "Validation Error",
            detail: "Please select off-hire date",
            life: 3000
          });
          return false;
        }
        if (!formData.offHireReason) {
          toast.current?.show({
            severity: "warn",
            summary: "Validation Error",
            detail: "Please select off-hire reason",
            life: 3000
          });
          return false;
        }
        return true;

      case 2: // Asset condition
        const allProductsAccounted = formData.productConditions.every(
          pc => pc.returnedQuantity >= 0
        );
        if (!allProductsAccounted) {
          toast.current?.show({
            severity: "warn",
            summary: "Validation Error",
            detail: "Please specify returned quantity for all products",
            life: 3000
          });
          return false;
        }
        return true;

      case 3: // Damage report
        if (formData.hasDamage) {
          if (!formData.damageReport.description) {
            toast.current?.show({
              severity: "warn",
              summary: "Validation Error",
              detail: "Please provide damage description",
              life: 3000
            });
            return false;
          }
          if (!formData.damageReport.responsibility) {
            toast.current?.show({
              severity: "warn",
              summary: "Validation Error",
              detail: "Please assign responsibility for damage",
              life: 3000
            });
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      // Skip damage report step if no damage
      if (activeStep === 2 && !formData.hasDamage) {
        setActiveStep(4); // Go to review
      } else {
        setActiveStep(activeStep + 1);
      }
      
      // Recalculate charges when moving to review
      if (activeStep === 3 || (activeStep === 2 && !formData.hasDamage)) {
        calculateCharges();
      }
    }
  };

  const handleBack = () => {
    // Skip damage report step if no damage when going back
    if (activeStep === 4 && !formData.hasDamage) {
      setActiveStep(2);
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const terminationData = {
        orderId: rental._id,
        actualOffHireDate: formData.actualOffHireDate,
        offHireReason: formData.offHireReason,
        notes: formData.notes,
        documents: formData.documents,
        products: formData.productConditions.map(pc => ({
          productId: pc.productId,
          productName: pc.productName,
          quantityReturned: pc.returnedQuantity,
          condition: pc.condition,
          damageDescription: pc.damageDescription
        })),
        damageReport: formData.hasDamage ? formData.damageReport : null,
        generateInvoice: formData.generateInvoice,
        sendNotification: formData.sendNotification,
        collectionArrangements: formData.collectionArrangements
      };

      const response = await axios.post(
        `${BaseURL}/termination/terminate-rental`,
        terminationData,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Rental terminated successfully",
          life: 3000
        });

        // Generate documents if requested
        if (formData.generateInvoice) {
          await generateDocuments(response.data.terminationId);
        }

        onSuccess();
        onHide();
      }
    } catch (error) {
      console.error("Error terminating rental:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to terminate rental",
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDocuments = async (terminationId) => {
    try {
      await axios.post(
        `${BaseURL}/termination/generate-documents`,
        {
          terminationId,
          documentTypes: ["offHireNote", "finalInvoice", "damageReport"]
        },
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error("Error generating documents:", error);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Contract Summary
        return (
          <div className="contract-summary">
            <Card className="mb-4">
              <h4 className="font-semibold mb-3">Contract Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Contract Number:</span>
                  <p className="font-medium">{rental.orderId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Customer:</span>
                  <p className="font-medium">{rental.customer?.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Start Date:</span>
                  <p className="font-medium">
                    {rental.deliveryDate ? format(new Date(rental.deliveryDate), "dd/MM/yyyy") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Expected Return:</span>
                  <p className="font-medium">
                    {rental.expectedReturnDate ? format(new Date(rental.expectedReturnDate), "dd/MM/yyyy") : "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="mb-4">
              <h4 className="font-semibold mb-3">Rental Items</h4>
              <div className="space-y-2">
                {rental.products?.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{product.quantity}x {product.productName}</span>
                    <span className="font-medium">£{product.price}/day</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h4 className="font-semibold mb-3">Current Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Days Rented:</span>
                  <span className="font-medium">
                    {rental.deliveryDate ? differenceInDays(new Date(), new Date(rental.deliveryDate)) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Tag 
                    value={rental.status} 
                    severity={rental.status === "overdue" ? "danger" : "success"}
                  />
                </div>
                {calculating ? (
                  <div className="text-center py-2">
                    <ProgressSpinner style={{ width: "20px", height: "20px" }} />
                  </div>
                ) : formData.calculations && (
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Current Charges:</span>
                    <span>£{formData.calculations.total.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );

      case 1: // Off-hire details
        return (
          <div className="off-hire-details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium">
                  Actual Off-Hire Date <span className="text-red-500">*</span>
                </label>
                <Calendar
                  value={formData.actualOffHireDate}
                  onChange={(e) => setFormData({ ...formData, actualOffHireDate: e.value })}
                  dateFormat="dd/mm/yy"
                  minDate={new Date(rental.deliveryDate)}
                  maxDate={new Date()}
                  showIcon
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Off-Hire Reason <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  value={formData.offHireReason}
                  options={offHireReasons}
                  onChange={(e) => setFormData({ ...formData, offHireReason: e.value })}
                  placeholder="Select reason"
                  className="w-full"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Additional Notes</label>
              <InputTextarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full"
                placeholder="Any additional information about the termination..."
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Collection Arrangements</label>
              <InputTextarea
                value={formData.collectionArrangements}
                onChange={(e) => setFormData({ ...formData, collectionArrangements: e.target.value })}
                rows={3}
                className="w-full"
                placeholder="Specify collection time, contact person, special instructions..."
              />
            </div>

            <DocumentUploader
              documents={formData.documents}
              onUpload={(docs) => setFormData({ ...formData, documents: docs })}
              onRemove={(index) => {
                const newDocs = [...formData.documents];
                newDocs.splice(index, 1);
                setFormData({ ...formData, documents: newDocs });
              }}
            />
          </div>
        );

      case 2: // Asset condition
        return (
          <div className="asset-condition">
            <p className="mb-4 text-gray-600">
              Please assess the condition of each returned item:
            </p>

            <div className="space-y-4">
              {formData.productConditions.map((product, index) => (
                <Card key={index} className="p-4">
                  <h5 className="font-semibold mb-3">
                    {product.productName} (Qty: {product.originalQuantity})
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block mb-2 text-sm">Quantity Returned</label>
                      <InputNumber
                        value={product.returnedQuantity}
                        onValueChange={(e) => {
                          const newConditions = [...formData.productConditions];
                          newConditions[index].returnedQuantity = e.value || 0;
                          setFormData({ ...formData, productConditions: newConditions });
                        }}
                        min={0}
                        max={product.originalQuantity}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm">Condition</label>
                      <div className="flex gap-3">
                        <div className="flex items-center">
                          <RadioButton
                            inputId={`good-${index}`}
                            value="good"
                            onChange={(e) => {
                              const newConditions = [...formData.productConditions];
                              newConditions[index].condition = e.value;
                              setFormData({ 
                                ...formData, 
                                productConditions: newConditions,
                                hasDamage: newConditions.some(pc => pc.condition === "damaged")
                              });
                            }}
                            checked={product.condition === "good"}
                          />
                          <label htmlFor={`good-${index}`} className="ml-2">Good</label>
                        </div>
                        <div className="flex items-center">
                          <RadioButton
                            inputId={`damaged-${index}`}
                            value="damaged"
                            onChange={(e) => {
                              const newConditions = [...formData.productConditions];
                              newConditions[index].condition = e.value;
                              setFormData({ 
                                ...formData, 
                                productConditions: newConditions,
                                hasDamage: true
                              });
                            }}
                            checked={product.condition === "damaged"}
                          />
                          <label htmlFor={`damaged-${index}`} className="ml-2">Damaged</label>
                        </div>
                        <div className="flex items-center">
                          <RadioButton
                            inputId={`missing-${index}`}
                            value="missing"
                            onChange={(e) => {
                              const newConditions = [...formData.productConditions];
                              newConditions[index].condition = e.value;
                              setFormData({ ...formData, productConditions: newConditions });
                            }}
                            checked={product.condition === "missing"}
                          />
                          <label htmlFor={`missing-${index}`} className="ml-2">Missing</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {product.condition === "damaged" && (
                    <div>
                      <label className="block mb-2 text-sm">Damage Description</label>
                      <InputTextarea
                        value={product.damageDescription}
                        onChange={(e) => {
                          const newConditions = [...formData.productConditions];
                          newConditions[index].damageDescription = e.target.value;
                          setFormData({ ...formData, productConditions: newConditions });
                        }}
                        rows={2}
                        className="w-full"
                        placeholder="Describe the damage..."
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {formData.hasDamage && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <i className="pi pi-info-circle mr-2"></i>
                  Damaged items detected. You will need to complete a damage report in the next step.
                </p>
              </div>
            )}
          </div>
        );

      case 3: // Damage report
        return (
          <DamageReportForm
            damageReport={formData.damageReport}
            damagedProducts={formData.productConditions.filter(pc => pc.condition === "damaged")}
            onChange={(report) => setFormData({ ...formData, damageReport: report })}
          />
        );

      case 4: // Review & Confirm
        return (
          <TerminationSummary
            rental={rental}
            formData={formData}
            calculations={formData.calculations}
            onGenerateInvoiceChange={(value) => 
              setFormData({ ...formData, generateInvoice: value })
            }
            onSendNotificationChange={(value) => 
              setFormData({ ...formData, sendNotification: value })
            }
          />
        );

      default:
        return null;
    }
  };

  const footer = (
    <div className="flex justify-between">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onHide}
        severity="secondary"
        outlined
      />
      <div className="flex gap-2">
        {activeStep > 0 && (
          <Button
            label="Back"
            icon="pi pi-arrow-left"
            onClick={handleBack}
            severity="secondary"
          />
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            label="Next"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={handleNext}
          />
        ) : (
          <Button
            label="Confirm Termination"
            icon="pi pi-check"
            onClick={handleSubmit}
            loading={loading}
            severity="danger"
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header="Terminate Rental"
        footer={footer}
        style={{ width: "60vw" }}
        breakpoints={{ "960px": "80vw", "640px": "95vw" }}
        modal
        maximizable
      >
        <Steps
          model={steps}
          activeIndex={activeStep}
          className="mb-6"
          readOnly
        />
        
        <div className="step-content">
          {renderStepContent()}
        </div>
      </Dialog>
    </>
  );
};

export default TerminateRentalModal;