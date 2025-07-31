"use client";
import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { PiPlugFill } from "react-icons/pi";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";
import { ProgressSpinner } from "primereact/progressspinner";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";

const ZohoIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingTax, setSyncingTax] = useState(false);
  const { user, token } = useSelector((state) => state?.authReducer);
  const [removeZohoConfig, setremoveZohoConfig] = useState(false);
  const [zohoStatus, setZohoStatus] = useState(null);
  const toast = React.useRef(null);

  // Check Zoho connection status on mount
  useEffect(() => {
    checkZohoStatus();
  }, []);

  const checkZohoStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await axios.get(`${BaseURL}/zoho/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setZohoStatus(response.data);
    } catch (error) {
      console.error("Error checking Zoho status:", error);
      setZohoStatus({ connected: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  const startZohoAuth = () => {
    // Direct redirect to backend OAuth endpoint, similar to QuickBooks
    window.location.href = `${BaseURL}/zoho/auth?vendorId=${user._id}&redirectURL=${window.location.href}`;
  };

  const disconnectZoho = async () => {
    try {
      setLoading(true);
      await axios.delete(`${BaseURL}/zoho/disconnect`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Zoho Books disconnected successfully",
        life: 3000,
      });

      setZohoStatus({ connected: false });
    } catch (error) {
      console.error("Error disconnecting Zoho:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to disconnect Zoho Books",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const syncTaxes = async () => {
    try {
      setSyncingTax(true);
      const res = await axios.post(
        `${BaseURL}/zoho/sync/local-taxes`,
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
        detail: res.data.message,
      });
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to sync taxes to Zoho",
      });
    } finally {
      setSyncingTax(false);
    }
  };

  const syncCustomers = async () => {
    try {
      setSyncing(true);
      const response = await axios.post(
        `${BaseURL}/zoho/sync/all-customers`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { syncedCount = 0, failedCount = 0 } = response.data;

      toast.current.show({
        severity: "success",
        summary: "Customers Synced",
        detail: `${syncedCount} customers synced successfully. ${failedCount > 0 ? `${failedCount} failed.` : ""}`,
        life: 5000,
      });
    } catch (error) {
      console.error(
        "Error syncing customers:",
        error.response?.data || error.message,
      );
      toast.current.show({
        severity: "error",
        summary: "Sync Failed",
        detail:
          error.response?.data?.message ||
          "Failed to sync customers to Zoho Books",
        life: 5000,
      });
    } finally {
      setSyncing(false);
    }
  };

  const deleteZohoConfiguration = async () => {
    try {
      setremoveZohoConfig(true);
      await axios.delete(`${BaseURL}/zoho/delete-zoho-configuration`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Zoho configuration deleted",
        life: 3000,
      });

      setZohoStatus({ connected: false });
    } catch (error) {
      console.error("Error deleting Zoho configuration:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete Zoho configuration",
        life: 3000,
      });
    } finally {
      setremoveZohoConfig(false);
    }
  };

  if (checkingStatus) {
    return (
      <Card className="shadow-sm">
        <div className="flex items-center justify-center p-8">
          <ProgressSpinner />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <Card className="rounded-2xl border border-gray-100 shadow-lg">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-100 p-3">
              <img
                src="/images/zoho.png"
                alt="Zoho Books"
                className="h-10 w-10"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<i class="pi pi-book text-2xl text-green-600"></i>';
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Zoho Books
              </h2>
              <p className="text-sm text-gray-500">
                Global accounting software with real-time sync
              </p>
            </div>
          </div>

          <Tag
            value={zohoStatus?.connected ? "Connected" : "Not Connected"}
            severity={zohoStatus?.connected ? "success" : "danger"}
            icon={zohoStatus?.connected ? "pi pi-check" : "pi pi-times"}
            className="px-3 py-1 text-sm"
          />
        </div>

        <Divider className="my-0" />

        <div className="space-y-5 p-5">
          {zohoStatus?.connected ? (
            <>
              <div className="space-y-1 rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 font-medium text-green-700">
                  <i className="pi pi-check-circle"></i>
                  <span>Zoho Books connected successfully</span>
                </div>
                <p className="text-sm text-gray-600">
                  <b>Organization:</b> {zohoStatus.organizationName}
                </p>
                <p className="text-sm text-gray-600">
                  <b>ID:</b> {zohoStatus.organizationId}
                </p>
                <p className="text-sm text-gray-600">
                  <b>Connected on:</b>{" "}
                  {new Date(zohoStatus.connectedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  label="Sync Customers"
                  icon="pi pi-sync"
                  onClick={syncCustomers}
                  loading={syncing}
                  className="p-button-success p-button-sm"
                />
                <Button
                  label="Sync Taxes"
                  icon="pi pi-percentage"
                  onClick={syncTaxes}
                  loading={syncingTax}
                  className="p-button-info p-button-sm"
                />
                <Button
                  label="Disconnect"
                  icon="pi pi-times"
                  onClick={disconnectZoho}
                  loading={loading}
                  className="p-button-sm p-button-danger"
                />
                <Button
                  label="Delete Zoho Configuration"
                  icon="pi pi-trash"
                  onClick={deleteZohoConfiguration}
                  loading={removeZohoConfig}
                  className="p-button-sm p-button-secondary"
                  severity="danger"
                />
              </div>

              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <i className="pi pi-info-circle mr-2"></i>
                  You can manually sync customers and taxes anytime.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-3 font-medium text-gray-800">Why Connect?</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                  <li>Sync customers and contacts automatically</li>
                  <li>Create invoices from Renttix into Zoho</li>
                  <li>Track payments & financial data in real time</li>
                  <li>Supports 180+ countries and currencies</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button
                  label="Connect Zoho Books"
                  icon={<PiPlugFill className="mr-2" />}
                  onClick={startZohoAuth}
                  loading={loading}
                  className=" p-button-sm border-green-600 bg-green-600 text-white hover:bg-green-700"
                />
              </div>

              <p className="text-center text-xs text-gray-500">
                You'll be redirected to Zoho to authorize the connection
              </p>
            </>
          )}
        </div>
      </Card>
    </>
  );
};

export default ZohoIntegration;
