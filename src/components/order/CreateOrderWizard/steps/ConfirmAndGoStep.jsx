"use client";
import React, { useState, useCallback } from "react";
import { useWizard } from "../context/WizardContext";
import { motion } from "framer-motion";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { formatDate, formatCurrency } from "../../../../../utils/helper";
import { useSelector } from "react-redux";
import RouteAssignmentDisplay from "../components/RouteAssignmentDisplay";
import { imageBaseURL } from "../../../../../utils/baseUrl";

export default function ConfirmAndGoStep() {
  const { state, setStep, updateFormData } = useWizard();
  const { formData, pricing, isLoading } = state;
  const { user } = useSelector((state) => state?.authReducer);
  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);
  const [quickActions, setQuickActions] = useState({
    sendEmail: formData.sendConfirmationEmail !== false,
    requireSignature: formData.requireSignature || false,
    addToRecurring: false,
  });
  const orderDiscount = Number(formData.orderDiscount) || 0;

  /**
   * Count billable days based on rentalDaysPerWeek:
   *  - 5 => exclude Saturday & Sunday
   *  - 6 => exclude Sunday
   *  - 7 => include all days
   * Enforces product.minimumRentalPeriod and returns at least 1.
   */
  const chargeableDaysForProduct = useCallback(
    (p) => {
      const startRaw = formData.chargingStartDate || formData.deliveryDate;
      const endRaw = formData.expectedReturnDate;

      const minPeriod =
        p?.minimumRentalPeriod ??
        p?.rateDefinition?.minimumRentalPeriod ??
        0;

      if (!startRaw || !endRaw) return Math.max(1, minPeriod);

      const startDate = new Date(startRaw);
      const endDate = new Date(endRaw);

      // normalize to midnight local to avoid TZ issues
      const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      const perWeek =
        p?.rentalDaysPerWeek ??
        p?.rateDefinition?.rentalDaysPerWeek ??
        7;

      const excludeSunday = perWeek <= 6;   // exclude when 5 or 6
      const excludeSaturday = perWeek === 5;

      let days = 0;
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay(); // 0 Sun … 6 Sat
        if ((excludeSunday && dow === 0) || (excludeSaturday && dow === 6)) continue;
        days++;
      }

      return Math.max(days, minPeriod, 1);
    },
    [formData.chargingStartDate, formData.deliveryDate, formData.expectedReturnDate]
  );

  // ---- Pricing -------------------------------------------------------------

  const calculatePricing = () => {
    let subtotal = 0;
    let taxTotal = 0;

    formData.products?.forEach((product) => {
      const salePriceNum = Number(product.salePrice);
      const hasSalePrice = !isNaN(salePriceNum) && salePriceNum > 0;

      if (hasSalePrice) {
        subtotal += product.quantity * salePriceNum;
      } else {
        const billableDays = chargeableDaysForProduct(product);
        const baseAmount = product.quantity * product.dailyRate * billableDays;
        const taxAmount = baseAmount * (Number(product.taxRate) / 100);

        subtotal += baseAmount;
        taxTotal += taxAmount;
      }
    });

    const totalBeforeDiscount = subtotal + taxTotal;
    const discountAmount = (totalBeforeDiscount * orderDiscount) / 100;
    const subtotalAfterDiscount = totalBeforeDiscount - discountAmount;

    // Add damage waiver amount
    const damageWaiverAmount = formData.damageWaiverCalculations?.totalAmount || 0;
    const damageWaiverTax = formData.damageWaiverCalculations?.taxAmount || 0;

    const total = subtotalAfterDiscount + damageWaiverAmount;

    return {
      subtotal,
      tax: taxTotal,
      discountAmount,
      damageWaiverAmount,
      damageWaiverTax,
      total,
    };
  };

  const calculatedPricing = calculatePricing();

  // ---- Handlers ------------------------------------------------------------

  const handleTermsChange = (checked) => {
    setTermsAccepted(checked);
    updateFormData({ termsAccepted: checked });
  };

  const handleQuickActionChange = (action, value) => {
    setQuickActions((prev) => ({ ...prev, [action]: value }));
    if (action === "sendEmail") {
      updateFormData({ sendConfirmationEmail: value });
    } else if (action === "requireSignature") {
      updateFormData({ requireSignature: value });
    }
  };

  const EditButton = ({ step, label }) => (
    <Button
      label={label || "Edit"}
      icon="pi pi-pencil"
      className="p-button-text p-button-sm"
      onClick={() => setStep(step)}
    />
  );

  const isOrderValid = () => {
    return (
      termsAccepted &&
      formData.customerId &&
      formData.products?.length > 0 &&
      formData.assignedRoute &&
      formData.paymentTerm &&
      formData.invoiceRunCode
    );
  };

  // console.log(formData);

  // ---- Render --------------------------------------------------------------

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
        <p className="text-gray-600">Almost there! Review your order details and confirm</p>
      </div>

      {/* Order Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="">
          <div className="">
            <h3 className="text-lg font-semibold py-3">
              Order Summary for {formData.customerDetails?.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <i className="pi pi-calendar text-blue-600"></i>
              <span>
                {formatDate(formData.deliveryDate)} - {formatDate(formData.expectedReturnDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <i className="pi pi-map-marker text-blue-600"></i>
              <span>
                {formData.deliveryCity}, {formData.deliveryPostcode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <i className="pi pi-truck text-blue-600"></i>
              <span>Route: {formData.assignedRoute?.routeName || "Floating Task"}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Products & Services */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Products & Services</h3>
          <EditButton step={2} />
        </div>

        {/* Product Rows */}
        <div className="space-y-3">
          {formData.products?.map((product) => {
            const salePriceNum = Number(product.salePrice);
            const hasSalePrice = !isNaN(salePriceNum) && salePriceNum > 0;

            const billableDays = hasSalePrice ? 0 : chargeableDaysForProduct(product);
            const baseAmount = hasSalePrice ? 0 : product.quantity * product.dailyRate * billableDays;
            const taxAmount = hasSalePrice ? 0 : baseAmount * (Number(product.taxRate) / 100);

            return (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-3">
                  {product.image && (
                    <img
                      src={`${imageBaseURL}${product.image}`}
                      alt={product.name}
                      onError={(e) => (e.currentTarget.src = "/images/product/placeholder.webp")}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {hasSalePrice ? (
                        <span>
                          {product.quantity} × {formatCurrency(salePriceNum, user?.currencyKey)}
                        </span>
                      ) : (
                        <span>
                          {product.quantity} × {formatCurrency(product.dailyRate, user?.currencyKey)}/day +{" "}
                          {product.taxRate}% tax
                        </span>
                      )}
                      {product.maintenanceConfig && (
                        <>
                          <span>•</span>
                          <Tag
                            value={`Maintenance: ${product.maintenanceConfig.frequency}`}
                            severity="info"
                            className="text-xs"
                          />
                        </>
                      )}
                    </div>

                    {!hasSalePrice && (
                      <div className="text-xs text-gray-500 mt-1">
                        Billed days: {billableDays}
                        {product?.minimumRentalPeriod
                          ? ` (min ${product.minimumRentalPeriod} days applied)`
                          : ""}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-medium">
                    {hasSalePrice
                      ? formatCurrency(product.quantity * salePriceNum, user?.currencyKey)
                      : formatCurrency(baseAmount + taxAmount, user?.currencyKey)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Divider />

        {/* Pricing Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(calculatedPricing.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">VAT:</span>
            <span>{formatCurrency(calculatedPricing.tax)}</span>
          </div>
          {calculatedPricing.damageWaiverAmount > 0 && (
            <div className="flex justify-between text-sm text-blue-600">
              <span>Damage Waiver:</span>
              <span>+{formatCurrency(calculatedPricing.damageWaiverAmount)}</span>
            </div>
          )}
          {orderDiscount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Discount ({orderDiscount}%)</span>
              <span>-{formatCurrency(calculatedPricing.discountAmount)}</span>
            </div>
          )}
          <Divider />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span className="text-blue-600">{formatCurrency(calculatedPricing.total)}</span>
          </div>
        </div>
      </Card>

      {/* Delivery Details */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Delivery Details</h3>
          <EditButton step={3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Delivery Address</p>
            <p className="font-medium">
              {formData.deliveryAddress1}
              {formData.deliveryAddress2 && `, ${formData.deliveryAddress2}`}
            </p>
            <p className="font-medium">
              {formData.deliveryCity}, {formData.deliveryPostcode}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Contact</p>
            <p className="font-medium">{formData.deliveryContactName}</p>
            <p className="text-sm">{formData.deliveryContactPhone}</p>
          </div>
        </div>

        {formData.deliveryInstructions && (
          <div className="mt-4 p-3 bg-yellow-50 rounded">
            <p className="text-sm font-medium text-yellow-800">Delivery Instructions:</p>
            <p className="text-sm text-yellow-700 mt-1">{formData.deliveryInstructions}</p>
          </div>
        )}

        <Divider />

        <RouteAssignmentDisplay
          assignedRoute={formData.assignedRoute}
          deliveryAddress={{
            address1: formData.deliveryAddress1,
            address2: formData.deliveryAddress2,
            city: formData.deliveryCity,
            postcode: formData.deliveryPostcode,
            country: formData.deliveryCountry,
          }}
        />
      </Card>

      {/* Invoice & Payment Settings */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Invoice & Payment</h3>
          <EditButton step={1} label="Edit in Step 1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Payment Terms</p>
            <p className="font-medium">
              {formData.paymentTerm ? (
                <Tag severity={"success"} value={formData.customerDetails.paymentTerm.name} />
              ) : (
                <span className="text-red-500">Not Set</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Invoice Run Code</p>
            <p className="font-medium">
              {formData.invoiceRunCode ? (
                <Tag severity={"success"} value={formData.customerDetails.invoiceRunCode.name} />
              ) : (
                <span className="text-red-500">Not Set</span>
              )}
            </p>
          </div>
          {formData.billingPeriod && (
            <div>
              <p className="text-sm text-gray-600">Billing Period</p>
              <p className="font-medium capitalize">{formData.billingPeriod}</p>
            </div>
          )}
          {formData.purchaseOrderNumber && (
            <div>
              <p className="text-sm text-gray-600">PO Number</p>
              <p className="font-medium">{formData.purchaseOrderNumber}</p>
            </div>
          )}
        </div>

        {formData.invoiceInBatch && (
          <div className="mt-3 flex items-center gap-2">
            <Tag value="Batch Invoicing" severity="info" icon="pi pi-check" />
            <span className="text-sm text-gray-600">
              This order will be included in batch invoicing
            </span>
          </div>
        )}

        {formData.customerNotes && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-800">Customer Invoice Notes:</p>
            <p className="text-sm text-blue-700 mt-1">{formData.customerNotes}</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <Checkbox
              inputId="sendEmail"
              checked={quickActions.sendEmail}
              onChange={(e) => handleQuickActionChange("sendEmail", e.checked)}
            />
            <label htmlFor="sendEmail" className="ml-2 cursor-pointer">
              Send confirmation email to customer
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              inputId="requireSignature"
              checked={quickActions.requireSignature}
              onChange={(e) => handleQuickActionChange("requireSignature", e.checked)}
            />
            <label htmlFor="requireSignature" className="ml-2 cursor-pointer">
              Require signature on delivery
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              inputId="addToRecurring"
              checked={quickActions.addToRecurring}
              onChange={(e) => handleQuickActionChange("addToRecurring", e.checked)}
            />
            <label htmlFor="addToRecurring" className="ml-2 cursor-pointer">
              Add to recurring orders
            </label>
          </div>
        </div>
      </Card>

      {/* Terms and Conditions */}
      <Card className={!termsAccepted ? "border-2 border-red-200" : ""}>
        <div className="flex items-start gap-3">
          <Checkbox
            inputId="terms"
            checked={termsAccepted}
            onChange={(e) => handleTermsChange(e.checked)}
            className="mt-1"
          />
          <label htmlFor="terms" className="cursor-pointer flex-1">
            <span className="font-medium">I agree to the terms and conditions</span>
            <p className="text-sm text-gray-600 mt-1">
              By creating this order, I confirm that all information is correct and I accept the
              rental terms and conditions.
            </p>
          </label>
        </div>
      </Card>

      {!termsAccepted && (
        <Message severity="warn" text="Please accept the terms and conditions to continue" />
      )}

      {(!formData.paymentTerm || !formData.invoiceRunCode) && (
        <Message
          severity="error"
          text="Missing required invoice settings. Please go back to Step 1 to set Payment Terms and Invoice Run Code."
        />
      )}

      {/* Post-Submit Actions Preview */}
      <Card className="bg-green-50">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <i className="pi pi-bolt text-green-600"></i>
          After Creating This Order:
        </h4>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <i className="pi pi-check text-green-600"></i>
            View order details and track status
          </li>
          <li className="flex items-center gap-2">
            <i className="pi pi-check text-green-600"></i>
            Print delivery note for driver
          </li>
          <li className="flex items-center gap-2">
            <i className="pi pi-check text-green-600"></i>
            Create similar order with one click
          </li>
          {quickActions.sendEmail && (
            <li className="flex items-center gap-2">
              <i className="pi pi-check text-green-600"></i>
              Confirmation email will be sent to {formData.customerDetails?.email}
            </li>
          )}
        </ul>
      </Card>

      {/* Navigation (kept commented as in your original) */}
      {/* ... */}
    </motion.div>
  );
}

