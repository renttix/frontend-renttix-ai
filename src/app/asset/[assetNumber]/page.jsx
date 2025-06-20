"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import axios from "axios";
import { useSelector } from "react-redux";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { formatCurrency } from "../../../../utils/helper";
import { format } from "date-fns";
import DefaultLayout from "@/components/Layouts/DefaultLaout";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { assetNumber } = params;
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState(null);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const toast = React.useRef(null);

  const { token, user } = useSelector((state) => state?.authReducer);
  const currency = useSelector((state) => state?.authReducer?.user?.currencyKey);

  const statusOptions = [
    { label: "Available", value: "available" },
    { label: "Rented", value: "rented" },
    { label: "Maintenance", value: "maintenance" },
    { label: "Damaged", value: "damaged" },
  ];

  useEffect(() => {
    fetchAssetDetails();
  }, [assetNumber]);

  useEffect(() => {
    if (activeIndex === 1) {
      fetchRentalHistory();
    } else if (activeIndex === 2) {
      fetchRevenue();
    } else if (activeIndex === 3) {
      fetchMaintenanceHistory();
    }
  }, [activeIndex]);

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
      setNewStatus(response.data.data.status);
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

  const fetchRentalHistory = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/asset/${assetNumber}/rental-history`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setRentalHistory(response.data.data);
    } catch (error) {
      console.error("Error fetching rental history:", error);
    }
  };

  const fetchRevenue = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/asset/${assetNumber}/revenue`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setRevenue(response.data.data);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  };

  const fetchMaintenanceHistory = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/asset/${assetNumber}/maintenance-history`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setMaintenanceHistory(response.data.data);
    } catch (error) {
      console.error("Error fetching maintenance history:", error);
    }
  };

  const updateAssetStatus = async () => {
    try {
      setUpdating(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/asset/${assetNumber}/status`,
        {
          status: newStatus,
          notes: statusNotes,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Asset status updated successfully",
        life: 3000,
      });
      setStatusDialogVisible(false);
      fetchAssetDetails();
    } catch (error) {
      console.error("Error updating asset status:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update asset status",
        life: 3000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusSeverity = (status) => {
    switch (status) {
      case "available":
        return "success";
      case "rented":
        return "warning";
      case "maintenance":
        return "info";
      case "damaged":
        return "danger";
      default:
        return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy");
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy HH:mm");
  };

  const customerBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{rowData.customer?.name}</div>
        <div className="text-sm text-gray-500">{rowData.customer?.email}</div>
      </div>
    );
  };

  const priceBodyTemplate = (rowData) => {
    return formatCurrency(rowData.price, rowData.currency || currency);
  };

  const statusBodyTemplate = (rowData) => {
    return <Tag value={rowData.status} severity={getOrderStatusSeverity(rowData.status)} />;
  };

  const getOrderStatusSeverity = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "success";
      case "closed":
        return "secondary";
      case "cancelled":
        return "danger";
      default:
        return "info";
    }
  };

  const renderRevenueChart = () => {
    if (!revenue?.revenueByMonth || revenue.revenueByMonth.length === 0) {
      return <p className="text-center text-gray-500">No revenue data available</p>;
    }

    const chartData = {
      labels: revenue.revenueByMonth.slice(0, 12).reverse().map((item) => item.month),
      datasets: [
        {
          label: "Monthly Revenue",
          data: revenue.revenueByMonth.slice(0, 12).reverse().map((item) => item.revenue),
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1,
        },
      ],
    };

    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return formatCurrency(value, currency);
            },
          },
        },
      },
    };

    return <Chart type="bar" data={chartData} options={options} style={{ height: "300px" }} />;
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-screen">
          <ProgressSpinner />
        </div>
      </DefaultLayout>
    );
  }

  if (!asset) {
    return (
      <DefaultLayout>
        <div className="p-4">
          <p>Asset not found</p>
          <Button label="Go Back" icon="pi pi-arrow-left" onClick={() => router.back()} />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div>
      <Toast ref={toast} />
      
      <div className="flex gap-3 mb-4">
        <Button
          icon="pi pi-arrow-left"
          className="p-button-rounded p-button-text"
          onClick={() => {
            // Check if there's history to go back to
            if (window.history.length > 1) {
              router.back();
            } else {
              // Fallback to product list if no history
              router.push('/product/product-list');
            }
          }}
          tooltip="Go back"
        />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          Asset Details: {assetNumber}
        </h2>
      </div>

      <Card className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-4">
            {asset.productId?.images?.[0] && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL_IMAGE}${asset.productId.images[0]}`}
                alt={asset.productId?.productName}
                className="w-20 h-20 object-cover rounded"
                onError={(e) => (e.currentTarget.src = "/images/product/placeholder.webp")}
              />
            )}
            <div>
              <h3 className="font-semibold text-lg">{asset.productId?.productName}</h3>
              <p className="text-gray-500">{asset.productId?.companyProductName}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Current Status</p>
            <div className="flex items-center gap-2 mt-1">
              <Tag value={asset.status} severity={getStatusSeverity(asset.status)} />
              <Button
                icon="pi pi-pencil"
                className="p-button-text p-button-sm"
                onClick={() => setStatusDialogVisible(true)}
                tooltip="Update Status"
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Current Customer</p>
            <p className="font-semibold">
              {asset.currentCustomerId ? asset.currentCustomerId.name : "Not Rented"}
            </p>
            {asset.currentOrderId && (
              <p className="text-sm">Order: {asset.currentOrderId.orderId}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="font-semibold text-lg">
              {formatCurrency(asset.totalRevenue || 0, currency)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Rentals</p>
            <p className="font-semibold text-lg">{asset.totalRentals || 0}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Rental Days</p>
            <p className="font-semibold text-lg">{asset.totalRentalDays || 0}</p>
          </div>
        </div>
      </Card>

      <Card>
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header="Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Asset Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Asset Number:</span>
                    <span className="font-medium">{asset.assetNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Product:</span>
                    <span className="font-medium">{asset.productId?.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vendor:</span>
                    <span className="font-medium">{asset.vendorId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">{formatDate(asset.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="font-medium">{formatDate(asset.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Average Revenue per Rental:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        asset.totalRentals > 0 ? asset.totalRevenue / asset.totalRentals : 0,
                        currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Average Rental Duration:</span>
                    <span className="font-medium">
                      {asset.totalRentals > 0
                        ? Math.round(asset.totalRentalDays / asset.totalRentals)
                        : 0}{" "}
                      days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Utilization Rate:</span>
                    <span className="font-medium">
                      {asset.createdAt
                        ? Math.round(
                            (asset.totalRentalDays /
                              Math.ceil(
                                (new Date() - new Date(asset.createdAt)) / (1000 * 60 * 60 * 24)
                              )) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {asset.notes && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-gray-600">{asset.notes}</p>
              </div>
            )}
          </TabPanel>

          <TabPanel header="Rental History">
            <DataTable
              value={rentalHistory}
              paginator
              rows={10}
              emptyMessage="No rental history found"
              className="p-datatable-sm"
            >
              <Column field="orderNumber" header="Order #" />
              <Column header="Customer" body={customerBodyTemplate} />
              <Column field="orderDate" header="Order Date" body={(row) => formatDate(row.orderDate)} />
              <Column field="deliveryDate" header="Delivery Date" body={(row) => formatDate(row.deliveryDate)} />
              <Column field="expectedReturnDate" header="Expected Return" body={(row) => formatDate(row.expectedReturnDate)} />
              <Column field="quantity" header="Quantity" />
              <Column header="Price" body={priceBodyTemplate} />
              <Column header="Status" body={statusBodyTemplate} />
            </DataTable>
          </TabPanel>

          <TabPanel header="Revenue">
            <div className="space-y-6">
              {revenue && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(revenue.totalRevenue, currency)}
                        </p>
                      </div>
                    </Card>
                    <Card>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Total Rentals</p>
                        <p className="text-2xl font-bold">{revenue.totalRentals}</p>
                      </div>
                    </Card>
                    <Card>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Avg Revenue/Rental</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(revenue.averageRevenuePerRental, currency)}
                        </p>
                      </div>
                    </Card>
                    <Card>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Avg Rental Days</p>
                        <p className="text-2xl font-bold">
                          {Math.round(revenue.averageRentalDays)}
                        </p>
                      </div>
                    </Card>
                  </div>

                  <Card title="Monthly Revenue Trend">
                    {renderRevenueChart()}
                  </Card>

                  <Card title="Revenue by Year">
                    <DataTable value={revenue.revenueByYear} className="p-datatable-sm">
                      <Column field="year" header="Year" />
                      <Column
                        field="revenue"
                        header="Revenue"
                        body={(row) => formatCurrency(row.revenue, currency)}
                      />
                    </DataTable>
                  </Card>
                </>
              )}
            </div>
          </TabPanel>

          <TabPanel header="Maintenance History">
            <DataTable
              value={maintenanceHistory}
              paginator
              rows={10}
              emptyMessage="No maintenance history found"
              className="p-datatable-sm"
            >
              <Column field="date" header="Date" body={(row) => formatDateTime(row.date)} />
              <Column field="type" header="Type" />
              <Column field="description" header="Description" />
              <Column field="performedBy.name" header="Performed By" />
              <Column field="duration" header="Duration" body={(row) => `${row.duration || 0} mins`} />
              <Column field="cost" header="Cost" body={(row) => formatCurrency(row.cost || 0, currency)} />
              <Column
                field="status"
                header="Status"
                body={(row) => (
                  <Tag
                    value={row.status}
                    severity={
                      row.status === "completed"
                        ? "success"
                        : row.status === "cancelled"
                        ? "danger"
                        : "warning"
                    }
                  />
                )}
              />
            </DataTable>
          </TabPanel>
        </TabView>
      </Card>

      <Dialog
        header="Update Asset Status"
        visible={statusDialogVisible}
        style={{ width: "450px" }}
        onHide={() => setStatusDialogVisible(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setStatusDialogVisible(false)}
              className="p-button-text"
            />
            <Button
              label="Update"
              icon="pi pi-check"
              onClick={updateAssetStatus}
              loading={updating}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Status</label>
            <Dropdown
              value={newStatus}
              onChange={(e) => setNewStatus(e.value)}
              options={statusOptions}
              placeholder="Select a status"
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-2">Notes (Optional)</label>
            <InputTextarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Add any notes about this status change..."
            />
          </div>
        </div>
      </Dialog>
      </div>
    </DefaultLayout>
  );
}