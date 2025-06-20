import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import BaseWidget from '../BaseWidget';
import { formatDate, getDaysUntil } from '../../../utils/formatters';

const AssetsMaintenanceWidget = ({ widgetId, config = {} }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useRef(null);

  // Fetch assets in maintenance
  useEffect(() => {
    fetchAssetsInMaintenance();
    
    // Set up refresh interval if configured
    const refreshInterval = config.refreshInterval || 300000; // 5 minutes default
    const interval = setInterval(fetchAssetsInMaintenance, refreshInterval);
    
    return () => clearInterval(interval);
  }, [config]);

  const fetchAssetsInMaintenance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params based on config
      const params = new URLSearchParams();
      params.append('status', 'maintenance');
      if (config.depotId) params.append('depotId', config.depotId);
      if (config.includeScheduled) params.append('includeScheduled', 'true');
      
      const response = await fetch(`/api/assets/maintenance?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch maintenance assets');
      
      const data = await response.json();
      setAssets(data.assets || []);
    } catch (err) {
      setError(err.message);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load maintenance assets',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Asset name template with image
  const assetNameTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-3">
        {rowData.imageUrl ? (
          <img 
            src={rowData.imageUrl} 
            alt={rowData.name}
            style={{ 
              width: '40px', 
              height: '40px', 
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
        ) : (
          <div 
            className="flex align-items-center justify-content-center"
            style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#F3F4F6',
              borderRadius: '4px'
            }}
          >
            <i className="pi pi-box text-xl text-400" />
          </div>
        )}
        <div className="flex flex-column">
          <span className="font-semibold">{rowData.name}</span>
          <span className="text-sm text-500">{rowData.assetNumber}</span>
        </div>
      </div>
    );
  };

  // Maintenance type template
  const maintenanceTypeTemplate = (rowData) => {
    const getTypeConfig = (type) => {
      switch (type?.toLowerCase()) {
        case 'repair':
          return { icon: 'pi-wrench', color: '#EF4444', label: 'Repair' };
        case 'service':
          return { icon: 'pi-cog', color: '#3B82F6', label: 'Service' };
        case 'inspection':
          return { icon: 'pi-search', color: '#F59E0B', label: 'Inspection' };
        case 'cleaning':
          return { icon: 'pi-sparkles', color: '#10B981', label: 'Cleaning' };
        case 'upgrade':
          return { icon: 'pi-arrow-up', color: '#8B5CF6', label: 'Upgrade' };
        default:
          return { icon: 'pi-info-circle', color: '#6B7280', label: type };
      }
    };

    const config = getTypeConfig(rowData.maintenanceType);
    
    return (
      <div className="flex align-items-center gap-2">
        <i 
          className={`pi ${config.icon}`} 
          style={{ color: config.color }}
        />
        <span style={{ fontWeight: '500' }}>
          {config.label}
        </span>
      </div>
    );
  };

  // Priority template
  const priorityTemplate = (rowData) => {
    const getPrioritySeverity = (priority) => {
      switch (priority?.toLowerCase()) {
        case 'critical':
          return 'danger';
        case 'high':
          return 'warning';
        case 'medium':
          return 'info';
        case 'low':
          return 'success';
        default:
          return null;
      }
    };

    const getPriorityIcon = (priority) => {
      switch (priority?.toLowerCase()) {
        case 'critical':
          return 'pi-exclamation-circle';
        case 'high':
          return 'pi-exclamation-triangle';
        case 'medium':
          return 'pi-info-circle';
        case 'low':
          return 'pi-check-circle';
        default:
          return 'pi-circle';
      }
    };

    return (
      <Tag 
        value={rowData.priority} 
        severity={getPrioritySeverity(rowData.priority)}
        icon={getPriorityIcon(rowData.priority)}
        style={{ textTransform: 'capitalize' }}
      />
    );
  };

  // Expected return date template
  const returnDateTemplate = (rowData) => {
    const daysUntil = getDaysUntil(rowData.expectedReturnDate);
    const isOverdue = daysUntil < 0;
    
    return (
      <div className="flex flex-column">
        <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
          {formatDate(rowData.expectedReturnDate)}
        </span>
        <span className={`text-sm ${isOverdue ? 'text-red-500' : 'text-500'}`}>
          {isOverdue ? (
            `${Math.abs(daysUntil)} days overdue`
          ) : daysUntil === 0 ? (
            'Due today'
          ) : (
            `In ${daysUntil} days`
          )}
        </span>
      </div>
    );
  };

  // Progress template
  const progressTemplate = (rowData) => {
    const progress = rowData.maintenanceProgress || 0;
    const getProgressColor = () => {
      if (progress < 30) return '#EF4444';
      if (progress < 70) return '#F59E0B';
      return '#10B981';
    };

    return (
      <div className="flex flex-column gap-1" style={{ width: '100px' }}>
        <ProgressBar 
          value={progress} 
          showValue={false}
          style={{ height: '6px' }}
          color={getProgressColor()}
        />
        <span className="text-sm text-500 text-center">{progress}%</span>
      </div>
    );
  };

  // Actions template
  const actionsTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-text p-button-sm"
          onClick={() => handleViewDetails(rowData)}
          tooltip="View Maintenance Details"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-comments"
          className="p-button-text p-button-sm"
          onClick={() => handleAddNote(rowData)}
          tooltip="Add Note"
          tooltipOptions={{ position: 'top' }}
          badge={rowData.notesCount > 0 ? rowData.notesCount.toString() : null}
          badgeClassName="p-badge-info"
        />
        {rowData.priority === 'critical' && (
          <Button
            icon="pi pi-phone"
            className="p-button-text p-button-sm p-button-warning"
            onClick={() => handleContactVendor(rowData)}
            tooltip="Contact Vendor"
            tooltipOptions={{ position: 'top' }}
          />
        )}
      </div>
    );
  };

  // Action handlers
  const handleViewDetails = (asset) => {
    window.open(`/maintenance/${asset.maintenanceId}`, '_blank');
  };

  const handleAddNote = async (asset) => {
    // This would typically open a dialog to add a note
    // For now, we'll just show a toast
    toast.current?.show({
      severity: 'info',
      summary: 'Add Note',
      detail: 'Note dialog would open here',
      life: 3000
    });
  };

  const handleContactVendor = (asset) => {
    if (asset.vendor?.phone) {
      window.open(`tel:${asset.vendor.phone}`, '_blank');
    } else {
      toast.current?.show({
        severity: 'warn',
        summary: 'No Contact',
        detail: 'No vendor contact information available',
        life: 3000
      });
    }
  };

  // Loading skeleton
  const loadingTemplate = () => {
    return <Skeleton />;
  };

  // Empty state
  const emptyMessage = () => {
    return (
      <div className="flex flex-column align-items-center justify-content-center p-5">
        <i className="pi pi-check-circle text-5xl text-green-500 mb-3" />
        <span className="text-xl text-500 mb-2">All assets operational</span>
        <span className="text-sm text-400">No assets currently in maintenance</span>
      </div>
    );
  };

  // Summary statistics
  const renderSummary = () => {
    if (loading || !assets.length) return null;

    const criticalCount = assets.filter(a => a.priority === 'critical').length;
    const overdueCount = assets.filter(a => getDaysUntil(a.expectedReturnDate) < 0).length;
    const todayCount = assets.filter(a => getDaysUntil(a.expectedReturnDate) === 0).length;

    return (
      <div className="flex justify-content-around p-3 mb-3 surface-ground border-round">
        <div className="text-center">
          <div className="text-2xl font-semibold">{assets.length}</div>
          <div className="text-sm text-500">Total in Maintenance</div>
        </div>
        {criticalCount > 0 && (
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-500">{criticalCount}</div>
            <div className="text-sm text-500">Critical Priority</div>
          </div>
        )}
        {overdueCount > 0 && (
          <div className="text-center">
            <div className="text-2xl font-semibold text-orange-500">{overdueCount}</div>
            <div className="text-sm text-500">Overdue</div>
          </div>
        )}
        {todayCount > 0 && (
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-500">{todayCount}</div>
            <div className="text-sm text-500">Due Today</div>
          </div>
        )}
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <div className="flex align-items-center gap-2">
      <Button
        icon="pi pi-plus"
        className="p-button-text p-button-sm p-button-rounded"
        onClick={() => window.open('/maintenance/new', '_blank')}
        tooltip="Schedule Maintenance"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-refresh"
        className="p-button-text p-button-sm p-button-rounded"
        onClick={fetchAssetsInMaintenance}
        tooltip="Refresh"
        tooltipOptions={{ position: 'top' }}
        disabled={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <BaseWidget
        widgetId={widgetId}
        title="Assets in Maintenance"
        icon="wrench"
        headerActions={headerActions}
        loading={loading && assets.length === 0}
        error={error}
        minWidth={6}
        maxWidth={12}
      >
        <div className="assets-maintenance-widget">
          {renderSummary()}
          
          <DataTable
            value={assets}
            paginator={assets.length > 10}
            rows={10}
            rowsPerPageOptions={[10, 20, 30]}
            emptyMessage={emptyMessage}
            className="p-datatable-sm"
            stripedRows
            showGridlines={false}
            responsiveLayout="scroll"
            sortField="priority"
            sortOrder={-1}
            rowClassName={(rowData) => {
              if (rowData.priority === 'critical') return 'critical-row';
              if (getDaysUntil(rowData.expectedReturnDate) < 0) return 'overdue-row';
              return '';
            }}
          >
            <Column
              field="name"
              header="Asset"
              body={loading ? loadingTemplate : assetNameTemplate}
              style={{ width: '25%' }}
              sortable
            />
            <Column
              field="maintenanceType"
              header="Type"
              body={loading ? loadingTemplate : maintenanceTypeTemplate}
              style={{ width: '15%' }}
              sortable
            />
            <Column
              field="priority"
              header="Priority"
              body={loading ? loadingTemplate : priorityTemplate}
              style={{ width: '12%' }}
              sortable
            />
            <Column
              field="expectedReturnDate"
              header="Expected Return"
              body={loading ? loadingTemplate : returnDateTemplate}
              style={{ width: '18%' }}
              sortable
            />
            <Column
              field="maintenanceProgress"
              header="Progress"
              body={loading ? loadingTemplate : progressTemplate}
              style={{ width: '15%' }}
              sortable
            />
            <Column
              body={loading ? loadingTemplate : actionsTemplate}
              style={{ width: '15%' }}
              alignHeader="center"
              bodyStyle={{ textAlign: 'center' }}
            />
          </DataTable>
        </div>
        
        <style jsx>{`
          .assets-maintenance-widget :global(.critical-row) {
            background-color: rgba(239, 68, 68, 0.05) !important;
          }
          
          .assets-maintenance-widget :global(.overdue-row) {
            background-color: rgba(245, 158, 11, 0.05) !important;
          }
        `}</style>
      </BaseWidget>
    </>
  );
};

export default AssetsMaintenanceWidget;