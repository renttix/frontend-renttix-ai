"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import Loader from "@/components/common/Loader";
import { Toast } from "primereact/toast";
import apiServices from "@/services/apiService";
import SupplierFormUncontrolled from "./SupplierFormUncontrolled";

export default function EditSupplierPage() {
  const { id } = useParams();
  const router = useRouter();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiServices.get(`/suppliers/${id}`);
        if (!alive) return;
        setSupplier(res?.data?.data || null);
      } catch (err) {
        toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to load supplier." });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const onSubmit = useCallback(async (payload, formToastRef) => {
    try {
      setSubmitting(true);
      const res = await apiServices.put(`/suppliers/${id}`, payload);
      if (res?.data?.success) {
        formToastRef.current?.show({ severity: "success", summary: "Saved", detail: "Supplier updated." });
        router.push("/purchasing/suppliers");
      } else {
        throw new Error(res?.data?.message || "Failed to update supplier");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 409 ? "Duplicate value within vendor scope" : err.message);
      formToastRef.current?.show({ severity: "error", summary: "Error", detail: msg });
    } finally {
      setSubmitting(false);
    }
  }, [id, router]);

  if (loading) return <Loader />;

  return (
    <div className="card">
      <Toast ref={toast} />
      <GoPrevious route={"/purchases/suppliers"} />
      <h2 className="text-xl font-semibold mb-4">Edit Supplier</h2>

      {/* Pass the SAME object reference; do not spread */}
      <SupplierFormUncontrolled
        initialValues={supplier}
        onSubmit={onSubmit}
        onCancel={() => router.back()}
        submitting={submitting}
      />
    </div>
  );
}
