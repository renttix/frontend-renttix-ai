"use client";
import React, { useState, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";
import { 
  FiUpload, FiDownload, FiFileText, FiCheck, 
  FiX, FiAlertCircle, FiPackage 
} from "react-icons/fi";
import { MdQrCode2, MdPrint } from "react-icons/md";

const BarcodeBulkOperations = () => {
  const toast = useRef(null);
  const fileUploadRef = useRef(null);
  
  const [importResults, setImportResults] = useState(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [includeEmpty, setIncludeEmpty] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [labelFormat, setLabelFormat] = useState('standard');
  const [generatingLabels, setGeneratingLabels] = useState(false);
  const [showLabelPreview, setShowLabelPreview] = useState(false);
  const [labelData, setLabelData] = useState(null);

  const labelFormats = [
    { label: 'Standard (Name, Barcode, Price)', value: 'standard' },
    { label: 'Detailed (With Company Info)', value: 'detailed' },
    { label: 'Minimal (Barcode & Price Only)', value: 'minimal' }
  ];

  // Handle CSV import
  const handleImport = async (event) => {
    const file = event.files[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${BaseURL}/barcode/bulk/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setImportResults(response.data.results);
        setShowImportDialog(true);
        
        toast.current?.show({
          severity: 'success',
          summary: 'Import Complete',
          detail: `Processed ${response.data.results.successful} barcodes successfully`,
          life: 3000
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Import Failed',
        detail: error.response?.data?.message || 'Failed to import barcodes',
        life: 3000
      });
    } finally {
      setImporting(false);
      fileUploadRef.current?.clear();
    }
  };

  // Handle CSV export
  const handleExport = async () => {
    setExportLoading(true);
    
    try {
      const response = await axios.get(
        `${BaseURL}/barcode/bulk/export?includeEmpty=${includeEmpty}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `barcodes-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.current?.show({
        severity: 'success',
        summary: 'Export Successful',
        detail: 'Barcode data exported successfully',
        life: 3000
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Export Failed',
        detail: 'Failed to export barcode data',
        life: 3000
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Generate sample CSV
  const downloadSampleCSV = () => {
    const sampleData = [
      ['productId', 'barcode', 'barcodeType'],
      ['507f1f77bcf86cd799439011', '1234567890123', 'EAN13'],
      ['507f1f77bcf86cd799439012', 'ABC-123-XYZ', 'CODE128'],
      ['507f1f77bcf86cd799439013', '987654321', 'CODE39']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'barcode-import-sample.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // Generate barcode labels
  const generateLabels = async () => {
    if (selectedProducts.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'No Products Selected',
        detail: 'Please select products to generate labels',
        life: 3000
      });
      return;
    }

    setGeneratingLabels(true);

    try {
      const response = await axios.post(
        `${BaseURL}/barcode/labels`,
        {
          productIds: selectedProducts.map(p => p._id),
          labelFormat: labelFormat
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setLabelData(response.data.data);
        setShowLabelPreview(true);
      }
    } catch (error) {
      console.error('Label generation error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Generation Failed',
        detail: 'Failed to generate barcode labels',
        life: 3000
      });
    } finally {
      setGeneratingLabels(false);
    }
  };

  // Import results dialog content
  const importResultsContent = () => {
    if (!importResults) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FiCheck className="text-green-600 text-xl" />
              <span className="font-semibold text-green-700 dark:text-green-400">
                Successful
              </span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {importResults.successful}
            </p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FiX className="text-red-600 text-xl" />
              <span className="font-semibold text-red-700 dark:text-red-400">
                Failed
              </span>
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
              {importResults.failed}
            </p>
          </div>
        </div>

        {importResults.details.errors.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <FiAlertCircle className="text-orange-600" />
              Errors
            </h4>
            <div className="max-h-60 overflow-y-auto">
              <DataTable 
                value={importResults.details.errors} 
                size="small"
                className="text-sm"
              >
                <Column field="row" header="Row" style={{ width: '80px' }} />
                <Column field="productId" header="Product ID" />
                <Column field="error" header="Error" />
              </DataTable>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Label preview dialog content
  const labelPreviewContent = () => {
    if (!labelData) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            {labelData.count} labels ready for printing
          </span>
          <Tag value={labelFormat} severity="info" />
        </div>

        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {labelData.labels.slice(0, 6).map((label, index) => (
            <div 
              key={index} 
              className="border-2 border-dashed border-gray-300 p-4 rounded-lg"
            >
              <div className="text-center space-y-2">
                {label.productName && (
                  <p className="font-semibold text-sm">{label.productName}</p>
                )}
                <div className="bg-gray-100 p-2 rounded">
                  <MdQrCode2 className="text-4xl mx-auto" />
                  <p className="font-mono text-xs mt-1">{label.barcode}</p>
                </div>
                {label.price && (
                  <p className="text-lg font-bold">${label.price}</p>
                )}
                {label.companyName && (
                  <p className="text-xs text-gray-600">{label.companyName}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {labelData.count > 6 && (
          <p className="text-center text-sm text-gray-600">
            ... and {labelData.count - 6} more labels
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      {/* Import/Export Section */}
      <Card>
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FiFileText className="text-blue-600" />
            Bulk Import/Export
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Import */}
            <div className="space-y-4">
              <h4 className="font-medium">Import Barcodes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a CSV file to bulk assign barcodes to products
              </p>
              
              <FileUpload
                ref={fileUploadRef}
                mode="basic"
                accept=".csv"
                maxFileSize={10000000}
                onSelect={handleImport}
                disabled={importing}
                chooseLabel={importing ? "Importing..." : "Choose CSV File"}
                className="w-full"
              />
              
              <Button
                label="Download Sample CSV"
                icon="pi pi-download"
                className="p-button-text p-button-sm"
                onClick={downloadSampleCSV}
              />
              
              <Message 
                severity="info" 
                text="CSV format: productId, barcode, barcodeType (optional)"
              />
            </div>

            {/* Export */}
            <div className="space-y-4">
              <h4 className="font-medium">Export Barcodes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download all product barcodes as a CSV file
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  inputId="includeEmpty"
                  checked={includeEmpty}
                  onChange={(e) => setIncludeEmpty(e.checked)}
                />
                <label htmlFor="includeEmpty" className="text-sm">
                  Include products without barcodes
                </label>
              </div>
              
              <Button
                label="Export to CSV"
                icon={<FiDownload />}
                loading={exportLoading}
                onClick={handleExport}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Label Generation Section */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MdPrint className="text-purple-600" />
            Barcode Label Generation
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate printable barcode labels for selected products
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Label Format
              </label>
              <Dropdown
                value={labelFormat}
                options={labelFormats}
                onChange={(e) => setLabelFormat(e.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                label="Generate Labels"
                icon={<MdQrCode2 />}
                onClick={generateLabels}
                loading={generatingLabels}
                disabled={selectedProducts.length === 0}
              />
            </div>
          </div>

          <Message 
            severity="warn" 
            text="Select products from your product list to generate labels"
          />
        </div>
      </Card>

      {/* Import Results Dialog */}
      <Dialog
        visible={showImportDialog}
        onHide={() => setShowImportDialog(false)}
        header="Import Results"
        style={{ width: '600px' }}
        modal
      >
        {importResultsContent()}
      </Dialog>

      {/* Label Preview Dialog */}
      <Dialog
        visible={showLabelPreview}
        onHide={() => setShowLabelPreview(false)}
        header="Label Preview"
        style={{ width: '700px' }}
        modal
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setShowLabelPreview(false)}
            />
            <Button
              label="Print Labels"
              icon="pi pi-print"
              onClick={() => {
                window.print();
                setShowLabelPreview(false);
              }}
            />
          </div>
        }
      >
        {labelPreviewContent()}
      </Dialog>
    </div>
  );
};

export default BarcodeBulkOperations;