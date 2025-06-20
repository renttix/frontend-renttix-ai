// Widget Registry - Central export for all dashboard widgets
import { lazy } from 'react';

// Lazy load widgets for better performance
const CalendarWidget = lazy(() => import('./CalendarWidget'));
const LastOrdersWidget = lazy(() => import('./LastOrdersWidget'));
const RecentTransactionsWidget = lazy(() => import('./RecentTransactionsWidget'));
const TodaysDeliveriesWidget = lazy(() => import('./TodaysDeliveriesWidget'));
const AssetsMaintenanceWidget = lazy(() => import('./AssetsMaintenanceWidget'));
const OverdueRentalsWidget = lazy(() => import('./OverdueRentalsWidget'));
const FleetUtilizationWidget = lazy(() => import('./FleetUtilizationWidget'));
const RecurringContractsWidget = lazy(() => import('./RecurringContractsWidget'));
const DraftOrdersWidget = lazy(() => import('./DraftOrdersWidget'));
const CustomerMessagesWidget = lazy(() => import('./CustomerMessagesWidget'));
const InvoiceRunSummaryWidget = lazy(() => import('./InvoiceRunSummaryWidget'));
const StatsWidget = lazy(() => import('./StatsWidget'));
const TasksWidget = lazy(() => import('./TasksWidget'));
const AlertsWidget = lazy(() => import('./AlertsWidget'));

// Widget type to component mapping
export const widgetComponents = {
  'calendar': CalendarWidget,
  'last-orders': LastOrdersWidget,
  'recent-transactions': RecentTransactionsWidget,
  'todays-deliveries': TodaysDeliveriesWidget,
  'assets-maintenance': AssetsMaintenanceWidget,
  'overdue-rentals': OverdueRentalsWidget,
  'fleet-utilization': FleetUtilizationWidget,
  'recurring-contracts': RecurringContractsWidget,
  'draft-orders': DraftOrdersWidget,
  'customer-messages': CustomerMessagesWidget,
  'invoice-run-summary': InvoiceRunSummaryWidget,
  'stats': StatsWidget,
  'tasks': TasksWidget,
  'alerts': AlertsWidget,
  
  // Legacy widget types for backward compatibility
  'revenue-overview': FleetUtilizationWidget, // Maps to fleet utilization
  'active-orders': LastOrdersWidget,
  'asset-utilization': FleetUtilizationWidget,
  'upcoming-deliveries': TodaysDeliveriesWidget,
  'maintenance-alerts': AssetsMaintenanceWidget,
  'customer-activity': LastOrdersWidget,
  'inventory-status': AssetsMaintenanceWidget,
  'recent-payments': RecentTransactionsWidget
};

// Widget metadata for widget selector/catalog
export const widgetMetadata = {
  'calendar': {
    id: 'calendar',
    name: 'Rental Calendar',
    description: 'View and manage rental jobs across routes and dates',
    icon: 'pi-calendar',
    category: 'operations',
    minWidth: 8,
    maxWidth: 12,
    defaultWidth: 12,
    configurable: true,
    settings: {
      viewMode: { type: 'select', options: ['week', 'month'], default: 'week' },
      showUnassigned: { type: 'boolean', default: true },
      refreshInterval: { type: 'number', default: 60000 }
    }
  },
  'last-orders': {
    id: 'last-orders',
    name: 'Last Orders',
    description: 'Display the most recent orders created',
    icon: 'pi-shopping-cart',
    category: 'operations',
    minWidth: 6,
    maxWidth: 12,
    defaultWidth: 6,
    configurable: true,
    settings: {
      limit: { type: 'number', default: 10, min: 5, max: 50 },
      userId: { type: 'user-select', optional: true },
      depotId: { type: 'depot-select', optional: true },
      refreshInterval: { type: 'number', default: 300000 }
    }
  },
  'recent-transactions': {
    id: 'recent-transactions',
    name: 'Recent Transactions',
    description: 'Show recent invoices, payments, and failed charges',
    icon: 'pi-wallet',
    category: 'financial',
    minWidth: 6,
    maxWidth: 12,
    defaultWidth: 8,
    configurable: true,
    settings: {
      limit: { type: 'number', default: 20, min: 10, max: 100 },
      types: { 
        type: 'multi-select', 
        options: ['invoice', 'payment', 'refund', 'failed_charge', 'credit_note'],
        default: ['invoice', 'payment', 'failed_charge']
      },
      refreshInterval: { type: 'number', default: 300000 }
    }
  },
  'todays-deliveries': {
    id: 'todays-deliveries',
    name: "Today's Deliveries & Collections",
    description: 'Snapshot of today\'s deliveries and collections by route',
    icon: 'pi-truck',
    category: 'operations',
    minWidth: 6,
    maxWidth: 12,
    defaultWidth: 8,
    configurable: true,
    settings: {
      depotId: { type: 'depot-select', optional: true },
      includeCompleted: { type: 'boolean', default: true },
      refreshInterval: { type: 'number', default: 60000 }
    }
  },
  'assets-maintenance': {
    id: 'assets-maintenance',
    name: 'Assets in Maintenance',
    description: 'List items currently unavailable due to maintenance',
    icon: 'pi-wrench',
    category: 'operations',
    minWidth: 6,
    maxWidth: 12,
    defaultWidth: 8,
    configurable: true,
    settings: {
      depotId: { type: 'depot-select', optional: true },
      includeScheduled: { type: 'boolean', default: false },
      refreshInterval: { type: 'number', default: 300000 }
    }
  },
  'overdue-rentals': {
    id: 'overdue-rentals',
    name: 'Overdue Rentals',
    description: 'Display rentals past their return date',
    icon: 'pi-exclamation-triangle',
    category: 'operations',
    minWidth: 8,
    maxWidth: 12,
    defaultWidth: 10,
    configurable: true,
    settings: {
      depotId: { type: 'depot-select', optional: true },
      minDaysOverdue: { type: 'number', default: 0, min: 0 },
      includeGracePeriod: { type: 'boolean', default: false },
      refreshInterval: { type: 'number', default: 300000 }
    }
  },
  'fleet-utilization': {
    id: 'fleet-utilization',
    name: 'Fleet Utilization',
    description: 'Key metrics and trends for fleet performance',
    icon: 'pi-percentage',
    category: 'analytics',
    minWidth: 6,
    maxWidth: 12,
    defaultWidth: 12,
    configurable: true,
    settings: {
      defaultTimeRange: { 
        type: 'select', 
        options: ['1d', '7d', '30d', '90d'], 
        default: '7d' 
      },
      depotId: { type: 'depot-select', optional: true },
      categoryId: { type: 'category-select', optional: true },
      refreshInterval: { type: 'number', default: 300000 }
    }
  },
  'recurring-contracts': {
    id: 'recurring-contracts',
    name: 'Recurring Contracts',
    description: 'Show upcoming recurring order instances and contracts due for renewal',
    icon: 'pi-replay',
    category: 'operations',
    minWidth: 8,
    maxWidth: 12,
    defaultWidth: 10,
    configurable: true,
    settings: {
      limit: { type: 'number', default: 20, min: 10, max: 100 },
      depotId: { type: 'depot-select', optional: true },
      daysAhead: { type: 'number', default: 30, min: 7, max: 90 },
      refreshInterval: { type: 'number', default: 300000 }
    }
  },
  'draft-orders': {
    id: 'draft-orders',
    name: 'Draft Orders',
    description: 'Display saved but not submitted orders with age indicators',
    icon: 'pi-file-edit',
    category: 'operations',
    minWidth: 8,
    maxWidth: 12,
    defaultWidth: 10,
    configurable: true,
    settings: {
      limit: { type: 'number', default: 20, min: 10, max: 50 },
      userId: { type: 'user-select', optional: true },
      depotId: { type: 'depot-select', optional: true },
      maxAge: { type: 'number', default: 30, min: 7, max: 90 },
      refreshInterval: { type: 'number', default: 300000 }
    }
  },
  'customer-messages': {
    id: 'customer-messages',
    name: 'Customer Messages',
    description: 'Show new or unresolved support messages with quick reply functionality',
    icon: 'pi-comments',
    category: 'operations',
    minWidth: 8,
    maxWidth: 12,
    defaultWidth: 12,
    configurable: true,
    settings: {
      limit: { type: 'number', default: 50, min: 20, max: 100 },
      status: {
        type: 'select',
        options: ['unresolved', 'all', 'urgent'],
        default: 'unresolved'
      },
      priority: {
        type: 'multi-select',
        options: ['high', 'medium', 'low'],
        default: ['high', 'medium', 'low'],
        optional: true
      },
      channel: {
        type: 'multi-select',
        options: ['email', 'sms', 'whatsapp', 'phone', 'chat'],
        optional: true
      },
      refreshInterval: { type: 'number', default: 60000 }
    }
  },
  'invoice-run-summary': {
    id: 'invoice-run-summary',
    name: 'Invoice Run Summary',
    description: 'Display what\'s queued for billing with breakdown by type',
    icon: 'pi-file-excel',
    category: 'financial',
    minWidth: 6,
    maxWidth: 12,
    defaultWidth: 12,
    configurable: true,
    settings: {
      refreshInterval: { type: 'number', default: 300000 }
    }
  },
  'stats': {
    id: 'stats',
    name: 'Key Statistics',
    description: 'Display key business metrics and performance indicators',
    icon: 'pi-chart-bar',
    category: 'overview',
    minWidth: 12,
    maxWidth: 12,
    defaultWidth: 12,
    configurable: true,
    settings: {
      period: {
        type: 'select',
        options: ['1d', '7d', '30d', '90d'],
        default: '7d'
      },
      metrics: {
        type: 'multi-select',
        options: ['revenue', 'orders', 'utilization', 'customers', 'maintenance'],
        default: ['revenue', 'orders', 'utilization', 'customers']
      },
      showPeriodSelector: { type: 'boolean', default: true },
      refreshInterval: { type: 'number', default: 300000 }
    }
  },
  'tasks': {
    id: 'tasks',
    name: 'Tasks',
    description: 'View and manage daily tasks and assignments',
    icon: 'pi-check-square',
    category: 'operations',
    minWidth: 6,
    maxWidth: 12,
    defaultWidth: 6,
    configurable: true,
    settings: {
      status: {
        type: 'select',
        options: ['all', 'pending', 'in-progress', 'completed'],
        default: 'pending'
      },
      priority: {
        type: 'multi-select',
        options: ['high', 'medium', 'low'],
        optional: true
      },
      limit: { type: 'number', default: 10, min: 5, max: 50 },
      refreshInterval: { type: 'number', default: 60000 }
    }
  },
  'alerts': {
    id: 'alerts',
    name: 'System Alerts',
    description: 'Important notifications and system alerts',
    icon: 'pi-bell',
    category: 'overview',
    minWidth: 6,
    maxWidth: 12,
    defaultWidth: 6,
    configurable: true,
    settings: {
      types: {
        type: 'multi-select',
        options: ['maintenance', 'overdue', 'low-stock', 'payment', 'system'],
        default: ['all']
      },
      severity: {
        type: 'multi-select',
        options: ['high', 'medium', 'low', 'info'],
        optional: true
      },
      limit: { type: 'number', default: 10, min: 5, max: 50 },
      refreshInterval: { type: 'number', default: 30000 }
    }
  }
};

