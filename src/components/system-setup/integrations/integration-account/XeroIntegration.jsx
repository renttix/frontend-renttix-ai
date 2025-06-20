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

const XeroIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { user } = useSelector((state) => state?.authReducer);
  const [xeroStatus, setXeroStatus] = useState(null);
  const toast = React.useRef(null);

  // Check Xero connection status on mount
  useEffect(() => {
    checkXeroStatus();
  }, []);

  const checkXeroStatus = async () => {
    try {
      setCheckingStatus(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BaseURL}/xero/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setXeroStatus(response.data);
    } catch (error) {
      console.error("Error checking Xero status:", error);
      setXeroStatus({ connected: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  const startXeroAuth = () => {
    // Direct redirect to backend OAuth endpoint, similar to QuickBooks
    window.location.href = `${BaseURL}/xero/auth?vendorId=${user._id}&redirectURL=${window.location.href}`;
  };

  const disconnectXero = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BaseURL}/xero/disconnect`,
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
        detail: response.data.message || "Xero disconnected successfully",
        life: 3000,
      });
      
      // Refresh status
      await checkXeroStatus();
    } catch (error) {
      console.error("Error disconnecting Xero:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to disconnect Xero",
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
      
      // Then sync them to Xero
      const response = await axios.post(
        `${BaseURL}/xero/payment-terms/sync`,
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
        detail: `Synced ${response.data.synced} payment terms to Xero`,
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
        <h2 className="font-bold">Integration: Xero</h2>
        <div className="mt-8 flex">
          <div className="flex w-[20%] items-center justify-center">
            <div className="bg-[#13B5EA] rounded-lg p-4">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 7.5L12 15L19.5 7.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.5 16.5L12 9L4.5 16.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="flex w-[60%] flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="name">Name</label>
              <InputText id="name" value="Xero" readOnly />
            </div>
            <div className="flex flex-col">
              <label htmlFor="description">Description</label>
              <InputTextarea
                id="description"
                value="Connect with Xero accounting platform to sync invoices, payment terms, and customer data. Features automatic token refresh and secure OAuth 2.0 authentication with PKCE."
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
                  xeroStatus?.connected ? "text-green-600" : "text-red-600"
                }`}
              >
                {xeroStatus?.connected
                  ? "Xero Connected!"
                  : "Xero Not Connected!"}
              </h3>
              {xeroStatus?.connected && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Organization: {xeroStatus.tenantName}</p>
                  <p>Last Sync: {xeroStatus.lastSync ? new Date(xeroStatus.lastSync).toLocaleString() : 'Never'}</p>
                  <p>Status: {xeroStatus.syncStatus || 'Ready'}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex gap-3">
                {xeroStatus?.connected ? (
                  <>
                    <Button
                      label="Sync Payment Terms"
                      loading={loading}
                      icon="pi pi-sync"
                      className="p-button-success"
                      onClick={syncPaymentTerms}
                    />
                    <Button
                      label="Disconnect Xero"
                      loading={loading}
                      style={{ background: "red" }}
                      icon="pi pi-times"
                      className="p-button-danger"
                      onClick={disconnectXero}
                    />
                  </>
                ) : (
                  <Button
                    label="Connect to Xero"
                    loading={loading}
                    icon="pi pi-check"
                    className="p-button-primary"
                    onClick={startXeroAuth}
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

export default XeroIntegration;