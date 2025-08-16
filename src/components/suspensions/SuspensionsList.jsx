"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Column } from "primereact/column";

import apiServices from "@/services/apiService";
import useDebounce from "@/hooks/useDebounce";
import DeleteModel from "@/components/common/DeleteModel/DeleteModel";
import { openDeleteModal } from "@/store/deleteModalSlice";
import TableComponent from "@/components/common/table/TableComponent";

// Type options from your Suspension schema
const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Depot", value: "Depot" },
  { label: "Account", value: "Account" },
  { label: "Order", value: "Order" },
 
];

export default function SuspensionsList() {
  const router = useRouter();
  const dispatch = useDispatch();
  const toastRef = useRef(null);

  // Table + query state
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0); // 0-indexed for Paginator
  const [rows, setRows] = useState(10);

  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 400);
  const [type, setType] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Optional createdAt filter
  const [createdFrom, setCreatedFrom] = useState(null);
  const [createdTo, setCreatedTo] = useState(null);

  // Delete modal state
  const [deletingId, setDeletingId] = useState(null);

  // Column body templates (TableComponent expects <Column> children)
function reasonBody(row) {
  return (
    <div className="max-w-[320px] truncate" title={row?.reason || ""}>
      {row?.reason || "—"}
    </div>
  );
}

function typeBody(row) {
  return <Tag value={row?.type || "—"} />;
}

function renderColumnBody(field, row) {
  switch (field) {
    case "reason": return reasonBody(row);
    case "type": return typeBody(row);
    case "description": return descriptionBody(row);
    case "dateRange": return dateRangeBody(row);
    case "counts": return usageBody(row);
    case "createdAt": return createdAtBody(row);
    case "action": return actionBody(row);
    default: return row?.[field] ?? "—";
  }
}

function descriptionBody(row) {
  return (
    <div className="max-w-[480px] truncate text-surface-600" title={row?.description || ""}>
      {row?.description || "—"}
    </div>
  );
}
 function formatDate(d) {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt) ? "—" : dt.toLocaleString();
  }
function dateRangeBody(row) {
  const dr = Array.isArray(row?.dateRange) ? row.dateRange.join(" → ") : "—";
  return <span className="text-surface-600">{formatDate(row?.dateRange[0])} - {formatDate(row?.dateRange[1])}</span>;
}

function usageBody(row) {
  return (
    <div className="flex items-center gap-2">
     {row?.counts?.orders>0 &&  <Tag severity="primary" value={`Orders: ${row?.counts?.orders ?? 0}`} />}
    {row?.counts?.customers>0 &&   <Tag severity="warning" value={`Customers: ${row?.counts?.customers ?? 0}`} />}
      {row?.counts?.depots>0 && <Tag severity="info" value={`Depots: ${row?.counts?.depots ?? 0}`} />}
    </div>
  );
}

function createdAtBody(row) {
  const d = row?.createdAt ? new Date(row.createdAt) : null;
  return <span>{d ? d.toLocaleDateString() : "—"}</span>;
}

