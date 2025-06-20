# Dashboard Widgets Documentation

This document provides comprehensive information about all available dashboard widgets in the Renttix system.

## Table of Contents

1. [Overview](#overview)
2. [Available Widgets](#available-widgets)
3. [Widget Configuration](#widget-configuration)
4. [Creating Custom Widgets](#creating-custom-widgets)
5. [API Requirements](#api-requirements)
6. [Performance Optimization](#performance-optimization)

## Overview

The Renttix dashboard uses a modular widget system that allows users to customize their dashboard layout with various widgets. Each widget is a self-contained component that fetches and displays specific data.

### Key Features

- **Lazy Loading**: All widgets are lazy-loaded for better performance
- **Responsive Design**: Widgets adapt to different screen sizes
- **Configurable**: Each widget has customizable settings
- **Real-time Updates**: Widgets can refresh data at specified intervals
- **Error Handling**: Built-in error states and retry mechanisms
- **Loading States**: Skeleton loaders for better UX

## Available Widgets

### 1. Calendar Widget (`calendar`)
**Purpose**: View and manage rental jobs across routes and dates

**Features**:
- Week/Month view modes
- Drag-and-drop job management
- Route-based organization
- Unassigned jobs section

**Configuration**:
```javascript
{
  viewMode: 'week' | 'month',
  showUnassigned: boolean,
  refreshInterval: number (ms)
}
```

### 2. Last Orders Widget (`last-orders`)
**Purpose**: Display the most recent orders created

**Features**:
- Order status indicators
- Customer information
- Quick view actions
- Pagination support

**Configuration**:
```javascript
{
  limit: number (5-50),
  userId: string (optional),
  depotId: string (optional),
  refreshInterval: number (ms)
}
```

### 3. Recent Transactions Widget (`recent-transactions`)
**Purpose**: Show recent invoices, payments, and failed charges

**Features**:
- Transaction type filtering
- Amount formatting
- Status indicators
- Expandable details

**Configuration**:
```javascript
{
  limit: number (10-100),
  types: array ['invoice', 'payment', 'refund', 'failed_charge', 'credit_note'],
  refreshInterval: number (ms)
}
```

### 4. Today's Deliveries Widget (`todays-deliveries`)
**Purpose**: Snapshot of today's deliveries and collections by route

**Features**:
- Route grouping
- Progress indicators
- Driver assignments
- Completion status

**Configuration**:
```javascript
{
  depotId: string (optional),
  includeCompleted: boolean,
  refreshInterval: number (ms)
}
```

### 5. Assets Maintenance Widget (`assets-maintenance`)
**Purpose**: List items currently unavailable due to maintenance

**Features**:
- Maintenance type indicators
- Expected return dates
- Asset details
- Quick actions

**Configuration**:
```javascript
{
  depotId: string (optional),
  includeScheduled: boolean,
  refreshInterval: number (ms)
}
```

### 6. Overdue Rentals Widget (`overdue-rentals`)
**Purpose**: Display rentals past their return date

**Features**:
- Days overdue calculation
- Customer contact info
- Quick actions for follow-up
- Grace period support

**Configuration**:
```javascript
{
  depotId: string (optional),
  minDaysOverdue: number,
  includeGracePeriod: boolean,
  refreshInterval: number (ms)
}
```

### 7. Fleet Utilization Widget (`fleet-utilization`)
**Purpose**: Key metrics and trends for fleet performance

**Features**:
- Utilization charts
- Time range selection
- Category filtering
- Trend indicators

**Configuration**:
```javascript
{
  defaultTimeRange: '1d' | '7d' | '30d' | '90d',
  depotId: string (optional),
  categoryId: string (optional),
  refreshInterval: number (ms)
}
```

### 8. Recurring Contracts Widget (`recurring-contracts`)
**Purpose**: Show upcoming recurring order instances and contracts due for renewal

**Features**:
- Next occurrence dates
- Renewal indicators
- Frequency display
- Quick instance creation

**Configuration**:
```javascript
{
  limit: number (10-100),
  depotId: string (optional),
  daysAhead: number (7-90),
  refreshInterval: number (ms)
}
```

### 9. Draft Orders Widget (`draft-orders`)
**Purpose**: Display saved but not submitted orders with age indicators

**Features**:
- Age highlighting
- Created by information
- Quick submit/delete actions
- Last modified tracking

**Configuration**:
```javascript
{
  limit: number (10-50),
  userId: string (optional),
  depotId: string (optional),
  maxAge: number (days),
  refreshInterval: number (ms)
}
```

### 10. Customer Messages Widget (`customer-messages`)
**Purpose**: Show new or unresolved support messages with quick reply functionality

**Features**:
- Multi-channel support (email/SMS/WhatsApp)
- Priority indicators
- Quick reply dialog
- Conversation history
- Unread badges

**Configuration**:
```javascript
{
  limit: number (20-100),
  status: 'unresolved' | 'all' | 'urgent',
  priority: array ['high', 'medium', 'low'] (optional),
  channel: array ['email', 'sms', 'whatsapp', 'phone', 'chat'] (optional),
  refreshInterval: number (ms)
}
```

### 11. Invoice Run Summary Widget (`invoice-run-summary`)
**Purpose**: Display what's queued for billing with breakdown by type

**Features**:
- Invoice type breakdown chart
- Total value calculation
- Run now functionality
- Warning indicators
- Progress tracking

**Configuration**:
```javascript
{
  refreshInterval: number (ms)
}
```

## Widget Configuration

### Adding a Widget to Dashboard

```javascript
// In widget registry (index.js)
const NewWidget = lazy(() => import('./NewWidget'));

export const widgetComponents = {
  'new-widget': NewWidget,
  // ... other widgets
};

export const widgetMetadata = {
  'new-widget': {
    id: 'new-widget',
    name: 'New Widget',
    description: 'Description of the widget',
    icon: 'pi-icon-name',
    category: 'operations' | 'financial' | 'analytics' | 'overview',
    minWidth: 4,
    maxWidth: 12,
    defaultWidth: 6,
    configurable: true,
    settings: {
      // Define configurable settings
    }
  }
};
```

### Widget Layout Configuration

```javascript
{
  type: 'widget-type',
  visible: boolean,
  collapsed: boolean,
  position: {
    col: number (0-11),
    row: number,
    width: number (1-12)
  },
  config: {
    // Widget-specific configuration
  }
}
```

## Creating Custom Widgets

### Basic Widget Structure

```javascript
import React, { useState, useEffect } from 'react';
import BaseWidget from '../BaseWidget';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const CustomWidget = ({ widgetId, config = {} }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, config.refreshInterval || 300000);
    return () => clearInterval(interval);
  }, [config]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch data from API
      const response = await fetch('/api/widget-data/custom');
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseWidget
      widgetId={widgetId}
      title="Custom Widget"
      icon="custom-icon"
      loading={loading}
      error={error}
      minWidth={6}
      maxWidth={12}
    >
      {/* Widget content */}
    </BaseWidget>
  );
};

export default CustomWidget;
```

## API Requirements

### Widget Data Endpoints

All widget data endpoints should follow this pattern:

```
GET /api/widget-data/{widget-type}
```

### Standard Query Parameters

- `limit`: Number of records to return
- `depotId`: Filter by depot (if applicable)
- `userId`: Filter by user (if applicable)
- `startDate`: Date range start
- `endDate`: Date range end

### Response Format

```javascript
{
  success: true,
  data: {
    // Widget-specific data
  },
  meta: {
    total: number,
    page: number,
    limit: number
  }
}
```

### Error Response

```javascript
{
  success: false,
  message: "Error message",
  error: "Detailed error information"
}
```

## Performance Optimization

### 1. Lazy Loading
All widgets are lazy-loaded using React.lazy() to reduce initial bundle size.

### 2. Data Caching
Implement client-side caching for frequently accessed data:

```javascript
const getCachedData = (key) => {
  const cached = localStorage.getItem(`widget_${key}`);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
};
```

### 3. Debouncing
Debounce user interactions to prevent excessive API calls:

```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce((term) => {
  fetchSearchResults(term);
}, 300);
```

### 4. Virtual Scrolling
For widgets with large datasets, use virtual scrolling:

```javascript
<DataTable
  value={data}
  virtualScrollerOptions={{ itemSize: 46 }}
  scrollHeight="400px"
/>
```

### 5. Memoization
Use React.memo and useMemo for expensive computations:

```javascript
const MemoizedComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);
  
  return <div>{processedData}</div>;
});
```

### 6. Error Boundaries
Implement error boundaries to prevent widget failures from crashing the dashboard:

```javascript
class WidgetErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Widget failed to load</div>;
    }
    return this.props.children;
  }
}
```

## Best Practices

1. **Always handle loading and error states** - Use skeleton loaders and error messages
2. **Implement proper cleanup** - Clear intervals and cancel requests on unmount
3. **Use semantic HTML** - Ensure accessibility with proper ARIA labels
4. **Follow responsive design** - Test widgets on different screen sizes
5. **Optimize re-renders** - Use React.memo and proper dependency arrays
6. **Document configuration options** - Clearly document all available settings
7. **Test error scenarios** - Handle network failures gracefully
8. **Use TypeScript** - Add type definitions for better developer experience
9. **Monitor performance** - Track widget load times and optimize as needed
10. **Version your APIs** - Maintain backward compatibility when updating endpoints