"use client";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import apiServices from "@/services/apiService";

/* --------------------------- helpers --------------------------- */
const GBP = { mode: "currency", currency: "GBP", locale: "en-GB" };
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

const newLineItem = () => ({
  description: "",
  quantity: 1,
  unitPrice: 0,
  nominalCode: "",
  taxClassId: null,
  taxRatePercent: 0,
  capex: false,
});

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle ? <p className="text-sm text-zinc-500 mt-1">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

/* --------------------------- main page --------------------------- */
export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const toast = useRef(null);

  // master data
  const [suppliers, setSuppliers] = useState([]);
  const [depots, setDepots] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]); // {label, value:{id, percent}}

  // form
  const [supplierId, setSupplierId] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [depotId, setDepotId] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentTermsDays, setPaymentTermsDays] = useState(14); // read-only display (from supplier if needed)
  const [currency] = useState("GBP");

  const [lineItems, setLineItems] = useState([newLineItem()]);
  const [charges, setCharges] = useState({
    shipping: 0,
    handling: 0,
    other: 0,
    otherDescription: "",
  });

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s._id === supplierId),
    [suppliers, supplierId]
  );

  // hydrate payment terms when supplier changes (if you store it on supplier later)
  useEffect(() => {
    if (selectedSupplier?.paymentTermsDays != null) {
      setPaymentTermsDays(Number(selectedSupplier.paymentTermsDays) || 14);
    } else {
      setPaymentTermsDays(14);
    }
  }, [selectedSupplier]);

  /* --------- fetch master data --------- */
  useEffect(() => {
    (async () => {
      try {
        // suppliers
        const supRes = await apiServices.get(`/suppliers?q=&page=1&limit=200`);
        const supList = supRes?.data?.data || [];
        setSuppliers(supList);

        // depots (adjust to your actual endpoint)
        try {
          const depRes = await apiServices.get(`/depots?page=1&limit=200`);
          setDepots(depRes?.data?.data || []);
        } catch {
          setDepots([]); // optional
        }

        // tax classes (adjust to your endpoint; mapping percent best-effort)
        try {
          const taxRes = await apiServices.get(`/tax-classes/list?search=&page=1&limit=200`);
          const list = taxRes?.data?.data || [];
          const mapped = list.map((t) => {
            const pct =
              t.rate ??
              t.percentage ??
              t.percent ??
              t.value ??
              0;
            return {
              label: `${t.name}${pct ? ` (${pct}%)` : ""}`,
              value: { id: t._id, percent: Number(pct) || 0 },
            };
          });
          // ensure at least 0% exists
          if (!mapped.some((o) => o.value.percent === 0)) {
            mapped.unshift({ label: "Zero Rated (0%)", value: { id: null, percent: 0 } });
          }
          setTaxOptions(mapped);
        } catch {
          setTaxOptions([{ label: "Zero Rated (0%)", value: { id: null, percent: 0 } }]);
        }
      } catch (err) {
        toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load master data." });
      }
    })();
  }, []);

  /* --------- derived totals --------- */
  const linesWithCalc = useMemo(() => {
    return lineItems.map((li) => {
      const qty = Number(li.quantity) || 0;
      const price = Number(li.unitPrice) || 0;
      const net = round2(qty * price);
      const tax = round2(net * ((Number(li.taxRatePercent) || 0) / 100));
      const total = round2(net + tax);
      return { ...li, _net: net, _tax: tax, _total: total };
    });
  }, [lineItems]);

  const { subTotal, taxTotal, chargesTotal, grandTotal } = useMemo(() => {
    const s = round2(linesWithCalc.reduce((acc, li) => acc + (li._net || 0), 0));
    const t = round2(linesWithCalc.reduce((acc, li) => acc + (li._tax || 0), 0));
    const ct = round2(
      (Number(charges.shipping) || 0) +
      (Number(charges.handling) || 0) +
      (Number(charges.other) || 0)
    );
    return {
      subTotal: s,
      taxTotal: t,
      chargesTotal: ct,
      grandTotal: round2(s + t + ct),
    };
  }, [linesWithCalc, charges]);

  /* --------- handlers --------- */
  const setLineField = (idx, key, value) => {
    setLineItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const addLine = () => setLineItems((prev) => [...prev, newLineItem()]);
  const removeLine = (idx) =>
    setLineItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const validate = () => {
    const errs = [];
    if (!supplierId) errs.push("Supplier");
    if (!deliveryDate) errs.push("Delivery Date");
    // at least one non-empty line with description
    const hasValidLine = lineItems.some((li) => (li.description || "").trim().length > 0);
    if (!hasValidLine) errs.push("At least one line item");
    return errs;
  };

  const submitPO = async (status) => {
    try {
      const errs = validate();
      if (errs.length) {
        toast.current?.show({
          severity: "warn",
          summary: "Missing fields",
          detail: `Please provide: ${errs.join(", ")}`,
        });
        return;
      }

      const payload = {
        supplierId,
        deliveryDate,
        depotId: depotId || undefined,
        deliveryAddress: deliveryAddress?.trim() || undefined,
        reference: reference?.trim() || undefined,
        notes: notes?.trim() || undefined,
        paymentTermsDays,
        currency,
        lineItems: lineItems
          .filter((li) => (li.description || "").trim().length > 0)
          .map((li) => ({
            description: li.description.trim(),
            quantity: Number(li.quantity) || 0,
            unitPrice: Number(li.unitPrice) || 0,
            nominalCode: li.nominalCode || undefined,
            taxClassId: li.taxClassId || undefined,
            taxRatePercent: Number(li.taxRatePercent) || 0,
            capex: !!li.capex,
          })),
        charges: {
          shipping: Number(charges.shipping) || 0,
          handling: Number(charges.handling) || 0,
          other: Number(charges.other) || 0,
          otherDescription: charges.otherDescription?.trim() || "",
        },
        status, // "Draft" or "Submitted"
      };

      const res = await apiServices.post("/purchase-orders", payload);
      if (res?.data?.success) {
        toast.current?.show({
          severity: "success",
          summary: status === "Submitted" ? "Submitted" : "Saved",
          detail:
            status === "Submitted"
              ? "Purchase Order submitted for approval."
              : "Draft saved successfully.",
        });
        router.push("/purchasing/create-purchase-order");
      } else {
        throw new Error(res?.data?.message || "Failed to save Purchase Order");
      }
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err?.response?.data?.message || err.message,
      });
    }
  };

  const onSaveDraft = () => submitPO("Draft");
  const onSubmitApproval = () => submitPO("Submitted");

  /* --------- UI bits --------- */
  const SupplierAddressCard = () =>
    !selectedSupplier ? null : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/40 p-4">
          <p className="text-sm font-medium mb-2">Supplier Address</p>
          <div className="text-sm text-zinc-600 dark:text-zinc-300 space-y-0.5">
            <div>{selectedSupplier.address?.addressLine1}</div>
            {selectedSupplier.address?.addressLine2 && <div>{selectedSupplier.address.addressLine2}</div>}
            <div>{selectedSupplier.address?.city}</div>
            <div>{selectedSupplier.address?.postcode}</div>
            <div>{selectedSupplier.address?.country}</div>
          </div>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/40 p-4">
          <p className="text-sm font-medium mb-2">Contact Information</p>
          <div className="text-sm text-zinc-600 dark:text-zinc-300 space-y-0.5">
            <div>{selectedSupplier.contactName}</div>
            <div>{selectedSupplier.email}</div>
            <div>{selectedSupplier.phone}</div>
            {selectedSupplier.companyNumber && <div>Company No: {selectedSupplier.companyNumber}</div>}
            {selectedSupplier.taxNumber && <div>Tax No: {selectedSupplier.taxNumber}</div>}
          </div>
        </div>
      </div>
    );

  const LineRow = ({ li, idx }) => {
    const selectedTax = taxOptions.find(
      (o) => o.value.percent === Number(li.taxRatePercent) && o.value.id === (li.taxClassId || null)
    ) || taxOptions.find((o) => o.value.percent === Number(li.taxRatePercent));

    return (
      <div className="grid grid-cols-12 gap-3 items-center">
        <div className="col-span-4">
          <InputText
            placeholder="Item description"
            value={li.description}
            onChange={(e) => setLineField(idx, "description", e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <InputNumber
            placeholder="Qty"
            min={0}
            value={li.quantity}
            onValueChange={(e) => setLineField(idx, "quantity", e.value ?? 0)}
          />
        </div>
        <div className="col-span-2">
          <InputNumber
            {...GBP}
            value={li.unitPrice}
            onValueChange={(e) => setLineField(idx, "unitPrice", e.value ?? 0)}
          />
        </div>
        <div className="col-span-2">
          {/* nominal code as free text or replace with Dropdown if you have options */}
          <InputText
            placeholder="Nominal code"
            value={li.nominalCode || ""}
            onChange={(e) => setLineField(idx, "nominalCode", e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <Dropdown
            value={selectedTax || null}
            options={taxOptions}
            optionLabel="label"
            placeholder="Tax"
            className="w-full"
            onChange={(e) => {
              const v = e.value?.value || { id: null, percent: 0 };
              setLineField(idx, "taxClassId", v.id || null);
              setLineField(idx, "taxRatePercent", Number(v.percent) || 0);
            }}
            filter
          />
        </div>
        <div className="col-span-1 flex items-center gap-2">
          <Checkbox
            inputId={`capex-${idx}`}
            checked={!!li.capex}
            onChange={(e) => setLineField(idx, "capex", e.checked)}
          />
          <label htmlFor={`capex-${idx}`} className="text-sm">
            CAPEX
          </label>
        </div>
        <div className="col-span-1 text-right font-medium">
          £{(li._total ?? 0).toFixed(2)}
        </div>
        <div className="col-span-12">
          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="col-span-12 -mt-2 mb-4 flex justify-end">
          <Button
            size="small"
            severity="danger"
            outlined
            onClick={() => removeLine(idx)}
            disabled={lineItems.length === 1}
          >
            Remove
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <GoPrevious route={"/purchasing/purchase-order-list"} />
      <h2 className="text-xl font-semibold mb-4">New Purchase Order</h2>

      {/* Supplier Details */}
      <Section title="Supplier Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Supplier <span className="text-red-500">*</span>
            </label>
            <Dropdown
              className="w-full"
              value={supplierId}
              options={suppliers.map((s) => ({ label: s.companyName, value: s._id }))}
              onChange={(e) => setSupplierId(e.value)}
              placeholder="Select supplier"
              filter
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Delivery Date <span className="text-red-500">*</span>
            </label>
            <Calendar
              className="w-full"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.value)}
              dateFormat="mm/dd/yy"
              showIcon
            />
          </div>
        </div>

        <div className="mt-4">
          <SupplierAddressCard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Depot</label>
            <Dropdown
              className="w-full"
              value={depotId}
              options={depots.map((d) => ({ label: d.name || d.title || d.code, value: d._id }))}
              onChange={(e) => setDepotId(e.value)}
              placeholder="Select depot"
              filter
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Address</label>
            <InputText
              className="w-full"
              placeholder="Enter specific delivery address or instructions"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>
        </div>
      </Section>

      {/* Order Details */}
      <Section title="Order Details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">PO Reference/Description</label>
            <InputText
              className="w-full"
              placeholder="e.g., Office Supplies Q1 2024"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Terms</label>
            <InputText className="w-full" value={`${paymentTermsDays} days`} readOnly />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Notes/Comments</label>
          <InputTextarea
            autoResize
            className="w-full"
            rows={4}
            placeholder="Add any additional notes or special instructions"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </Section>

      {/* Line Items */}
      <Section title="Line Items">
        <div className="grid grid-cols-12 gap-3 font-medium text-sm text-zinc-500 mb-3">
          <div className="col-span-4">Description</div>
          <div className="col-span-1">Quantity</div>
          <div className="col-span-2">Unit Price</div>
          <div className="col-span-2">Nominal Code</div>
          <div className="col-span-1">Tax Rate</div>
          <div className="col-span-1">CAPEX</div>
          <div className="col-span-1 text-right">Total</div>
        </div>

        <div className="space-y-2">
          {linesWithCalc.map((li, idx) => (
            <LineRow key={idx} li={li} idx={idx} />
          ))}
        </div>

        <div className="mt-4">
          <Button type="button" outlined onClick={addLine}>
            + Add Line Item
          </Button>
        </div>
      </Section>

      {/* Additional Charges */}
      <Section title="Additional Charges">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Delivery/Shipping Charge</label>
            <InputNumber
              {...GBP}
              className="w-full"
              value={charges.shipping}
              onValueChange={(e) =>
                setCharges((c) => ({ ...c, shipping: e.value ?? 0 }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Handling Charge</label>
            <InputNumber
              {...GBP}
              className="w-full"
              value={charges.handling}
              onValueChange={(e) =>
                setCharges((c) => ({ ...c, handling: e.value ?? 0 }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Other Charges</label>
            <InputNumber
              {...GBP}
              className="w-full"
              value={charges.other}
              onValueChange={(e) =>
                setCharges((c) => ({ ...c, other: e.value ?? 0 }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Other Charges Description</label>
            <InputText
              className="w-full"
              placeholder="Describe the other charges (if any)"
              value={charges.otherDescription}
              onChange={(e) =>
                setCharges((c) => ({ ...c, otherDescription: e.target.value }))
              }
            />
          </div>
        </div>
      </Section>

      {/* Summary */}
      <Section title="Summary">
        <div className="flex justify-end">
          <div className="w-full md:w-80 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Subtotal</span>
              <span className="font-medium">£{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Tax</span>
              <span className="font-medium">£{taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Additional Charges</span>
              <span className="font-medium">£{chargesTotal.toFixed(2)}</span>
            </div>
            <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-2" />
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">£{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 mt-8 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
          <Button type="button" severity="secondary" outlined onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="button" onClick={onSaveDraft}>
            Save as Draft
          </Button>
          <Button type="button" severity="info" onClick={onSubmitApproval}>
            Submit for Approval
          </Button>
        </div>
      </div>
    </div>
  );
}
