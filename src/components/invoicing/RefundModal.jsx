"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import "primeicons/primeicons.css";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { useSelector } from "react-redux";

export default function RefundModal({ visible, onHide, invoice }) {
  const [step, setStep] = useState(1);
  const [creditType, setCreditType] = useState("Full Invoice Percentage");
  const [percentage, setPercentage] = useState(invoice.orderDiscount);
  const [internalNotes, setInternalNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [overrideTotal, setOverrideTotal] = useState(0);
  const [flatRefundAmount, setFlatRefundAmount] = useState(0);
  const [refundCategory, setRefundCategory] = useState("");
  const [forceUpdate, setForceUpdate] = useState(false);
const [updatedProducts, setUpdatedProducts] = useState(invoice.product || []);
  const { token, user } = useSelector((state) => state?.authReducer);


  if (!invoice) return null;
useEffect(() => {
  if (invoice?.product) {
    setUpdatedProducts(invoice.product);
  }
}, [invoice]);
  const goodsValue = Number(invoice.goods) || 0;
  const originalTotal = Number(invoice.total) || 0;
  const taxRate = goodsValue > 0 ? (Number(invoice.tax) / goodsValue) * 100 : 0;

  const discountValue = (goodsValue * (percentage / 100));
  const newPreTaxSubtotal = goodsValue - discountValue;
  const newTax = (newPreTaxSubtotal * taxRate) / 100;
  const newTotal = newPreTaxSubtotal + newTax;
const [applyTo, setApplyTo] = useState("");
  const goNext = () => setStep((prev) => Math.min(prev + 1, 7));
  const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

 const updateAssetCredit = (pIndex, aIndex, changes) => {
  const newProducts = [...updatedProducts];
  newProducts[pIndex] = {
    ...newProducts[pIndex],
    assetNumbers: newProducts[pIndex].assetNumbers.map((a, idx) =>
      idx === aIndex ? { ...a, ...changes } : a
    ),
  };
  setUpdatedProducts(newProducts);
};


  // Add this to the RefundModal component near the top, inside the component body

const buildRefundPayload = () => {
  const payload = {
    invoiceId: invoice._id,
    orderNumber: invoice.orderNumber,
    creditType,
    customerId: invoice.customer_id,
    notes: {
      internal: internalNotes,
      customer: customerNotes,
    },
    applyTo: applyTo, // e.g. 'Refund Now', 'Apply to Future Invoice', etc.
    creditSummary: {
      originalTotal,
      taxRate,
    },
    breakdown: {},
  };

  if (creditType === "Full Invoice Percentage") {
    payload.breakdown = {
      percentage,
      discountValue,
      newPreTaxSubtotal,
      newTax,
      newTotal,
    };
    payload.creditSummary.creditedAmount = discountValue + newTax;
    payload.creditSummary.newTotal = newTotal;
  }

  if (creditType === "Manual Invoice Override") {
    payload.breakdown = {
      overrideTotal,
    };
    payload.creditSummary.creditedAmount = originalTotal - overrideTotal;
    payload.creditSummary.newTotal = overrideTotal;
  }

  if (creditType === "Flat Value Refund") {
    payload.breakdown = {
      flatRefundAmount,
      refundCategory,
    };
    payload.creditSummary.creditedAmount = flatRefundAmount;
  }

  if (creditType === "Line-Item Credit") {
    const items = updatedProducts?.flatMap((product) =>
      product.assetNumbers?.map((asset) => {
        const originalTotal = Number(asset.total);
        const creditAmount = Number(asset.creditAmount || 0);
        const newTotal =
          asset.creditType === "percent"
            ? originalTotal - (originalTotal * creditAmount) / 100
            : originalTotal - creditAmount;

        return {
          productId: product.productId,
          productName: product.productName,
          assetNumber: asset.assetNumber,
          creditType: asset.creditType,
          creditAmount,
          originalTotal,
          newTotal,
        };
      }) || []
    );

    payload.breakdown = items;
    payload.creditSummary.creditedAmount = items.reduce(
      (sum, a) => sum + (a.originalTotal - a.newTotal),
      0
    );
  }

  return payload;
};

// Call this function when submitting refund, e.g. in Step 6:
const handleRefundSubmit = async (applyToAction) => {
  const payload = buildRefundPayload(applyToAction);
console.log(payload)
  try {
    const response = await axios.post(`${BaseURL}/invoice/refund`, payload,   {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        },);
    console.log("Refund submitted", response.data);
    goNext(); // go to confirmation
  } catch (err) {
    console.error("Refund failed", err);
  }
};

console.log({updatedProducts})

// 1. Calculate credit from all items
const affectedLineItems = updatedProducts?.flatMap((p) =>
  p.assetNumbers
    ?.filter((a) => a.creditAmount > 0)
    .map((a) => {
      const total = Number(a.total || 0);
      const creditAmount = Number(a.creditAmount || 0);
      const discounted =
        a.creditType === "percent"
          ? (total * creditAmount) / 100
          : creditAmount;
      return {
        productName: p.productName,
        assetNumber: a.assetNumber,
        creditType: a.creditType,
        creditAmount,
        affectedAmount: discounted,
      };
    }) || []
);

// 2. Total credited value
const totalLineCredit = affectedLineItems.reduce(
  (sum, item) => sum + item.affectedAmount,
  0
);

// 3. New subtotal and tax
const lineItemNewSubtotal = goodsValue - totalLineCredit;
const adjustedTaxForLineItem = (lineItemNewSubtotal * taxRate) / 100;

  const footer = (
    <div className="flex justify-between">
      {step > 1 && step < 8 && (
        <Button label="Back" className="p-button-secondary" onClick={goBack} />
      )}
      {step < 7 && (
        <Button label="Continue" className="bg-blue-500 border-none" onClick={goNext} />
      )}
      {step === 7 && (
        <Button label="Close" className="bg-green-500 border-none" onClick={handleRefundSubmit} />
      )}
    </div>
  );



  const stepIcons = [
    "pi pi-tags",
    "pi pi-sliders-h",
    "pi pi-comments",
    "pi pi-eye",
    "pi pi-spin pi-cog",
    "pi pi-credit-card",
    "pi pi-check-circle"
  ];

  return (
    <Dialog
      visible={visible}
      modal
      style={{ width: "90vw", maxWidth: "1100px" }}
      onHide={onHide}
           header={()=>(
        <>
        
      <div className="">
  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
    
    Issue Credit / Refund
  </h2>
  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
    <div>
      <span className="font-medium text-gray-800">Invoice Number:</span>{" "}
      <span className="text-blue-600 font-bold text-lg">#{invoice.invocie}</span>
    </div>
    <div>
      <span className="font-medium text-gray-800">Customer:</span>{" "}
      <span className="font-bold text-lg">{invoice.customerName}</span>
    </div>
    <div>
      <span className="font-medium text-gray-800 ">Original Total:</span>{" "}
      <span className="text-green-600 font-bold text-lg">
        ${Number(invoice.total).toLocaleString()}
      </span>
    </div>
  </div>
</div>
      </>
     )}
      footer={footer}
    >
    

      {/* STEPPER */}
      <div className="flex items-center justify-between mb-6 border rounded-xl py-4">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <div key={n} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md ${
                step >= n ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              <i className={`${stepIcons[n - 1]} text-lg`}></i>
            </div>
            <span className="text-xs mt-2 text-center font-medium">
              {
                [
                  "Credit Type",
                  "Credit Details",
                  "Add Notes",
                  "Review",
                  "Process",
                  "Apply Credit",
                  "Confirmation",
                ][n - 1]
              }
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Credit Type */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Full Invoice Percentage", icon: "pi pi-percentage", desc: "Apply a percentage discount to the entire invoice amount" },
            { label: "Line-Item Credit", icon: "pi pi-list", desc: "Apply credits to specific assets" },
            { label: "Manual Invoice Override", icon: "pi pi-pencil", desc: "Manually set a new total" },
            { label: "Flat Value Refund", icon: "pi pi-dollar", desc: "Issue a non-itemized refund" },
          ].map((opt) => (
            <div
              key={opt.label}
              className={`p-4 border rounded cursor-pointer hover:shadow-md transition ${
                creditType === opt.label ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onClick={() => setCreditType(opt.label)}
            >
              <h3 className="font-semibold flex items-center gap-2">
                <i className={`${opt.icon} text-blue-500`}></i> {opt.label}
              </h3>
              <p className="text-sm text-gray-600">{opt.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* STEP 2: Credit Details */}
     {step === 2 && creditType === "Full Invoice Percentage" && (
  <div>
    <h2 className="font-bold mb-3 flex items-center  text-xl text-black gap-2">
     Enter Credit Details

    </h2>
    <h3 className="font-semibold mb-3 flex items-center text-black gap-2">
     Select Percentage Discount
    </h3>

    {/* Preset Buttons */}
    <div className="flex gap-2 mb-4 flex-wrap">
      {[10, 20, 25, 50].map((val) => (
        <Button
          key={val}
          label={`${val}%`}
          className={`${
            percentage === val ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          } border-none`}
          onClick={() => setPercentage(val)}
        />
      ))}

      {/* Custom Input */}
      <div className="flex items-center gap-1">
        <input
          type="number"
              max="100"
          placeholder="Custom"
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="border rounded p-2 w-20 text-center"
        />
        <span className="text-gray-600 text-sm">%</span>
      </div>
    </div>

    {/* Summary */}
    <div className="border flex flex-col gap-3 p-3 rounded bg-gray-50">
      <div className="flex justify-between">
        <span>Original Pre-Tax Subtotal:</span>
        <span>${goodsValue.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Discount ({percentage}%):</span>
        <span className="text-red-500">-${discountValue.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>New Pre-Tax Subtotal:</span>
        <span>${newPreTaxSubtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax ({taxRate.toFixed(2)}%):</span>
        <span>${newTax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold mt-2 border-t pt-2">
        <span>New Total:</span>
        <span className="text-green-600">${newTotal.toFixed(2)}</span>
      </div>
    </div>
  </div>
)}


      {step === 2 && creditType === "Line-Item Credit" && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <i className="pi pi-list text-blue-500"></i> Apply Credits to Assets
          </h3>
          <table className="w-full border border-gray-300 text-sm rounded overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Product Name</th>
                <th className="p-2 text-left">Asset Number</th>
                <th className="p-2 text-center">Charged Days</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2 text-right">Tax</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2">Credit Type</th>
                <th className="p-2">Credit Amount</th>
                <th className="p-2 text-right">New Total</th>
              </tr>
            </thead>
            <tbody>
              {updatedProducts?.flatMap((product, pIndex) =>
                product.assetNumbers?.map((asset, aIndex) => {
                  const total = Number(asset.total);
                  return (
                    <tr key={`${pIndex}-${aIndex}`} className="border-t hover:bg-gray-50">
                      <td className="p-2">{product.productName}</td>
                      <td className="p-2">{asset.assetNumber}</td>
                      <td className="p-2 text-center">{asset.chargedDays}</td>
                      <td className="p-2 text-right">${Number(asset.amount).toFixed(2)}</td>
                      <td className="p-2 text-right">${Number(asset.tax).toFixed(2)}</td>
                      <td className="p-2 text-right">${total.toFixed(2)}</td>
                      <td className="p-2">
<select
  className="border rounded p-1 w-full"
  value={asset.creditType || ""}
  onChange={(e) =>
    updateAssetCredit(pIndex, aIndex, {
      creditType: e.target.value,
      creditAmount: 0, // reset amount when switching type
    })
  }
>
                          <option value="">None</option>
                          <option value="percent">Percent</option>
                          <option value="flat">Flat</option>
                        </select>
                      </td>
                      <td className="p-2">
<input
  type="number"
  min="0"
  className="border rounded p-1 w-full text-right"
  value={asset.creditAmount || ""}
  disabled={!asset.creditType}
  onChange={(e) =>
    updateAssetCredit(pIndex, aIndex, {
      creditAmount: Number(e.target.value),
    })
  }
/>
                      </td>
                      <td className="p-2 text-right">
  ${(() => {
    const total = Number(asset.total || 0);
    const credit = Number(asset.creditAmount || 0);
    if (asset.creditType === "percent") {
      return (total - (total * credit) / 100).toFixed(2);
    }
    if (asset.creditType === "flat") {
      return (total - credit).toFixed(2);
    }
    return total.toFixed(2);
  })()}
</td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {step === 2 && creditType === "Manual Invoice Override" && (
        <div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 flex gap-2">
            <i className="pi pi-exclamation-triangle text-yellow-500 text-xl"></i>
            <div>
              <p className="font-semibold text-yellow-700">Warning:</p>
              <p className="text-sm text-yellow-700">Manual override will replace the entire invoice total. This should be used with caution.</p>
            </div>
          </div>
          <label className="block font-semibold mb-1">New Invoice Total *</label>
          <input type="number" step="0.01" min="0" className="border rounded p-2 w-full mb-4" value={overrideTotal} onChange={(e) => setOverrideTotal(Number(e.target.value))} />
          <div className="text-sm leading-6">
            <p><strong>Original Total:</strong> ${originalTotal.toLocaleString()}</p>
            <p><strong>New Total:</strong> ${overrideTotal > 0 ? overrideTotal.toFixed(2) : "0.00"}</p>
            <p className="font-bold text-red-500">Credit Amount: ${(originalTotal - (overrideTotal > 0 ? overrideTotal : 0)).toFixed(2)}</p>
          </div>
        </div>
      )}

      {step === 2 && creditType === "Flat Value Refund" && (
        <div>
          <label className="block font-semibold mb-1">Refund Amount *</label>
          <input type="number" step="0.01" min="0" className="border rounded p-2 w-full mb-4" value={flatRefundAmount} onChange={(e) => setFlatRefundAmount(Number(e.target.value))} />
          <label className="block font-semibold mb-1">Category *</label>
          <select className="border rounded p-2 w-full mb-4" value={refundCategory} onChange={(e) => setRefundCategory(e.target.value)}>
            <option value="">Select a category...</option>
            <option value="Equipment Damage">Equipment Damage</option>
            <option value="Service Issue">Service Issue</option>
            <option value="Billing Error">Billing Error</option>
            <option value="Customer Satisfaction">Customer Satisfaction</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div>
          <label className="block font-semibold mb-1">Internal Notes *</label>
          <InputTextarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3} className="w-full mb-4" />
          <label className="block font-semibold mb-1">Customer Notes (Optional)</label>
          <InputTextarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} rows={2} className="w-full" />
        </div>
      )}
{step === 4 && (
  <div className="bg-white rounded-lg shadow-sm border p-5 space-y-3">
    <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
      <i className="pi pi-eye text-blue-500"></i> Review Credit Summary
    </h3>

    {/* Original subtotal */}
    <div className="flex justify-between text-sm">
      <span>Original Pre-Tax Subtotal:</span>
      <span>${goodsValue.toLocaleString()}</span>
    </div>

    {/* Credit Value */}
    <div className="flex justify-between text-sm">
      <span>Credit Value:</span>
      <span className="text-red-500">
        -$
        {creditType === "Line-Item Credit"
          ? updatedProducts
              ?.flatMap((p) => p.assetNumbers || [])
              .reduce((sum, a) => {
                const creditAmount = Number(a.creditAmount || 0);
                const total = Number(a.total || 0);
                return sum +
                  (a.creditType === "percent"
                    ? (total * creditAmount) / 100
                    : creditAmount);
              }, 0)
              .toFixed(2)
          : creditType === "Full Invoice Percentage"
          ? discountValue.toFixed(2)
          : creditType === "Manual Invoice Override"
          ? (originalTotal - overrideTotal).toFixed(2)
          : creditType === "Flat Value Refund"
          ? flatRefundAmount.toFixed(2)
          : "0.00"}
      </span>
    </div>

    {/* New Pre-Tax Subtotal */}
    <div className="flex justify-between text-sm">
      <span>New Pre-Tax Subtotal:</span>
      <span>
        $
        {creditType === "Line-Item Credit"
          ? (
              goodsValue -
              updatedProducts
                ?.flatMap((p) => p.assetNumbers || [])
                .reduce((sum, a) => {
                  const creditAmount = Number(a.creditAmount || 0);
                  const total = Number(a.total || 0);
                  return sum +
                    (a.creditType === "percent"
                      ? (total * creditAmount) / 100
                      : creditAmount);
                }, 0)
            ).toFixed(2)
          : creditType === "Full Invoice Percentage"
          ? newPreTaxSubtotal.toFixed(2)
          : creditType === "Manual Invoice Override"
          ? overrideTotal.toFixed(2)
          : goodsValue.toFixed(2)}
      </span>
    </div>

    {/* Adjusted Tax */}
    {(creditType === "Full Invoice Percentage" || creditType === "Line-Item Credit") && (
      <div className="flex justify-between text-sm">
        <span>Adjusted Tax:</span>
        <span>
          $
          {(creditType === "Full Invoice Percentage"
            ? newTax
            : ((goodsValue -
                updatedProducts
                  ?.flatMap((p) => p.assetNumbers || [])
                  .reduce((sum, a) => {
                    const creditAmount = Number(a.creditAmount || 0);
                    const total = Number(a.total || 0);
                    return sum +
                      (a.creditType === "percent"
                        ? (total * creditAmount) / 100
                        : creditAmount);
                  }, 0)) *
                taxRate) /
              100
          ).toFixed(2)}
        </span>
      </div>
    )}

    {/* Total refunded */}
    <div className="flex justify-between font-bold border-t pt-3">
      <span>Total Refunded or Credited:</span>
      <span className="text-green-600">
        $
        {creditType === "Line-Item Credit"
          ? updatedProducts
              ?.flatMap((p) => p.assetNumbers || [])
              .reduce((sum, a) => {
                const creditAmount = Number(a.creditAmount || 0);
                const total = Number(a.total || 0);
                return sum +
                  (a.creditType === "percent"
                    ? (total * creditAmount) / 100
                    : creditAmount);
              }, 0)
              .toFixed(2)
          : creditType === "Full Invoice Percentage"
          ? (discountValue + newTax).toFixed(2)
          : creditType === "Manual Invoice Override"
          ? (originalTotal - overrideTotal).toFixed(2)
          : creditType === "Flat Value Refund"
          ? flatRefundAmount.toFixed(2)
          : "0.00"}
      </span>
    </div>

    {/* Show assets credited with name and amount */}
    {creditType === "Line-Item Credit" && (
      <div className="bg-gray-50 border rounded p-2 text-xs text-gray-700 space-y-1">
        <div className="font-medium text-gray-600">Items Affected:</div>
        {updatedProducts?.flatMap((p) =>
          p.assetNumbers
            ?.filter((a) => Number(a.creditAmount) > 0)
            .map((a, i) => {
                console.log(a,"isass")
              const credit =
                a.creditType === "percent"
                  ? ((Number(a.total) || 0) * Number(a.creditAmount)) / 100
                  : Number(a.creditAmount);
              return (
                <div key={`${p.productId}-${i}`} className="flex justify-between">
                  <span>{p.productName}</span>
                  <span>{a.assetNumber}</span>
                  <span className="text-green-600">${credit.toFixed(2)}</span>
                </div>
              );
            })
        )}
      </div>
    )}
  </div>
)}


{step === 5 && (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <i className="pi pi-spin pi-cog text-blue-500 text-5xl mb-4"></i>
    <h3 className="text-lg font-semibold text-gray-700">
      Processing your credit request...
    </h3>
    <p className="text-sm text-gray-500">
      Please wait while we apply the credit and update your records.
    </p>
  </div>
)}
{step === 6 && (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {[
      {
        label: "Refund Now",
        desc: "Process immediate refund to customer's payment method",
        icon: "pi pi-wallet",
      },
      {
        label: "Apply to Future Invoice",
        desc: "Keep as credit balance for future invoices",
        icon: "pi pi-calendar",
      },    
      {
        label: "Export for Accounting Only",
        desc: "Record credit without processing payment",
        icon: "pi pi-chart-bar",
      },
    ].map((opt) => (
      <div
        key={opt.label}
        className={`border rounded-lg p-4 hover:shadow-md cursor-pointer transition ${
          applyTo === opt.label ? "border-blue-500 bg-blue-50" : ""
        }`}
        onClick={() => setApplyTo(opt.label)}
      >
        <h4 className="font-semibold flex items-center gap-2 text-gray-700">
          <i className={`${opt.icon} text-blue-500`}></i> {opt.label}
        </h4>
        <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
      </div>
    ))}
  </div>
)}

{step === 7 && (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <i className="pi pi-check-circle text-green-500 text-5xl mb-4"></i>
    <h3 className="text-lg font-bold text-gray-700">Credit Successfully Applied</h3>
    <p className="text-sm text-gray-500 mb-6">
      The credit has been processed and applied to invoice{" "}
      <strong>{invoice.invocie}</strong>.
    </p>

    <div className="bg-gray-50 border rounded-lg p-4 w-full sm:w-2/3 text-left text-sm">
      <p>
        <strong>Credit Type:</strong> {creditType}
      </p>
     <p>
  <strong>Credit Amount:</strong> $
  {creditType === "Full Invoice Percentage"
    ? (discountValue + newTax).toFixed(2)
    : creditType === "Manual Invoice Override"
    ? (originalTotal - overrideTotal).toFixed(2)
    : creditType === "Flat Value Refund"
    ? flatRefundAmount.toFixed(2)
    : creditType === "Line-Item Credit"
    ? updatedProducts
        ?.flatMap((p) => p.assetNumbers || [])
        .reduce((sum, a) => {
          const creditAmount = Number(a.creditAmount || 0);
          const total = Number(a.total || 0);
          return sum +
            (a.creditType === "percent"
              ? (total * creditAmount) / 100
              : creditAmount);
        }, 0)
        .toFixed(2)
    : "0.00"}
</p>

      <p>
        <strong>Action Taken:</strong> Refund Processed
      </p>
      <p>
        <strong>Reference Number:</strong> CRD-{invoice.orderNumber}-001
      </p>
    </div>
  </div>
)}

    </Dialog>
  );
}
