'use client';

import React, { useState } from 'react';

const TemplateList = ({ templates, selectedTemplate, onSelectTemplate, onDeleteTemplate, onNewTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const documentTypes = {
    invoice: { label: 'Invoice', icon: 'pi pi-file-edit', color: '#3b82f6' },
    quote: { label: 'Quote', icon: 'pi pi-file', color: '#8b5cf6' },
    delivery_note: { label: 'Delivery Note', icon: 'pi pi-truck', color: '#10b981' },
    receipt: { label: 'Receipt', icon: 'pi pi-receipt', color: '#f59e0b' },
    statement: { label: 'Statement', icon: 'pi pi-chart-line', color: '#ef4444' },
    hire_agreement: { label: 'Hire Agreement', icon: 'pi pi-briefcase', color: '#6366f1' }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  });

  const groupedTemplates = filteredTemplates.reduce((groups, template) => {
    const type = template.type || 'other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(template);
    return groups;
  }, {});

  return (
    <div className="template-list">
      <div className="list-header">
        <div className="list-title">
          <h3>Document Templates</h3>
          <p>Manage your document templates</p>
        </div>
        <button className="btn-primary" onClick={onNewTemplate}>
          <i className="pi pi-plus"></i>
          New Template
        </button>
      </div>

      <div className="list-controls">
        <div className="search-box">
          <i className="pi pi-search"></i>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <button
            className={`filter-button ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          {Object.entries(documentTypes).map(([type, config]) => (
            <button
              key={type}
              className={`filter-button ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              <i className={config.icon}></i>
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="empty-state">
          <i className="pi pi-file-o"></i>
          <h4>No templates found</h4>
          <p>
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first template to get started'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <button className="btn-primary" onClick={onNewTemplate}>
              <i className="pi pi-plus"></i>
              Create Template
            </button>
          )}
        </div>
      ) : (
        <div className="template-groups">
          {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
            <div key={type} className="template-group">
              <div className="group-header">
                <i className={documentTypes[type]?.icon || 'pi pi-file'}></i>
                <h4>{documentTypes[type]?.label || 'Other'}</h4>
                <span className="template-count">{typeTemplates.length}</span>
              </div>
              
              <div className="template-grid">
                {typeTemplates.map(template => (
                  <div
                    key={template._id}
                    className={`template-card ${selectedTemplate?._id === template._id ? 'selected' : ''}`}
                    onClick={() => onSelectTemplate(template)}
                  >
                    <div className="template-icon" style={{ backgroundColor: documentTypes[type]?.color || '#6b7280' }}>
                      <i className={documentTypes[type]?.icon || 'pi pi-file'}></i>
                    </div>
                    
                    <div className="template-info">
                      <h5>{template.name}</h5>
                      <p className="template-meta">
                        Theme: {template.theme || 'default'}
                      </p>
                      <p className="template-date">
                        Modified: {new Date(template.updatedAt || template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="template-actions">
                      {template.isDefault && (
                        <span className="default-badge">Default</span>
                      )}
                      <button
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTemplate(template._id);
                        }}
                        title="Delete template"
                      >
                        <i className="pi pi-trash"></i>
                      </button>
                    </div>
                    
                    {selectedTemplate?._id === template._id && (
                      <div className="selected-indicator">
                        <i className="pi pi-check"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="list-footer">
        <div className="template-stats">
          <span>Total Templates: {templates.length}</span>
          {filterType !== 'all' && (
            <span> | Showing: {filteredTemplates.length}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateList;