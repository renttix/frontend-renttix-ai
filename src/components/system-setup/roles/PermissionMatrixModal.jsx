"use client";

import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, FaEye, FaEyeSlash, FaEdit, FaTrash,
  FaPlus, FaKey, FaShieldAlt, FaSearch, FaFilter,
  FaChartBar, FaClipboardList, FaWarehouse, FaUsers,
  FaMoneyBill, FaCogs, FaInfoCircle, FaExclamationTriangle
} from 'react-icons/fa';

// Permission modules (same as in CreateRoleElite)
const permissionModules = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: FaChartBar,
    color: 'blue',
    features: [
      {
        id: 'view_analytics',
        name: 'View Analytics',
        fields: ['revenue_metrics', 'utilization_rates', 'performance_kpis']
      },
      {
        id: 'export_reports',
        name: 'Export Reports',
        fields: ['pdf_export', 'excel_export', 'csv_export']
      }
    ]
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: FaClipboardList,
    color: 'green',
    features: [
      {
        id: 'create_orders',
        name: 'Create Orders',
        fields: ['customer_info', 'rental_items', 'pricing', 'delivery_info']
      },
      {
        id: 'edit_orders',
        name: 'Edit Orders',
        fields: ['order_status', 'payment_terms', 'special_instructions']
      },
      {
        id: 'delete_orders',
        name: 'Delete Orders',
        fields: ['soft_delete', 'permanent_delete']
      }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: FaWarehouse,
    color: 'orange',
    features: [
      {
        id: 'view_inventory',
        name: 'View Inventory',
        fields: ['stock_levels', 'item_details', 'availability_calendar']
      },
      {
        id: 'manage_inventory',
        name: 'Manage Inventory',
        fields: ['add_items', 'update_quantities', 'set_maintenance']
      }
    ]
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: FaUsers,
    color: 'purple',
    features: [
      {
        id: 'view_customers',
        name: 'View Customers',
        fields: ['contact_info', 'rental_history', 'payment_history']
      },
      {
        id: 'manage_customers',
        name: 'Manage Customers',
        fields: ['create_customer', 'edit_customer', 'credit_limits']
      }
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: FaMoneyBill,
    color: 'green',
    features: [
      {
        id: 'invoicing',
        name: 'Invoicing',
        fields: ['create_invoice', 'edit_invoice', 'send_invoice']
      },
      {
        id: 'payments',
        name: 'Payments',
        fields: ['record_payment', 'refund_payment', 'payment_reports']
      }
    ]
  },
  {
    id: 'system',
    name: 'System Setup',
    icon: FaCogs,
    color: 'red',
    features: [
      {
        id: 'user_management',
        name: 'User Management',
        fields: ['create_user', 'edit_user', 'deactivate_user']
      },
      {
        id: 'role_management',
        name: 'Role Management',
        fields: ['create_role', 'edit_permissions', 'assign_roles']
      },
      {
        id: 'system_settings',
        name: 'System Settings',
        fields: ['company_settings', 'tax_settings', 'email_templates']
      }
    ]
  }
];

