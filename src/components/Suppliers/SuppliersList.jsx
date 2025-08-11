"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { Toast } from "primereact/toast";

import apiServices from "@/services/apiService";
import useDebounce from "@/hooks/useDebounce";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import DeleteModel from "@/components/common/DeleteModel/DeleteModel";
import { openDeleteModal } from "@/store/deleteModalSlice";
import TableComponent from "@/components/common/table/TableComponent";

export default function SuppliersList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);           // ⬅️ NEW
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [supplierId, setSupplierId] = useState(null);

  const debouncedSearch = useDebounce(search, 800);
  const dispatch = useDispatch();
  const router = useRouter();
  const toast = useRef();
  const { loadingModal } = useSelector((state) => state.delete);

  const formatAddress = (a = {}) => {
    const parts = [a.addressLine1, a.city, a.postcode].filter(Boolean);
    return parts.join(", ");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiServices.get(
        `/suppliers?q=${encodeURIComponent(debouncedSearch || "")}&page=${page}&limit=${rows}`
      );
      const result = res.data;
      if (result?.success) {
        setSuppliers(result.data || []);
        setTotalRecords(result.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      toast.current?.show({
        severity: "error",
        summary: "Failed",
        detail: "Could not load suppliers.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rows, debouncedSearch]);

  const onSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const onPageChange = (event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  };

  // 🔄 Sync QuickBooks Vendors <-> Local Suppliers
  const handleSyncSuppliers = async () => {
    setSyncing(true);
    try {
      const res = await apiServices.post(`/integrations/qbo/suppliers/sync`);
      const stats = res?.data?.stats || {};
      toast.current?.show({
        severity: "success",
        summary: "Sync complete",
        detail: `Pulled: ${stats.pulled ?? 0}, Created: ${stats.created ?? 0}, Updated: ${stats.updated ?? 0}, Pushed: ${stats.pushed ?? 0}${stats.pushErrors ? `, Errors: ${stats.pushErrors}` : ""}`,
        life: 6000,
      });
      // refresh list after sync
      setPage(1);
      await fetchData();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Sync failed.";
      toast.current?.show({ severity: "error", summary: "Sync failed", detail: msg, life: 6000 });
    } finally {
      setSyncing(false);
    }
  };

  // Columns mapping for TableComponent
  const Columns = {
    companyName: "Supplier Name",
    contactName: "Contact",
    email: "Email",
    phone: "Phone",
    companyNumber: "Company No.",
    taxNumber: "Tax No.",
    address: "Address",
    action: "Actions",
  };

  const renderColumnsBody = (field, item) => {
    switch (field) {
      case "companyName":
        return (
          <Button
            size="small"
            label={item.companyName}
            link
            onClick={() => router.push(`/purchasing/suppliers/update/${item._id}`)}
          />
        );
      case "address":
        return <span>{formatAddress(item.address)}</span>;
      case "action":
        return (
          <div className="flex items-center gap-3">
            <Link href={`/purchasing/suppliers/update/${item._id}`}>
              <i className="pi pi-pen-to-square text-primary" />
            </Link>
            <i
              className="pi pi-trash text-red cursor-pointer"
              onClick={() => {
                setSupplierId(item._id);
                dispatch(
                  openDeleteModal({
                    id: item._id,
                    route: "/suppliers",
                    redirect: "/purchasing/suppliers",
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
      <GoPrevious route={"/purchases/"} />
      <DeleteModel
        handleDeleteLocallay={() =>
          setSuppliers((prev) => prev.filter((x) => x._id !== supplierId))
        }
      />
      <Toast ref={toast} />

      <div className="mb-5 flex justify-between pb-4">
        <div className="flex items-center gap-2">
          <label className="text-[20px] font-semibold text-dark-2 dark:text-white">
            Suppliers
          </label>
          <Badge value={suppliers?.length || 0} size="small" severity="warning" />
        </div>

        <div className="flex items-center gap-3">
          {/* 🔍 search */}
          <IconField iconPosition="right">
            <InputIcon
              className="pi pi-search"
              style={{ display: search ? "none" : "inline-block" }}
            />
            <InputText placeholder="Search" value={search} onChange={onSearch} />
          </IconField>

          {/* 🔄 sync with QuickBooks */}
          <Button
            type="button"
            icon="pi pi-refresh"
            label="Sync Suppliers"
            outlined
            loading={syncing}
            disabled={syncing}
            onClick={handleSyncSuppliers}
            tooltip="Pull from QuickBooks and push missing local suppliers"
            tooltipOptions={{ position: "top" }}
          />

          {/* ➕ add supplier */}
          <Link href={"/purchasing/suppliers/add"}>
            <Button>Add Supplier</Button>
          </Link>
        </div>
      </div>

      <TableComponent
        loading={loading}
        tableName="Suppliers"
        columns={Columns}
        data={suppliers}
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
    </div>
  );
}
