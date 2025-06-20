import React, { useState, useEffect } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { taskTypeService } from '@/services/taskTypeService';
import RouteSelector from './RouteSelector';
import { useWizard } from '../context/WizardContext';
import '../styles/InlineMaintenanceConfig.css';

// Duration options
const durationOptions = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 }
];

// Priority options
const priorityOptions = [
  { label: 'Low', value: 'low', icon: 'pi pi-arrow-down', color: '#10B981' },
  { label: 'Medium', value: 'medium', icon: 'pi pi-minus', color: '#F59E0B' },
  { label: 'High', value: 'high', icon: 'pi pi-arrow-up', color: '#EF4444' },
  { label: 'Urgent', value: 'urgent', icon: 'pi pi-exclamation-circle', color: '#DC2626' }
];

// Helper function to get default task type keyword
const getDefaultTaskTypeKeyword = (productName) => {
  const name = (productName || '').toLowerCase();
  if (name.includes('toilet')) return 'clean';
  if (name.includes('generator')) return 'inspect';
  if (name.includes('pump')) return 'service';
  return 'standard';
};

// Smart defaults based on product type
const getSmartDefaults = (productName, deliveryDate) => {
  const name = (productName || '').toLowerCase();
  const baseDate = deliveryDate ? new Date(deliveryDate) : new Date();
  
  // Product-specific defaults
  if (name.includes('toilet') || name.includes('portable')) {
    return {
      repeatEveryXDays: 7,
      firstMaintenanceDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      serviceType: 'cleaning',
      estimatedDuration: 15,
      priority: 'medium'
    };
  } else if (name.includes('generator') || name.includes('power')) {
    return {
      repeatEveryXDays: 30,
      firstMaintenanceDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      serviceType: 'inspection',
      estimatedDuration: 30,
      priority: 'medium'
    };
  } else if (name.includes('pump') || name.includes('compressor')) {
    return {
      repeatEveryXDays: 14,
      firstMaintenanceDate: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
      serviceType: 'inspection',
      estimatedDuration: 45,
      priority: 'medium'
    };
  } else {
    // Default for other products
    return {
      repeatEveryXDays: 30,
      firstMaintenanceDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      serviceType: 'inspection',
      estimatedDuration: 30,
      priority: 'medium'
    };
  }
};

