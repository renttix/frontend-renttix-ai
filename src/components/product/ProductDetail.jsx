"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import Link from "next/link";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { ProgressBar } from "primereact/progressbar";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { imageBaseURL } from "../../../utils/baseUrl";

export default function ProductDetail() {
  const { token, user } = useSelector((s) => s?.authReducer || {});
  const BaseURL = process.env.NEXT_PUBLIC_API_URL;
  const params = useParams();
  const router = useRouter();
  const toast = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [assetQuery, setAssetQuery] = useState("");

  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${BaseURL}/product/product/${params.id}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res?.data?.success) {
        setProduct(res.data.product);
      } else {
        setError("Failed to load product.");
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!params?.id || !token) return;
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id, token]);

  const counts = useMemo(() => {
    const total = product?.totalQuantity || product?.assetNumbers?.length || 0;
    const rented = product?.rented ?? product?.assetNumbers?.filter(a => a.status === "rented").length ?? 0;
    const available = Math.max(0, total - rented);
    const utilization = total ? Math.round((rented / total) * 100) : 0;
    const byStatus = (product?.assetNumbers || []).reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});
    return { total, rented, available, utilization, byStatus };
  }, [product]);

  const filteredAssets = useMemo(() => {
    let list = product?.assetNumbers || [];
    if (statusFilter !== "all") list = list.filter(a => a.status === statusFilter);
    if (assetQuery) list = list.filter(a => a.number?.toLowerCase().includes(assetQuery.toLowerCase()));
    return list;
  }, [product, statusFilter, assetQuery]);

  const imgSrc = useMemo(() => {
    const first = product?.images?.[0];
    if (!first) return null;
    if (first.startsWith("http") || first.startsWith("blob:")) return first;
    return `${imageBaseURL}${first}`;
  }, [product]);

  const statusSeverity = (s) => (s === "Rental" ? "success" : s === "Sale" ? "info" : "secondary");

  const assetSeverity = (s) => {
    switch (s) {
      case "available": return "success";
      case "rented": return "warning";
      case "maintenance": return "danger";
      case "reserved": return "info";
      default: return "secondary";
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(product?._id);
      toast.current.show({ severity: "info", summary: "Copied", detail: "Product ID copied" });
    } catch {}
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 h-72 rounded-2xl bg-gray-200 dark:bg-dark-3" />
          <div className="h-72 rounded-2xl bg-gray-200 dark:bg-dark-3" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-dark-3" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-500 dark:bg-red-900/20">
          {error}
        </div>
        <div className="mt-4"><Button onClick={fetchProduct} icon="pi pi-refresh" label="Retry" /></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="p-4 sm:p-6">
      <Toast ref={toast} position="top-right" />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-dark dark:text-white">{product.productName}</h1>
            <Tag value={product.status} severity={statusSeverity(product.status)} rounded />
            {product.isActive === "Active" ? (
              <Badge value="Active" severity="success" />
            ) : (
              <Badge value="Inactive" severity="danger" />
            )}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium">{product.companyProductName}</span> · {product.category?.name} / {product.subCategory?.name}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">ID: {product._id} <button onClick={copyId} className="underline hover:opacity-80">copy</button></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button label="Edit" icon="pi pi-pencil" onClick={() => router.push(`/product//${product._id}`)} outlined />
        </div>
      </div>

      {/* Top section */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left: image & description */}
        <div className="md:col-span-2 rounded-2xl border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-xl bg-[#fafafa] dark:bg-dark-2">
                {imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgSrc} alt={product.productName} className="h-72 w-full object-cover" />
                ) : (
                  <div className="flex h-72 w-full items-center justify-center text-gray-400">No image</div>
                )}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  {(product.images || []).slice(0, 3).map((src, i) => {
                    console.log(`${imageBaseURL}${src}`)
                    // eslint-disable-next-line @next/next/no-img-element
                  return  <img key={i} src={`${imageBaseURL}${src}`} alt="thumb" className={`h-12 w-12 rounded-md border object-cover ${i ? "opacity-80" : ""}`} />
})}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">Depot</div>
                <div className="text-base">{product.depots || "—"}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-dark-2">
                <div className="text-sm">Rental price</div>
                <div className="text-2xl font-extrabold">{user?.currencyKey}{product.rentPrice}</div>
                <div className="text-xs text-gray-500">per {product.rate || "day"}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-dark-2">
                <div className="mb-2 text-sm font-semibold">Tax Class</div>
                <div className="text-sm">{product?.taxClass?.name} <span className="text-xs text-gray-500">({product?.taxClass?.taxRate}% rate)</span></div>
              </div>
            </div>
          </div>

          <div className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-700 dark:text-gray-200">{product.productDescription || "No description provided."}</div>
        </div>

        {/* Right: stats */}
        <div className="rounded-2xl border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <div className="grid grid-cols-2 gap-3">
            <Stat title="Total" value={counts.total} />
            <Stat title="Rented" value={counts.rented} />
            <Stat title="Available" value={counts.available} />
            <div className="col-span-2">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold">Utilization</span>
                <span>{counts.utilization}%</span>
              </div>
              <ProgressBar value={counts.utilization} showValue={false} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(counts.byStatus || {}).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-dark-2">
                <span className="capitalize">{k}</span>
                <Tag value={v} severity={assetSeverity(k)} rounded />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.barcodeEnabled ? (
              <Tag value={`Barcode: ${product.barcodeType || "—"}`} severity="info" />
            ) : (
              <Tag value="Barcode disabled" severity="secondary" />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 rounded-2xl border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <TabView>
          <TabPanel header="Overview" leftIcon="pi pi-info-circle mr-2">
            <OverviewPanel product={product} />
          </TabPanel>

          <TabPanel header={`Assets (${filteredAssets.length})`} leftIcon="pi pi-box mr-2">
            <AssetsPanel
              items={filteredAssets}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              assetQuery={assetQuery}
              setAssetQuery={setAssetQuery}
            />
          </TabPanel>

          <TabPanel header="Rate Definition" leftIcon="pi pi-percentage mr-2">
            <RatePanel rateDefinition={product.rateDefinition} />
          </TabPanel>

          <TabPanel header="Maintenance" leftIcon="pi pi-wrench mr-2">
            <MaintenancePanel product={product} />
          </TabPanel>

          <TabPanel header="Damage Waiver" leftIcon="pi pi-shield mr-2">
            <DamageWaiverPanel product={product} />
          </TabPanel>

          <TabPanel header={`Attachments (${product.attachments?.length || 0})`} leftIcon="pi pi-paperclip mr-2">
            <AttachmentsPanel attachments={product.attachments || []} />
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-xl border border-stroke p-3 dark:border-dark-3">
      <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-xl font-extrabold">{value}</div>
    </div>
  );
}

