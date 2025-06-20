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
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";

const TallyIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const { user } = useSelector((state) => state?.authReducer);
  const [tallyStatus, setTallyStatus] = useState(null);
  const toast = React.useRef(null);
  
  // Connection form state
  const [connectionData, setConnectionData] = useState({
    serverUrl: "http://localhost",
    port: "9000",
    companyName: "",
    apiKey: "",
  });

  // Check Tally connection status on mount
  useEffect(() => {
    checkTallyStatus();
  }, []);

  const checkTallyStatus = async () => {
    try {
      setCheckingStatus(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BaseURL}/tally/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTallyStatus(response.data);
    } catch (error) {
      console.error("Error checking Tally status:", error);
      setTallyStatus({ connected: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  const connectTally = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BaseURL}/tally/connect`,
        {
          ...connectionData,
          port: parseInt(connectionData.port),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: `Connected to ${response.data.companyName} successfully`,
        life: 3000,
      });
      
      setShowConnectDialog(false);
      checkTallyStatus();
    } catch (error) {
      console.error("Error connecting to Tally:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.error || "Failed to connect to Tally",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectTally = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${BaseURL}/tally/disconnect`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Tally disconnected successfully",
        life: 3000,
      });
      
      setTallyStatus({ connected: false });
    } catch (error) {
      console.error("Error disconnecting Tally:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to disconnect Tally",
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
        `${BaseURL}/tally/sync/customers`,
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
        detail: `${response.data.totalSynced} customers synced from Tally`,
        life: 3000,
      });
      
      checkTallyStatus();
    } catch (error) {
      console.error("Error syncing customers:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to sync customers from Tally",
        life: 3000,
      });
    } finally {
      setSyncing(false);
    }
  };

  const connectDialogFooter = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setShowConnectDialog(false)}
        className="p-button-text"
        disabled={loading}
      />
      <Button
        label="Connect"
        icon="pi pi-check"
        onClick={connectTally}
        loading={loading}
        disabled={!connectionData.serverUrl || !connectionData.apiKey}
      />
    </div>
  );

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
            <div className="p-3 bg-orange-100 rounded-lg">
              <img 
                src="/images/integrations/tally-logo.png" 
                alt="Tally" 
                className="w-8 h-8"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<i class="pi pi-calculator text-2xl text-orange-600"></i>';
                }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tally</h3>
              <p className="text-sm text-gray-600">
                India's leading business accounting software
              </p>
            </div>
          </div>
          <Tag 
            value={tallyStatus?.connected ? "Connected" : "Not Connected"} 
            severity={tallyStatus?.connected ? "success" : "warning"}
            icon={tallyStatus?.connected ? "pi pi-check" : "pi pi-times"}
          />
        </div>

        <Divider />

        {tallyStatus?.connected ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <i className="pi pi-check-circle text-green-600"></i>
                <span className="font-medium text-green-800">
                  Connected to Tally
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Company: {tallyStatus.companyName}
              </p>
              <p className="text-sm text-gray-600">
                Server: {tallyStatus.serverUrl}:{tallyStatus.port}
              </p>
              {tallyStatus.version && (
                <p className="text-sm text-gray-600">
                  Version: {tallyStatus.version}
                </p>
              )}
              {tallyStatus.lastSyncAt && (
                <p className="text-sm text-gray-600">
                  Last Sync: {new Date(tallyStatus.lastSyncAt).toLocaleString()}
                </p>
              )}
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
                onClick={disconnectTally}
                loading={loading}
                className="p-button-sm p-button-danger"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <i className="pi pi-info-circle mr-2"></i>
                Ensure Tally is running with API access enabled for real-time sync.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Connect your Tally account to:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <i className="pi pi-check text-green-600 mt-0.5"></i>
                  <span>Sync ledgers and customer data in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="pi pi-check text-green-600 mt-0.5"></i>
                  <span>Create sales vouchers directly from Renttix</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="pi pi-check text-green-600 mt-0.5"></i>
                  <span>Track receipts and payments automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="pi pi-check text-green-600 mt-0.5"></i>
                  <span>Full GST compliance for Indian businesses</span>
                </li>
              </ul>
            </div>

            <Button
              label="Connect Tally"
              icon={<PiPlugFill className="mr-2" />}
              onClick={() => setShowConnectDialog(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 border-orange-600"
            />

            <p className="text-xs text-gray-500 text-center">
              Requires Tally Prime with API access enabled
            </p>
          </div>
        )}
      </Card>

      <Dialog
        header="Connect to Tally"
        visible={showConnectDialog}
        style={{ width: "450px" }}
        onHide={() => setShowConnectDialog(false)}
        footer={connectDialogFooter}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Server URL
            </label>
            <InputText
              value={connectionData.serverUrl}
              onChange={(e) => setConnectionData({ ...connectionData, serverUrl: e.target.value })}
              placeholder="http://localhost"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Port
            </label>
            <InputText
              value={connectionData.port}
              onChange={(e) => setConnectionData({ ...connectionData, port: e.target.value })}
              placeholder="9000"
              keyfilter="int"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Company Name (Optional)
            </label>
            <InputText
              value={connectionData.companyName}
              onChange={(e) => setConnectionData({ ...connectionData, companyName: e.target.value })}
              placeholder="Your Company Name"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              API Key
            </label>
            <Password
              value={connectionData.apiKey}
              onChange={(e) => setConnectionData({ ...connectionData, apiKey: e.target.value })}
              placeholder="Enter API Key"
              toggleMask
              feedback={false}
              className="w-full"
            />
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <i className="pi pi-exclamation-triangle mr-2"></i>
              Make sure Tally is running and API access is enabled in Tally Prime.
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default TallyIntegration;