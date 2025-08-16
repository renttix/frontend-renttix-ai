"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";

import apiServices from "@/services/apiService";
import DeleteModel from "@/components/common/DeleteModel/DeleteModel";
import { useDispatch } from "react-redux";
import { openDeleteModal } from "@/store/deleteModalSlice";

export default function SuspensionView() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const toastRef = useRef(null);

  const id = params?.id || params?.suspensionId || ""; // support either route segment name

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await apiServices.get(`/suspension/${id}?include=items&itemsLimit=5`);
        setData(data?.data || null);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("Failed to load suspension");
        toastRef.current?.show({ severity: "error", summary: "Error", detail: "Failed to load suspension" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const counts = data?.counts || { orders: 0, customers: 0, depots: 0 };

  function formatDate(d) {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt) ? "—" : dt.toLocaleString();
  }

  function dateRangeText(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return "—";
    if (arr.length === 1) return arr[0];
    return `${arr[0]} → ${arr[1]}`;
  }

  function onDeleteClick() {
    setDeleting(true);
    dispatch(openDeleteModal());
  }

  async function doDelete() {
    try {
      await apiServices.delete(`/suspensions/${id}`);
      toastRef.current?.show({ severity: "success", summary: "Deleted", detail: "Suspension removed" });
      router.push("/suspensions");
    } catch (e) {
      console.error(e);
      toastRef.current?.show({ severity: "error", summary: "Error", detail: "Delete failed" });
    } finally {
      setDeleting(false);
    }
  }

  const TypeTag = useMemo(() => (
    <Tag value={data?.type || "—"} className="text-base" />
  ), [data?.type]);

  return (
    <div className="p-4 md:p-6">
      <Toast ref={toastRef} />

      {/* Top bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Button icon="pi pi-arrow-left" label="Back" text onClick={() => router.back()} />
        </div>
        {/* <div className="flex items-center gap-2">
          <Link href={`/suspensions/update/${id}`}>
            <Button icon="pi pi-pencil" label="Edit" />
          </Link>
          <Button icon="pi pi-trash" label="Delete" severity="danger" outlined onClick={onDeleteClick} />
        </div> */}
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-surface-200 bg-white shadow-sm p-5 mb-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton width="16rem" height="2rem" />
            <Skeleton width="32rem" height="1.2rem" />
            <div className="flex gap-2 mt-2">
              <Skeleton width="6rem" height="2rem" />
              <Skeleton width="10rem" height="2rem" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              {TypeTag}
              <span className="text-xs text-surface-500">ID: {data?._id}</span>
            </div>
            <h1 className="text-2xl font-semibold leading-snug">{data?.reason || "—"}</h1>
            <p className="text-surface-600 max-w-3xl">{data?.description || "—"}</p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div>
                <span className="text-sm text-surface-500">Date Range</span>
                <div className="font-medium">{formatDate(data?.dateRange[0])} - {formatDate(data?.dateRange[1])}</div>
              </div>
              <div>
                <span className="text-sm text-surface-500">Created</span>
                <div className="font-medium">{formatDate(data?.createdAt)}</div>
              </div>
              <div>
                <span className="text-sm text-surface-500">Updated</span>
                <div className="font-medium">{formatDate(data?.updatedAt)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Orders", value: counts.orders, icon: "pi-shopping-bag" },
          { label: "Customers", value: counts.customers, icon: "pi-users" },
          { label: "Depots", value: counts.depots, icon: "pi-building" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-surface-200 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-surface-500">{s.label}</div>
                <div className="text-3xl font-semibold">{loading ? <Skeleton width="5rem" height="2.2rem" /> : s.value ?? 0}</div>
              </div>
              <i className={`pi ${s.icon} text-2xl opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      {/* Previews */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders */}
        <div className="rounded-2xl border border-surface-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Tag value={counts.orders ?? 0} />
          </div>
          {loading ? (
            <Skeleton width="100%" height="8rem" />
          ) : (
            <DataTable value={data?.ordersPreview || []} size="small" emptyMessage="No orders">
              <Column field="orderId" header="Order ID" body={(r) => r?.orderId || "—"} />
              <Column field="orderDate" header="Date" body={(r) => formatDate(r?.orderDate)} />
              <Column field="status" header="Status" body={(r) => <Tag value={r?.status || "—"} /> } />
              <Column
                header="Action"
                body={(r) => (
                  <div className="flex justify-end">
                    <Link href={`/order/${r?._id || ""}`}>
                      <Button icon="pi pi-eye" rounded text />
                    </Link>
                  </div>
                )}
              />
            </DataTable>
          )}
        </div>

        {/* Customers */}
        <div className="rounded-2xl border border-surface-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Affected Customers</h2>
            <Tag value={counts.customers ?? 0} severity="info" />
          </div>
          {loading ? (
            <Skeleton width="100%" height="8rem" />
          ) : (
            <DataTable value={data?.customersPreview || []} size="small" emptyMessage="No customers">
              <Column header="Name" body={(r) => r?.companyName || r?.name || "—"} />
              <Column field="email" header="Email" />
              <Column header="Status" body={(r) => <Tag value={r?.active || "—"} /> } />
              <Column
                header="Action"
                body={(r) => (
                  <div className="flex justify-end">
                    <Link href={`/customer/360/${r?._id || ""}`}>
                      <Button icon="pi pi-eye" rounded text />
                    </Link>
                  </div>
                )}
              />
            </DataTable>
          )}
        </div>

        {/* Depots */}
        <div className="rounded-2xl border border-surface-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Depots</h2>
            <Tag value={counts.depots ?? 0} severity="secondary" />
          </div>
          {loading ? (
            <Skeleton width="100%" height="8rem" />
          ) : (
            <DataTable value={data?.depotsPreview || []} size="small" emptyMessage="No depots">
              <Column field="name" header="Name" />
              <Column field="code" header="Code" />
              <Column field="city" header="City" />
              <Column
                header="Action"
                body={(r) => (
                  <div className="flex justify-end">
                    <Link href={`/system-setup/depots/detail/${r?._id || ""}`}>
                      <Button icon="pi pi-eye" rounded text />
                    </Link>
                  </div>
                )}
              />
            </DataTable>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <DeleteModel onDelete={doDelete} />
    </div>
  );
}
