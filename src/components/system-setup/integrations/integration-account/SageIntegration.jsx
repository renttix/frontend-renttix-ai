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
  const { user } = useSelector((state) => state?.authReducer);
  const [sageStatus, setSageStatus] = useState(null);
  const toast = React.useRef(null);

  const regionOptions = [
    { label: "United Kingdom", value: "uk" },
    { label: "United States", value: "us" },
    { label: "Canada", value: "ca" },
  ];

  // Check Sage connection status on mount
  useEffect(() => {
    checkSageStatus();
  }, []);

  const checkSageStatus = async () => {
    try {
      setCheckingStatus(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BaseURL}/sage/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSageStatus(response.data);
    } catch (error) {
      console.error("Error checking Sage status:", error);
      setSageStatus({ connected: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  const startSageAuth = () => {
    // Direct redirect to backend OAuth endpoint, similar to QuickBooks
    window.location.href = `${BaseURL}/sage/auth?vendorId=${user._id}&redirectURL=${window.location.href}`;
  };

  const disconnectSage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BaseURL}/sage/disconnect`,
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
      const token = localStorage.getItem("token");
      
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
        }
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

  const getRegionLabel = (region) => {
    const option = regionOptions.find(opt => opt.value === region);
    return option ? option.label : region;
  };

  if (checkingStatus) {
    return (
      <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4">
        <div className="flex items-center justify-center h-64">
          <ProgressSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4">
      <Toast ref={toast} />
      <div className="w-[80%]">
        <h2 className="font-bold">Integration: Sage Business Cloud</h2>
        <div className="mt-8 flex">
          <div className="flex w-[20%] items-center justify-center">
            <div className="bg-[#00DC06] rounded-lg p-4">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="white"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="white"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
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
        <hr className="my-8 bg-white dark:shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

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
                  : "Sage Not Connected!"}
              </h3>
              {sageStatus?.connected && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Business: {sageStatus.businessName}</p>
                  <p>Region: {getRegionLabel(sageStatus.region)}</p>
                  <p>Last Sync: {sageStatus.lastSync ? new Date(sageStatus.lastSync).toLocaleString() : 'Never'}</p>
                  <p>Status: {sageStatus.syncStatus || 'Ready'}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex gap-3">
                {sageStatus?.connected ? (
                  <>
                    <Button
                      label="Sync Payment Terms"
                      loading={loading}
                      icon="pi pi-sync"
                      className="p-button-success"
                      onClick={syncPaymentTerms}
                    />
                    <Button
                      label="Disconnect Sage"
                      loading={loading}
                      style={{ background: "red" }}
                      icon="pi pi-times"
                      className="p-button-danger"
                      onClick={disconnectSage}
                    />
                  </>
                ) : (
                  <Button
                    label="Connect to Sage"
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
    </div>
  );
};

export default SageIntegration;