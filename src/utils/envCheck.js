// Environment variable check utility
export const checkEnvironmentVariables = () => {
  const requiredEnvVars = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  };

  const missingVars = [];
  
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
    console.warn('Using fallback API URL: http://localhost:5000/api');
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  };
};

// Get API URL with fallback
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

// Check if running in development
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};