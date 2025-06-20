import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useDashboard } from '../../contexts/DashboardContext';
import { classNames } from 'primereact/utils';

const BaseWidget = ({
  id,
  title,
  icon,
  children,
  className,
  headerActions,
  loading = false,
  error = null,
  minWidth = 4,
  maxWidth = 12,
  resizable = true,
  position,
  type,
  editMode: editModeProp,
  onRemove,
  onSettings,
  draggable,
  onDragStart,
  onDragEnd,
  isDragging: isDraggingProp,
  isDropTarget
}) => {
  const {
    editMode: contextEditMode,
    startDrag,
    toggleWidgetCollapsed,
    toggleWidgetVisibility,
    currentLayout
  } = useDashboard();
  
  // Use prop editMode if provided, otherwise use context
  const editMode = editModeProp !== undefined ? editModeProp : contextEditMode;
  const widgetId = id;
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const widgetRef = useRef(null);
  
  // Get widget state from layout
  const widget = currentLayout?.widgets?.[widgetId] || {};
  const { collapsed = false, position: widgetPosition = { col: 0, row: 0, width: minWidth } } = widget;
  
  // Use prop position if provided, otherwise use widget position from state
  const finalPosition = position || widgetPosition;
  
  // Handle drag start
  const handleDragStart = (e) => {
    if (!editMode || !draggable) return;
    
    setIsDragging(true);
    if (onDragStart) {
      onDragStart(e);
    } else {
      startDrag(widgetId, e);
    }
    
    // Create drag image
    const dragImage = widgetRef.current.cloneNode(true);
    dragImage.style.opacity = '0.5';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
    
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };
  
  const handleDragEnd = (e) => {
    setIsDragging(false);
    if (onDragEnd) {
      onDragEnd(e);
    }
  };
  
  // Handle resize
  const handleResizeStart = (e) => {
    if (!editMode || !resizable) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setResizeStartWidth(finalPosition.width);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  const handleResizeMove = (e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    const colWidth = widgetRef.current.parentElement.offsetWidth / 12;
    const deltaColumns = Math.round(deltaX / colWidth);
    const newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStartWidth + deltaColumns));
    
    // Update widget width in real-time (you might want to debounce this)
    if (newWidth !== finalPosition.width) {
      // This would update the widget position in the store
      // For now, we'll just update the visual feedback
      widgetRef.current.style.width = `${(newWidth / 12) * 100}%`;
    }
  };
  
  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    
    // Here you would commit the resize to the store
    // moveWidget(widgetId, { ...finalPosition, width: newWidth });
  };
  
  // Widget header with controls
  const header = (
    <div className="flex align-items-center justify-content-between">
      <div className="flex align-items-center gap-2">
        {editMode && (
          <i 
            className="pi pi-bars cursor-move"
            style={{ cursor: 'move' }}
            onMouseDown={(e) => e.preventDefault()}
          />
        )}
        {icon && <i className={`pi pi-${icon}`} />}
        <span className="font-semibold">{title}</span>
      </div>
      <div className="flex align-items-center gap-2">
        {headerActions}
        <Button
          icon={`pi pi-chevron-${collapsed ? 'down' : 'up'}`}
          className="p-button-text p-button-sm p-button-rounded"
          onClick={() => toggleWidgetCollapsed(widgetId)}
          tooltip={collapsed ? 'Expand' : 'Collapse'}
          tooltipOptions={{ position: 'top' }}
        />
        {editMode && (
          <>
            {onSettings && (
              <Button
                icon="pi pi-cog"
                className="p-button-text p-button-sm p-button-rounded"
                onClick={onSettings}
                tooltip="Widget settings"
                tooltipOptions={{ position: 'top' }}
              />
            )}
            <Button
              icon="pi pi-times"
              className="p-button-text p-button-sm p-button-rounded p-button-danger"
              onClick={() => onRemove ? onRemove() : toggleWidgetVisibility(widgetId)}
              tooltip="Remove widget"
              tooltipOptions={{ position: 'top' }}
            />
          </>
        )}
      </div>
    </div>
  );
  
  // Calculate grid position styles
  const gridStyles = {
    gridColumn: `${finalPosition.col + 1} / span ${finalPosition.width}`,
    gridRow: finalPosition.row + 1,
    minHeight: collapsed ? 'auto' : '200px',
    transition: 'all 0.3s ease',
    opacity: isDraggingProp || isDragging ? 0.5 : 1,
    cursor: editMode && draggable ? 'move' : 'default',
    position: 'relative'
  };
  
  return (
    <div
      ref={widgetRef}
      className={classNames('dashboard-widget', className, {
        'dragging': isDraggingProp || isDragging,
        'resizing': isResizing,
        'edit-mode': editMode,
        'drop-target': isDropTarget
      })}
      style={gridStyles}
      draggable={editMode && draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-widget-id={widgetId}
      data-widget-type={type}
      data-width={finalPosition.width}
    >
      <Card 
        header={header}
        className={classNames('h-full', {
          'widget-collapsed': collapsed,
          'widget-error': error
        })}
      >
        {!collapsed && (
          <div className="widget-content">
            {loading && (
              <div className="flex align-items-center justify-content-center p-4">
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
              </div>
            )}
            {error && (
              <div className="p-message p-message-error p-3">
                <i className="pi pi-exclamation-triangle mr-2" />
                {error}
              </div>
            )}
            {!loading && !error && children}
          </div>
        )}
      </Card>
      
      {editMode && resizable && (
        <div
          className="resize-handle"
          onMouseDown={handleResizeStart}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '10px',
            cursor: 'ew-resize',
            backgroundColor: 'transparent',
            borderRight: isResizing ? '2px solid var(--primary-color)' : 'none'
          }}
        />
      )}
    </div>
  );
};

export default BaseWidget;