export default function InlineMaintenanceConfig({
  product,
  enabled,
  onToggle,
  config,
  onChange,
  deliveryDate
}) {
  const { state } = useWizard();
  const { formData } = state;
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [taskTypes, setTaskTypes] = useState([]);
  const [loadingTaskTypes, setLoadingTaskTypes] = useState(false);
  const [scheduleType, setScheduleType] = useState(config.scheduleType || 'interval');
  const [selectedWeekDays, setSelectedWeekDays] = useState(config.weekDays || []);
  const [endCondition, setEndCondition] = useState(config.endCondition || 'rental_end');
  const [endDate, setEndDate] = useState(config.endDate ? new Date(config.endDate) : null);
  const [occurrenceCount, setOccurrenceCount] = useState(config.occurrenceCount || 10);
  
  // Load task types when component mounts and maintenance is enabled
  useEffect(() => {
    if (enabled) {
      loadTaskTypes();
    }
  }, [enabled]);
  
  // Initialize with smart defaults when maintenance is enabled
  useEffect(() => {
    if (enabled && !config.firstMaintenanceDate) {
      const defaults = getSmartDefaults(product?.name, deliveryDate);
      onChange({
        requiresMaintenance: true,
        ...defaults,
        continuesUntilTermination: true,
        frequencyPer7Days: 1
      });
    }
  }, [enabled, product?.name, deliveryDate]);
  
  const loadTaskTypes = async () => {
    setLoadingTaskTypes(true);
    try {
      const types = await taskTypeService.getTaskTypes();
      setTaskTypes(types);
      
      // If no task type selected, set default
      if (!config.taskTypeId && types.length > 0) {
        const defaultType = types.find(t =>
          t.name.toLowerCase().includes(getDefaultTaskTypeKeyword(product?.name))
        ) || types[0];
        
        onChange({
          ...config,
          taskTypeId: defaultType._id,
          taskTypeName: defaultType.name,
          estimatedDuration: defaultType.defaultDuration || config.estimatedDuration
        });
      }
    } catch (error) {
      console.error('Error loading task types:', error);
    } finally {
      setLoadingTaskTypes(false);
    }
  };
  
  const handleToggle = (checked) => {
    onToggle(checked);
    if (checked) {
      const defaults = getSmartDefaults(product?.name, deliveryDate);
      onChange({
        requiresMaintenance: true,
        ...defaults,
        continuesUntilTermination: true,
        frequencyPer7Days: 1,
        scheduleType: 'interval',
        endCondition: 'rental_end'
      });
      // Load task types when enabling maintenance
      loadTaskTypes();
      // Set default schedule type
      setScheduleType('interval');
      setEndCondition('rental_end');
    } else {
      onChange({ requiresMaintenance: false });
    }
  };
  
  const handleTaskTypeChange = (e) => {
    const selectedType = taskTypes.find(t => t._id === e.value);
    onChange({
      ...config,
      taskTypeId: e.value,
      taskTypeName: selectedType?.name,
      estimatedDuration: selectedType?.defaultDuration || config.estimatedDuration
    });
  };
  
  const handleRouteChange = (routeData) => {
    onChange({
      ...config,
      route: routeData
    });
  };
  
  const frequencyOptions = [
    { label: 'Daily', value: 7 },
    { label: 'Twice a week', value: 2 },
    { label: 'Weekly', value: 1 },
    { label: 'Fortnightly', value: 0.5 },
    { label: 'Monthly', value: 0.25 }
  ];
  
  // Enhanced scheduling options
  const scheduleTypeOptions = [
    { label: 'One-time', value: 'once' },
    { label: 'Daily', value: 'daily' },
    { label: 'Every X Days', value: 'interval' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  // Week days for weekly scheduling
  const weekDayOptions = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 }
  ];

  // End condition options
  const endConditionOptions = [
    { label: 'Until rental ends', value: 'rental_end' },
    { label: 'Specific date', value: 'date' },
    { label: 'After X occurrences', value: 'count' },
    { label: 'No end date', value: 'never' }
  ];
  
  return (
    <div className="inline-maintenance-config">
      <div className="flex align-items-center gap-2">
        <Checkbox
          inputId={`maintenance-${product?._id || 'default'}`}
          checked={enabled}
          onChange={(e) => handleToggle(e.checked)}
        />
        <label htmlFor={`maintenance-${product?._id || 'default'}`} className="cursor-pointer font-medium">
          Maintenance
        </label>
      </div>
      
      {enabled && (
        <div className="ml-6 mt-2 p-3 surface-100 border-round">
          {/* Main Configuration Grid */}
          <div className="grid main-controls">
            {/* First Service Date */}
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm text-600 block mb-1">First Service</label>
              <Calendar
                value={config.firstMaintenanceDate ? new Date(config.firstMaintenanceDate) : null}
                onChange={(e) => onChange({ ...config, firstMaintenanceDate: e.value })}
                dateFormat="dd/mm/yy"
                minDate={new Date()}
                showIcon
                className="p-inputtext-sm w-full"
              />
            </div>
            
            {/* Frequency */}
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm text-600 block mb-1">Frequency</label>
              {scheduleType === 'once' ? (
                <div className="text-sm mt-2">One-time service</div>
              ) : scheduleType === 'daily' ? (
                <div className="text-sm mt-2">Every day</div>
              ) : scheduleType === 'weekly' ? (
                <div className="text-sm mt-2">Weekly (see advanced)</div>
              ) : scheduleType === 'monthly' ? (
                <div className="flex align-items-center gap-2">
                  <span className="text-sm">Day</span>
                  <InputNumber
                    value={config.monthDay || 1}
                    onValueChange={(e) => onChange({ ...config, monthDay: e.value })}
                    min={1}
                    max={31}
                    className="p-inputtext-sm"
                    style={{ width: '50px' }}
                  />
                  <span className="text-sm">of month</span>
                </div>
              ) : (
                <div className="flex align-items-center gap-2">
                  <span className="text-sm">Every</span>
                  <InputNumber
                    value={config.repeatEveryXDays}
                    onValueChange={(e) => onChange({ ...config, repeatEveryXDays: e.value })}
                    min={1}
                    max={365}
                    className="p-inputtext-sm"
                    style={{ width: '60px' }}
                  />
                  <span className="text-sm">days</span>
                </div>
              )}
            </div>
            
            {/* Task Type */}
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm text-600 block mb-1">Task Type</label>
              {loadingTaskTypes ? (
                <div className="flex align-items-center justify-content-center" style={{ height: '32px' }}>
                  <ProgressSpinner style={{ width: '20px', height: '20px' }} />
                </div>
              ) : (
                <Dropdown
                  value={config.taskTypeId}
                  options={taskTypes}
                  onChange={handleTaskTypeChange}
                  optionLabel="name"
                  optionValue="_id"
                  placeholder="Select task"
                  className="p-inputtext-sm w-full"
                  showClear
                />
              )}
            </div>
            
            {/* Duration */}
            <div className="col-12 md:col-6 lg:col-3">
              <label className="text-sm text-600 block mb-1">Duration</label>
              <Dropdown
                value={config.estimatedDuration || 30}
                options={durationOptions}
                onChange={(e) => onChange({ ...config, estimatedDuration: e.value })}
                placeholder="Duration"
                className="p-inputtext-sm w-full"
              />
            </div>
          </div>
          
          {/* Route Assignment */}
          {formData.deliveryCoordinates && (
            <div className="mt-3">
              <label className="text-sm text-600 block mb-2">Route Assignment</label>
              <RouteSelector
                deliveryCoordinates={formData.deliveryCoordinates}
                vendorId={formData.vendorId}
                currentRoute={config.route}
                onRouteChange={handleRouteChange}
                productId={product?._id}
                productName={product?.name}
                maintenanceDate={config.firstMaintenanceDate}
              />
            </div>
          )}
          
          {/* Advanced Options Toggle */}
          <div className="mt-3">
            {!showAdvanced ? (
              <Button
                label="More Options"
                icon="pi pi-angle-down"
                className="p-button-text p-button-sm"
                onClick={() => setShowAdvanced(true)}
              />
            ) : (
              <Button
                label="Less Options"
                icon="pi pi-angle-up"
                className="p-button-text p-button-sm"
                onClick={() => setShowAdvanced(false)}
              />
            )}
          </div>
          
          {showAdvanced && (
            <div className="mt-3 pt-3 border-top-1 surface-border">
              <div className="grid">
                {/* Priority */}
                <div className="col-12 md:col-6">
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <Dropdown
                    value={config.priority || 'medium'}
                    options={priorityOptions}
                    onChange={(e) => onChange({ ...config, priority: e.value })}
                    placeholder="Select priority"
                    className="w-full p-inputtext-sm"
                    itemTemplate={(option) => (
                      <div className="flex align-items-center gap-2">
                        <i className={option.icon} style={{ color: option.color }}></i>
                        <span>{option.label}</span>
                      </div>
                    )}
                    valueTemplate={(option) => option ? (
                      <div className="flex align-items-center gap-2">
                        <i className={priorityOptions.find(p => p.value === option)?.icon}
                           style={{ color: priorityOptions.find(p => p.value === option)?.color }}></i>
                        <span>{priorityOptions.find(p => p.value === option)?.label}</span>
                      </div>
                    ) : null}
                  />
                </div>
                
                {/* Schedule Type */}
                <div className="col-12 md:col-6">
                  <label className="text-sm font-medium mb-1 block">Schedule Type</label>
                  <Dropdown
                    value={scheduleType}
                    options={scheduleTypeOptions}
                    onChange={(e) => {
                      setScheduleType(e.value);
                      onChange({
                        ...config,
                        scheduleType: e.value,
                        // Reset frequency based on type
                        repeatEveryXDays: e.value === 'daily' ? 1 :
                                         e.value === 'weekly' ? 7 :
                                         e.value === 'monthly' ? 30 :
                                         config.repeatEveryXDays
                      });
                    }}
                    placeholder="Select schedule type"
                    className="w-full p-inputtext-sm"
                  />
                </div>
                
                {/* Weekly Day Selection */}
                {scheduleType === 'weekly' && (
                  <div className="col-12">
                    <label className="text-sm font-medium mb-1 block">Select Days</label>
                    <div className="flex flex-wrap gap-2">
                      {weekDayOptions.map(day => (
                        <div key={day.value} className="flex align-items-center">
                          <Checkbox
                            inputId={`day-${day.value}`}
                            checked={selectedWeekDays.includes(day.value)}
                            onChange={(e) => {
                              const newDays = e.checked
                                ? [...selectedWeekDays, day.value]
                                : selectedWeekDays.filter(d => d !== day.value);
                              setSelectedWeekDays(newDays);
                              onChange({ ...config, weekDays: newDays });
                            }}
                          />
                          <label htmlFor={`day-${day.value}`} className="ml-2 text-sm">
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* End Condition */}
                <div className="col-12 md:col-6">
                  <label className="text-sm font-medium mb-1 block">End Condition</label>
                  <Dropdown
                    value={endCondition}
                    options={endConditionOptions}
                    onChange={(e) => {
                      setEndCondition(e.value);
                      onChange({
                        ...config,
                        endCondition: e.value,
                        continuesUntilTermination: e.value === 'rental_end'
                      });
                    }}
                    placeholder="Select end condition"
                    className="w-full p-inputtext-sm"
                  />
                </div>
                
                {/* End Date (if specific date selected) */}
                {endCondition === 'date' && (
                  <div className="col-12 md:col-6">
                    <label className="text-sm font-medium mb-1 block">End Date</label>
                    <Calendar
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.value);
                        onChange({ ...config, endDate: e.value });
                      }}
                      dateFormat="dd/mm/yy"
                      minDate={new Date()}
                      showIcon
                      className="p-inputtext-sm w-full"
                    />
                  </div>
                )}
                
                {/* Occurrence Count (if count selected) */}
                {endCondition === 'count' && (
                  <div className="col-12 md:col-6">
                    <label className="text-sm font-medium mb-1 block">Number of Occurrences</label>
                    <InputNumber
                      value={occurrenceCount}
                      onValueChange={(e) => {
                        setOccurrenceCount(e.value);
                        onChange({ ...config, occurrenceCount: e.value });
                      }}
                      min={1}
                      max={100}
                      className="p-inputtext-sm w-full"
                    />
                  </div>
                )}
                
                {/* Access Requirements */}
                <div className="col-12">
                  <label className="text-sm font-medium mb-1 block">Access Requirements / Special Notes</label>
                  <InputTextarea
                    value={config.accessRequirements || ''}
                    onChange={(e) => onChange({ ...config, accessRequirements: e.target.value })}
                    rows={3}
                    placeholder="Enter any special access requirements, gate codes, or notes for the maintenance team..."
                    className="w-full p-inputtext-sm"
                    autoResize
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}