function actionBody(row) {
  return (
    <div className="flex items-center gap-2 justify-end">
      {/* View */}
      <Button
        icon="pi pi-eye"
        rounded
        text
        onClick={() => router.push(`/suspensions/view/${row._id}`)}
      />

      
      {/* <Link href={`/suspensions/update/${row._id}`}>
        <Button icon="pi pi-pencil" label="Edit" outlined />
      </Link>

    
      <Button
        icon="pi pi-trash"
        severity="danger"
        outlined
        onClick={() => confirmDelete(row._id)}
      /> */}
    </div>
  );
}
const columnsConfig = {
  reason: 'Reason',
  type: 'Type',
  description: 'Description',
  dateRange: 'Date Range',
  counts: 'Usage',
  createdAt: 'Created',
  action: 'Action',
};


  function confirmDelete(id) {
    setDeletingId(id);
    dispatch(openDeleteModal());
  }

  async function doDelete() {
    if (!deletingId) return;
    try {
      await apiServices.delete(`/suspensions/${deletingId}`);
      toastRef.current?.show({ severity: "success", summary: "Deleted", detail: "Suspension removed" });
      // reload current page
      fetchData();
    } catch (e) {
      console.error(e);
      toastRef.current?.show({ severity: "error", summary: "Error", detail: "Failed to delete" });
    } finally {
      setDeletingId(null);
    }
  }

  function onPageChange(e) {
    setPage(e.page);
    setRows(e.rows);
  }

  function onSort(field) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  function buildQuery() {
    const params = new URLSearchParams();
    params.set("page", String(page + 1));
    params.set("limit", String(rows));
    params.set("include", "counts");
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    if (debouncedQ) params.set("q", debouncedQ);
    if (type) params.set("type", type);
    if (createdFrom) params.set("createdFrom", createdFrom.toISOString());
    if (createdTo) params.set("createdTo", createdTo.toISOString());
    return params.toString();
  }

  async function fetchData() {
    setLoading(true);
    try {
      const qs = buildQuery();
      const { data } = await apiServices.get(`/suspension?${qs}`);
      setItems(data?.data || []);
      setTotal(data?.total || 0);
    } catch (e) {
      console.error(e);
      toastRef.current?.show({ severity: "error", summary: "Error", detail: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  }

  // Load on first mount and when filters change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, type, page, rows, sortBy, sortOrder, createdFrom, createdTo]);

  // Export CSV
  function exportCSV() {
    const headers = [
      "Reason",
      "Type",
      "Description",
      "DateRange",
      "Orders",
      "Customers",
      "Depots",
      "CreatedAt",
    ];

    const lines = items.map((r) => [
      sanitize(r?.reason),
      sanitize(r?.type),
      sanitize(r?.description),
      sanitize(Array.isArray(r?.dateRange) ?formatDate(r?.dateRange[0]) +"-"+ formatDate(r?.dateRange[1]): ""),
      r?.counts?.orders ?? 0,
      r?.counts?.customers ?? 0,
      r?.counts?.depots ?? 0,
      r?.createdAt ? new Date(r.createdAt).toISOString() : "",
    ]);

    const csv = [headers.join(","), ...lines.map((row) => row.map(csvEscape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suspensions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function sanitize(v) {
    return (v ?? "").toString();
  }
  function csvEscape(v) {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes("\n") || s.includes('"')) {
      return '"' + s.replaceAll('"', '""') + '"';
    }
    return s;
  }

  return (
    <div className="p-4 md:p-6">
      <Toast ref={toastRef} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Suspensions</h1>
        <div className="flex items-center gap-2">
          <Button icon="pi pi-upload" label="Export CSV" onClick={exportCSV} outlined />
          <Link href="/suspensions">
            <Button icon="pi pi-plus" label="New Suspension" />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={q}
            onChange={(e) => {
              setPage(0); // reset paging on filter
              setQ(e.target.value);
            }}
            placeholder="Search reason/description"
            className="w-full"
          />
        </IconField>

        <Dropdown
          value={type}
          options={TYPE_OPTIONS}
          onChange={(e) => {
            setPage(0);
            setType(e.value);
          }}
          placeholder="Filter by Type"
          className="w-full"
        />

        <Calendar
          value={createdFrom}
          onChange={(e) => {
            setPage(0);
            setCreatedFrom(e.value);
          }}
          placeholder="Created From"
          showIcon
          className="w-full"
        />

        <Calendar
          value={createdTo}
          onChange={(e) => {
            setPage(0);
            setCreatedTo(e.value);
          }}
          placeholder="Created To"
          showIcon
          className="w-full"
        />
      </div>

      {/* Sort row */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-sm text-surface-600">Sort by:</span>
        <div className="flex items-center gap-2">
          {[
            { key: "createdAt", label: "Created" },
            { key: "type", label: "Type" },
            { key: "reason", label: "Reason" },
          ].map((opt) => (
            <Button
              key={opt.key}
              size="small"
              label={`${opt.label}${sortBy === opt.key ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}`}
              outlined={sortBy !== opt.key}
              onClick={() => onSort(opt.key)}
            />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
   <TableComponent
  columns={columnsConfig}
  data={items}
  loading={loading}
  dataKey="_id"
  renderColumnBody={renderColumnBody}
/>
      </div>

      {/* Pagination */}
      <div className="mt-3">
        <Paginator
          first={page * rows}
          rows={rows}
          totalRecords={total}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onPageChange={onPageChange}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModel
        onDelete={doDelete}
        // Your DeleteModel likely hooks into Redux open/close via openDeleteModal
      />
    </div>
  );
}
