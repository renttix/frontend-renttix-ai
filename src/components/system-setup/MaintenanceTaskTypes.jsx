import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { ColorPicker } from 'primereact/colorpicker';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Wrench, Clock, Plus, Edit2, Trash2, Save } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './MaintenanceTaskTypes.css';

const MaintenanceTaskTypes = () => {
  const [taskTypes, setTaskTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTaskType, setEditingTaskType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    defaultDuration: 30,
    category: 'service',
    color: '#3B82F6',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const toast = useRef(null);
  
  // Memoized selector to prevent unnecessary re-renders
  const token = useSelector((state) => state.auth?.token);

  const categories = [
    { label: 'Service', value: 'service' },
    { label: 'Delivery', value: 'delivery' },
    { label: 'Collection', value: 'collection' },
    { label: 'Inspection', value: 'inspection' },
    { label: 'Repair', value: 'repair' },
    { label: 'Other', value: 'other' }
  ];

  useEffect(() => {
    fetchTaskTypes();
  }, []);

  const fetchTaskTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/task-types', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskTypes(response.data);
    } catch (error) {
      console.error('Error fetching task types:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load task types'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Task type name is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Task type code is required';
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only uppercase letters, numbers, and underscores';
    }
    
    if (!formData.defaultDuration || formData.defaultDuration < 1) {
      newErrors.defaultDuration = 'Duration must be at least 1 minute';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const url = editingTaskType
        ? `/api/task-types/${editingTaskType._id}`
        : '/api/task-types';
      
      const method = editingTaskType ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Task type ${editingTaskType ? 'updated' : 'created'} successfully`
      });

      setShowDialog(false);
      resetForm();
      fetchTaskTypes();
    } catch (error) {
      console.error('Error saving task type:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Failed to save task type'
      });
    }
  };

  const handleEdit = (taskType) => {
    setEditingTaskType(taskType);
    setFormData({
      name: taskType.name,
      code: taskType.code,
      description: taskType.description || '',
      defaultDuration: taskType.defaultDuration,
      category: taskType.category,
      color: taskType.color,
      isActive: taskType.isActive
    });
    setShowDialog(true);
  };

  const handleDelete = (taskType) => {
    confirmDialog({
      message: `Are you sure you want to delete "${taskType.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await axios.delete(`/api/task-types/${taskType._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Task type deleted successfully'
          });
          
          fetchTaskTypes();
        } catch (error) {
          console.error('Error deleting task type:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to delete task type'
          });
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      defaultDuration: 30,
      category: 'service',
      color: '#3B82F6',
      isActive: true
    });
    setEditingTaskType(null);
    setErrors({});
  };

  const openNewDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  // Column templates
  const nameTemplate = (rowData) => (
    <div className="flex items-center gap-2">
      <div 
        className="w-3 h-3 rounded-full" 
        style={{ backgroundColor: rowData.color }}
      />
      <span className="font-medium">{rowData.name}</span>
    </div>
  );

  const codeTemplate = (rowData) => (
    <Tag value={rowData.code} severity="info" />
  );

  const categoryTemplate = (rowData) => {
    const category = categories.find(c => c.value === rowData.category);
    return <span>{category?.label || rowData.category}</span>;
  };

  const durationTemplate = (rowData) => (
    <div className="flex items-center gap-1">
      <Clock className="w-4 h-4 text-gray-500" />
      <span>{rowData.defaultDuration} min</span>
    </div>
  );

  const statusTemplate = (rowData) => (
    <Tag 
      value={rowData.isActive ? 'Active' : 'Inactive'} 
      severity={rowData.isActive ? 'success' : 'warning'}
    />
  );

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon={<Edit2 className="w-4 h-4" />}
        className="p-button-text p-button-sm"
        onClick={() => handleEdit(rowData)}
        tooltip="Edit"
      />
      <Button
        icon={<Trash2 className="w-4 h-4" />}
        className="p-button-text p-button-danger p-button-sm"
        onClick={() => handleDelete(rowData)}
        tooltip="Delete"
      />
    </div>
  );

  const dialogFooter = (
    <div className="flex justify-end gap-2">
      <Button 
        label="Cancel" 
        className="p-button-text" 
        onClick={() => setShowDialog(false)}
      />
      <Button 
        label={editingTaskType ? 'Update' : 'Create'} 
        icon={<Save className="w-4 h-4 mr-2" />}
        onClick={handleSubmit}
      />
    </div>
  );

  return (
    <div className="maintenance-task-types">
      <Toast ref={toast} />
      
      <Card title="Maintenance Task Types">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Task Type Configuration
              </h3>
              <p className="text-gray-600 mt-1">
                Define task types and their default durations for maintenance operations
              </p>
            </div>
            <Button
              label="New Task Type"
              icon={<Plus className="w-4 h-4 mr-2" />}
              onClick={openNewDialog}
            />
          </div>
        </div>

        <DataTable
          value={taskTypes || []}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage="No task types found"
          className="p-datatable-sm"
        >
          <Column 
            field="name" 
            header="Name" 
            body={nameTemplate}
            sortable
          />
          <Column 
            field="code" 
            header="Code" 
            body={codeTemplate}
            sortable
          />
          <Column 
            field="category" 
            header="Category" 
            body={categoryTemplate}
            sortable
          />
          <Column 
            field="defaultDuration" 
            header="Default Duration" 
            body={durationTemplate}
            sortable
          />
          <Column 
            field="description" 
            header="Description"
            style={{ maxWidth: '300px' }}
          />
          <Column 
            field="isActive" 
            header="Status" 
            body={statusTemplate}
            sortable
          />
          <Column 
            header="Actions" 
            body={actionsTemplate}
            style={{ width: '120px' }}
          />
        </DataTable>
      </Card>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={editingTaskType ? 'Edit Task Type' : 'New Task Type'}
        style={{ width: '500px' }}
        footer={dialogFooter}
      >
        <div className="task-type-form">
          <div className="field">
            <label htmlFor="name">
              Task Type Name <span className="text-red-500">*</span>
            </label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'p-invalid' : ''}
              placeholder="e.g., Standard Service"
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>

          <div className="field">
            <label htmlFor="code">
              Code <span className="text-red-500">*</span>
            </label>
            <InputText
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className={errors.code ? 'p-invalid' : ''}
              placeholder="e.g., STD_SERVICE"
              disabled={editingTaskType}
            />
            {errors.code && <small className="p-error">{errors.code}</small>}
            {!editingTaskType && (
              <small className="text-gray-500">
                Use uppercase letters, numbers, and underscores only
              </small>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </label>
              <Dropdown
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.value })}
                options={categories}
                className={errors.category ? 'p-invalid' : ''}
                placeholder="Select category"
              />
              {errors.category && <small className="p-error">{errors.category}</small>}
            </div>

            <div className="field">
              <label htmlFor="defaultDuration">
                Default Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <InputNumber
                id="defaultDuration"
                value={formData.defaultDuration}
                onValueChange={(e) => setFormData({ ...formData, defaultDuration: e.value })}
                className={errors.defaultDuration ? 'p-invalid' : ''}
                min={1}
                max={480}
                suffix=" min"
              />
              {errors.defaultDuration && <small className="p-error">{errors.defaultDuration}</small>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="color">Color</label>
            <div className="flex items-center gap-2">
              <ColorPicker
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: '#' + e.value })}
              />
              <InputText
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <InputTextarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of this task type..."
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default MaintenanceTaskTypes;