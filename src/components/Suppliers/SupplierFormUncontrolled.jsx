"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

// Optional: preserve focus if some parent rerenders unexpectedly
function useKeepInputFocus() {
  const last = useRef(null);
  useEffect(() => {
    const onFocus = (e) => {
      const el = e.target;
      if (!el) return;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") last.current = el;
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, []);
  useEffect(() => {
    if (document.activeElement === document.body && last.current) {
      const el = last.current;
      const pos = typeof el.selectionStart === "number" ? el.selectionStart : null;
      el.focus({ preventScroll: true });
      if (pos !== null && el.setSelectionRange) el.setSelectionRange(pos, pos);
    }
  });
}

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle ? <p className="text-sm text-zinc-500 mt-1">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? <small className="text-red-500">{error}</small> : null}
    </div>
  );
}

function PreviewRow({ k, v }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0 border-zinc-100 dark:border-zinc-800">
      <span className="text-sm text-zinc-500">{k}</span>
      <span className="text-sm font-medium truncate max-w-[60%]">{v || "—"}</span>
    </div>
  );
}

function SupplierFormControlled({
  initialValues,           // supplier doc from API (must include _id)
  onSubmit,                // async (payload, toastRef)
  onCancel,                // handler
  submitting = false,
}) {
  useKeepInputFocus();
  const toast = useRef(null);

  const defaults = useMemo(() => ({
    companyName: "", contactName: "", email: "", phone: "",
    addressLine1: "", addressLine2: "", city: "", postcode: "",
    country: "United Kingdom", companyNumber: "", taxNumber: "",
  }), []);

  const [form, setForm] = useState(defaults);
  const [touched, setTouched] = useState({});

  const mapInitial = useCallback((v) => ({
    companyName: v?.companyName || "",
    contactName: v?.contactName || "",
    email: v?.email || "",
    phone: v?.phone || "",
    addressLine1: v?.address?.addressLine1 || "",
    addressLine2: v?.address?.addressLine2 || "",
    city: v?.address?.city || "",
    postcode: v?.address?.postcode || "",
    country: v?.address?.country || "United Kingdom",
    companyNumber: v?.companyNumber || "",
    taxNumber: v?.taxNumber || "",
  }), []);

  // hydrate ONCE when editing a specific record (id-based)
  useEffect(() => {
    if (!initialValues?._id) return;
    setForm(mapInitial(initialValues));
    setTouched({});
  }, [initialValues?._id, mapInitial]);

  const required = (v) => (v ?? "").toString().trim().length > 0;
  const errors = {
    companyName: !required(form.companyName) ? "Company Name is required" : null,
    contactName: !required(form.contactName) ? "Contact Name is required" : null,
    email: !/^\S+@\S+\.\S+$/.test(form.email) ? "Valid email is required" : null,
    phone: !required(form.phone) ? "Phone is required" : null,
    addressLine1: !required(form.addressLine1) ? "Address Line 1 is required" : null,
    city: !required(form.city) ? "City is required" : null,
    postcode: !required(form.postcode) ? "Postcode is required" : null,
    country: !required(form.country) ? "Country is required" : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const setField = useCallback((k, v) => {
    setForm((f) => (f[k] === v ? f : { ...f, [k]: v }));
  }, []);
  const handleBlur = useCallback((k) => {
    setTouched((t) => (t[k] ? t : { ...t, [k]: true }));
  }, []);

  const submit = useCallback(async (e) => {
    e.preventDefault();
    if (hasErrors) {
      setTouched({
        companyName: true, contactName: true, email: true, phone: true,
        addressLine1: true, city: true, postcode: true, country: true,
      });
      toast.current?.show({ severity: "warn", summary: "Fix fields", detail: "Please correct the highlighted fields." });
      return;
    }
    const payload = {
      companyName: form.companyName.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: {
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2?.trim() || "",
        city: form.city.trim(),
        postcode: form.postcode.trim(),
        country: form.country.trim(),
      },
      companyNumber: form.companyNumber?.trim() || undefined,
      taxNumber: form.taxNumber?.trim() || undefined,
    };
    await onSubmit?.(payload, toast);
  }, [form, hasErrors, onSubmit]);

  return (
    <form onSubmit={submit} className="relative">
      <Toast ref={toast} />

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: form sections */}
        <div className="lg:col-span-2 space-y-6">
          <Section
            title="Contact Information"
            subtitle="Basic details to identify and communicate with the supplier."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company Name" required error={touched.companyName && errors.companyName}>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-building" />
                  <InputText
                    className="w-full pl-10"
                    value={form.companyName}
                    onChange={(e) => setField("companyName", e.target.value)}
                    onBlur={() => handleBlur("companyName")}
                  />
                </IconField>
              </Field>

              <Field label="Contact Name" required error={touched.contactName && errors.contactName}>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-user" />
                  <InputText
                    className="w-full pl-10"
                    value={form.contactName}
                    onChange={(e) => setField("contactName", e.target.value)}
                    onBlur={() => handleBlur("contactName")}
                  />
                </IconField>
              </Field>

              <Field label="Email" required error={touched.email && errors.email}>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-envelope" />
                  <InputText
                    className="w-full pl-10"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                  />
                </IconField>
              </Field>

              <Field label="Phone" required error={touched.phone && errors.phone}>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-phone" />
                  <InputText
                    className="w-full pl-10"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                  />
                </IconField>
              </Field>
            </div>
          </Section>

          <Section
            title="Registered Address"
            subtitle="Where goods and correspondence will be sent."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Address Line 1" required error={touched.addressLine1 && errors.addressLine1}>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-map-marker" />
                  <InputText
                    className="w-full pl-10"
                    value={form.addressLine1}
                    onChange={(e) => setField("addressLine1", e.target.value)}
                    onBlur={() => handleBlur("addressLine1")}
                  />
                </IconField>
              </Field>

              <Field label="Address Line 2">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-compass" />
                  <InputText
                    className="w-full pl-10"
                    value={form.addressLine2}
                    onChange={(e) => setField("addressLine2", e.target.value)}
                  />
                </IconField>
              </Field>

              <Field label="City" required error={touched.city && errors.city}>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-building" />
                  <InputText
                    className="w-full pl-10"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    onBlur={() => handleBlur("city")}
                  />
                </IconField>
              </Field>

              <Field label="Postcode" required error={touched.postcode && errors.postcode}>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-hashtag" />
                  <InputText
                    className="w-full pl-10"
                    value={form.postcode}
                    onChange={(e) => setField("postcode", e.target.value)}
                    onBlur={() => handleBlur("postcode")}
                  />
                </IconField>
              </Field>

              <Field label="Country" required error={touched.country && errors.country}>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-globe" />
                  <InputText
                    className="w-full pl-10"
                    value={form.country}
                    onChange={(e) => setField("country", e.target.value)}
                    onBlur={() => handleBlur("country")}
                  />
                </IconField>
              </Field>
            </div>
          </Section>

          <Section
            title="Company Details"
            subtitle="Optional identifiers for invoices and compliance."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company Number">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-id-card" />
                  <InputText
                    className="w-full pl-10"
                    value={form.companyNumber}
                    onChange={(e) => setField("companyNumber", e.target.value)}
                  />
                </IconField>
              </Field>

              <Field label="Tax Number">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-percentage" />
                  <InputText
                    className="w-full pl-10"
                    value={form.taxNumber}
                    onChange={(e) => setField("taxNumber", e.target.value)}
                  />
                </IconField>
              </Field>
            </div>
          </Section>
        </div>

        {/* Right: live preview / meta */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Supplier Preview</h3>
              <div className="space-y-2">
                <PreviewRow k="Company" v={form.companyName} />
                <PreviewRow k="Contact" v={form.contactName} />
                <PreviewRow k="Email" v={form.email} />
                <PreviewRow k="Phone" v={form.phone} />
                <PreviewRow k="City" v={form.city} />
                <PreviewRow k="Postcode" v={form.postcode} />
                <PreviewRow k="Country" v={form.country} />
                <PreviewRow k="Company No." v={form.companyNumber} />
                <PreviewRow k="Tax No." v={form.taxNumber} />
              </div>
            </section>

            {/* Optional: audit info if available */}
            {initialValues?._id && (
              <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Record Info</h3>
                <p className="text-sm text-zinc-500">
                  ID: <span className="text-zinc-900 dark:text-zinc-200">{initialValues._id}</span>
                </p>
                {initialValues.createdAt && (
                  <p className="text-sm text-zinc-500">
                    Created: {new Date(initialValues.createdAt).toLocaleString()}
                  </p>
                )}
                {initialValues.updatedAt && (
                  <p className="text-sm text-zinc-500">
                    Updated: {new Date(initialValues.updatedAt).toLocaleString()}
                  </p>
                )}
              </section>
            )}
          </div>
        </aside>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 mt-8 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
          <Button type="button" severity="secondary" outlined onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}

export default React.memo(
  SupplierFormControlled,
  (prev, next) =>
    (prev.initialValues?._id ?? null) === (next.initialValues?._id ?? null) &&
    prev.submitting === next.submitting
);
