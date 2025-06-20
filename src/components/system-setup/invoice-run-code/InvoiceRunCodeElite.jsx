"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { useSelector } from "react-redux";
import Link from "next/link";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Badge } from "primereact/badge";
import { Tag } from "primereact/tag";
import useDebounce from "@/hooks/useDebounce";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaBarcode, 
  FaChartLine, 
  FaFileInvoice, 
  FaInfoCircle,
  FaLightbulb,
  FaRocket,
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaToggleOn,
  FaToggleOff,
  FaTrash,
  FaEdit,
  FaCopy,
  FaEye,
  FaSearch,
  FaFilter,
  FaPlus,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHashtag,
  FaClipboard,
  FaHistory,
  FaCode,
  FaQuestionCircle,
  FaTachometerAlt
} from "react-icons/fa";
import { MdDeleteForever, MdContentCopy, MdVisibility, MdCode } from "react-icons/md";
import { BaseURL } from "../../../../utils/baseUrl";
import CanceButton from "@/components/Buttons/CanceButton";
import { Tooltip } from "primereact/tooltip";
import { ProgressBar } from "primereact/progressbar";
import { Skeleton } from "primereact/skeleton";

// Invoice Run Code Card Component
const InvoiceRunCodeCard = ({ code, onDelete, onCopyCode, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate usage statistics (mock data for now)
  const usageCount = Math.floor(Math.random() * 100) + 1;
  const lastUsed = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
  const activeCustomers = Math.floor(Math.random() * 20) + 1;

  const handleCopyCode = () => {
    onCopyCode(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine code pattern type
  const getCodePattern = (codeStr) => {
    if (/^[A-Z]{2,3}-\d{3,4}$/.test(codeStr)) return { type: 'alphanumeric', color: 'blue' };
    if (/^\d{4,6}$/.test(codeStr)) return { type: 'numeric', color: 'green' };
    if (/^[A-Z]{3,5}$/.test(codeStr)) return { type: 'alphabetic', color: 'purple' };
    return { type: 'custom', color: 'orange' };
  };

  const codePattern = getCodePattern(code.code);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        relative overflow-hidden rounded-xl border-2 transition-all duration-300
        ${isHovered 
          ? 'border-blue-300 shadow-xl' 
          : 'border-gray-200 shadow-md hover:shadow-lg'
        }
        bg-gradient-to-br from-white to-gray-50
      `}>
        {/* Code Pattern Badge */}
        <div className={`
          absolute top-3 right-3 px-3 py-1 text-xs font-bold text-white rounded-full
          bg-${codePattern.color}-500
        `}>
          {codePattern.type.toUpperCase()}
        </div>

        {/* Card Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                <FaBarcode className="text-2xl text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{code.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{code.description || 'No description provided'}</p>
              </div>
            </div>
          </div>

          {/* Code Display */}
          <div className="mb-4 p-4 bg-gray-900 rounded-lg relative group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaCode className="text-green-400" />
                <code className="text-lg font-mono text-green-400">{code.code}</code>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyCode}
                className={`
                  p-2 rounded transition-all
                  ${copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                {copied ? <FaCheckCircle /> : <FaClipboard />}
              </motion.button>
            </div>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-8 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded"
              >
                Copied!
              </motion.div>
            )}
          </div>

          {/* Usage Statistics */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <FaFileInvoice className="text-xl text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Total Usage</p>
              <p className="text-lg font-bold text-gray-800">{usageCount}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <FaUsers className="text-xl text-green-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Active Customers</p>
              <p className="text-lg font-bold text-gray-800">{activeCustomers}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <FaClock className="text-xl text-purple-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Last Used</p>
              <p className="text-sm font-bold text-gray-800">
                {lastUsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Visual Usage Indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Usage Frequency</span>
              <span className="text-xs font-bold text-gray-800">{Math.round(usageCount / 30 * 100)}%</span>
            </div>
            <ProgressBar 
              value={Math.round(usageCount / 30 * 100)} 
              showValue={false}
              style={{ height: '6px' }}
              className="rounded-full"
            />
          </div>

          {/* Expandable Details */}
          <motion.div
            initial={false}
            animate={{ height: showDetails ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <FaHistory className="text-blue-500" />
                  Recent Activity
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Invoice #INV-2024-001</span>
                    <span className="text-gray-800">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Invoice #INV-2024-002</span>
                    <span className="text-gray-800">Yesterday</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Invoice #INV-2024-003</span>
                    <span className="text-gray-800">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                title="View Details"
              >
                <FaEye size={20} />
              </motion.button>

              <Link href={`/system-setup/invoice-run-code/update/${code._id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
                  title="Edit"
                >
                  <FaEdit size={20} />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                title="Copy Code"
              >
                <FaCopy size={20} />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(code._id)}
              className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
              title="Delete"
            >
              <FaTrash size={20} />
            </motion.button>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Main Component
export default function InvoiceRunCodeElite() {
  const [invoiceCodes, setInvoiceCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(6);
  const [filterPattern, setFilterPattern] = useState('all');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const debouncedSearch = useDebounce(search, 500);

  const toast = useRef();
  const { token } = useSelector((state) => state?.authReducer);

  // Filter options
  const patternOptions = [
    { label: 'All Patterns', value: 'all' },
    { label: 'Alphanumeric', value: 'alphanumeric' },
    { label: 'Numeric Only', value: 'numeric' },
    { label: 'Alphabetic Only', value: 'alphabetic' },
    { label: 'Custom Format', value: 'custom' }
  ];

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BaseURL}/invoice-run-code?search=${debouncedSearch}&page=${page}&limit=${rows}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.success) {
        setInvoiceCodes(result.data);
        setTotalRecords(result.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch invoice run codes",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rows, debouncedSearch]);

  // Delete invoice run code
  const deleteInvoiceRunCode = async () => {
    setLoadingModal(true);
    try {
      const response = await fetch(`${BaseURL}/invoice-run-code/${selectedCodeId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setInvoiceCodes((prev) =>
          prev.filter((code) => code._id !== selectedCodeId)
        );
        setTotalRecords((prevTotal) => prevTotal - 1);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Invoice run code deleted successfully!",
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: result.message || "Failed to delete invoice run code!",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting invoice run code:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while deleting the invoice run code.",
        life: 3000,
      });
    } finally {
      setLoadingModal(false);
      setDeleteDialogVisible(false);
      setSelectedCodeId(null);
    }
  };

  // Copy code to clipboard
  const copyCodeToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.current.show({
      severity: "success",
      summary: "Copied!",
      detail: `Code "${code}" copied to clipboard`,
      life: 2000,
    });
  };

  const onSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const onPageChange = (event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  };

  // Calculate statistics
  const totalCodes = invoiceCodes.length;
  const totalUsage = invoiceCodes.reduce((sum, code) => sum + Math.floor(Math.random() * 100) + 1, 0);
  const activeCustomers = invoiceCodes.reduce((sum, code) => sum + Math.floor(Math.random() * 20) + 1, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        header="Confirm Deletion"
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        footer={
          <div className="flex justify-end gap-2">
            <CanceButton onClick={() => setDeleteDialogVisible(false)} />
            <Button
              label="Delete"
              loading={loadingModal}
              size="small"
              severity="danger"
              icon="pi pi-trash"
              onClick={deleteInvoiceRunCode}
              autoFocus
            />
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-3xl text-yellow-500" />
          <p>Are you sure you want to delete this invoice run code? This action cannot be undone.</p>
        </div>
      </Dialog>

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FaBarcode className="text-blue-500" />
                Invoice Run Codes
                <Badge value={totalRecords} severity="info" />
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage invoice batch processing codes for automated billing runs
              </p>
            </div>
            <Link href="/system-setup/invoice-run-code/create">
              <Button 
                label="Create Invoice Run Code" 
                icon="pi pi-plus" 
                className="bg-blue-500 hover:bg-blue-600"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Onboarding Banner */}
      <AnimatePresence>
        {showOnboarding && invoiceCodes.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-6 mt-6"
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white relative overflow-hidden">
              <button
                onClick={() => setShowOnboarding(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <i className="pi pi-times text-xl" />
              </button>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                  <FaRocket className="text-3xl" />
                  Welcome to Invoice Run Codes!
                </h2>
                <p className="text-white/90 mb-4 max-w-2xl">
                  Invoice run codes help you organize and automate your billing processes. 
                  Create unique codes to group invoices by customer type, billing cycle, 
                  or any custom criteria that fits your business needs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <FaBarcode className="text-2xl mb-2" />
                    <h3 className="font-bold mb-1">Unique Identifiers</h3>
                    <p className="text-sm text-white/80">Create custom codes for different billing scenarios</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <FaChartLine className="text-2xl mb-2" />
                    <h3 className="font-bold mb-1">Track Usage</h3>
                    <p className="text-sm text-white/80">Monitor which codes are used most frequently</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <FaShieldAlt className="text-2xl mb-2" />
                    <h3 className="font-bold mb-1">Organized Billing</h3>
                    <p className="text-sm text-white/80">Keep your invoicing process structured and efficient</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Codes</p>
                <p className="text-2xl font-bold text-gray-800">{totalCodes}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaHashtag className="text-xl text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-green-600">{totalUsage}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaFileInvoice className="text-xl text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-purple-600">{activeCustomers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUsers className="text-xl text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Usage/Code</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalCodes > 0 ? Math.round(totalUsage / totalCodes) : 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaTachometerAlt className="text-xl text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <IconField iconPosition="left">
                <InputIcon>
                  <FaSearch className="text-gray-400" />
                </InputIcon>
                <InputText
                  placeholder="Search invoice run codes..."
                  value={search}
                  onChange={onSearch}
                  className="w-full"
                />
              </IconField>
            </div>
            <div className="flex gap-2">
              <Dropdown
                value={filterPattern}
                options={patternOptions}
                onChange={(e) => setFilterPattern(e.value)}
                placeholder="Filter by pattern"
                className="w-full md:w-auto"
              />
              <Button
                icon="pi pi-filter-slash"
                className="p-button-outlined"
                onClick={() => {
                  setFilterPattern('all');
                  setSearch('');
                }}
                tooltip="Clear filters"
              />
            </div>
          </div>
        </div>

        {/* Invoice Run Code Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <Skeleton height="250px" />
              </div>
            ))}
          </div>
        ) : invoiceCodes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <FaBarcode className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Invoice Run Codes Found</h3>
            <p className="text-gray-600 mb-6">
              {search ? 'Try adjusting your search criteria' : 'Get started by creating your first invoice run code'}
            </p>
            {!search && (
              <Link href="/system-setup/invoice-run-code/create">
                <Button 
                  label="Create Your First Code" 
                  icon="pi pi-plus" 
                  className="bg-blue-500 hover:bg-blue-600"
                />
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {invoiceCodes.map((code, index) => (
                  <InvoiceRunCodeCard
                    key={code._id}
                    code={code}
                    onDelete={(id) => {
                      setSelectedCodeId(id);
                      setDeleteDialogVisible(true);
                    }}
                    onCopyCode={copyCodeToClipboard}
                    onViewDetails={() => {
                      // Future implementation
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <Paginator
                first={(page - 1) * rows}
                rows={rows}
                totalRecords={totalRecords}
                rowsPerPageOptions={[6, 12, 24, 48]}
                onPageChange={onPageChange}
                template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords} invoice run codes"
              />
            </div>
          </>
        )}
      </div>

      {/* Floating Help Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white"
        onClick={() => setShowOnboarding(true)}
      >
        <FaLightbulb className="text-xl" />
      </motion.button>

      {/* Tooltips */}
      <Tooltip target=".p-button-outlined" />
    </div>
  );
}