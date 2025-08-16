"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

const emptyTax = { id: "", qbTaxCodeId: "", name: "", percent: "", label: "", value: "" };
const emptyNominal = { id: "", qbAccountId: "", code: "", name: "", fq: "", type: "", label: "", value: "" };

const genId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

const blankLine = () => ({
  _rowId: genId(),
  _id: undefined,
  description: "",
  quantity: 1,
  unitPrice: 0,
  nominalCode: { ...emptyNominal },
  expenseAccountRef: null,
  tax: { ...emptyTax },
  taxClassId: null,
  taxRatePercent: 0,
  capex: false,
  receivedQty: 0,
});

const computeLine = (li) => {
  const qty = Number(li?.quantity) || 0;
  const price = Number(li?.unitPrice) || 0;
  const net = round2(qty * price);
  const pct = Number(li?.taxRatePercent) || 0;
  const tax = round2(net * (pct / 100));
  const total = round2(net + tax);
  return { net, tax, total };
};

/* --------------------------- small block wrapper --------------------------- */
function Block({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle ? <p className="text-sm text-zinc-500 mt-1">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

/* --------------------------- Row (local state + debounced commit) --------------------------- */
const LineRow = React.memo(function LineRow({
  li,
  expenseAccounts = [],
  taxOptions = [],
  taxesLoading,
  onCommit, // (rowId, patchObj)
  onRemove, // (rowId)
}) {
  const [desc, setDesc] = useState(li.description ?? "");
  const [qty, setQty] = useState(Number(li.quantity) || 0);
  const [price, setPrice] = useState(Number(li.unitPrice) || 0);

  // re-init local state only when row identity changes
  useEffect(() => {
    setDesc(li.description ?? "");
    setQty(Number(li.quantity) || 0);
    setPrice(Number(li.unitPrice) || 0);
  }, [li._rowId]);

  // debounced description commit
  const debounceRef = useRef(null);
  const debouncedCommitDesc = useCallback(
    (value) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onCommit(li._rowId, { description: value }), 200);
    },
    [li._rowId, onCommit]
  );

  // live commit qty/price
  useEffect(() => {
    onCommit(li._rowId, { quantity: qty });
  }, [qty, li._rowId, onCommit]);

  useEffect(() => {
    onCommit(li._rowId, { unitPrice: price });
  }, [price, li._rowId, onCommit]);

  const taxValue = li?.tax?.qbTaxCodeId || li?.taxClassId || "";
  const outstanding = Math.max(0, Number(qty || 0) - Number(li?.receivedQty || 0));
  const { net, tax, total } = computeLine({ ...li, quantity: qty, unitPrice: price });

  return (
    <div className="grid grid-cols-12 gap-3 items-center">
      <div className="col-span-4">
        <InputText
          placeholder="Item description"
          value={desc}
          onChange={(e) => {
            const v = e.target.value;
            setDesc(v);
            debouncedCommitDesc(v);
          }}
          onBlur={() => onCommit(li._rowId, { description: desc })}
        />
      </div>

      <div className="col-span-1">
        <InputNumber placeholder="Qty" min={0} value={qty} onValueChange={(e) => setQty(e?.value ?? 0)} />
      </div>

      <div className="col-span-2">
        <InputNumber {...GBP} value={price} onValueChange={(e) => setPrice(e?.value ?? 0)} />
      </div>

      <div className="col-span-2">
        <Dropdown
          value={li.expenseAccountRef || (li.nominalCode?.qbAccountId || null)}
          options={expenseAccounts || []}
          optionLabel="label"
          optionValue="value"
          placeholder="Select…"
          className="w-full"
          panelClassName="min-w-[420px]"
          filter
          filterBy="label,code,fq"
          itemTemplate={(opt) => {
            if (!opt) return null;
            return (
              <div className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0 flex gap-2">
                  {opt.qbAccountId ? (
                    <div className="font-medium text-surface-500" title={opt.qbAccountId}>
                      {opt.qbAccountId} -
                    </div>
                  ) : null}
                  <div className="truncate font-medium" title={opt.fq || opt.label}>
                    {opt.fq || opt.label}
                  </div>
                </div>
                <span className="text-xs text-surface-500">{opt.type || "Expense"}</span>
              </div>
            );
          }}
          valueTemplate={(opt) => {
            if (!opt) return <span className="text-surface-500">Select…</span>;
            return (
              <span title={`${opt.fq || opt.label}${opt.code ? ` (${opt.code})` : ""}`}>
                {opt.fq || opt.label}
                {opt.code ? <span className="text-surface-500"> &nbsp;({opt.code})</span> : null}
              </span>
            );
          }}
          emptyMessage="No accounts"
          emptyFilterMessage="No match"
          onChange={(e) => {
            const qbAccountId = e.value;
            const found = (expenseAccounts || []).find((x) => x.value === qbAccountId);
            const nc = found
              ? {
                  id: String(found.id || ""),
                  qbAccountId: String(found.qbAccountId || found.value || ""),
                  code: String(found.code || ""),
                  name: String(found.name || ""),
                  fq: String(found.fq || ""),
                  type: String(found.type || ""),
                  label: String(found.label || ""),
                  value: String(found.value || found.qbAccountId || ""),
                }
              : { ...emptyNominal };
            onCommit(li._rowId, { expenseAccountRef: qbAccountId, nominalCode: nc });
          }}
        />
      </div>

      <div className="col-span-1">
        <Dropdown
          value={taxValue}
          options={taxOptions || []}
          optionLabel="label"
          optionValue="qbTaxCodeId"
          placeholder={taxesLoading ? "Loading..." : "Tax"}
          className="w-full"
          onChange={(e) => {
            const qbId = e.value || "";
            const t = (taxOptions || []).find((x) => String(x.qbTaxCodeId) === String(qbId));
            const pct = Number(t?.percent) || 0;
            const taxObj = t
              ? {
                  id: String(t.id || ""),
                  qbTaxCodeId: String(t.qbTaxCodeId || ""),
                  name: String(t.name || ""),
                  percent: String(t.percent != null ? t.percent : 0),
                  label: String(t.label || ""),
                  value: String(t.value || t.qbTaxCodeId || ""),
                }
              : { ...emptyTax };
            onCommit(li._rowId, { tax: taxObj, taxClassId: qbId, taxRatePercent: pct });
          }}
          filter
          disabled={!!taxesLoading}
        />
      </div>

      <div className="col-span-1 flex items-center gap-2">
        <Checkbox
          inputId={`capex-${li._rowId}`}
          checked={!!li.capex}
          onChange={(e) => onCommit(li._rowId, { capex: e.checked })}
        />
        <label htmlFor={`capex-${li._rowId}`} className="text-sm">
          CAPEX
        </label>
      </div>

      <div className="col-span-1 text-right font-medium">£{total.toFixed(2)}</div>

      {/* helper footer */}
      <div className="col-span-12 mt-1 -mb-1 flex justify-between text-xs text-zinc-500">
        <span>Net: £{net.toFixed(2)} • VAT: £{tax.toFixed(2)}</span>
        <span>Outstanding: {outstanding}</span>
      </div>

      <div className="col-span-12">
        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
      </div>

      <div className="col-span-12 -mt-2 mb-4 flex justify-end">
        <Button size="small" severity="danger" outlined onClick={() => onRemove(li._rowId)}>
          Remove
        </Button>
      </div>
    </div>
  );
});

