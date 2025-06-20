import React from "react";
import { Card } from "primereact/card";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { format } from "date-fns";

const TerminationSummary = ({ 
  rental, 
  formData, 
  calculations,
  onGenerateInvoiceChange,
  onSendNotificationChange 
}) => {
  const getReasonLabel = (value) => {
    const reasons = {
      contract_completed: "Contract Completed",
      early_termination: "Early Termination",
      customer_request: "Customer Request",
      non_payment: "Non-Payment",
      equipment_issue: "Equipment Issue",
      other: "Other"
    };
    return reasons[value] || value;
  };

  const getConditionSeverity = (condition) => {
    switch (condition) {
      case "good": return "success";
      case "damaged": return "danger";
      case "missing": return "warning";
      default: return "info";
    }
  };

  return (
    <div className="termination-summary">
      <Card className="mb-4">
        <h4 className="font-semibold mb-3">Termination Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Off-Hire Date:</span>
            <p className="font-medium">
              {format(formData.actualOffHireDate, "dd/MM/yyyy")}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Reason:</span>
            <p className="font-medium">{getReasonLabel(formData.offHireReason)}</p>
          </div>
          {formData.notes && (
            <div className="col-span-2">
              <span className="text-gray-600">Notes:</span>
              <p className="font-medium">{formData.notes}</p>
            </div>
          )}
          {formData.collectionArrangements && (
            <div className="col-span-2">
              <span className="text-gray-600">Collection Arrangements:</span>
              <p className="font-medium">{formData.collectionArrangements}</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="mb-4">
        <h4 className="font-semibold mb-3">Asset Return Summary</h4>
        <div className="space-y-2">
          {formData.productConditions.map((product, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{product.productName}</p>
                <p className="text-sm text-gray-600">
                  Returned: {product.returnedQuantity} of {product.originalQuantity}
                </p>
              </div>
              <Tag 
                value={product.condition} 
                severity={getConditionSeverity(product.condition)}
              />
            </div>
          ))}
        </div>
      </Card>

      {formData.hasDamage && formData.damageReport && (
        <Card className="mb-4 border-red-200">
          <h4 className="font-semibold mb-3 text-red-600">Damage Report</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Description:</span>
              <p className="font-medium">{formData.damageReport.description}</p>
            </div>
            <div>
              <span className="text-gray-600">Responsibility:</span>
              <p className="font-medium capitalize">{formData.damageReport.responsibility}</p>
            </div>
            {formData.damageReport.chargeCustomer && (
              <div>
                <span className="text-gray-600">Damage Charge:</span>
                <p className="font-medium text-red-600">
                  £{formData.damageReport.damageCharge.toFixed(2)}
                </p>
              </div>
            )}
            {formData.damageReport.photos.length > 0 && (
              <div>
                <span className="text-gray-600">Photos:</span>
                <p className="font-medium">{formData.damageReport.photos.length} uploaded</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {calculations && (
        <Card className="mb-4">
          <h4 className="font-semibold mb-3">Final Charges</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Rental Charge ({calculations.rentalDays} days):</span>
              <span>£{calculations.rentalCharge.toFixed(2)}</span>
            </div>
            {calculations.deliveryCharge > 0 && (
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span>£{calculations.deliveryCharge.toFixed(2)}</span>
              </div>
            )}
            {calculations.collectionCharge > 0 && (
              <div className="flex justify-between">
                <span>Collection Charge:</span>
                <span>£{calculations.collectionCharge.toFixed(2)}</span>
              </div>
            )}
            {calculations.lateFee > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Late Fee:</span>
                <span>£{calculations.lateFee.toFixed(2)}</span>
              </div>
            )}
            {formData.damageReport?.chargeCustomer && (
              <div className="flex justify-between text-red-600">
                <span>Damage Charge:</span>
                <span>£{formData.damageReport.damageCharge.toFixed(2)}</span>
              </div>
            )}
            <Divider />
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>£{(calculations.subtotal + (formData.damageReport?.chargeCustomer ? formData.damageReport.damageCharge : 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (20%):</span>
              <span>£{((calculations.subtotal + (formData.damageReport?.chargeCustomer ? formData.damageReport.damageCharge : 0)) * 0.20).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>£{((calculations.subtotal + (formData.damageReport?.chargeCustomer ? formData.damageReport.damageCharge : 0)) * 1.20).toFixed(2)}</span>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h4 className="font-semibold mb-3">Final Actions</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <Checkbox
              checked={formData.generateInvoice}
              onChange={(e) => onGenerateInvoiceChange(e.checked)}
              inputId="generateInvoice"
            />
            <label htmlFor="generateInvoice" className="ml-2">
              Generate final invoice and off-hire documentation
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              checked={formData.sendNotification}
              onChange={(e) => onSendNotificationChange(e.checked)}
              inputId="sendNotification"
            />
            <label htmlFor="sendNotification" className="ml-2">
              Send termination confirmation to customer
            </label>
          </div>
        </div>
      </Card>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <i className="pi pi-exclamation-triangle mr-2"></i>
          <strong>Important:</strong> This action cannot be undone. Please review all details carefully before confirming.
        </p>
      </div>
    </div>
  );
};

export default TerminationSummary;