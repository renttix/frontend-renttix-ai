"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import apiServices from "@/services/apiService";
import SupplierFormUncontrolled from "./SupplierForm";

function Card({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={
        "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm " +
        className
      }
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && (
            <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

function GuidelinesCard() {
  return (
    <Card title="Guidelines & Tips" subtitle="Make approval smoother.">
      <ul className="space-y-3 text-sm">
        <li>• Use the supplier’s <b>legal company name</b>.</li>
        <li>• <b>Email</b> should be valid and unique within your vendor.</li>
        <li>• <b>Address Line 1</b>, <b>City</b>, <b>Postcode</b>, <b>Country</b> are required.</li>
        <li>• <b>Tax Number</b> & <b>Company Number</b> are optional but helpful for invoices.</li>
        <li>• Prefer <b>international phone format</b> (e.g., +44 20 1234 5678).</li>
        <li>• You can add payment terms/bank details later in Supplier settings.</li>
      </ul>

      <Divider className="my-4" />

      <div className="flex items-center gap-2">
        <Tag value="Net 30" severity="success" />
        <span className="text-xs text-zinc-500">
          Default terms can be configured globally.
        </span>
      </div>
    </Card>
  );
}

export default function AddSupplierPage() {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit = useCallback(
    async (payload, toastRef) => {
      try {
        setSubmitting(true);
        const res = await apiServices.post("/suppliers", payload);
        if (res?.data?.success) {
          toastRef.current?.show({
            severity: "success",
            summary: "Created",
            detail: "Supplier created successfully.",
          });
          router.push("/purchasing/suppliers");
        } else {
          throw new Error(res?.data?.message || "Failed to create supplier");
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          (err?.response?.status === 409
            ? "Duplicate value within vendor scope"
            : err.message);
        toastRef.current?.show({
          severity: "error",
          summary: "Error",
          detail: msg,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [router]
  );

  return (
    <div className="card">
      <GoPrevious route={"/purchases/suppliers"} />
      {/* <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Add Supplier</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            severity="secondary"
            outlined
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button disabled className="opacity-60 cursor-not-allowed">
            Save
          </Button>
        </div>
      </div> */}

      {/* Layout grid: form on left, guidelines on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Supplier Details"
            subtitle="Enter the supplier’s contact, address, and company information."
          >
            {/* Focus-safe form (uncontrolled) you confirmed works */}
            <SupplierFormUncontrolled
              onSubmit={onSubmit}
              onCancel={() => router.back()}
              submitting={submitting}
            />
          </Card>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <GuidelinesCard />
          </div>
        </aside>
      </div>
    </div>
  );
}
