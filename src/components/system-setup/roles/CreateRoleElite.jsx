"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { TabView, TabPanel } from 'primereact/tabview';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Badge } from 'primereact/badge';
import { Chip } from 'primereact/chip';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import { Tree } from 'primereact/tree';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserShield, FaKey, FaShieldAlt, FaCog, FaLock, FaUnlock,
  FaEye, FaEyeSlash, FaEdit, FaTrash, FaPlus, FaMinus,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
  FaClipboardList, FaDatabase, FaChartBar, FaUsers,
  FaFileAlt, FaCalendar, FaMoneyBill, FaTruck, FaWarehouse,
  FaClipboard, FaCogs, FaHistory, FaSave, FaArrowLeft,
  FaLightbulb, FaSearch, FaFilter, FaSort, FaDownload,
  FaUpload, FaPrint, FaEnvelope, FaBell, FaGlobe,
  FaMagic, FaRocket, FaCheckSquare, FaSquare, FaTools
} from 'react-icons/fa';
import axios from 'axios';
import { BaseURL } from '../../../../utils/baseUrl';
import CanceButton from '@/components/Buttons/CanceButton';

// Permission modules configuration
const permissionModules = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: FaChartBar,
    color: 'blue',
    description: 'Access to analytics and reporting dashboards',
    features: [
      {
        id: 'view_analytics',
        name: 'View Analytics',
        description: 'View dashboard analytics and reports',
        fields: [
          { id: 'revenue_metrics', name: 'Revenue Metrics', type: 'view' },
          { id: 'utilization_rates', name: 'Utilization Rates', type: 'view' },
          { id: 'performance_kpis', name: 'Performance KPIs', type: 'view' }
        ]
      },
      {
        id: 'export_reports',
        name: 'Export Reports',
        description: 'Export dashboard data and reports',
        fields: [
          { id: 'pdf_export', name: 'PDF Export', type: 'action' },
          { id: 'excel_export', name: 'Excel Export', type: 'action' },
          { id: 'csv_export', name: 'CSV Export', type: 'action' }
        ]
      }
    ]
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: FaClipboardList,
    color: 'green',
    description: 'Manage rental orders and contracts',
    features: [
      {
        id: 'create_orders',
        name: 'Create Orders',
        description: 'Create new rental orders',
        fields: [
          { id: 'customer_info', name: 'Customer Information', type: 'edit' },
          { id: 'rental_items', name: 'Rental Items', type: 'edit' },
          { id: 'pricing', name: 'Pricing', type: 'edit' },
          { id: 'delivery_info', name: 'Delivery Information', type: 'edit' }
        ]
      },
      {
        id: 'edit_orders',
        name: 'Edit Orders',
        description: 'Modify existing orders',
        fields: [
          { id: 'order_status', name: 'Order Status', type: 'edit' },
          { id: 'payment_terms', name: 'Payment Terms', type: 'edit' },
          { id: 'special_instructions', name: 'Special Instructions', type: 'edit' }
        ]
      },
      {
        id: 'delete_orders',
        name: 'Delete Orders',
        description: 'Remove orders from system',
        fields: [
          { id: 'soft_delete', name: 'Soft Delete', type: 'action' },
          { id: 'permanent_delete', name: 'Permanent Delete', type: 'action' }
        ]
      }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: FaWarehouse,
    color: 'orange',
    description: 'Manage rental inventory and equipment',
    features: [
      {
        id: 'view_inventory',
        name: 'View Inventory',
        description: 'View inventory items and availability',
        fields: [
          { id: 'stock_levels', name: 'Stock Levels', type: 'view' },
          { id: 'item_details', name: 'Item Details', type: 'view' },
          { id: 'availability_calendar', name: 'Availability Calendar', type: 'view' }
        ]
      },
      {
        id: 'manage_inventory',
        name: 'Manage Inventory',
        description: 'Add, edit, and remove inventory items',
        fields: [
          { id: 'add_items', name: 'Add Items', type: 'action' },
          { id: 'update_quantities', name: 'Update Quantities', type: 'edit' },
          { id: 'set_maintenance', name: 'Set Maintenance', type: 'action' }
        ]
      }
    ]
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: FaUsers,
    color: 'purple',
    description: 'Customer relationship management',
    features: [
      {
        id: 'view_customers',
        name: 'View Customers',
        description: 'Access customer information',
        fields: [
          { id: 'contact_info', name: 'Contact Information', type: 'view' },
          { id: 'rental_history', name: 'Rental History', type: 'view' },
          { id: 'payment_history', name: 'Payment History', type: 'view' }
        ]
      },
      {
        id: 'manage_customers',
        name: 'Manage Customers',
        description: 'Create and edit customer records',
        fields: [
          { id: 'create_customer', name: 'Create Customer', type: 'action' },
          { id: 'edit_customer', name: 'Edit Customer', type: 'edit' },
          { id: 'credit_limits', name: 'Credit Limits', type: 'edit' }
        ]
      }
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: FaMoneyBill,
    color: 'green',
    description: 'Financial management and invoicing',
    features: [
      {
        id: 'invoicing',
        name: 'Invoicing',
        description: 'Create and manage invoices',
        fields: [
          { id: 'create_invoice', name: 'Create Invoice', type: 'action' },
          { id: 'edit_invoice', name: 'Edit Invoice', type: 'edit' },
          { id: 'send_invoice', name: 'Send Invoice', type: 'action' }
        ]
      },
      {
        id: 'payments',
        name: 'Payments',
        description: 'Process and track payments',
        fields: [
          { id: 'record_payment', name: 'Record Payment', type: 'action' },
          { id: 'refund_payment', name: 'Refund Payment', type: 'action' },
          { id: 'payment_reports', name: 'Payment Reports', type: 'view' }
        ]
      }
    ]
  },
  {
    id: 'system',
    name: 'System Setup',
    icon: FaCogs,
    color: 'red',
    description: 'System configuration and settings',
    features: [
      {
        id: 'user_management',
        name: 'User Management',
        description: 'Manage system users',
        fields: [
          { id: 'create_user', name: 'Create User', type: 'action' },
          { id: 'edit_user', name: 'Edit User', type: 'edit' },
          { id: 'deactivate_user', name: 'Deactivate User', type: 'action' }
        ]
      },
      {
        id: 'role_management',
        name: 'Role Management',
        description: 'Configure roles and permissions',
        fields: [
          { id: 'create_role', name: 'Create Role', type: 'action' },
          { id: 'edit_permissions', name: 'Edit Permissions', type: 'edit' },
          { id: 'assign_roles', name: 'Assign Roles', type: 'action' }
        ]
      },
      {
        id: 'system_settings',
        name: 'System Settings',
        description: 'Configure system parameters',
        fields: [
          { id: 'company_settings', name: 'Company Settings', type: 'edit' },
          { id: 'tax_settings', name: 'Tax Settings', type: 'edit' },
          { id: 'email_templates', name: 'Email Templates', type: 'edit' }
        ]
      }
    ]
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    icon: FaCogs,
    color: 'yellow',
    description: 'Product maintenance and service management',
    features: [
      {
        id: 'view_maintenance',
        name: 'View Maintenance',
        description: 'View maintenance schedules and history',
        fields: [
          { id: 'maintenance_calendar', name: 'Maintenance Calendar', type: 'view' },
          { id: 'service_history', name: 'Service History', type: 'view' },
          { id: 'upcoming_tasks', name: 'Upcoming Tasks', type: 'view' },
          { id: 'maintenance_costs', name: 'Maintenance Costs', type: 'view' }
        ]
      },
      {
        id: 'manage_maintenance',
        name: 'Manage Maintenance',
        description: 'Create and manage maintenance tasks',
        fields: [
          { id: 'schedule_maintenance', name: 'Schedule Maintenance', type: 'action' },
          { id: 'assign_technicians', name: 'Assign Technicians', type: 'action' },
          { id: 'update_status', name: 'Update Task Status', type: 'edit' },
          { id: 'add_notes', name: 'Add Maintenance Notes', type: 'edit' }
        ]
      },
      {
        id: 'maintenance_config',
        name: 'Maintenance Configuration',
        description: 'Configure maintenance settings',
        fields: [
          { id: 'task_types', name: 'Manage Task Types', type: 'edit' },
          { id: 'maintenance_intervals', name: 'Set Maintenance Intervals', type: 'edit' },
          { id: 'product_maintenance', name: 'Product Maintenance Settings', type: 'edit' },
          { id: 'approval_workflows', name: 'Approval Workflows', type: 'edit' }
        ]
      },
      {
        id: 'maintenance_reports',
        name: 'Maintenance Reports',
        description: 'Generate and view maintenance reports',
        fields: [
          { id: 'compliance_reports', name: 'Compliance Reports', type: 'view' },
          { id: 'cost_analysis', name: 'Cost Analysis', type: 'view' },
          { id: 'efficiency_metrics', name: 'Efficiency Metrics', type: 'view' },
          { id: 'export_reports', name: 'Export Reports', type: 'action' }
        ]
      }
    ]
  }
];

