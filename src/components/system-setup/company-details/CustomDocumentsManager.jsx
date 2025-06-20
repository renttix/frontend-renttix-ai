"use client";
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { BaseURL, imageBaseURL } from "../../../../utils/baseUrl";
import { setUpdateUser } from "@/store/authSlice";
import { FiUpload, FiFile, FiDownload, FiTrash2, FiEdit2, FiEye } from "react-icons/fi";

const CustomDocumentsManager = () => {
  const { user } = useSelector((state) => state?.authReducer);
  const dispatch = useDispatch();
  const toast = useRef();
  const fileInputRef = useRef();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Form states
  const [uploadForm, setUploadForm] = useState({
    docName: "",
    docType: "other",
    description: "",
    tags: "",
    file: null
  });
  
  const [editForm, setEditForm] = useState({
    docName: "",
    docType: "other",
    description: "",
    tags: ""
  });

  const docTypes = [
    { label: "Policy", value: "policy" },
    { label: "Agreement", value: "agreement" },
    { label: "Certificate", value: "certificate" },
    { label: "Manual", value: "manual" },
    { label: "Other", value: "other" }
  ];

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, [user?._id]);

  const fetchDocuments = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${BaseURL}/vendor/custom-docs`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.data.success) {
        setDocuments(response.data.data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch documents",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  // Validate file
  const validateAndSetFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.current.show({
        severity: "error",
        summary: "Invalid File Type",
        detail: "Please upload PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, PNG, or JPG files",
        life: 3000,
      });
      return;
    }

    // Check file size (25MB limit)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.current.show({
        severity: "error",
        summary: "File Too Large",
        detail: "Please upload a file smaller than 25MB",
        life: 3000,
      });
      return;
    }

    setUploadForm({ ...uploadForm, file });
    setUploadDialog(true);
  };

  // Upload document
  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.docName || !uploadForm.docType) {
      toast.current.show({
        severity: "error",
        summary: "Missing Information",
        detail: "Please provide document name and type",
        life: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("customDocument", uploadForm.file);
    formData.append("docName", uploadForm.docName);
    formData.append("docType", uploadForm.docType);
    formData.append("description", uploadForm.description);
    formData.append("tags", uploadForm.tags);

    setUploading(true);

    try {
      const response = await axios.post(
        `${BaseURL}/vendor/custom-docs`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Document uploaded successfully",
          life: 3000,
        });
        
        // Update user in Redux
        dispatch(setUpdateUser(response.data.data.user));
        
        // Refresh documents list
        fetchDocuments();
        
        // Reset form and close dialog
        setUploadForm({
          docName: "",
          docType: "other",
          description: "",
          tags: "",
          file: null
        });
        setUploadDialog(false);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to upload document",
        life: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  // Edit document metadata
  const handleEdit = (doc) => {
    setSelectedDoc(doc);
    setEditForm({
      docName: doc.docName,
      docType: doc.docType,
      description: doc.description || "",
      tags: doc.tags ? doc.tags.join(", ") : ""
    });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedDoc) return;

    try {
      const response = await axios.put(
        `${BaseURL}/vendor/custom-docs/${selectedDoc.docId}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Document updated successfully",
          life: 3000,
        });
        
        // Update user in Redux
        dispatch(setUpdateUser(response.data.data.user));
        
        // Refresh documents list
        fetchDocuments();
        
        // Close dialog
        setEditDialog(false);
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to update document",
        life: 3000,
      });
    }
  };

  // Delete document
  const handleDelete = (doc) => {
    confirmDialog({
      message: `Are you sure you want to delete "${doc.docName}"?`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const response = await axios.delete(
            `${BaseURL}/vendor/custom-docs/${doc.docId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (response.data.success) {
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: "Document deleted successfully",
              life: 3000,
            });
            
            // Update user in Redux
            dispatch(setUpdateUser(response.data.data.user));
            
            // Refresh documents list
            fetchDocuments();
          }
        } catch (error) {
          console.error("Error deleting document:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.message || "Failed to delete document",
            life: 3000,
          });
        }
      },
    });
  };

  // View/Download document
  const handleView = (doc) => {
    window.open(`${imageBaseURL}${doc.filePath}`, "_blank");
  };

  const handleDownload = async (doc) => {
    try {
      const response = await axios.get(
        `${imageBaseURL}${doc.filePath}`,
        { responseType: "blob" }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to download file",
        life: 3000,
      });
    }
  };

  // Table columns
  const nameBodyTemplate = (rowData) => {
    return (
      <div className="flex items-center gap-2">
        <FiFile className="text-gray-500" />
        <span>{rowData.docName}</span>
      </div>
    );
  };

  const typeBodyTemplate = (rowData) => {
    const severity = {
      policy: "info",
      agreement: "success",
      certificate: "warning",
      manual: "help",
      other: null
    };
    
    return (
      <Tag 
        value={rowData.docType.charAt(0).toUpperCase() + rowData.docType.slice(1)} 
        severity={severity[rowData.docType]}
      />
    );
  };

  const sizeBodyTemplate = (rowData) => {
    const formatSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    
    return formatSize(rowData.fileSize);
  };

  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.uploadedAt).toLocaleDateString();
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-text p-button-sm"
          onClick={() => handleView(rowData)}
          tooltip="View"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-download"
          className="p-button-text p-button-sm"
          onClick={() => handleDownload(rowData)}
          tooltip="Download"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-button-sm"
          onClick={() => handleEdit(rowData)}
          tooltip="Edit"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData)}
          tooltip="Delete"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  return (
    <div className="w-full">
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog />
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
          Custom Documents
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload and manage additional company documents
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mb-4
          transition-all duration-200 ease-in-out
          ${isDragging ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-600"}
          hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <FiUpload className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <div>
            <p className="text-base font-medium text-dark dark:text-white">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, PNG, JPG up to 25MB
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Documents Table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
        <DataTable
          value={documents}
          loading={loading}
          emptyMessage="No documents uploaded yet"
          className="p-datatable-sm"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
        >
          <Column field="docName" header="Name" body={nameBodyTemplate} />
          <Column field="docType" header="Type" body={typeBodyTemplate} />
          <Column field="fileSize" header="Size" body={sizeBodyTemplate} />
          <Column field="uploadedAt" header="Uploaded" body={dateBodyTemplate} />
          <Column header="Actions" body={actionsBodyTemplate} style={{ width: "200px" }} />
        </DataTable>
      </div>

      {/* Upload Dialog */}
      <Dialog
        visible={uploadDialog}
        style={{ width: "450px" }}
        header="Upload Document"
        modal
        className="p-fluid"
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => {
                setUploadDialog(false);
                setUploadForm({
                  docName: "",
                  docType: "other",
                  description: "",
                  tags: "",
                  file: null
                });
              }}
              className="p-button-text"
            />
            <Button
              label="Upload"
              icon="pi pi-upload"
              onClick={handleUpload}
              loading={uploading}
            />
          </div>
        }
        onHide={() => setUploadDialog(false)}
      >
        <div className="space-y-4">
          {uploadForm.file && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium">Selected File:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {uploadForm.file.name}
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Name <span className="text-red-500">*</span>
            </label>
            <InputText
              value={uploadForm.docName}
              onChange={(e) => setUploadForm({ ...uploadForm, docName: e.target.value })}
              placeholder="Enter document name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={uploadForm.docType}
              onChange={(e) => setUploadForm({ ...uploadForm, docType: e.value })}
              options={docTypes}
              placeholder="Select document type"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <InputTextarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              rows={3}
              placeholder="Enter document description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <InputText
              value={uploadForm.tags}
              onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
              placeholder="Enter tags separated by commas"
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        visible={editDialog}
        style={{ width: "450px" }}
        header="Edit Document"
        modal
        className="p-fluid"
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => {
                setEditDialog(false);
                setSelectedDoc(null);
              }}
              className="p-button-text"
            />
            <Button
              label="Update"
              icon="pi pi-check"
              onClick={handleUpdate}
            />
          </div>
        }
        onHide={() => setEditDialog(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Name <span className="text-red-500">*</span>
            </label>
            <InputText
              value={editForm.docName}
              onChange={(e) => setEditForm({ ...editForm, docName: e.target.value })}
              placeholder="Enter document name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={editForm.docType}
              onChange={(e) => setEditForm({ ...editForm, docType: e.value })}
              options={docTypes}
              placeholder="Select document type"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <InputTextarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              placeholder="Enter document description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <InputText
              value={editForm.tags}
              onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
              placeholder="Enter tags separated by commas"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CustomDocumentsManager;