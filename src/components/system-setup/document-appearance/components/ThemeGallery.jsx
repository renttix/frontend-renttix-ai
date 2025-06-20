'use client';

import React from 'react';

const ThemeGallery = ({ selectedTheme, onSelectTheme }) => {
  const themes = [
    {
      id: 'default',
      name: 'Default',
      description: 'Clean and professional design',
      preview: {
        primary: '#1e40af',
        secondary: '#64748b',
        accent: '#10b981',
        background: '#ffffff'
      }
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary with bold colors',
      preview: {
        primary: '#7c3aed',
        secondary: '#475569',
        accent: '#f59e0b',
        background: '#fafafa'
      }
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional and elegant',
      preview: {
        primary: '#991b1b',
        secondary: '#6b7280',
        accent: '#059669',
        background: '#f9fafb'
      }
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and clean',
      preview: {
        primary: '#000000',
        secondary: '#9ca3af',
        accent: '#3b82f6',
        background: '#ffffff'
      }
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Professional business style',
      preview: {
        primary: '#1e3a8a',
        secondary: '#4b5563',
        accent: '#0891b2',
        background: '#f3f4f6'
      }
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      description: 'Colorful and energetic',
      preview: {
        primary: '#dc2626',
        secondary: '#7c3aed',
        accent: '#16a34a',
        background: '#fef3c7'
      }
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Modern dark theme',
      preview: {
        primary: '#60a5fa',
        secondary: '#94a3b8',
        accent: '#34d399',
        background: '#1f2937'
      }
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Sophisticated and refined',
      preview: {
        primary: '#7c2d12',
        secondary: '#78716c',
        accent: '#a78bfa',
        background: '#fffbeb'
      }
    }
  ];

  return (
    <div className="theme-gallery">
      <div className="gallery-header">
        <h3>Choose a Theme</h3>
        <p>Select a pre-built theme to quickly style your documents</p>
      </div>

      <div className="theme-grid">
        {themes.map(theme => (
          <div
            key={theme.id}
            className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
            onClick={() => onSelectTheme(theme.id)}
          >
            <div className="theme-preview">
              <div className="preview-header" style={{ backgroundColor: theme.preview.primary }}>
                <div className="preview-logo"></div>
                <div className="preview-title"></div>
              </div>
              <div className="preview-body" style={{ backgroundColor: theme.preview.background }}>
                <div className="preview-line" style={{ backgroundColor: theme.preview.secondary }}></div>
                <div className="preview-line short" style={{ backgroundColor: theme.preview.secondary }}></div>
                <div className="preview-accent" style={{ backgroundColor: theme.preview.accent }}></div>
                <div className="preview-line" style={{ backgroundColor: theme.preview.secondary }}></div>
                <div className="preview-line medium" style={{ backgroundColor: theme.preview.secondary }}></div>
              </div>
            </div>
            <div className="theme-info">
              <h4>{theme.name}</h4>
              <p>{theme.description}</p>
            </div>
            {selectedTheme === theme.id && (
              <div className="theme-selected-badge">
                <i className="pi pi-check"></i>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="theme-customization-note">
        <i className="pi pi-info-circle"></i>
        <p>You can further customize any theme using the Designer tab</p>
      </div>
    </div>
  );
};

export default ThemeGallery;