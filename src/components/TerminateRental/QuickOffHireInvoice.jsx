"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Button } from "primereact/button";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { BaseURL, imageBaseURL } from "../../../utils/baseUrl";
import html2pdf from "html2pdf.js";
import CanceButton from "../Buttons/CanceButton";
import GoBackButton from "../Buttons/GoBackButton";

const QuickOffHireInvoice = () => {
  const params = useParams();
  const { token,user } = useSelector((state) => state?.authReducer);
  const [invoice, setInvoice] = useState(null);
  const invoiceRef = useRef();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.post(
          `${BaseURL}/order/invoice-details`,
          { id: params.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.success) {
          setInvoice(res.data.invoice);
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
      }
    };

    fetchInvoice();
  }, [params.id, token]);

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0.5,
      filename: `${invoice.invoiceNumber || "invoice"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!invoice) return <div className="text-center py-10">Loading invoice...</div>;

  return (
    <>
      <div ref={invoiceRef} className="p-8 bg-white shadow-lg rounded-2xl max-w-4xl mx-auto border border-gray-200 font-sans">
        <div className="flex justify-between items-center mb-8">
          <img  src={`${imageBaseURL}${user.brandLogo}`} alt="Logo" className="h-12" />
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">RETURN NOTE</p>
            <h1 className="text-2xl font-bold text-indigo-600">{invoice.invoiceNumber}</h1>
            <p className="text-sm text-gray-400">
              {format(new Date(invoice.invoiceDate), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 text-sm gap-6 mb-8">
          <div>
            <h2 className="font-semibold text-gray-700 mb-1">Bill To</h2>
            <p>{invoice.customerDetails.name}</p>
            <p>{invoice.deliveryDetails.deliveryAddress1}</p>
            <p>{invoice.deliveryDetails.deliveryAddress2}</p>
            <p>{invoice.customerDetails.email}</p>
          </div>
          <div>
            <h2 className="font-semibold text-gray-700 mb-1">Order Info</h2>
            <p>Order #: <span className="font-medium">{invoice.orderId?.orderId}</span></p>
            <p>Delivery: {format(new Date(invoice.deliveryDetails.deliveryDate), "MMMM dd, yyyy")}</p>
            <p>Terms: <span className="font-medium">30 days</span></p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse mb-6">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700">
              <th className="p-3 border border-gray-200 text-left rounded-tl-lg">Description</th>
              <th className="p-3 border border-gray-200 text-left">Qty</th>
              <th className="p-3 border border-gray-200 text-left">Type</th>
              <th className="p-3 border border-gray-200 text-left rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.invoiceItems.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="p-3 border border-gray-200">{item.description}</td>
                <td className="p-3 border border-gray-200">{item.qty}</td>
                <td className="p-3 border border-gray-200">{item.type}</td>
                <td className="p-3 border border-gray-200">
                  {item.amount.toLocaleString("en-PK", {
                    style: "currency",
                    currency: invoice.currency || "PKR",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-gray-50 p-5 rounded-lg w-full sm:w-1/2 ml-auto text-right text-sm shadow-sm border">
          <div className="mb-1">Subtotal: <strong>{invoice.subtotal.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}</strong></div>
          <div className="mb-1">Tax: <strong>{invoice.tax.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}</strong></div>
          <div className="text-lg font-bold mt-2 text-indigo-600">
            Total: {invoice.total.toLocaleString("en-PK", { style: "currency", currency: "PKR" })}
          </div>
        </div>
      </div>

      <div className="flex justify-between max-w-4xl mx-auto mt-6">
        <GoBackButton title={'Back'} />
        <Button
          label="Download PDF"
          icon="pi pi-download"
          className="p-button-outlined"
          onClick={handleDownloadPDF}
        />
      </div>
    </>
  );
};

export default QuickOffHireInvoice;
