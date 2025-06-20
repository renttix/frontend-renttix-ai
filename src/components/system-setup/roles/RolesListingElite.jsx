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
import { InputSwitch } from "primereact/inputswitch";
import { motion, AnimatePresence } from "framer-motion";
import { Chart } from "primereact/chart";
import { ProgressBar } from "primereact/progressbar";
import { Skeleton } from "primereact/skeleton";
import { Tooltip } from "primereact/tooltip";
import { Avatar } from "primereact/avatar";
import { AvatarGroup } from "primereact/avatargroup";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import axios from "axios";
import { 
  FaUserShield, 
  FaUsers, 
  FaLock, 
  FaUnlock,
  FaKey,
  FaShieldAlt,
  FaCrown,
  FaUserCog,
  FaUserTie,
  FaUserCheck,
  FaUserTimes,
  FaChartPie,
  FaEye,
  FaEdit,
  FaTrash,
  FaCopy,
  FaPlus,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaLightbulb,
  FaRocket,
  FaCog,
  FaDatabase,
  FaFileAlt,
  FaMoneyBillWave,
  FaTruck,
  FaWarehouse,
  FaClipboardList,
  FaChartLine,
  FaUserPlus,
  FaHistory,
  FaBan,
  FaToggleOn,
  FaToggleOff,
  FaSitemap,
  FaProjectDiagram,
  FaNetworkWired,
  FaLayerGroup,
  FaThLarge,
  FaGripVertical,
  FaExpand,
  FaCompress,
  FaQuestionCircle,
  FaMagic,
  FaPalette,
  FaFingerprint,
  FaUserSecret,
  FaCertificate,
  FaMedal,
  FaStar,
  FaAward,
  FaTrophy,
  FaChevronRight
} from "react-icons/fa";
import { 
  MdSecurity, 
  MdAdminPanelSettings,
  MdVerifiedUser,
  MdDashboard,
  MdViewModule,
  MdViewList,
  MdViewQuilt,
  MdLayers,
  MdAccountTree
} from "react-icons/md";
import { BaseURL } from "../../../../utils/baseUrl";
import CanceButton from "@/components/Buttons/CanceButton";

// Permission module configuration with icons and colors
const moduleConfig = {
  dashboard: { icon: MdDashboard, color: 'blue', label: 'Dashboard' },
  products: { icon: FaDatabase, color: 'green', label: 'Products' },
  customers: { icon: FaUsers, color: 'purple', label: 'Customers' },
  orders: { icon: FaClipboardList, color: 'orange', label: 'Orders' },
  invoicing: { icon: FaFileAlt, color: 'red', label: 'Invoicing' },
  payments: { icon: FaMoneyBillWave, color: 'emerald', label: 'Payments' },
  delivery: { icon: FaTruck, color: 'indigo', label: 'Delivery' },
  warehouse: { icon: FaWarehouse, color: 'yellow', label: 'Warehouse' },
  reports: { icon: FaChartLine, color: 'pink', label: 'Reports' },
  settings: { icon: FaCog, color: 'gray', label: 'Settings' }
};

// Role templates with predefined permissions
const roleTemplates = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    icon: FaCrown,
    color: 'red',
    description: 'Full system access with all permissions',
    level: 100,
    badge: 'SUPER'
  },
  {
    id: 'admin',
    name: 'Administrator',
    icon: MdAdminPanelSettings,
    color: 'orange',
    description: 'Administrative access with most permissions',
    level: 90,
    badge: 'ADMIN'
  },
  {
    id: 'manager',
    name: 'Manager',
    icon: FaUserTie,
    color: 'blue',
    description: 'Managerial access with team oversight',
    level: 70,
    badge: 'MGR'
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    icon: FaUserCog,
    color: 'purple',
    description: 'Supervisory access with limited admin rights',
    level: 60,
    badge: 'SUPV'
  },
  {
    id: 'operator',
    name: 'Operator',
    icon: FaUserCheck,
    color: 'green',
    description: 'Operational access for daily tasks',
    level: 40,
    badge: 'OPR'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    icon: FaEye,
    color: 'gray',
    description: 'Read-only access to view information',
    level: 20,
    badge: 'VIEW'
  }
];

// Role Card Component
const RoleCard = ({ role, onEdit, onDelete, onToggleStatus, onViewPermissions, onDuplicate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const template = roleTemplates.find(t => t.id === role.templateId) || roleTemplates[4];
  const Icon = template.icon;
  
  // Calculate permission statistics
  const totalPermissions = role.permissions ? Object.keys(role.permissions).length : 0;
  const activeModules = role.permissions ? 
    Object.values(role.permissions).filter(p => p.enabled).length : 0;
  const permissionPercentage = totalPermissions > 0 ? 
    Math.round((activeModules / Object.keys(moduleConfig).length) * 100) : 0;

  // Mock user count - in real implementation, this would come from the API
  const userCount = Math.floor(Math.random() * 50) + 1;
  const activeUsers = Math.floor(userCount * 0.8);

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
        ${role.isActive 
          ? `border-${template.color}-200 bg-gradient-to-br from-white to-${template.color}-50 shadow-lg hover:shadow-xl` 
          : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg'
        }
      `}>
        {/* Role Level Badge */}
        <div className={`
          absolute top-3 right-3 px-3 py-1 text-xs font-bold text-white rounded-full
          bg-gradient-to-r from-${template.color}-500 to-${template.color}-600
        `}>
          {template.badge}
        </div>

        {/* Card Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`
                p-4 rounded-xl bg-gradient-to-br from-${template.color}-100 to-${template.color}-200
                ${isHovered ? 'scale-110' : ''} transition-transform duration-300
              `}>
                <Icon className={`text-3xl text-${template.color}-600`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {role.name}
                  {role.isDefault && (
                    <Tag severity="info" value="System" className="text-xs" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{role.description || template.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <FaShieldAlt />
                    Level {template.level}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <FaHistory />
                    Created {new Date(role.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Permission Overview */}
          <div className="mb-4 p-4 bg-white bg-opacity-70 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaKey className="text-yellow-500" />
                Permission Coverage
              </span>
              <span className="text-sm font-bold text-gray-800">{permissionPercentage}%</span>
            </div>
            <ProgressBar 
              value={permissionPercentage} 
              showValue={false}
              style={{ height: '8px' }}
              className="rounded-full"
              color={permissionPercentage > 80 ? '#10b981' : permissionPercentage > 50 ? '#f59e0b' : '#ef4444'}
            />
            <div className="grid grid-cols-5 gap-1 mt-3">
              {Object.entries(moduleConfig).slice(0, 5).map(([key, config]) => {
                const ModuleIcon = config.icon;
                const hasPermission = role.permissions?.[key]?.enabled;
                return (
                  <div key={key}>
                    <Tooltip target={`.module-${key}-${role._id}`} content={config.label} position="top" />
                    <div
                    className={`
                      module-${key}-${role._id} p-2 rounded flex items-center justify-center
                      ${hasPermission 
                        ? `bg-${config.color}-100 text-${config.color}-600` 
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}
                  >
                    <ModuleIcon className="text-lg" />
                  </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <FaUsers className="text-2xl text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Total Users</p>
              <p className="text-lg font-bold text-gray-800">{userCount}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <FaUserCheck className="text-2xl text-green-500 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Active Users</p>
              <p className="text-lg font-bold text-gray-800">{activeUsers}</p>
            </div>
          </div>

          {/* Visual Permission Matrix Preview */}
          <motion.div
            initial={false}
            animate={{ height: showDetails ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <MdViewModule className="text-blue-500" />
                Permission Matrix
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['View', 'Create', 'Edit', 'Delete', 'Export', 'Admin'].map((action) => (
                  <div key={action} className="flex items-center gap-2">
                    <div className={`
                      w-3 h-3 rounded-full
                      ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-300'}
                    `} />
                    <span className="text-gray-600">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleStatus(role._id)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${role.isActive 
                    ? 'bg-green-100 hover:bg-green-200 text-green-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }
                `}
                title={role.isActive ? 'Deactivate' : 'Activate'}
              >
                {role.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                title="View Details"
              >
                {showDetails ? <FaCompress size={20} /> : <FaExpand size={20} />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewPermissions(role)}
                className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
                title="View Permissions"
              >
                <FaKey size={20} />
              </motion.button>

              <Link href={`/system-setup/roles/update/${role._id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors"
                  title="Edit"
                >
                  <FaEdit size={20} />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDuplicate(role)}
                className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors"
                title="Duplicate"
              >
                <FaCopy size={20} />
              </motion.button>
            </div>

            {!role.isDefault && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(role._id)}
                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                title="Delete"
              >
                <FaTrash size={20} />
              </motion.button>
            )}
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

        {/* Security Level Indicator */}
        <div className={`
          absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r
          ${template.level >= 90 ? 'from-red-500 to-orange-500' :
            template.level >= 70 ? 'from-blue-500 to-purple-500' :
            template.level >= 50 ? 'from-green-500 to-teal-500' :
            'from-gray-400 to-gray-500'
          }
        `} />
      </div>
    </motion.div>
  );
};

// Permission Matrix Modal Component
const PermissionMatrixModal = ({ visible, role, onHide }) => {
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModule = (module) => {
    setExpandedModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-3">
          <FaKey className="text-2xl text-purple-500" />
          <span>Permission Matrix - {role?.name}</span>
        </div>
      }
      style={{ width: '90vw', maxWidth: '1200px' }}
      className="permission-matrix-dialog"
    >
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(moduleConfig).map(([moduleKey, config]) => {
            const ModuleIcon = config.icon;
            const isExpanded = expandedModules[moduleKey];
            
            return (
              <motion.div
                key={moduleKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div
                  className={`
                    p-4 cursor-pointer transition-colors
                    bg-gradient-to-r from-${config.color}-50 to-white
                    hover:from-${config.color}-100
                  `}
                  onClick={() => toggleModule(moduleKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${config.color}-100`}>
                        <ModuleIcon className={`text-xl text-${config.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{config.label}</h4>
                        <p className="text-sm text-gray-600">
                          {role?.permissions?.[moduleKey]?.enabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <FaChevronRight 
                      className={`
                        text-gray-400 transition-transform
                        ${isExpanded ? 'rotate-90' : ''}
                      `}
                    />
                  </div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['view', 'create', 'edit', 'delete', 'export', 'admin'].map((action) => (
                            <div key={action} className="flex items-center gap-2">
                              <div className={`
                                w-4 h-4 rounded-full
                                ${role?.permissions?.[moduleKey]?.actions?.[action] 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                                }
                              `} />
                              <span className="text-sm capitalize">{action}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Field-level permissions preview */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Field Permissions</h5>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {['name', 'email', 'phone', 'address', 'credit_limit', 'notes'].map((field) => (
                              <div key={field} className="flex items-center gap-1">
                                <FaEye className={`
                                  ${Math.random() > 0.3 ? 'text-green-500' : 'text-gray-300'}
                                `} />
                                <span className="text-gray-600">{field}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
};

// Main Component
export default function RolesListingElite() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(6);
  const [filterLevel, setFilterLevel] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, hierarchy
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const debouncedSearch = useDebounce(search, 500);

  const toast = useRef();
  const { token } = useSelector((state) => state?.authReducer);

  // View mode options
  const viewModeOptions = [
    { label: 'Grid View', value: 'grid', icon: 'pi pi-th-large' },
    { label: 'List View', value: 'list', icon: 'pi pi-list' },
    { label: 'Hierarchy View', value: 'hierarchy', icon: 'pi pi-sitemap' }
  ];

  // Filter options
  const filterOptions = [
    { label: 'All Roles', value: 'all' },
    { label: 'System Roles', value: 'system' },
    { label: 'Custom Roles', value: 'custom' },
    { label: 'High Security', value: 'high' },
    { label: 'Low Security', value: 'low' }
  ];

  // Fetch roles data
  const fetchRoles = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration - replace with actual API call
      const mockRoles = [
        {
          _id: '1',
          name: 'Super Administrator',
          description: 'Full system access with all permissions',
          templateId: 'super_admin',
          isActive: true,
          isDefault: true,
          createdAt: new Date('2024-01-01'),
          permissions: {
            dashboard: { enabled: true },
            products: { enabled: true },
            customers: { enabled: true },
            orders: { enabled: true },
            invoicing: { enabled: true }
          }
        },
        {
          _id: '2',
          name: 'Regional Manager',
          description: 'Manages regional operations and team',
          templateId: 'manager',
          isActive: true,
          isDefault: false,
          createdAt: new Date('2024-02-15'),
          permissions: {
            dashboard: { enabled: true },
            products: { enabled: true },
            customers: { enabled: true },
            orders: { enabled: true },
            invoicing: { enabled: false }
          }
        },
        {
          _id: '3',
          name: 'Sales Operator',
          description: 'Handles sales and customer interactions',
          templateId: 'operator',
          isActive: true,
          isDefault: false,
          createdAt: new Date('2024-03-10'),
          permissions: {
            dashboard: { enabled: true },
            products: { enabled: true },
            customers: { enabled: true },
            orders: { enabled: true },
            invoicing: { enabled: false }
          }
        },
        {
          _id: '4',
          name: 'Warehouse Supervisor',
          description: 'Oversees warehouse operations',
          templateId: 'supervisor',
          isActive: true,
          isDefault: false,
          createdAt: new Date('2024-03-20'),
          permissions: {
            dashboard: { enabled: true },
            products: { enabled: true },
            warehouse: { enabled: true },
            delivery: { enabled: true }
          }
        }
      ];

      // Filter based on search
      let filteredRoles = mockRoles;
      if (debouncedSearch) {
        filteredRoles = mockRoles.filter(role => 
          role.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          role.description.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }

      setRoles(filteredRoles);
      setTotalRecords(filteredRoles.length);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch roles",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, rows, debouncedSearch, filterLevel]);

  // Toggle role status
  const toggleRoleStatus = async (roleId) => {
    try {
      const role = roles.find(r => r._id === roleId);
      if (!role) return;

      setRoles(prev => 
        prev.map(r => 
          r._id === roleId 
            ? { ...r, isActive: !r.isActive }
            : r
        )
      );

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: `Role ${role.isActive ? 'deactivated' : 'activated'} successfully!`,
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update role status",
        life: 3000,
      });
    }
  };

  // Delete role
  const deleteRole = async () => {
    try {
      setRoles(prev => prev.filter(r => r._id !== selectedRoleId));
      setTotalRecords(prev => prev - 1);
      
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Role deleted successfully!",
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete role",
        life: 3000,
      });
    } finally {
      setDeleteDialogVisible(false);
      setSelectedRoleId(null);
    }
  };

  // Duplicate role
  const duplicateRole = (role) => {
    toast.current.show({
      severity: "info",
      summary: "Coming Soon",
      detail: "Role duplication will be available soon!",
      life: 3000,
    });
  };

  // View permissions
  const viewPermissions = (role) => {
    setSelectedRole(role);
    setPermissionModalVisible(true);
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
  const totalRoles = roles.length;
  const activeRoles = roles.filter(r => r.isActive).length;
  const systemRoles = roles.filter(r => r.isDefault).length;
  const customRoles = totalRoles - systemRoles;

  // Permission coverage chart data
  const chartData = {
    labels: ['Full Access', 'High Access', 'Medium Access', 'Low Access', 'View Only'],
    datasets: [{
      data: [15, 25, 35, 20, 5],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6b7280'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      }
    },
    maintainAspectRatio: false
  };

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
              size="small"
              severity="danger"
              icon="pi pi-trash"
              onClick={deleteRole}
              autoFocus
            />
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-3xl text-yellow-500" />
          <p>Are you sure you want to delete this role? All users assigned to this role will need to be reassigned.</p>
        </div>
      </Dialog>

      {/* Permission Matrix Modal */}
      <PermissionMatrixModal
        visible={permissionModalVisible}
        role={selectedRole}
        onHide={() => setPermissionModalVisible(false)}
      />

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FaUserShield className="text-purple-500" />
                Role Management
                <Badge value={totalRecords} severity="warning" />
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage user roles and permissions with institutional-grade security
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/system-setup/roles/create">
                <Button
                  label="Create Role"
                  icon="pi pi-plus"
                  className="bg-purple-500 hover:bg-purple-600"
                />
              </Link>
              <Button
                icon="pi pi-cog"
                className="p-button-outlined"
                tooltip="Role Settings"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Banner */}
      <AnimatePresence>
        {showOnboarding && roles.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-6 mt-6"
          >
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white relative overflow-hidden">
              <button
                onClick={() => setShowOnboarding(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <i className="pi pi-times text-xl" />
              </button>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                  <FaRocket className="text-3xl" />
                  Welcome to Elite Role Management!
                </h2>
                <p className="text-white/90 mb-4 max-w-2xl">
                  Create institutional-grade roles with fine-grained permissions down to the field level.
                  Control exactly what each user can see, edit, and access across your entire rental platform.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <FaShieldAlt className="text-2xl mb-2" />
                    <h3 className="font-bold mb-1">Field-Level Control</h3>
                    <p className="text-sm text-white/80">Control visibility and editability per field</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <FaKey className="text-2xl mb-2" />
                    <h3 className="font-bold mb-1">Permission Matrix</h3>
                    <p className="text-sm text-white/80">Visual permission builder interface</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <FaSitemap className="text-2xl mb-2" />
                    <h3 className="font-bold mb-1">Role Hierarchy</h3>
                    <p className="text-sm text-white/80">Inheritance and template system</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <FaHistory className="text-2xl mb-2" />
                    <h3 className="font-bold mb-1">Audit Trail</h3>
                    <p className="text-sm text-white/80">Complete permission history</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics and Analytics */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-800">{totalRoles}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUsers className="text-xl text-purple-600" />
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
                <p className="text-sm text-gray-600">Active Roles</p>
                <p className="text-2xl font-bold text-green-600">{activeRoles}</p>
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
                <p className="text-sm text-gray-600">System Roles</p>
                <p className="text-2xl font-bold text-blue-600">{systemRoles}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaShieldAlt className="text-xl text-blue-600" />
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
                <p className="text-sm text-gray-600">Custom Roles</p>
                <p className="text-2xl font-bold text-orange-600">{customRoles}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaCog className="text-xl text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-indigo-600">247</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FaUserCheck className="text-xl text-indigo-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Permission Distribution Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartPie className="text-purple-500" />
              Permission Distribution
            </h3>
            <div style={{ height: '250px' }}>
              <Chart type="doughnut" data={chartData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaProjectDiagram className="text-blue-500" />
              Role Hierarchy Overview
            </h3>
            <div className="space-y-3">
              {roleTemplates.map((template, index) => {
                const Icon = template.icon;
                const roleCount = roles.filter(r => r.templateId === template.id).length;
                
                return (
                  <div key={template.id} className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-${template.color}-100`}>
                      <Icon className={`text-lg text-${template.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{template.name}</span>
                        <span className="text-sm text-gray-500">{roleCount} roles</span>
                      </div>
                      <ProgressBar
                        value={template.level}
                        showValue={false}
                        style={{ height: '6px' }}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Search, Filter and View Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <IconField iconPosition="left">
                <InputIcon>
                  <FaSearch className="text-gray-400" />
                </InputIcon>
                <InputText
                  placeholder="Search roles by name or description..."
                  value={search}
                  onChange={onSearch}
                  className="w-full"
                />
              </IconField>
            </div>
            <div className="flex gap-2">
              <Dropdown
                value={filterLevel}
                options={filterOptions}
                onChange={(e) => setFilterLevel(e.value)}
                placeholder="Filter roles"
                className="w-full md:w-auto"
              />
              <Dropdown
                value={viewMode}
                options={viewModeOptions}
                onChange={(e) => setViewMode(e.value)}
                placeholder="View mode"
                className="w-full md:w-auto"
                itemTemplate={(option) => (
                  <div className="flex items-center gap-2">
                    <i className={option.icon} />
                    <span>{option.label}</span>
                  </div>
                )}
              />
              <Button
                icon="pi pi-filter-slash"
                className="p-button-outlined"
                onClick={() => {
                  setFilterLevel('all');
                  setSearch('');
                }}
                tooltip="Clear filters"
              />
            </div>
          </div>
        </div>

        {/* Roles Grid/List/Hierarchy View */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <Skeleton height="300px" />
              </div>
            ))}
          </div>
        ) : roles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <FaUserShield className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Roles Found</h3>
            <p className="text-gray-600 mb-6">
              {search ? 'Try adjusting your search criteria' : 'Get started by creating your first role'}
            </p>
            {!search && (
              <Link href="/system-setup/roles/create">
                <Button
                  label="Create Your First Role"
                  icon="pi pi-plus"
                  className="bg-purple-500 hover:bg-purple-600"
                />
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {roles.map((role, index) => (
                    <RoleCard
                      key={role._id}
                      role={role}
                      onEdit={(id) => {}}
                      onDelete={(id) => {
                        setSelectedRoleId(id);
                        setDeleteDialogVisible(true);
                      }}
                      onToggleStatus={toggleRoleStatus}
                      onViewPermissions={viewPermissions}
                      onDuplicate={duplicateRole}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <Paginator
                first={(page - 1) * rows}
                rows={rows}
                totalRecords={totalRecords}
                rowsPerPageOptions={[6, 12, 24, 48]}
                onPageChange={onPageChange}
                template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords} roles"
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white"
        onClick={() => setShowOnboarding(true)}
      >
        <FaLightbulb className="text-xl" />
      </motion.button>

      {/* Tooltips */}
      <Tooltip target=".p-button-outlined" />
    </div>
  );
}