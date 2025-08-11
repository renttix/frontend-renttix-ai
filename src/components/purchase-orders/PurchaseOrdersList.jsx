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

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Draft", value: "Draft" },
  { label: "Pending", value: "Submitted" },
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

  // supplier filter options
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(page));
      qs.set("limit", String(rows));
      if (debouncedSearch) qs.set("q", debouncedSearch);
      if (status) qs.set("status", status);
      if (supplierId) qs.set("supplierId", supplierId); // controller can add filter later
      if (fromDate) qs.set("from", new Date(fromDate).toISOString());
      if (toDate) qs.set("to", new Date(toDate).toISOString());

      const res = await apiServices.get(`/purchase-orders?${qs.toString()}`);
      const result = res?.data;
      if (result?.success) {
        setItems(result.data || []);
        setTotalRecords(result.pagination?.total || 0);
      } else {
        throw new Error(result?.message || "Failed to load purchase orders");
      }
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err.message });
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

  /* ---------------- TableComponent ---------------- */
  const Columns = {
    poNumber: "PO Number",
    supplier: "Supplier",
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
          onClick={() =>
            router.push(`/purchases/purchase-orders/view/${item._id}`)
          }
        />
      );

    case "supplier":
      return item.supplier?.companyName || item.supplierName || "—";

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
          <Button
            icon="pi pi-eye"
            rounded
            text
            onClick={() =>
              router.push(`/purchases/purchase-orders/view/${item._id}`)
            }
          />
          <Button
            icon="pi pi-pen-to-square"
            rounded
            text
            onClick={() =>
              router.push(`/purchases/purchase-orders/update/${item._id}`)
            }
            disabled={
              item.status === "Cancelled" || item.status === "FullyReceived"
            }
          />
          <Button
            icon="pi pi-times"
            rounded
            text
            severity="danger"
            onClick={() => {
              setDeleteId(item._id);
              dispatch(
                openDeleteModal({
                  id: item._id,
                  route: "/purchase-orders",
                  redirect: "/purchases/purchase-orders",
                })
              );
            }}
          />
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
        handleDeleteLocallay={() =>
          setItems((prev) => prev.filter((x) => x._id !== deleteId))
        }
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
          onChange={(e) => {
            setPage(1);
            setStatus(e.value);
          }}
        />
        <Dropdown
          className="w-full"
          value={supplierId}
          options={SupplierFilterOptions}
          onChange={(e) => {
            setPage(1);
            setSupplierId(e.value);
          }}
          filter
        />
        <Calendar
          className="w-full"
          value={fromDate}
          onChange={(e) => {
            setPage(1);
            setFromDate(e.value);
          }}
          placeholder="mm / dd / yyyy"
          showIcon
        />
        <Calendar
          className="w-full"
          value={toDate}
          onChange={(e) => {
            setPage(1);
            setToDate(e.value);
          }}
          placeholder="mm / dd / yyyy"
          showIcon
        />
     <div className="">
           <IconField iconPosition="right">
          {/* keep InputIcon mounted to avoid cloneElement(null) */}
          <InputIcon className={`pi pi-search ${search ? "hidden" : ""}`} />
          <InputText
            placeholder="Search PO number or reference..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
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
      />

      <Paginator
        className="mt-3"
        first={(page - 1) * rows}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={(e) => {
          setPage(e.page + 1);
          setRows(e.rows);
        }}
        template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      />
    </div>
  );
}
