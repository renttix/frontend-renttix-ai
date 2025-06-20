import React from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setDateRange, 
  setViewMode, 
  setFilters,
  selectDateRange,
  selectViewMode,
  selectFilters,
  selectRoutes
} from '../../../store/slices/calendarSlice';
import './CalendarControls.css';

const CalendarControls = ({ onRefresh }) => {
  const dispatch = useDispatch();
  const dateRange = useSelector(selectDateRange);
  const viewMode = useSelector(selectViewMode);
  const filters = useSelector(selectFilters);
  const routes = useSelector(selectRoutes);

  const viewModeOptions = [
    { label: 'Day', value: 'day', icon: 'pi pi-calendar' },
    { label: 'Week', value: 'week', icon: 'pi pi-calendar-plus' },
    { label: 'Month', value: 'month', icon: 'pi pi-calendar-times' }
  ];

  const jobTypeOptions = [
    { label: 'Delivery', value: 'delivery' },
    { label: 'Collection', value: 'collection' },
    { label: 'Service', value: 'service' }
  ];

  const statusOptions = [
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  const handleDateChange = (direction) => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    let days = 1;
    if (viewMode === 'week') days = 7;
    else if (viewMode === 'month') days = 30;
    
    if (direction === 'prev') {
      start.setDate(start.getDate() - days);
      end.setDate(end.getDate() - days);
    } else {
      start.setDate(start.getDate() + days);
      end.setDate(end.getDate() + days);
    }
    
    dispatch(setDateRange({ start, end }));
  };

  const handleToday = () => {
    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);
    
    if (viewMode === 'week') {
      // Get start of week (Sunday)
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      // Get end of week (Saturday)
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (viewMode === 'month') {
      // Get start of month
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      // Get end of month
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    dispatch(setDateRange({ start, end }));
  };

  const handleViewModeChange = (e) => {
    dispatch(setViewMode(e.value));
    // Adjust date range based on new view mode
    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);
    
    if (e.value === 'week') {
      start.setDate(today.getDate() - today.getDay());
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (e.value === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    dispatch(setDateRange({ start, end }));
  };

  const handleRouteFilterChange = (e) => {
    dispatch(setFilters({ routes: e.value }));
  };

  const handleJobTypeFilterChange = (e) => {
    dispatch(setFilters({ jobTypes: e.value }));
  };

  const handleStatusFilterChange = (e) => {
    dispatch(setFilters({ status: e.value }));
  };

  const formatDateRange = () => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const start = new Date(dateRange.start).toLocaleDateString('en-US', options);
    const end = new Date(dateRange.end).toLocaleDateString('en-US', options);
    
    if (viewMode === 'day') {
      return start;
    }
    return `${start} - ${end}`;
  };

  return (
    <div className="calendar-controls">
      <div className="calendar-controls-left">
        <Button
          icon="pi pi-chevron-left"
          onClick={() => handleDateChange('prev')}
          className="p-button-text"
          tooltip="Previous"
          tooltipOptions={{ position: 'bottom' }}
        />
        
        <Button
          label="Today"
          onClick={handleToday}
          className="p-button-outlined p-button-sm"
        />
        
        <Button
          icon="pi pi-chevron-right"
          onClick={() => handleDateChange('next')}
          className="p-button-text"
          tooltip="Next"
          tooltipOptions={{ position: 'bottom' }}
        />
        
        <span className="calendar-date-range">{formatDateRange()}</span>
      </div>
      
      <div className="calendar-controls-center">
        <Dropdown
          value={viewMode}
          options={viewModeOptions}
          onChange={handleViewModeChange}
          optionLabel="label"
          className="calendar-view-dropdown"
        />
      </div>
      
      <div className="calendar-controls-right">
        <MultiSelect
          value={filters.routes}
          options={routes.map(r => ({ label: r.name, value: r._id }))}
          onChange={handleRouteFilterChange}
          placeholder="All Routes"
          className="calendar-filter-dropdown"
          display="chip"
          maxSelectedLabels={2}
        />
        
        <MultiSelect
          value={filters.jobTypes}
          options={jobTypeOptions}
          onChange={handleJobTypeFilterChange}
          placeholder="All Types"
          className="calendar-filter-dropdown"
          display="chip"
          maxSelectedLabels={2}
        />
        
        <MultiSelect
          value={filters.status}
          options={statusOptions}
          onChange={handleStatusFilterChange}
          placeholder="All Status"
          className="calendar-filter-dropdown"
          display="chip"
          maxSelectedLabels={2}
        />
        
        <Button
          icon="pi pi-refresh"
          onClick={onRefresh}
          className="p-button-text"
          tooltip="Refresh"
          tooltipOptions={{ position: 'bottom' }}
        />
      </div>
    </div>
  );
};

export default CalendarControls;