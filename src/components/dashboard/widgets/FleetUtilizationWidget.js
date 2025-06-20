import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import BaseWidget from '../BaseWidget';
import { formatCurrency } from '../../../utils/formatters';

const FleetUtilizationWidget = ({ widgetId, config = {} }) => {
  const [kpiData, setKpiData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(config.defaultTimeRange || '7d');
  const toast = useRef(null);

  const timeRangeOptions = [
    { label: 'Today', value: '1d' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' }
  ];

  // Fetch fleet utilization data
  useEffect(() => {
    fetchFleetUtilization();
    
    // Set up refresh interval if configured
    const refreshInterval = config.refreshInterval || 300000; // 5 minutes default
    const interval = setInterval(fetchFleetUtilization, refreshInterval);
    
    return () => clearInterval(interval);
  }, [config, timeRange]);

  const fetchFleetUtilization = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params based on config
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      if (config.depotId) params.append('depotId', config.depotId);
      if (config.categoryId) params.append('categoryId', config.categoryId);
      
      const response = await fetch(`/api/analytics/fleet-utilization?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch fleet utilization');
      
      const data = await response.json();
      setKpiData(data.kpis);
      
      // Prepare chart data
      if (data.trends) {
        setChartData({
          labels: data.trends.labels,
          datasets: [
            {
              label: 'Utilization %',
              data: data.trends.utilization,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Revenue',
              data: data.trends.revenue,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true,
              yAxisID: 'y1'
            }
          ]
        });
      }
    } catch (err) {
      setError(err.message);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load fleet utilization data',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart options
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.yAxisID === 'y1') {
                label += formatCurrency(context.parsed.y);
              } else {
                label += context.parsed.y.toFixed(1) + '%';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Utilization %'
        },
        ticks: {
          callback: (value) => value + '%'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenue'
        },
        ticks: {
          callback: (value) => formatCurrency(value, true)
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  // KPI Card component
  const KPICard = ({ title, value, subtitle, trend, icon, color }) => {
    const getTrendIcon = () => {
      if (!trend || trend === 0) return null;
      return trend > 0 ? 'pi-arrow-up' : 'pi-arrow-down';
    };

    const getTrendColor = () => {
      if (!trend || trend === 0) return 'text-500';
      return trend > 0 ? 'text-green-500' : 'text-red-500';
    };

    return (
      <Card className="kpi-card border-1 surface-border">
        <div className="flex align-items-start justify-content-between">
          <div className="flex flex-column gap-2">
            <span className="text-500 text-sm font-medium">{title}</span>
            <div className="flex align-items-baseline gap-2">
              <span className="text-3xl font-bold" style={{ color }}>
                {loading ? <Skeleton width="80px" height="32px" /> : value}
              </span>
              {trend !== undefined && !loading && (
                <div className={`flex align-items-center gap-1 ${getTrendColor()}`}>
                  <i className={`pi ${getTrendIcon()} text-xs`} />
                  <span className="text-sm font-medium">
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            {subtitle && (
              <span className="text-500 text-xs">
                {loading ? <Skeleton width="100px" /> : subtitle}
              </span>
            )}
          </div>
          <div 
            className="flex align-items-center justify-content-center"
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px',
              backgroundColor: `${color}20`
            }}
          >
            <i className={`pi ${icon} text-xl`} style={{ color }} />
          </div>
        </div>
      </Card>
    );
  };

  // Loading skeleton for chart
  const chartLoadingSkeleton = () => (
    <div className="flex flex-column gap-3 p-3">
      <Skeleton width="100%" height="200px" />
    </div>
  );

  // Empty state
  const emptyContent = () => (
    <div className="flex flex-column align-items-center justify-content-center p-5">
      <i className="pi pi-chart-line text-5xl text-300 mb-3" />
      <span className="text-xl text-500 mb-2">No utilization data available</span>
      <span className="text-sm text-400">Data will appear once assets are tracked</span>
    </div>
  );

  // Header actions
  const headerActions = (
    <div className="flex align-items-center gap-2">
      <Dropdown
        value={timeRange}
        options={timeRangeOptions}
        onChange={(e) => setTimeRange(e.value)}
        className="p-dropdown-sm"
        disabled={loading}
      />
      <Button
        icon="pi pi-chart-bar"
        className="p-button-text p-button-sm p-button-rounded"
        onClick={() => window.open('/analytics/fleet', '_blank')}
        tooltip="View Detailed Analytics"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-refresh"
        className="p-button-text p-button-sm p-button-rounded"
        onClick={fetchFleetUtilization}
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
        title="Fleet Utilization"
        icon="percentage"
        headerActions={headerActions}
        loading={loading && !kpiData}
        error={error}
        minWidth={6}
        maxWidth={12}
      >
        <div className="fleet-utilization-widget">
          {!loading && !kpiData ? (
            emptyContent()
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid">
                <div className="col-12 md:col-6 lg:col-3">
                  <KPICard
                    title="Assets Out"
                    value={kpiData?.assetsOut || 0}
                    subtitle={`of ${kpiData?.totalAssets || 0} total`}
                    trend={kpiData?.assetsOutTrend}
                    icon="pi-box"
                    color="#3B82F6"
                  />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                  <KPICard
                    title="On-Hire Value"
                    value={formatCurrency(kpiData?.onHireValue || 0)}
                    subtitle="Current rental value"
                    trend={kpiData?.onHireValueTrend}
                    icon="pi-dollar"
                    color="#10B981"
                  />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                  <KPICard
                    title="Utilization Rate"
                    value={`${(kpiData?.utilizationRate || 0).toFixed(1)}%`}
                    subtitle={kpiData?.utilizationTarget ? `Target: ${kpiData.utilizationTarget}%` : null}
                    trend={kpiData?.utilizationTrend}
                    icon="pi-chart-line"
                    color="#F59E0B"
                  />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                  <KPICard
                    title="Avg. Rental Days"
                    value={kpiData?.avgRentalDays || 0}
                    subtitle="Per asset"
                    trend={kpiData?.avgRentalDaysTrend}
                    icon="pi-calendar"
                    color="#8B5CF6"
                  />
                </div>
              </div>

              {/* Trend Chart */}
              {chartData && (
                <Card className="mt-3">
                  <div className="flex align-items-center justify-content-between mb-3">
                    <h4 className="m-0">Utilization Trends</h4>
                    <div className="flex align-items-center gap-2 text-sm text-500">
                      <i className="pi pi-info-circle" />
                      <span>Showing {timeRangeOptions.find(o => o.value === timeRange)?.label}</span>
                    </div>
                  </div>
                  <div style={{ height: '250px' }}>
                    {loading ? (
                      chartLoadingSkeleton()
                    ) : (
                      <Chart type="line" data={chartData} options={chartOptions} />
                    )}
                  </div>
                </Card>
              )}

              {/* Category Breakdown */}
              {kpiData?.categoryBreakdown && (
                <Card className="mt-3">
                  <h4 className="m-0 mb-3">Category Performance</h4>
                  <div className="flex flex-column gap-2">
                    {kpiData.categoryBreakdown.map((category, index) => (
                      <div key={index} className="flex align-items-center justify-content-between p-2 surface-hover border-round">
                        <div className="flex align-items-center gap-3">
                          <div 
                            className="category-indicator"
                            style={{ 
                              width: '4px', 
                              height: '32px', 
                              backgroundColor: category.color || '#6B7280',
                              borderRadius: '2px'
                            }}
                          />
                          <div>
                            <div className="font-semibold">{category.name}</div>
                            <div className="text-sm text-500">
                              {category.assetsOut} of {category.totalAssets} assets
                            </div>
                          </div>
                        </div>
                        <div className="flex align-items-center gap-3">
                          <div className="text-right">
                            <div className="font-semibold">{category.utilizationRate.toFixed(1)}%</div>
                            <div className="text-sm text-500">Utilization</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(category.revenue)}</div>
                            <div className="text-sm text-500">Revenue</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
        
        <style jsx>{`
          .fleet-utilization-widget :global(.kpi-card) {
            height: 100%;
            transition: all 0.2s;
          }
          
          .fleet-utilization-widget :global(.kpi-card:hover) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .fleet-utilization-widget :global(.p-card-body) {
            padding: 1rem;
          }
        `}</style>
      </BaseWidget>
    </>
  );
};

export default FleetUtilizationWidget;