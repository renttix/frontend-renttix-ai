import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import CalendarControls from './CalendarControls';
import CalendarContextMenu from './CalendarContextMenu';
import JobCard from './JobCard';
import {
  fetchCalendarData,
  updateJobAssignment,
  setDraggedJob,
  setHoveredCell,
  optimisticMoveJob,
  selectFilteredJobs,
  selectRoutes,
  selectDateRange,
  selectViewMode,
  selectDraggedJob,
  selectHoveredCell,
  selectCalendarLoading,
  selectCalendarError
} from '../../../store/slices/calendarSlice';
import './CalendarWidget.css';

const CalendarWidget = ({ config }) => {
  const dispatch = useDispatch();
  const toast = useRef(null);
  const contextMenu = useRef(null);
  const tableRef = useRef(null);
  
  const jobs = useSelector(selectFilteredJobs);
  const routes = useSelector(selectRoutes);
  const dateRange = useSelector(selectDateRange);
  const viewMode = useSelector(selectViewMode);
  const draggedJob = useSelector(selectDraggedJob);
  const hoveredCell = useSelector(selectHoveredCell);
  const loading = useSelector(selectCalendarLoading);
  const error = useSelector(selectCalendarError);
  
  const [calendarData, setCalendarData] = useState([]);
  const [columns, setColumns] = useState([]);

  // Generate date columns based on view mode and date range
  const generateDateColumns = useCallback(() => {
    const cols = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      cols.push({
        field: dateStr,
        header: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        date: new Date(date)
      });
    }
    
    return cols;
  }, [dateRange]);

  // Transform jobs data into calendar grid format
  const transformJobsToCalendarData = useCallback(() => {
    const data = [];
    
    // Add unassigned jobs row
    const unassignedRow = {
      id: 'unassigned',
      routeName: 'Unassigned Jobs',
      isUnassigned: true
    };
    
    // Add route rows
    routes.forEach(route => {
      const routeRow = {
        id: route._id,
        routeName: route.name,
        routeColor: route.color,
        capacity: route.capacity
      };
      data.push(routeRow);
    });
    
    // Distribute jobs to appropriate cells
    const dateColumns = generateDateColumns();
    
    data.forEach(row => {
      dateColumns.forEach(col => {
        const dateStr = col.field;
        row[dateStr] = jobs.filter(job => {
          const jobDate = new Date(job.date).toISOString().split('T')[0];
          if (row.isUnassigned) {
            return !job.routeId && jobDate === dateStr;
          }
          return job.routeId === row.id && jobDate === dateStr;
        });
      });
    });
    
    // Add unassigned row at the end
    data.push(unassignedRow);
    
    return data;
  }, [jobs, routes, generateDateColumns]);

  // Load calendar data
  useEffect(() => {
    dispatch(fetchCalendarData({ 
      startDate: dateRange.start, 
      endDate: dateRange.end 
    }));
  }, [dispatch, dateRange]);

  // Update calendar data when jobs or routes change
  useEffect(() => {
    setCalendarData(transformJobsToCalendarData());
    setColumns(generateDateColumns());
  }, [transformJobsToCalendarData, generateDateColumns]);

  // Handle drag start
  const handleDragStart = (job) => {
    dispatch(setDraggedJob(job));
  };

  // Handle drag end
  const handleDragEnd = () => {
    dispatch(setDraggedJob(null));
    dispatch(setHoveredCell(null));
  };

  // Handle drag over
  const handleDragOver = (e, routeId, date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedJob) {
      dispatch(setHoveredCell({ routeId, date }));
    }
  };

  // Handle drag leave
  const handleDragLeave = () => {
    dispatch(setHoveredCell(null));
  };

  // Handle drop
  const handleDrop = async (e, routeId, date) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { jobId, routeId: previousRouteId, date: previousDate } = data;
      
      if (!draggedJob || draggedJob._id !== jobId) return;
      
      // Don't do anything if dropped in the same location
      if (routeId === previousRouteId && date.toISOString() === previousDate) {
        handleDragEnd();
        return;
      }
      
      // Optimistic update
      dispatch(optimisticMoveJob({
        jobId,
        fromRouteId: previousRouteId,
        toRouteId: routeId,
        fromDate: previousDate,
        toDate: date.toISOString()
      }));
      
      // Actual update
      await dispatch(updateJobAssignment({
        jobId,
        routeId,
        date,
        previousRouteId,
        previousDate
      })).unwrap();
      
      toast.current.show({
        severity: 'success',
        summary: 'Job Moved',
        detail: 'Job assignment updated successfully',
        life: 3000
      });
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to update job assignment',
        life: 5000
      });
    } finally {
      handleDragEnd();
    }
  };

  // Handle context menu
  const handleContextMenu = (e, job) => {
    if (contextMenu.current) {
      contextMenu.current.show(e, job);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchCalendarData({ 
      startDate: dateRange.start, 
      endDate: dateRange.end 
    }));
  };

  // Route name column template
  const routeNameTemplate = (rowData) => {
    return (
      <div className="calendar-route-cell">
        {rowData.routeColor && (
          <div 
            className="calendar-route-color" 
            style={{ backgroundColor: rowData.routeColor }}
          />
        )}
        <span className="calendar-route-name">{rowData.routeName}</span>
        {rowData.capacity && (
          <span className="calendar-route-capacity">
            (Capacity: {rowData.capacity})
          </span>
        )}
      </div>
    );
  };

  // Job cell template
  const jobCellTemplate = (rowData, column) => {
    const jobs = rowData[column.field] || [];
    const isHovered = hoveredCell && 
      hoveredCell.routeId === rowData.id && 
      hoveredCell.date === column.field;
    
    return (
      <div
        className={`calendar-cell ${isHovered ? 'calendar-cell-hover' : ''}`}
        onDragOver={(e) => handleDragOver(e, rowData.id, column.date)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, rowData.id, column.date)}
      >
        {jobs.map(job => (
          <JobCard
            key={job._id}
            job={job}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onContextMenu={handleContextMenu}
            isDragging={draggedJob && draggedJob._id === job._id}
          />
        ))}
        {jobs.length === 0 && (
          <div className="calendar-cell-empty">
            {isHovered && <div className="calendar-cell-drop-indicator">Drop here</div>}
          </div>
        )}
      </div>
    );
  };

  const widgetContent = (
    <div className="calendar-widget">
      <Toast ref={toast} />
      <CalendarContextMenu ref={contextMenu} />
      
      <CalendarControls onRefresh={handleRefresh} />
      
      {loading && (
        <div className="calendar-loading">
          <ProgressSpinner />
        </div>
      )}
      
      {error && (
        <div className="calendar-error">
          <i className="pi pi-exclamation-triangle" />
          <span>{error}</span>
        </div>
      )}
      
      {!loading && !error && (
        <div className="calendar-grid-container">
          <DataTable
            ref={tableRef}
            value={calendarData}
            scrollable
            scrollHeight="calc(100vh - 300px)"
            className="calendar-datatable"
            rowClassName={(rowData) => rowData.isUnassigned ? 'calendar-unassigned-row' : ''}
          >
            <Column
              field="routeName"
              header="Routes"
              frozen
              style={{ width: '200px' }}
              body={routeNameTemplate}
              className="calendar-route-column"
            />
            
            {columns.map(col => (
              <Column
                key={col.field}
                field={col.field}
                header={col.header}
                style={{ width: '180px' }}
                body={(rowData) => jobCellTemplate(rowData, col)}
                className="calendar-date-column"
              />
            ))}
          </DataTable>
        </div>
      )}
    </div>
  );

  // If we're in a dashboard context with BaseWidget, use it
  if (config?.useBaseWidget && typeof BaseWidget !== 'undefined') {
    const BaseWidget = require('../BaseWidget').default;
    return (
      <BaseWidget
        config={{
          ...config,
          title: 'Rental Calendar',
          icon: 'pi pi-calendar'
        }}
      >
        {widgetContent}
      </BaseWidget>
    );
  }

  // Otherwise, render directly with a Card
  return (
    <Card
      title={config?.title || 'Rental Calendar'}
      className="calendar-widget-card"
      style={{ height: '100%' }}
    >
      {widgetContent}
    </Card>
  );
};

export default CalendarWidget;