// Role templates
const roleTemplates = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    level: 100,
    icon: FaUserShield,
    color: 'red',
    permissions: 'all'
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Administrative access with most permissions',
    level: 80,
    icon: FaShieldAlt,
    color: 'orange',
    permissions: 'admin'
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Managerial access for daily operations',
    level: 60,
    icon: FaUsers,
    color: 'blue',
    permissions: 'manager'
  },
  {
    id: 'maintenance_supervisor',
    name: 'Maintenance Supervisor',
    description: 'Full maintenance access with approval rights',
    level: 70,
    icon: FaCogs,
    color: 'yellow',
    permissions: 'maintenance_supervisor'
  },
  {
    id: 'maintenance_tech',
    name: 'Maintenance Technician',
    description: 'Execute and update maintenance tasks',
    level: 50,
    icon: FaTools,
    color: 'teal',
    permissions: 'maintenance_tech'
  },
  {
    id: 'operator',
    name: 'Operator',
    description: 'Operational access for routine tasks',
    level: 40,
    icon: FaCog,
    color: 'green',
    permissions: 'operator'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to view information',
    level: 20,
    icon: FaEye,
    color: 'gray',
    permissions: 'viewer'
  },
  {
    id: 'custom',
    name: 'Custom Role',
    description: 'Create a custom role with specific permissions',
    level: 0,
    icon: FaMagic,
    color: 'purple',
    permissions: 'custom'
  }
];

