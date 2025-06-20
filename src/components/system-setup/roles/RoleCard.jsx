"use client";

import React from 'react';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Chip } from 'primereact/chip';
import { ProgressBar } from 'primereact/progressbar';
import { motion } from 'framer-motion';
import { 
  FaUserShield, FaUsers, FaEdit, FaTrash, FaCopy,
  FaEye, FaToggleOn, FaToggleOff, FaShieldAlt,
  FaKey, FaCheckCircle, FaClock, FaExclamationTriangle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Role templates for icon and color mapping
const roleTemplates = {
  super_admin: { icon: FaUserShield, color: 'red' },
  admin: { icon: FaShieldAlt, color: 'orange' },
  manager: { icon: FaUsers, color: 'blue' },
  operator: { icon: FaKey, color: 'green' },
  viewer: { icon: FaEye, color: 'gray' },
  custom: { icon: FaKey, color: 'purple' }
};

export default function RoleCard({ role, onEdit, onDelete, onToggleStatus, onViewPermissions, onDuplicate }) {
  const template = roleTemplates[role.templateId] || roleTemplates.custom;
  const Icon = template.icon;
  
  // Calculate permission statistics
  const calculatePermissionStats = () => {
    let totalFeatures = 0;
    let enabledFeatures = 0;
    
    if (role.permissions) {
      Object.values(role.permissions).forEach(module => {
        if (typeof module === 'object') {
          Object.values(module).forEach(feature => {
            totalFeatures++;
            if (feature) enabledFeatures++;
          });
        }
      });
    }
    
    return {
      total: totalFeatures,
      enabled: enabledFeatures,
      percentage: totalFeatures > 0 ? Math.round((enabledFeatures / totalFeatures) * 100) : 0
    };
  };
  
  const stats = calculatePermissionStats();
  const userCount = role.userCount || 0;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Card Header */}
      <div className={`bg-gradient-to-r from-${template.color}-500 to-${template.color}-600 p-4`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
              <Icon className="text-2xl text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{role.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  value={role.status === 'active' ? 'Active' : 'Inactive'} 
                  severity={role.status === 'active' ? 'success' : 'warning'}
                  className="text-xs"
                />
                {role.isSystem && (
                  <Badge value="System" severity="info" className="text-xs" />
                )}
              </div>
            </div>
          </div>
          <Button
            icon={role.status === 'active' ? 'pi pi-toggle-on' : 'pi pi-toggle-off'}
            className="p-button-rounded p-button-text p-button-sm text-white hover:bg-white/20"
            onClick={() => onToggleStatus(role._id)}
            tooltip={role.status === 'active' ? 'Deactivate' : 'Activate'}
          />
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-4 space-y-4">
        {/* Description */}
        {role.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{role.description}</p>
        )}
        
        {/* Security Level */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Security Level</span>
            <span className="text-xs font-bold text-gray-800">{role.level}/100</span>
          </div>
          <ProgressBar 
            value={role.level} 
            showValue={false}
            style={{ height: '6px' }}
            className="rounded-full"
          />
        </div>
        
        {/* Permission Stats */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Permissions</span>
            <span className="text-xs font-bold text-gray-800">{stats.percentage}%</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <FaCheckCircle className="text-green-500" />
              <span className="text-gray-600">Enabled: {stats.enabled}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaExclamationTriangle className="text-yellow-500" />
              <span className="text-gray-600">Total: {stats.total}</span>
            </div>
          </div>
        </div>
        
        {/* User Count */}
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <FaUsers className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Assigned Users</span>
          </div>
          <Badge value={userCount} severity="info" />
        </div>
        
        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FaClock />
          <span>Modified {new Date(role.updatedAt || role.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Button
            label="Permissions"
            icon="pi pi-key"
            className="p-button-sm p-button-outlined flex-1"
            onClick={() => onViewPermissions(role)}
          />
          <Link to={`/system-setup/roles/edit/${role._id}`} className="flex-1">
            <Button
              label="Edit"
              icon="pi pi-pencil"
              className="p-button-sm p-button-outlined w-full"
            />
          </Link>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            icon="pi pi-copy"
            className="p-button-sm p-button-text flex-1"
            onClick={() => onDuplicate(role._id)}
            tooltip="Duplicate Role"
          />
          <Button
            icon="pi pi-trash"
            className="p-button-sm p-button-text p-button-danger flex-1"
            onClick={() => onDelete(role._id)}
            disabled={role.isSystem}
            tooltip={role.isSystem ? "System roles cannot be deleted" : "Delete Role"}
          />
        </div>
      </div>
    </motion.div>
  );
}