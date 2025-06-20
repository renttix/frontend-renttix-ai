"use client";
import React, { useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { BaseURL, imageBaseURL } from "../../../../utils/baseUrl";
import { setUpdateUser } from "@/store/authSlice";
import { FiUpload, FiFile, FiDownload, FiTrash2, FiEye } from "react-icons/fi";

const TermsAndConditionsUpload = () => {
  const { user } = useSelector((state) => state?.authReducer);
  const dispatch = useDispatch();
  const toast = useRef();
  const fileInputRef = useRef();
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.current.show({
        severity: "error",
        summary: "Invalid File Type",
        detail: "Please upload a PDF, DOC, or DOCX file",
        life: 3000,
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.current.show({
        severity: "error",
        summary: "File Too Large",
        detail: "Please upload a file smaller than 10MB",
        life: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("termsAndConditions", file);
    formData.append("fileName", file.name);

    setUploading(true);

    try {
      const res = await axios.put(
        `${BaseURL}/vender/terms-and-conditions/${user._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      dispatch(setUpdateUser(res.data.data.user));
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Terms and Conditions uploaded successfully",
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "File upload failed",
        life: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleView = () => {
    if (user?.termsAndConditions) {
      window.open(`${imageBaseURL}${user.termsAndConditions}`, '_blank');
    }
  };

  const handleDownload = async () => {
    if (user?.termsAndConditions) {
      try {
        const response = await axios.get(
          `${imageBaseURL}${user.termsAndConditions}`,
          { responseType: 'blob' }
        );
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', user.termsAndConditionsName || 'terms-and-conditions.pdf');
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
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await axios.delete(
        `${BaseURL}/vender/terms-and-conditions/${user._id}`
      );
      
      dispatch(setUpdateUser(res.data.data.user));
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Terms and Conditions removed successfully",
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to remove file",
        life: 3000,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full">
      <Toast ref={toast} position="top-right" />
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
          Terms and Conditions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload your company's Terms and Conditions document (PDF, DOC, DOCX - Max 10MB)
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          * This is optional and can be added later
        </p>
      </div>

      {user?.termsAndConditions ? (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <FiFile className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-dark dark:text-white">
                  {user.termsAndConditionsName || 'Terms and Conditions'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Document uploaded
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                icon="pi pi-eye"
                className="p-button-text p-button-sm"
                onClick={handleView}
                tooltip="View document"
                tooltipOptions={{ position: 'top' }}
              />
              <Button
                icon="pi pi-download"
                className="p-button-text p-button-sm"
                onClick={handleDownload}
                tooltip="Download document"
                tooltipOptions={{ position: 'top' }}
              />
              <Button
                icon="pi pi-trash"
                className="p-button-text p-button-danger p-button-sm"
                onClick={handleDelete}
                loading={deleting}
                tooltip="Remove document"
                tooltipOptions={{ position: 'top' }}
              />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Replace existing document:
            </p>
            <Button
              label="Upload New Document"
              icon="pi pi-upload"
              className="p-button-sm mt-2"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
            />
          </div>
        </div>
      ) : (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600'}
            ${isHovering ? 'border-primary/50 bg-gray-50 dark:bg-gray-800' : ''}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <FiFile className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-base font-medium text-dark dark:text-white">
                Click to upload Terms and Conditions
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or drag and drop your document here
              </p>
            </div>
            <div className="flex items-center justify-center">
              <FiUpload className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                PDF, DOC, DOCX up to 10MB
              </span>
            </div>
            {uploading && (
              <p className="text-sm text-primary">Uploading...</p>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};

export default TermsAndConditionsUpload;