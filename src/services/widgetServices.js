// Widget API Services - Centralized API calls for dashboard widgets
import axios from 'axios';
import { getApiUrl } from '../utils/envCheck';

const API_BASE_URL = getApiUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // localStorage.removeItem('token');
      // window.location.href = '/login/login';
    }
    return Promise.reject(error);
  }
);

// Cache implementation
class WidgetCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute default
  }

  generateKey(endpoint, params) {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  get(endpoint, params) {
    const key = this.generateKey(endpoint, params);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    return null;
  }

  set(endpoint, params, data) {
    const key = this.generateKey(endpoint, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(endpoint = null) {
    if (endpoint) {
      // Clear specific endpoint cache
      for (const [key] of this.cache) {
        if (key.startsWith(endpoint)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }
}

const widgetCache = new WidgetCache();

// Last Orders Widget Service
export const lastOrdersService = {
  async fetchRecentOrders(params = {}) {
    const cacheKey = '/orders/recent';
    const cached = widgetCache.get(cacheKey, params);
    if (cached) return cached;

    try {
      const response = await api.get('/widget-data/recent-orders', { params ,headers: token ? { Authorization: `Bearer ${token}` } : {}});
      widgetCache.set(cacheKey, params, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  }
};

// Recent Transactions Widget Service
export const recentTransactionsService = {
  async fetchRecentTransactions(params = {}) {
    const cacheKey = '/transactions/recent';
    const cached = widgetCache.get(cacheKey, params);
    if (cached) return cached;

    try {
      const response = await api.get(`${baseURL}/widget-data/recent-transactions`, { params,headers: token ? { Authorization: `Bearer ${token}` } : {} });
      widgetCache.set(cacheKey, params, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  },

  async sendInvoiceReminder(invoiceId) {
    try {
      const response = await api.post(`${baseURL}/invoices/${invoiceId}/reminder`);
      widgetCache.clear('/transactions/recent');
      return response.data;
    } catch (error) {
      console.error('Error sending invoice reminder:', error);
      throw error;
    }
  },

  async retryPayment(paymentId) {
    try {
      const response = await api.post(`${baseURL}/payments/${paymentId}/retry`);
      widgetCache.clear('/transactions/recent');
      return response.data;
    } catch (error) {
      console.error('Error retrying payment:', error);
      throw error;
    }
  },

  async downloadInvoice(invoiceId) {
    try {
      const response = await api.get(`${baseURL}/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  }
};

// Today's Deliveries Widget Service
export const todaysDeliveriesService = {
  async fetchTodaysRoutes(params = {}) {
    const cacheKey = '/routes/today';
    const cached = widgetCache.get(cacheKey, params);
    if (cached) return cached;

    try {
      const response = await api.get(`${baseURL}/widget-data/todays-deliveries`, { params });
      widgetCache.set(cacheKey, params, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s routes:', error);
      throw error;
    }
  },

  async updateRouteStatus(routeId, status) {
    try {
      const response = await api.patch(`${baseURL}/routes/${routeId}/status`, { status });
      widgetCache.clear('/routes/today');
      return response.data;
    } catch (error) {
      console.error('Error updating route status:', error);
      throw error;
    }
  }
};

// Assets Maintenance Widget Service
export const assetsMaintenanceService = {
  async fetchMaintenanceAssets(params = {}) {
    const cacheKey = '/assets/maintenance';
    const cached = widgetCache.get(cacheKey, params);
    if (cached) return cached;

    try {
      const response = await api.get('/widget-data/assets-maintenance', { params });
      widgetCache.set(cacheKey, params, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance assets:', error);
      throw error;
    }
  },

  async addMaintenanceNote(maintenanceId, note) {
    try {
      const response = await api.post(`/maintenance/${maintenanceId}/notes`, { note });
      widgetCache.clear('/assets/maintenance');
      return response.data;
    } catch (error) {
      console.error('Error adding maintenance note:', error);
      throw error;
    }
  },

  async updateMaintenanceProgress(maintenanceId, progress) {
    try {
      const response = await api.patch(`/maintenance/${maintenanceId}/progress`, { progress });
      widgetCache.clear('/assets/maintenance');
      return response.data;
    } catch (error) {
      console.error('Error updating maintenance progress:', error);
      throw error;
    }
  }
};

// Overdue Rentals Widget Service
export const overdueRentalsService = {
  async fetchOverdueRentals(params = {}) {
    const cacheKey = '/rentals/overdue';
    const cached = widgetCache.get(cacheKey, params);
    if (cached) return cached;

    try {
      const response = await api.get('/widget-data/overdue-rentals', { params });
      widgetCache.set(cacheKey, params, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue rentals:', error);
      throw error;
    }
  },

  async sendRentalReminder(rentalId, method = 'email') {
    try {
      const response = await api.post(`/rentals/${rentalId}/reminder`, { method });
      widgetCache.clear('/rentals/overdue');
      return response.data;
    } catch (error) {
      console.error('Error sending rental reminder:', error);
      throw error;
    }
  },

  async sendBulkReminders(rentalIds, method = 'email') {
    try {
      const response = await api.post('/rentals/bulk-reminders', { 
        rentalIds, 
        method 
      });
      widgetCache.clear('/rentals/overdue');
      return response.data;
    } catch (error) {
      console.error('Error sending bulk reminders:', error);
      throw error;
    }
  },

  async createReturnJob(rentalId) {
    try {
      const response = await api.post('/jobs', {
        type: 'collection',
        rentalId,
        priority: 'high'
      });
      widgetCache.clear('/rentals/overdue');
      return response.data;
    } catch (error) {
      console.error('Error creating return job:', error);
      throw error;
    }
  }
};

// Fleet Utilization Widget Service
export const fleetUtilizationService = {
  async fetchFleetUtilization(params = {}) {
    const cacheKey = '/analytics/fleet-utilization';
    const cached = widgetCache.get(cacheKey, params);
    if (cached) return cached;

    try {
      const response = await api.get('/widget-data/fleet-utilization', { params });
      widgetCache.set(cacheKey, params, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching fleet utilization:', error);
      throw error;
    }
  },

  async fetchCategoryBreakdown(params = {}) {
    const cacheKey = '/analytics/category-breakdown';
    const cached = widgetCache.get(cacheKey, params);
    if (cached) return cached;

    try {
      const response = await api.get('/widget-data/category-breakdown', { params });
      widgetCache.set(cacheKey, params, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      throw error;
    }
  }
};

// Widget refresh service
export const widgetRefreshService = {
  refreshIntervals: new Map(),

  setupRefresh(widgetId, refreshFunction, interval = 300000) {
    // Clear existing interval if any
    this.clearRefresh(widgetId);
    
    // Set up new interval
    const intervalId = setInterval(refreshFunction, interval);
    this.refreshIntervals.set(widgetId, intervalId);
  },

  clearRefresh(widgetId) {
    const intervalId = this.refreshIntervals.get(widgetId);
    if (intervalId) {
      clearInterval(intervalId);
      this.refreshIntervals.delete(widgetId);
    }
  },

  clearAllRefreshes() {
    for (const [widgetId, intervalId] of this.refreshIntervals) {
      clearInterval(intervalId);
    }
    this.refreshIntervals.clear();
  }
};

// Export cache control functions
export const cacheControl = {
  clearCache: (endpoint) => widgetCache.clear(endpoint),
  clearAllCache: () => widgetCache.clear(),
  setCacheTimeout: (timeout) => { widgetCache.cacheTimeout = timeout; }
};

// Utility function to handle API errors
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || error.response.data?.error || defaultMessage;
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Something else happened
    return error.message || defaultMessage;
  }
};

// Export all services
export default {
  lastOrders: lastOrdersService,
  recentTransactions: recentTransactionsService,
  todaysDeliveries: todaysDeliveriesService,
  assetsMaintenance: assetsMaintenanceService,
  overdueRentals: overdueRentalsService,
  fleetUtilization: fleetUtilizationService,
  refresh: widgetRefreshService,
  cache: cacheControl,
  handleError: handleApiError
};