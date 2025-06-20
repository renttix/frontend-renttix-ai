"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Steps } from "primereact/steps";
import { AutoComplete } from "primereact/autocomplete";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { BaseURL, imageBaseURL } from "../../../utils/baseUrl";
import { useSelector } from "react-redux";
import { formatCurrency } from "../../../utils/helper";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { ToggleButton } from "primereact/togglebutton";
import html2pdf from "html2pdf.js";
import moment from "moment";
import useDebounce from "@/hooks/useDebounce";
import Link from "next/link";

export default function Quotation() {
  const steps = [
    { label: "Customer Detail" },
    { label: "Product & Dates" },
    { label: "Calculation" },
    { label: "Invoice" },
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Product & cart
  const [availableProducts, setAvailableProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [dateRange, setDateRange] = useState(null);
  const [deposit, setDeposit] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  // Totals
  const [totals, setTotals] = useState({ subTotal: 0, tax: 0, total: 0 });
  const [isAddingProducts, setIsAddingProducts] = useState(false);

  // Auth
  const { user, token } = useSelector((state) => state.authReducer);

  // Fetch products
  useEffect(() => {
    if (user?._id) {
      axios
        .get(`${BaseURL}/order/product/list?vendorId=${user._id}`, {
          headers: { authorization: `Bearer ${token}` },
        })
        .then((res) => setAvailableProducts(res.data.data || []))
        .catch(console.error);
    }
  }, [user, token]);

  // Autocomplete filter
  const searchProduct = (e) => {
    const q = (e.query || "").toLowerCase();
    setSuggestions(
      availableProducts.filter((p) =>
        p.companyProductName.toLowerCase().includes(q)
      )
    );
  };

  // Rental days calc
  const calculateRentalDays = (start, end, daysPerWeek) => {
    if (!start || !end || end <= start) return 0;
    let count = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (daysPerWeek === 7 || (day !== 0 && day !== 6)) count++;
    }
    return count;
  };

  const getEffectiveDays = (item, start, end) => {
    const raw = calculateRentalDays(
      start,
      end,
      item.rateDefinition.rentalDaysPerWeek
    );
    return raw < item.rateDefinition.minimumRentalPeriod
      ? item.rateDefinition.minimumRentalPeriod
      : raw;
  };

  // Add to cart
  const addToCart = () => {
    if (!selectedProduct || selectedQuantity < 1) return;
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.id === selectedProduct.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += selectedQuantity;
        return updated;
      }
      return [...prev, { ...selectedProduct, quantity: selectedQuantity }];
    });
    setSelectedProduct(null);
    setSelectedQuantity(1);
  };

  // Reset selection
  const resetSelection = () => {
    setSelectedProduct(null);
    setSelectedQuantity(1);
    setDateRange(null);
    setDeposit(0);
    setCartItems([])
  };

  // Recompute totals
  useEffect(() => {
    const [start, end] = dateRange || [];
    let sub = 0,
      taxTot = 0;
    cartItems.forEach((item) => {
      const d = getEffectiveDays(item, start, end);
      sub += item.rentPrice * item.quantity * d;
      taxTot +=
        item.rentPrice * item.quantity * d * (item.taxClass.taxRate / 100);
    });
    setTotals({ subTotal: sub, tax: taxTot, total: sub + taxTot });
  }, [cartItems, dateRange]);

  const netPayable = totals.total - deposit;

  // PDF export
  const downloadPdf = () => {
    const element = document.getElementById("invoice-template");
    html2pdf()
      .set({ margin: [0, 0, 0, 0], filename: `quotation.pdf`, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: "mm", format: "a4" } })
      .from(element)
      .save();
  };

   // on first render, pull in whatever the calculator saved
   useEffect(() => {
      const raw = localStorage.getItem('quotationData');
      if (raw) {
        const { cartItems: savedCart, dateRange: savedRange, deposit: savedDep } = JSON.parse(raw);
        setCartItems(savedCart);
        setDeposit(savedDep);
    
        // turn ISO-strings back into Date objects
        if (Array.isArray(savedRange)) {
          setDateRange(savedRange.map(d => new Date(d)));
        }
      }
   }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center justify-center gap-3">
          <GoPrevious route="/calculator" />
          <h2 className="text-xl font-bold mb-3">Quotation</h2>
        </div>
        {activeIndex==3 &&
        <div className="">
        <Button label="Download PDF" icon="pi pi-download" onClick={downloadPdf} />
        </div>}
      </div>

      {/* <Steps model={steps} activeIndex={activeIndex} readOnly={true} /> */}

      <div className="mt-6">
        {/* Step 1: Customer */}
        {activeIndex === 0 && (
          <div className="space-y-4 w-full md:w-[60%]">
            {[["Name", customerName, setCustomerName], ["Email", customerEmail, setCustomerEmail], ["Address", customerAddress, setCustomerAddress], ["Phone No.", customerPhone, setCustomerPhone]].map(([label, val, fn]) => (
              <div key={label}>
                <label className="block mb-1 font-semibold">{label}</label>
                <InputText value={val} onChange={(e) => fn(e.target.value)} className="w-full" />
              </div>
            ))}
            <div className="flex justify-end">
              <Button label="Next" onClick={() => setActiveIndex(1)} disabled={!(customerName && customerEmail && customerAddress && customerPhone)} />
            </div>
          </div>
        )}

        {/* Step 2: Products */}
        {activeIndex === 1 && (
        <div className="space-y-6 w-full md:w-[60%]">
          <div className="flex items-center mb-4">
            <label className="mr-2 font-semibold">Want to Add products in Quotation?</label>
            <ToggleButton
              onLabel="No"
              offLabel="Yes"
              checked={isAddingProducts}
              onChange={(e) => setIsAddingProducts(e.value)}
            />
          </div>

          {isAddingProducts && (
            <>
              <div>
                <label className="block mb-1 font-semibold">Search Product</label>
                <AutoComplete
                  value={selectedProduct}
                  suggestions={suggestions}
                  completeMethod={searchProduct}
                  field="companyProductName"
                  dropdown
                  onChange={(e) => setSelectedProduct(e.value)}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">Quantity</label>
                  <InputNumber
                    value={selectedQuantity}
                    onValueChange={(e) => setSelectedQuantity(e.value)}
                    showButtons
                    min={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Dates</label>
                  <Calendar
                    value={dateRange}
                    onChange={(e) => setDateRange(e.value)}
                    selectionMode="range"
                    readOnlyInput
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold">Deposit</label>
                <InputNumber
                  value={deposit}
                  onValueChange={(e) => setDeposit(e.value)}
                  showButtons
                  min={0}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="space-x-2">
                  <Button
                    label="Add to Cart"
                    icon="pi pi-plus"
                    onClick={addToCart}
                    disabled={!selectedProduct || !dateRange}
                  />
                  <Button
                    label="Reset"
                    icon="pi pi-refresh"
                    className="p-button-outlined"
                    onClick={resetSelection}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between items-center mt-4">
            <Button label="Back" onClick={() => setActiveIndex(0)} />
            <Button
              label="Next"
              onClick={() => setActiveIndex(2)}
              disabled={isAddingProducts && cartItems.length === 0}
            />
          </div>
        </div>
      )}

        {/* Step 3: Calculation */}
        {activeIndex === 2 && (
          <div className="w-full md:w-[60%]">
            <DataTable value={cartItems || []} emptyMessage="No items in cart" className="mb-4">
              <Column field="companyProductName" header="Product" />
              <Column field="quantity" header="Qty" />
              <Column header="Days" body={(row) => getEffectiveDays(row, dateRange[0], dateRange[1])} />
              <Column header="Price" body={(row) => formatCurrency(row.rentPrice, user.currencyKey)} />
              <Column header="Tax" body={(row) => `${row.taxClass.taxRate}%`} />
              <Column header="Total" body={(row) => {
                const days = getEffectiveDays(row, dateRange[0], dateRange[1]);
                return formatCurrency(row.rentPrice * row.quantity * days * (1 + row.taxClass.taxRate/100), user.currencyKey);
              }} />
            </DataTable>

            <div className="bg-white dark:bg-dark-2 p-4 rounded shadow">
              <div className="flex justify-between mb-2"><span>Subtotal:</span><span>{formatCurrency(totals.subTotal, user.currencyKey)}</span></div>
              <div className="flex justify-between mb-2"><span>Deposit:</span><span>{formatCurrency(deposit, user.currencyKey)}</span></div>
              <div className="flex justify-between mb-2"><span>Tax:</span><span>{formatCurrency(totals.tax, user.currencyKey)}</span></div>
              <div className="flex justify-between font-bold"><span>Total Due:</span><span>{formatCurrency(netPayable, user.currencyKey)}</span></div>
            </div>

            <div className="flex justify-between mt-4">
              <Button label="Back" onClick={() => setActiveIndex(1)} />
              <Button label="Next" onClick={() => setActiveIndex(3)} disabled={cartItems.length===0} />
            </div>
          </div>
        )}

        {/* Step 4: Invoice */}
        {activeIndex === 3 && (
          <div className="flex justify-center items-center flex-col">
             <div
  id="invoice-template"

>
  {/* 1) Pull in Tailwind or your CSS */}
  <style dangerouslySetInnerHTML={{__html:`
  /* page box */
  #invoice-template .invoice-container {
    width: 210mm; 
    min-height: 297mm;
    padding: 15mm; 
    box-sizing: border-box;
    background: #fff;
    font-family: 'Roboto', sans-serif;
    color: #333;
  }

  /* header */
  #invoice-template .invoice-header table {
    width: 100%;
    border-collapse: collapse;
  }
  #invoice-template .invoice-header td {
    vertical-align: middle;
    padding: 5px 0;
    font-size: 12px;
  }

  /* content table */
  #invoice-template .invoice-content table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 11px;
  }
  #invoice-template .invoice-content thead th {
    background: #f3f4f6;
    padding: 8px;
    border: 1px solid #e5e7eb;
    text-align: left;
  }
  #invoice-template .invoice-content tbody td {
    padding: 8px;
    border: 1px solid #e5e7eb;
  }

  /* right-align numeric columns */
  #invoice-template .text-right {
    text-align: right;
  }

  /* footer */
  #invoice-template .invoice-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    font-size: 11px;
  }
`}}/>


{/* hidden off-screen A4 invoice */}

  {/* inject Tailwind & font so html2canvas knows your styles */}
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
    rel="stylesheet"
  />

  <div className="invoice-container font-['Roboto'] text-gray-800">
    {/* HEADER */}
    <div className="flex justify-between items-center mb-8">
    <img
  src={`${imageBaseURL}${user?.brandLogo}`}
  alt="Logo"
  className="h-12"
  crossOrigin="anonymous"    // ← tell the browser to load it CORS-safe
/>
      <div className="text-sm text-right space-y-1">
        <div><strong>Invoice #:</strong>{Date.now()}</div>
        <div><strong>Date:</strong> {moment().format('DD/MM/YYYY')}</div>
        <div>
          <strong>Due:</strong>{' '}
          {dateRange?.[1] ? moment(dateRange[1]).format('DD/MM/YYYY') : ''}
        </div>
      </div>
    </div>

    {/* BILL TO */}
{/* BILL TO */}
<div className="mb-8 text-sm">
  <strong>Bill To:</strong>
  <div>{customerName}</div>
  <div>{customerAddress}</div>
  <div>{customerEmail}</div>
  <div>{customerPhone}</div>
</div>

<br />
<br />
    {/* ITEMS TABLE */}
    <div className="overflow-x-auto mb-8">
      <table className="w-full border-collapse text-sm mt-3">
        <colgroup>
          <col style={{ width: '40%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Description</th>
            <th className="border px-2 py-1 text-left">Qty</th>
            <th className="border px-2 py-1 text-left">Min Period</th>
            <th className="border px-2 py-1 text-left">Days</th>
            <th className="border px-2 py-1 text-left">Tax</th>
            <th className="border px-2 py-1 text-left">Price</th>
            <th className="border px-2 py-1 text-left">Total</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((row, i) => {
            const days = getEffectiveDays(row, dateRange?.[0], dateRange?.[1]);
            const lineTotal =
              row.rentPrice * row.quantity * days * (1 + row.taxClass.taxRate / 100);
            return (
              <tr key={i}>
                <td className="border px-2 py-1">{row.companyProductName}</td>
                <td className="border px-2 py-1 text-right">{row.quantity}</td>
                <td className="border px-2 py-1 text-right">{row.rateDefinition.minimumRentalPeriod}</td>
                <td className="border px-2 py-1 text-right">{days}</td>
                <td className="border px-2 py-1 text-right">{`${row.taxClass.taxRate}%`}</td>
                <td className="border px-2 py-1 text-right">{row.rentPrice}</td>
                <td className="border px-2 py-1 text-right">
                  {formatCurrency(lineTotal, user?.currencyKey)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
<br />
<br />
    {/* TOTALS */}
    <div className="flex justify-end text-sm mb-4 mt-4">
      <div className="w-1/3 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(totals.subTotal, user?.currencyKey)}</span>
        </div>
        <div className="flex justify-between">
          <span>Deposit:</span>
          <span>{formatCurrency(deposit, user?.currencyKey)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>{formatCurrency(totals.tax, user?.currencyKey)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total Due:</span>
          <span>{formatCurrency(netPayable, user?.currencyKey)}</span>
        </div>
      </div>
    </div>

    {/* FOOTER */}
    {/* <div className="text-center text-xs text-gray-600">
      Payment is due within {customerData?.paymentTerms ?? 15} days. Thank you for your business!
    </div> */}
  </div>
</div>
            <div className="flex flex-end justify-end mt-4">
              <div className="">
              <Button label="Back" onClick={() => setActiveIndex(2)} /> 
              </div>
             
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
