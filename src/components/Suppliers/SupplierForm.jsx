"use client";
import React, { useCallback, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

export default function SupplierFormUncontrolled({
  onSubmit, onCancel, submitting = false,
}) {
  const toast = useRef(null);

  // Uncontrolled refs (no state => no rerenders on typing)
  const companyNameRef = useRef(null);
  const contactNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const address1Ref = useRef(null);
  const address2Ref = useRef(null);
  const cityRef = useRef(null);
  const postcodeRef = useRef(null);
  const countryRef = useRef(null);
  const companyNumberRef = useRef(null);
  const taxNumberRef = useRef(null);

  const submit = useCallback(async (e) => {
    e.preventDefault();

    const v = (el) => (el?.value || "").trim();
    const payload = {
      companyName: v(companyNameRef.current),
      contactName: v(contactNameRef.current),
      email: v(emailRef.current),
      phone: v(phoneRef.current),
      address: {
        addressLine1: v(address1Ref.current),
        addressLine2: v(address2Ref.current),
        city: v(cityRef.current),
        postcode: v(postcodeRef.current),
        country: v(countryRef.current) || "United Kingdom",
      },
      companyNumber: v(companyNumberRef.current) || undefined,
      taxNumber: v(taxNumberRef.current) || undefined,
    };

    // minimal required validation
    const errs = [];
    if (!payload.companyName) errs.push("Company Name");
    if (!payload.contactName) errs.push("Contact Name");
    if (!payload.email || !/^\S+@\S+\.\S+$/.test(payload.email)) errs.push("Valid Email");
    if (!payload.phone) errs.push("Phone");
    if (!payload.address.addressLine1) errs.push("Address Line 1");
    if (!payload.address.city) errs.push("City");
    if (!payload.address.postcode) errs.push("Postcode");
    if (!payload.address.country) errs.push("Country");

    if (errs.length) {
      toast.current?.show({
        severity: "warn",
        summary: "Fix fields",
        detail: `Please provide: ${errs.join(", ")}`,
      });
      // keep current focus; do not reset anything
      return;
    }

    await onSubmit?.(payload, toast);
  }, [onSubmit]);

  return (
    <form onSubmit={submit}>
      <Toast ref={toast} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">
            Company Name <span className="text-red-500">*</span>
          </label>
          <InputText ref={companyNameRef} />
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">
            Contact Name <span className="text-red-500">*</span>
          </label>
          <InputText ref={contactNameRef} />
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <InputText ref={emailRef} />
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">
            Phone <span className="text-red-500">*</span>
          </label>
          <InputText ref={phoneRef} />
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <InputText ref={address1Ref} />
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">Address Line 2</label>
          <InputText ref={address2Ref} />
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">
            City <span className="text-red-500">*</span>
          </label>
          <InputText ref={cityRef} />
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">
            Postcode <span className="text-red-500">*</span>
          </label>
          <InputText ref={postcodeRef} />
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">
            Country <span className="text-red-500">*</span>
          </label>
          <InputText defaultValue="United Kingdom" ref={countryRef} />
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">Company Number</label>
          <InputText ref={companyNumberRef} />
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">Tax Number</label>
          <InputText ref={taxNumberRef} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" severity="secondary" outlined onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>Create</Button>
      </div>
    </form>
  );
}