export default function CreateRoleElite() {
  const router = useRouter();
  const { id } = useParams();
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showTemplateDialog, setShowTemplateDialog] = useState(!id);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testUser, setTestUser] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 50,
    status: 'active',
    isSystem: false,
    permissions: {},
    fieldPermissions: {},
    metadata: {
      createdBy: 'System',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: 1
    }
  });

  // Permission state
  const [expandedModules, setExpandedModules] = useState([]);
  const [searchPermission, setSearchPermission] = useState('');
  const [permissionFilter, setPermissionFilter] = useState('all');

  useEffect(() => {
    if (id) {
      fetchRole();
    }
  }, [id]);

  const fetchRole = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseURL}/roles/${id}`);
      setFormData(response.data);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch role details',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    // Apply template permissions
    if (template.permissions === 'all') {
      // Grant all permissions
      const allPermissions = {};
      const allFieldPermissions = {};
      
      permissionModules.forEach(module => {
        allPermissions[module.id] = {};
        allFieldPermissions[module.id] = {};
        
        module.features.forEach(feature => {
          allPermissions[module.id][feature.id] = true;
          allFieldPermissions[module.id][feature.id] = {};
          
          feature.fields.forEach(field => {
            allFieldPermissions[module.id][feature.id][field.id] = 'full';
          });
        });
      });
      
      setFormData({
        ...formData,
        name: template.name,
        description: template.description,
        level: template.level,
        permissions: allPermissions,
        fieldPermissions: allFieldPermissions
      });
    } else if (template.permissions === 'viewer') {
      // Grant view-only permissions
      const viewPermissions = {};
      const viewFieldPermissions = {};
      
      permissionModules.forEach(module => {
        viewPermissions[module.id] = {};
        viewFieldPermissions[module.id] = {};
        
        module.features.forEach(feature => {
          if (feature.id.includes('view')) {
            viewPermissions[module.id][feature.id] = true;
            viewFieldPermissions[module.id][feature.id] = {};
            
            feature.fields.forEach(field => {
              if (field.type === 'view') {
                viewFieldPermissions[module.id][feature.id][field.id] = 'view';
              }
            });
          }
        });
      });
      
      setFormData({
        ...formData,
        name: template.name,
        description: template.description,
        level: template.level,
        permissions: viewPermissions,
        fieldPermissions: viewFieldPermissions
      });
    } else if (template.permissions === 'maintenance_supervisor') {
      // Grant maintenance supervisor permissions
      const supervisorPermissions = {};
      const supervisorFieldPermissions = {};
      
      // Full maintenance permissions
      if (permissionModules.find(m => m.id === 'maintenance')) {
        supervisorPermissions.maintenance = {};
        supervisorFieldPermissions.maintenance = {};
        
        const maintenanceModule = permissionModules.find(m => m.id === 'maintenance');
        maintenanceModule.features.forEach(feature => {
          supervisorPermissions.maintenance[feature.id] = true;
          supervisorFieldPermissions.maintenance[feature.id] = {};
          
          feature.fields.forEach(field => {
            supervisorFieldPermissions.maintenance[feature.id][field.id] = 'full';
          });
        });
      }
      
      // View permissions for other modules
      permissionModules.forEach(module => {
        if (module.id !== 'maintenance' && module.id !== 'system') {
          supervisorPermissions[module.id] = {};
          supervisorFieldPermissions[module.id] = {};
          
          module.features.forEach(feature => {
            if (feature.id.includes('view')) {
              supervisorPermissions[module.id][feature.id] = true;
              supervisorFieldPermissions[module.id][feature.id] = {};
              
              feature.fields.forEach(field => {
                supervisorFieldPermissions[module.id][feature.id][field.id] = 'view';
              });
            }
          });
        }
      });
      
      setFormData({
        ...formData,
        name: template.name,
        description: template.description,
        level: template.level,
        permissions: supervisorPermissions,
        fieldPermissions: supervisorFieldPermissions
      });
    } else if (template.permissions === 'maintenance_tech') {
      // Grant maintenance technician permissions
      const techPermissions = {};
      const techFieldPermissions = {};
      
      // Limited maintenance permissions
      if (permissionModules.find(m => m.id === 'maintenance')) {
        techPermissions.maintenance = {};
        techFieldPermissions.maintenance = {};
        
        const maintenanceModule = permissionModules.find(m => m.id === 'maintenance');
        maintenanceModule.features.forEach(feature => {
          if (feature.id === 'view_maintenance' || feature.id === 'manage_maintenance') {
            techPermissions.maintenance[feature.id] = true;
            techFieldPermissions.maintenance[feature.id] = {};
            
            feature.fields.forEach(field => {
              // Technicians can't assign to others or see costs
              if (field.id === 'assign_technicians' || field.id === 'maintenance_costs') {
                techFieldPermissions.maintenance[feature.id][field.id] = 'none';
              } else {
                techFieldPermissions.maintenance[feature.id][field.id] = 'full';
              }
            });
          }
        });
      }
      
      setFormData({
        ...formData,
        name: template.name,
        description: template.description,
        level: template.level,
        permissions: techPermissions,
        fieldPermissions: techFieldPermissions
      });
    } else if (template.permissions === 'custom') {
      setFormData({
        ...formData,
        name: '',
        description: '',
        level: 50
      });
    }
    
    setShowTemplateDialog(false);
  };

  const handlePermissionChange = (moduleId, featureId, value) => {
    const newPermissions = { ...formData.permissions };
    
    if (!newPermissions[moduleId]) {
      newPermissions[moduleId] = {};
    }
    
    newPermissions[moduleId][featureId] = value;
    
    // If unchecking, remove field permissions
    if (!value) {
      const newFieldPermissions = { ...formData.fieldPermissions };
      if (newFieldPermissions[moduleId] && newFieldPermissions[moduleId][featureId]) {
        delete newFieldPermissions[moduleId][featureId];
      }
      setFormData({ ...formData, permissions: newPermissions, fieldPermissions: newFieldPermissions });
    } else {
      setFormData({ ...formData, permissions: newPermissions });
    }
  };

  const handleFieldPermissionChange = (moduleId, featureId, fieldId, value) => {
    const newFieldPermissions = { ...formData.fieldPermissions };
    
    if (!newFieldPermissions[moduleId]) {
      newFieldPermissions[moduleId] = {};
    }
    if (!newFieldPermissions[moduleId][featureId]) {
      newFieldPermissions[moduleId][featureId] = {};
    }
    
    newFieldPermissions[moduleId][featureId][fieldId] = value;
    
    setFormData({ ...formData, fieldPermissions: newFieldPermissions });
  };

  const toggleModulePermissions = (moduleId, enabled) => {
    const newPermissions = { ...formData.permissions };
    const newFieldPermissions = { ...formData.fieldPermissions };
    
    const module = permissionModules.find(m => m.id === moduleId);
    
    if (enabled) {
      newPermissions[moduleId] = {};
      newFieldPermissions[moduleId] = {};
      
      module.features.forEach(feature => {
        newPermissions[moduleId][feature.id] = true;
        newFieldPermissions[moduleId][feature.id] = {};
        
        feature.fields.forEach(field => {
          newFieldPermissions[moduleId][feature.id][field.id] = 'full';
        });
      });
    } else {
      delete newPermissions[moduleId];
      delete newFieldPermissions[moduleId];
    }
    
    setFormData({ ...formData, permissions: newPermissions, fieldPermissions: newFieldPermissions });
  };

  const getPermissionStats = () => {
    let totalFeatures = 0;
    let enabledFeatures = 0;
    let totalFields = 0;
    let fullAccessFields = 0;
    let viewOnlyFields = 0;
    let noAccessFields = 0;
    
    permissionModules.forEach(module => {
      module.features.forEach(feature => {
        totalFeatures++;
        if (formData.permissions[module.id]?.[feature.id]) {
          enabledFeatures++;
        }
        
        feature.fields.forEach(field => {
          totalFields++;
          const fieldPermission = formData.fieldPermissions[module.id]?.[feature.id]?.[field.id];
          
          if (fieldPermission === 'full') {
            fullAccessFields++;
          } else if (fieldPermission === 'view') {
            viewOnlyFields++;
          } else {
            noAccessFields++;
          }
        });
      });
    });
    
    return {
      totalFeatures,
      enabledFeatures,
      featurePercentage: totalFeatures > 0 ? Math.round((enabledFeatures / totalFeatures) * 100) : 0,
      totalFields,
      fullAccessFields,
      viewOnlyFields,
      noAccessFields,
      fieldPercentage: totalFields > 0 ? Math.round((fullAccessFields / totalFields) * 100) : 0
    };
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.current.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Role name is required',
        life: 3000
      });
      return;
    }
    
    setSaving(true);
    try {
      if (id) {
        await axios.put(`${BaseURL}/roles/${id}`, formData);
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Role updated successfully',
          life: 3000
        });
      } else {
        await axios.post(`${BaseURL}/roles`, formData);
        toast.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Role created successfully',
          life: 3000
        });
      }
      
      setTimeout(() => router.push('/system-setup/roles'), 1500);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to save role',
        life: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  const stats = getPermissionStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      
      {/* Template Selection Dialog */}
      <Dialog
        visible={showTemplateDialog}
        onHide={() => setShowTemplateDialog(false)}
        header="Choose a Role Template"
        modal
        className="w-full max-w-4xl"
        closable={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTemplateSelect(template)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div className={`p-3 bg-${template.color}-100 rounded-lg w-fit mb-4`}>
                  <Icon className={`text-2xl text-${template.color}-600`} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Security Level</span>
                  <ProgressBar 
                    value={template.level} 
                    showValue={false}
                    style={{ height: '6px', width: '100px' }}
                    className="rounded-full"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </Dialog>

      {/* Test Permissions Dialog */}
      <Dialog
        visible={showTestDialog}
        onHide={() => setShowTestDialog(false)}
        header="Test Role Permissions"
        modal
        className="w-full max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a user to test permissions
            </label>
            <Dropdown
              value={testUser}
              options={[
                { label: 'John Doe (john@example.com)', value: 'john' },
                { label: 'Jane Smith (jane@example.com)', value: 'jane' },
                { label: 'Test User (test@example.com)', value: 'test' }
              ]}
              onChange={(e) => setTestUser(e.value)}
              placeholder="Choose a test user"
              className="w-full"
            />
          </div>
          
          {testUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <FaInfoCircle />
                Permission Preview
              </h4>
              <p className="text-sm text-blue-700">
                This user would have access to {stats.enabledFeatures} out of {stats.totalFeatures} features
                with {stats.fullAccessFields} fields having full access.
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <CanceButton onClick={() => setShowTestDialog(false)} />
            <Button
              label="Run Test"
              icon="pi pi-play"
              className="bg-blue-500 hover:bg-blue-600"
              disabled={!testUser}
            />
          </div>
        </div>
      </Dialog>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                icon="pi pi-arrow-left"
                className="p-button-text"
                onClick={() => router.push('/system-setup/roles')}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FaUserShield className="text-purple-500" />
                  {id ? 'Edit Role' : 'Create Role'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Configure institutional-grade permissions with field-level control
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                label="Test Permissions"
                icon="pi pi-play"
                className="p-button-outlined"
                onClick={() => setShowTestDialog(true)}
              />
              <Button
                label="Save Role"
                icon="pi pi-save"
                className="bg-purple-500 hover:bg-purple-600"
                onClick={handleSubmit}
                loading={saving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Configuration Progress</span>
          <span className="text-sm text-gray-600">{stats.featurePercentage}% Complete</span>
        </div>
        <ProgressBar value={stats.featurePercentage} showValue={false} style={{ height: '8px' }} />
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Regional Manager"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <InputTextarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the role's responsibilities..."
                    rows={3}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Level
                  </label>
                  <div className="flex items-center gap-3">
                    <InputText
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
                      type="number"
                      min="0"
                      max="100"
                      className="w-20"
                    />
                    <ProgressBar 
                      value={formData.level} 
                      showValue={false}
                      style={{ height: '8px' }}
                      className="flex-1 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Higher levels have more authority (0-100)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <RadioButton
                        inputId="active"
                        value="active"
                        onChange={(e) => setFormData({ ...formData, status: e.value })}
                        checked={formData.status === 'active'}
                      />
                      <label htmlFor="active" className="ml-2 text-sm">Active</label>
                    </div>
                    <div className="flex items-center">
                      <RadioButton
                        inputId="inactive"
                        value="inactive"
                        onChange={(e) => setFormData({ ...formData, status: e.value })}
                        checked={formData.status === 'inactive'}
                      />
                      <label htmlFor="inactive" className="ml-2 text-sm">Inactive</label>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    inputId="system"
                    checked={formData.isSystem}
                    onChange={(e) => setFormData({ ...formData, isSystem: e.checked })}
                  />
                  <label htmlFor="system" className="text-sm">
                    System Role (Protected)
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Permission Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaChartBar className="text-green-500" />
                Permission Statistics
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Features Enabled</span>
                    <span className="text-sm font-bold text-gray-800">
                      {stats.enabledFeatures} / {stats.totalFeatures}
                    </span>
                  </div>
                  <ProgressBar
                    value={stats.featurePercentage}
                    showValue={false}
                    style={{ height: '8px' }}
                    className="rounded-full"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Field Access</span>
                    <span className="text-sm font-bold text-gray-800">
                      {stats.fieldPercentage}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" />
                        Full Access
                      </span>
                      <span className="text-xs font-medium">{stats.fullAccessFields}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-2">
                        <FaEye className="text-blue-500" />
                        View Only
                      </span>
                      <span className="text-xs font-medium">{stats.viewOnlyFields}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-2">
                        <FaEyeSlash className="text-gray-500" />
                        No Access
                      </span>
                      <span className="text-xs font-medium">{stats.noAccessFields}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaRocket className="text-purple-500" />
                Quick Actions
              </h3>
              
              <div className="space-y-2">
                <Button
                  label="Grant All Permissions"
                  icon="pi pi-check-circle"
                  className="w-full p-button-success p-button-sm"
                  onClick={() => {
                    const template = roleTemplates.find(t => t.id === 'super_admin');
                    handleTemplateSelect(template);
                  }}
                />
                <Button
                  label="Set View Only"
                  icon="pi pi-eye"
                  className="w-full p-button-info p-button-sm"
                  onClick={() => {
                    const template = roleTemplates.find(t => t.id === 'viewer');
                    handleTemplateSelect(template);
                  }}
                />
                <Button
                  label="Clear All Permissions"
                  icon="pi pi-times-circle"
                  className="w-full p-button-danger p-button-sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      permissions: {},
                      fieldPermissions: {}
                    });
                  }}
                />
                <Button
                  label="Import from Role"
                  icon="pi pi-download"
                  className="w-full p-button-outlined p-button-sm"
                />
                <Button
                  label="Export Configuration"
                  icon="pi pi-upload"
                  className="w-full p-button-outlined p-button-sm"
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column - Permission Builder */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaKey className="text-orange-500" />
                  Permission Builder
                </h3>
                
                {/* Search and Filter */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="p-input-icon-left w-full">
                      <i className="pi pi-search" />
                      <InputText
                        value={searchPermission}
                        onChange={(e) => setSearchPermission(e.target.value)}
                        placeholder="Search permissions..."
                        className="w-full"
                      />
                    </div>
                  </div>
                  <Dropdown
                    value={permissionFilter}
                    options={[
                      { label: 'All Permissions', value: 'all' },
                      { label: 'Enabled Only', value: 'enabled' },
                      { label: 'Disabled Only', value: 'disabled' }
                    ]}
                    onChange={(e) => setPermissionFilter(e.value)}
                    className="w-48"
                  />
                </div>
              </div>

              <div className="p-6">
                <Accordion
                  multiple
                  activeIndex={expandedModules}
                  onTabChange={(e) => setExpandedModules(e.index)}
                >
                  {permissionModules.map((module) => {
                    const Icon = module.icon;
                    const moduleEnabled = !!formData.permissions[module.id];
                    const enabledFeatures = module.features.filter(
                      f => formData.permissions[module.id]?.[f.id]
                    ).length;
                    
                    return (
                      <AccordionTab
                        key={module.id}
                        header={
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-${module.color}-100`}>
                                <Icon className={`text-lg text-${module.color}-600`} />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800">{module.name}</h4>
                                <p className="text-xs text-gray-600">{module.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                value={`${enabledFeatures}/${module.features.length}`}
                                severity={enabledFeatures === module.features.length ? 'success' : 'warning'}
                              />
                              <Button
                                icon={moduleEnabled ? 'pi pi-check-square' : 'pi pi-square'}
                                className="p-button-text p-button-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModulePermissions(module.id, !moduleEnabled);
                                }}
                                tooltip={moduleEnabled ? 'Disable all' : 'Enable all'}
                              />
                            </div>
                          </div>
                        }
                      >
                        <div className="space-y-6">
                          {module.features.map((feature) => {
                            const featureEnabled = formData.permissions[module.id]?.[feature.id];
                            
                            return (
                              <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      inputId={`${module.id}-${feature.id}`}
                                      checked={featureEnabled || false}
                                      onChange={(e) => handlePermissionChange(module.id, feature.id, e.checked)}
                                    />
                                    <div>
                                      <label
                                        htmlFor={`${module.id}-${feature.id}`}
                                        className="font-medium text-gray-800 cursor-pointer"
                                      >
                                        {feature.name}
                                      </label>
                                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                                    </div>
                                  </div>
                                  {featureEnabled && (
                                    <Chip
                                      label="Enabled"
                                      className="bg-green-100 text-green-800"
                                      icon="pi pi-check"
                                    />
                                  )}
                                </div>
                                
                                {featureEnabled && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="ml-8 space-y-3"
                                  >
                                    <div className="text-sm font-medium text-gray-700 mb-2">
                                      Field-Level Permissions:
                                    </div>
                                    {feature.fields.map((field) => {
                                      const fieldPermission = formData.fieldPermissions[module.id]?.[feature.id]?.[field.id] || 'none';
                                      
                                      return (
                                        <div key={field.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                          <div className="flex items-center gap-2">
                                            {field.type === 'view' && <FaEye className="text-blue-500" />}
                                            {field.type === 'edit' && <FaEdit className="text-orange-500" />}
                                            {field.type === 'action' && <FaPlus className="text-green-500" />}
                                            <span className="text-sm font-medium text-gray-700">{field.name}</span>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              icon="pi pi-ban"
                                              className={`p-button-sm ${fieldPermission === 'none' ? 'p-button-danger' : 'p-button-text'}`}
                                              onClick={() => handleFieldPermissionChange(module.id, feature.id, field.id, 'none')}
                                              tooltip="No Access"
                                            />
                                            <Button
                                              icon="pi pi-eye"
                                              className={`p-button-sm ${fieldPermission === 'view' ? 'p-button-info' : 'p-button-text'}`}
                                              onClick={() => handleFieldPermissionChange(module.id, feature.id, field.id, 'view')}
                                              tooltip="View Only"
                                            />
                                            <Button
                                              icon="pi pi-pencil"
                                              className={`p-button-sm ${fieldPermission === 'full' ? 'p-button-success' : 'p-button-text'}`}
                                              onClick={() => handleFieldPermissionChange(module.id, feature.id, field.id, 'full')}
                                              tooltip="Full Access"
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionTab>
                    );
                  })}
                </Accordion>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white"
        onClick={() => toast.current.show({
          severity: 'info',
          summary: 'Pro Tip',
          detail: 'Use role templates to quickly set up common permission patterns, then customize as needed.',
          life: 5000
        })}
      >
        <FaLightbulb className="text-xl" />
      </motion.button>

      <Tooltip target=".p-button-sm" />
    </div>
  );
}