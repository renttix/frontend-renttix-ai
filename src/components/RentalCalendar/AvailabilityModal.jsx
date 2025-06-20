"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { format } from "date-fns";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { useSelector } from "react-redux";

const AvailabilityModal = ({ visible, onHide, date, onCreateRental }) => {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date || new Date());
  const [availability, setAvailability] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const toast = useRef(null);
  const { token } = useSelector((state) => state?.authReducer);

  useEffect(() => {
    if (visible && selectedDate && token) {
      fetchAvailability();
    }
  }, [visible, selectedDate, token]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsResponse = await axios.get(
        `${BaseURL}/product/product-lists?limit=1000`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );

      if (productsResponse.data.success) {
        // In a real implementation, this would check actual availability
        // For now, we'll simulate availability data
        const products = productsResponse.data.data.map(product => {
          const totalStock = product.quantity || 10;
          const reserved = Math.floor(Math.random() * totalStock);
          const available = totalStock - reserved;
          
          return {
            id: product._id,
            name: product.productName,
            category: product.category || "General",
            totalStock,
            reserved,
            available,
            availabilityRate: (available / totalStock) * 100,
            dailyRate: product.price || 50,
            image: product.image
          };
        });

        setAvailability(products);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load availability data",
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    const categories = [...new Set(availability.map(p => p.category))];
    return [
      { label: "All Categories", value: "all" },
      ...categories.map(cat => ({ label: cat, value: cat }))
    ];
  };

  const filteredProducts = categoryFilter === "all" 
    ? availability 
    : availability.filter(p => p.category === categoryFilter);

  const availabilityBodyTemplate = (product) => {
    const severity = product.availabilityRate > 50 ? "success" : 
                    product.availabilityRate > 20 ? "warning" : "danger";
    
    return (
      <div className="flex flex-col gap-2">
        <ProgressBar 
          value={product.availabilityRate} 
          showValue={false}
          style={{ height: "6px" }}
          color={severity === "success" ? "#10b981" : severity === "warning" ? "#f59e0b" : "#ef4444"}
        />
        <div className="flex justify-between text-sm">
          <span>{product.available} available</span>
          <span className="text-gray-500">{product.reserved} reserved</span>
        </div>
      </div>
    );
  };

  const statusBodyTemplate = (product) => {
    const severity = product.available > 0 ? "success" : "danger";
    const label = product.available > 0 ? "Available" : "Fully Booked";
    
    return <Tag value={label} severity={severity} />;
  };

  const actionBodyTemplate = (product) => {
    return (
      <Button
        label="Book Now"
        icon="pi pi-calendar-plus"
        size="small"
        disabled={product.available === 0}
        onClick={() => {
          onHide();
          onCreateRental?.(selectedDate, product);
        }}
      />
    );
  };

  const header = (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">
        Availability for {format(selectedDate, "MMMM d, yyyy")}
      </h3>
      <div className="flex items-center gap-2">
        <Calendar
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.value)}
          dateFormat="dd/mm/yy"
          showIcon
          className="p-inputtext-sm"
        />
      </div>
    </div>
  );

  const footer = (
    <div className="flex justify-between">
      <Button
        label="Close"
        icon="pi pi-times"
        onClick={onHide}
        severity="secondary"
        outlined
      />
      <Button
        label="Create Custom Rental"
        icon="pi pi-plus"
        onClick={() => {
          onHide();
          onCreateRental?.(selectedDate);
        }}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header="Product Availability"
        footer={footer}
        style={{ width: "70vw" }}
        breakpoints={{ "960px": "85vw", "640px": "95vw" }}
        modal
        maximizable
      >
        <div className="availability-content">
          {loading ? (
            <div className="text-center py-8">
              <i className="pi pi-spin pi-spinner text-4xl"></i>
              <p className="mt-2">Checking availability...</p>
            </div>
          ) : (
            <>
              {header}
              
              <div className="my-4">
                <div className="flex items-center gap-2 mb-3">
                  <label className="font-medium">Filter by category:</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-inputtext p-component p-inputtext-sm"
                  >
                    {getCategories().map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <DataTable
                value={filteredProducts || []}
                paginator
                rows={10}
                rowsPerPageOptions={[10, 25, 50]}
                className="p-datatable-sm"
                emptyMessage="No products found"
                responsiveLayout="scroll"
              >
                <Column 
                  field="name" 
                  header="Product" 
                  sortable
                  style={{ minWidth: "200px" }}
                />
                <Column 
                  field="category" 
                  header="Category" 
                  sortable
                  style={{ minWidth: "120px" }}
                />
                <Column 
                  field="totalStock" 
                  header="Total Stock" 
                  sortable
                  style={{ minWidth: "100px" }}
                />
                <Column 
                  header="Availability" 
                  body={availabilityBodyTemplate}
                  style={{ minWidth: "200px" }}
                />
                <Column 
                  field="dailyRate" 
                  header="Daily Rate" 
                  sortable
                  body={(product) => `£${product.dailyRate}`}
                  style={{ minWidth: "100px" }}
                />
                <Column 
                  header="Status" 
                  body={statusBodyTemplate}
                  style={{ minWidth: "120px" }}
                />
                <Column 
                  header="Action" 
                  body={actionBodyTemplate}
                  style={{ minWidth: "120px" }}
                />
              </DataTable>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <i className="pi pi-info-circle"></i>
                  Availability Summary
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Products:</span>
                    <span className="font-semibold ml-2">{filteredProducts.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold ml-2 text-green-600">
                      {filteredProducts.filter(p => p.available > 0).length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fully Booked:</span>
                    <span className="font-semibold ml-2 text-red-600">
                      {filteredProducts.filter(p => p.available === 0).length}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default AvailabilityModal;