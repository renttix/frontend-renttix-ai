import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Chart } from 'primereact/chart';
import BaseWidget from '../BaseWidget';
import { formatCurrency } from '../../../utils/formatters';
import { BaseURL } from '../../../../utils/baseUrl';
import { useSelector } from 'react-redux';

const InvoiceRunSummaryWidget = ({ widgetId, config = {} }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningInvoices, setRunningInvoices] = useState(false);
  const toast = useRef(null);
  const { token } = useSelector((state) => state?.authReducer);

  // Chart options
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true
        }
      }
    }
  };

  // Fetch invoice run summary
  useEffect(() => {
    fetchInvoiceRunSummary();
    
    // Set up refresh interval if configured
    const refreshInterval = config.refreshInterval || 300000; // 5 minutes default
    const interval = setInterval(fetchInvoiceRunSummary, refreshInterval);
    
    return () => clearInterval(interval);
  }, [config]);

  const fetchInvoiceRunSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BaseURL}/widget-data/invoice-run-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch invoice summary');
      
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err.message);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load invoice run summary',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunInvoices = () => {
    confirmDialog({
      message: `Are you sure you want to run ${summary?.pendingCount || 0} invoices now?`,
      header: 'Confirm Invoice Run',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        setRunningInvoices(true);
        try {
          const response = await fetch('/api/invoices/run', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              invoiceIds: summary?.pendingInvoiceIds || []
            })
          });
          
          if (!response.ok) throw new Error('Failed to run invoices');
          
          const result = await response.json();
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: `${result.processedCount} invoices processed successfully`,
            life: 5000
          });
          
          // Refresh the summary
          fetchInvoiceRunSummary();
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to run invoices',
            life: 3000
          });
        } finally {
          setRunningInvoices(false);
        }
      }
    });
  };

  // Loading skeleton
  const loadingSkeleton = () => (
    <div className="grid">
      <div className="col-12 md:col-6 lg:col-3">
        <Skeleton height="100px" />
      </div>
      <div className="col-12 md:col-6 lg:col-3">
        <Skeleton height="100px" />
      </div>
      <div className="col-12 md:col-6 lg:col-3">
        <Skeleton height="100px" />
      </div>
      <div className="col-12 md:col-6 lg:col-3">
        <Skeleton height="100px" />
      </div>
      <div className="col-12">
        <Skeleton height="200px" />
      </div>
    </div>
  );

  // Empty state
  const emptyState = () => (
    <div className="flex flex-column align-items-center justify-content-center p-4">
      <i className="pi pi-file-excel text-4xl text-300 mb-3" />
      <span className="text-500">No invoices pending</span>
    </div>
  );

  // Header actions
  const headerActions = (
    <>
      <Button
        icon="pi pi-play"
        label="Run Now"
        className="p-button-sm p-button-success"
        onClick={handleRunInvoices}
        disabled={loading || !summary?.pendingCount || runningInvoices}
        loading={runningInvoices}
      />
      <Button
        icon="pi pi-refresh"
        className="p-button-text p-button-sm p-button-rounded"
        onClick={fetchInvoiceRunSummary}
        tooltip="Refresh"
        tooltipOptions={{ position: 'top' }}
        disabled={loading}
      />
    </>
  );

  // Prepare chart data
  const chartData = summary ? {
    labels: ['Rental', 'Sales', 'Credit Notes', 'Other'],
    datasets: [{
      data: [
        summary.breakdown.rental || 0,
        summary.breakdown.sales || 0,
        summary.breakdown.creditNotes || 0,
        summary.breakdown.other || 0
      ],
      backgroundColor: [
        '#2196F3',
        '#4CAF50',
        '#FFC107',
        '#9E9E9E'
      ],
      hoverBackgroundColor: [
        '#1976D2',
        '#388E3C',
        '#FFA000',
        '#616161'
      ]
    }]
  } : null;

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <BaseWidget
        widgetId={widgetId}
        title="Invoice Run Summary"
        icon="file-excel"
        headerActions={headerActions}
        loading={loading && !summary}
        error={error}
        minWidth={6}
        maxWidth={12}
      >
        <div className="invoice-run-summary-widget">
          {loading && !summary ? (
            loadingSkeleton()
          ) : !summary || summary.pendingCount === 0 ? (
            emptyState()
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid mb-3">
                <div className="col-12 md:col-6 lg:col-3">
                  <Card className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {summary.pendingCount}
                    </div>
                    <div className="text-500">Pending Invoices</div>
                  </Card>
                </div>
                
                <div className="col-12 md:col-6 lg:col-3">
                  <Card className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {formatCurrency(summary.totalValue)}
                    </div>
                    <div className="text-500">Total Value</div>
                  </Card>
                </div>
                
                <div className="col-12 md:col-6 lg:col-3">
                  <Card className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                      {summary.scheduledDate ? new Date(summary.scheduledDate).toLocaleDateString() : 'Not Set'}
                    </div>
                    <div className="text-500">Scheduled Date</div>
                  </Card>
                </div>
                
                <div className="col-12 md:col-6 lg:col-3">
                  <Card className="text-center">
                    <div className="mb-2">
                      <Tag 
                        value={summary.status} 
                        severity={summary.status === 'ready' ? 'success' : 'warning'}
                        style={{ textTransform: 'capitalize' }}
                      />
                    </div>
                    <div className="text-500">Status</div>
                  </Card>
                </div>
              </div>

              {/* Progress Bar */}
              {summary.progress !== undefined && (
                <div className="mb-3">
                  <div className="flex justify-content-between mb-2">
                    <span className="text-500">Processing Progress</span>
                    <span className="text-500">{summary.progress}%</span>
                  </div>
                  <ProgressBar 
                    value={summary.progress} 
                    showValue={false}
                    style={{ height: '10px' }}
                  />
                </div>
              )}

              {/* Breakdown Chart */}
              {chartData && summary.pendingCount > 0 && (
                <div className="grid">
                  <div className="col-12 lg:col-6">
                    <Card title="Invoice Type Breakdown" className="h-full">
                      <Chart 
                        type="doughnut" 
                        data={chartData} 
                        options={chartOptions}
                        style={{ height: '200px' }}
                      />
                    </Card>
                  </div>
                  
                  <div className="col-12 lg:col-6">
                    <Card title="Details" className="h-full">
                      <div className="flex flex-column gap-3">
                        <div className="flex justify-content-between align-items-center">
                          <span className="text-500">Rental Invoices:</span>
                          <div className="flex align-items-center gap-2">
                            <span className="font-semibold">{summary.breakdown.rental || 0}</span>
                            <span className="text-500">({formatCurrency(summary.breakdown.rentalValue || 0)})</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-content-between align-items-center">
                          <span className="text-500">Sales Invoices:</span>
                          <div className="flex align-items-center gap-2">
                            <span className="font-semibold">{summary.breakdown.sales || 0}</span>
                            <span className="text-500">({formatCurrency(summary.breakdown.salesValue || 0)})</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-content-between align-items-center">
                          <span className="text-500">Credit Notes:</span>
                          <div className="flex align-items-center gap-2">
                            <span className="font-semibold">{summary.breakdown.creditNotes || 0}</span>
                            <span className="text-500">({formatCurrency(summary.breakdown.creditNotesValue || 0)})</span>
                          </div>
                        </div>
                        
                        {summary.lastRunDate && (
                          <div className="mt-2 pt-2 border-top-1 surface-border">
                            <div className="flex justify-content-between align-items-center">
                              <span className="text-500">Last Run:</span>
                              <span className="text-sm">{new Date(summary.lastRunDate).toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {summary.warnings && summary.warnings.length > 0 && (
                <div className="mt-3">
                  <Card className="border-orange-500">
                    <div className="flex align-items-center gap-2 mb-2">
                      <i className="pi pi-exclamation-triangle text-orange-500" />
                      <span className="font-semibold">Warnings</span>
                    </div>
                    <ul className="m-0 pl-3">
                      {summary.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-500">{warning}</li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </BaseWidget>
    </>
  );
};

export default InvoiceRunSummaryWidget;