function OverviewPanel({ product }) {
  const Row = ({ label, children }) => (
    <div className="grid grid-cols-12 gap-2 py-2">
      <div className="col-span-12 text-xs font-semibold text-gray-500 sm:col-span-4">{label}</div>
      <div className="col-span-12 sm:col-span-8">{children}</div>
    </div>
  );

  return (
    <div className="text-sm">
      <Row label="Vendor ID">{product.vendorId}</Row>
      <Row label="Depot">{product.depots || "—"}</Row>
      <Row label="Created">
        {formatDate(product.createdAt)}
      </Row>
      <Row label="Updated">{formatDate(product.updatedAt)}</Row>
      <Row label="Weight / Unit">{product.weight ? `${product.weight} ${product.weightUnit || "kg"}` : "—"}</Row>
      <Row label="Barcode">
        {product.barcodeEnabled ? `${product.barcodeType || "—"}` : "Disabled"}
      </Row>
      <Row label="Scan Count">{product.scanCount ?? 0}</Row>
    </div>
  );
}

function AssetsPanel({ items, statusFilter, setStatusFilter, assetQuery, setAssetQuery }) {
  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Available", value: "available" },
    { label: "Rented", value: "rented" },
    { label: "Maintenance", value: "maintenance" },
    { label: "Reserved", value: "reserved" },
  ];

  const locationTemplate = (row) => {
    const loc = row.location || {};
    const parts = [loc.current];
    if (loc.customerId) parts.push(`cust:${loc.customerId.slice(-4)}`);
    if (loc.orderId) parts.push(`ord:${loc.orderId.slice(-4)}`);
    return <span className="text-xs text-gray-600 dark:text-gray-300">{parts.filter(Boolean).join(" · ")}</span>;
  };

  const statusBody = (row) => <Tag value={row.status} severity={row.status === "available" ? "success" : row.status === "rented" ? "warning" : row.status === "maintenance" ? "danger" : "info"} rounded />;

  const inspectedBody = (row) => row?.condition?.lastInspected ? formatDate(row.condition.lastInspected) : "—";

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Dropdown value={statusFilter} onChange={(e) => setStatusFilter(e.value)} options={statusOptions} optionLabel="label" optionValue="value" />
          <span className="text-xs text-gray-500">Filter by status</span>
        </div>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText value={assetQuery} onChange={(e) => setAssetQuery(e.target.value)} placeholder="Search asset number..." />
        </span>
      </div>

      <DataTable value={items} paginator rows={10} stripedRows removableSort className="text-sm">
        <Column field="number" header="Asset #" sortable style={{ minWidth: 160 }} />
        <Column header="Status" body={statusBody} sortable style={{ width: 140 }} />
        <Column header="Location" body={locationTemplate} style={{ minWidth: 180 }} />
        <Column header="Rating" body={(r) => r?.condition?.rating ?? "—"} style={{ width: 100 }} />
        <Column header="Last Inspected" body={inspectedBody} style={{ width: 160 }} />
      </DataTable>
    </div>
  );
}

