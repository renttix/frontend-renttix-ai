import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';
import BaseWidget from '../BaseWidget';
import { useRouter } from 'next/navigation';
import { formatDate } from '../../../utils/formatters';

const RecurringContractsWidget = ({ widgetId, config = {} }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const toast = useRef(null);

  // Fetch recurring contracts
  useEffect(() => {
    fetchRecurringContracts();
    
    // Set up refresh interval if configured
    const refreshInterval = config.refreshInterval || 300000; // 5 minutes default
    const interval = setInterval(fetchRecurringContracts, refreshInterval);
    
    return () => clearInterval(interval);
  }, [config]);

  const fetchRecurringContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params based on config
      const params = new URLSearchParams();
      params.append('limit', config.limit || 20);
      if (config.depotId) params.append('depotId', config.depotId);
      if (config.daysAhead) params.append('daysAhead', config.daysAhead);
      
      const response = await fetch(`/api/widget-data/recurring-contracts?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch recurring contracts');
      
      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (err) {
      setError(err.message);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load recurring contracts',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
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

  // Contract details template
  const contractBodyTemplate = (rowData) => {
    return (
      <div className="flex flex-column">
        <span className="font-semibold">{rowData.contractNumber}</span>
        <span className="text-sm text-500">{rowData.description}</span>
      </div>
    );
  };

  // Next occurrence template
  const nextOccurrenceBodyTemplate = (rowData) => {
    const daysUntilNext = Math.floor((new Date(rowData.nextOccurrence) - new Date()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilNext < 0;
    const isDueSoon = daysUntilNext >= 0 && daysUntilNext <= 7;
    
    return (
      <div className="flex align-items-center gap-2">
        <span>{formatDate(rowData.nextOccurrence)}</span>
        {isOverdue && (
          <Badge value="Overdue" severity="danger" />
        )}
        {isDueSoon && !isOverdue && (
          <Badge value={`${daysUntilNext}d`} severity="warning" />
        )}
      </div>
    );
  };

  // Frequency template
  const frequencyBodyTemplate = (rowData) => {
    const frequencyMap = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'biweekly': 'Bi-weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'annually': 'Annually'
    };
    
    return (
      <Tag 
        value={frequencyMap[rowData.frequency] || rowData.frequency} 
        severity="info"
      />
    );
  };

  // Renewal status template
  const renewalBodyTemplate = (rowData) => {
    if (rowData.dueForRenewal) {
      return (
        <Tag 
          value="Due for Renewal" 
          severity="warning"
          icon="pi pi-exclamation-triangle"
        />
      );
    }
    return null;
  };

  // Actions template
  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-text p-button-sm"
          onClick={() => router.push(`/contracts/${rowData._id}`)}
          tooltip="View Contract"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-plus"
          className="p-button-text p-button-sm p-button-success"
          onClick={() => handleCreateInstance(rowData)}
          tooltip="Create Next Instance"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  const handleCreateInstance = async (contract) => {
    try {
      const response = await fetch(`/api/contracts/${contract._id}/create-instance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to create instance');
      
      const data = await response.json();
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Order ${data.orderNumber} created`,
        life: 3000
      });
      
      // Refresh the list
      fetchRecurringContracts();
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create order instance',
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
      <div className="flex flex-column align-items-center justify-content-center p-4">
        <i className="pi pi-calendar text-4xl text-300 mb-3" />
        <span className="text-500">No recurring contracts found</span>
      </div>
    );
  };

  // Header actions
  const headerActions = (
    <Button
      icon="pi pi-refresh"
      className="p-button-text p-button-sm p-button-rounded"
      onClick={fetchRecurringContracts}
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
        title="Recurring Contracts"
        icon="replay"
        headerActions={headerActions}
        loading={loading && contracts.length === 0}
        error={error}
        minWidth={8}
        maxWidth={12}
      >
        <div className="recurring-contracts-widget">
          <DataTable
            value={contracts}
            paginator={contracts.length > 10}
            rows={10}
            rowsPerPageOptions={[10, 20, 50]}
            emptyMessage={emptyMessage}
            className="p-datatable-sm"
            stripedRows
            showGridlines={false}
            responsiveLayout="scroll"
            rowClassName={(data) => {
              return {
                'surface-100': data.dueForRenewal,
                'surface-50': data.isOverdue
              };
            }}
          >
            <Column
              field="customerName"
              header="Customer"
              body={loading ? loadingTemplate : customerBodyTemplate}
              style={{ width: '20%' }}
            />
            <Column
              field="contractNumber"
              header="Contract"
              body={loading ? loadingTemplate : contractBodyTemplate}
              style={{ width: '20%' }}
            />
            <Column
              field="nextOccurrence"
              header="Next Occurrence"
              body={loading ? loadingTemplate : nextOccurrenceBodyTemplate}
              style={{ width: '20%' }}
              sortable
            />
            <Column
              field="frequency"
              header="Frequency"
              body={loading ? loadingTemplate : frequencyBodyTemplate}
              style={{ width: '15%' }}
            />
            <Column
              field="dueForRenewal"
              header="Status"
              body={loading ? loadingTemplate : renewalBodyTemplate}
              style={{ width: '15%' }}
            />
            <Column
              body={loading ? loadingTemplate : actionsBodyTemplate}
              style={{ width: '10%' }}
              alignHeader="center"
              bodyStyle={{ textAlign: 'center' }}
            />
          </DataTable>
        </div>
      </BaseWidget>
    </>
  );
};

export default RecurringContractsWidget;