import axios from 'axios';
import { BaseURL } from '../utils/baseUrl';
import Cookies from 'js-cookie';

// Create Axios instance
const apiClient = axios.create({
  baseURL: BaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Dynamically retrieve the token from cookies
    const token = Cookies.get("xpdx");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      console.error('Unauthorized. Redirecting to login...');
      // Redirect or handle unauthorized access
    }
    return Promise.reject(error);
  }
);

// Generic API methods
const apiServices = {
  get: (url, params = {}) => apiClient.get(url, { params }),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  update: (url, data) => apiClient.put(url, data),
  delete: (url) => apiClient.delete(url),
};

export default apiServices;
