import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { classNames } from 'primereact/utils';
import './DashboardGrid.css';

const DashboardGrid = ({ children }) => {
  const {
    currentLayout,
    editMode,
    isDragging,
    dropTarget,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isPositionOccupied,
    findNextAvailablePosition
  } = useDashboard();

  const gridRef = useRef(null);
  const [gridCells, setGridCells] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Generate grid cells for drop zones
  useEffect(() => {
    if (!editMode) {
      setGridCells([]);
      return;
    }

    const cells = [];
    const maxRows = getMaxRows();
    
    for (let row = 0; row <= maxRows + 1; row++) {
      for (let col = 0; col < 12; col++) {
        cells.push({ row, col });
      }
    }
    
    setGridCells(cells);
  }, [editMode, currentLayout]);

  // Calculate maximum rows based on widget positions
  const getMaxRows = () => {
    if (!currentLayout || !currentLayout.widgets) return 5;
    
    let maxRow = 0;
    Object.values(currentLayout.widgets).forEach(widget => {
      if (widget.visible && widget.position) {
        maxRow = Math.max(maxRow, widget.position.row);
      }
    });
    
    return maxRow;
  };

  // Handle cell drag over
  const handleCellDragOver = (e, cell) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDragging) return;
    
    const widgetId = e.dataTransfer.getData('widgetId');
    const widget = currentLayout?.widgets?.[widgetId];
    
    if (!widget) return;
    
    // Check if position is valid for widget
    const position = {
      row: cell.row,
      col: cell.col,
      width: widget.position.width || 4
    };
    
    // Ensure widget doesn't overflow grid
    if (position.col + position.width > 12) {
      position.col = 12 - position.width;
    }
    
    // Check if position is occupied
    const occupied = isPositionOccupied(position, widgetId);
    
    if (!occupied) {
      setHoveredCell(position);
      handleDragOver(e, position);
    }
  };

  // Handle cell drag leave
  const handleCellDragLeave = (e) => {
    e.preventDefault();
    setHoveredCell(null);
    handleDragLeave();
  };

  // Handle cell drop
  const handleCellDrop = (e, cell) => {
    e.preventDefault();
    e.stopPropagation();
    
    const widgetId = e.dataTransfer.getData('widgetId');
    const widget = currentLayout?.widgets?.[widgetId];
    
    if (!widget) return;
    
    const position = {
      row: cell.row,
      col: cell.col,
      width: widget.position.width || 4
    };
    
    // Ensure widget doesn't overflow grid
    if (position.col + position.width > 12) {
      position.col = 12 - position.width;
    }
    
    handleDrop(e, position);
    setHoveredCell(null);
  };

  // Check if a cell is part of the hovered area
  const isCellHovered = (cell) => {
    if (!hoveredCell) return false;
    
    return (
      cell.row === hoveredCell.row &&
      cell.col >= hoveredCell.col &&
      cell.col < hoveredCell.col + hoveredCell.width
    );
  };

  // Check if a cell is occupied by a widget
  const isCellOccupied = (cell) => {
    if (!currentLayout || !currentLayout.widgets) return false;
    
    return Object.values(currentLayout.widgets).some(widget => {
      if (!widget.visible || !widget.position) return false;
      
      return (
        cell.row === widget.position.row &&
        cell.col >= widget.position.col &&
        cell.col < widget.position.col + widget.position.width
      );
    });
  };

  return (
    <div 
      ref={gridRef}
      className={classNames('dashboard-grid', {
        'edit-mode': editMode,
        'dragging': isDragging
      })}
    >
      {/* Grid overlay for edit mode */}
      {editMode && (
        <div className="grid-overlay">
          {gridCells.map((cell, index) => (
            <div
              key={index}
              className={classNames('grid-cell', {
                'hovered': isCellHovered(cell),
                'occupied': isCellOccupied(cell),
                'drop-target': dropTarget && 
                  dropTarget.row === cell.row && 
                  dropTarget.col === cell.col
              })}
              style={{
                gridColumn: cell.col + 1,
                gridRow: cell.row + 1
              }}
              onDragOver={(e) => handleCellDragOver(e, cell)}
              onDragLeave={handleCellDragLeave}
              onDrop={(e) => handleCellDrop(e, cell)}
            />
          ))}
        </div>
      )}
      
      {/* Widgets */}
      <div className="widgets-container">
        {children}
      </div>
      
      {/* Drop indicator */}
      {isDragging && hoveredCell && (
        <div 
          className="drop-indicator"
          style={{
            gridColumn: `${hoveredCell.col + 1} / span ${hoveredCell.width}`,
            gridRow: hoveredCell.row + 1
          }}
        />
      )}
    </div>
  );
};

export default DashboardGrid;