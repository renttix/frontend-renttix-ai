'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import TemplateDesigner from './components/TemplateDesigner';
import ThemeGallery from './components/ThemeGallery';
import CSSEditor from './components/CSSEditor';
import LivePreview from './components/LivePreview';
import TemplateList from './components/TemplateList';
import { documentTemplateService } from '../../../services/documentTemplateService';
import './styles/document-appearance.css';

const DocumentAppearance = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateData, setTemplateData] = useState({
    name: '',
    type: 'invoice',
    theme: 'default',
    customCSS: '',
    settings: {
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
      },
      margins: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      header: {
        showLogo: true,
        showCompanyDetails: true,
        alignment: 'left'
      },
      footer: {
        showPageNumbers: true,
        showFooterText: true,
        footerText: ''
      }
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await documentTemplateService.getTemplates();
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = async (template) => {
    try {
      setIsLoading(true);
      const response = await documentTemplateService.getTemplate(template._id);
      setSelectedTemplate(response.data);
      setTemplateData(response.data);
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateUpdate = (updates) => {
    setTemplateData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleSettingsUpdate = (settings) => {
    setTemplateData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings
      }
    }));
  };

  const handleSaveTemplate = async () => {
    try {
      setIsSaving(true);
      
      if (!templateData.name) {
        toast.error('Please enter a template name');
        return;
      }

      let response;
      if (selectedTemplate?._id) {
        response = await documentTemplateService.updateTemplate(
          selectedTemplate._id,
          templateData
        );
        toast.success('Template updated successfully');
      } else {
        response = await documentTemplateService.createTemplate(templateData);
        toast.success('Template created successfully');
      }

      await loadTemplates();
      setSelectedTemplate(response.data);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await documentTemplateService.deleteTemplate(templateId);
      toast.success('Template deleted successfully');
      await loadTemplates();
      
      if (selectedTemplate?._id === templateId) {
        setSelectedTemplate(null);
        setTemplateData({
          name: '',
          type: 'invoice',
          theme: 'default',
          customCSS: '',
          settings: templateData.settings
        });
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateData({
      name: '',
      type: 'invoice',
      theme: 'default',
      customCSS: '',
      settings: templateData.settings
    });
  };

  const tabs = [
    { id: 'templates', label: 'Templates', icon: 'pi pi-file' },
    { id: 'designer', label: 'Designer', icon: 'pi pi-palette' },
    { id: 'themes', label: 'Themes', icon: 'pi pi-image' },
    { id: 'css', label: 'Custom CSS', icon: 'pi pi-code' },
    { id: 'preview', label: 'Preview', icon: 'pi pi-eye' }
  ];

  return (
    <div className="document-appearance-container">
      <div className="document-appearance-header">
        <div className="header-content">
          <button
            className="back-button"
            onClick={() => router.push('/system-setup')}
          >
            <i className="pi pi-arrow-left"></i>
            <span>Back to System Setup</span>
          </button>
          <h1>Document Appearance</h1>
          <p className="subtitle">Customize the look and feel of your documents</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={handleNewTemplate}
          >
            <i className="pi pi-plus"></i>
            New Template
          </button>
          <button
            className="btn-primary"
            onClick={handleSaveTemplate}
            disabled={isSaving || !templateData.name}
          >
            {isSaving ? (
              <>
                <i className="pi pi-spin pi-spinner"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="pi pi-save"></i>
                Save Template
              </>
            )}
          </button>
        </div>
      </div>

      <div className="document-appearance-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="document-appearance-content">
        {isLoading ? (
          <div className="loading-container">
            <i className="pi pi-spin pi-spinner"></i>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'templates' && (
              <TemplateList
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleTemplateSelect}
                onDeleteTemplate={handleDeleteTemplate}
                onNewTemplate={handleNewTemplate}
              />
            )}

            {activeTab === 'designer' && (
              <TemplateDesigner
                templateData={templateData}
                onUpdate={handleTemplateUpdate}
                onSettingsUpdate={handleSettingsUpdate}
              />
            )}

            {activeTab === 'themes' && (
              <ThemeGallery
                selectedTheme={templateData.theme}
                onSelectTheme={(theme) => handleTemplateUpdate({ theme })}
              />
            )}

            {activeTab === 'css' && (
              <CSSEditor
                css={templateData.customCSS}
                onChange={(customCSS) => handleTemplateUpdate({ customCSS })}
              />
            )}

            {activeTab === 'preview' && (
              <LivePreview
                templateData={templateData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentAppearance;