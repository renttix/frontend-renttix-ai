"use client";
import React from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import "./BarcodeLabelPrint.css";

/**
 * BarcodeLabelPrint - Component for rendering printable barcode labels
 * Supports multiple barcode formats and label layouts
 */
const BarcodeLabelPrint = ({ labels, format = 'standard', onClose }) => {
  const barcodeRef = React.useRef({});

  React.useEffect(() => {
    // Generate barcodes for each label
    labels.forEach((label, index) => {
      if (label.barcodeType === 'QR_CODE') {
        // Generate QR Code
        QRCode.toCanvas(
          barcodeRef.current[`qr-${index}`],
          label.barcode,
          {
            width: 128,
            margin: 1,
            errorCorrectionLevel: 'M'
          }
        );
      } else {
        // Generate linear barcode
        try {
          JsBarcode(
            barcodeRef.current[`barcode-${index}`],
            label.barcode,
            {
              format: mapBarcodeFormat(label.barcodeType),
              width: 2,
              height: 50,
              displayValue: true,
              fontSize: 12,
              margin: 5
            }
          );
        } catch (error) {
          console.error('Barcode generation error:', error);
        }
      }
    });
  }, [labels]);

  const mapBarcodeFormat = (type) => {
    const formatMap = {
      'CODE128': 'CODE128',
      'CODE39': 'CODE39',
      'EAN13': 'EAN13',
      'EAN8': 'EAN8',
      'UPC': 'UPC',
      'UPC_A': 'UPC',
      'ITF': 'ITF',
      'ITF14': 'ITF14',
      'MSI': 'MSI',
      'PHARMACODE': 'pharmacode',
      'CODABAR': 'codabar'
    };
    return formatMap[type] || 'CODE128';
  };

  const renderStandardLabel = (label, index) => (
    <div key={index} className="barcode-label standard">
      <div className="label-content">
        <div className="product-name">{label.productName}</div>
        {label.barcodeType === 'QR_CODE' ? (
          <canvas
            ref={el => barcodeRef.current[`qr-${index}`] = el}
            className="qr-code"
          />
        ) : (
          <svg
            ref={el => barcodeRef.current[`barcode-${index}`] = el}
            className="barcode"
          />
        )}
        {label.price && (
          <div className="price">${label.price}</div>
        )}
      </div>
    </div>
  );

  const renderDetailedLabel = (label, index) => (
    <div key={index} className="barcode-label detailed">
      <div className="label-content">
        <div className="company-name">{label.companyName || 'Renttix'}</div>
        <div className="product-name">{label.productName}</div>
        {label.barcodeType === 'QR_CODE' ? (
          <canvas
            ref={el => barcodeRef.current[`qr-${index}`] = el}
            className="qr-code"
          />
        ) : (
          <svg
            ref={el => barcodeRef.current[`barcode-${index}`] = el}
            className="barcode"
          />
        )}
        <div className="label-footer">
          <div className="price">${label.price}</div>
          <div className="print-date">{label.printDate}</div>
        </div>
      </div>
    </div>
  );

  const renderMinimalLabel = (label, index) => (
    <div key={index} className="barcode-label minimal">
      <div className="label-content">
        {label.barcodeType === 'QR_CODE' ? (
          <canvas
            ref={el => barcodeRef.current[`qr-${index}`] = el}
            className="qr-code-minimal"
          />
        ) : (
          <svg
            ref={el => barcodeRef.current[`barcode-${index}`] = el}
            className="barcode-minimal"
          />
        )}
        <div className="price-minimal">${label.price}</div>
      </div>
    </div>
  );

  const renderLabel = (label, index) => {
    switch (format) {
      case 'detailed':
        return renderDetailedLabel(label, index);
      case 'minimal':
        return renderMinimalLabel(label, index);
      default:
        return renderStandardLabel(label, index);
    }
  };

  return (
    <div className="barcode-print-container">
      {/* Print styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .barcode-print-container,
          .barcode-print-container * {
            visibility: visible;
          }
          .barcode-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Print header (hidden on print) */}
      <div className="no-print print-header">
        <h2>Barcode Labels Preview</h2>
        <div className="print-actions">
          <button onClick={() => window.print()} className="print-button">
            Print Labels
          </button>
          <button onClick={onClose} className="close-button">
            Close
          </button>
        </div>
      </div>

      {/* Labels grid */}
      <div className={`labels-grid ${format}`}>
        {labels.map((label, index) => renderLabel(label, index))}
      </div>
    </div>
  );
};

export default BarcodeLabelPrint;