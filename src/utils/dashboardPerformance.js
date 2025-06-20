/**
 * Dashboard Performance Monitor
 * Tracks and logs performance metrics for dashboard widgets and operations
 */

class DashboardPerformanceMonitor {
  constructor() {
    this.metrics = {
      widgetLoadTimes: new Map(),
      dragDropOperations: [],
      layoutSaves: [],
      apiCalls: new Map(),
      renderTimes: new Map(),
      errors: []
    };
    
    this.thresholds = {
      widgetLoadTime: 2000, // 2 seconds
      dragDropTime: 100, // 100ms
      layoutSaveTime: 1000, // 1 second
      apiCallTime: 3000, // 3 seconds
      renderTime: 50 // 50ms
    };
    
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Start tracking a widget load
   */
  startWidgetLoad(widgetId, widgetType) {
    if (!this.isEnabled) return;
    
    this.metrics.widgetLoadTimes.set(widgetId, {
      type: widgetType,
      startTime: performance.now(),
      status: 'loading'
    });
  }

  /**
   * End tracking a widget load
   */
  endWidgetLoad(widgetId, success = true, error = null) {
    if (!this.isEnabled) return;
    
    const widgetMetric = this.metrics.widgetLoadTimes.get(widgetId);
    if (!widgetMetric) return;
    
    const endTime = performance.now();
    const loadTime = endTime - widgetMetric.startTime;
    
    widgetMetric.endTime = endTime;
    widgetMetric.loadTime = loadTime;
    widgetMetric.status = success ? 'loaded' : 'failed';
    widgetMetric.error = error;
    
    // Log if exceeds threshold
    if (loadTime > this.thresholds.widgetLoadTime) {
      console.warn(`[Dashboard Performance] Widget ${widgetId} (${widgetMetric.type}) took ${loadTime.toFixed(2)}ms to load (threshold: ${this.thresholds.widgetLoadTime}ms)`);
    }
    
    // Track errors
    if (!success) {
      this.trackError('widget_load', widgetId, error);
    }
  }

  /**
   * Track drag and drop operations
   */
  trackDragDrop(operation, duration, details = {}) {
    if (!this.isEnabled) return;
    
    const metric = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...details
    };
    
    this.metrics.dragDropOperations.push(metric);
    
    // Keep only last 100 operations
    if (this.metrics.dragDropOperations.length > 100) {
      this.metrics.dragDropOperations.shift();
    }
    
    // Log if exceeds threshold
    if (duration > this.thresholds.dragDropTime) {
      console.warn(`[Dashboard Performance] Drag-drop operation '${operation}' took ${duration.toFixed(2)}ms (threshold: ${this.thresholds.dragDropTime}ms)`);
    }
  }

  /**
   * Track layout save operations
   */
  trackLayoutSave(duration, success = true, error = null) {
    if (!this.isEnabled) return;
    
    const metric = {
      duration,
      success,
      error,
      timestamp: new Date().toISOString()
    };
    
    this.metrics.layoutSaves.push(metric);
    
    // Keep only last 50 saves
    if (this.metrics.layoutSaves.length > 50) {
      this.metrics.layoutSaves.shift();
    }
    
    // Log if exceeds threshold
    if (duration > this.thresholds.layoutSaveTime) {
      console.warn(`[Dashboard Performance] Layout save took ${duration.toFixed(2)}ms (threshold: ${this.thresholds.layoutSaveTime}ms)`);
    }
    
    if (!success) {
      this.trackError('layout_save', 'save_operation', error);
    }
  }

  /**
   * Track API calls
   */
  startApiCall(callId, endpoint, method = 'GET') {
    if (!this.isEnabled) return;
    
    this.metrics.apiCalls.set(callId, {
      endpoint,
      method,
      startTime: performance.now(),
      status: 'pending'
    });
  }

  /**
   * End tracking an API call
   */
  endApiCall(callId, success = true, statusCode = null, error = null) {
    if (!this.isEnabled) return;
    
    const apiMetric = this.metrics.apiCalls.get(callId);
    if (!apiMetric) return;
    
    const endTime = performance.now();
    const duration = endTime - apiMetric.startTime;
    
    apiMetric.endTime = endTime;
    apiMetric.duration = duration;
    apiMetric.status = success ? 'success' : 'failed';
    apiMetric.statusCode = statusCode;
    apiMetric.error = error;
    
    // Log if exceeds threshold
    if (duration > this.thresholds.apiCallTime) {
      console.warn(`[Dashboard Performance] API call to ${apiMetric.endpoint} took ${duration.toFixed(2)}ms (threshold: ${this.thresholds.apiCallTime}ms)`);
    }
    
    if (!success) {
      this.trackError('api_call', apiMetric.endpoint, error);
    }
  }

  /**
   * Track component render times
   */
  trackRender(componentName, duration) {
    if (!this.isEnabled) return;
    
    if (!this.metrics.renderTimes.has(componentName)) {
      this.metrics.renderTimes.set(componentName, []);
    }
    
    const renders = this.metrics.renderTimes.get(componentName);
    renders.push({
      duration,
      timestamp: performance.now()
    });
    
    // Keep only last 100 renders per component
    if (renders.length > 100) {
      renders.shift();
    }
    
    // Log if exceeds threshold
    if (duration > this.thresholds.renderTime) {
      console.warn(`[Dashboard Performance] Component '${componentName}' render took ${duration.toFixed(2)}ms (threshold: ${this.thresholds.renderTime}ms)`);
    }
  }

