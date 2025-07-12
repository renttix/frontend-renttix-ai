"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import axios from "axios";
import { Button } from "primereact/button";
import moment from "moment";
import { BaseURL } from "../../../utils/baseUrl";
import CanceButton from "../Buttons/CanceButton";

const EditInvoiceModal = ({ visible, setVisible, invoice, batchId, invoiceId, token, onSuccess }) => {
  const [formData, setFormData] = useState({
    tax: "",
    goods: "",
    total: "",
    suspensionAmount: "",
    billingPlaceName: "",
    deliveryPlaceName: "",
    deliveryDate: "",
    invoiceUptoDate: "",
    deliveryAddress: "",
    customerAddress: "",
    customerAddress2: "",
    customerCity: "",
    customerCountry: "",
  });

  useEffect(() => {
    if (visible && invoice) {
      setFormData({
        tax: invoice.tax || "",
        goods: invoice.goods || "",
        total: invoice.total || "",
        suspensionAmount: invoice.suspensionAmount || "",
        billingPlaceName: invoice.billingPlaceName || "",
        deliveryPlaceName: invoice.deliveryPlaceName || "",
        deliveryDate: invoice.deliveryDate ? new Date(invoice.deliveryDate) : null,
        invoiceUptoDate: invoice.invoiceUptoDate ? new Date(invoice.invoiceUptoDate) : null,
        deliveryAddress: invoice.deliveryAddress || "",
        customerAddress: invoice.customerAddress || "",
        customerAddress2: invoice.customerAddress2 || "",
        customerCity: invoice.customerCity || "",
        customerCountry: invoice.customerCountry || "",
      });
    }
  }, [visible, invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `${BaseURL}/invoice/${batchId}/invoices/${invoiceId}`,
        {
          ...formData,
          deliveryDate: formData.deliveryDate ? moment(formData.deliveryDate).toISOString() : null,
          invoiceUptoDate: formData.invoiceUptoDate ? moment(formData.invoiceUptoDate).toISOString() : null,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      onSuccess();
      setVisible(false);
    } catch (err) {
      console.error("Invoice update failed:", err);
    }
  };

  return (
    <Dialog
      header="Edit Invoice"
      visible={visible}
      style={{ width: "70vw" }}
      onHide={() => setVisible(false)}
      className="p-fluid"
    >
      {/* Header Info */}
      <div className="mb-6 border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Invoice Information</h3>
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div><strong>Invoice #:</strong> {invoice?.DocNumber || invoice?.invocie}</div>
          <div><strong>Order ID:</strong> {invoice?.orderId}</div>
          <div><strong>Invoice Date:</strong> {invoice?.invoiceDate ? moment(invoice.invoiceDate).format("YYYY-MM-DD") : "N/A"}</div>
          <div><strong>Customer:</strong> {invoice?.customerName}</div>
          <div><strong>Email:</strong> {invoice?.customerEmail}</div>
        </div>
      </div>

      {/* Section: Customer & Delivery */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Customer & Delivery</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Delivery Address</label>
            <InputText name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Customer Address</label>
            <InputText name="customerAddress" value={formData.customerAddress} onChange={handleChange} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Customer Address 2</label>
            <InputText name="customerAddress2" value={formData.customerAddress2} onChange={handleChange} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">City</label>
            <InputText name="customerCity" value={formData.customerCity} onChange={handleChange} />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-sm font-medium mb-1">Country</label>
            <InputText name="customerCountry" value={formData.customerCountry} onChange={handleChange} />
          </div>
          
        </div>
      </div>

      {/* Section: Invoice Fields */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Invoice Fields</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Tax</label>
            <InputText name="tax" value={formData.tax} onChange={handleChange} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Goods (Excl. Tax)</label>
            <InputText name="goods" value={formData.goods} onChange={handleChange} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Total (Incl. Tax)</label>
            <InputText name="total" value={formData.total} onChange={handleChange} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Suspension Amount</label>
            <InputText name="suspensionAmount" value={formData.suspensionAmount} onChange={handleChange} />
          </div>
      
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Delivery Date</label>
            <Calendar value={formData.deliveryDate} onChange={(e) => handleDateChange("deliveryDate", e.value)} showIcon dateFormat="yy-mm-dd" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Invoice Upto Date</label>
            <Calendar value={formData.invoiceUptoDate} onChange={(e) => handleDateChange("invoiceUptoDate", e.value)} showIcon dateFormat="yy-mm-dd" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2">
<div className="">
    <CanceButton onClick={() => setVisible(false)}/>
    </div><div className="">
        <Button size="small" label="Update Invoice" icon="pi pi-check" onClick={handleSubmit} />
    </div>      </div>
    </Dialog>
  );
};

export default EditInvoiceModal;
