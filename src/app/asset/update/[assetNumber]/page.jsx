"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { BreadCrumb } from "primereact/breadcrumb";
import axios from "axios";
import { useSelector } from "react-redux";
import { formatCurrency } from "../../../../../utils/helper";
import DefaultLayout from "@/components/Layouts/DefaultLaout";

export default function AssetUpdatePage() {
  const params = useParams();
  const router = useRouter();
  const { assetNumber } = params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [asset, setAsset] = useState(null);
  const toast = React.useRef(null);

  const { token } = useSelector((state) => state?.authReducer);
  const currency = useSelector((state) => state?.authReducer?.user?.currencyKey);

  const conditionOptions = [
    { label: "Excellent", value: "excellent" },
    { label: "Good", value: "good" },
    { label: "Fair", value: "fair" },
    { label: "Poor", value: "poor" },
  ];

  // Form state
  const [formData, setFormData] = useState({
    notes: "",
    condition: "excellent",
    lastInspectionDate: null,
    purchaseDate: null,
    purchasePrice: null,
    warrantyExpiryDate: null
  });

  // Breadcrumb items
  const breadcrumbHome = { icon: "pi pi-home", url: "/" };
  const breadcrumbItems = [
    { label: "Assets", url: "/asset" },
    { label: `Asset ${assetNumber}`, url: `/asset/${assetNumber}` },
    { label: "Update", url: `/asset/update/${assetNumber}` }
  ];

  useEffect(() => {
    fetchAssetDetails();
  }, [assetNumber]);

  const fetchAssetDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/asset/${assetNumber}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setAsset(response.data.data);

      // Populate form with existing data
      setFormData({
        notes: response.data.data.notes || "",
        condition: response.data.data.condition || "excellent",
        lastInspectionDate: response.data.data.lastInspectionDate ? new Date(response.data.data.lastInspectionDate) : null,
        purchaseDate: response.data.data.purchaseDate ? new Date(response.data.data.purchaseDate) : null,
        purchasePrice: response.data.data.purchasePrice || null,
        warrantyExpiryDate: response.data.data.warrantyExpiryDate ? new Date(response.data.data.warrantyExpiryDate) : null
      });
    } catch (error) {
      console.error("Error fetching asset details:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch asset details",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData = { ...formData };

      // Convert dates to strings for API
      if (updateData.lastInspectionDate) {
        updateData.lastInspectionDate = updateData.lastInspectionDate.toISOString();
      }
      if (updateData.purchaseDate) {
        updateData.purchaseDate = updateData.purchaseDate.toISOString();
      }
      if (updateData.warrantyExpiryDate) {
        updateData.warrantyExpiryDate = updateData.warrantyExpiryDate.toISOString();
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/asset/${assetNumber}`,
        updateData,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Asset updated successfully",
        life: 3000,
      });

      // Redirect back to asset detail page
      router.push(`/asset/${assetNumber}`);

    } catch (error) {
      console.error("Error updating asset:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update asset",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-4">
        <p>Asset not found</p>
        <Button label="Go Back" icon="pi pi-arrow-left" onClick={() => router.back()} />
      </div>
    );
  }

  return (
    <DefaultLayout>
        <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />

      {/* Breadcrumb */}
   

      <div className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Update Asset</h1>
              <p className="text-gray-600 mt-1">Update details for Asset #{asset.assetNumber}</p>
            </div>
            <div className="flex gap-3">
              <Button
                label="Cancel"
                icon="pi pi-times"
                onClick={handleCancel}
                className="p-button-secondary"
                disabled={saving}
              />
              <Button
                label="Save Changes"
                icon="pi pi-check"
                onClick={handleSave}
                loading={saving}
                className="p-button-primary"
              />
            </div>
          </div>

          {/* Asset Overview Card */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Asset Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Asset Number</p>
                <p className="text-lg font-semibold">{asset.assetNumber}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Product</p>
                <p className="text-lg font-semibold">{asset.productId?.productName}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Current Status</p>
                <p className="text-lg font-semibold">{asset.status}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Vendor</p>
                <p className="text-lg font-semibold">{asset.vendorId?.name}</p>
              </div>
            </div>
            {asset.currentCustomerId && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Current Customer</p>
                <p className="text-lg font-semibold">{asset.currentCustomerId.name}</p>
              </div>
            )}
          </Card>

          {/* Form Card */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-6">Asset Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                <Dropdown
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.value})}
                  options={conditionOptions}
                  placeholder="Select condition"
                  className="w-full"
                  required
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price</label>
                <InputNumber
                  value={formData.purchasePrice}
                  onValueChange={(e) => setFormData({...formData, purchasePrice: e.value})}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  placeholder="Enter purchase price"
                  className="w-full"
                />
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                <Calendar
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({...formData, purchaseDate: e.value})}
                  dateFormat="mm/dd/yy"
                  placeholder="Select purchase date"
                  className="w-full"
                  showIcon
                />
              </div>

              {/* Last Inspection Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Inspection Date</label>
                <Calendar
                  value={formData.lastInspectionDate}
                  onChange={(e) => setFormData({...formData, lastInspectionDate: e.value})}
                  dateFormat="mm/dd/yy"
                  placeholder="Select inspection date"
                  className="w-full"
                  showIcon
                />
              </div>

              {/* Warranty Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Expiry Date</label>
                <Calendar
                  value={formData.warrantyExpiryDate}
                  onChange={(e) => setFormData({...formData, warrantyExpiryDate: e.value})}
                  dateFormat="mm/dd/yy"
                  placeholder="Select warranty expiry date"
                  className="w-full"
                  showIcon
                />
              </div>

              {/* Notes - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <InputTextarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={4}
                  placeholder="Enter any notes about this asset..."
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Performance Metrics Card (Read-only) */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(asset.totalRevenue || 0, currency)}
                </p>
              </div>
              <div className="text-center bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-500 mb-1">Total Rentals</p>
                <p className="text-2xl font-bold text-green-600">
                  {asset.totalRentals || 0}
                </p>
              </div>
              <div className="text-center bg-yellow-50 p-4 rounded">
                <p className="text-sm text-gray-500 mb-1">Utilization Rate</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {asset.createdAt
                    ? `${Math.round(
                        (asset.totalRentalDays / Math.ceil((new Date() - new Date(asset.createdAt)) / (1000 * 60 * 60 * 24))) * 100
                      )}%`
                    : "0%"
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={handleCancel}
              className="p-button-secondary"
              disabled={saving}
            />
            <Button
              label="Save Changes"
              icon="pi pi-check"
              onClick={handleSave}
              loading={saving}
              className="p-button-primary"
            />
          </div>
        </div>
      </div>
    </div>
    </DefaultLayout>
  );
}