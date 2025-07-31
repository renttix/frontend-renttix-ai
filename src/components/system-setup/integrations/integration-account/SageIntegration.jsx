"use client";
import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { PiPlugFill } from "react-icons/pi";
import axios from "axios";
import { InputTextarea } from "primereact/inputtextarea";
import { BaseURL } from "../../../../../utils/baseUrl";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dropdown } from "primereact/dropdown";

const SageIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { user, token } = useSelector((state) => state?.authReducer);
  const [sageStatus, setSageStatus] = useState(null);
  const toast = React.useRef(null);
const [ledgers, setLedgers] = useState([]);
const [selectedLedger, setSelectedLedger] = useState(null);
const [loadingLedgers, setLoadingLedgers] = useState(false);
const [revenueMappings, setRevenueMappings] = useState({});
const [loadingRemoveAll, setLoadingRemoveAll] = useState(false);

  const [loadingSyncCustomers, setLoadingSyncCustomers] = useState(false);
  const [loadingSyncTaxes, setLoadingSyncTaxes] = useState(false);
const revenueGroups = [
  // "Maintenance Revenue",
  // "Miscellaneous Sales Revenue",
  // "Rental Revenue",
  "Sales Revenue",
  // "Service Revenue",
  // "Sub-Rent Revenue",
  // "Surcharge Revenue",
  // "Transport Revenue",
];
const removeAllSageData = async () => {
  try {
    setLoadingRemoveAll(true);
    const response = await axios.post(
      `${BaseURL}/sage/remove-all`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: response.data.message || "Sage integration removed successfully",
      life: 3000,
    });

    await checkSageStatus(); // Refresh status
  } catch (error) {
    console.error("Error removing Sage integration:", error);
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: error?.response?.data?.message || "Failed to remove Sage data",
      life: 3000,
    });
  } finally {
    setLoadingRemoveAll(false);
  }
};

const handleMappingChange = (group, ledgerId) => {
  setRevenueMappings((prev) => ({ ...prev, [group]: ledgerId }));
};

  const syncCustomersToSage = async () => {
    try {
      setLoadingSyncCustomers(true);

      const response = await axios.post(
        `${BaseURL}/sage/sync/all-customers`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail:
          response.data.message ||
          `Synced ${response.data.syncedCount} customers to Sage`,
        life: 3000,
      });

      // Optional: Refresh status if needed
      await checkSageStatus();
    } catch (error) {
      console.error("Error syncing customers:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          error?.response?.data?.message || "Failed to sync customers to Sage",
        life: 3000,
      });
    } finally {
      setLoadingSyncCustomers(false);
    }
  };
  const syncTaxesToSage = async () => {
    try {
      setLoadingSyncTaxes(true);

      const response = await axios.post(
        `${BaseURL}/sage/sync/taxes`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail:
          response.data.message ||
          `Synced ${response.data.syncedCount} taxes to Sage`,
        life: 3000,
      });

      await checkSageStatus();
    } catch (error) {
      console.error("Error syncing taxes:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          error?.response?.data?.message || "Failed to sync taxes to Sage",
        life: 3000,
      });
    } finally {
      setLoadingSyncTaxes(false);
    }
  };

  const regionOptions = [
    { label: "United Kingdom", value: "uk" },
    { label: "United States", value: "us" },
    { label: "Canada", value: "ca" },
  ];

  // Check Sage connection status on mount
  useEffect(() => {
    checkSageStatus();
  }, []);
useEffect(() => {
  if (sageStatus?.connected) {
    fetchLedgers();
  }
}, [sageStatus]);

  const fetchLedgers = async () => {
  try {
    setLoadingLedgers(true);
    const response = await axios.get(`${BaseURL}/sage/ledger-accounts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const ledgerOptions = response.data.items.map((ledger) => ({
      label: ledger.displayed_as,
      value: ledger.id,
    }));
    setLedgers(ledgerOptions);
  } catch (error) {
    console.error("Error fetching ledgers:", error);
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to load ledger accounts",
      life: 3000,
    });
  } finally {
    setLoadingLedgers(false);
  }
};
const checkSageStatus = async () => {
  try {
    setCheckingStatus(true);
    const response = await axios.get(`${BaseURL}/sage/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setSageStatus(response.data);

    // Pre-fill revenue mappings from status
    const mappings = {};
    if (response.data.ledgerMappings?.length > 0) {
      for (const mapping of response.data.ledgerMappings) {
        mappings[mapping.revenueGroup] = mapping.sageLedgerId;
      }
      setRevenueMappings(mappings);
    }

  } catch (error) {
    console.error("Error checking Sage status:", error);
    setSageStatus({ connected: false });
  } finally {
    setCheckingStatus(false);
  }
};


  useEffect(() => {
  if (selectedLedger) {
    const selectedLabel = ledgers.find((l) => l.value === selectedLedger)?.label;
    toast.current.show({
      severity: "info",
      summary: "Ledger Selected",
      detail: selectedLabel,
      life: 3000,
    });
  }
}, [selectedLedger]);

  const startSageAuth = () => {
    // Direct redirect to backend OAuth endpoint, similar to QuickBooks
    window.location.href = `${BaseURL}/sage/auth?vendorId=${user._id}&redirectURL=${window.location.href}`;
  };

  const disconnectSage = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BaseURL}/sage/disconnect`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: response.data.message || "Sage disconnected successfully",
        life: 3000,
      });

      // Refresh status
      await checkSageStatus();
    } catch (error) {
      console.error("Error disconnecting Sage:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to disconnect Sage",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const syncPaymentTerms = async () => {
    try {
      setLoading(true);

      // First fetch local payment terms
      const paymentTermsResponse = await axios.get(`${BaseURL}/payment-terms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const paymentTerms = paymentTermsResponse.data.data || [];

      // Then sync them to Sage
      const response = await axios.post(
        `${BaseURL}/sage/payment-terms/sync`,
        { paymentTerms },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: `Synced ${response.data.synced} payment terms to Sage`,
        life: 3000,
      });
    } catch (error) {
      console.error("Error syncing payment terms:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to sync payment terms",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

const saveLedgerMappings = async () => {
  try {
    const revenueLedgerMappings = Object.entries(revenueMappings).map(([group, ledgerId]) => {
      const ledger = ledgers.find((l) => l.value === ledgerId);
      return {
        revenueGroup: group,
        sageLedgerId: ledgerId,
        sageLedgerName: ledger?.label || "",
      };
    });

    for (const mapping of revenueLedgerMappings) {
      await axios.patch(
        `${BaseURL}/sage/ledger-mapping`,
        mapping,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "All ledger mappings saved successfully",
      life: 3000,
    });
  } catch (error) {
    console.error("Error saving ledger mappings:", error);
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: error?.response?.data?.message || "Failed to save ledger mappings",
      life: 3000,
    });
  }
};



  const getRegionLabel = (region) => {
    const option = regionOptions.find((opt) => opt.value === region);
    return option ? option.label : region;
  };

  if (checkingStatus) {
    return (
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <div className="flex h-64 items-center justify-center">
          <ProgressSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <Toast ref={toast} />
      <div className="w-[90%]">
        <h2 className="font-bold">Integration: Sage Business Cloud</h2>
        <div className="mt-8 flex">
          <div className="flex w-[20%] items-center justify-center">
            <div className="rounded-lg bg-[#00DC06] p-4">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                  fill="white"
                />
                <path
                  d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                  fill="white"
                />
                <circle cx="12" cy="12" r="2" fill="white" />
              </svg>
            </div>
          </div>
          <div className="flex w-[60%] flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="name">Name</label>
              <InputText id="name" value="Sage Business Cloud" readOnly />
            </div>
            <div className="flex flex-col">
              <label htmlFor="description">Description</label>
              <InputTextarea
                id="description"
                value="Integrate with Sage Business Cloud Accounting to manage your financial data. Supports multiple regions (UK, US, CA) with automatic endpoint selection and secure OAuth 2.0 authentication."
                readOnly
                rows={5}
              />
            </div>
          </div>
        </div>
        <hr className="my-8 bg-white dark:border-dark-3 dark:bg-gray-dark dark:shadow-1" />

        <div className="mt-8 flex">
          <div className="flex w-[20%] items-center justify-center">
            <PiPlugFill className="text-[120px] text-[#DDD]" />
          </div>
          <div className="flex w-[60%] flex-col gap-4">
            <div className="flex flex-col">
              <h3
                className={`text-xl font-semibold ${
                  sageStatus?.connected ? "text-green-600" : "text-red-600"
                }`}
              >
                {sageStatus?.connected
                  ? "Sage Connected!"
                  : "You are not connected to Sage Business Cloud!"}
              </h3>
              {sageStatus?.connected && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Region: {getRegionLabel(sageStatus.region)}</p>
                  <p>
                    Last Sync:{" "}
                    {sageStatus.lastSync
                      ? new Date(sageStatus.lastSync).toLocaleString()
                      : "Never"}
                  </p>
                  <p>Status: {sageStatus.syncStatus || "Ready"}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col"> {sageStatus?.connected ? (
               <>
              <div className="flex gap-3">
               
                 
                    <Button
                      label="Sync Payment Terms"
                      loading={loading}
                      icon="pi pi-sync"
                      size="small"
                      className="p-button-success"
                      onClick={syncPaymentTerms}
                    />
                    <Button
                      label="Sync Customers"
                      loading={loadingSyncCustomers}
                      icon="pi pi-users"
                       size="small"
                      className="p-button-secondary"
                      onClick={syncCustomersToSage}
                    />
                    <Button
                      label="Sync Taxes"
                       size="small"
                      loading={loadingSyncTaxes}
                      icon="pi pi-percentage"
                      className="p-button-warning"
                      onClick={syncTaxesToSage}
                    />

                    <Button
                      label="Disconnect Sage"
                      loading={loading}
                       size="small"
                      style={{ background: "red" }}
                      icon="pi pi-times"
                      className="p-button-danger"
                      onClick={disconnectSage}
                    />
                    <Button
  label="Remove All Sage Data"
  loading={loadingRemoveAll}
  size="small"
  icon="pi pi-trash"
  className="p-button-danger"
  style={{ background: "#8B0000", borderColor: "#8B0000" }}
  onClick={removeAllSageData}
/>

                   </div>
                  <div className="">
                      <div className="rounded-md border border-gray-300 p-4 mt-4 shadow-md dark:bg-gray-dark dark:border-dark-3">
  <h3 className="mb-4 text-lg font-semibold">Revenue Group Mappings</h3>
  <table className="w-full table-auto border-collapse">
    <thead>
      <tr className="border-b">
        <th className="text-left p-2 text-sm font-medium text-gray-600">Revenue Group</th>
        <th className="text-left p-2 text-sm font-medium text-gray-600">Sage Business Cloud Ledger</th>
      </tr>
    </thead>
    <tbody>
      {revenueGroups.map((group, idx) => (
        <tr key={idx} className="border-b">
          <td className="p-2 text-sm">{group}</td>
          <td className="p-2">
            <Dropdown
              value={revenueMappings[group] || null}
              options={[{ label: "(No Mapping)", value: null }, ...ledgers]} // ledgers is your fetched dropdown list
              onChange={(e) => handleMappingChange(group, e.value)}
              placeholder="Select Ledger"
              filter
              className="w-full md:w-60"
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  <div className="flex justify-end">
    <Button
  label="Save Ledger Mappings"
  icon="pi pi-save"
  className="p-button-success mt-4"
  size="small"
  onClick={saveLedgerMappings}
  disabled={Object.keys(revenueMappings).length === 0}
/>
  </div>
</div>


                  </div>
   </>
                ) : (
                  <Button
                    label="Connect to Sage Business Cloud"
                    loading={loading}
                    icon="pi pi-check"
                    className="p-button-primary"
                    onClick={startSageAuth}
                  />
                )}
             

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SageIntegration;
