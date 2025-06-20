import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Skeleton } from 'primereact/skeleton';
import { fetchWidgetData } from '../../../services/dashboardService';
import './StatsWidget.css';

const StatsWidget = ({ config = {} }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
    
    // Set up refresh interval if configured
    if (config.refreshInterval) {
      const interval = setInterval(loadStats, config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [config]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch stats data
      const data = await fetchWidgetData('stats', {
        period: config.period || '7d',
        metrics: config.metrics || ['revenue', 'orders', 'utilization', 'customers']
      });
      
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP'
        }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'number':
        return new Intl.NumberFormat('en-GB').format(value);
      default:
        return value;
    }
  };

  const getChangeIcon = (change) => {
    if (change > 0) return 'pi pi-arrow-up text-green-500';
    if (change < 0) return 'pi pi-arrow-down text-red-500';
    return 'pi pi-minus text-gray-500';
  };

  if (loading) {
    return (
      <div className="stats-widget">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card p-4 bg-white dark:bg-gray-800 rounded-lg">
              <Skeleton width="60%" height="1rem" className="mb-2" />
              <Skeleton width="80%" height="2rem" className="mb-2" />
              <Skeleton width="40%" height="0.8rem" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-red-500">
        <i className="pi pi-exclamation-triangle mr-2" />
        {error}
      </div>
    );
  }

  // Default stats data if none provided
  const defaultStats = [
    {
      id: 'revenue',
      label: 'Revenue',
      value: 45230,
      change: 12.5,
      type: 'currency',
      icon: 'pi-pound',
      color: 'blue'
    },
    {
      id: 'orders',
      label: 'Active Orders',
      value: 156,
      change: 8.2,
      type: 'number',
      icon: 'pi-shopping-cart',
      color: 'green'
    },
    {
      id: 'utilization',
      label: 'Fleet Utilization',
      value: 78.5,
      change: -2.3,
      type: 'percentage',
      icon: 'pi-percentage',
      color: 'orange'
    },
    {
      id: 'customers',
      label: 'New Customers',
      value: 23,
      change: 15.0,
      type: 'number',
      icon: 'pi-users',
      color: 'purple'
    }
  ];

  const displayStats = stats?.metrics || defaultStats;

  return (
    <div className="stats-widget">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat) => (
          <div 
            key={stat.id} 
            className={`stat-card p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-${stat.color}-500`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <i className={`pi ${stat.icon} text-${stat.color}-500`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
              </div>
              {stat.change !== undefined && (
                <div className="flex items-center gap-1">
                  <i className={getChangeIcon(stat.change)} style={{ fontSize: '0.8rem' }} />
                  <span className={`text-xs ${stat.change > 0 ? 'text-green-500' : stat.change < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {Math.abs(stat.change)}%
                  </span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {formatValue(stat.value, stat.type)}
            </div>
            {stat.subtitle && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stat.subtitle}
              </div>
            )}
            {stat.progress !== undefined && (
              <ProgressBar 
                value={stat.progress} 
                showValue={false} 
                style={{ height: '4px' }} 
                className="mt-2"
              />
            )}
          </div>
        ))}
      </div>
      
      {config.showPeriodSelector && (
        <div className="flex justify-end mt-4">
          <select 
            className="p-2 border rounded text-sm"
            value={config.period || '7d'}
            onChange={(e) => {
              // Handle period change
              console.log('Period changed to:', e.target.value);
            }}
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default StatsWidget;