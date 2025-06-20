import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Skeleton } from 'primereact/skeleton';
import { fetchWidgetData } from '../../../services/dashboardService';
import './AlertsWidget.css';

const AlertsWidget = ({ config = {} }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAlerts();
    
    // Set up refresh interval if configured
    if (config.refreshInterval) {
      const interval = setInterval(loadAlerts, config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [config]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch alerts data
      const data = await fetchWidgetData('alerts', {
        types: config.types || ['all'],
        severity: config.severity,
        limit: config.limit || 10
      });
      
      setAlerts(data?.alerts || getDefaultAlerts());
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError('Failed to load alerts');
      setAlerts(getDefaultAlerts());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAlerts = () => {
    return [
      {
        id: 1,
        type: 'maintenance',
        severity: 'high',
        title: 'Urgent Maintenance Required',
        message: 'Asset #456 requires immediate maintenance - hydraulic system failure',
        timestamp: '5 minutes ago',
        isRead: false
      },
      {
        id: 2,
        type: 'overdue',
        severity: 'medium',
        title: 'Overdue Rental',
        message: 'Order #789 is 3 days overdue for return',
        timestamp: '1 hour ago',
        isRead: false
      },
      {
        id: 3,
        type: 'low-stock',
        severity: 'low',
        title: 'Low Stock Alert',
        message: 'Scaffolding units below minimum threshold (5 remaining)',
        timestamp: '2 hours ago',
        isRead: true
      },
      {
        id: 4,
        type: 'payment',
        severity: 'medium',
        title: 'Payment Failed',
        message: 'Failed to process payment for invoice #234',
        timestamp: '3 hours ago',
        isRead: false
      },
      {
        id: 5,
        type: 'system',
        severity: 'info',
        title: 'System Update',
        message: 'Scheduled maintenance window tonight 2-4 AM',
        timestamp: '4 hours ago',
        isRead: true
      }
    ];
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      case 'info': return 'info';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'maintenance': return 'pi-wrench';
      case 'overdue': return 'pi-clock';
      case 'low-stock': return 'pi-exclamation-circle';
      case 'payment': return 'pi-credit-card';
      case 'system': return 'pi-info-circle';
      default: return 'pi-bell';
    }
  };

  const handleDismiss = (alertId) => {
    // In a real implementation, this would mark the alert as read/dismissed
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const handleMarkAsRead = (alertId) => {
    setAlerts(alerts.map(a => 
      a.id === alertId ? { ...a, isRead: true } : a
    ));
  };

  if (loading) {
    return (
      <div className="alerts-widget">
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="alert-skeleton p-3 border rounded">
              <Skeleton width="70%" height="1rem" className="mb-2" />
              <Skeleton width="90%" height="0.8rem" className="mb-1" />
              <Skeleton width="30%" height="0.7rem" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-red-500">
        <i className="pi pi-exclamation-triangle mr-2" />
        {error}
      </div>
    );
  }

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="alerts-widget">
      <div className="alerts-header mb-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Active Alerts</span>
          {unreadCount > 0 && (
            <Badge value={unreadCount} severity="danger" />
          )}
        </div>
        <Button 
          icon="pi pi-check" 
          label="Clear All" 
          size="small" 
          className="p-button-text p-button-sm"
          onClick={() => setAlerts([])}
        />
      </div>

      <div className="alerts-list space-y-2">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`alert-item p-3 border rounded-lg ${
              !alert.isRead ? 'border-l-4 bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            style={{
              borderLeftColor: !alert.isRead ? 
                `var(--${getSeverityColor(alert.severity)}-color, #3b82f6)` : 
                undefined
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <i className={`${getTypeIcon(alert.type)} text-lg`} 
                   style={{ color: `var(--${getSeverityColor(alert.severity)}-color)` }} />
                <span className="font-semibold">{alert.title}</span>
                <Badge 
                  value={alert.severity.toUpperCase()} 
                  severity={getSeverityColor(alert.severity)}
                  className="text-xs"
                />
              </div>
              <Button
                icon="pi pi-times"
                className="p-button-text p-button-sm p-button-rounded"
                onClick={() => handleDismiss(alert.id)}
              />
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {alert.message}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                <i className="pi pi-clock mr-1" />
                {alert.timestamp}
              </span>
              {!alert.isRead && (
                <Button
                  label="Mark as read"
                  className="p-button-text p-button-sm"
                  onClick={() => handleMarkAsRead(alert.id)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <i className="pi pi-check-circle text-4xl mb-2" />
          <p>No active alerts</p>
          <p className="text-sm">All systems operational</p>
        </div>
      )}
    </div>
  );
};

export default AlertsWidget;