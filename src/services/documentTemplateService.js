import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
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

// Handle response errors
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

export const documentTemplateService = {
  // Get all templates
  getTemplates: async (params = {}) => {
    try {
      const response = await api.get('/document-templates', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Get single template by ID
  getTemplate: async (id) => {
    try {
      const response = await api.get(`/document-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  // Create new template
  createTemplate: async (templateData) => {
    try {
      const response = await api.post('/document-templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Update existing template
  updateTemplate: async (id, templateData) => {
    try {
      const response = await api.put(`/document-templates/${id}`, templateData);
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  // Delete template
  deleteTemplate: async (id) => {
    try {
      const response = await api.delete(`/document-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Set template as default for a document type
  setDefaultTemplate: async (id, documentType) => {
    try {
      const response = await api.post(`/document-templates/${id}/set-default`, {
        documentType
      });
      return response.data;
    } catch (error) {
      console.error('Error setting default template:', error);
      throw error;
    }
  },

  // Clone existing template
  cloneTemplate: async (id, newName) => {
    try {
      const response = await api.post(`/document-templates/${id}/clone`, {
        name: newName
      });
      return response.data;
    } catch (error) {
      console.error('Error cloning template:', error);
      throw error;
    }
  },

  // Preview template with sample data
  previewTemplate: async (templateData, sampleData = {}) => {
    try {
      const response = await api.post('/document-templates/preview', {
        template: templateData,
        data: sampleData
      });
      return response.data;
    } catch (error) {
      console.error('Error previewing template:', error);
      throw error;
    }
  },

  // Export template as JSON
  exportTemplate: async (id) => {
    try {
      const response = await api.get(`/document-templates/${id}/export`);
      return response.data;
    } catch (error) {
      console.error('Error exporting template:', error);
      throw error;
    }
  },

  // Import template from JSON
  importTemplate: async (templateJson) => {
    try {
      const response = await api.post('/document-templates/import', templateJson);
      return response.data;
    } catch (error) {
      console.error('Error importing template:', error);
      throw error;
    }
  },

  // Get available themes
  getThemes: async () => {
    try {
      const response = await api.get('/document-templates/themes');
      return response.data;
    } catch (error) {
      console.error('Error fetching themes:', error);
      throw error;
    }
  },

  // Validate CSS
  validateCSS: async (css) => {
    try {
      const response = await api.post('/document-templates/validate-css', { css });
      return response.data;
    } catch (error) {
      console.error('Error validating CSS:', error);
      throw error;
    }
  },

  // Get template usage statistics
  getTemplateStats: async (id) => {
    try {
      const response = await api.get(`/document-templates/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template stats:', error);
      throw error;
    }
  }
};

// Helper functions for template management
export const templateHelpers = {
  // Generate unique template name
  generateTemplateName: (baseName, existingTemplates) => {
    let name = baseName;
    let counter = 1;
    
    while (existingTemplates.some(t => t.name === name)) {
      name = `${baseName} (${counter})`;
      counter++;
    }
    
    return name;
  },

  // Get default settings for document type
  getDefaultSettings: (documentType) => {
    const defaults = {
      invoice: {
        colors: {
          primary: '#1e40af',
          secondary: '#64748b',
          accent: '#10b981',
          text: '#1f2937',
          background: '#ffffff'
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          size: {
            heading: '24px',
            subheading: '18px',
            body: '14px',
            small: '12px'
          }
        }
      },
      quote: {
        colors: {
          primary: '#7c3aed',
          secondary: '#64748b',
          accent: '#f59e0b',
          text: '#1f2937',
          background: '#ffffff'
        },
        fonts: {
          heading: 'Poppins',
          body: 'Inter',
          size: {
            heading: '28px',
            subheading: '20px',
            body: '14px',
            small: '12px'
          }
        }
      },
      delivery_note: {
        colors: {
          primary: '#059669',
          secondary: '#6b7280',
          accent: '#3b82f6',
          text: '#111827',
          background: '#ffffff'
        },
        fonts: {
          heading: 'Roboto',
          body: 'Roboto',
          size: {
            heading: '22px',
            subheading: '16px',
            body: '13px',
            small: '11px'
          }
        }
      }
    };

    return defaults[documentType] || defaults.invoice;
  },

  // Validate template data
  validateTemplate: (templateData) => {
    const errors = [];

    if (!templateData.name || templateData.name.trim() === '') {
      errors.push('Template name is required');
    }

    if (!templateData.type) {
      errors.push('Document type is required');
    }

    if (templateData.customCSS) {
      // Basic CSS validation
      const openBraces = (templateData.customCSS.match(/{/g) || []).length;
      const closeBraces = (templateData.customCSS.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push('CSS has unmatched braces');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default documentTemplateService;