import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';
import { SplitButton } from 'primereact/splitbutton';
import BaseWidget from '../BaseWidget';
import { formatDate, getDaysOverdue } from '../../../utils/formatters';
import { BaseURL } from '../../../../utils/baseUrl';
import { useSelector } from 'react-redux';

const OverdueRentalsWidget = ({ widgetId, config = {} }) => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingReminders, setSendingReminders] = useState(new Set());
  const toast = useRef(null);
  const { token } = useSelector((state) => state?.authReducer);

  // Fetch overdue rentals
  useEffect(() => {
    fetchOverdueRentals();
    
    // Set up refresh interval if configured
    const refreshInterval = config.refreshInterval || 300000; // 5 minutes default
    const interval = setInterval(fetchOverdueRentals, refreshInterval);
    
    return () => clearInterval(interval);
  }, [config]);

  const fetchOverdueRentals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params based on config
      const params = new URLSearchParams();
      params.append('status', 'overdue');
      if (config.depotId) params.append('depotId', config.depotId);
      if (config.minDaysOverdue) params.append('minDaysOverdue', config.minDaysOverdue);
      if (config.includeGracePeriod !== undefined) {
        params.append('includeGracePeriod', config.includeGracePeriod);
      }
      
      const response = await fetch(`${BaseURL}/rentals/overdue?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch overdue rentals');
      
      const data = await response.json();
      // Sort by most overdue first
      const sortedRentals = (data.rentals || []).sort((a, b) => 
        getDaysOverdue(a.expectedReturnDate) - getDaysOverdue(b.expectedReturnDate)
      );
      setRentals(sortedRentals);
    } catch (err) {
      setError(err.message);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load overdue rentals',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Customer template with contact info
  const customerTemplate = (rowData) => {
    return (
      <div className="flex flex-column gap-1">
        <div className="flex align-items-center gap-2">
          <span className="font-semibold">{rowData.customerName}</span>
          {rowData.isVip && (
            <Badge value="VIP" severity="warning" />
          )}
        </div>
        {rowData.companyName && (
          <span className="text-sm text-500">{rowData.companyName}</span>
        )}
        <div className="flex align-items-center gap-3 text-sm">
          {rowData.customerPhone && (
            <div className="flex align-items-center gap-1">
              <i className="pi pi-phone text-xs text-500" />
              <span className="text-500">{rowData.customerPhone}</span>
            </div>
          )}
          {rowData.customerEmail && (
            <div className="flex align-items-center gap-1">
              <i className="pi pi-envelope text-xs text-500" />
              <span className="text-500">{rowData.customerEmail}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Asset template
  const assetTemplate = (rowData) => {
    return (
      <div className="flex flex-column gap-1">
        <span className="font-semibold">{rowData.assetName}</span>
        <span className="text-sm text-500">{rowData.assetNumber}</span>
        {rowData.assetValue && (
          <span className="text-sm text-500">
            Value: ${rowData.assetValue.toLocaleString()}
          </span>
        )}
      </div>
    );
  };

  // Days overdue template with severity
  const daysOverdueTemplate = (rowData) => {
    const daysOverdue = getDaysOverdue(rowData.expectedReturnDate);
    
    const getSeverity = () => {
      if (daysOverdue > 30) return 'danger';
      if (daysOverdue > 14) return 'warning';
      if (daysOverdue > 7) return 'info';
      return 'success';
    };

    const getIcon = () => {
      if (daysOverdue > 30) return 'pi-exclamation-circle';
      if (daysOverdue > 14) return 'pi-exclamation-triangle';
      return 'pi-clock';
    };

    return (
      <div className="flex flex-column align-items-center">
        <Tag 
          value={`${daysOverdue} days`} 
          severity={getSeverity()}
          icon={getIcon()}
          style={{ minWidth: '80px' }}
        />
        <span className="text-sm text-500 mt-1">
          Due: {formatDate(rowData.expectedReturnDate)}
        </span>
      </div>
    );
  };

  // Last contact template
  const lastContactTemplate = (rowData) => {
    if (!rowData.lastContactDate) {
      return (
        <span className="text-500 text-sm">
          <i className="pi pi-minus mr-1" />
          Never contacted
        </span>
      );
    }

    const daysSinceContact = getDaysOverdue(rowData.lastContactDate);
    const isRecent = daysSinceContact <= 3;

    return (
      <div className="flex flex-column gap-1">
        <span className={`text-sm ${isRecent ? 'text-green-600' : 'text-500'}`}>
          {formatDate(rowData.lastContactDate)}
        </span>
        <span className="text-xs text-500">
          {daysSinceContact === 0 ? 'Today' : `${daysSinceContact} days ago`}
        </span>
        {rowData.lastContactMethod && (
          <Tag 
            value={rowData.lastContactMethod} 
            severity="info" 
            className="text-xs"
            style={{ fontSize: '0.7rem', padding: '0.1rem 0.3rem' }}
          />
        )}
      </div>
    );
  };

  // Actions template
  const actionsTemplate = (rowData) => {
    const isSending = sendingReminders.has(rowData._id);
    
    const actionItems = [
      {
        label: 'Send Email Reminder',
        icon: 'pi pi-envelope',
        command: () => handleSendReminder(rowData, 'email'),
        disabled: isSending || !rowData.customerEmail
      },
      {
        label: 'Send SMS Reminder',
        icon: 'pi pi-mobile',
        command: () => handleSendReminder(rowData, 'sms'),
        disabled: isSending || !rowData.customerPhone
      },
      {
        separator: true
      },
      {
        label: 'Call Customer',
        icon: 'pi pi-phone',
        command: () => handleCallCustomer(rowData),
        disabled: !rowData.customerPhone
      },
      {
        label: 'View Rental Details',
        icon: 'pi pi-eye',
        command: () => handleViewRental(rowData)
      },
      {
        label: 'Create Return Job',
        icon: 'pi pi-truck',
        command: () => handleCreateReturnJob(rowData)
      }
    ];

    return (
      <SplitButton
        label="Actions"
        icon="pi pi-bars"
        model={actionItems}
        className="p-button-sm"
        onClick={() => handleSendReminder(rowData, 'email')}
        disabled={isSending}
        loading={isSending}
      />
    );
  };

  // Action handlers
  const handleSendReminder = async (rental, method) => {
    try {
      setSendingReminders(prev => new Set(prev).add(rental._id));
      
      const response = await fetch(`/api/rentals/${rental._id}/reminder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ method })
      });
      
      if (!response.ok) throw new Error('Failed to send reminder');
      
      toast.current?.show({
        severity: 'success',
        summary: 'Reminder Sent',
        detail: `${method === 'email' ? 'Email' : 'SMS'} reminder sent to ${rental.customerName}`,
        life: 3000
      });
      
      // Refresh to update last contact info
      fetchOverdueRentals();
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to send ${method} reminder`,
        life: 3000
      });
    } finally {
      setSendingReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(rental._id);
        return newSet;
      });
    }
  };

  const handleCallCustomer = (rental) => {
    if (rental.customerPhone) {
      window.open(`tel:${rental.customerPhone}`, '_blank');
    }
  };

  const handleViewRental = (rental) => {
    window.open(`/rentals/${rental._id}`, '_blank');
  };

  const handleCreateReturnJob = (rental) => {
    window.open(`/jobs/new?type=collection&rentalId=${rental._id}`, '_blank');
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
        <span className="text-xl text-500 mb-2">No overdue rentals</span>
        <span className="text-sm text-400">All rentals are on schedule</span>
      </div>
    );
  };

  // Summary statistics
  const renderSummary = () => {
    if (loading || !rentals.length) return null;

    const criticalCount = rentals.filter(r => getDaysOverdue(r.expectedReturnDate) > 30).length;
    const highValueCount = rentals.filter(r => r.assetValue > 1000).length;
    const neverContactedCount = rentals.filter(r => !r.lastContactDate).length;
    const totalValue = rentals.reduce((sum, r) => sum + (r.assetValue || 0), 0);

    return (
      <div className="flex justify-content-around p-3 mb-3 surface-ground border-round">
        <div className="text-center">
          <div className="text-2xl font-semibold text-orange-500">{rentals.length}</div>
          <div className="text-sm text-500">Overdue Rentals</div>
        </div>
        {criticalCount > 0 && (
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-500">{criticalCount}</div>
            <div className="text-sm text-500">&gt;30 Days</div>
          </div>
        )}
        <div className="text-center">
          <div className="text-2xl font-semibold">${totalValue.toLocaleString()}</div>
          <div className="text-sm text-500">Total Value</div>
        </div>
        {neverContactedCount > 0 && (
          <div className="text-center">
            <div className="text-2xl font-semibold text-yellow-500">{neverContactedCount}</div>
            <div className="text-sm text-500">Not Contacted</div>
          </div>
        )}
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <div className="flex align-items-center gap-2">
      <Button
        icon="pi pi-send"
        label="Bulk Reminders"
        className="p-button-sm p-button-warning"
        onClick={() => {
          toast.current?.show({
            severity: 'info',
            summary: 'Bulk Reminders',
            detail: 'Bulk reminder feature coming soon',
            life: 3000
          });
        }}
        disabled={loading || rentals.length === 0}
      />
      <Button
        icon="pi pi-refresh"
        className="p-button-text p-button-sm p-button-rounded"
        onClick={fetchOverdueRentals}
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
        title="Overdue Rentals"
        icon="exclamation-triangle"
        headerActions={headerActions}
        loading={loading && rentals.length === 0}
        error={error}
        minWidth={8}
        maxWidth={12}
      >
        <div className="overdue-rentals-widget">
          {renderSummary()}
          
          <DataTable
            value={rentals}
            paginator={rentals.length > 10}
            rows={10}
            rowsPerPageOptions={[10, 20, 50]}
            emptyMessage={emptyMessage}
            className="p-datatable-sm"
            stripedRows
            showGridlines={false}
            responsiveLayout="scroll"
            rowClassName={(rowData) => {
              const daysOverdue = getDaysOverdue(rowData.expectedReturnDate);
              if (daysOverdue > 30) return 'critical-overdue';
              if (daysOverdue > 14) return 'high-overdue';
              return '';
            }}
          >
            <Column
              field="customerName"
              header="Customer"
              body={loading ? loadingTemplate : customerTemplate}
              style={{ width: '25%' }}
              sortable
            />
            <Column
              field="assetName"
              header="Asset"
              body={loading ? loadingTemplate : assetTemplate}
              style={{ width: '20%' }}
              sortable
            />
            <Column
              field="daysOverdue"
              header="Overdue"
              body={loading ? loadingTemplate : daysOverdueTemplate}
              style={{ width: '15%' }}
              sortable
              sortFunction={(e) => {
                const a = getDaysOverdue(e.data[0].expectedReturnDate);
                const b = getDaysOverdue(e.data[1].expectedReturnDate);
                return e.order * (a - b);
              }}
            />
            <Column
              field="lastContactDate"
              header="Last Contact"
              body={loading ? loadingTemplate : lastContactTemplate}
              style={{ width: '15%' }}
              sortable
            />
            <Column
              body={loading ? loadingTemplate : actionsTemplate}
              style={{ width: '25%' }}
              alignHeader="center"
              bodyStyle={{ textAlign: 'center' }}
            />
          </DataTable>
        </div>
        
        <style jsx>{`
          .overdue-rentals-widget :global(.critical-overdue) {
            background-color: rgba(239, 68, 68, 0.05) !important;
          }
          
          .overdue-rentals-widget :global(.high-overdue) {
            background-color: rgba(245, 158, 11, 0.05) !important;
          }
        `}</style>
      </BaseWidget>
    </>
  );
};

export default OverdueRentalsWidget;