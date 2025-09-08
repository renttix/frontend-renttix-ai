"use client";
import React, { useRef, useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import CanceButton from "@/components/Buttons/CanceButton";

const EsignSettings = () => {
  const toast = useRef();
  const router = useRouter();
  const { token, user } = useSelector((state) => state?.authReducer);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    esignEnabled: false,
    autoSendEnabled: false,
    defaultDocuments: [],
    expirationDays: 30,
  });
  const fileInputRef = useRef();

  // Load settings on mount
  useEffect(() => {
    // Use esignSettings from user object if available, otherwise fetch from API
    if (user?.esignSettings) {
      setInitialValues({
        esignEnabled: user.esignSettings.esignEnabled || false,
        autoSendEnabled: user.esignSettings.autoSendEnabled || false,
        defaultDocuments: user.esignSettings.defaultDocuments || [],
        expirationDays: user.esignSettings.expirationDays || 30,
      });
    } else {
      const loadSettings = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/esign/settings/${user._id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.data.success) {
            setInitialValues({
              esignEnabled: response.data.data.esignEnabled || false,
              autoSendEnabled: response.data.data.autoSendEnabled || false,
              defaultDocuments: response.data.data.defaultDocuments || [],
              expirationDays: response.data.data.expirationDays || 30,
            });
          }
        } catch (error) {
          console.error("Error loading e-sign settings:", error);
        }
      };

      loadSettings();
    }
  }, [token, user?._id, user?.esignSettings]);

  const validationSchema = Yup.object().shape({
    esignEnabled: Yup.boolean(),
    defaultDocuments: Yup.array(),
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/esign/settings/${user._id}`, values, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "E-sign settings updated successfully",
          life: 3000,
        });
      } else {
        throw new Error(response.data.message || 'Failed to save settings');
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || error.message || "An error occurred",
        life: 3000,
      });
    }
  };

  const handleFileUpload = async (event, setFieldValue, values) => {
    const files = Array.from(event.target.files);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('document', file);

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/esign/settings/${user._id}/upload-document`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            // Note: Don't explicitly set Content-Type for FormData - axios will set it with correct boundary
          },
          timeout: 30000,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted);
          }
        });

        if (response.data.success) {
          const currentDocs = values.defaultDocuments || [];
          const uploadedDoc = {
            id: response.data.data.id,
            name: response.data.data.originalName,
            size: response.data.data.size,
            filename: response.data.data.filename,
            uploadedAt: response.data.data.uploadedAt,
            status: 'uploaded'
          };
          setFieldValue('defaultDocuments', [...currentDocs, uploadedDoc]);

          toast.current.show({
            severity: "success",
            summary: "Document Uploaded",
            detail: `${file.name} uploaded successfully`,
            life: 3000,
          });
        } else {
          throw new Error(response.data.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        console.error('Error response:', error.response);
        console.error('Error request:', error.request);

        const errorMessage = error.response?.data?.message ||
                           error.message ||
                           `Failed to upload ${file.name}`;

        toast.current.show({
          severity: "error",
          summary: "Upload Failed",
          detail: errorMessage,
          life: 3000,
        });
      }
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <GoPrevious route={`/system-setup`} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          E-Signature Settings
        </h2>
      </div>

      <Toast ref={toast} position="top-right" />
      <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, handleChange, setFieldValue }) => (
          <Form>
            {/* General Settings Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10 mb-8">
              <div className="col-span-2 p-4">
                <h3 className="font-bold">General Settings</h3>
              </div>
              <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center">
                    <Field
                      as={Checkbox}
                      inputId="esignEnabled"
                      name="esignEnabled"
                      checked={values.esignEnabled}
                      onChange={(e) => setFieldValue('esignEnabled', e.checked)}
                      className="mr-3"
                    />
                    <label htmlFor="esignEnabled" className="text-sm font-medium cursor-pointer">
                      Enable E-Signature for Orders
                    </label>
                  </div>

                  <div className="flex items-center">
                    <Field
                      as={Checkbox}
                      inputId="autoSendEnabled"
                      name="autoSendEnabled"
                      checked={values.autoSendEnabled}
                      onChange={(e) => setFieldValue('autoSendEnabled', e.checked)}
                      className="mr-3"
                    />
                    <label htmlFor="autoSendEnabled" className="text-sm font-medium cursor-pointer">
                      Automatically send e-sign emails upon order creation
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-medium text-black dark:text-white">
                        Expiration Days
                      </label>
                      <Field
                        as={InputText}
                        onChange={handleChange}
                        value={values?.expirationDays}
                        name="expirationDays"
                        type="number"
                        placeholder="30"
                        className="w-full"
                        min="1"
                      />
                      <small className="text-gray-500">Days for e-sign links to expire</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

            {/* Default Documents Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10 mb-8">
              <div className="col-span-2 p-4">
                <h3 className="font-bold">Default Documents</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Upload PDF documents that will be available for e-signing with orders
                </p>
              </div>
              <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="flex flex-col gap-4">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e, setFieldValue, values)}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        Drop PDF files here or{" "}
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-500 font-medium"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-xs text-gray-400">Only PDF files are supported</p>
                    </div>
                  </div>

                  {/* Uploaded Documents List */}
                  {values.defaultDocuments && values.defaultDocuments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Uploaded Documents:</h4>
                      {values.defaultDocuments.map((doc, index) => (
                        <div
                          key={doc.id || index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {/* Status indicator */}
                            <div className={`w-4 h-4 rounded-full ${
                              doc.status === 'checked' ? 'bg-green-500' :
                              doc.status === 'uploaded' ? 'bg-blue-500' :
                              'bg-red-500'
                            }`}>
                              {doc.status === 'checked' ? (
                                <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : doc.status === 'uploaded' ? (
                                <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 9V3.5l6.5 6.5H13v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6h3z" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{doc.name || doc.originalName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {(doc.size / 1024 / 1024).toFixed(2)} MB •
                                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  doc.status === 'checked' ? 'bg-green-100 text-green-800' :
                                  doc.status === 'uploaded' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {doc.status}
                                </span>
                                {doc.fileExists === false && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                                    Missing
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Preview Button */}
                            <Button
                              type="button"
                              icon="pi pi-eye"
                              className="p-button-text p-button-sm"
                              tooltip="Preview Document"
                              tooltipOptions={{ position: 'top' }}
                              onClick={() => {
                                const previewWindow = window.open('', '_blank', 'width=800,height=600');
                                if (!previewWindow) {
                                  toast.current.show({
                                    severity: "error",
                                    summary: "Preview Failed",
                                    detail: "Pop-up blocker may be preventing preview. Please disable pop-up blocker.",
                                    life: 4000,
                                  });
                                  return;
                                }

                                // Make request with auth headers
                                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/esign/settings/${user._id}/document/${doc.id}/preview`, {
                                  headers: {
                                    Authorization: `Bearer ${token}`
                                  },
                                  responseType: 'blob'
                                })
                                .then(response => {
                                  const blob = new Blob([response.data], { type: 'application/pdf' });
                                  const url = URL.createObjectURL(blob);
                                  previewWindow.location.href = url;
                                })
                                .catch(error => {
                                  previewWindow.close();
                                  console.error('Error previewing document:', error);
                                  toast.current.show({
                                    severity: "error",
                                    summary: "Preview Failed",
                                    detail: "Could not load document preview",
                                    life: 3000,
                                  });
                                });
                              }}
                            />

                            {doc.status !== 'checked' && (
                              <Button
                                type="button"
                                label="Check"
                                className="p-button-text p-button-sm"
                                onClick={async () => {
                                  try {
                                    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/esign/settings/${user._id}/document/${doc.id}/status`, {
                                      status: 'checked',
                                      isChecked: true
                                    }, {
                                      headers: {
                                        Authorization: `Bearer ${token}`
                                      }
                                    });

                                    if (response.data.success) {
                                      // Update local state
                                      const updatedValues = { ...values };
                                      const docIndex = updatedValues.defaultDocuments.findIndex(d => d.id === doc.id);
                                      if (docIndex !== -1) {
                                        updatedValues.defaultDocuments[docIndex].status = 'checked';
                                        updatedValues.defaultDocuments[docIndex].isChecked = true;
                                        setInitialValues(updatedValues);
                                      }

                                      toast.current.show({
                                        severity: "success",
                                        summary: "Document Checked",
                                        detail: `${doc.name || doc.originalName} marked as checked`,
                                        life: 3000,
                                      });
                                    } else {
                                      throw new Error(response.data.message || 'Mark as checked failed');
                                    }
                                  } catch (error) {
                                    console.error('Error marking document as checked:', error);
                                    toast.current.show({
                                      severity: "error",
                                      summary: "Check Failed",
                                      detail: error.response?.data?.message || error.message || 'Failed to mark document as checked',
                                      life: 3000,
                                    });
                                  }
                                }}
                              />
                            )}

                            <Button
                              type="button"
                              icon="pi pi-times"
                              className="p-button-rounded p-button-danger p-button-text"
                              onClick={async () => {
                                try {
                                  const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/esign/settings/${user._id}/document/${doc.id}`, {
                                    headers: {
                                      Authorization: `Bearer ${token}`
                                    }
                                  });

                                  if (response.data.success) {
                                    const updatedDocs = values.defaultDocuments.filter((_, i) => i !== index);
                                    setFieldValue('defaultDocuments', updatedDocs);
                                    // Also update initialValues to reflect changes
                                    const updatedInitial = { ...initialValues };
                                    updatedInitial.defaultDocuments = updatedDocs;
                                    setInitialValues(updatedInitial);

                                    toast.current.show({
                                      severity: "success",
                                      summary: "Document Deleted",
                                      detail: `${doc.name || doc.originalName} deleted successfully`,
                                      life: 3000,
                                    });
                                  } else {
                                    throw new Error(response.data.message || 'Delete failed');
                                  }
                                } catch (error) {
                                  console.error('Error deleting document:', error);
                                  toast.current.show({
                                    severity: "error",
                                    summary: "Delete Failed",
                                    detail: error.response?.data?.message || error.message || 'Failed to delete document',
                                    life: 3000,
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

            {/* Submit Buttons */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
              <div className="col-span-2"></div>
              <div className="col-span-8 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="flex justify-end gap-4 p-3">
                  <CanceButton onClick={() => router.back()} />
                  <Button
                    label="Save Settings"
                    type="submit"
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EsignSettings;