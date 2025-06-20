"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Skeleton } from "primereact/skeleton";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import { Tooltip } from "primereact/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { BaseURL } from "../../../utils/baseUrl";
import Link from "next/link";
import useDebounce from "@/hooks/useDebounce";
import {
  FiSearch, FiFilter, FiDownload, FiPlus, FiMoreVertical,
  FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin, FiUser,
  FiGrid, FiList, FiChevronLeft, FiChevronRight, FiRefreshCw,
  FiEye
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { BsBuilding } from "react-icons/bs";

export default function CustomerListingElite() {
  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(12);
  const [totalRecords, setTotalRecords] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: null,
    status: null,
    city: null
  });
  
  const toast = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const debouncedSearch = useDebounce(search, 800);
  const abortControllerRef = useRef(null);
  
  const { token } = useSelector((state) => state?.authReducer);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        search: debouncedSearch,
        page: page.toString(),
        limit: rows.toString(),
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.city && { city: filters.city })
      });

      const response = await axios.get(
        `${BaseURL}/customer/customer?${queryParams}`,
        {
          headers: { authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
          timeout: 10000
        }
      );

      if (response.data?.data) {
        setCustomers(response.data.data);
        setTotalRecords(response.data.pagination?.total || 0);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error fetching customers:', error);
        setError(error.message);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load customers",
          life: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token, page, rows, debouncedSearch, filters]);

  useEffect(() => {
    if (token) {
      fetchCustomers();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCustomers, token]);

  // Handlers
  const handleDelete = async () => {
    setDeleteLoader(true);
    try {
      await axios.delete(
        `${BaseURL}/customer/customer/${selectedCustomer._id}`,
        {
          headers: { authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );
      
      setCustomers(customers.filter(c => c._id !== selectedCustomer._id));
      setDeleteDialog(false);
      setSelectedCustomer(null);
      
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Customer deleted successfully",
        life: 3000,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to delete customer",
        life: 3000,
      });
    } finally {
      setDeleteLoader(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'true': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Customer': return <FiUser className="w-4 h-4" />;
      case 'Supplier': return <BsBuilding className="w-4 h-4" />;
      case 'Reseller': return <HiOutlineOfficeBuilding className="w-4 h-4" />;
      default: return <FiUser className="w-4 h-4" />;
    }
  };

  // Customer Card Component
  const CustomerCard = ({ customer }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
      onClick={() => router.push(`/customer/360/${customer._id}`)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar
              label={customer.name ? String(customer.name).charAt(0).toUpperCase() : '?'}
              size="large"
              className="bg-gradient-to-br from-blue-500 to-purple-600 text-white"
              shape="circle"
            />
            <div>
              <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors flex items-center">
                {customer.name.name ? String(customer.name.name) : 'Unnamed Customer'}
                <FiEye className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {getTypeIcon(customer.type)}
                <span className="text-sm text-gray-500">{customer.type}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <Button
              icon={<FiMoreVertical />}
              className="p-button-text p-button-rounded p-button-sm"
              onClick={(e) => {
                e.stopPropagation();
                // Add dropdown menu here
              }}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {customer.email && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FiMail className="w-4 h-4 text-gray-400" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          {customer.telephone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FiPhone className="w-4 h-4 text-gray-400" />
              <span>{customer.telephone}</span>
            </div>
          )}
          {customer.city && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FiMapPin className="w-4 h-4 text-gray-400" />
              <span>{customer.city}</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.active)}`}>
            {customer.active?"Active":customer.active}
          </span>
          <div className="flex items-center space-x-1">
            <Button
              icon={<FiEdit2 className="w-4 h-4" />}
              className="p-button-text p-button-rounded p-button-sm hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/customer/update/${customer._id}`);
              }}
              tooltip="Edit"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon={<FiTrash2 className="w-4 h-4" />}
              className="p-button-text p-button-rounded p-button-sm p-button-danger hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCustomer(customer);
                setDeleteDialog(true);
              }}
              tooltip="Delete"
              tooltipOptions={{ position: 'top' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // List Row Component
  const CustomerRow = ({ customer }) => (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => router.push(`/customer/360/${customer._id}`)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Avatar 
            label={customer?.name?.name.charAt(0).toUpperCase()||''} 
            size="normal"
            className="bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-3"
            shape="circle"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
            <div className="text-sm text-gray-500">{customer.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {getTypeIcon(customer.type)}
          <span className="text-sm text-gray-900">{customer.type}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
          {customer.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {customer.city || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {customer.telephone || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Button
            icon={<FiEdit2 className="w-4 h-4" />}
            className="p-button-text p-button-rounded p-button-sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/customer/update/${customer._id}`);
            }}
            tooltip="Edit"
            tooltipOptions={{ position: 'top' }}
          />
          <Button
            icon={<FiTrash2 className="w-4 h-4" />}
            className="p-button-text p-button-rounded p-button-sm p-button-danger"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCustomer(customer);
              setDeleteDialog(true);
            }}
            tooltip="Delete"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </td>
    </motion.tr>
  );

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : ''}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className={viewMode === 'grid' ? 'bg-white rounded-xl p-6 shadow-sm' : 'bg-white p-4 mb-2'}>
          <Skeleton height="2rem" className="mb-4" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="1rem" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <Badge value={totalRecords} className="bg-blue-100 text-blue-800" />
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <InputText
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="pl-10 pr-4 py-2 w-64 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  icon={<FiGrid className="w-4 h-4" />}
                  className={`p-button-text p-button-sm ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setViewMode('grid')}
                />
                <Button
                  icon={<FiList className="w-4 h-4" />}
                  className={`p-button-text p-button-sm ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setViewMode('list')}
                />
              </div>

              {/* Actions */}
              <div className="relative">
                <Button
                  icon={<FiFilter className="w-4 h-4" />}
                  label="Filter"
                  className={`p-button-outlined p-button-sm ${
                    filters.type || filters.status || filters.city ? 'border-blue-500 text-blue-600' : ''
                  }`}
                  onClick={() => setFilterDialog(true)}
                />
                {(filters.type || filters.status || filters.city) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></span>
                )}
              </div>
              <Button
                icon={<FiDownload className="w-4 h-4" />}
                label="Export"
                className="p-button-outlined p-button-sm"
              />
              <Button
                icon={<FiPlus className="w-4 h-4" />}
                label="Add Customer"
                className="p-button-sm bg-gradient-to-r from-blue-600 to-purple-600 border-0"
                onClick={() => router.push('/customer/create')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Failed to load customers</p>
            <Button
              icon={<FiRefreshCw className="w-4 h-4" />}
              label="Retry"
              className="p-button-outlined"
              onClick={fetchCustomers}
            />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <img 
              src="/empty-state.svg" 
              alt="No customers" 
              className="w-64 h-64 mx-auto mb-4 opacity-50"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500 mb-4">
              {search ? 'Try adjusting your search terms' : 'Get started by adding your first customer'}
            </p>
            {!search && (
              <Button
                icon={<FiPlus className="w-4 h-4" />}
                label="Add Customer"
                onClick={() => router.push('/customer/create')}
              />
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {customers.map((customer) => (
                <CustomerCard key={customer._id} customer={customer} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {customers.map((customer) => (
                    <CustomerRow key={customer._id} customer={customer} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {customers.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * rows) + 1} to {Math.min(page * rows, totalRecords)} of {totalRecords} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                icon={<FiChevronLeft className="w-4 h-4" />}
                className="p-button-outlined p-button-sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              />
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {page} of {Math.ceil(totalRecords / rows)}
              </span>
              <Button
                icon={<FiChevronRight className="w-4 h-4" />}
                className="p-button-outlined p-button-sm"
                disabled={page >= Math.ceil(totalRecords / rows)}
                onClick={() => setPage(page + 1)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog
        visible={deleteDialog}
        style={{ width: '450px' }}
        header="Confirm Delete"
        modal
        onHide={() => setDeleteDialog(false)}
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setDeleteDialog(false)}
            />
            <Button
              label="Delete"
              icon="pi pi-trash"
              className="p-button-danger"
              loading={deleteLoader}
              onClick={handleDelete}
            />
          </div>
        }
      >
        <div className="flex items-center">
          <i className="pi pi-exclamation-triangle text-3xl text-yellow-500 mr-3" />
          <span>
            Are you sure you want to delete <b>{selectedCustomer?.name}</b>?
            This action cannot be undone.
          </span>
        </div>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        visible={filterDialog}
        style={{ width: '500px' }}
        header="Filter Customers"
        modal
        onHide={() => setFilterDialog(false)}
        footer={
          <div className="flex justify-between">
            <Button
              label="Clear All"
              className="p-button-text"
              onClick={() => {
                setFilters({ type: null, status: null, city: null });
              }}
            />
            <div className="space-x-2">
              <Button
                label="Cancel"
                className="p-button-text"
                onClick={() => setFilterDialog(false)}
              />
              <Button
                label="Apply Filters"
                className="p-button-sm bg-gradient-to-r from-blue-600 to-purple-600 border-0"
                onClick={() => {
                  setPage(1);
                  setFilterDialog(false);
                  fetchCustomers();
                }}
              />
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Customer Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Customer', 'Supplier', 'Reseller', 'Sub-Contractor'].map((type) => (
                <label
                  key={type}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    filters.type === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={filters.type === type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(type)}
                    <span className="text-sm">{type}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {['Active', 'Inactive', 'Suspended'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilters({ ...filters, status: filters.status === status ? null : status })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.status === status
                      ? getStatusColor(status)
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } border`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <InputText
                value={filters.city || ''}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="Enter city name..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filters.type || filters.status || filters.city) && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Active filters:</p>
              <div className="flex flex-wrap gap-2">
                {filters.type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Type: {filters.type}
                    <button
                      onClick={() => setFilters({ ...filters, type: null })}
                      className="ml-2 hover:text-blue-900"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                {filters.status && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Status: {filters.status}
                    <button
                      onClick={() => setFilters({ ...filters, status: null })}
                      className="ml-2 hover:text-green-900"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                {filters.city && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    City: {filters.city}
                    <button
                      onClick={() => setFilters({ ...filters, city: null })}
                      className="ml-2 hover:text-purple-900"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}