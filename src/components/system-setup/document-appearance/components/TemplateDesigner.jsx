'use client';

import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

const TemplateDesigner = ({ templateData, onUpdate, onSettingsUpdate }) => {
  const [activeSection, setActiveSection] = useState('general');
  const [showColorPicker, setShowColorPicker] = useState(null);

  const fontOptions = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Trebuchet MS',
    'Palatino',
    'Garamond',
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins'
  ];

  const documentTypes = [
    { value: 'invoice', label: 'Invoice' },
    { value: 'quote', label: 'Quote' },
    { value: 'delivery_note', label: 'Delivery Note' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'statement', label: 'Statement' },
    { value: 'hire_agreement', label: 'Hire Agreement' }
  ];

  const handleColorChange = (color, colorType) => {
    onSettingsUpdate({
      colors: {
        ...templateData.settings.colors,
        [colorType]: color.hex
      }
    });
  };

  const handleFontChange = (fontType, value) => {
    onSettingsUpdate({
      fonts: {
        ...templateData.settings.fonts,
        [fontType]: value
      }
    });
  };

  const handleFontSizeChange = (sizeType, value) => {
    onSettingsUpdate({
      fonts: {
        ...templateData.settings.fonts,
        size: {
          ...templateData.settings.fonts.size,
          [sizeType]: value
        }
      }
    });
  };

  const handleMarginChange = (side, value) => {
    onSettingsUpdate({
      margins: {
        ...templateData.settings.margins,
        [side]: value
      }
    });
  };

  const handleHeaderChange = (field, value) => {
    onSettingsUpdate({
      header: {
        ...templateData.settings.header,
        [field]: value
      }
    });
  };

  const handleFooterChange = (field, value) => {
    onSettingsUpdate({
      footer: {
        ...templateData.settings.footer,
        [field]: value
      }
    });
  };

  const sections = [
    { id: 'general', label: 'General', icon: 'pi pi-cog' },
    { id: 'colors', label: 'Colors', icon: 'pi pi-palette' },
    { id: 'typography', label: 'Typography', icon: 'pi pi-align-left' },
    { id: 'layout', label: 'Layout', icon: 'pi pi-th-large' },
    { id: 'header', label: 'Header', icon: 'pi pi-window-maximize' },
    { id: 'footer', label: 'Footer', icon: 'pi pi-window-minimize' }
  ];

  return (
    <div className="template-designer">
      <div className="designer-sidebar">
        <h3>Design Settings</h3>
        <div className="section-tabs">
          {sections.map(section => (
            <button
              key={section.id}
              className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <i className={section.icon}></i>
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="designer-content">
        {activeSection === 'general' && (
          <div className="design-section">
            <h3>General Settings</h3>
            
            <div className="form-group">
              <label>Template Name</label>
              <input
                type="text"
                value={templateData.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="Enter template name"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Document Type</label>
              <select
                value={templateData.type}
                onChange={(e) => onUpdate({ type: e.target.value })}
                className="form-control"
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeSection === 'colors' && (
          <div className="design-section">
            <h3>Color Scheme</h3>
            
            <div className="color-grid">
              {Object.entries(templateData.settings.colors).map(([key, value]) => (
                <div key={key} className="color-item">
                  <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <div className="color-input-group">
                    <div
                      className="color-preview"
                      style={{ backgroundColor: value }}
                      onClick={() => setShowColorPicker(showColorPicker === key ? null : key)}
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange({ hex: e.target.value }, key)}
                      className="color-input"
                    />
                  </div>
                  {showColorPicker === key && (
                    <div className="color-picker-popover">
                      <div
                        className="color-picker-cover"
                        onClick={() => setShowColorPicker(null)}
                      />
                      <SketchPicker
                        color={value}
                        onChange={(color) => handleColorChange(color, key)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'typography' && (
          <div className="design-section">
            <h3>Typography</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Heading Font</label>
                <select
                  value={templateData.settings.fonts.heading}
                  onChange={(e) => handleFontChange('heading', e.target.value)}
                  className="form-control"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Body Font</label>
                <select
                  value={templateData.settings.fonts.body}
                  onChange={(e) => handleFontChange('body', e.target.value)}
                  className="form-control"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h4>Font Sizes</h4>
            <div className="font-size-grid">
              {Object.entries(templateData.settings.fonts.size).map(([key, value]) => (
                <div key={key} className="form-group">
                  <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFontSizeChange(key, e.target.value)}
                    className="form-control"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'layout' && (
          <div className="design-section">
            <h3>Page Layout</h3>
            
            <h4>Margins</h4>
            <div className="margin-grid">
              {Object.entries(templateData.settings.margins).map(([side, value]) => (
                <div key={side} className="form-group">
                  <label>{side.charAt(0).toUpperCase() + side.slice(1)}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleMarginChange(side, e.target.value)}
                    className="form-control"
                    placeholder="e.g., 20mm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'header' && (
          <div className="design-section">
            <h3>Header Settings</h3>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={templateData.settings.header.showLogo}
                  onChange={(e) => handleHeaderChange('showLogo', e.target.checked)}
                />
                Show Company Logo
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={templateData.settings.header.showCompanyDetails}
                  onChange={(e) => handleHeaderChange('showCompanyDetails', e.target.checked)}
                />
                Show Company Details
              </label>
            </div>

            <div className="form-group">
              <label>Header Alignment</label>
              <select
                value={templateData.settings.header.alignment}
                onChange={(e) => handleHeaderChange('alignment', e.target.value)}
                className="form-control"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        )}

        {activeSection === 'footer' && (
          <div className="design-section">
            <h3>Footer Settings</h3>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={templateData.settings.footer.showPageNumbers}
                  onChange={(e) => handleFooterChange('showPageNumbers', e.target.checked)}
                />
                Show Page Numbers
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={templateData.settings.footer.showFooterText}
                  onChange={(e) => handleFooterChange('showFooterText', e.target.checked)}
                />
                Show Footer Text
              </label>
            </div>

            {templateData.settings.footer.showFooterText && (
              <div className="form-group">
                <label>Footer Text</label>
                <textarea
                  value={templateData.settings.footer.footerText}
                  onChange={(e) => handleFooterChange('footerText', e.target.value)}
                  className="form-control"
                  rows="3"
                  placeholder="Enter footer text..."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateDesigner;