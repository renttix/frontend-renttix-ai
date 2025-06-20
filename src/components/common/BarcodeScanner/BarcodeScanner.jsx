"use client";
import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiCamera, FiX, FiZap, FiCameraOff, 
  FiCheckCircle, FiAlertCircle 
} from "react-icons/fi";
import { MdFlashOn, MdFlashOff, MdCameraswitch } from "react-icons/md";

const BarcodeScanner = ({ 
  visible, 
  onHide, 
  onScan, 
  acceptedFormats = ['CODE128', 'CODE39', 'EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'QR_CODE'],
  continuousScanning = false,
  scanDelay = 1000,
  showFlashlight = true
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      initializeScanner();
    } else {
      cleanup();
    }
    
    return () => cleanup();
  }, [visible]);

  const cleanup = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setError(null);
    setScanSuccess(false);
    setLastScannedCode(null);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
  };

  const initializeScanner = async () => {
    try {
      // Request camera permission
      const permissionResult = await navigator.permissions.query({ name: 'camera' });
      setHasPermission(permissionResult.state === 'granted');
      
      if (permissionResult.state === 'denied') {
        setError('Camera permission denied. Please enable camera access in your browser settings.');
        return;
      }

      // Initialize code reader
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // Get available video devices
      const videoDevices = await codeReader.listVideoInputDevices();
      setDevices(videoDevices);
      
      if (videoDevices.length === 0) {
        setError('No camera devices found');
        return;
      }

      // Select default device (prefer back camera on mobile)
      const defaultDevice = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      ) || videoDevices[0];
      
      setSelectedDeviceId(defaultDevice.deviceId);
      startScanning(defaultDevice.deviceId);
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError('Failed to initialize camera. Please check your camera permissions.');
    }
  };

  const startScanning = async (deviceId) => {
    if (!codeReaderRef.current || !videoRef.current) return;
    
    setIsScanning(true);
    setError(null);
    setScanSuccess(false);

    try {
      // Start decoding from video device
      await codeReaderRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            handleScanResult(result);
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error('Scanning error:', err);
          }
        }
      );

      // Get the stream for torch control
      if (videoRef.current && videoRef.current.srcObject) {
        setStream(videoRef.current.srcObject);
      }
    } catch (err) {
      console.error('Failed to start scanning:', err);
      setError('Failed to start camera. Please try again.');
      setIsScanning(false);
    }
  };

  const handleScanResult = (result) => {
    const code = result.getText();
    const format = result.getBarcodeFormat();
    
    // Check if format is accepted
    const formatName = getFormatName(format);
    if (!acceptedFormats.includes(formatName)) {
      return;
    }

    setLastScannedCode(code);
    setScanSuccess(true);
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Call parent callback
    onScan({
      code,
      format: formatName,
      rawBytes: result.getRawBytes()
    });

    if (!continuousScanning) {
      cleanup();
      onHide();
    } else {
      // Continue scanning after delay
      scanTimeoutRef.current = setTimeout(() => {
        setScanSuccess(false);
        setLastScannedCode(null);
      }, scanDelay);
    }
  };

  const getFormatName = (format) => {
    const formatMap = {
      0: 'AZTEC',
      1: 'CODABAR',
      2: 'CODE39',
      3: 'CODE93',
      4: 'CODE128',
      5: 'DATA_MATRIX',
      6: 'EAN_8',
      7: 'EAN_13',
      8: 'ITF',
      9: 'MAXICODE',
      10: 'PDF_417',
      11: 'QR_CODE',
      12: 'RSS_14',
      13: 'RSS_EXPANDED',
      14: 'UPC_A',
      15: 'UPC_E',
      16: 'UPC_EAN_EXTENSION'
    };
    return formatMap[format] || 'UNKNOWN';
  };

  const toggleTorch = async () => {
    if (!stream) return;
    
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const capabilities = videoTrack.getCapabilities();
      if (!capabilities.torch) {
        setError('Flashlight not supported on this device');
        return;
      }

      await videoTrack.applyConstraints({
        advanced: [{ torch: !torchEnabled }]
      });
      setTorchEnabled(!torchEnabled);
    } catch (err) {
      console.error('Failed to toggle torch:', err);
      setError('Failed to toggle flashlight');
    }
  };

  const switchCamera = async () => {
    if (devices.length <= 1) return;
    
    const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    
    setSelectedDeviceId(nextDevice.deviceId);
    
    // Stop current stream
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    
    // Start with new device
    startScanning(nextDevice.deviceId);
  };

  const dialogHeader = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FiCamera className="text-2xl text-blue-600" />
        <span className="text-xl font-semibold">Barcode Scanner</span>
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={dialogHeader}
      modal
      className="barcode-scanner-dialog"
      style={{ width: '90vw', maxWidth: '600px' }}
      contentStyle={{ padding: 0 }}
      dismissableMask={false}
      closeOnEscape={true}
    >
      <div className="relative">
        {/* Scanner View */}
        <div className="relative bg-black" style={{ minHeight: '400px' }}>
          {hasPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-8 text-center">
              <div>
                <FiCameraOff className="text-6xl mb-4 mx-auto opacity-50" />
                <p className="text-lg mb-2">Camera Permission Required</p>
                <p className="text-sm opacity-75">
                  Please allow camera access to scan barcodes
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute top-4 left-4 right-4 z-10">
              <Message severity="error" text={error} />
            </div>
          )}

          {isScanning && !error && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                style={{ minHeight: '400px' }}
              />
              
              {/* Scan Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Scan Frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 border-2 border-white rounded-lg opacity-50"></div>
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                    
                    {/* Scan Line Animation */}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-blue-500"
                      animate={{
                        top: ['0%', '100%', '0%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-sm bg-black bg-opacity-50 rounded-lg px-4 py-2 inline-block">
                    Position barcode within the frame
                  </p>
                </div>
              </div>

              {/* Success Overlay */}
              <AnimatePresence>
                {scanSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-90"
                  >
                    <div className="text-center text-white">
                      <FiCheckCircle className="text-6xl mb-4 mx-auto" />
                      <p className="text-xl font-semibold mb-2">Scanned Successfully!</p>
                      <p className="text-lg font-mono">{lastScannedCode}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {!isScanning && !error && !hasPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ProgressSpinner />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {showFlashlight && stream && (
                <Button
                  icon={torchEnabled ? <MdFlashOff /> : <MdFlashOn />}
                  className="p-button-rounded p-button-text"
                  onClick={toggleTorch}
                  tooltip={torchEnabled ? "Turn off flashlight" : "Turn on flashlight"}
                  tooltipOptions={{ position: 'top' }}
                />
              )}
              
              {devices.length > 1 && (
                <Button
                  icon={<MdCameraswitch />}
                  className="p-button-rounded p-button-text"
                  onClick={switchCamera}
                  tooltip="Switch camera"
                  tooltipOptions={{ position: 'top' }}
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => {
                  cleanup();
                  onHide();
                }}
              />
            </div>
          </div>

          {continuousScanning && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <FiZap className="inline mr-1" />
                Continuous scanning enabled
              </p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default BarcodeScanner;