export default function PermissionMatrixModal({ visible, role, onHide }) {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  if (!role) return null;

  const getPermissionIcon = (permission) => {
    switch (permission) {
      case 'full':
        return <FaCheckCircle className="text-green-500" />;
      case 'view':
        return <FaEye className="text-blue-500" />;
      case 'none':
      default:
        return <FaEyeSlash className="text-gray-400" />;
    }
  };

  const getPermissionBadge = (permission) => {
    switch (permission) {
      case 'full':
        return <Badge value="Full Access" severity="success" />;
      case 'view':
        return <Badge value="View Only" severity="info" />;
      case 'none':
      default:
        return <Badge value="No Access" severity="danger" />;
    }
  };

  const getModuleStats = (moduleId) => {
    const module = permissionModules.find(m => m.id === moduleId);
    if (!module || !role.permissions[moduleId]) return { enabled: 0, total: 0 };

    const enabledFeatures = module.features.filter(
      f => role.permissions[moduleId]?.[f.id]
    ).length;

    return {
      enabled: enabledFeatures,
      total: module.features.length
    };
  };

  const getOverallStats = () => {
    let totalFeatures = 0;
    let enabledFeatures = 0;
    let totalFields = 0;
    let fullAccessFields = 0;
    let viewOnlyFields = 0;

    permissionModules.forEach(module => {
      module.features.forEach(feature => {
        totalFeatures++;
        if (role.permissions[module.id]?.[feature.id]) {
          enabledFeatures++;
        }

        feature.fields.forEach(field => {
          totalFields++;
          const permission = role.fieldPermissions?.[module.id]?.[feature.id]?.[field];
          if (permission === 'full') fullAccessFields++;
          else if (permission === 'view') viewOnlyFields++;
        });
      });
    });

    return {
      totalFeatures,
      enabledFeatures,
      totalFields,
      fullAccessFields,
      viewOnlyFields,
      noAccessFields: totalFields - fullAccessFields - viewOnlyFields
    };
  };

  const stats = getOverallStats();

  const matrixData = permissionModules
    .filter(module => filterModule === 'all' || module.id === filterModule)
    .map(module => {
      const moduleStats = getModuleStats(module.id);
      const features = module.features.map(feature => ({
        module: module.name,
        moduleIcon: module.icon,
        moduleColor: module.color,
        feature: feature.name,
        enabled: role.permissions[module.id]?.[feature.id] || false,
        fields: feature.fields.map(field => ({
          name: field,
          permission: role.fieldPermissions?.[module.id]?.[feature.id]?.[field] || 'none'
        }))
      }));
      
      return {
        module,
        moduleStats,
        features
      };
    });

  const moduleFilterOptions = [
    { label: 'All Modules', value: 'all' },
    ...permissionModules.map(m => ({ label: m.name, value: m.id }))
  ];

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-3">
          <FaKey className="text-purple-500 text-xl" />
          <span>Permission Matrix - {role.name}</span>
        </div>
      }
      modal
      className="w-full max-w-6xl"
      contentClassName="p-0"
    >
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        <TabPanel header="Overview" leftIcon="pi pi-chart-bar">
          <div className="p-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Features Enabled</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {stats.enabledFeatures} / {stats.totalFeatures}
                    </p>
                  </div>
                  <FaShieldAlt className="text-3xl text-blue-500" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Full Access Fields</p>
                    <p className="text-2xl font-bold text-green-800">{stats.fullAccessFields}</p>
                  </div>
                  <FaCheckCircle className="text-3xl text-green-500" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-orange-50 border border-orange-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">View Only Fields</p>
                    <p className="text-2xl font-bold text-orange-800">{stats.viewOnlyFields}</p>
                  </div>
                  <FaEye className="text-3xl text-orange-500" />
                </div>
              </motion.div>
            </div>

            {/* Module Overview */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">Module Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissionModules.map((module) => {
                const Icon = module.icon;
                const moduleStats = getModuleStats(module.id);
                const percentage = moduleStats.total > 0 
                  ? Math.round((moduleStats.enabled / moduleStats.total) * 100) 
                  : 0;

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-${module.color}-100`}>
                        <Icon className={`text-lg text-${module.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{module.name}</h4>
                        <p className="text-xs text-gray-600">
                          {moduleStats.enabled} of {moduleStats.total} features
                        </p>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className={`text-xs font-semibold inline-block text-${module.color}-600`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5 }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${module.color}-500`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Detailed Matrix" leftIcon="pi pi-table">
          <div className="p-6">
            {/* Filters */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <div className="p-input-icon-left w-full">
                  <i className="pi pi-search" />
                  <InputText
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search features..."
                    className="w-full"
                  />
                </div>
              </div>
              <Dropdown
                value={filterModule}
                options={moduleFilterOptions}
                onChange={(e) => setFilterModule(e.value)}
                placeholder="Filter by module"
                className="w-48"
              />
            </div>

            {/* Permission Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left">Module</th>
                    <th className="border border-gray-200 px-4 py-3 text-left">Feature</th>
                    <th className="border border-gray-200 px-4 py-3 text-center">Status</th>
                    <th className="border border-gray-200 px-4 py-3 text-left">Field Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  {matrixData.map((moduleData) => (
                    moduleData.features.map((feature, idx) => (
                      <tr key={`${moduleData.module.id}-${idx}`} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3">
                          {idx === 0 && (
                            <div className="flex items-center gap-2">
                              <moduleData.module.icon className={`text-${moduleData.module.color}-600`} />
                              <span className="font-medium">{moduleData.module.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <span className="text-sm">{feature.feature}</span>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          {feature.enabled ? (
                            <Badge value="Enabled" severity="success" />
                          ) : (
                            <Badge value="Disabled" severity="danger" />
                          )}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {feature.fields.map((field) => (
                              <div
                                key={field.name}
                                className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1"
                              >
                                {getPermissionIcon(field.permission)}
                                <span className="text-xs">{field.name}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Security Analysis" leftIcon="pi pi-shield">
          <div className="p-6">
            <div className="space-y-6">
              {/* Security Level */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaShieldAlt className="text-blue-500" />
                  Security Level Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Security Level</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-800">{role.level}</span>
                      <span className="text-sm text-gray-500">/ 100</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-red-500 to-green-500 h-3 rounded-full"
                      style={{ width: `${role.level}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <FaExclamationTriangle />
                  Risk Assessment
                </h3>
                <div className="space-y-2">
                  {stats.fullAccessFields > 50 && (
                    <div className="flex items-start gap-2">
                      <FaExclamationTriangle className="text-yellow-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">High Access Level</p>
                        <p className="text-xs text-yellow-700">
                          This role has full access to {stats.fullAccessFields} fields. Consider reviewing if all permissions are necessary.
                        </p>
                      </div>
                    </div>
                  )}
                  {role.permissions.system?.role_management && (
                    <div className="flex items-start gap-2">
                      <FaExclamationTriangle className="text-orange-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Role Management Access</p>
                        <p className="text-xs text-orange-700">
                          This role can modify other roles. Ensure this is intentional.
                        </p>
                      </div>
                    </div>
                  )}
                  {role.permissions.finance?.payments && (
                    <div className="flex items-start gap-2">
                      <FaInfoCircle className="text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Financial Access</p>
                        <p className="text-xs text-blue-700">
                          This role has access to payment processing. Regular audits recommended.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <FaInfoCircle />
                  Security Recommendations
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <p className="text-sm text-blue-700">
                      Review permissions quarterly to ensure they align with job responsibilities
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <p className="text-sm text-blue-700">
                      Enable audit logging for all actions performed by users with this role
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <p className="text-sm text-blue-700">
                      Consider implementing approval workflows for sensitive operations
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </Dialog>
  );
}