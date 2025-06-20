"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { Card } from "primereact/card";
import { MdQrCodeScanner, MdQrCode2 } from "react-icons/md";
import { FiCheck, FiX, FiSettings, FiPackage, FiCamera, FiMonitor } from "react-icons/fi";
import { HiOutlineDeviceMobile } from "react-icons/hi";
import GoPrevious from "@/components/GoPrevious";
import BarcodeBulkOperations from "./barcode/BarcodeBulkOperations";
import BarcodeStatistics from "./barcode/BarcodeStatistics";
import { useSelector } from "react-redux";

const BarcodeConfig = () => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
    const { token } = useSelector((state) => state?.authReducer);

  const [config, setConfig] = useState({
    enabled: false,
    barcodeTypes: ['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QR_CODE'],
    defaultBarcodeType: 'CODE128',
    autoGenerate: false,
    prefix: '',
    startNumber: 1000,
    allowManualEntry: true,
    requireUnique: true,
    scannerTypes: {
      usb: true,
      bluetooth: true,
      camera: true
    },
    mobileSettings: {
      enableCameraScanning: true,
      enableFlashlight: true,
      continuousScanning: false,
      scanDelay: 1000
    }
  });

  const barcodeTypeOptions = [
    { label: 'CODE128', value: 'CODE128' },
    { label: 'CODE39', value: 'CODE39' },
    { label: 'EAN-13', value: 'EAN13' },
    { label: 'EAN-8', value: 'EAN8' },
    { label: 'UPC', value: 'UPC' },
    { label: 'QR Code', value: 'QR_CODE' },
    { label: 'Data Matrix', value: 'DATA_MATRIX' },
    { label: 'PDF417', value: 'PDF417' }
  ];

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseURL}/barcode/config`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.data.success && response.data.data) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching barcode configuration:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch barcode configuration",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setSaveLoading(true);
    try {
      const response = await axios.post(
        `${BaseURL}/barcode/config`,
        config,
        {
          headers: {
          Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Barcode configuration saved successfully",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to save configuration",
        life: 3000,
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const updateConfig = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedConfig = (parent, field, value) => {
    setConfig(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Toast ref={toast} />
      <GoPrevious route="/system-setup/integrations" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-purple-100 dark:bg-purple-900/20">
            <MdQrCodeScanner className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Barcode & QR Code Configuration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure barcode scanning for inventory management
            </p>
          </div>
        </div>
      </div>

      {/* Main Configuration */}
      <Card className="mb-6">
        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Enable Barcode System
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Turn on barcode functionality for products
              </p>
            </div>
            <InputSwitch
              checked={config.enabled}
              onChange={(e) => updateConfig('enabled', e.value)}
            />
          </div>

          {config.enabled && (
            <>
              <Divider />

              {/* Barcode Types */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Barcode Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Barcode Type
                    </label>
                    <Dropdown
                      value={config.defaultBarcodeType}
                      options={barcodeTypeOptions}
                      onChange={(e) => updateConfig('defaultBarcodeType', e.value)}
                      className="w-full"
                      placeholder="Select barcode type"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Barcode Prefix (Optional)
                    </label>
                    <InputText
                      value={config.prefix}
                      onChange={(e) => updateConfig('prefix', e.target.value)}
                      className="w-full"
                      placeholder="e.g., PRD-"
                    />
                  </div>
                </div>
              </div>

              {/* Generation Settings */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Generation Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700 dark:text-gray-300">
                        Auto-generate barcodes
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically generate barcodes for new products
                      </p>
                    </div>
                    <InputSwitch
                      checked={config.autoGenerate}
                      onChange={(e) => updateConfig('autoGenerate', e.value)}
                    />
                  </div>
                  
                  {config.autoGenerate && (
                    <div className="ml-8">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Starting Number
                      </label>
                      <InputText
                        value={config.startNumber}
                        onChange={(e) => updateConfig('startNumber', parseInt(e.target.value) || 1000)}
                        className="w-32"
                        keyfilter="int"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700 dark:text-gray-300">
                        Allow manual entry
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow users to manually enter barcode numbers
                      </p>
                    </div>
                    <InputSwitch
                      checked={config.allowManualEntry}
                      onChange={(e) => updateConfig('allowManualEntry', e.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700 dark:text-gray-300">
                        Require unique barcodes
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ensure all barcodes are unique within your vendor
                      </p>
                    </div>
                    <InputSwitch
                      checked={config.requireUnique}
                      onChange={(e) => updateConfig('requireUnique', e.value)}
                    />
                  </div>
                </div>
              </div>

              <Divider />

              {/* Scanner Types */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Scanner Support
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiMonitor className="h-5 w-5 text-gray-600" />
                      <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">
                          USB Scanners
                        </label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Wired barcode scanners
                        </p>
                      </div>
                    </div>
                    <InputSwitch
                      checked={config.scannerTypes.usb}
                      onChange={(e) => updateNestedConfig('scannerTypes', 'usb', e.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiSettings className="h-5 w-5 text-gray-600" />
                      <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">
                          Bluetooth
                        </label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Wireless scanners
                        </p>
                      </div>
                    </div>
                    <InputSwitch
                      checked={config.scannerTypes.bluetooth}
                      onChange={(e) => updateNestedConfig('scannerTypes', 'bluetooth', e.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiCamera className="h-5 w-5 text-gray-600" />
                      <div>
                        <label className="font-medium text-gray-700 dark:text-gray-300">
                          Camera
                        </label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Mobile camera scanning
                        </p>
                      </div>
                    </div>
                    <InputSwitch
                      checked={config.scannerTypes.camera}
                      onChange={(e) => updateNestedConfig('scannerTypes', 'camera', e.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Settings */}
              {config.scannerTypes.camera && (
                <>
                  <Divider />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <HiOutlineDeviceMobile className="h-5 w-5" />
                      Mobile Camera Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700 dark:text-gray-300">
                            Enable flashlight toggle
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Allow users to toggle flashlight while scanning
                          </p>
                        </div>
                        <InputSwitch
                          checked={config.mobileSettings.enableFlashlight}
                          onChange={(e) => updateNestedConfig('mobileSettings', 'enableFlashlight', e.value)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700 dark:text-gray-300">
                            Continuous scanning
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Keep scanner active after successful scan
                          </p>
                        </div>
                        <InputSwitch
                          checked={config.mobileSettings.continuousScanning}
                          onChange={(e) => updateNestedConfig('mobileSettings', 'continuousScanning', e.value)}
                        />
                      </div>

                      {config.mobileSettings.continuousScanning && (
                        <div className="ml-8">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Scan Delay (ms)
                          </label>
                          <InputText
                            value={config.mobileSettings.scanDelay}
                            onChange={(e) => updateNestedConfig('mobileSettings', 'scanDelay', parseInt(e.target.value) || 1000)}
                            className="w-32"
                            keyfilter="int"
                          />
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Delay between continuous scans
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Information Messages */}
      {config.enabled && (
        <div className="space-y-4 mb-6">
          <Message
            severity="info"
            text="Barcode functionality is completely optional. Products without barcodes will continue to work normally."
          />
          <Message
            severity="success"
            text="Supports existing barcode systems - simply enter your current barcode numbers manually or scan them."
          />
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          label="Cancel"
          severity="secondary"
          onClick={() => window.history.back()}
          disabled={saveLoading}
        />
        <Button
          label="Save Configuration"
          icon={saveLoading ? null : "pi pi-save"}
          onClick={saveConfiguration}
          loading={saveLoading}
          disabled={saveLoading}
        />
      </div>
    </div>
  );
};

export default BarcodeConfig;