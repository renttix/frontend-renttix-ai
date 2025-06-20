"use client";
import React, { useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import { BaseURL, imageBaseURL } from "../../../../utils/baseUrl";
import { setUpdateUser } from "@/store/authSlice";
import { FiUpload, FiImage } from "react-icons/fi";

const EnhancedBrandLogo = () => {
  const { user } = useSelector((state) => state?.authReducer);
  const dispatch = useDispatch();
  const toast = useRef();
  const fileInputRef = useRef();
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    user?.brandLogo ? `${imageBaseURL}${user?.brandLogo}` : null
  );
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.current.show({
        severity: "error",
        summary: "Invalid File Type",
        detail: "Please upload a JPG, JPEG, PNG, or GIF image",
        life: 3000,
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.current.show({
        severity: "error",
        summary: "File Too Large",
        detail: "Please upload an image smaller than 5MB",
        life: 3000,
      });
      return;
    }

    const reader = new FileReader();
    const formData = new FormData();
    formData.append("brandLogo", file);

    reader.onloadend = async () => {
      setImagePreviewUrl(reader.result);
      setUploading(true);

      try {
        const res = await axios.put(
          `${BaseURL}/vender/brand-logo/${user._id}`,
          formData
        );
        dispatch(setUpdateUser(res.data.data.user));
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: res?.data?.message || "Logo uploaded successfully",
          life: 3000,
        });
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: error.response?.data?.message || "File upload failed",
          life: 3000,
        });
        // Revert preview on error
        setImagePreviewUrl(
          user?.brandLogo ? `${imageBaseURL}${user?.brandLogo}` : null
        );
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <Toast ref={toast} position="top-right" />
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
          Company Logo
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload your company logo (JPG, PNG, GIF - Max 5MB)
        </p>
      </div>

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
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {imagePreviewUrl ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={imagePreviewUrl}
                alt="Company Logo"
                className="max-h-32 max-w-full object-contain"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-dark dark:text-white">
                Click or drag to replace logo
              </p>
              {uploading && (
                <p className="text-sm text-primary">Uploading...</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <FiImage className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-base font-medium text-dark dark:text-white">
                Click to upload company logo
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or drag and drop your logo here
              </p>
            </div>
            <div className="flex items-center justify-center">
              <FiUpload className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                JPG, PNG, GIF up to 5MB
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedBrandLogo;