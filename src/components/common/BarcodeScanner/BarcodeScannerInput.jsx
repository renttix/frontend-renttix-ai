"use client";
import React, { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { FiCheck, FiAlertCircle } from "react-icons/fi";
import { MdQrCodeScanner } from "react-icons/md";

/**
 * BarcodeScannerInput - Enhanced input component that handles USB/Bluetooth scanner input
 * 
 * USB/Bluetooth scanners typically work by:
 * 1. Acting as a keyboard input device
 * 2. Rapidly typing the barcode value
 * 3. Ending with an Enter key press
 * 
 * This component detects rapid input and processes it as a scan
 */
const BarcodeScannerInput = ({
  value,
  onChange,
  onScan,
  onBlur,
  placeholder = "Enter or scan barcode",
  disabled = false,
  className = "",
  scannerConfig = {},
  showScanIndicator = true,
  autoFocus = false,
  validateOnScan = true,
  ...props
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const inputRef = useRef(null);
  const scanBufferRef = useRef("");
  const scanTimerRef = useRef(null);
  
  // Configuration
  const SCAN_THRESHOLD_MS = scannerConfig.scanThreshold || 100; // Max time between keystrokes for scanner
  const SCAN_MIN_LENGTH = scannerConfig.minLength || 4; // Minimum barcode length
  const SCAN_SUCCESS_DURATION = scannerConfig.successDuration || 2000; // How long to show success

  useEffect(() => {
    // Clear scan buffer on unmount
    return () => {
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e) => {
    // Detect Enter key which most scanners send after barcode
    if (e.key === 'Enter' && scanBufferRef.current.length >= SCAN_MIN_LENGTH) {
      e.preventDefault();
      processScan(scanBufferRef.current);
      scanBufferRef.current = "";
      return;
    }
  };

  const handleInput = (e) => {
    const inputValue = e.target.value;
    const currentTime = Date.now();
    
    // Check if this is likely scanner input (rapid typing)
    if (lastScanTime && (currentTime - lastScanTime) < SCAN_THRESHOLD_MS) {
      setIsScanning(true);
      scanBufferRef.current = inputValue;
      
      // Reset timer for end of scan detection
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
      }
      
      scanTimerRef.current = setTimeout(() => {
        if (scanBufferRef.current.length >= SCAN_MIN_LENGTH) {
          processScan(scanBufferRef.current);
        }
        setIsScanning(false);
        scanBufferRef.current = "";
      }, SCAN_THRESHOLD_MS * 2);
    } else {
      // Normal typing
      scanBufferRef.current = inputValue;
    }
    
    setLastScanTime(currentTime);
    onChange(e);
  };

  const processScan = (scannedValue) => {
    setIsScanning(false);
    setScanSuccess(true);
    
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // Call scan handler if provided
    if (onScan) {
      onScan({
        code: scannedValue,
        format: detectBarcodeFormat(scannedValue),
        source: 'scanner'
      });
    }
    
    // Clear success indicator after duration
    setTimeout(() => {
      setScanSuccess(false);
    }, SCAN_SUCCESS_DURATION);
  };

  const detectBarcodeFormat = (code) => {
    // Basic format detection based on patterns
    if (/^[0-9]{13}$/.test(code)) return 'EAN13';
    if (/^[0-9]{8}$/.test(code)) return 'EAN8';
    if (/^[0-9]{12}$/.test(code)) return 'UPC';
    if (/^[A-Z0-9\-\.\ \$\/\+\%]+$/i.test(code) && code.length <= 48) return 'CODE39';
    if (code.length > 10 && code.length < 200) return 'CODE128';
    if (code.startsWith('http') || code.includes('://')) return 'QR_CODE';
    return 'UNKNOWN';
  };

  const handleFocus = () => {
    // Clear any existing scan state
    scanBufferRef.current = "";
    setLastScanTime(Date.now());
  };

  return (
    <div className="relative">
      <div className={`relative ${scanSuccess ? 'scanner-success' : ''}`}>
        <InputText
          ref={inputRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`
            ${className}
            ${isScanning ? 'scanning-active' : ''}
            ${scanSuccess ? 'scan-success' : ''}
            pr-10
          `}
          {...props}
        />
        
        {/* Scan Indicator */}
        {showScanIndicator && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isScanning && (
              <MdQrCodeScanner className="text-blue-500 text-xl animate-pulse" />
            )}
            {scanSuccess && !isScanning && (
              <FiCheck className="text-green-500 text-xl" />
            )}
            {!isScanning && !scanSuccess && (
              <MdQrCodeScanner className="text-gray-400 text-xl opacity-50" />
            )}
          </div>
        )}
      </div>
      
      {/* Scanner Status Messages */}
      {isScanning && (
        <div className="absolute -bottom-6 left-0 text-xs text-blue-600 flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          Scanning...
        </div>
      )}
      
      {scanSuccess && (
        <div className="absolute -bottom-6 left-0 text-xs text-green-600 flex items-center gap-1">
          <FiCheck className="text-sm" />
          Scanned successfully
        </div>
      )}
      
      <style jsx>{`
        .scanning-active {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        .scan-success {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }
        
        .scanner-success {
          animation: success-flash 0.5s ease-out;
        }
        
        @keyframes success-flash {
          0% {
            background-color: rgba(16, 185, 129, 0);
          }
          50% {
            background-color: rgba(16, 185, 129, 0.1);
          }
          100% {
            background-color: rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScannerInput;