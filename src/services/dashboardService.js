import api, { dashboardAPI, widgetDataAPI } from './apiService';

// Dashboard layout API calls
export const fetchDashboardLayouts = async () => {
  try {
    console.log('[Dashboard Service] Fetching layouts...');
    const response = await dashboardAPI.getLayouts();
    console.log('[Dashboard Service] Layouts response:', response);
    return response.data;
  } catch (error) {
    console.error('[Dashboard Service] Error fetching dashboard layouts:', error);
    console.error('[Dashboard Service] Error response:', error.response);
    console.error('[Dashboard Service] Error status:', error.response?.status);
    console.error('[Dashboard Service] Error data:', error.response?.data);
    throw error;
  }
};

export const saveDashboardLayout = async (layoutData) => {
  try {
    const response = await dashboardAPI.createLayout(layoutData);
    return response.data;
  } catch (error) {
    console.error('Error saving dashboard layout:', error);
    throw error;
  }
};

export const updateDashboardLayout = async (layoutId, layoutData) => {
  try {
    const response = await dashboardAPI.updateLayout(layoutId, layoutData);
    return response.data;
  } catch (error) {
    console.error('Error updating dashboard layout:', error);
    throw error;
  }
};

export const deleteDashboardLayout = async (layoutId) => {
  try {
    const response = await dashboardAPI.deleteLayout(layoutId);
    return response.data;
  } catch (error) {
    console.error('Error deleting dashboard layout:', error);
    throw error;
  }
};

export const setDefaultLayout = async (layoutId) => {
  try {
    const response = await dashboardAPI.setDefaultLayout(layoutId);
    return response.data;
  } catch (error) {
    console.error('Error setting default layout:', error);
    throw error;
  }
};

// Widget data API calls
export const fetchWidgetData = async (widgetType, params = {}) => {
  try {
    let response;
    switch (widgetType) {
      case 'recurring-contracts':
        response = await widgetDataAPI.getRecurringContracts(params);
        break;
      case 'draft-orders':
        response = await widgetDataAPI.getDraftOrders(params);
        break;
      case 'customer-messages':
        response = await widgetDataAPI.getCustomerMessages(params);
        break;
      case 'invoice-run-summary':
        response = await widgetDataAPI.getInvoiceRunSummary(params);
        break;
      case 'recent-orders':
        response = await widgetDataAPI.getRecentOrders(params);
        break;
      default:
        // Fallback for widgets not yet implemented
        response = await api.get(`/widget-data/${widgetType}`, { params });
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${widgetType} widget data:`, error);
    throw error;
  }
};

// Dashboard preferences API calls
export const fetchDashboardPreferences = async () => {
  try {
    const response = await api.get('/dashboard/preferences');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard preferences:', error);
    throw error;
  }
};

export const updateDashboardPreferences = async (preferences) => {
  try {
    const response = await api.put('/dashboard/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating dashboard preferences:', error);
    throw error;
  }
};

// Cache management utilities
const CACHE_PREFIX = 'dashboard_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedData = (key) => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
    localStorage.removeItem(cacheKey);
  }
  
  return null;
};

export const setCachedData = (key, data) => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};

export const clearDashboardCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

// Error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        window.location.href = '/auth/signin';
        break;
      case 403:
        // Forbidden
        return { error: 'You do not have permission to perform this action.' };
      case 404:
        // Not found
        return { error: 'The requested resource was not found.' };
      case 500:
        // Server error
        return { error: 'An internal server error occurred. Please try again later.' };
      default:
        return { error: data.message || 'An unexpected error occurred.' };
    }
  } else if (error.request) {
    // Request made but no response
    return { error: 'Unable to connect to the server. Please check your internet connection.' };
  } else {
    // Something else happened
    return { error: error.message || 'An unexpected error occurred.' };
  }
};