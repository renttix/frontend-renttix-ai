import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import BaseWidget from '../BaseWidget';
import { useRouter } from 'next/navigation';
import { formatDate } from '../../../utils/formatters';
import { BaseURL } from '../../../../utils/baseUrl';
import { useSelector } from 'react-redux';

const DraftOrdersWidget = ({ widgetId, config = {} }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const toast = useRef(null);
  const { token } = useSelector((state) => state?.authReducer);

  // Fetch draft orders
  useEffect(() => {
    fetchDraftOrders();
    
    // Set up refresh interval if configured
    const refreshInterval = config.refreshInterval || 300000; // 5 minutes default
    const interval = setInterval(fetchDraftOrders, refreshInterval);
    
    return () => clearInterval(interval);
  }, [config]);

  const fetchDraftOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params based on config
      const params = new URLSearchParams();
      params.append('limit', config.limit || 20);
      params.append('status', 'draft');
      if (config.userId) params.append('userId', config.userId);
      if (config.depotId) params.append('depotId', config.depotId);
      if (config.maxAge) params.append('maxAge', config.maxAge);
      
      const response = await fetch(`${BaseURL}/widget-data/draft-orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch draft orders');
      
      const data = await response.json();
      setDrafts(data.drafts || []);
    } catch (err) {
      setError(err.message);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load draft orders',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Order number template
  const orderNumberBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <span className="font-semibold">{rowData.orderNumber || 'DRAFT-' + rowData._id.slice(-6)}</span>
        {rowData.isOld && (
          <Tag value="Old" severity="warning" className="text-xs" />
        )}
      </div>
    );
  };

  // Customer template
  const customerBodyTemplate = (rowData) => {
    return (
      <div className="flex flex-column">
        <span className="font-semibold">{rowData.customerName || 'No customer selected'}</span>
        {rowData.companyName && (
          <span className="text-sm text-500">{rowData.companyName}</span>
        )}
      </div>
    );
  };

  // Date template with age indicator
  const dateBodyTemplate = (rowData, field) => {
    const date = rowData[field.field];
    const daysSince = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="flex flex-column">
        <span>{formatDate(date)}</span>
        {field.field === 'createdAt' && daysSince > 0 && (
          <span className="text-sm text-500">
            {daysSince === 1 ? '1 day ago' : `${daysSince} days ago`}
          </span>
        )}
      </div>
    );
  };

  // Created by template
  const createdByBodyTemplate = (rowData) => {
    return (
      <div className="flex flex-column">
        <span>{rowData.createdByName}</span>
        <span className="text-sm text-500">{rowData.createdByRole}</span>
      </div>
    );
  };

  // Actions template
  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-button-sm"
          onClick={() => router.push(`/orders/edit/${rowData._id}`)}
          tooltip="Edit Draft"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-send"
          className="p-button-text p-button-sm p-button-success"
          onClick={() => handleSubmitDraft(rowData)}
          tooltip="Submit Order"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-sm p-button-danger"
          onClick={() => handleDeleteDraft(rowData)}
          tooltip="Delete Draft"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  const handleSubmitDraft = async (draft) => {
    confirmDialog({
      message: `Are you sure you want to submit order ${draft.orderNumber || 'DRAFT-' + draft._id.slice(-6)}?`,
      header: 'Confirm Submit',
      icon: 'pi pi-send',
      accept: async () => {
        try {
          const response = await fetch(`/api/orders/${draft._id}/submit`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) throw new Error('Failed to submit order');
          
          const data = await response.json();
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: `Order ${data.orderNumber} submitted successfully`,
            life: 3000
          });
          
          // Refresh the list
          fetchDraftOrders();
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to submit order',
            life: 3000
          });
        }
      }
    });
  };

  const handleDeleteDraft = async (draft) => {
    confirmDialog({
      message: `Are you sure you want to delete this draft order?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          const response = await fetch(`/api/orders/${draft._id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) throw new Error('Failed to delete draft');
          
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Draft order deleted',
            life: 3000
          });
          
          // Refresh the list
          fetchDraftOrders();
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete draft',
            life: 3000
          });
        }
      }
    });
  };

  // Loading skeleton
  const loadingTemplate = () => {
    return <Skeleton />;
  };

  // Empty state
  const emptyMessage = () => {
    return (
      <div className="flex flex-column align-items-center justify-content-center p-4">
        <i className="pi pi-file text-4xl text-300 mb-3" />
        <span className="text-500">No draft orders found</span>
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <>
      <Button
        icon="pi pi-plus"
        className="p-button-text p-button-sm p-button-rounded"
        onClick={() => router.push('/orders/new')}
        tooltip="New Order"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-refresh"
        className="p-button-text p-button-sm p-button-rounded"
        onClick={fetchDraftOrders}
        tooltip="Refresh"
        tooltipOptions={{ position: 'top' }}
        disabled={loading}
      />
    </>
  );

  // Calculate row class for old drafts
  const rowClassName = (data) => {
    const daysSince = Math.floor((new Date() - new Date(data.createdAt)) / (1000 * 60 * 60 * 24));
    if (daysSince > 30) return 'surface-100';
    if (daysSince > 14) return 'surface-50';
    return '';
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <BaseWidget
        widgetId={widgetId}
        title="Draft Orders"
        icon="file-edit"
        headerActions={headerActions}
        loading={loading && drafts.length === 0}
        error={error}
        minWidth={8}
        maxWidth={12}
      >
        <div className="draft-orders-widget">
          <DataTable
            value={drafts}
            paginator={drafts.length > 10}
            rows={10}
            rowsPerPageOptions={[10, 20, 50]}
            emptyMessage={emptyMessage}
            className="p-datatable-sm"
            stripedRows
            showGridlines={false}
            responsiveLayout="scroll"
            rowClassName={rowClassName}
          >
            <Column
              field="orderNumber"
              header="Order #"
              body={loading ? loadingTemplate : orderNumberBodyTemplate}
              style={{ width: '15%' }}
            />
            <Column
              field="customerName"
              header="Customer"
              body={loading ? loadingTemplate : customerBodyTemplate}
              style={{ width: '25%' }}
            />
            <Column
              field="createdAt"
              header="Created"
              body={loading ? loadingTemplate : dateBodyTemplate}
              style={{ width: '15%' }}
              sortable
            />
            <Column
              field="updatedAt"
              header="Last Modified"
              body={loading ? loadingTemplate : dateBodyTemplate}
              style={{ width: '15%' }}
              sortable
            />
            <Column
              field="createdBy"
              header="Created By"
              body={loading ? loadingTemplate : createdByBodyTemplate}
              style={{ width: '15%' }}
            />
            <Column
              body={loading ? loadingTemplate : actionsBodyTemplate}
              style={{ width: '15%' }}
              alignHeader="center"
              bodyStyle={{ textAlign: 'center' }}
            />
          </DataTable>
        </div>
      </BaseWidget>
    </>
  );
};

export default DraftOrdersWidget;