// Widget categories for grouping
export const widgetCategories = {
  operations: {
    name: 'Operations',
    icon: 'pi-cog',
    description: 'Widgets for managing daily operations'
  },
  financial: {
    name: 'Financial',
    icon: 'pi-dollar',
    description: 'Financial and transaction widgets'
  },
  analytics: {
    name: 'Analytics',
    icon: 'pi-chart-line',
    description: 'Analytics and reporting widgets'
  },
  overview: {
    name: 'Overview',
    icon: 'pi-th-large',
    description: 'High-level overview widgets'
  }
};

// Helper function to get widget component by type
export const getWidgetComponent = (type) => {
  return widgetComponents[type] || null;
};

// Helper function to get widget metadata by type
export const getWidgetMetadata = (type) => {
  return widgetMetadata[type] || null;
};

// Helper function to get widgets by category
export const getWidgetsByCategory = (category) => {
  return Object.entries(widgetMetadata)
    .filter(([_, metadata]) => metadata.category === category)
    .map(([type, metadata]) => ({ type, ...metadata }));
};

// Helper function to validate widget configuration
export const validateWidgetConfig = (type, config) => {
  const metadata = getWidgetMetadata(type);
  if (!metadata || !metadata.settings) return true;

  const errors = [];
  
  Object.entries(metadata.settings).forEach(([key, setting]) => {
    const value = config[key];
    
    // Check required fields
    if (!setting.optional && value === undefined) {
      errors.push(`${key} is required`);
      return;
    }
    
    // Skip optional empty fields
    if (setting.optional && value === undefined) return;
    
    // Validate by type
    switch (setting.type) {
      case 'number':
        if (typeof value !== 'number') {
          errors.push(`${key} must be a number`);
        } else {
          if (setting.min !== undefined && value < setting.min) {
            errors.push(`${key} must be at least ${setting.min}`);
          }
          if (setting.max !== undefined && value > setting.max) {
            errors.push(`${key} must be at most ${setting.max}`);
          }
        }
        break;
        
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${key} must be a boolean`);
        }
        break;
        
      case 'select':
        if (!setting.options.includes(value)) {
          errors.push(`${key} must be one of: ${setting.options.join(', ')}`);
        }
        break;
        
      case 'multi-select':
        if (!Array.isArray(value)) {
          errors.push(`${key} must be an array`);
        } else {
          const invalidOptions = value.filter(v => !setting.options.includes(v));
          if (invalidOptions.length > 0) {
            errors.push(`Invalid options for ${key}: ${invalidOptions.join(', ')}`);
          }
        }
        break;
    }
  });
  
  return errors.length === 0 ? true : errors;
};

// Export all widgets for direct import if needed
export {
  CalendarWidget,
  LastOrdersWidget,
  RecentTransactionsWidget,
  TodaysDeliveriesWidget,
  AssetsMaintenanceWidget,
  OverdueRentalsWidget,
  FleetUtilizationWidget,
  RecurringContractsWidget,
  DraftOrdersWidget,
  CustomerMessagesWidget,
  InvoiceRunSummaryWidget,
  StatsWidget,
  TasksWidget,
  AlertsWidget
};