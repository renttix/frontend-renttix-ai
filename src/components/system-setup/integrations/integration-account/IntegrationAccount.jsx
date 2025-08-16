"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { PiPlugFill } from "react-icons/pi";
import axios from "axios";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown"; // ⬅️ NEW
import { BaseURL } from "../../../../../utils/baseUrl";

;

const IntegrationAccount = () => {
  const [loading, setLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);

  const [syncLoading, setSyncLoading] = useState(false); // customers
  const [syncExpenseLoading, setSyncExpenseLoading] = useState(false); // expense accounts

  // ⬇️ NEW: taxes state
  const [syncTaxesLoading, setSyncTaxesLoading] = useState(false);
  const [taxesLoading, setTaxesLoading] = useState(false);
  const [taxOptions, setTaxOptions] = useState([]);
  const [selectedTax, setSelectedTax] = useState(null);

  const [quickBookStatus, setQuickBookStatus] = useState(false);

  const { user, token } = useSelector((state) => state?.authReducer);
  const toast = useRef(null);

  const startQuickBooksAuth = () => {
    window.location.href = `${BaseURL}/auth?vendorId=${user._id}&redirctURL=${window.location.href}`;
  };

  const RevokeQuickbookAuth = () => {
    setLoading(true);
    axios
      .post(`${BaseURL}/disconnect-quickbook`, { vendorId: user._id })
      .then((response) => {
        setQuickBookStatus(response.data.status);
        toast.current.show({
          severity: "error",
          summary: "QuickBooks",
          detail: response.data.message,
          life: 2000,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => setLoading(false));
  };

  // ⬇️ existing: sync expense accounts
  const syncExpenseAccounts = async () => {
    setSyncExpenseLoading(true);
    try {
      const { data } = await axios.post(
        `${BaseURL}/integrations/qbo/expense-accounts/sync`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const stats = data?.stats || {};
      toast.current?.show({
        severity: data?.success ? "success" : "warn",
        summary: "Expense Accounts Synced",
        detail: `Total: ${stats.total ?? 0}, Created: ${stats.created ?? 0}, Updated: ${stats.updated ?? 0}`,
        life: 3500,
      });
    } catch (err) {
      console.error("Expense sync error:", err);
      toast.current?.show({
        severity: "error",
        summary: "Sync Failed",
        detail: err?.response?.data?.message || err.message || "Failed to sync expense accounts.",
        life: 3500,
      });
    } finally {
      setSyncExpenseLoading(false);
    }
  };

  // ⬇️ NEW: fetch taxes for dropdown
  const fetchTaxes = async () => {
    setTaxesLoading(true);
    try {
      const { data } = await axios.get(`${BaseURL}/integrations/taxes?side=sales&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaxOptions(data?.data || []);
    } catch (err) {
      console.error("Fetch taxes error:", err);
      toast.current?.show({
        severity: "error",
        summary: "Load Taxes Failed",
        detail: err?.response?.data?.message || err.message || "Failed to load taxes.",
        life: 3500,
      });
    } finally {
      setTaxesLoading(false);
    }
  };

  // ⬇️ NEW: sync taxes from QuickBooks, then reload list
  const syncTaxes = async () => {
    setSyncTaxesLoading(true);
    try {
      const { data } = await axios.post(
        `${BaseURL}/integrations/qbo/taxes/sync`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const stats = data?.stats || {};
      toast.current?.show({
        severity: data?.success ? "success" : "warn",
        summary: "Taxes Synced",
        detail: `Total: ${stats.total ?? 0}, Created: ${stats.created ?? 0}, Updated: ${stats.updated ?? 0}`,
        life: 3500,
      });
      await fetchTaxes();
    } catch (err) {
      console.error("Taxes sync error:", err);
      toast.current?.show({
        severity: "error",
        summary: "Sync Failed",
        detail: err?.response?.data?.message || err.message || "Failed to sync taxes.",
        life: 3500,
      });
    } finally {
      setSyncTaxesLoading(false);
    }
  };

  // Load taxes on mount if connected
  useEffect(() => {
    if (!quickBookStatus && user?.isQuickBook) {
      fetchTaxes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.isQuickBook, quickBookStatus]);

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4">
      <Toast ref={toast} />
      <div className="w-[80%]">
        <h2 className="font-bold">Integration: QuickBooks</h2>

        <div className="mt-8 flex">
          <div className="flex w-[20%] items-center justify-center">
            <img className="w-32" src="/images/QuickBooks.png" alt="QuickBooks" />
          </div>
          <div className="flex w-[60%] flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="name">Name</label>
              <InputText id="name" value="QuickBooks" readOnly />
            </div>
            <div className="flex flex-col">
              <label htmlFor="description">Description</label>
              <InputTextarea
                id="description"
                value="Integrate with QuickBooks accounting software to provide the ability to post your invoices into QuickBooks and keep your accounts and QuickBooks contacts in sync."
                readOnly
                rows={5}
              />
            </div>
          </div>
        </div>

        <hr className="my-8 bg-white dark:shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

        <div className="mt-8 flex">
          <div className="flex w-[20%] items-center justify-center">
            <PiPlugFill className="text-[120px] text-[#DDD]" />
          </div>

          <div className="flex w-[60%] flex-col gap-4">
            <div className="flex flex-col">
              <h3
                className={`text-xl font-semibold ${
                  !quickBookStatus && user?.isQuickBook ? "text-green-600" : "text-red-600"
                }`}
              >
                {!quickBookStatus && user?.isQuickBook ? "QuickBooks Connected!" : "QuickBooks Not Connected!"}
              </h3>
            </div>

            <div className="flex flex-col">
              <div className="flex gap-3 flex-wrap">
                {!quickBookStatus && user?.isQuickBook ? (
                  <>
                    <Button
                      label="Revoke QuickBooks"
                      loading={revokeLoading || loading}
                      style={{ background: "red" }}
                      icon="pi pi-times"
                      className="p-button-danger"
                      onClick={RevokeQuickbookAuth}
                    />

                    <Button
                      label="Sync Customers to QuickBooks"
                      icon="pi pi-refresh"
                      className="p-button-success"
                      loading={syncLoading}
                      onClick={async () => {
                        setSyncLoading(true);
                        try {
                          const { data } = await axios.post(
                            `${BaseURL}/sync-customers-to-quickbooks`,
                            { vendorId: user._id },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          toast.current.show({
                            severity: "success",
                            summary: "Sync Complete",
                            detail: `${data.synced.length} customers synced.`,
                            life: 3000,
                          });
                        } catch (error) {
                          console.error("❌ Sync error:", error);
                          toast.current.show({
                            severity: "error",
                            summary: "Sync Failed",
                            detail: error.response?.data?.message || "Failed to sync customers.",
                            life: 3000,
                          });
                        } finally {
                          setSyncLoading(false);
                        }
                      }}
                    />

                    {/* Existing: Sync Expense Accounts (Nominal Codes) */}
                    <Button
                      label="Sync Expense Accounts"
                      icon="pi pi-list"
                      className="p-button-help"
                      loading={syncExpenseLoading}
                      onClick={syncExpenseAccounts}
                    />

                    {/* NEW: Sync Taxes */}
                    <Button
                      label="Sync Taxes"
                      icon="pi pi-percentage"
                      className="p-button-info"
                      loading={syncTaxesLoading}
                      onClick={syncTaxes}
                    />
                  </>
                ) : (
                  <Button
                    label="Connect to QuickBooks"
                    icon="pi pi-check"
                    className="p-button-primary"
                    onClick={startQuickBooksAuth}
                  />
                )}
              </div>
            </div>

            {/* NEW: Tax Rate dropdown preview */}
            {!quickBookStatus && user?.isQuickBook && (
              <div className="mt-6 grid gap-2">
                <label className="font-medium">Tax Rate</label>
                <Dropdown
                  value={selectedTax}
                  onChange={(e) => setSelectedTax(e.value)}
                  options={taxOptions}
                  optionLabel="label"
                  optionValue="qbTaxCodeId"
                  placeholder={taxesLoading ? "Loading..." : "Select..."}
                  className="w-full md:w-30rem"
                  showClear
                  filter  // client-side filter inside Dropdown
                  disabled={taxesLoading}
                />
                {selectedTax && (
                  <span className="text-xs text-surface-500">
                    Selected TaxCodeId: {selectedTax}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationAccount;