/* --------------------------- page --------------------------- */
export default function EditPurchaseOrderPage() {
  const router = useRouter();
  const toast = useRef(null);
  const params = useParams();
  const poId = params?.id;

  // master data
  const [suppliers, setSuppliers] = useState([]);
  const [depots, setDepots] = useState([]);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [taxesLoading, setTaxesLoading] = useState(false);

  // form
  const [supplierId, setSupplierId] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [depotId, setDepotId] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentTermsDays, setPaymentTermsDays] = useState(14);
  const [currency, setCurrency] = useState("GBP");
  const [status, setStatus] = useState("Draft");
  const [isSave, setisSave] = useState(false)

  const [lineItems, setLineItems] = useState([blankLine()]);
  const [charges, setCharges] = useState({ shipping: 0, handling: 0, other: 0, otherDescription: "" });

  const selectedSupplier = useMemo(
    () => (suppliers || []).find((s) => s._id === supplierId),
    [suppliers, supplierId]
  );

  useEffect(() => {
    if (selectedSupplier?.paymentTermsDays != null) {
      setPaymentTermsDays(Number(selectedSupplier.paymentTermsDays) || 14);
    }
  }, [selectedSupplier]);

  /* --------- load expense accounts --------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiServices.get("/integrations/expense-accounts?limit=1000");
        if (data?.success && Array.isArray(data.data)) setExpenseAccounts(data.data);
        else setExpenseAccounts([]);
      } catch (e) {
        setExpenseAccounts([]);
        toast.current?.show({
          severity: "warn",
          summary: "Expense Accounts",
          detail: e?.response?.data?.message || e?.message || "Failed to load expense accounts.",
        });
      }
    })();
  }, []);

  /* --------- taxes: sync + load --------- */
  const loadTaxes = async () => {
    setTaxesLoading(true);
    try {
      const res = await apiServices.get(`/integrations/taxes?side=sales&limit=200`);
      let list = Array.isArray(res?.data?.data) ? res.data.data : [];
      list = (list || []).map((t) => ({
        id: t?.id != null ? String(t.id) : "",
        qbTaxCodeId: t?.qbTaxCodeId != null ? String(t.qbTaxCodeId) : "",
        name: t?.name || "",
        percent: Number.isFinite(Number(t?.percent)) ? Number(t.percent) : 0,
        label: t?.label || "",
        value: t?.value != null ? String(t.value) : "",
      }));
      if (!(list || []).some((x) => Number(x.percent) === 0)) {
        list.unshift({ id: "zero", qbTaxCodeId: "", name: "Zero VAT", percent: 0, label: "Zero VAT (0%)", value: "" });
      }
      setTaxOptions(list || []);
    } catch (err) {
      setTaxOptions([{ id: "zero", qbTaxCodeId: "", name: "Zero VAT", percent: 0, label: "Zero VAT (0%)", value: "" }]);
      toast.current?.show({
        severity: "error",
        summary: "Taxes",
        detail: err?.response?.data?.message || err?.message || "Failed to load taxes.",
      });
    } finally {
      setTaxesLoading(false);
    }
  };

  const syncAndLoadTaxes = async () => {
    await loadTaxes();
    try {
      await apiServices.post(`/integrations/qbo/taxes/sync`, {});
    } catch (err) {
      toast.current?.show({
        severity: "warn",
        summary: "Tax Sync",
        detail: err?.response?.data?.message || err?.message || "Sync failed; showing existing taxes.",
      });
    } finally {
      await loadTaxes();
    }
  };

  /* ---------------- Master data ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const supRes = await apiServices.get(`/suppliers?q=&page=1&limit=200`);
        setSuppliers(Array.isArray(supRes?.data?.data) ? supRes.data.data : []);
      } catch {}
      try {
        const depRes = await apiServices.get(`/depots?page=1&limit=200`);
        setDepots(Array.isArray(depRes?.data?.data) ? depRes.data.data : []);
      } catch {}
      await syncAndLoadTaxes();
    })();
  }, []);

  /* ---------------- Load PO ---------------- */
  useEffect(() => {
    if (!poId) return;
    (async () => {
      try {
        const { data } = await apiServices.get(`/purchase-orders/${poId}`);
        const po = data?.data ?? data;

        setStatus(po.status || "Draft");
        setCurrency(po.currency || "GBP");

        setSupplierId(typeof po.supplierId === "object" ? po.supplierId._id : po.supplierId || null);
        setDeliveryDate(po.deliveryDate ? new Date(po.deliveryDate) : null);

        setDepotId(po.depotId?._id || po.depotId || null);
        setDeliveryAddress(po.deliveryAddress || "");
        setReference(po.reference || "");
        setNotes(po.notes || "");
        setPaymentTermsDays(Number(po.paymentTermsDays || 14));

        const mappedLines = (po.lineItems || []).map((l) => {
          const rowId = l._rowId || l._id || genId();
          const nc = l.nominalCode && typeof l.nominalCode === "object" ? l.nominalCode : { ...emptyNominal };
          const t = l.tax && typeof l.tax === "object" ? l.tax : { ...emptyTax };
          const pct = Number(t.percent) || Number(l.taxRatePercent) || 0;

          return {
            _rowId: rowId,
            _id: l._id,
            description: l.description || "",
            quantity: Number(l.quantity) || 0,
            unitPrice: Number(l.unitPrice) || 0,
            nominalCode: {
              id: String(nc.id || ""),
              qbAccountId: String(nc.qbAccountId || nc.value || ""),
              code: String(nc.code || ""),
              name: String(nc.name || ""),
              fq: String(nc.fq || ""),
              type: String(nc.type || ""),
              label: String(nc.label || ""),
              value: String(nc.value || nc.qbAccountId || ""),
            },
            expenseAccountRef: nc?.qbAccountId || null,
            tax: {
              id: String(t.id || ""),
              qbTaxCodeId: String(t.qbTaxCodeId || ""),
              name: String(t.name || ""),
              percent: String(t.percent != null ? t.percent : pct),
              label: String(t.label || ""),
              value: String(t.value || t.qbTaxCodeId || ""),
            },
            taxClassId: t?.qbTaxCodeId || null,
            taxRatePercent: Number(pct) || 0,
            capex: !!l.capex,
            receivedQty: Number(l.receivedQty || 0),
          };
        });

        setLineItems(mappedLines.length ? mappedLines : [blankLine()]);

        setCharges({
          shipping: Number(po?.charges?.shipping || 0),
          handling: Number(po?.charges?.handling || 0),
          other: Number(po?.charges?.other || 0),
          otherDescription: po?.charges?.otherDescription || "",
        });
      } catch (err) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: err?.response?.data?.message || err.message,
        });
      }
    })();
  }, [poId]);

  /* ---------------- Derived totals ---------------- */
  const { subTotal, taxTotal, chargesTotal, grandTotal } = useMemo(() => {
    const s = round2((lineItems || []).reduce((acc, li) => acc + computeLine(li).net, 0));
    const t = round2((lineItems || []).reduce((acc, li) => acc + computeLine(li).tax, 0));
    const ct = round2(
      (Number(charges?.shipping) || 0) + (Number(charges?.handling) || 0) + (Number(charges?.other) || 0)
    );
    return { subTotal: s, taxTotal: t, chargesTotal: ct, grandTotal: round2(s + t + ct) };
  }, [lineItems, charges]);

  /* ---------------- Line mutations (by _rowId) ---------------- */
  const commitLinePatch = useCallback((rowId, patch) => {
    setLineItems((prev) => (prev || []).map((li) => (li._rowId === rowId ? { ...li, ...patch } : li)));
  }, []);

  const addLine = useCallback(() => setLineItems((prev) => [...(prev || []), blankLine()]), []);
  const removeLine = useCallback((rowId) => {
    setLineItems((prev) => {
      const arr = (prev || []).filter((li) => li._rowId !== rowId);
      return arr.length ? arr : [blankLine()];
    });
  }, []);

  const validate = () => {
    const errs = [];
    if (!supplierId) errs.push("Supplier");
    if (!deliveryDate) errs.push("Delivery Date");
    const hasValidLine = (lineItems || []).some((li) => (li?.description || "").trim().length > 0);
    if (!hasValidLine) errs.push("At least one line item");
    return errs;
  };

  // Build payload INCLUDING full objects and totals
  const buildPayload = (overrideStatus) => {
    const payloadLines = (lineItems || [])
      .filter((li) => (li.description || "").trim().length > 0)
      .map((li) => {
        const nc = li.nominalCode && typeof li.nominalCode === "object" ? li.nominalCode : { ...emptyNominal };

        let taxObj = { ...emptyTax };
        if (li.tax && (li.tax.qbTaxCodeId || li.tax.name || li.tax.label)) {
          taxObj = {
            id: String(li.tax.id || ""),
            qbTaxCodeId: String(li.tax.qbTaxCodeId || ""),
            name: String(li.tax.name || ""),
            percent: String(li.tax.percent != null ? li.tax.percent : li.taxRatePercent || 0),
            label: String(li.tax.label || ""),
            value: String(li.tax.value || li.tax.qbTaxCodeId || ""),
          };
        } else if (li.taxClassId) {
          const t = (taxOptions || []).find((x) => String(x.qbTaxCodeId) === String(li.taxClassId));
          if (t) {
            taxObj = {
              id: String(t.id || ""),
              qbTaxCodeId: String(t.qbTaxCodeId || ""),
              name: String(t.name || ""),
              percent: String(t.percent != null ? t.percent : li.taxRatePercent || 0),
              label: String(t.label || ""),
              value: String(t.value || t.qbTaxCodeId || ""),
            };
          }
        }

        const { net, tax, total } = computeLine(li);

        return {
          _id: li._id, // keep for backend
          description: String(li.description || "").trim(),
          quantity: Number(li.quantity) || 0,
          unitPrice: Number(li.unitPrice) || 0,
          nominalCode: {
            id: String(nc.id || ""),
            qbAccountId: String(nc.qbAccountId || nc.value || ""),
            code: String(nc.code || ""),
            name: String(nc.name || ""),
            fq: String(nc.fq || ""),
            type: String(nc.type || ""),
            label: String(nc.label || ""),
            value: String(nc.value || nc.qbAccountId || ""),
          },
          tax: taxObj,
          capex: !!li.capex,
          netAmount: net,
          taxAmount: tax,
          additionalAmount: 0,
          lineTotal: total,
        };
      });

    return {
      supplierId,
      deliveryDate,
      depotId: depotId || undefined,
      deliveryAddress: (deliveryAddress || "").trim() || undefined,
      reference: (reference || "").trim() || undefined,
      notes: (notes || "").trim() || undefined,
      paymentTermsDays,
      currency,
      lineItems: payloadLines,
      charges: {
        shipping: Number(charges?.shipping) || 0,
        handling: Number(charges?.handling) || 0,
        other: Number(charges?.other) || 0,
        otherDescription: (charges?.otherDescription || "").trim(),
      },
      subTotal: Number(subTotal) || 0,
      taxTotal: Number(taxTotal) || 0,
      chargesTotal: Number(chargesTotal) || 0,
      grandTotal: Number(grandTotal) || 0,
      ...(overrideStatus ? { status: overrideStatus } : {}),
    };
  };

  const saveChanges = async (overrideStatus = null) => {
    const errs = validate();
    if (errs.length) {
      toast.current?.show({ severity: "warn", summary: "Missing fields", detail: `Please provide: ${errs.join(", ")}` });
      return null;
    }
    const payload = buildPayload(overrideStatus);
    const res = await apiServices.put(`/purchase-orders/${poId}`, payload);
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to update Purchase Order");
    return res.data.data;
  };

  const onSave = async () => {
    setisSave(true)
    try {
      const updated = await saveChanges();
      if (updated) {
        setStatus(updated.status || status);
        setisSave(false)
        toast.current?.show({ severity: "success", summary: "Saved", detail: "Changes updated." });
      }
    } catch (e) {
      toast.current?.show({ severity: "error", summary: "Error", detail: e?.response?.data?.message || e.message });
    }
  };

  const onSubmitApproval = async () => {
    try {
      await saveChanges(); // save current edits
      try {
        await apiServices.post(`/purchase-orders/${poId}/send-for-approval`);
      } catch {
        await saveChanges("Submitted");
      }
      toast.current?.show({ severity: "success", summary: "Sent", detail: "Purchase Order sent for approval." });
      setStatus("Submitted");
    } catch (e) {
      toast.current?.show({ severity: "error", summary: "Error", detail: e?.response?.data?.message || e.message });
    }
  };

  /* ---------------- UI helpers ---------------- */
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

  return (
    <div className="card">
      <Toast ref={toast} />
      <GoPrevious route={"/purchasing/purchase-order-list"} />
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Edit Purchase Order</h2>
        <span className="text-sm px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">{status}</span>
      </div>

      {/* Supplier Details */}
      <Block title="Supplier Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Supplier <span className="text-red-500">*</span>
            </label>
            <Dropdown
              className="w-full"
              value={supplierId}
              options={(suppliers || []).map((s) => ({ label: s.companyName, value: s._id }))}
              onChange={(e) => setSupplierId(e.value)}
              placeholder="Select supplier"
              filter
              disabled={String(status || "").toLowerCase() !== "draft"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Delivery Date <span className="text-red-500">*</span>
            </label>
            <Calendar className="w-full" value={deliveryDate} onChange={(e) => setDeliveryDate(e.value)} dateFormat="mm/dd/yy" showIcon />
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
              options={(depots || []).map((d) => ({ label: d.name || d.title || d.code, value: d._id }))}
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
      </Block>

      {/* Order Details */}
      <Block title="Order Details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">PO Reference/Description</label>
            <InputText className="w-full" placeholder="e.g., Office Supplies Q1 2024" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Terms</label>
            <InputText className="w-full" value={`${paymentTermsDays} days`} readOnly />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Notes/Comments</label>
          <InputTextarea autoResize className="w-full" rows={4} placeholder="Add any additional notes or special instructions" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </Block>

      {/* Line Items */}
      <Block title="Line Items">
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
          {(lineItems || []).map((li) => (
            <LineRow
              key={li._rowId}
              li={li}
              expenseAccounts={expenseAccounts || []}
              taxOptions={taxOptions || []}
              taxesLoading={!!taxesLoading}
              onCommit={commitLinePatch}
              onRemove={removeLine}
            />
          ))}
        </div>

        <div className="mt-4">
          <Button type="button" outlined onClick={addLine}>
            + Add Line Item
          </Button>
        </div>
      </Block>

      {/* Additional Charges */}
      <Block title="Additional Charges">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Delivery/Shipping Charge</label>
            <InputNumber {...GBP} className="w-full" value={charges?.shipping ?? 0} onValueChange={(e) => setCharges((c) => ({ ...c, shipping: e?.value ?? 0 }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Handling Charge</label>
            <InputNumber {...GBP} className="w-full" value={charges?.handling ?? 0} onValueChange={(e) => setCharges((c) => ({ ...c, handling: e?.value ?? 0 }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Other Charges</label>
            <InputNumber {...GBP} className="w-full" value={charges?.other ?? 0} onValueChange={(e) => setCharges((c) => ({ ...c, other: e?.value ?? 0 }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Other Charges Description</label>
            <InputText className="w-full" placeholder="Describe the other charges (if any)" value={charges?.otherDescription ?? ""} onChange={(e) => setCharges((c) => ({ ...c, otherDescription: e.target.value }))} />
          </div>
        </div>
      </Block>

      {/* Summary */}
      <Block title="Summary">
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
      </Block>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 mt-8 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
          <Button type="button" severity="secondary" outlined onClick={() => router.back()}>
            Cancel
          </Button>
          <Button loading={isSave} type="button" onClick={onSave}>
            Save Changes
          </Button>
          <Button type="button" severity="info" onClick={onSubmitApproval} disabled={String(status || "").toLowerCase() !== "draft"}>
            Send for Approval
          </Button>
        </div>
      </div>
    </div>
  );
}
