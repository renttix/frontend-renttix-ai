import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import BaseWidget from '../BaseWidget';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { lastOrdersService, handleApiError } from '../../../services/widgetServices';

const LastOrdersWidget = ({ widgetId, config = {} }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const toast = useRef(null);

  // Fetch last orders
  useEffect(() => {
    fetchLastOrders();
    
    // Set up refresh interval if configured
    const refreshInterval = config.refreshInterval || 300000; // 5 minutes default
    const interval = setInterval(fetchLastOrders, refreshInterval);
    
    return () => clearInterval(interval);
  }, [config]);

  const fetchLastOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params based on config
      const params = {
        limit: config.limit || 10,
        ...(config.userId && { userId: config.userId }),
        ...(config.depotId && { depotId: config.depotId })
      };
      
      const data = await lastOrdersService.fetchRecentOrders(params);
      setOrders(data.orders || data || []);
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to load recent orders');
      setError(errorMessage);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Status tag template
  const statusBodyTemplate = (rowData) => {
    const getSeverity = (status) => {
      switch (status?.toLowerCase()) {
        case 'completed':
          return 'success';
        case 'active':
        case 'in_progress':
          return 'info';
        case 'pending':
          return 'warning';
        case 'cancelled':
        case 'failed':
          return 'danger';
        default:
          return null;
      }
    };

    return (
      <Tag 
        value={rowData.status} 
        severity={getSeverity(rowData.status)}
        style={{ textTransform: 'capitalize' }}
      />
    );
  };

  // Customer name template
  const customerBodyTemplate = (rowData) => {
    return (
      <div className="flex flex-column">
        <span className="font-semibold">{rowData.customerName}</span>
        {rowData.companyName && (
          <span className="text-sm text-500">{rowData.companyName}</span>
        )}
      </div>
    );
  };

  // Date template
  const dateBodyTemplate = (rowData) => {
    return formatDate(rowData.createdAt);
  };

  // Total value template
  const totalBodyTemplate = (rowData) => {
    return formatCurrency(rowData.totalValue);
  };

  // Actions template
  const actionsBodyTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-eye"
        className="p-button-text p-button-sm"
        onClick={() => router.push(`/orders/${rowData._id}`)}
        tooltip="View Order Details"
        tooltipOptions={{ position: 'top' }}
      />
    );
  };

  // Loading skeleton
  const loadingTemplate = () => {
    return <Skeleton />;
  };

  // Empty state
  const emptyMessage = () => {
    return (
      <div className="flex flex-column align-items-center justify-content-center p-4">
        <i className="pi pi-inbox text-4xl text-300 mb-3" />
        <span className="text-500">No recent orders found</span>
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <Button
      icon="pi pi-refresh"
      className="p-button-text p-button-sm p-button-rounded"
      onClick={fetchLastOrders}
      tooltip="Refresh"
      tooltipOptions={{ position: 'top' }}
      disabled={loading}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <BaseWidget
        widgetId={widgetId}
        title="Last Orders"
        icon="shopping-cart"
        headerActions={headerActions}
        loading={loading && orders.length === 0}
        error={error}
        minWidth={6}
        maxWidth={12}
      >
        <div className="last-orders-widget">
          <DataTable
            value={orders}
            paginator={orders.length > 5}
            rows={5}
            rowsPerPageOptions={[5, 10]}
            emptyMessage={emptyMessage}
            className="p-datatable-sm"
            stripedRows
            showGridlines={false}
            responsiveLayout="scroll"
          >
            <Column
              field="orderNumber"
              header="Order #"
              style={{ width: '15%' }}
              body={loading ? loadingTemplate : null}
            />
            <Column
              field="customerName"
              header="Customer"
              body={loading ? loadingTemplate : customerBodyTemplate}
              style={{ width: '30%' }}
            />
            <Column
              field="createdAt"
              header="Date Created"
              body={loading ? loadingTemplate : dateBodyTemplate}
              style={{ width: '20%' }}
            />
            <Column
              field="status"
              header="Status"
              body={loading ? loadingTemplate : statusBodyTemplate}
              style={{ width: '15%' }}
            />
            <Column
              field="totalValue"
              header="Total"
              body={loading ? loadingTemplate : totalBodyTemplate}
              style={{ width: '15%' }}
              alignHeader="right"
              bodyStyle={{ textAlign: 'right' }}
            />
            <Column
              body={loading ? loadingTemplate : actionsBodyTemplate}
              style={{ width: '5%' }}
              alignHeader="center"
              bodyStyle={{ textAlign: 'center' }}
            />
          </DataTable>
        </div>
      </BaseWidget>
    </>
  );
};

export default LastOrdersWidget;