function RatePanel({ rateDefinition }) {
  if (!rateDefinition) return <div className="text-sm text-gray-500">No rate definition attached.</div>;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-stroke p-4 dark:border-dark-3">
        <div className="text-xs text-gray-500">Name</div>
        <div className="text-lg font-bold">{rateDefinition.name}</div>
      </div>
      <div className="rounded-xl border border-stroke p-4 dark:border-dark-3">
        <div className="text-xs text-gray-500">Type</div>
        <div className="text-lg font-semibold">{rateDefinition.rateType}</div>
      </div>
      <div className="rounded-xl border border-stroke p-4 dark:border-dark-3">
        <div className="text-xs text-gray-500">Min Rental Period</div>
        <div className="text-lg font-semibold">{rateDefinition.minimumRentalPeriod} days</div>
      </div>
      <div className="rounded-xl border border-stroke p-4 dark:border-dark-3">
        <div className="text-xs text-gray-500">Rental Days / Week</div>
        <div className="text-lg font-semibold">{rateDefinition.rentalDaysPerWeek}</div>
      </div>
      <div className="md:col-span-3 rounded-xl border border-stroke p-4 text-sm dark:border-dark-3">
        <div className="mb-2 text-xs font-semibold text-gray-500">Day Rates</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {(rateDefinition.dayRates || []).map((d, i) => (
            <div key={d._id || i} className="rounded-lg bg-gray-50 p-2 text-center text-xs dark:bg-dark-2">
              <div className="font-semibold">Day {i + 1}</div>
              <div className="mt-1">{d.active ? d.rate || "—" : <span className="opacity-60">inactive</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MaintenancePanel({ product }) {
  const cfg = product.maintenanceConfig || {};
  const def = product.defaultMaintenanceConfig || {};

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-stroke p-4 dark:border-dark-3">
        <div className="mb-2 text-base font-bold">Product Maintenance</div>
        <Info label="Requires Maintenance" value={cfg.requiresMaintenance ? "Yes" : "No"} />
        <Info label="Continues Until Termination" value={cfg.continuesUntilTermination ? "Yes" : "No"} />
        <Info label="Frequency / 7 days" value={cfg.frequencyPer7Days ?? "—"} />
        <Info label="One-off Required" value={cfg.oneOffServiceRequired ? "Yes" : "No"} />
        <Info label="Service Type" value={cfg.serviceType || "—"} />
        <Info label="Estimated Duration (min)" value={cfg.estimatedServiceDuration || "—"} />
      </div>

      <div className="rounded-xl border border-stroke p-4 dark:border-dark-3">
        <div className="mb-2 text-base font-bold">Default Schedule</div>
        <Info label="Enabled" value={def.enabled ? "Yes" : "No"} />
        <Info label="Freq Type" value={def.schedule?.frequency?.type || "—"} />
        <Info label="Week Days" value={(def.schedule?.frequency?.weekDays || []).join(", ") || "—"} />
        <Info label="Default Priority" value={def.serviceDetails?.defaultPriority || "—"} />
        <Info label="Task Types" value={(def.serviceDetails?.taskTypes || []).join(", ") || "—"} />
      </div>
    </div>
  );
}

function DamageWaiverPanel({ product }) {
  const dw = product.damageWaiverSettings || {};
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-stroke p-4 dark:border-dark-3">
        <div className="mb-2 text-base font-bold">Eligibility</div>
        <Info label="Enabled for Product" value={product.damageWaiverEnabled ? "Yes" : "No"} />
        <Info label="Eligible" value={dw.isEligible ? "Yes" : "No"} />
        <Info label="Excluded" value={dw.isExcluded ? `Yes${dw.exclusionReason ? ` — ${dw.exclusionReason}` : ""}` : "No"} />
        <Info label="Risk Level" value={dw.riskLevel || "—"} />
        <Info label="Replacement Value" value={dw.replacementValue ?? "—"} />
        <Info label="Depreciation Rate" value={dw.depreciationRate != null ? `${dw.depreciationRate}%` : "—"} />
      </div>
      <div className="rounded-xl border border-stroke p-4 dark:border-dark-3">
        <div className="mb-2 text-base font-bold">Insurance</div>
        <Info label="Policy #" value={dw.insuranceInfo?.policyNumber || "—"} />
        <Info label="Provider" value={dw.insuranceInfo?.provider || "—"} />
        <Info label="Coverage" value={dw.insuranceInfo?.coverageAmount ?? "—"} />
        <Info label="Deductible" value={dw.insuranceInfo?.deductible ?? "—"} />
        <Info label="Expiry" value={dw.insuranceInfo?.expiryDate ? formatDate(dw.insuranceInfo.expiryDate) : "—"} />
      </div>
    </div>
  );
}

function AttachmentsPanel({ attachments }) {
  if (!attachments?.length) return <div className="text-sm text-gray-500">No attachments.</div>;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {attachments.map((a, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border border-stroke p-3 text-sm dark:border-dark-3">
          <div className="truncate pr-3">{a.name || a.url || `Attachment ${i + 1}`}</div>
          <Link href={a.url || "#"} className="text-blue-600 underline" target="_blank">Open</Link>
        </div>
      ))}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-gray-200 py-2 text-sm last:border-b-0 dark:border-dark-3">
      <span className="text-gray-500 dark:text-gray-300">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function formatDate(d) {
  if (!d) return "—";
  try {
    const date = new Date(d);
    return date.toLocaleString();
  } catch {
    return d;
  }
}
