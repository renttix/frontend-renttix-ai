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
  const { user } = useSelector((state) => state?.authReducer);
  const [zohoStatus, setZohoStatus] = useState(null);
  const toast = React.useRef(null);

  // Check Zoho connection status on mount
  useEffect(() => {
    checkZohoStatus();
  }, []);

  const checkZohoStatus = async () => {
    try {
      setCheckingStatus(true);
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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

  const syncCustomers = async () => {
    try {
      setSyncing(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BaseURL}/zoho/sync/customers`,
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
        detail: `${response.data.totalSynced} customers synced from Zoho Books`,
        life: 3000,
      });
    } catch (error) {
      console.error("Error syncing customers:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to sync customers from Zoho Books",
        life: 3000,
      });
    } finally {
      setSyncing(false);
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
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <img 
                src="/images/integrations/zoho-logo.png" 
                alt="Zoho Books" 
                className="w-8 h-8"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<i class="pi pi-book text-2xl text-green-600"></i>';
                }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Zoho Books</h3>
              <p className="text-sm text-gray-600">
                Global accounting software with multi-currency support
              </p>
            </div>
          </div>
          <Tag 
            value={zohoStatus?.connected ? "Connected" : "Not Connected"} 
            severity={zohoStatus?.connected ? "success" : "warning"}
            icon={zohoStatus?.connected ? "pi pi-check" : "pi pi-times"}
          />
        </div>

        <Divider />

        {zohoStatus?.connected ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <i className="pi pi-check-circle text-green-600"></i>
                <span className="font-medium text-green-800">
                  Connected to Zoho Books
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Organization ID: {zohoStatus.organizationId}
              </p>
              <p className="text-sm text-gray-600">
                Connected: {new Date(zohoStatus.connectedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                label="Sync Customers"
                icon="pi pi-sync"
                onClick={syncCustomers}
                loading={syncing}
                className="p-button-sm"
              />
              <Button
                label="Disconnect"
                icon="pi pi-times"
                onClick={disconnectZoho}
                loading={loading}
                className="p-button-sm p-button-danger"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <i className="pi pi-info-circle mr-2"></i>
                Your Zoho Books data is automatically synced. You can manually sync customers anytime.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Connect your Zoho Books account to:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <i className="pi pi-check text-green-600 mt-0.5"></i>
                  <span>Automatically sync customers and contacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="pi pi-check text-green-600 mt-0.5"></i>
                  <span>Create and manage invoices directly from Renttix</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="pi pi-check text-green-600 mt-0.5"></i>
                  <span>Track payments and financial data in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="pi pi-check text-green-600 mt-0.5"></i>
                  <span>Support for 180+ countries with multi-currency</span>
                </li>
              </ul>
            </div>

            <Button
              label="Connect Zoho Books"
              icon={<PiPlugFill className="mr-2" />}
              onClick={startZohoAuth}
              loading={loading}
              className="w-full bg-green-600 hover:bg-green-700 border-green-600"
            />

            <p className="text-xs text-gray-500 text-center">
              You'll be redirected to Zoho to authorize the connection
            </p>
          </div>
        )}
      </Card>
    </>
  );
};

export default ZohoIntegration;