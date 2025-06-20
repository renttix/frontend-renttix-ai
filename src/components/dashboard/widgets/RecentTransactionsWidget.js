import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { SplitButton } from 'primereact/splitbutton';
import BaseWidget from '../BaseWidget';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { recentTransactionsService, handleApiError } from '../../../services/widgetServices';

const RecentTransactionsWidget = ({ widgetId, config = {} }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useRef(null);

  // Fetch recent transactions
  useEffect(() => {
    fetchRecentTransactions();
    
    // Set up refresh interval if configured
    const refreshInterval = config.refreshInterval || 300000; // 5 minutes default
    const interval = setInterval(fetchRecentTransactions, refreshInterval);
    
    return () => clearInterval(interval);
  }, [config]);

  const fetchRecentTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params based on config
      const params = {
        limit: config.limit || 20,
        ...(config.types && { types: config.types.join(',') }),
        ...(config.userId && { userId: config.userId }),
        ...(config.depotId && { depotId: config.depotId })
      };
      
      const data = await recentTransactionsService.fetchRecentTransactions(params);
      setTransactions(data.transactions || data || []);
    } catch (err) {
      const errorMessage = handleApiError(err, 'Failed to load recent transactions');
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

  // Transaction type template with color coding
  const typeBodyTemplate = (rowData) => {
    const getTypeConfig = (type) => {
      switch (type?.toLowerCase()) {
        case 'invoice':
          return { icon: 'pi-file', color: '#3B82F6', label: 'Invoice' };
        case 'payment':
          return { icon: 'pi-dollar', color: '#10B981', label: 'Payment' };
        case 'refund':
          return { icon: 'pi-replay', color: '#F59E0B', label: 'Refund' };
        case 'failed_charge':
          return { icon: 'pi-exclamation-triangle', color: '#EF4444', label: 'Failed Charge' };
        case 'credit_note':
          return { icon: 'pi-file-edit', color: '#8B5CF6', label: 'Credit Note' };
        default:
          return { icon: 'pi-circle', color: '#6B7280', label: type };
      }
    };

    const config = getTypeConfig(rowData.type);
    
    return (
      <div className="flex align-items-center gap-2">
        <i 
          className={`pi ${config.icon}`} 
          style={{ color: config.color }}
        />
        <span style={{ color: config.color, fontWeight: '500' }}>
          {config.label}
        </span>
      </div>
    );
  };

  // Status template
  const statusBodyTemplate = (rowData) => {
    const getSeverity = (status) => {
      switch (status?.toLowerCase()) {
        case 'paid':
        case 'completed':
        case 'success':
          return 'success';
        case 'pending':
        case 'processing':
          return 'warning';
        case 'failed':
        case 'overdue':
        case 'cancelled':
          return 'danger';
        case 'partial':
          return 'info';
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

  // Customer template
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

  // Amount template with color coding
  const amountBodyTemplate = (rowData) => {
    const isNegative = rowData.type === 'refund' || rowData.type === 'credit_note';
    const color = isNegative ? '#EF4444' : '#10B981';
    
    return (
      <span style={{ color, fontWeight: '600' }}>
        {isNegative && '-'}
        {formatCurrency(Math.abs(rowData.amount))}
      </span>
    );
  };

  // Date template
  const dateBodyTemplate = (rowData) => {
    return formatDate(rowData.date);
  };

  // Actions template
  const actionsBodyTemplate = (rowData) => {
    const getActionItems = () => {
      const items = [];
      
      switch (rowData.type) {
        case 'invoice':
          items.push({
            label: 'View Invoice',
            icon: 'pi pi-eye',
            command: () => handleViewInvoice(rowData)
          });
          items.push({
            label: 'Download PDF',
            icon: 'pi pi-download',
            command: () => handleDownloadInvoice(rowData)
          });
          if (rowData.status === 'pending' || rowData.status === 'overdue') {
            items.push({
              label: 'Send Reminder',
              icon: 'pi pi-envelope',
              command: () => handleSendReminder(rowData)
            });
          }
          break;
          
        case 'payment':
          items.push({
            label: 'View Receipt',
            icon: 'pi pi-eye',
            command: () => handleViewReceipt(rowData)
          });
          break;
          
        case 'failed_charge':
          items.push({
            label: 'Retry Payment',
            icon: 'pi pi-refresh',
            command: () => handleRetryPayment(rowData)
          });
          items.push({
            label: 'Contact Customer',
            icon: 'pi pi-phone',
            command: () => handleContactCustomer(rowData)
          });
          break;
          
        default:
          items.push({
            label: 'View Details',
            icon: 'pi pi-eye',
            command: () => handleViewDetails(rowData)
          });
      }
      
      return items;
    };

    const items = getActionItems();
    
    if (items.length === 1) {
      return (
        <Button
          icon={items[0].icon}
          className="p-button-text p-button-sm"
          onClick={items[0].command}
          tooltip={items[0].label}
          tooltipOptions={{ position: 'top' }}
        />
      );
    }
    
    return (
      <SplitButton
        icon="pi pi-ellipsis-v"
        className="p-button-text p-button-sm"
        model={items}
        onClick={items[0].command}
        buttonClassName="p-button-sm"
        menuButtonClassName="p-button-sm"
      />
    );
  };

  // Action handlers
  const handleViewInvoice = (transaction) => {
    window.open(`/invoices/${transaction.referenceId}`, '_blank');
  };

  const handleDownloadInvoice = async (transaction) => {
    try {
      const response = await fetch(`/api/invoices/${transaction.referenceId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download invoice');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${transaction.referenceNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to download invoice',
        life: 3000
      });
    }
  };

  const handleSendReminder = async (transaction) => {
    try {
      const response = await fetch(`/api/invoices/${transaction.referenceId}/reminder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to send reminder');
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Reminder sent successfully',
        life: 3000
      });
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to send reminder',
        life: 3000
      });
    }
  };

  const handleRetryPayment = async (transaction) => {
    try {
      const response = await fetch(`/api/payments/${transaction.referenceId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to retry payment');
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Payment retry initiated',
        life: 3000
      });
      
      // Refresh transactions
      fetchRecentTransactions();
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to retry payment',
        life: 3000
      });
    }
  };

  const handleViewReceipt = (transaction) => {
    window.open(`/receipts/${transaction.referenceId}`, '_blank');
  };

  const handleContactCustomer = (transaction) => {
    window.open(`/customers/${transaction.customerId}`, '_blank');
  };

  const handleViewDetails = (transaction) => {
    window.open(`/transactions/${transaction._id}`, '_blank');
  };

  // Loading skeleton
  const loadingTemplate = () => {
    return <Skeleton />;
  };

  // Empty state
  const emptyMessage = () => {
    return (
      <div className="flex flex-column align-items-center justify-content-center p-4">
        <i className="pi pi-wallet text-4xl text-300 mb-3" />
        <span className="text-500">No recent transactions found</span>
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <Button
      icon="pi pi-refresh"
      className="p-button-text p-button-sm p-button-rounded"
      onClick={fetchRecentTransactions}
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
        title="Recent Transactions"
        icon="wallet"
        headerActions={headerActions}
        loading={loading && transactions.length === 0}
        error={error}
        minWidth={6}
        maxWidth={12}
      >
        <div className="recent-transactions-widget">
          <DataTable
            value={transactions}
            paginator={transactions.length > 10}
            rows={10}
            rowsPerPageOptions={[10, 20, 30]}
            emptyMessage={emptyMessage}
            className="p-datatable-sm"
            stripedRows
            showGridlines={false}
            responsiveLayout="scroll"
          >
            <Column
              field="type"
              header="Type"
              body={loading ? loadingTemplate : typeBodyTemplate}
              style={{ width: '15%' }}
            />
            <Column
              field="customerName"
              header="Customer"
              body={loading ? loadingTemplate : customerBodyTemplate}
              style={{ width: '25%' }}
            />
            <Column
              field="amount"
              header="Amount"
              body={loading ? loadingTemplate : amountBodyTemplate}
              style={{ width: '15%' }}
              alignHeader="right"
              bodyStyle={{ textAlign: 'right' }}
            />
            <Column
              field="date"
              header="Date"
              body={loading ? loadingTemplate : dateBodyTemplate}
              style={{ width: '15%' }}
            />
            <Column
              field="status"
              header="Status"
              body={loading ? loadingTemplate : statusBodyTemplate}
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

export default RecentTransactionsWidget;