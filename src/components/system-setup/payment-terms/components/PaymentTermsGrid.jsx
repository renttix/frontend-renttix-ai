import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Copy,
  Check,
  X,
  Calendar,
  Code,
  FileText,
  Clock,
  DollarSign,
  Users,
  TrendingUp
} from "lucide-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Skeleton } from "primereact/skeleton";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tooltip } from "primereact/tooltip";

const PaymentTermsGrid = ({
  data,
  loading,
  viewMode,
  selectedItems,
  onSelectionChange,
  onUpdate,
  onDelete,
  searchQuery
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [filteredData, setFilteredData] = useState(data);
  const menuRefs = {};

  // Period type options
  const periodTypeOptions = [
    { label: "Days", value: "Days" },
    { label: "Months", value: "Months" },
    { label: "End of Month", value: "EOM" },
    { label: "Net", value: "Net" }
  ];

  // Filter data based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = data.filter(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [data, searchQuery]);

  // Handle inline editing
  const startEditing = (rowData) => {
    setEditingId(rowData._id);
    setEditingData({ ...rowData });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  const saveEditing = async () => {
    try {
      await onUpdate(editingId, editingData);
      setEditingId(null);
      setEditingData({});
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditingData(prev => ({ ...prev, [field]: value }));
  };

  // Confirm delete
  const confirmDelete = (rowData) => {
    confirmDialog({
      message: `Are you sure you want to delete "${rowData.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => onDelete([rowData._id])
    });
  };

  // Menu items for row actions
  const getMenuItems = (rowData) => [
    {
      label: 'Edit',
      icon: <Edit2 size={16} />,
      command: () => startEditing(rowData)
    },
    {
      label: 'Duplicate',
      icon: <Copy size={16} />,
      command: () => console.log('Duplicate', rowData)
    },
    {
      separator: true
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      className: 'menu-item-danger',
      command: () => confirmDelete(rowData)
    }
  ];

  // Column templates
  const selectionTemplate = (rowData) => (
    <Checkbox
      checked={selectedItems.includes(rowData._id)}
      onChange={(e) => {
        if (e.checked) {
          onSelectionChange([...selectedItems, rowData._id]);
        } else {
          onSelectionChange(selectedItems.filter(id => id !== rowData._id));
        }
      }}
    />
  );

  const nameTemplate = (rowData) => {
    if (editingId === rowData._id) {
      return (
        <InputText
          value={editingData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          className="elite-inline-input"
          autoFocus
        />
      );
    }
    
    return (
      <div className="elite-name-cell">
        <div className="elite-name-content">
          <span className="elite-name-text">{rowData.name}</span>
          <Tag 
            value={rowData.code} 
            severity="warning" 
            className="elite-code-tag"
          />
        </div>
      </div>
    );
  };

  const periodTemplate = (rowData) => {
    if (editingId === rowData._id) {
      return (
        <div className="elite-period-edit">
          <InputText
            value={editingData.days}
            onChange={(e) => handleFieldChange('days', e.target.value)}
            className="elite-inline-input elite-days-input"
            type="number"
          />
          <Dropdown
            value={editingData.periodType}
            options={periodTypeOptions}
            onChange={(e) => handleFieldChange('periodType', e.value)}
            className="elite-inline-dropdown"
          />
        </div>
      );
    }

    const getPeriodIcon = () => {
      switch (rowData.periodType) {
        case 'Days': return <Calendar size={16} />;
        case 'Months': return <Clock size={16} />;
        case 'EOM': return <DollarSign size={16} />;
        default: return <Calendar size={16} />;
      }
    };

    return (
      <div className="elite-period-cell">
        {getPeriodIcon()}
        <span>{rowData.days} {rowData.periodType}</span>
      </div>
    );
  };

  const descriptionTemplate = (rowData) => {
    if (editingId === rowData._id) {
      return (
        <InputText
          value={editingData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          className="elite-inline-input"
        />
      );
    }

    return (
      <>
        <Tooltip target={`.desc-${rowData._id}`} content={rowData.description} position="top" />
        <span className={`elite-description desc-${rowData._id}`}>
          {rowData.description || '-'}
        </span>
      </>
    );
  };

  const usageTemplate = (rowData) => {
    // Simulated usage data
    const usage = Math.floor(Math.random() * 100) + 20;
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    
    return (
      <div className="elite-usage-cell">
        <Users size={16} className="elite-usage-icon" />
        <span className="elite-usage-count">{usage}</span>
        {trend === 'up' ? (
          <TrendingUp size={14} className="elite-trend-up" />
        ) : (
          <TrendingUp size={14} className="elite-trend-down" style={{ transform: 'rotate(180deg)' }} />
        )}
      </div>
    );
  };

  const actionsTemplate = (rowData) => {
    if (editingId === rowData._id) {
      return (
        <div className="elite-edit-actions">
          <Button
            icon={<Check size={16} />}
            className="elite-save-btn"
            onClick={saveEditing}
            tooltip="Save changes"
          />
          <Button
            icon={<X size={16} />}
            className="elite-cancel-btn"
            onClick={cancelEditing}
            tooltip="Cancel"
          />
        </div>
      );
    }

    return (
      <div className="elite-row-actions">
        <Button
          icon={<Edit2 size={16} />}
          className="elite-action-btn"
          onClick={() => startEditing(rowData)}
          tooltip="Quick edit"
        />
        <Menu
          model={getMenuItems(rowData)}
          popup
          ref={el => menuRefs[rowData._id] = el}
          className="elite-row-menu"
        />
        <Button
          icon={<MoreVertical size={16} />}
          className="elite-action-btn"
          onClick={(e) => menuRefs[rowData._id]?.toggle(e)}
          tooltip="More actions"
        />
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="elite-grid-loading">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="elite-skeleton-row">
            <Skeleton width="30px" height="30px" />
            <Skeleton width="200px" height="20px" />
            <Skeleton width="150px" height="20px" />
            <Skeleton width="250px" height="20px" />
            <Skeleton width="100px" height="20px" />
            <Skeleton width="80px" height="20px" />
          </div>
        ))}
      </div>
    );
  }

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div className="elite-grid-view">
        <AnimatePresence>
          {filteredData.map((item, index) => (
            <motion.div
              key={item._id}
              className={`elite-term-card ${selectedItems.includes(item._id) ? 'selected' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className="elite-card-header">
                <Checkbox
                  checked={selectedItems.includes(item._id)}
                  onChange={(e) => {
                    if (e.checked) {
                      onSelectionChange([...selectedItems, item._id]);
                    } else {
                      onSelectionChange(selectedItems.filter(id => id !== item._id));
                    }
                  }}
                />
                <div className="elite-card-actions">
                  <Button
                    icon={<Edit2 size={16} />}
                    className="elite-card-action"
                    onClick={() => startEditing(item)}
                  />
                  <Button
                    icon={<Trash2 size={16} />}
                    className="elite-card-action elite-danger"
                    onClick={() => confirmDelete(item)}
                  />
                </div>
              </div>
              
              <div className="elite-card-body">
                <h3 className="elite-card-title">{item.name}</h3>
                <Tag value={item.code} severity="warning" className="elite-card-code" />
                
                <div className="elite-card-details">
                  <div className="elite-card-detail">
                    <Calendar size={16} />
                    <span>{item.days} {item.periodType}</span>
                  </div>
                  <div className="elite-card-detail">
                    <FileText size={16} />
                    <span>{item.description || 'No description'}</span>
                  </div>
                </div>
                
                <div className="elite-card-footer">
                  <div className="elite-card-usage">
                    <Users size={16} />
                    <span>{Math.floor(Math.random() * 100) + 20} customers</span>
                  </div>
                  <div className="elite-card-trend">
                    <TrendingUp size={16} />
                    <span>+12%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // List view (DataTable)
  return (
    <div className="elite-list-view">
      <ConfirmDialog />
      <DataTable
        value={filteredData}
        className="elite-datatable"
        rowHover
        stripedRows
        emptyMessage="No payment terms found"
        rowClassName={(data) => selectedItems.includes(data._id) ? 'elite-row-selected' : ''}
      >
        <Column 
          body={selectionTemplate} 
          headerStyle={{ width: '3rem' }}
          bodyStyle={{ textAlign: 'center' }}
        />
        <Column 
          field="name" 
          header="Name" 
          body={nameTemplate}
          sortable
        />
        <Column 
          header="Payment Period" 
          body={periodTemplate}
          sortable
          sortField="days"
        />
        <Column 
          field="description" 
          header="Description" 
          body={descriptionTemplate}
        />
        <Column 
          header="Usage" 
          body={usageTemplate}
          bodyStyle={{ width: '120px' }}
        />
        <Column 
          header="Actions" 
          body={actionsTemplate}
          bodyStyle={{ width: '120px', textAlign: 'center' }}
        />
      </DataTable>
    </div>
  );
};

export default PaymentTermsGrid;