  /**
   * Track errors
   */
  trackError(type, context, error) {
    if (!this.isEnabled) return;
    
    const errorMetric = {
      type,
      context,
      error: error?.message || error,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    };
    
    this.metrics.errors.push(errorMetric);
    
    // Keep only last 50 errors
    if (this.metrics.errors.length > 50) {
      this.metrics.errors.shift();
    }
    
    console.error(`[Dashboard Performance] Error in ${type} (${context}):`, error);
  }

  /**
   * Get performance summary
   */
  getSummary() {
    if (!this.isEnabled) return null;
    
    const widgetLoadStats = this.calculateStats(
      Array.from(this.metrics.widgetLoadTimes.values())
        .filter(m => m.loadTime)
        .map(m => m.loadTime)
    );
    
    const dragDropStats = this.calculateStats(
      this.metrics.dragDropOperations.map(m => m.duration)
    );
    
    const layoutSaveStats = this.calculateStats(
      this.metrics.layoutSaves.map(m => m.duration)
    );
    
    const apiCallStats = this.calculateStats(
      Array.from(this.metrics.apiCalls.values())
        .filter(m => m.duration)
        .map(m => m.duration)
    );
    
    return {
      widgetLoad: {
        ...widgetLoadStats,
        totalWidgets: this.metrics.widgetLoadTimes.size,
        failedWidgets: Array.from(this.metrics.widgetLoadTimes.values())
          .filter(m => m.status === 'failed').length
      },
      dragDrop: {
        ...dragDropStats,
        totalOperations: this.metrics.dragDropOperations.length
      },
      layoutSave: {
        ...layoutSaveStats,
        totalSaves: this.metrics.layoutSaves.length,
        failedSaves: this.metrics.layoutSaves.filter(m => !m.success).length
      },
      apiCalls: {
        ...apiCallStats,
        totalCalls: this.metrics.apiCalls.size,
        failedCalls: Array.from(this.metrics.apiCalls.values())
          .filter(m => m.status === 'failed').length
      },
      errors: {
        total: this.metrics.errors.length,
        byType: this.groupBy(this.metrics.errors, 'type')
      }
    };
  }

  /**
   * Calculate statistics for a set of values
   */
  calculateStats(values) {
    if (!values.length) {
      return { avg: 0, min: 0, max: 0, median: 0 };
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      avg: sum / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)]
    };
  }

  /**
   * Group array by property
   */
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    }, {});
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    if (!this.isEnabled) return null;
    
    return {
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      rawMetrics: {
        widgetLoadTimes: Object.fromEntries(this.metrics.widgetLoadTimes),
        dragDropOperations: this.metrics.dragDropOperations,
        layoutSaves: this.metrics.layoutSaves,
        apiCalls: Object.fromEntries(this.metrics.apiCalls),
        renderTimes: Object.fromEntries(this.metrics.renderTimes),
        errors: this.metrics.errors
      }
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.widgetLoadTimes.clear();
    this.metrics.dragDropOperations = [];
    this.metrics.layoutSaves = [];
    this.metrics.apiCalls.clear();
    this.metrics.renderTimes.clear();
    this.metrics.errors = [];
  }

  /**
   * Log current performance summary to console
   */
  logSummary() {
    if (!this.isEnabled) return;
    
    const summary = this.getSummary();
    console.group('[Dashboard Performance Summary]');
    console.table({
      'Widget Load': {
        'Avg Time (ms)': summary.widgetLoad.avg.toFixed(2),
        'Max Time (ms)': summary.widgetLoad.max.toFixed(2),
        'Total Widgets': summary.widgetLoad.totalWidgets,
        'Failed': summary.widgetLoad.failedWidgets
      },
      'Drag & Drop': {
        'Avg Time (ms)': summary.dragDrop.avg.toFixed(2),
        'Max Time (ms)': summary.dragDrop.max.toFixed(2),
        'Total Operations': summary.dragDrop.totalOperations
      },
      'Layout Save': {
        'Avg Time (ms)': summary.layoutSave.avg.toFixed(2),
        'Max Time (ms)': summary.layoutSave.max.toFixed(2),
        'Total Saves': summary.layoutSave.totalSaves,
        'Failed': summary.layoutSave.failedSaves
      },
      'API Calls': {
        'Avg Time (ms)': summary.apiCalls.avg.toFixed(2),
        'Max Time (ms)': summary.apiCalls.max.toFixed(2),
        'Total Calls': summary.apiCalls.totalCalls,
        'Failed': summary.apiCalls.failedCalls
      }
    });
    console.log('Total Errors:', summary.errors.total);
    console.groupEnd();
  }
}

// Create singleton instance
const dashboardPerformance = new DashboardPerformanceMonitor();

// Export for use in components
export default dashboardPerformance;

// Export hook for React components
export const useDashboardPerformance = () => {
  return dashboardPerformance;
};

// Auto-log summary every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    dashboardPerformance.logSummary();
  }, 5 * 60 * 1000);
}