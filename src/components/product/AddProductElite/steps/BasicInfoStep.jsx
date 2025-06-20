import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tooltip } from "primereact/tooltip";
import { Toast } from "primereact/toast";
import { motion } from "framer-motion";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";
import { useBarcodeConfig } from "@/hooks/useBarcodeConfig";
import BarcodeScanner from "@/components/common/BarcodeScanner/BarcodeScanner";
import BarcodeScannerInput from "@/components/common/BarcodeScanner/BarcodeScannerInput";
import {
  FiPackage, FiEdit3, FiRefreshCw, FiZap, FiInfo,
  FiHash, FiX, FiCheck, FiCopy, FiCamera
} from "react-icons/fi";
import { MdQrCodeScanner } from "react-icons/md";

const generateRandomAssetNo = () =>
  `Asset-${Math.floor(1000 + Math.random() * 9000)}`;

export default function BasicInfoStep({ formData, updateFormData, errors, token }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showSmartTips, setShowSmartTips] = useState(true);
  const { isBarcodeEnabled, barcodeConfig } = useBarcodeConfig();
  const [validatingBarcode, setValidatingBarcode] = useState(false);
  const toast = useRef(null);
  
  // Initialize uniqueAssetNo if not present
  useEffect(() => {
    if (!formData.uniqueAssetNo) {
      updateFormData({ uniqueAssetNo: generateRandomAssetNo() });
    }
  }, []);
  
  const generateAIDescription = async () => {
    if (!formData.productName) {
      setAiError("Please enter a product name first");
      return;
    }
    
    setAiLoading(true);
    setAiError("");
    
    try {
      const response = await axios.post(
        `${BaseURL}/product/product/description`,
        { prompt: `Write a professional and compelling product description for a rental item called "${formData.productName}"${formData.companyProductName ? ` manufactured by ${formData.companyProductName}` : ''}. Include key features, benefits, and ideal use cases.` },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        updateFormData({ productDescription: response.data.message });
      } else {
        setAiError(response.data.error || "Failed to generate description");
      }
    } catch (error) {
      setAiError(error.response?.data?.error || "AI service unavailable");
    } finally {
      setAiLoading(false);
    }
  };
  
  const generateAssetNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    const prefix = formData.status === "Rental" ? "RNT" : "SLE";
    updateFormData({ uniqueAssetNo: `${prefix}-${timestamp}-${random}` });
  };
  
  const handleBarcodeScan = async (scanResult) => {
    const { code, format } = scanResult;
    
    // Validate the scanned barcode
    setValidatingBarcode(true);
    try {
      const response = await axios.post(
        `${BaseURL}/barcode/validate`,
        { barcode: code, productId: null },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        updateFormData({
          barcode: code,
          barcodeType: format,
          barcodeEnabled: true
        });
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: `Barcode ${code} scanned successfully`,
          life: 3000,
        });
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Invalid Barcode",
          detail: response.data.message || "This barcode is already in use",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Barcode validation error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to validate barcode",
        life: 3000,
      });
    } finally {
      setValidatingBarcode(false);
      setShowBarcodeScanner(false);
    }
  };
  
  const validateBarcodeManual = async (value) => {
    if (!value || !barcodeConfig?.requireUnique) return;
    
    try {
      const response = await axios.post(
        `${BaseURL}/barcode/validate`,
        { barcode: value, productId: null },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.data.success) {
        toast.current?.show({
          severity: "warn",
          summary: "Barcode In Use",
          detail: "This barcode is already assigned to another product",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Barcode validation error:", error);
    }
  };
  
  return (
    <div className="space-y-6">
      <Toast ref={toast} />
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiPackage className="mr-3 text-blue-600" />
          Basic Product Information
        </h2>
        <p className="mt-2 text-gray-600">
          Start by entering the essential details about your product
        </p>
      </div>
      
      {/* Smart Tips */}
      {showSmartTips && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiZap className="text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                Quick Tips for Getting Started
              </span>
            </div>
            <button
              onClick={() => setShowSmartTips(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-start space-x-2">
              <FiCheck className="text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Clear Product Names</p>
                <p className="text-xs text-gray-600">Use names customers search for</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <FiCheck className="text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Complete Descriptions</p>
                <p className="text-xs text-gray-600">Include all specs & features</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <FiCheck className="text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Quality Images</p>
                <p className="text-xs text-gray-600">Show product from all angles</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Product Type */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Product Type</h3>
          <Button
            label="Copy from existing product"
            icon={<FiCopy />}
            className="p-button-text p-button-sm"
            onClick={() => {/* TODO: Implement product copy modal */}}
            tooltip="Copy details from an existing product"
            tooltipOptions={{ position: 'left' }}
          />
        </div>
        <div className="flex items-center space-x-6">
          <label className="flex items-center cursor-pointer group">
            <RadioButton
              inputId="rental"
              name="status"
              value="Rental"
              onChange={(e) => updateFormData({ status: e.value })}
              checked={formData.status === "Rental"}
            />
            <span className="ml-3 text-gray-700 group-hover:text-gray-900">
              Rental Product
            </span>
          </label>
          
          <label className="flex items-center cursor-pointer group">
            <RadioButton
              inputId="sale"
              name="status"
              value="Sale"
              onChange={(e) => updateFormData({ status: e.value })}
              checked={formData.status === "Sale"}
            />
            <span className="ml-3 text-gray-700 group-hover:text-gray-900">
              Sale Item
            </span>
          </label>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <InputText
            value={formData.productName}
            onChange={(e) => updateFormData({ productName: e.target.value })}
            placeholder="e.g., Professional Camera Kit"
            className={`w-full ${errors.productName ? 'p-invalid' : ''}`}
          />
          {errors.productName && (
            <small className="text-red-500 text-xs mt-1">{errors.productName}</small>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manufacturer/Brand
          </label>
          <InputText
            value={formData.companyProductName}
            onChange={(e) => updateFormData({ companyProductName: e.target.value })}
            placeholder="e.g., Canon"
            className="w-full"
          />
        </div>
      </div>
      
      {/* Asset Number and Barcode */}
      <div className={`grid grid-cols-1 ${isBarcodeEnabled ? 'md:grid-cols-2' : ''} gap-6`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Starting Asset Number
          </label>
          <div className="flex items-center space-x-2">
            <InputText
              name="uniqueAssetNo"
              value={formData.uniqueAssetNo || ''}
              onChange={(e) => updateFormData({ uniqueAssetNo: e.target.value })}
              placeholder="Asset-1234"
              className="flex-1"
            />
            <Button
              icon={<FiRefreshCw />}
              className="p-button-outlined p-button-secondary"
              onClick={() => updateFormData({ uniqueAssetNo: generateRandomAssetNo() })}
              tooltip="Generate new asset number"
              tooltipOptions={{ position: 'top' }}
            />
          </div>
        </div>
        
        {isBarcodeEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barcode {barcodeConfig?.requireUnique && <span className="text-xs text-gray-500">(Optional)</span>}
            </label>
            <div className="flex items-center space-x-2">
              <BarcodeScannerInput
                name="barcode"
                value={formData.barcode || ''}
                onChange={(e) => updateFormData({ barcode: e.target.value })}
                onScan={handleBarcodeScan}
                onBlur={(e) => validateBarcodeManual(e.target.value)}
                placeholder={barcodeConfig?.allowManualEntry ? "Enter or scan barcode" : "Scan barcode"}
                className="flex-1"
                disabled={!barcodeConfig?.allowManualEntry && !showBarcodeScanner}
                scannerConfig={{
                  scanThreshold: 100,
                  minLength: 4,
                  successDuration: 2000
                }}
                showScanIndicator={barcodeConfig?.scannerTypes?.usb || barcodeConfig?.scannerTypes?.bluetooth}
              />
              {barcodeConfig?.scannerTypes?.camera && (
                <Button
                  icon={validatingBarcode ? <ProgressSpinner style={{ width: '20px', height: '20px' }} /> : <MdQrCodeScanner />}
                  className="p-button-outlined p-button-secondary"
                  onClick={() => setShowBarcodeScanner(true)}
                  disabled={validatingBarcode}
                  tooltip="Scan barcode with camera"
                  tooltipOptions={{ position: 'top' }}
                />
              )}
            </div>
            {barcodeConfig?.autoGenerate && !formData.barcode && (
              <small className="text-gray-500 text-xs mt-1">
                A barcode will be auto-generated if not provided
              </small>
            )}
          </div>
        )}
      </div>
      
      {/* Product Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Product Description <span className="text-red-500">*</span>
          </label>
          
          <div className="flex items-center space-x-2">
            <Tooltip target=".ai-help" content="AI will write a description based on your product name" />
            <Button
              icon={aiLoading ? <ProgressSpinner style={{ width: '20px', height: '20px' }} /> : <FiEdit3 />}
              label={aiLoading ? "Generating..." : "Write with AI"}
              onClick={generateAIDescription}
              disabled={!formData.productName || aiLoading}
              className="ai-help p-button-sm p-button-outlined"
            />
          </div>
        </div>
        
        <InputTextarea
          value={formData.productDescription}
          onChange={(e) => updateFormData({ productDescription: e.target.value })}
          rows={6}
          placeholder="Describe your product's features, benefits, and ideal use cases..."
          className={`w-full ${errors.productDescription ? 'p-invalid' : ''}`}
        />
        
        {errors.productDescription && (
          <small className="text-red-500 text-xs mt-1">{errors.productDescription}</small>
        )}
        
        {aiError && (
          <small className="text-red-500 text-xs mt-1">{aiError}</small>
        )}
        
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>{formData.productDescription.length} characters</span>
          <span>Recommended: 100-500 characters</span>
        </div>
      </div>
      
      
      {/* Universal Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"
      >
        <div className="flex items-start">
          <FiInfo className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-2">Best Practices for Any Rental Business:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>
                <p className="font-medium">✓ Searchable Names</p>
                <p className="text-gray-600">Use terms your customers search for</p>
              </div>
              <div>
                <p className="font-medium">✓ Complete Info</p>
                <p className="text-gray-600">Include all specs, requirements & inclusions</p>
              </div>
              <div>
                <p className="font-medium">✓ Clear Pricing</p>
                <p className="text-gray-600">Be transparent about rates and deposits</p>
              </div>
              <div>
                <p className="font-medium">✓ Quality Images</p>
                <p className="text-gray-600">Show condition and included accessories</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onHide={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScan}
        acceptedFormats={barcodeConfig?.barcodeTypes || ['CODE128', 'CODE39', 'EAN13', 'QR_CODE']}
        continuousScanning={barcodeConfig?.mobileSettings?.continuousScanning || false}
        scanDelay={barcodeConfig?.mobileSettings?.scanDelay || 1000}
        showFlashlight={barcodeConfig?.mobileSettings?.enableFlashlight || true}
      />
    </div>
  );
}