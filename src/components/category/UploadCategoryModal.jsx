"use client";

import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { useSelector } from "react-redux";

const UploadCategoryModal = ({ visible, onHide }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const { token } = useSelector((s) => s.authReducer);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.current.show({ severity: "warn", summary: "No file", detail: "Please select a CSV file." });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${BaseURL}/upload-categories`, formData, {
         headers: { Authorization: `Bearer ${token}` } ,
      });
      toast.current.show({ severity: "success", summary: "Success", detail: res.data.message });
      setFile(null);
      onHide();
    } catch (error) {
      toast.current.show({ severity: "error", summary: "Error", detail: error.response?.data?.message || "Upload failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog header="Upload Category CSV" visible={visible} onHide={onHide} className="w-[90vw] md:w-[30rem]">
        <div className="space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full border p-2 rounded-md"
          />

          <div className="flex justify-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={onHide} />
            <Button
              label={loading ? "Uploading..." : "Upload"}
              icon="pi pi-upload"
              onClick={handleUpload}
              loading={loading}
              disabled={!file || loading}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default UploadCategoryModal;
