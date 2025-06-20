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
  FaCalculator, 
  FaChartLine, 
  FaCalendarAlt, 
  FaInfoCircle,
  FaLightbulb,
  FaRocket,
  FaShieldAlt,
  FaClock,
  FaMoneyBillWave,
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
  FaExclamationTriangle
} from "react-icons/fa";
import { MdDeleteForever, MdContentCopy, MdVisibility } from "react-icons/md";
import { BaseURL } from "../../../../utils/baseUrl";
import CanceButton from "@/components/Buttons/CanceButton";
import { Tooltip } from "primereact/tooltip";
import { ProgressBar } from "primereact/progressbar";
import { Skeleton } from "primereact/skeleton";

// Rate Definition Card Component
const RateDefinitionCard = ({ rate, onDelete, onToggleStatus, onDuplicate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate usage percentage (mock data for now)
  const usagePercentage = Math.floor(Math.random() * 100);
  const productsUsingRate = Math.floor(Math.random() * 20) + 1;

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
        ${rate.isActive 
          ? 'border-green-200 bg-gradient-to-br from-white to-green-50 shadow-lg hover:shadow-xl' 
          : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg'
        }
      `}>
        {/* Status Ribbon */}
        <div className={`
          absolute top-0 right-0 px-4 py-1 text-xs font-bold text-white
          ${rate.isActive ? 'bg-green-500' : 'bg-gray-400'}
          transform rotate-12 translate-x-6 translate-y-2
        `}>
          {rate.isActive ? 'ACTIVE' : 'INACTIVE'}
        </div>

        {/* Card Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                p-3 rounded-lg
                ${rate.isActive ? 'bg-green-100' : 'bg-gray-100'}
              `}>
                <FaCalculator className={`
                  text-2xl
                  ${rate.isActive ? 'text-green-600' : 'text-gray-600'}
                `} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{rate.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{rate.description}</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white bg-opacity-70 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <FaCalendarAlt className="text-blue-500 text-sm" />
                <span className="text-xs text-gray-600">Min. Rental Period</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {rate.minimumRentalPeriod} <span className="text-sm font-normal">days</span>
              </p>
            </div>
            <div className="bg-white bg-opacity-70 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <FaClock className="text-purple-500 text-sm" />
                <span className="text-xs text-gray-600">Rental Days/Week</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {rate.rentalDaysPerWeek} <span className="text-sm font-normal">days</span>
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Usage in Products</span>
              <span className="text-xs font-bold text-gray-800">{productsUsingRate} products</span>
            </div>
            <ProgressBar 
              value={usagePercentage} 
              showValue={false}
              style={{ height: '6px' }}
              className="rounded-full"
            />
          </div>

          {/* Visual Rate Preview */}
          <motion.div
            initial={false}
            animate={{ height: showDetails ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <FaChartLine className="text-blue-500" />
                  Rate Structure Preview
                </h4>
                <div className="grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <div key={day} className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Day {day}</div>
                      <div className={`
                        h-16 rounded flex items-end justify-center
                        ${rate.dayRates?.[day - 1]?.active 
                          ? 'bg-gradient-to-t from-blue-500 to-blue-300' 
                          : 'bg-gray-200'
                        }
                      `}>
                        <span className="text-xs text-white font-bold mb-1">
                          {rate.dayRates?.[day - 1]?.rate || '-'}%
                        </span>
                      </div>
                    </div>
                  ))}
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
                onClick={() => onToggleStatus(rate._id)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${rate.isActive 
                    ? 'bg-green-100 hover:bg-green-200 text-green-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }
                `}
                title={rate.isActive ? 'Deactivate' : 'Activate'}
              >
                {rate.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                title="View Details"
              >
                <FaEye size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDuplicate(rate)}
                className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
                title="Duplicate"
              >
                <FaCopy size={20} />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(rate._id)}
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
              className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Main Component
export default function RateDefinitionElite() {
  const [rateDefinitions, setRateDefinitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(6);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const debouncedSearch = useDebounce(search, 500);

  const toast = useRef();
  const { token } = useSelector((state) => state?.authReducer);

  // Filter options
  const filterOptions = [
    { label: 'All Rates', value: 'all' },
    { label: 'Active Only', value: 'active' },
    { label: 'Inactive Only', value: 'inactive' }
  ];

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BaseURL}/rate-definition?search=${debouncedSearch}&page=${page}&limit=${rows}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.success) {
        // Filter based on status
        let filteredData = result.data;
        if (filterStatus === 'active') {
          filteredData = result.data.filter(rate => rate.isActive);
        } else if (filterStatus === 'inactive') {
          filteredData = result.data.filter(rate => !rate.isActive);
        }
        setRateDefinitions(filteredData);
        setTotalRecords(result.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch rate definitions",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rows, debouncedSearch, filterStatus]);

  // Delete rate definition
  const deleteRateDefinition = async () => {
    setLoadingModal(true);
    try {
      const response = await fetch(`${BaseURL}/rate-definition/${selectedRateId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setRateDefinitions((prev) =>
          prev.filter((rate) => rate._id !== selectedRateId)
        );
        setTotalRecords((prevTotal) => prevTotal - 1);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Rate definition deleted successfully!",
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: result.message || "Failed to delete rate definition!",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting rate definition:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while deleting the rate definition.",
        life: 3000,
      });
    } finally {
      setLoadingModal(false);
      setDeleteDialogVisible(false);
      setSelectedRateId(null);
    }
  };

  // Toggle rate status
  const toggleRateStatus = async (rateId) => {
    const rate = rateDefinitions.find(r => r._id === rateId);
    if (!rate) return;

    try {
      // Here you would make an API call to update the status
      // For now, we'll just update locally
      setRateDefinitions(prev => 
        prev.map(r => 
          r._id === rateId 
            ? { ...r, isActive: !r.isActive }
            : r
        )
      );

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: `Rate definition ${rate.isActive ? 'deactivated' : 'activated'} successfully!`,
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update rate status",
        life: 3000,
      });
    }
  };

  // Duplicate rate definition
  const duplicateRate = (rate) => {
    toast.current.show({
      severity: "info",
      summary: "Coming Soon",
      detail: "Duplicate functionality will be available soon!",
      life: 3000,
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
  const activeRates = rateDefinitions.filter(r => r.isActive).length;
  const totalRates = rateDefinitions.length;

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
              onClick={deleteRateDefinition}
              autoFocus
            />
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-3xl text-yellow-500" />
          <p>Are you sure you want to delete this rate definition? This action cannot be undone.</p>
        </div>
      </Dialog>

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FaCalculator className="text-orange-500" />
                Rate Definitions
                <Badge value={totalRates} severity="warning" />
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage rental pricing structures and billing cycles for your products
              </p>
            </div>
            <Link href="/system-setup/rate-definition/create">
              <Button 
                label="Create Rate Definition" 
                icon="pi pi-plus" 
                className="bg-orange-500 hover:bg-orange-600"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Onboarding Banner */}
      <AnimatePresence>
        {showOnboarding && rateDefinitions.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-6 mt-6"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
              <button
                onClick={() => setShowOnboarding(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <i className="pi pi-times text-xl" />
              </button>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                  <FaRocket className="text-3xl" />
                  Welcome to Rate Definitions!
                </h2>
                <p className="text-white/90 mb-4 max-w-2xl">
                  Rate definitions control how your rental products are priced over time. 
                  Set up minimum rental periods, define daily rates, and create flexible 
                  pricing structures that match your business needs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <FaCalendarAlt className="text-2xl mb-2" />
                    <h3 className="font-bold mb-1">Flexible Periods</h3>
                    <p className="text-sm text-white/80">Set minimum rental days and weekly cycles</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <FaChartLine className="text-2xl mb-2" />
                    <h3 className="font-bold mb-1">Dynamic Pricing</h3>
                    <p className="text-sm text-white/80">Configure rates that change over time</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <FaShieldAlt className="text-2xl mb-2" />
                    <h3 className="font-bold mb-1">Product Integration</h3>
                    <p className="text-sm text-white/80">Apply rates to multiple products easily</p>
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
                <p className="text-sm text-gray-600">Total Rates</p>
                <p className="text-2xl font-bold text-gray-800">{totalRates}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaCalculator className="text-xl text-blue-600" />
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
                <p className="text-sm text-gray-600">Active Rates</p>
                <p className="text-2xl font-bold text-green-600">{activeRates}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="text-xl text-green-600" />
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
                <p className="text-sm text-gray-600">Avg. Min Period</p>
                <p className="text-2xl font-bold text-purple-600">
                  {rateDefinitions.length > 0 
                    ? Math.round(rateDefinitions.reduce((acc, r) => acc + r.minimumRentalPeriod, 0) / rateDefinitions.length)
                    : 0
                  } days
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaClock className="text-xl text-purple-600" />
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
                <p className="text-sm text-gray-600">Products Using</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.floor(Math.random() * 50) + 10}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaMoneyBillWave className="text-xl text-orange-600" />
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
                  placeholder="Search rate definitions..."
                  value={search}
                  onChange={onSearch}
                  className="w-full"
                />
              </IconField>
            </div>
            <div className="flex gap-2">
              <Dropdown
                value={filterStatus}
                options={filterOptions}
                onChange={(e) => setFilterStatus(e.value)}
                placeholder="Filter by status"
                className="w-full md:w-auto"
              />
              <Button
                icon="pi pi-filter-slash"
                className="p-button-outlined"
                onClick={() => {
                  setFilterStatus('all');
                  setSearch('');
                }}
                tooltip="Clear filters"
              />
            </div>
          </div>
        </div>

        {/* Rate Definition Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <Skeleton height="200px" />
              </div>
            ))}
          </div>
        ) : rateDefinitions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <FaCalculator className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Rate Definitions Found</h3>
            <p className="text-gray-600 mb-6">
              {search ? 'Try adjusting your search criteria' : 'Get started by creating your first rate definition'}
            </p>
            {!search && (
              <Link href="/system-setup/rate-definition/create">
                <Button 
                  label="Create Your First Rate" 
                  icon="pi pi-plus" 
                  className="bg-orange-500 hover:bg-orange-600"
                />
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {rateDefinitions.map((rate, index) => (
                  <RateDefinitionCard
                    key={rate._id}
                    rate={rate}
                    onDelete={(id) => {
                      setSelectedRateId(id);
                      setDeleteDialogVisible(true);
                    }}
                    onToggleStatus={toggleRateStatus}
                    onDuplicate={duplicateRate}
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
                currentPageReportTemplate="{first} to {last} of {totalRecords} rate definitions"
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white"
        onClick={() => setShowOnboarding(true)}
      >
        <FaLightbulb className="text-xl" />
      </motion.button>

      {/* Tooltips */}
      <Tooltip target=".p-button-outlined" />
    </div>
  );
}