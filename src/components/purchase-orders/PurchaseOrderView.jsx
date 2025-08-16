"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TabView, TabPanel } from "primereact/tabview";
import { Divider } from "primereact/divider";
import { Skeleton } from "primereact/skeleton";

import apiServices from "@/services/apiService";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import SendPoModal from "./SendPoModal";

const money = (v, ccy = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: ccy }).format(Number(v || 0));

const dt = (d) =>
  d ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d)) : "-";

const statusTone = (s) => {
  switch ((s || "").toLowerCase()) {
    case "draft": return "info";
    case "submitted":
    case "pending": return "warning";
    case "approved":return "info"
    case "fullyreceived": return "success";
    case "cancelled": return "danger";
    default: return "secondary";
  }
};

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-surface-500">{label}</div>
      <div className="font-medium text-right">{value}</div>
    </div>
  );
}

export default function PurchaseOrderView() {
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const toast = useRef(null);
  const router = useRouter();
  const params = useParams()
   const [sendOpen, setSendOpen] = useState(false);
   const [isapproved, setisapproved] = useState(false)
   const [isreceive, setisreceive] = useState(false)
   const [iscancel, setiscancel] = useState(false)
  const poId = params.id
  const fetchPO = async () => {
    setLoading(true);
    try {
      const { data } = await apiServices.get(`/purchase-orders/${poId}`);
      // support both {success,data} and raw doc
      const doc = data?.data ?? data;
      setPo(doc);
    } catch (e) {
      toast.current?.show({ severity: "error", summary: "Load failed", detail: e?.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (poId) fetchPO();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poId]);

  const totals = useMemo(() => {
    if (!po) return { sub: 0, tax: 0, charges: 0, total: 0 };
    return {
      sub: Number(po.subTotal || 0),
      tax: Number(po.taxTotal || 0),
      charges: Number(po.chargesTotal || 0),
      total: Number(po.grandTotal || 0),
    };
  }, [po]);

  const supplier = po?.supplierId || {};

  const LinesTable = (
    <DataTable
      value={po?.lineItems || []}
      showGridlines
      stripedRows
      className="rounded-xl"
      scrollable
      scrollHeight="420px"
      emptyMessage="No line items."
    >
      <Column header="LINE #" style={{ width: 90 }} body={(_, opts) => <span className="text-sm text-surface-500">{opts.rowIndex + 1}</span>} />
      <Column header="DESCRIPTION" body={(row) => <div className="font-medium">{row.description}</div>} />
      <Column header="QUANTITY" style={{ width: 120 }} body={(row) => <span className="text-sm">{row.quantity ?? "-"}</span>} />
      <Column header="UNIT PRICE" style={{ width: 140 }} body={(row) => money(row.unitPrice, po?.currency || "GBP")} />
      <Column
        header="TAX"
        style={{ width: 140 }}
        body={(row) => (
          <div className="text-sm">
            {money(row.taxAmount, po?.currency || "GBP")}{" "}
            <span className="text-surface-500">({row.taxRatePercent ?? 0}%)</span>
          </div>
        )}
      />
      <Column header="TOTAL" style={{ width: 140 }} body={(row) => money(row.lineTotal, po?.currency || "GBP")} />
      <Column header="CAPEX" style={{ width: 110 }} body={(row) => (row.capex ? <Tag value="Yes" severity="info" /> : <span className="text-sm text-surface-500">-</span>)} />
      <Column
        header="OUTSTANDING"
        style={{ width: 140 }}
        body={(row) => {
          const outstanding = Number(row.quantity || 0) - Number(row.receivedQty || 0);
          return <span className="text-sm">{outstanding}</span>;
        }}
      />
    </DataTable>
  );

  if (loading) {
    return (
      <div className="card">
        <GoPrevious route="/purchasing/purchase-order-list" />
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <Skeleton width="16rem" height="1.75rem" />
            <Skeleton width="12rem" />
          </div>
          <div className="flex gap-2">
            <Skeleton width="6rem" height="2.5rem" />
            <Skeleton width="9rem" height="2.5rem" />
            <Skeleton width="6rem" height="2.5rem" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-sm"><Skeleton height="10rem" /></Card>
          ))}
        </div>
        <div className="mt-6"><Skeleton height="28rem" /></div>
      </div>
    );
  }

  if (!po) return null;

  return (
    <div className="card">
      <Toast ref={toast} />
      <GoPrevious route="/purchasing/purchase-order-list" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">
              {po.poNumber}
            </h1>
            <Tag rounded value={po.status==='FullyReceived'?'Completed':po.status} severity={statusTone(po.status)} />
          </div>
          <div className="mt-1 text-surface-600">{supplier.companyName || "-"}</div>
        </div>
        {!['Cancelled','FullyReceived'].includes(po.status) && 
        <div className="flex gap-2">
              {!['Approved','Completed'].includes(po.status) && <Link href={`/purchasing/purchase-order-list/update/${po._id}`}>
            <Button icon="pi pi-pencil" label="Edit" outlined />
          </Link>}
          {po.status==="Draft" && <Button
        icon="pi pi-send"
        label="Send for Approval"
        onClick={() => setSendOpen(true)}
      />}


      <SendPoModal
        visible={sendOpen}
        onHide={() => setSendOpen(false)}
        po={po}
        fetchPO={fetchPO}
        org={{
          name: "Renttix Ltd",
          addressLines: ["123 Business Park", "London, SW1A 1AA", "Tel: 020 7123 4567", "Email: purchasing@renttix.com"],
          vat: "GB123456789",
        }}
        onSent={() => {
          // refresh or toast if needed
        }}
      />
          {/* <Button
            icon="pi pi-send"
            label="Send for Approval"
            className="p-button-success"
            disabled={String(po.status).toLowerCase() !== "draft"}
            onClick={async () => {
              try {
                await apiServices.post(`/purchase-orders/${poId}/send-for-approval`);
                toast.current?.show({ severity: "success", summary: "Sent", detail: "PO sent for approval." });
                fetchPO();
              } catch (e) {
                toast.current?.show({ severity: "error", summary: "Error", detail: e?.response?.data?.message || e.message });
              }
            }}
          />*/}

          {!['Approved','Completed','Draft'].includes(po.status) &&
                   <Button 
            icon="pi pi-check"
            label="Approve"
            severity="success"
            loading={isapproved}

            outlined
            onClick={async () => {
              setisapproved(true)
              try {
                await apiServices.post(`/purchase-orders/${poId}/approve`);
                toast.current?.show({ severity: "success", summary: "Approved" });
                setisapproved(false)
                   setTimeout(() => {
                  fetchPO();
                }, 1000);
              } catch (e) {
                toast.current?.show({ severity: "success", summary: "Error", detail: e?.response?.data?.message || e.message });
              }
            }}
          />}

          {po.status==='Approved' &&
                   <Button 
            icon="pi pi-check"
            label="Receive Goods"
            severity="primary"
            loading={isreceive}
            outlined
            onClick={async () => {
              setisreceive(true)
              try {
                await apiServices.post(`/purchase-orders/${poId}/complete`);
                toast.current?.show({ severity: "success", summary: "Purchase Order has been marked as received" });
                setisreceive(false)
                setTimeout(() => {
                  fetchPO();
                }, 1000);
              } catch (e) {
                toast.current?.show({ severity: "success", summary: "Error", detail: e?.response?.data?.message || e.message });
              }
            }}
          />}
          <Button 
            icon="pi pi-times"
            label="Cancel"
            severity="danger"
            outlined
                        loading={iscancel}

            onClick={async () => {
              setiscancel(true)
              try {
                await apiServices.post(`/purchase-orders/${poId}/cancel`);
                toast.current?.show({ severity: "success", summary: "Cancelled" });
                setiscancel(false)
                setTimeout(() => {
                  fetchPO();
                }, 1000);
              } catch (e) {
                toast.current?.show({ severity: "error", summary: "Error", detail: e?.response?.data?.message || e.message });
              }
            }}
          />
        </div>}
      </div>

      {/* Top cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-sm rounded-2xl">
          <div className="text-sm font-semibold mb-3 text-surface-500">ORDER INFORMATION</div>
          <div className="space-y-3 text-sm">
            <Row label="Order Date" value={dt(po.createdAt)} />
            <Row label="Delivery Date" value={dt(po.deliveryDate)} />
            <Row label="Payment Terms" value={`${po.paymentTermsDays ?? "-"} days`} />
            <Row label="Reference" value={po.reference || "-"} />
          </div>
        </Card>

        <Card className="shadow-sm rounded-2xl">
          <div className="text-sm font-semibold mb-3 text-surface-500">FINANCIAL SUMMARY</div>
          <div className="space-y-3 text-sm">
            <Row label="Subtotal" value={money(totals.sub, po.currency)} />
            <Row label="VAT" value={money(totals.tax, po.currency)} />
            <Row label="Additional Charges" value={money(totals.charges, po.currency)} />
            <Divider className="my-2" />
            <Row label={<span className="font-semibold">Total</span>} value={<span className="font-semibold">{money(totals.total, po.currency)}</span>} />
          </div>
        </Card>

        <Card className="shadow-sm rounded-2xl">
          <div className="text-sm font-semibold mb-3 text-surface-500">SUPPLIER INFORMATION</div>
          <div className="space-y-3 text-sm">
            <Row label="Name" value={supplier.companyName || "-"} />
            <Row label="Contact" value={supplier.contactName || "-"} />
            <Row label="Email" value={supplier.email || "-"} />
            <Row label="Phone" value={supplier.phone || "-"} />
            <Row label="Company No" value={supplier.companyNumber || "-"} />
            <Row label="Tax No" value={supplier.taxNumber || "-"} />
          </div>
        </Card>

        <Card className="shadow-sm rounded-2xl">
          <div className="text-sm font-semibold mb-3 text-surface-500">STATUS INFORMATION</div>
          <div className="space-y-3 text-sm">
            <Row label="Created At" value={dt(po?.createdAt)} />
            <Row label="Currency" value={po?.currency || "GBP"} />
            <Row label="Depot" value={po?.depotId?.name || "-"} />

            {/* {po?.updatedBy?.legalName!="undefined" && <Row label="Update By" value={po?.updatedBy?.legalName || "-"} />} */}
            {po?.updatedBy?.email===undefined?'': <Row label="Update By" value={po?.updatedBy?.email || "-"} />}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="shadow-sm rounded-2xl mt-6 p-0 overflow-hidden">
        <TabView activeIndex={tab} onTabChange={(e) => setTab(e.index)}>
          <TabPanel header={`Lines (${po?.lineItems?.length || 0})`}>
            <div className="p-3">{LinesTable}</div>
          </TabPanel>

          <TabPanel header="Receipts">
            <div className="p-4 text-sm text-surface-600">No receipts yet.</div>
          </TabPanel>

          <TabPanel header="Bill Match">
            <div className="p-4 text-sm text-surface-600">No bills matched yet.</div>
          </TabPanel>

          <TabPanel header="Audit Log">
            <div className="p-4 text-sm text-surface-600">No audit entries yet.</div>
          </TabPanel>
        </TabView>
      </Card>

      {/* Notes */}
      <Card className="shadow-sm rounded-2xl mt-6">
        <div className="text-sm font-semibold mb-2 text-surface-500">Notes</div>
        <div className="text-sm text-surface-700 whitespace-pre-wrap">
          {po?.notes || "—"}
        </div>
      </Card>
    </div>
  );
}
