import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { AutoComplete } from "primereact/autocomplete";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { useSelector } from "react-redux";

const TerminateRentalFilters = ({ filters, onFilterChange }) => {
  const { token } = useSelector((state) => state?.authReducer);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [depots, setDepots] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Overdue", value: "overdue" },
    { label: "Due Soon", value: "due_soon" }
  ];

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      // Fetch customers
      const customersRes = await axios.get(`${BaseURL}/customer/get-customers`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (customersRes.data.success) {
        setCustomers(customersRes.data.data || []);
      }

      // Fetch products
      const productsRes = await axios.get(`${BaseURL}/product/get-products`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (productsRes.data.success) {
        setProducts(productsRes.data.data || []);
      }

      // Fetch categories
      const categoriesRes = await axios.get(`${BaseURL}/categories/get-categories`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data || []);
      }

      // Fetch depots
      const depotsRes = await axios.get(`${BaseURL}/depots/get-depots`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (depotsRes.data.success) {
        setDepots(depotsRes.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const searchCustomers = (event) => {
    const filtered = customers.filter(c => 
      c.name?.name?.toLowerCase().includes(event.query.toLowerCase()) ||
      c.name?.toLowerCase().includes(event.query.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const searchProducts = (event) => {
    const filtered = products.filter(p => 
      p.productName?.toLowerCase().includes(event.query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleReset = () => {
    onFilterChange({
      search: "",
      customerId: null,
      productId: null,
      categoryId: null,
      dateFrom: null,
      dateTo: null,
      status: [],
      depot: null
    });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export clicked");
  };

  return (
    <Card className="mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="p-inputgroup">
          <span className="p-inputgroup-addon">
            <i className="pi pi-search"></i>
          </span>
          <InputText
            placeholder="Search contract, customer..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>

        {/* Customer Autocomplete */}
        <AutoComplete
          value={filters.customerId}
          suggestions={filteredCustomers}
          completeMethod={searchCustomers}
          field="name.name"
          placeholder="Select Customer"
          onChange={(e) => onFilterChange({ customerId: e.value })}
          dropdown
          forceSelection
        />

        {/* Product Autocomplete */}
        <AutoComplete
          value={filters.productId}
          suggestions={filteredProducts}
          completeMethod={searchProducts}
          field="productName"
          placeholder="Select Product"
          onChange={(e) => onFilterChange({ productId: e.value })}
          dropdown
          forceSelection
        />

        {/* Category Dropdown */}
        <Dropdown
          value={filters.categoryId}
          options={categories}
          onChange={(e) => onFilterChange({ categoryId: e.value })}
          optionLabel="name"
          optionValue="_id"
          placeholder="Select Category"
          showClear
        />

        {/* Date Range - From */}
        <Calendar
          value={filters.dateFrom}
          onChange={(e) => onFilterChange({ dateFrom: e.value })}
          placeholder="Hire Date From"
          dateFormat="dd/mm/yy"
          showIcon
        />

        {/* Date Range - To */}
        <Calendar
          value={filters.dateTo}
          onChange={(e) => onFilterChange({ dateTo: e.value })}
          placeholder="Hire Date To"
          dateFormat="dd/mm/yy"
          showIcon
        />

        {/* Status Multi-Select */}
        <MultiSelect
          value={filters.status}
          options={statusOptions}
          onChange={(e) => onFilterChange({ status: e.value })}
          placeholder="Select Status"
          display="chip"
        />

        {/* Depot Dropdown */}
        <Dropdown
          value={filters.depot}
          options={depots}
          onChange={(e) => onFilterChange({ depot: e.value })}
          optionLabel="name"
          optionValue="_id"
          placeholder="Select Depot"
          showClear
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-4 gap-2">
        <Button
          label="Reset"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          onClick={handleReset}
        />
        <Button
          label="Export"
          icon="pi pi-download"
          severity="info"
          outlined
          onClick={handleExport}
        />
      </div>
    </Card>
  );
};

export default TerminateRentalFilters;