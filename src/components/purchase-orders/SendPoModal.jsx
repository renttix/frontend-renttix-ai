"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import apiServices from "@/services/apiService";

const fmtMoney = (v, c = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: c }).format(Number(v || 0));
const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d)) : "-";

export default function SendPoModal({
  visible,
  onHide,
  po, 
  fetchPO,               // your PO doc (the one you shared)
  org,               // { name, addressLines:[], email, tel, vat } optional
  onSent,            // callback after successful send
}) {
  const toast = useRef(null);
  const previewRef = useRef(null);
  const [savingPdf, setSavingPdf] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachPdf, setAttachPdf] = useState(true);
  const supplier = po?.supplierId || {};
  const currency = po?.currency || "GBP";

  // sensible defaults for the message
  const defaultTo = supplier?.email || "";
  const defaultSubject = `Purchase Order ${po?.poNumber}`;
  const salutation = supplier?.contactName ? `Dear ${supplier.contactName},` : "Hello,";
  const defaultBody = [
    `${salutation}`,
    "",
    `Please find attached our Purchase Order ${po?.code || po?.number || ""} for your review and processing.`,
    "",
    "Order Summary:",
    `• Supplier: ${supplier?.companyName || "-"}`,
    `• Delivery Date: ${fmtDate(po?.deliveryDate)}`,
    `• Total: ${fmtMoney(po?.grandTotal, currency)}`,
    "",
    "Kind regards,",
    (org?.name || "Renttix")
  ].join("\n");

  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultBody);
  const [isDownload, setisDownload] = useState(false)

  useEffect(() => {
    if (visible) {
      setTo(defaultTo);
      setCc("");
      setSubject(defaultSubject);
      setMessage(defaultBody);
      setAttachPdf(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, po?._id]);

  const lineTotals = useMemo(() => {
    const items = po?.lineItems || [];
    const sub = Number(po?.subTotal ?? items.reduce((s, l) => s + Number(l.netAmount || (l.unitPrice * (l.quantity || 0)) || 0), 0));
    const tax = Number(po?.taxTotal ?? items.reduce((s, l) => s + Number(l.taxAmount || 0), 0));
    const charges = Number(po?.chargesTotal ?? 0);
    const total = Number(po?.grandTotal ?? sub + tax + charges);
    return { sub, tax, charges, total };
  }, [po]);


 async function downloadPoPdf(poId) {
  setisDownload(true)
  try {
    const res = await apiServices.get(`/purchase-orders/${poId}/pdf`, {
      params: { download: 1 },                 // force attachment on server
      responseType: "arraybuffer",             // <-- CRITICAL: get raw bytes
      headers: { Accept: "application/pdf" },  // hint server/any proxy
      validateStatus: (s) => s < 500,          // let us inspect 4xx bodies
    });

    const contentType = (res.headers && res.headers["content-type"]) || "";
    const isPdf = contentType.includes("application/pdf");

    // If not a PDF, try to decode the error text and throw helpful message
    if (!isPdf) {
      const text = new TextDecoder().decode(res.data);
      // Try to extract JSON error message if present
      try {
        const json = JSON.parse(text);
        const msg =
          json?.message || json?.error || json?.errors?.[0]?.message || "Failed to download PDF";
        throw new Error(msg);
      } catch {
        // Not JSON → throw the text (trimmed)
        throw new Error(text?.slice(0, 300) || "Failed to download PDF");
      }
    }
setisDownload(false)
    // Extract filename from Content-Disposition (supports RFC 5987)
    const dispo = res.headers?.["content-disposition"] || "";
    const match = dispo.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i);
    let filename = "purchase-order.pdf";
    if (match) filename = decodeURIComponent(match[1] || match[2]);

    // Build blob and trigger download
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    // surface a meaningful error (you can swap for a Toast)
    console.error("PDF download failed:", err);
    throw err;
  }
}
  const saveAsPDF = async () => {
    try {
      setSavingPdf(true);
      // lazy-load libs to keep bundle small
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const node = previewRef.current;
      const canvas = await html2canvas(node, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let y = 0;
      let remaining = imgHeight;
      while (remaining > 0) {
        pdf.addImage(imgData, "PNG", 0, y ? 0 : 0, imgWidth, imgHeight);
        remaining -= pageHeight;
        if (remaining > 0) pdf.addPage();
        y += pageHeight;
      }

      const filename = `${po?.code || po?.number || "purchase-order"}.pdf`;
      pdf.save(filename);
      toast.current?.show({ severity: "success", summary: "Saved", detail: "PDF downloaded." });
    } catch (e) {
      toast.current?.show({ severity: "error", summary: "PDF Error", detail: e.message });
    } finally {
      setSavingPdf(false);
    }
  };

  const send = async () => {
    if (!to?.trim()) {
      toast.current?.show({ severity: "warn", summary: "Missing email", detail: "Please enter a recipient email." });
      return;
    }
    setSending(true);
    try {
      // backend can generate + attach the PDF from the same HTML (recommended)
      await apiServices.post(`/purchase-orders/${po._id}/email-pdf`, {
        to,
        cc,
        subject,
        message,
        attachPdf,  // let backend attach the official PDF
      });
      fetchPO()
      toast.current?.show({ severity: "success", summary: "Sent", detail: "Purchase order emailed." });
      onSent?.();
      onHide?.();
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Send failed",
        detail: e?.response?.data?.message || e.message,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      header="Send Purchase Order"
      visible={visible}
      onHide={onHide}
      dismissableMask
      style={{ width: "min(1400px, 95vw)" }}
      className="rounded-2xl"
      blockScroll
    >
      <Toast ref={toast} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* LEFT: Purchase Order Preview */}
        <div className="border rounded-xl overflow-hidden">
          <div
            ref={previewRef}
            className="h-[70vh] overflow-y-auto p-5 bg-white"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold text-primary-600">{org?.name || "Renttix Ltd"}</div>
                <div className="text-xs mt-2 text-surface-600 whitespace-pre-line">
                  {(org?.addressLines || [
                    "123 Business Park",
                    "London, SW1A 1AA",
                    "Tel: 020 7123 4567",
                    "Email: purchasing@renttix.com",
                  ]).join("\n")}
                </div>
                {org?.vat && (
                  <div className="text-xs text-surface-600 mt-1">VAT: {org.vat}</div>
                )}
              </div>
              <div className="text-right">
                <div className="tracking-widest text-sm text-surface-500">PURCHASE</div>
                <div className="text-2xl font-bold -mt-1">ORDER</div>
              </div>
            </div>

            <Divider className="my-4" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-surface-500">PO Number:</div>
                <div className="font-medium">{po?.poNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-surface-500">Date:</div>
                <div className="font-medium">{fmtDate(po?.createdAt)}</div>
                <div className="text-surface-500 mt-2">Delivery:</div>
                <div className="font-medium">{fmtDate(po?.deliveryDate)}</div>
              </div>
            </div>

            {/* Supplier Details */}
            <div className="mt-5 border rounded-lg p-4">
              <div className="font-semibold mb-2">Supplier Details</div>
              <div className="text-sm">
                <div className="font-medium">{supplier?.companyName}</div>
                <div className="text-surface-600 whitespace-pre-line">
                  {[supplier?.address?.addressLine1, supplier?.address?.addressLine2, supplier?.address?.city].filter(Boolean).join("\n")}
                </div>
                <div className="text-surface-600">
                  {[supplier?.address?.postcode, supplier?.address?.country].filter(Boolean).join(", ")}
                </div>
                {supplier?.taxNumber && <div className="text-surface-600 mt-1">VAT: {supplier.taxNumber}</div>}
                {supplier?.companyNumber && <div className="text-surface-600">Company No: {supplier.companyNumber}</div>}
              </div>
            </div>

            {/* Order Details Table */}
            <div className="mt-5">
              <div className="font-semibold mb-3">Order Details</div>
              <div className="border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-surface-50">
                    <tr className="text-left">
                      <th className="px-4 py-3 w-1/2">Description</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Unit Price</th>
                      <th className="px-4 py-3">VAT</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(po?.lineItems || []).map((l, i) => (
                      <tr key={l._id || i} className={i % 2 ? "bg-surface-50/50" : ""}>
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium">{l.description}</div>
                        </td>
                        <td className="px-4 py-3">{l.quantity}</td>
                        <td className="px-4 py-3">{fmtMoney(l.unitPrice, currency)}</td>
                        <td className="px-4 py-3">
                          {fmtMoney(l.taxAmount, currency)}{" "}
                          <span className="text-surface-500">({l.taxRatePercent ?? 0}%)</span>
                        </td>
                        <td className="px-4 py-3 text-right">{fmtMoney(l.lineTotal, currency)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3}></td>
                      <td className="px-4 py-2 text-surface-600">Subtotal:</td>
                      <td className="px-4 py-2 text-right font-medium">{fmtMoney(lineTotals.sub, currency)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3}></td>
                      <td className="px-4 py-2 text-surface-600">VAT:</td>
                      <td className="px-4 py-2 text-right font-medium">{fmtMoney(lineTotals.tax, currency)}</td>
                    </tr>
                    {(po?.charges?.shipping || po?.charges?.handling || po?.charges?.other) ? (
                      <>
                        {po?.charges?.shipping ? (
                          <tr>
                            <td colSpan={3}></td>
                            <td className="px-4 py-2 text-surface-600">Shipping:</td>
                            <td className="px-4 py-2 text-right font-medium">{fmtMoney(po.charges.shipping, currency)}</td>
                          </tr>
                        ) : null}
                        {po?.charges?.handling ? (
                          <tr>
                            <td colSpan={3}></td>
                            <td className="px-4 py-2 text-surface-600">Handling:</td>
                            <td className="px-4 py-2 text-right font-medium">{fmtMoney(po.charges.handling, currency)}</td>
                          </tr>
                        ) : null}
                        {po?.charges?.other ? (
                          <tr>
                            <td colSpan={3}></td>
                            <td className="px-4 py-2 text-surface-600">Other:</td>
                            <td className="px-4 py-2 text-right font-medium">{fmtMoney(po.charges.other, currency)}</td>
                          </tr>
                        ) : null}
                      </>
                    ) : null}
                    <tr className="border-t">
                      <td colSpan={3}></td>
                      <td className="px-4 py-3 font-semibold">Total:</td>
                      <td className="px-4 py-3 text-right font-semibold">{fmtMoney(lineTotals.total, currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-5">
              <div className="font-semibold mb-2">Notes:</div>
              <div className="text-sm text-surface-700 bg-surface-50 rounded-lg p-3 whitespace-pre-wrap">
                {po?.notes || "—"}
              </div>
            </div>

            {/* Terms */}
            <div className="mt-5">
              <div className="font-semibold mb-2">Terms & Conditions:</div>
              <ol className="list-decimal pl-5 text-sm text-surface-700 space-y-1">
                <li>Payment terms: {po?.paymentTermsDays ?? 30} days from invoice date</li>
                <li>Please quote our PO number on all correspondence</li>
                <li>Goods must be delivered to the address specified</li>
                <li>All prices are in {currency}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* RIGHT: Email Details */}
        <div className="border rounded-xl p-4 h-[70vh] overflow-y-auto">
          <div className="text-sm font-semibold mb-3">Email Details</div>

          <label className="text-sm text-surface-600">To:</label>
          <InputText value={to} onChange={(e) => setTo(e.target.value)} type="email" className="w-full mb-3" placeholder="supplier@email.com" />

          <label className="text-sm text-surface-600">CC: <span className="text-surface-500">(optional)</span></label>
          <InputText value={cc} onChange={(e) => setCc(e.target.value)} className="w-full mb-3" placeholder="cc@example.com" />

          <label className="text-sm text-surface-600">Subject:</label>
          <InputText value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mb-3" />

          <label className="text-sm text-surface-600">Message:</label>
          <InputTextarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            // autoResize
            className="w-full mb-3"
          />

          <div className="rounded-lg bg-surface-50 text-surface-600 text-sm p-3 mb-5">
            A PDF copy of this purchase order will be attached to the email
          </div>

          <Divider />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox inputId="attachPdf" checked={attachPdf} onChange={(e) => setAttachPdf(e.checked)} />
              <label htmlFor="attachPdf" className="text-sm">Save as PDF</label>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                label="Save as PDF"
                icon="pi pi-file-pdf"
                outlined
                loading={isDownload}
                 onClick={() => downloadPoPdf(po._id)}
              />
              <Button
                type="button"
                label="Send Purchase Order"
                icon="pi pi-send"
                className="p-button-primary"
                loading={sending}
                onClick={send}
              />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
