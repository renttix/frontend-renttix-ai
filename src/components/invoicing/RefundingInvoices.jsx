"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Badge } from "primereact/badge";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { Paginator } from "primereact/paginator";
import { Toast } from "primereact/toast";

import TableComponent from "@/components/common/table/TableComponent";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import Loader from "@/components/common/Loader";
import useDebounce from "@/hooks/useDebounce";
import apiServices from "@/services/apiService";

// NEW: import your modal (adjust the path if needed)
import RefundModal from "@/components/invoicing/RefundModal";

// ---------------------- helpers ----------------------
function safeNumber(n) {
  if (typeof n === "number") return n;
  if (typeof n === "string") return Number(n.replace(/[^0-9.-]/g, "")) || 0;
  return 0;
}
function formatMoney(n) {
  const v = safeNumber(n);
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

// NEW: dynamic severity resolvers
function creditTypeSeverity(type) {
  switch (type) {
    case "Full Invoice Percentage": return "warning";
    case "Manual Invoice Override": return "danger";
    case "Flat Value Refund": return "info";
    case "Line-Item Credit": return "success";
    default: return "secondary";
  }
}
function applyToSeverity(applyTo) {
  switch (applyTo) {
    case "Refund Now": return "success";
    case "Apply to Future Invoice": return "warning";
    default: return "secondary";
  }
}

// ---------------------- page ----------------------
const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Draft", value: "Draft" },
  { label: "Posted", value: "Posted" },
  { label: "Cancelled", value: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: "All Payments", value: "" },
  { label: "Unpaid", value: "Unpaid" },
  { label: "Paid", value: "Paid" },
  { label: "Partial", value: "Partial" },
];

export default function RefundingInvoices() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 700);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);

  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const toast = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s?.authReducer || {});

  // NEW: modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedSearch || "",
        page: String(page),
        limit: String(rows),
      });
      if (status) params.append("status", status);
      if (paymentStatus) params.append("paymentStatus", paymentStatus);

      const res = await apiServices.get(`/invoice/invoice-listing?${params.toString()}`);
      const result = res?.data || {};
      if (result?.success) {
        setList(result.data || []);
        setTotalRecords(result.total || 0);
      } else {
        setList([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error("Error loading invoices:", err);
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load invoices." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rows, debouncedSearch, status, paymentStatus]);

  const onSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const onPageChange = (event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  };

  // --------- dashboard stats (computed from current list) ----------
  const stats = useMemo(() => {
    const acc = {
      totalInvoiced: 0,
      totalRefunded: 0,
      totalRemaining: 0,
      creditsCount: 0,
      creditSum: 0,
      byType: {},
      byApplyTo: {},
      recent: [],
    };

    for (const inv of list) {
      const total = safeNumber(inv?.total);
      const refunded = safeNumber(inv?.refundedAmount);
      acc.totalInvoiced += total;
      acc.totalRefunded += refunded;
      acc.totalRemaining += Math.max(total - refunded, 0);

      const history = Array.isArray(inv?.refundHistory) ? inv.refundHistory : [];
      acc.creditsCount += history.length;

      for (const h of history) {
        const amt = safeNumber(h?.creditedAmount);
        acc.creditSum += amt;

        const t = h?.creditType || "—";
        const a = h?.applyTo || "—";
        acc.byType[t] = (acc.byType[t] || 0) + amt;
        acc.byApplyTo[a] = (acc.byApplyTo[a] || 0) + amt;

        acc.recent.push({
          referenceNumber: h?.referenceNumber,
          creditedAmount: amt,
          creditType: t,
          applyTo: a,
          date: h?.date,
          invoiceId: inv?._id,
          batchId: inv?.batchId,
          invNumber: inv?.invocie || inv?.DocNumber || inv?._id,
          customerName: inv?.customerName,
        });
      }
    }

    acc.recent.sort((a, b) => new Date(b.date) - new Date(a.date));
    const avgCredit = acc.creditsCount ? acc.creditSum / acc.creditsCount : 0;
    const refundRate = acc.totalInvoiced ? (acc.totalRefunded / acc.totalInvoiced) * 100 : 0;

    return { ...acc, avgCredit, refundRate };
  }, [list]);

  /** ========= Table setup (same pattern as TaxClasses) ========= */
  const Columns = {
    invocie: "Invoice #",
    customerName: "Customer",
    orderNumber: "Order #",
    invoiceDate: "Invoice Date",
    paymentStatus: "Payment",
    status: "Status",
    total: "Total",
    refundedAmount: "Refunded",
    action: "Action",
  };

  const renderColumnsBody = (field, item) => {
    switch (field) {
      case "invocie": {
        const label = item?.invocie || item?.DocNumber || item?._id;
        return (
          <Button
            size="small"
            label={label}
            link
            onClick={() => router.push(`/invoices/view/${item?._id}`)}
          />
        );
      }
      case "customerName":
        return <span title={item?.customerEmail || ""}>{item?.customerName || "-"}</span>;

      case "orderNumber":
        return item?.orderNumber || item?.orderId || "-";

      case "invoiceDate": {
        const d = item?.invoiceDate;
        if (!d) return "-";
        if (typeof d === "string" && isNaN(Date.parse(d))) return d;
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? d : dt.toLocaleString();
      }

      case "paymentStatus": {
        const val = item?.paymentStatus || "Unpaid";
        const sev = val === "Paid" ? "success" : val === "Partial" ? "warning" : "danger";
        return <Tag value={val} severity={sev} />;
      }

      case "status": {
        const val = item?.status || "Draft";
        const sev = val === "Posted" ? "success" : val === "Cancelled" ? "danger" : "warning";
        return <Tag value={val} severity={sev} />;
      }

      case "total":
        return `₨ ${formatMoney(item?.total)}`;

      case "refundedAmount":
        return item?.refundedAmount ? `₨ ${formatMoney(item.refundedAmount)}` : "₨ 0.00";

      case "action":
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button
              icon="pi pi-eye"
              rounded
              text
              onClick={() => router.push(`/invoicing/invoice-batch/${item?.batchId}/invoice/${item?._id}`)}
              tooltip="View invoice"
              tooltipOptions={{ position: "top" }}
            />
            <Button
              icon="pi pi-undo"
              label="Refund"
              size="small"
              outlined
              // NEW: open modal with the selected invoice
              onClick={() => {
                setSelectedInvoice(item);
                setShowRefundModal(true);
              }}
            />
          </div>
        );

      default:
        return item?.[field] ?? "-";
    }
  };

  return (
    <div className="card">
      <GoPrevious route={"/accounting"} />
      <Toast ref={toast} />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-4">
        <div className="flex items-center gap-2">
          <label className="text-[20px] font-semibold text-dark-2 dark:text-white">
            Refunding Invoices
          </label>
          <Badge value={list?.length || 0} size="small" severity="warning" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <IconField iconPosition="right">
          
            <InputText placeholder="Search" value={search} onChange={onSearch} />
          </IconField>

          <Dropdown
            value={status}
            options={STATUS_OPTIONS}
            onChange={(e) => {
              setStatus(e.value || "");
              setPage(1);
            }}
            placeholder="Status"
            className="w-40"
          />
          <Dropdown
            value={paymentStatus}
            options={PAYMENT_STATUS_OPTIONS}
            onChange={(e) => {
              setPaymentStatus(e.value || "");
              setPage(1);
            }}
            placeholder="Payment"
            className="w-44"
          />

          <Button
            text
            icon="pi pi-refresh"
            onClick={() => fetchData()}
            tooltip="Refresh"
            tooltipOptions={{ position: "top" }}
          />
        </div>
      </div>

      {/* ------------------- Embedded Refund Dashboard ------------------- */}
      <div className="mb-6">
        <div className="grid gap-3 md:grid-cols-4">
          <KpiCard title="Total Refunded" value={`₨ ${formatMoney(stats.totalRefunded)}`} />
          <KpiCard title="Refund Rate" value={`${stats.refundRate.toFixed(2)}%`} hint="(Refunded / Invoiced)" />
          <KpiCard title="Credits" value={stats.creditsCount} hint={`Avg ₨ ${formatMoney(stats.avgCredit)}`} />
          <KpiCard title="Remaining (on page)" value={`₨ ${formatMoney(stats.totalRemaining)}`} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Breakdown title="By Credit Type" items={stats.byType} emptyText="No credits"  getSeverity={creditTypeSeverity} />
          <Breakdown title='By "Apply To"' items={stats.byApplyTo} emptyText="No credits"   getSeverity={applyToSeverity} />
        </div>

        <div className="mt-4 rounded-xl border p-3">
          <div className="mb-2 text-sm font-semibold">Recent Credits</div>
          {stats.recent.length === 0 ? (
            <div className="text-sm text-surface-500">No credits on current view.</div>
          ) : (
            <ul className="divide-y">
              {stats.recent.slice(0, 6).map((r, idx) => (
                <li key={idx} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{r.referenceNumber}</div>
                    <div className="text-xs text-surface-500 truncate">
                      {r.invNumber} • {r.customerName || "-"} • {new Date(r.date).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Tag value={r.creditType} severity="info" />
                    <Tag value={r.applyTo} severity={r.applyTo === "Refund Now" ? "success" : "warning"} />
                    <div className="w-24 text-right text-sm font-medium">₨ {formatMoney(r.creditedAmount)}</div>
                    <Button
                      icon="pi pi-eye"
                      rounded
                      text
                      onClick={() => router.push(`/invoicing/invoice-batch/${r?.batchId}/invoice/${r?.invoiceId}`)}
                      tooltip="View invoice"
                      tooltipOptions={{ position: "top" }}
                    />
                    {/* NEW: quick refund from recent list */}
                    {/* <Button
                      icon="pi pi-undo"
                      rounded
                      text
                      tooltip="Refund"
                      tooltipOptions={{ position: "top" }}
                      onClick={() => {
                        const invoice = list.find((x) => x._id === r.invoiceId);
                        if (invoice) {
                          setSelectedInvoice(invoice);
                          setShowRefundModal(true);
                        }
                      }}
                    /> */}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* ----------------- /Embedded Refund Dashboard -------------------- */}

      {loading ? (
        <Loader />
      ) : (
        <>
          <TableComponent
            loading={loading}
            tableName="Invoices"
            columns={Columns}
            data={list}
            renderColumnBody={renderColumnsBody}
          />
          <Paginator
            first={(page - 1) * rows}
            rows={rows}
            totalRecords={totalRecords}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={onPageChange}
            template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
          />
        </>
      )}

      {/* NEW: Refund Modal hook-safe usage */}
      <RefundModal
        visible={showRefundModal}
        onHide={() => {
          setShowRefundModal(false);
          setSelectedInvoice(null);
          // Optional: refresh list after closing (if your modal actually created a credit)
          // fetchData();
        }}
        invoice={selectedInvoice}
        // Optional: if your RefundModal supports onSuccess callback, pass it:
        // onSuccess={() => { fetchData(); setShowRefundModal(false); setSelectedInvoice(null); }}
      />
    </div>
  );
}

// ---------------------- small inline UI bits ----------------------
function KpiCard({ title, value, hint }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs uppercase tracking-wide text-surface-500">{title}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-surface-500">{hint}</div> : null}
    </div>
  );
}

function Breakdown({ title, items, emptyText, getSeverity }) {
  const entries = Object.entries(items || {}).sort((a, b) => b[1] - a[1]);
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm font-semibold mb-2">{title}</div>
      {entries.length === 0 ? (
        <div className="text-sm text-surface-500">{emptyText}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {entries.map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
              <span className="truncate max-w-[10rem]">{k}</span>
              {/* NEW: dynamic severity for the amount tag, based on the key */}
              <Tag value={`₨ ${formatMoney(v)}`} severity={getSeverity ? getSeverity(k) : "secondary"} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

