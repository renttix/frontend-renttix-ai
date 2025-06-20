import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { useDashboard } from '../../contexts/DashboardContext';
import { useRef } from 'react';
import DashboardGrid from './DashboardGrid';
import BaseWidget from './BaseWidget';

const DashboardLayoutManager = ({ visible, onHide }) => {
  const {
    currentLayout,
    layouts,
    saveLayout,
    deleteLayout,
    setAsDefaultLayout,
    toggleWidgetVisibility,
    loadLayouts
  } = useDashboard();

  const [activeTab, setActiveTab] = useState(0);
  const [layoutName, setLayoutName] = useState('');
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [previewLayout, setPreviewLayout] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useRef(null);

  // Initialize with current layout
  useEffect(() => {
    if (currentLayout) {
      setLayoutName(currentLayout.name || '');
      setPreviewLayout(JSON.parse(JSON.stringify(currentLayout)));
    }
  }, [currentLayout]);

  // Handle widget toggle
  const handleWidgetToggle = (widgetId) => {
    if (!previewLayout) return;

    const updatedLayout = {
      ...previewLayout,
      widgets: {
        ...previewLayout.widgets,
        [widgetId]: {
          ...previewLayout.widgets[widgetId],
          visible: !previewLayout.widgets[widgetId].visible
        }
      }
    };
    setPreviewLayout(updatedLayout);
  };

  // Save current layout
  const handleSaveLayout = async () => {
    if (!layoutName.trim()) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a layout name',
        life: 3000
      });
      return;
    }

    setSaving(true);
    try {
      const layoutData = {
        name: layoutName,
        widgets: previewLayout.widgets,
        isDefault: currentLayout?.isDefault || false
      };

      if (currentLayout?._id) {
        layoutData._id = currentLayout._id;
      }

      await saveLayout(layoutData);
      
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Layout saved successfully',
        life: 3000
      });

      // Refresh layouts
      await loadLayouts();
      
      // Close dialog after short delay
      setTimeout(() => {
        onHide();
      }, 1000);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save layout',
        life: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete layout
  const handleDeleteLayout = (layout) => {
    confirmDialog({
      message: `Are you sure you want to delete the layout "${layout.name}"?`,
      header: 'Delete Layout',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        setDeleting(true);
        try {
          await deleteLayout(layout._id);
          
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Layout deleted successfully',
            life: 3000
          });

          // Refresh layouts
          await loadLayouts();
        } catch (error) {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete layout',
            life: 3000
          });
        } finally {
          setDeleting(false);
        }
      }
    });
  };

  // Set as default layout
  const handleSetDefault = async (layout) => {
    try {
      await setAsDefaultLayout(layout._id);
      
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: `"${layout.name}" is now the default layout`,
        life: 3000
      });

      // Refresh layouts
      await loadLayouts();
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to set default layout',
        life: 3000
      });
    }
  };

  // Load selected layout
  const handleLoadLayout = (layout) => {
    setSelectedLayout(layout);
    setLayoutName(layout.name);
    setPreviewLayout(JSON.parse(JSON.stringify(layout)));
    setActiveTab(0);
  };

  // Widget configuration panel
  const renderWidgetConfig = () => {
    if (!previewLayout || !previewLayout.widgets) return null;

    const widgetCategories = {
      overview: 'Overview Widgets',
      operations: 'Operations Widgets',
      financial: 'Financial Widgets',
      analytics: 'Analytics Widgets'
    };

    return (
      <div className="widget-config-panel">
        {Object.entries(widgetCategories).map(([category, label]) => (
          <div key={category} className="mb-4">
            <h4 className="mb-3">{label}</h4>
            <div className="grid">
              {Object.entries(previewLayout.widgets)
                .filter(([_, widget]) => widget.category === category)
                .map(([widgetId, widget]) => (
                  <div key={widgetId} className="col-12 md:col-6 lg:col-4">
                    <div className="flex align-items-center justify-content-between p-3 border-1 surface-border border-round">
                      <div className="flex align-items-center gap-2">
                        <i className={`pi pi-${widget.icon || 'chart-bar'}`} />
                        <span>{widget.title}</span>
                      </div>
                      <InputSwitch
                        checked={widget.visible}
                        onChange={() => handleWidgetToggle(widgetId)}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Layout preview
  const renderLayoutPreview = () => {
    if (!previewLayout || !previewLayout.widgets) return null;

    const visibleWidgets = Object.entries(previewLayout.widgets)
      .filter(([_, widget]) => widget.visible);

    if (visibleWidgets.length === 0) {
      return (
        <div className="text-center p-5 text-color-secondary">
          <i className="pi pi-info-circle text-4xl mb-3" />
          <p>No widgets selected. Toggle widgets in the configuration tab.</p>
        </div>
      );
    }

    return (
      <div className="layout-preview" style={{ 
        transform: 'scale(0.7)', 
        transformOrigin: 'top left',
        width: '142%',
        height: '142%',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--border-radius)',
        overflow: 'hidden'
      }}>
        <DashboardGrid>
          {visibleWidgets.map(([widgetId, widget]) => (
            <BaseWidget
              key={widgetId}
              widgetId={widgetId}
              title={widget.title}
              icon={widget.icon}
              className="pointer-events-none"
            >
              <div className="text-center p-3 text-color-secondary">
                Widget Preview
              </div>
            </BaseWidget>
          ))}
        </DashboardGrid>
      </div>
    );
  };

  // Saved layouts list
  const renderSavedLayouts = () => {
    if (!layouts || layouts.length === 0) {
      return (
        <div className="text-center p-5 text-color-secondary">
          <i className="pi pi-inbox text-4xl mb-3" />
          <p>No saved layouts found.</p>
        </div>
      );
    }

    return (
      <div className="saved-layouts-list">
        {layouts.map((layout) => (
          <Card key={layout._id} className="mb-3">
            <div className="flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-1">
                  {layout.name}
                  {layout.isDefault && (
                    <span className="ml-2 text-sm text-primary">(Default)</span>
                  )}
                </h4>
                <p className="text-color-secondary text-sm mb-0">
                  {Object.values(layout.widgets).filter(w => w.visible).length} widgets
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  label="Load"
                  icon="pi pi-upload"
                  className="p-button-sm"
                  onClick={() => handleLoadLayout(layout)}
                />
                {!layout.isDefault && (
                  <Button
                    label="Set Default"
                    icon="pi pi-star"
                    className="p-button-sm p-button-secondary"
                    onClick={() => handleSetDefault(layout)}
                  />
                )}
                <Button
                  icon="pi pi-trash"
                  className="p-button-sm p-button-danger"
                  onClick={() => handleDeleteLayout(layout)}
                  disabled={deleting}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Dashboard Layout Manager"
        visible={visible}
        onHide={onHide}
        style={{ width: '80vw', maxWidth: '1200px' }}
        modal
        dismissableMask
        footer={
          <div className="flex justify-content-between">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={onHide}
            />
            <Button
              label="Save Layout"
              icon="pi pi-save"
              onClick={handleSaveLayout}
              loading={saving}
              disabled={!layoutName.trim() || !previewLayout}
            />
          </div>
        }
      >
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Configure Widgets">
            <div className="mb-3">
              <label htmlFor="layoutName" className="block mb-2">Layout Name</label>
              <InputText
                id="layoutName"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="Enter layout name"
                className="w-full"
              />
            </div>
            {renderWidgetConfig()}
          </TabPanel>
          
          <TabPanel header="Preview">
            <div className="layout-preview-container">
              {renderLayoutPreview()}
            </div>
          </TabPanel>
          
          <TabPanel header="Saved Layouts">
            {renderSavedLayouts()}
          </TabPanel>
        </TabView>
      </Dialog>
    </>
  );
};

export default DashboardLayoutManager;