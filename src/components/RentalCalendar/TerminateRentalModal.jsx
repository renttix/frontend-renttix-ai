"use client";

import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { format, differenceInDays } from "date-fns";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { useSelector } from "react-redux";

const TerminateRentalModal = ({ visible, onHide, order, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const { token } = useSelector((state) => state?.authReducer);

  const [formData, setFormData] = useState({
    collectionDate: new Date(),
    collectionTime: "morning",
    returnCondition: "good",
    notes: "",
    sendConfirmation: true,
    generateDocumentation: true
  });

  const timeOptions = [
    { label: "Morning (8-12)", value: "morning" },
    { label: "Afternoon (12-5)", value: "afternoon" },
    { label: "Evening (5-8)", value: "evening" }
  ];

  const conditionOptions = [
    { label: "Good - No issues", value: "good" },
    { label: "Damaged - Requires assessment", value: "damaged" },
    { label: "Partial - Some items missing", value: "partial" }
  ];

  if (!order) return null;

  const rentalStartDate = new Date(order.deliveryDate || order.orderDate);
  const daysRented = differenceInDays(formData.collectionDate, rentalStartDate);
  const dailyRate = order.totalAmount / (order.rentalDays || 1);
  const currentCharges = dailyRate * daysRented;

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Create return note
      const returnData = {
        orderId: order._id,
        returnDate: formData.collectionDate.toISOString(),
        returnTime: formData.collectionTime,
        condition: formData.returnCondition,
        notes: formData.notes,
        finalCharges: currentCharges
      };

      const response = await axios.post(
        `${BaseURL}/order/create-return-note`,
        returnData,
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
          detail: "Collection scheduled successfully",
          life: 3000
        });

        // Send confirmation email if requested
        if (formData.sendConfirmation) {
          // API call to send email
        }

        // Generate documentation if requested
        if (formData.generateDocumentation) {
          // API call to generate docs
        }

        onHide();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error scheduling collection:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to schedule collection",
        life: 3000
      });
    } finally {
      setLoading(false);
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
      <Button
        label="Schedule Collection"
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header={`Terminate Rental - Order #${order?.orderNumber || order?._id}`}
        footer={footer}
        style={{ width: "40vw" }}
        breakpoints={{ "960px": "60vw", "640px": "95vw" }}
        modal
      >
        <div className="terminate-rental-content">
          {/* Current Rental Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Current Rental Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium">{order?.customer?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Started:</span>
                <span className="font-medium">
                  {format(rentalStartDate, "MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Items:</span>
                <span className="font-medium">
                  {order?.items?.map(item => `${item.quantity}x ${item.productName}`).join(", ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Daily Rate:</span>
                <span className="font-medium">£{dailyRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Days Rented:</span>
                <span className="font-medium">{daysRented}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Current Charges:</span>
                <span>£{currentCharges.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Schedule Collection */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Schedule Collection</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Date</label>
                <Calendar
                  value={formData.collectionDate}
                  onChange={(e) => setFormData({ ...formData, collectionDate: e.value })}
                  dateFormat="dd/mm/yy"
                  minDate={new Date()}
                  showIcon
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Time</label>
                <Dropdown
                  value={formData.collectionTime}
                  options={timeOptions}
                  onChange={(e) => setFormData({ ...formData, collectionTime: e.value })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Return Condition */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Return Condition</h4>
            <div className="space-y-3">
              {conditionOptions.map((option) => (
                <div key={option.value} className="flex items-center">
                  <RadioButton
                    inputId={option.value}
                    value={option.value}
                    onChange={(e) => setFormData({ ...formData, returnCondition: e.value })}
                    checked={formData.returnCondition === option.value}
                  />
                  <label htmlFor={option.value} className="ml-2">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Notes</label>
            <InputTextarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full"
              placeholder="Any additional notes about the return..."
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox
                checked={formData.sendConfirmation}
                onChange={(e) => setFormData({ ...formData, sendConfirmation: e.checked })}
                inputId="sendConfirmation"
              />
              <label htmlFor="sendConfirmation" className="ml-2 text-sm">
                Send collection confirmation to customer
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox
                checked={formData.generateDocumentation}
                onChange={(e) => setFormData({ ...formData, generateDocumentation: e.checked })}
                inputId="generateDocumentation"
              />
              <label htmlFor="generateDocumentation" className="ml-2 text-sm">
                Generate return documentation
              </label>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default TerminateRentalModal;