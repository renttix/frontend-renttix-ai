"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Skeleton } from "primereact/skeleton";
import { Badge } from "primereact/badge";
import { Tooltip } from "primereact/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import useDebounce from "@/hooks/useDebounce";
import apiServices from "../../../services/apiService";
import { formatCurrency } from "../../../utils/helper";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { 
  FiSearch, FiFilter, FiDownload, FiDollarSign, FiCalendar,
  FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiBell,
  FiGrid, FiList, FiChevronLeft, FiChevronRight, FiRefreshCw,
  FiFileText, FiUser, FiTrendingUp, FiCreditCard
} from "react-icons/fi";
import { HiOutlineReceiptTax } from "react-icons/hi";

export default function PaymentsElite() {
  // State management
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(12);
  const [totalRecords, setTotalRecords] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentLoader, setPaymentLoader] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    dateRange: null
  });
  
  const toast = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const debouncedSearch = useDebounce(search, 800);
  const abortControllerRef = useRef(null);
  
  const { user } = useSelector((state) => state?.authReducer);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paid = invoices.filter(inv => inv.paymentStatus === 'Paid').length;
    const unpaid = invoices.filter(inv => inv.paymentStatus === 'Unpaid').length;
    const overdue = invoices.filter(inv => 
      inv.paymentStatus === 'Unpaid' && new Date(inv.invoiceUptoDate) < new Date()
    ).length;
    
    return { total, paid, unpaid, overdue };
  }, [invoices]);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await apiServices.get(
        `/invoice/all-invoices?search=${debouncedSearch}&page=${page}&limit=${rows}&status=${filters.status}&paymentStatus=${filters.paymentStatus}`,
        { signal: abortControllerRef.current.signal }
      );

      if (response.data?.success) {
        setInvoices(response.data.data);
        setTotalRecords(response.data.pagination?.total || 0);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error fetching invoices:', error);
        setError(error.message);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load invoices",
          life: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [page, rows, debouncedSearch, filters]);

  useEffect(() => {
    fetchInvoices();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchInvoices]);

  // Handle payment
  const handleInvoicePayment = async (invoice) => {
    setPaymentLoader(true);
    try {
      const payload = {
        invoiceId: invoice._id,
        amount: invoice.total,
        currency: user?.currencyKey,
        email: invoice.customerEmail,
        vendorId: user?._id,
        customerId: invoice.customer_id,
        invoiceNo: invoice.invocie,
        orderId: invoice.orderNumber,
        chargingStartDate: invoice.invoiceUptoDate
      };

      const { data } = await axios.post(`${BaseURL}/stripes/payment/signle-invoice`, payload);
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Invalid payment URL received.");
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Payment Error",
        detail: error?.response?.data?.message || "Failed to initiate payment.",
        life: 3000,
      });
    } finally {
      setPaymentLoader(false);
      setPaymentDialog(false);
    }
  };

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Posted': return 'bg-green-100 text-green-800 border-green-200';
      case 'Confirmed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPaymentStatusStyle = (status) => {
    return status === 'Paid' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  // Invoice Card Component
  const InvoiceCard = ({ invoice }) => {
    const isOverdue = invoice.paymentStatus === 'Unpaid' && new Date(invoice.invoiceUptoDate) < new Date();
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border overflow-hidden ${
          isOverdue ? 'border-red-200' : 'border-gray-100'
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <FiFileText className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 text-lg">
                  {invoice.invocie}
                </h3>
              </div>
              <p className="text-sm text-gray-500">{invoice.customerName}</p>
            </div>
            {isOverdue && (
              <>
                <Tooltip target=".overdue-icon" content="Overdue" position="left" />
                <FiAlertCircle className="overdue-icon w-5 h-5 text-red-500" />
              </>
            )}
          </div>

          {/* Dates */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Invoice Date:</span>
              <span className="text-gray-700">
                {new Date(invoice.invoiceDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Due Date:</span>
              <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                {new Date(invoice.invoiceUptoDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between mb-4 py-3 border-t border-b border-gray-100">
            <span className="text-gray-500">Amount</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(invoice.total, user?.currencyKey)}
            </span>
          </div>

          {/* Status Tags */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(invoice.status)}`}>
              {invoice.status}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusStyle(invoice.paymentStatus)}`}>
              {invoice.paymentStatus === 'Paid' ? (
                <FiCheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <FiXCircle className="w-3 h-3 mr-1" />
              )}
              {invoice.paymentStatus}
            </span>
          </div>

          {/* Actions */}
          {invoice.status === 'Posted' && invoice.paymentStatus === 'Unpaid' && (
            <Button
              icon={<FiCreditCard className="w-4 h-4" />}
              label="Pay Now"
              className="w-full p-button-sm bg-gradient-to-r from-blue-600 to-purple-600 border-0"
              onClick={() => {
                setSelectedInvoice(invoice);
                setPaymentDialog(true);
              }}
            />
          )}
        </div>
      </motion.div>
    );
  };

  // List Row Component
  const InvoiceRow = ({ invoice }) => {
    const isOverdue = invoice.paymentStatus === 'Unpaid' && new Date(invoice.invoiceUptoDate) < new Date();
    
    return (
      <motion.tr
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50' : ''}`}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <FiFileText className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{invoice.invocie}</span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{invoice.customerName}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(invoice.invoiceDate).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            {new Date(invoice.invoiceUptoDate).toLocaleDateString()}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(invoice.status)}`}>
            {invoice.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(invoice.total, user?.currencyKey)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusStyle(invoice.paymentStatus)}`}>
            {invoice.paymentStatus}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          {invoice.status === 'Posted' && invoice.paymentStatus === 'Unpaid' && (
            <Button
              icon={<FiBell className="w-4 h-4" />}
              className="p-button-text p-button-rounded p-button-sm"
              onClick={() => {
                setSelectedInvoice(invoice);
                setPaymentDialog(true);
              }}
              tooltip="Send Payment Reminder"
              tooltipOptions={{ position: 'left' }}
            />
          )}
        </td>
      </motion.tr>
    );
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : ''}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className={viewMode === 'grid' ? 'bg-white rounded-xl p-6 shadow-sm' : 'bg-white p-4 mb-2'}>
          <Skeleton height="2rem" className="mb-4" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="3rem" />
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
              <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
              <Badge value={totalRecords} className="bg-blue-100 text-blue-800" />
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <InputText
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search invoices..."
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
                    filters.status || filters.paymentStatus ? 'border-blue-500 text-blue-600' : ''
                  }`}
                  onClick={() => setFilterDialog(true)}
                />
                {(filters.status || filters.paymentStatus) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></span>
                )}
              </div>
              <Button
                icon={<FiDownload className="w-4 h-4" />}
                label="Export"
                className="p-button-outlined p-button-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summaryStats.total, user?.currencyKey)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid Invoices</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.paid}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unpaid Invoices</p>
                <p className="text-2xl font-bold text-yellow-600">{summaryStats.unpaid}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.overdue}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Failed to load invoices</p>
            <Button
              icon={<FiRefreshCw className="w-4 h-4" />}
              label="Retry"
              className="p-button-outlined"
              onClick={fetchInvoices}
            />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineReceiptTax className="w-24 h-24 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500">
              {search ? 'Try adjusting your search terms' : 'Your invoices will appear here'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {invoices.map((invoice) => (
                <InvoiceCard key={invoice._id} invoice={invoice} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {invoices.map((invoice) => (
                    <InvoiceRow key={invoice._id} invoice={invoice} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {invoices.length > 0 && (
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

      {/* Payment Dialog */}
      <Dialog
        visible={paymentDialog}
        style={{ width: '450px' }}
        header="Confirm Payment"
        modal
        onHide={() => setPaymentDialog(false)}
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setPaymentDialog(false)}
            />
            <Button
              label="Proceed to Payment"
              icon="pi pi-credit-card"
              className="bg-gradient-to-r from-blue-600 to-purple-600 border-0"
              loading={paymentLoader}
              onClick={() => handleInvoicePayment(selectedInvoice)}
            />
          </div>
        }
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Invoice Number:</span>
                <span className="font-medium">{selectedInvoice.invocie}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Customer:</span>
                <span className="font-medium">{selectedInvoice.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(selectedInvoice.total, user?.currencyKey)}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              You will be redirected to a secure payment page to complete this transaction.
            </p>
          </div>
        )}
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        visible={filterDialog}
        style={{ width: '500px' }}
        header="Filter Invoices"
        modal
        onHide={() => setFilterDialog(false)}
        footer={
          <div className="flex justify-between">
            <Button
              label="Clear All"
              className="p-button-text"
              onClick={() => {
                setFilters({ status: "", paymentStatus: "", dateRange: null });
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 border-0"
                onClick={() => {
                  setPage(1);
                  setFilterDialog(false);
                  fetchInvoices();
                }}
              />
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Invoice Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Status
            </label>
            <div className="flex flex-wrap gap-2">
              {['', 'Draft', 'Confirmed', 'Posted'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilters({ ...filters, status })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.status === status
                      ? status === '' 
                        ? 'bg-gray-600 text-white' 
                        : `${getStatusStyle(status)} font-semibold`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } border`}
                >
                  {status || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filters.status || filters.paymentStatus) && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Active filters:</p>
              <div className="flex flex-wrap gap-2">
                {filters.status && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: {filters.status}
                    <button
                      onClick={() => setFilters({ ...filters, status: "" })}
                      className="ml-2 hover:text-blue-900"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                {filters.paymentStatus && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Payment: {filters.paymentStatus}
                    <button
                      onClick={() => setFilters({ ...filters, paymentStatus: "" })}
                      className="ml-2 hover:text-green-900"
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