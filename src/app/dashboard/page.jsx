"use client";
import React, { useState, useCallback, useEffect, useRef, Suspense } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import BaseWidget from "@/components/dashboard/BaseWidget";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { widgetComponents, widgetMetadata, widgetCategories } from "@/components/dashboard/widgets";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { TabView, TabPanel } from "primereact/tabview";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { Badge } from "primereact/badge";
import { Tooltip } from "primereact/tooltip";
import "./dashboard.css";

const DashboardContent = () => {
  const {
    currentLayout,
    layouts,
    isLoading,
    editMode,
    setEditMode,
    saveLayout,
    deleteLayout,
    setAsDefaultLayout,
    loadLayouts,
    moveWidget,
    toggleWidgetVisibility,
    findNextAvailablePosition,
    hasUnsavedChanges,
    resetUnsavedChanges,
    startDrag,
    endDrag,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    isDragging,
    dropTarget
  } = useDashboard();

  const [showWidgetCatalog, setShowWidgetCatalog] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [newLayoutName, setNewLayoutName] = useState("");
  const [savingLayout, setSavingLayout] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState({});
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const toast = useRef(null);

  // Initialize selected layout
  useEffect(() => {
    if (currentLayout && !selectedLayout) {
      setSelectedLayout(currentLayout._id);
    }
  }, [currentLayout, selectedLayout]);

  // Handle layout change
  const handleLayoutChange = (layoutId) => {
    if (hasUnsavedChanges) {
      confirmDialog({
        message: 'You have unsaved changes. Do you want to save them before switching layouts?',
        header: 'Unsaved Changes',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          await handleSaveLayout();
          switchToLayout(layoutId);
        },
        reject: () => {
          resetUnsavedChanges();
          switchToLayout(layoutId);
        }
      });
    } else {
      switchToLayout(layoutId);
    }
  };

  const switchToLayout = (layoutId) => {
    const layout = layouts.find(l => l._id === layoutId);
    if (layout) {
      setSelectedLayout(layoutId);
      // In a real implementation, you would dispatch an action to set the current layout
      window.location.reload(); // Temporary solution to switch layouts
    }
  };

  // Handle save layout
  const handleSaveLayout = async () => {
    if (!currentLayout) return;
    
    setSavingLayout(true);
    try {
      await saveLayout(currentLayout);
      toast.current.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Layout saved successfully' 
      });
      resetUnsavedChanges();
    } catch (error) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to save layout' 
      });
    } finally {
      setSavingLayout(false);
    }
  };

  // Handle create new layout
  const handleCreateLayout = async () => {
    if (!newLayoutName.trim()) {
      toast.current.show({ 
        severity: 'warn', 
        summary: 'Warning', 
        detail: 'Please enter a layout name' 
      });
      return;
    }

    try {
      const newLayout = {
        name: newLayoutName,
        widgets: {}
      };
      await saveLayout(newLayout);
      setNewLayoutName("");
      setShowLayoutManager(false);
      toast.current.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Layout created successfully' 
      });
      await loadLayouts();
    } catch (error) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to create layout' 
      });
    }
  };

  // Handle delete layout
  const handleDeleteLayout = (layoutId) => {
    confirmDialog({
      message: 'Are you sure you want to delete this layout?',
      header: 'Delete Layout',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await deleteLayout(layoutId);
          toast.current.show({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Layout deleted successfully' 
          });
        } catch (error) {
          toast.current.show({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to delete layout' 
          });
        }
      }
    });
  };

  // Handle set default layout
  const handleSetDefaultLayout = async (layoutId) => {
    try {
      await setAsDefaultLayout(layoutId);
      toast.current.show({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Default layout updated' 
      });
    } catch (error) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to set default layout' 
      });
    }
  };

  // Handle add widget
  const handleAddWidget = (widgetType) => {
    if (!currentLayout) return;

    const metadata = widgetMetadata[widgetType];
    if (!metadata) return;

    const position = findNextAvailablePosition(metadata.defaultWidth || 6);
    const newWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title: metadata.name,
      icon: metadata.icon,
      category: metadata.category,
      position: position,
      visible: true,
      collapsed: false,
      settings: {},
      minWidth: metadata.minWidth || 3,
      maxWidth: metadata.maxWidth || 12,
      resizable: true
    };

    // Add default settings
    if (metadata.settings) {
      Object.entries(metadata.settings).forEach(([key, setting]) => {
        if (setting.default !== undefined) {
          newWidget.settings[key] = setting.default;
        }
      });
    }

    // Update the layout with the new widget
    const updatedLayout = {
      ...currentLayout,
      widgets: {
        ...currentLayout.widgets,
        [newWidget.id]: newWidget
      }
    };

    // In a real implementation, you would dispatch an action to update the layout
    setShowWidgetCatalog(false);
    toast.current.show({ 
      severity: 'success', 
      summary: 'Success', 
      detail: `${metadata.name} widget added` 
    });
  };

  // Handle remove widget
  const handleRemoveWidget = (widgetId) => {
    confirmDialog({
      message: 'Are you sure you want to remove this widget?',
      header: 'Remove Widget',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        toggleWidgetVisibility(widgetId);
        toast.current.show({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Widget removed' 
        });
      }
    });
  };

  // Handle widget settings
  const handleOpenWidgetSettings = (widget) => {
    setSelectedWidget(widget);
    setWidgetSettings(widget.settings || {});
    setShowWidgetSettings(true);
  };

  const handleSaveWidgetSettings = () => {
    // In a real implementation, you would update the widget settings
    setShowWidgetSettings(false);
    toast.current.show({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Widget settings updated' 
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;
  }

  if (!currentLayout || !currentLayout.widgets) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>No widgets configured for this dashboard.</p>
        <Button 
          label="Create New Layout" 
          icon="pi pi-plus" 
          className="mt-4"
          onClick={() => setShowLayoutManager(true)}
        />
      </div>
    );
  }

  // Convert widgets object to array
  const widgetsArray = Object.values(currentLayout.widgets).filter(w => w.visible);

  return (
    <>
      <Toast ref={toast} />
      
      {/* Dashboard Header */}
      <div className="dashboard-header mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            {currentLayout && (
              <Badge value={currentLayout.name} severity="info" />
            )}
            {hasUnsavedChanges && (
              <Badge value="Unsaved Changes" severity="warning" />
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Layout Selector */}
            <Dropdown
              value={selectedLayout}
              options={layouts.map(l => ({ label: l.name, value: l._id }))}
              onChange={(e) => handleLayoutChange(e.value)}
              placeholder="Select Layout"
              className="w-48"
              disabled={editMode}
            />
            
            {/* Edit Mode Toggle */}
            <Button
              label={editMode ? "Done Editing" : "Edit Layout"}
              icon={editMode ? "pi pi-check" : "pi pi-pencil"}
              className={editMode ? "p-button-success" : ""}
              onClick={() => setEditMode(!editMode)}
              disabled={!currentLayout}
            />
            
            {/* Add Widget Button */}
            {editMode && (
              <Button
                label="Add Widget"
                icon="pi pi-plus"
                className="p-button-primary"
                onClick={() => setShowWidgetCatalog(true)}
              />
            )}
            
            {/* Save Layout Button */}
            {editMode && hasUnsavedChanges && (
              <Button
                label="Save Changes"
                icon="pi pi-save"
                className="p-button-success"
                onClick={handleSaveLayout}
                loading={savingLayout}
              />
            )}
            
            {/* Cancel Changes Button */}
            {editMode && hasUnsavedChanges && (
              <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-secondary"
                onClick={() => {
                  resetUnsavedChanges();
                  window.location.reload();
                }}
              />
            )}
            
            {/* Layout Manager Button */}
            <Button
              label="Manage Layouts"
              icon="pi pi-cog"
              className="p-button-outlined"
              onClick={() => setShowLayoutManager(true)}
            />
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      {widgetsArray.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>No widgets in this layout.</p>
          {editMode && (
            <Button 
              label="Add Widget" 
              icon="pi pi-plus" 
              className="mt-4"
              onClick={() => setShowWidgetCatalog(true)}
            />
          )}
        </div>
      ) : (
        <DashboardGrid>
          {widgetsArray.map((widget) => {
            const WidgetComponent = widgetComponents[widget.type];
            
            if (!WidgetComponent) {
              console.warn(`Widget type "${widget.type}" not found`);
              return null;
            }

            return (
              <BaseWidget
                key={widget.id}
                id={widget.id}
                title={widget.title || 'Widget'}
                position={widget.position}
                type={widget.type}
                editMode={editMode}
                onRemove={() => handleRemoveWidget(widget.id)}
                onSettings={() => handleOpenWidgetSettings(widget)}
                draggable={editMode}
                onDragStart={(e) => startDrag(widget.id, e)}
                onDragEnd={endDrag}
                isDragging={isDragging}
                isDropTarget={dropTarget && dropTarget.row === widget.position.row && dropTarget.col === widget.position.col}
              >
                <Suspense fallback={<div className="flex justify-center items-center h-32">Loading widget...</div>}>
                  <WidgetComponent config={widget.settings} />
                </Suspense>
              </BaseWidget>
            );
          })}
        </DashboardGrid>
      )}

      {/* Widget Catalog Dialog */}
      <Dialog
        header="Add Widget"
        visible={showWidgetCatalog}
        style={{ width: '50vw' }}
        onHide={() => setShowWidgetCatalog(false)}
      >
        <TabView>
          {Object.entries(widgetCategories).map(([categoryKey, category]) => (
            <TabPanel key={categoryKey} header={category.name} leftIcon={`pi ${category.icon} mr-2`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(widgetMetadata)
                  .filter(([_, metadata]) => metadata.category === categoryKey)
                  .map(([widgetType, metadata]) => (
                    <Card
                      key={widgetType}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleAddWidget(widgetType)}
                    >
                      <div className="flex items-start gap-3">
                        <i className={`pi ${metadata.icon} text-2xl text-primary`}></i>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{metadata.name}</h4>
                          <p className="text-sm text-gray-600">{metadata.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabPanel>
          ))}
        </TabView>
      </Dialog>

      {/* Layout Manager Dialog */}
      <Dialog
        header="Manage Layouts"
        visible={showLayoutManager}
        style={{ width: '40vw' }}
        onHide={() => setShowLayoutManager(false)}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Create New Layout</h3>
          <div className="flex gap-2">
            <InputText
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              placeholder="Layout name"
              className="flex-1"
            />
            <Button
              label="Create"
              icon="pi pi-plus"
              onClick={handleCreateLayout}
              disabled={!newLayoutName.trim()}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Existing Layouts</h3>
          <div className="space-y-2">
            {layouts.map((layout) => (
              <div key={layout._id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <span>{layout.name}</span>
                  {layout.isDefault && <Badge value="Default" severity="success" />}
                </div>
                <div className="flex gap-2">
                  {!layout.isDefault && (
                    <Button
                      label="Set Default"
                      size="small"
                      className="p-button-text"
                      onClick={() => handleSetDefaultLayout(layout._id)}
                    />
                  )}
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    className="p-button-danger p-button-text"
                    onClick={() => handleDeleteLayout(layout._id)}
                    disabled={layout.isDefault}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Dialog>

      {/* Widget Settings Dialog */}
      <Dialog
        header={`${selectedWidget?.title} Settings`}
        visible={showWidgetSettings}
        style={{ width: '30vw' }}
        onHide={() => setShowWidgetSettings(false)}
        footer={
          <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setShowWidgetSettings(false)} className="p-button-text" />
            <Button label="Save" icon="pi pi-check" onClick={handleSaveWidgetSettings} autoFocus />
          </div>
        }
      >
        {selectedWidget && widgetMetadata[selectedWidget.type]?.settings && (
          <div className="space-y-4">
            {Object.entries(widgetMetadata[selectedWidget.type].settings).map(([key, setting]) => (
              <div key={key} className="field">
                <label className="block mb-2 font-semibold capitalize">{key.replace(/_/g, ' ')}</label>
                {setting.type === 'number' && (
                  <InputText
                    type="number"
                    value={widgetSettings[key] || setting.default || ''}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, [key]: parseInt(e.target.value) })}
                    min={setting.min}
                    max={setting.max}
                    className="w-full"
                  />
                )}
                {setting.type === 'boolean' && (
                  <Checkbox
                    checked={widgetSettings[key] || setting.default || false}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, [key]: e.checked })}
                  />
                )}
                {setting.type === 'select' && (
                  <Dropdown
                    value={widgetSettings[key] || setting.default}
                    options={setting.options.map(opt => ({ label: opt, value: opt }))}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, [key]: e.value })}
                    className="w-full"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Dialog>
    </>
  );
};

export default function DashboardPage() {
  return (
    <DefaultLayout>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </DefaultLayout>
  );
}