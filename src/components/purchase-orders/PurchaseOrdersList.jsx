"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";

import apiServices from "@/services/apiService";
import useDebounce from "@/hooks/useDebounce";
import DeleteModel from "@/components/common/DeleteModel/DeleteModel";
import { openDeleteModal } from "@/store/deleteModalSlice";
import TableComponent from "@/components/common/table/TableComponent";

// ⬇️ modal
import SendPoModal from "./SendPoModal";

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Draft", value: "Draft" },
  { label: "Pending", value: "Submitted" }, // API value = Submitted
  { label: "Approved", value: "Approved" },
  { label: "Partially Received", value: "PartiallyReceived" },
  { label: "Completed", value: "FullyReceived" },
  { label: "Cancelled", value: "Cancelled" },
];

const statusTag = (s) => {
  switch (s) {
    case "Draft": return { value: "Draft", severity: "info" };
    case "Submitted": return { value: "Pending", severity: "warning" };
    case "Approved": return { value: "Approved", severity: "info" };
    case "PartiallyReceived": return { value: "Partially Rec.", severity: "warning" };
    case "FullyReceived": return { value: "Completed", severity: "success" };
    case "Cancelled": return { value: "Cancelled", severity: "danger" };
    default: return { value: s || "—", severity: "info" };
  }
};

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("en-GB");
};
const fmtGBP = (n) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n) || 0);

const isOverdue = (po) => {
  if (!po?.deliveryDate) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(po.deliveryDate); due.setHours(0,0,0,0);
  return due < today && !["Cancelled","FullyReceived"].includes(po.status);
};

// ---- helpers for dates / query
const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
const ymd = (d) => {
  const x = new Date(d);
  const m = `${x.getMonth()+1}`.padStart(2,"0");
  const day = `${x.getDate()}`.padStart(2,"0");
  return `${x.getFullYear()}-${m}-${day}`;
};

export default function PurchaseOrdersList() {
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useRef(null);
  const { loadingModal } = useSelector((s) => s.delete);

  // data
  const [items, setItems] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // filters / paging
  const [status, setStatus] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 600);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);

  const [deleteId, setDeleteId] = useState(null);
  // send modal
  const [sendOpen, setSendOpen] = useState(false);
  const [sendPo, setSendPo] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  // per-row loading states
  const [rowLoading, setRowLoading] = useState({});
  const setLoadingFor = (id, key, val) =>
    setRowLoading((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: val } }));

  // suppliers (for filter)
  useEffect(() => {
    (async () => {
      try {
        const res = await apiServices.get(`/suppliers?q=&page=1&limit=200`);
        setSuppliers(res?.data?.data || []);
      } catch {
        setSuppliers([]);
      }
    })();
  }, []);

  const SupplierFilterOptions = useMemo(
    () => [{ label: "All Suppliers", value: "" }].concat(
      (suppliers || []).map((s) => ({ label: s.companyName, value: s._id }))
    ),
    [suppliers]
  );

  // --- Build query string robustly for backend variations
  const buildQueryString = () => {
    
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("limit", String(rows));

    if (debouncedSearch) qs.set("q", debouncedSearch);

   if (status) {
  qs.set("status", status);     // single
  qs.set("statuses", status);   // or CSV if you support multi-select later
}

    if (supplierId) {
      qs.set("supplierId", supplierId);
      // some backends expect `supplier`
      qs.set("supplier", supplierId);
    }

    // date range (normalize + send both iso + ymd in common keys)
    if (fromDate) {
      const s = startOfDay(fromDate);
      qs.set("from", s.toISOString());
      qs.set("fromDate", ymd(s));
      // alternates some APIs use
      qs.set("dateFrom", ymd(s));
      qs.set("createdFrom", s.toISOString());
    }
    if (toDate) {
      const e = endOfDay(toDate);
      qs.set("to", e.toISOString());
      qs.set("toDate", ymd(e));
      qs.set("dateTo", ymd(e));
      qs.set("createdTo", e.toISOString());
    }

    return qs.toString();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // swap if user selected reversed range
      let f = fromDate;
      let t = toDate;
      if (f && t && new Date(f) > new Date(t)) {
        f = toDate;
        t = fromDate;
      }

      const qs = buildQueryString();
      const res = await apiServices.get(`/purchase-orders?${qs}`);
      const result = res?.data;

      if (result?.success) {
        setItems(result.data || []);
        setTotalRecords(result.pagination?.total || 0);
      } else {
        throw new Error(result?.message || "Failed to load purchase orders");
      }
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err?.message || "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rows, debouncedSearch, status, supplierId, fromDate, toDate]);

  const onPageChange = (e) => {
    setPage(e.page + 1);
    setRows(e.rows);
  };

  // small icon button
  const IconBtn = ({
    outlined = true,
    tooltip,
    tooltipOptions,
    className = "",
    ...props
  }) => (
    <Button
      {...props}
      size="small"
      outlined={outlined}
      className={`!w-8 !h-8 !p-0 ${className}`}
      tooltip={tooltip}
      tooltipOptions={{ position: "top", ...(tooltipOptions || {}) }}
      aria-label={tooltip}
    />
  );

  const openSendForApproval = (po) => {
    setActiveRow(po);
    setSendPo(po);
    setSendOpen(true);
  };

  const withRowLoading = async (id, key, fn) => {
    setRowLoading((s) => ({ ...s, [id]: { ...(s[id] || {}), [key]: true } }));
    try {
      await fn();
      await fetchData();
    } finally {
      setRowLoading((s) => ({ ...s, [id]: { ...(s[id] || {}), [key]: false } }));
    }
  };

  const approvePo = (po) =>
    withRowLoading(po._id, "approve", async () => {
      await apiServices.post(`/purchase-orders/${po._id}/approve`);
      toast.current?.show({ severity: "success", summary: "Approved" });
    });

  const completePo = (po) =>
    withRowLoading(po._id, "receive", async () => {
      await apiServices.post(`/purchase-orders/${po._id}/complete`);
      toast.current?.show({ severity: "success", summary: "Purchase Order has been marked as received" });
    });

  const cancelPo = (po) =>
    withRowLoading(po._id, "cancel", async () => {
      await apiServices.post(`/purchase-orders/${po._id}/cancel`);
      toast.current?.show({ severity: "success", summary: "Cancelled" });
    });

  /* ---------------- TableComponent ---------------- */
  const Columns = {
    poNumber: "PO Number",
    suppliersId: "Supplier",
    orderDate: "Order Date",
    deliveryDate: "Delivery Date",
    status: "Status",
    grandTotal: "Total",
    action: "Actions",
  };

  const renderColumnsBody = (field, item) => {
    switch (field) {
      case "poNumber":
        return (
          <Button
            size="small"
            label={item.poNumber || "—"}
            link
            onClick={() => router.push(`/purchasing/purchase-order-list/view/${item._id}`)}
          />
        );
      case "suppliersId":
        return item?.supplierId?.companyName;
      case "orderDate":
        return fmtDate(item.createdAt);
      case "deliveryDate":
        return (
          <div className="flex items-center gap-2">
            <span>{fmtDate(item.deliveryDate)}</span>
            {isOverdue(item) && <Tag value="OVERDUE" severity="danger" />}
          </div>
        );
      case "status": {
        const t = statusTag(item.status);
        return <Tag value={t.value} severity={t.severity} />;
      }
      case "grandTotal":
        return <span className="font-medium">{fmtGBP(item.grandTotal)}</span>;
      case "action":
        return (
          <div className="flex items-center gap-2 justify-end">
            <IconBtn
              icon="pi pi-eye"
              tooltip="View"
              onClick={() => router.push(`/purchasing/purchase-order-list/view/${item._id}`)}
            />
            {!["Cancelled", "FullyReceived"].includes(item.status) && (
              <>
                {!["Approved", "FullyReceived"].includes(item.status) && (
                  <Link href={`/purchasing/purchase-order-list/update/${item._id}`} legacyBehavior>
                    <a><IconBtn icon="pi pi-pencil" tooltip="Edit" /></a>
                  </Link>
                )}
                {item.status === "Draft" && (
                  <IconBtn
                    icon="pi pi-envelope"
                    severity="info"
                    outlined={false}
                    tooltip="Send for Approval"
                    onClick={() => openSendForApproval(item)}
                  />
                )}
                {!["Approved", "FullyReceived", "Draft"].includes(item.status) && (
                  <IconBtn
                    icon="pi pi-check"
                    severity="success"
                    outlined={false}
                    tooltip="Approve"
                    loading={!!rowLoading[item._id]?.approve}
                    onClick={() => approvePo(item)}
                  />
                )}
                {item.status === "Approved" && (
                  <IconBtn
                    icon="pi pi-box"
                    severity="success"
                    outlined={false}
                    tooltip="Receive Goods"
                    loading={!!rowLoading[item._id]?.receive}
                    onClick={() => completePo(item)}
                  />
                )}
                <IconBtn
                  icon="pi pi-times"
                  severity="danger"
                  outlined={false}
                  tooltip="Cancel"
                  loading={!!rowLoading[item._id]?.cancel}
                  onClick={() => cancelPo(item)}
                />
              </>
            )}
          </div>
        );
      default:
        return item[field];
    }
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <DeleteModel
        handleDeleteLocallay={() => setItems((prev) => prev.filter((x) => x._id !== deleteId))}
      />

      {/* Send modal */}
      <SendPoModal
        visible={sendOpen}
        onHide={() => setSendOpen(false)}
        po={sendPo}
        fetchPO={fetchData}
        org={{
          name: "Renttix Ltd",
          addressLines: [
            "123 Business Park",
            "London, SW1A 1AA",
            "Tel: 020 7123 4567",
            "Email: purchasing@renttix.com",
          ],
          vat: "GB123456789",
        }}
        onSent={() => {
          setSendOpen(false);
          fetchData();
        }}
      />

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Purchase Orders</h2>
        <Link href={"/purchasing/create-purchase-order"}>
          <Button icon="pi pi-plus" label="New Purchase Order" />
        </Link>
      </div>

      {/* Filters row */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
    <Dropdown
  className="w-full"
  value={status}
  options={STATUS_OPTIONS}
  optionLabel="label"
  optionValue="value"              // ✅ value is a string, not the whole object
  showClear
  onChange={(e) => {               // ✅ coerce null/undefined to ""
    setPage(1);
    setStatus(e.value ?? "");
  }}
  onClear={() => {                 // ✅ clearing also means "All"
    setPage(1);
    setStatus("");
  }}
  placeholder="Status"
/>

        <Dropdown
          className="w-full"
          value={supplierId}
          options={SupplierFilterOptions}
          onChange={(e) => { setPage(1); setSupplierId(e.value); }}
          placeholder="Supplier"
          filter
        />
        <Calendar
          className="w-full"
          value={fromDate}
          onChange={(e) => { setPage(1); setFromDate(e.value); }}
          placeholder="From: mm/dd/yyyy"
          showIcon
        />
        <Calendar
          className="w-full"
          value={toDate}
          onChange={(e) => { setPage(1); setToDate(e.value); }}
          placeholder="To: mm/dd/yyyy"
          showIcon
        />
        <div>
          <IconField iconPosition="left">
            <InputIcon className={`pi pi-search ${search ? "hidden" : ""}`} />
            <InputText
              placeholder="Search PO number or reference..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
          </IconField>
        </div>
      </div>

      <TableComponent
        loading={loading}
        tableName="Purchase Orders"
        columns={Columns}
        data={items}
        renderColumnBody={renderColumnsBody}
        key={`${status}|${supplierId}|${fromDate?.toString()||""}|${toDate?.toString()||""}|${page}|${rows}`} // nudge rerender on filter change
      />

      <Paginator
        className="mt-3"
        first={(page - 1) * rows}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={onPageChange}
        template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      />
    </div>
  );
}
