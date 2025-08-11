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
  const { token, user } = useSelector((state) => state?.authReducer);
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
          },
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

  if (!invoice)
    return <div className="py-10 text-center">Loading invoice...</div>;

  return (
    <>
      <div
        ref={invoiceRef}
        className="font-sans mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 shadow-lg"
      >
        <div className="mb-8 flex items-center justify-between">
          <img
            src={`${imageBaseURL}${user.brandLogo}`}
            alt="Logo"
            className="h-12"
          />
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">RETURN NOTE</p>
            <h1 className="text-2xl font-bold text-indigo-600">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-sm text-gray-400">
              {format(new Date(invoice.invoiceDate), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6 text-sm">
          <div>
            <h2 className="mb-1 font-semibold text-gray-700">Bill To</h2>
            <p>{invoice.customerDetails.name}</p>
            <p>{invoice.deliveryDetails.deliveryAddress1}</p>
            <p>{invoice.deliveryDetails.deliveryAddress2}</p>
            <p>{invoice.customerDetails.email}</p>
          </div>
          <div>
            <h2 className="mb-1 font-semibold text-gray-700">Order Info</h2>
            <p>
              Order #:{" "}
              <span className="font-medium">{invoice.orderId?.orderId}</span>
            </p>
            <p>
              Delivery:{" "}
              {format(
                new Date(invoice.deliveryDetails.deliveryDate),
                "MMMM dd, yyyy",
              )}
            </p>
            <p>
              Terms: <span className="font-medium">30 days</span>
            </p>
          </div>
        </div>

        <table className="mb-6 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700">
              <th className="rounded-tl-lg border border-gray-200 p-3 text-left">
                Description
              </th>
              <th className="border border-gray-200 p-3 text-left">Qty</th>
              <th className="border border-gray-200 p-3 text-left">Type</th>
              <th className="border border-gray-200 p-3 text-left">
                suspendedDays
              </th>
              <th className="border border-gray-200 p-3 text-left">
                chargedDays
              </th>
              <th className="rounded-tr-lg border border-gray-200 p-3 text-left">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.invoiceItems.map((item, i) => (
              <tr key={i} className="transition hover:bg-gray-50">
                <td className="border border-gray-200 p-3">
                  {item.description}
                </td>
                <td className="border border-gray-200 p-3">{item.qty}</td>
                <td className="border border-gray-200 p-3">{item.type}</td>
                <td className="border border-gray-200 p-3">
                  {item.suspendedDays || 0}
                </td>
                <td className="border border-gray-200 p-3">
                  {item.chargedDays}
                </td>
                <td className="border border-gray-200 p-3">
                  {item.amount.toLocaleString("en-PK", {
                    style: "currency",
                    currency: invoice.currency || "PKR",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto w-full rounded-lg border bg-gray-50 p-5 text-right text-sm shadow-sm sm:w-1/2">
          <div className="mb-1">
            Subtotal:{" "}
            <strong>
              {invoice.subtotal.toLocaleString("en-PK", {
                style: "currency",
                currency: "PKR",
              })}
            </strong>
          </div>
          <div className="mb-1">
            Tax:{" "}
            <strong>
              {invoice.tax.toLocaleString("en-PK", {
                style: "currency",
                currency: "PKR",
              })}
            </strong>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="mb-1 text-green">
              Discount Amount:{" "}
              <strong>
                {invoice.discountAmount.toLocaleString("en-PK", {
                  style: "currency",
                  currency: "PKR",
                })}
              </strong>
            </div>
          )}
          {invoice.suspensionDeduction > 0 && (
            <div className="mb-1 text-red">
              Suspension Amount:{" "}
              <strong>
                {invoice.suspensionDeduction.toLocaleString("en-PK", {
                  style: "currency",
                  currency: "PKR",
                })}
              </strong>
            </div>
          )}
          <div className="mt-2 text-lg font-bold text-indigo-600">
            Total:{" "}
            {invoice.total.toLocaleString("en-PK", {
              style: "currency",
              currency: "PKR",
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-4xl justify-between">
        <GoBackButton title={"Back"} />
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
