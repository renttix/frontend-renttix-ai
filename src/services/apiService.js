import axios from 'axios';
import Cookies from 'js-cookie';
import { BaseURL } from '../../utils/baseUrl';

// Create axios instance with default config
const api = axios.create({
  baseURL: BaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from cookies using js-cookie
    const token = Cookies.get('xpdx');
    console.log('[API Service] Request interceptor - Token from cookie:', token ? 'Present' : 'Missing');
    console.log('[API Service] Request URL:', config.url);
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
      console.log('[API Service] Authorization header set');
    }
    return config;
  },
  (error) => {
    console.error('[API Service] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // Clear cookies using js-cookie
      Cookies.remove('xpdx');
      Cookies.remove('xpdx_r');
      Cookies.remove('xpdx_s');
      
      // Get the company from the current URL or use a default
      const pathSegments = window.location.pathname.split('/');
      const company = pathSegments[1] || 'default';
      window.location.href = `/${company}/login`;
    }
    return Promise.reject(error);
  }
);

// Customer Intelligence APIs
export const customerIntelligenceAPI = {
  getCustomerIntelligence: (customerId) => 
    api.get(`/api/intelligence/customer/${customerId}`),
  
  getRepeatCustomerSuggestions: (customerId) =>
    api.get(`/api/intelligence/customer/${customerId}/suggestions`),
  
  getCustomerOrderHistory: (customerId, params) =>
    api.get(`/api/intelligence/customer/${customerId}/history`, { params }),
};

// Asset Availability APIs
export const assetAvailabilityAPI = {
  checkAvailability: (data) =>
    api.post('/api/assets/check-availability', data),
  
  checkBulkAvailability: (data) =>
    api.post('/api/assets/check-bulk-availability', data),
  
  assignBulkAssets: (data) =>
    api.post('/api/assets/assign-bulk', data),
  
  resolveConflict: (data) =>
    api.post('/api/assets/resolve-conflict', data),
  
  getAvailableAssets: (productId, params) =>
    api.get(`/api/assets/available/${productId}`, { params }),
  
  getAssetDetails: (assetId) =>
    api.get(`/api/assets/${assetId}`),
};

// Route Estimation APIs
export const routeEstimationAPI = {
  estimateRoute: (data) =>
    api.post('/api/routes/estimate', data),
  
  getDeliveryWindows: (params) =>
    api.get('/api/routes/delivery-windows', { params }),
  
  setupRecurringDelivery: (data) =>
    api.post('/api/routes/recurring-setup', data),
  
  optimizeRoute: (data) =>
    api.post('/api/routes/optimize', data),
  
  getRouteDetails: (routeId) =>
    api.get(`/api/routes/${routeId}`),
  
  getAvailableRoutes: (date, vendorId) =>
    api.get('/api/routes/available', { params: { date, vendorId } }),
};

// Address APIs
export const addressAPI = {
  geocodeAddress: (data) =>
    api.post('/api/address/geocode', data),
  
  validateAddress: (data) =>
    api.post('/api/address/validate', data),
  
  getAddressSuggestions: (query) =>
    api.get('/api/address/suggestions', { params: { query } }),
  
  reverseGeocode: (lat, lng) =>
    api.get('/api/address/reverse-geocode', { params: { lat, lng } }),
};

// Order APIs (Enhanced)
export const orderAPI = {
  createOrder: (data) =>
    api.post('/order/create', data),
  
  updateOrder: (orderId, data) =>
    api.put(`/order/update/${orderId}`, data),
  
  getOrder: (orderId) =>
    api.get(`/order/${orderId}`),
  
  getOrders: (params) =>
    api.get('/order', { params }),
  
  saveDraft: (data) =>
    api.post('/order/draft', data),
  
  getDraft: (draftId) =>
    api.get(`/order/draft/${draftId}`),
  
  deleteDraft: (draftId) =>
    api.delete(`/order/draft/${draftId}`),
  
  validateOrder: (data) =>
    api.post('/order/validate', data),
};

// Product APIs (Enhanced)
export const productAPI = {
  getProducts: (vendorId, params) =>
    api.get('/product', { params: { vendorId, ...params } }),
  
  getProduct: (productId) =>
    api.get(`/product/${productId}`),
  
  getProductAttachments: (productId) =>
    api.get(`/product/${productId}/attachments`),
  
  downloadAttachment: (attachmentId) =>
    api.get(`/api/products/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    }),
  
  getProductMaintenanceRules: (productId) =>
    api.get(`/product/${productId}/maintenance-rules`),
};

// Customer APIs
export const customerAPI = {
  getCustomers: (vendorId, params) =>
    api.get('/order/customer', { params: { vendorId, ...params } }),
  
  getCustomer: (customerId) =>
    api.get(`/order/customer/${customerId}`),
  
  createCustomer: (data) =>
    api.post('/order/customer', data),
  
  updateCustomer: (customerId, data) =>
    api.put(`/order/customer/${customerId}`, data),
};

// File Upload API
export const fileUploadAPI = {
  uploadFile: async (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    
    return api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadMultipleFiles: async (files, metadata = {}) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    
    return api.post('/api/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Dashboard APIs
export const dashboardAPI = {
  // Layout management
  getLayouts: () => {
    console.log('[Dashboard API] Fetching layouts from:', `${api.defaults.baseURL}/dashboard/layouts`);
    return api.get('/dashboard/layouts');
  },
  
  getLayout: (layoutId) =>
    api.get(`/dashboard/layouts/${layoutId}`),
  
  createLayout: (data) =>
    api.post('/dashboard/layouts', data),
  
  updateLayout: (layoutId, data) =>
    api.put(`/dashboard/layouts/${layoutId}`, data),
  
  deleteLayout: (layoutId) =>
    api.delete(`/dashboard/layouts/${layoutId}`),
  
  setDefaultLayout: (layoutId) =>
    api.put(`/dashboard/layouts/${layoutId}/default`),
};

// Widget Data APIs
export const widgetDataAPI = {
  getRecurringContracts: (params) =>
    api.get('/widget-data/recurring-contracts', { params }),
  
  getDraftOrders: (params) =>
    api.get('/widget-data/draft-orders', { params }),
  
  getCustomerMessages: (params) =>
    api.get('/widget-data/customer-messages', { params }),
  
  getInvoiceRunSummary: (params) =>
    api.get('/widget-data/invoice-run-summary', { params }),
  
  getRecentOrders: (params) =>
    api.get('/widget-data/recent-orders', { params }),
};

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.response) {
      // Server responded with error
      return {
        success: false,
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors || {},
        status: error.response.status,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        message: 'No response from server. Please check your connection.',
        errors: {},
        status: 0,
      };
    } else {
      // Something else happened
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        errors: {},
        status: -1,
      };
    }
  },
  
  // Format API response
  formatResponse: (response) => {
    if (response.data) {
      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || '',
        meta: response.data.meta || {},
      };
    }
    return response;
  },
};

export default api;