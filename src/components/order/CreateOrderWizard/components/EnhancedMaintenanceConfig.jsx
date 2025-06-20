import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, Wrench, Users } from 'lucide-react';
import axios from 'axios';
import './EnhancedMaintenanceConfig.css';

const EnhancedMaintenanceConfig = ({ 
  maintenanceConfig, 
  onMaintenanceChange, 
  location,
  vendorId 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [routeAvailability, setRouteAvailability] = useState(null);
  const [checkingRoute, setCheckingRoute] = useState(false);
  const [taskTypes, setTaskTypes] = useState([]);
  const [loadingTaskTypes, setLoadingTaskTypes] = useState(false);

  const steps = [
    { id: 'enable', title: 'Enable Maintenance', icon: Wrench },
    { id: 'schedule', title: 'Schedule', icon: Calendar },
    { id: 'service', title: 'Service Details', icon: Clock },
    { id: 'route', title: 'Route Assignment', icon: MapPin }
  ];

  // Load task types
  useEffect(() => {
    if (maintenanceConfig?.enabled && activeStep === 2) {
      loadTaskTypes();
    }
  }, [maintenanceConfig?.enabled, activeStep]);

  // Check route availability when reaching route step
  useEffect(() => {
    if (activeStep === 3 && location && maintenanceConfig?.enabled) {
      checkRouteAvailability();
    }
  }, [activeStep, location, maintenanceConfig]);

  const loadTaskTypes = async () => {
    setLoadingTaskTypes(true);
    try {
      const response = await axios.get('/api/task-types');
      setTaskTypes(response.data.data || []);
    } catch (error) {
      console.error('Error loading task types:', error);
    } finally {
      setLoadingTaskTypes(false);
    }
  };

  const checkRouteAvailability = async () => {
    if (!location || !maintenanceConfig) return;

    setCheckingRoute(true);
    try {
      const response = await axios.post('/api/maintenance/check-route', {
        location,
        vendorId,
        maintenanceConfig
      });
      setRouteAvailability(response.data.data);
    } catch (error) {
      console.error('Error checking route availability:', error);
      setRouteAvailability(null);
    } finally {
      setCheckingRoute(false);
    }
  };

  const handleStepClick = (stepIndex) => {
    if (!maintenanceConfig?.enabled && stepIndex > 0) return;
    setActiveStep(stepIndex);
  };

  const handleEnableToggle = () => {
    const newEnabled = !maintenanceConfig?.enabled;
    onMaintenanceChange({
      ...maintenanceConfig,
      enabled: newEnabled,
      // Reset other fields when disabling
      ...(newEnabled ? {} : {
        schedule: null,
        serviceDetails: null,
        routeAssignment: null
      })
    });
    
    if (newEnabled && activeStep === 0) {
      setActiveStep(1); // Auto-advance to schedule
    }
  };

  const handleScheduleChange = (scheduleData) => {
    onMaintenanceChange({
      ...maintenanceConfig,
      schedule: scheduleData
    });
  };

  const handleServiceDetailsChange = (serviceData) => {
    onMaintenanceChange({
      ...maintenanceConfig,
      serviceDetails: serviceData
    });
  };

  const renderStepIndicator = () => (
    <div className="maintenance-steps">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === activeStep;
        const isCompleted = maintenanceConfig?.enabled && index < activeStep;
        const isDisabled = !maintenanceConfig?.enabled && index > 0;

        return (
          <div
            key={step.id}
            className={`maintenance-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={() => handleStepClick(index)}
          >
            <div className="step-icon">
              <Icon size={20} />
            </div>
            <span className="step-title">{step.title}</span>
          </div>
        );
      })}
    </div>
  );

  const renderEnableStep = () => (
    <div className="step-content enable-step">
      <h3>Maintenance Service</h3>
      <p>Enable regular maintenance to keep equipment in optimal condition</p>
      
      <div className="enable-toggle-container">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={maintenanceConfig?.enabled || false}
            onChange={handleEnableToggle}
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="toggle-label">
          {maintenanceConfig?.enabled ? 'Maintenance Enabled' : 'Enable Maintenance'}
        </span>
      </div>

      {maintenanceConfig?.enabled && (
        <div className="benefits-list">
          <div className="benefit-item">
            <CheckCircle size={16} className="benefit-icon" />
            <span>Extend equipment lifespan</span>
          </div>
          <div className="benefit-item">
            <CheckCircle size={16} className="benefit-icon" />
            <span>Reduce breakdown risks</span>
          </div>
          <div className="benefit-item">
            <CheckCircle size={16} className="benefit-icon" />
            <span>Maintain optimal performance</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderScheduleStep = () => (
    <div className="step-content schedule-step">
      <h3>Maintenance Schedule</h3>
      
      <div className="frequency-options">
        <label className="frequency-option">
          <input
            type="radio"
            name="frequency"
            value="weekly"
            checked={maintenanceConfig?.schedule?.frequency?.type === 'weekly'}
            onChange={() => handleScheduleChange({
              ...maintenanceConfig.schedule,
              frequency: { type: 'weekly', weekDays: [1] }
            })}
          />
          <span>Weekly</span>
        </label>
        
        <label className="frequency-option">
          <input
            type="radio"
            name="frequency"
            value="biweekly"
            checked={maintenanceConfig?.schedule?.frequency?.type === 'biweekly'}
            onChange={() => handleScheduleChange({
              ...maintenanceConfig.schedule,
              frequency: { type: 'biweekly', weekDays: [1] }
            })}
          />
          <span>Bi-weekly</span>
        </label>
        
        <label className="frequency-option">
          <input
            type="radio"
            name="frequency"
            value="monthly"
            checked={maintenanceConfig?.schedule?.frequency?.type === 'monthly'}
            onChange={() => handleScheduleChange({
              ...maintenanceConfig.schedule,
              frequency: { type: 'monthly', dayOfMonth: 1 }
            })}
          />
          <span>Monthly</span>
        </label>
      </div>

      {maintenanceConfig?.schedule?.frequency?.type === 'weekly' && (
        <div className="weekday-selector">
          <h4>Select Day(s)</h4>
          <div className="weekday-options">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <label key={day} className="weekday-option">
                <input
                  type="checkbox"
                  checked={maintenanceConfig.schedule.frequency.weekDays?.includes(index + 1)}
                  onChange={(e) => {
                    const days = maintenanceConfig.schedule.frequency.weekDays || [];
                    const newDays = e.target.checked
                      ? [...days, index + 1]
                      : days.filter(d => d !== index + 1);
                    
                    handleScheduleChange({
                      ...maintenanceConfig.schedule,
                      frequency: {
                        ...maintenanceConfig.schedule.frequency,
                        weekDays: newDays.sort()
                      }
                    });
                  }}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="start-date-selector">
        <label>
          <span>Start Date</span>
          <input
            type="date"
            value={maintenanceConfig?.schedule?.startDate || ''}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleScheduleChange({
              ...maintenanceConfig.schedule,
              startDate: e.target.value
            })}
          />
        </label>
      </div>
    </div>
  );

  const renderServiceStep = () => (
    <div className="step-content service-step">
      <h3>Service Details</h3>
      
      {loadingTaskTypes ? (
        <div className="loading">Loading task types...</div>
      ) : (
        <>
          <div className="form-group">
            <label>Task Type</label>
            <select
              value={maintenanceConfig?.serviceDetails?.taskType || ''}
              onChange={(e) => {
                const selectedType = taskTypes.find(t => t.name === e.target.value);
                handleServiceDetailsChange({
                  ...maintenanceConfig.serviceDetails,
                  taskType: e.target.value,
                  estimatedDuration: selectedType?.estimatedDuration || 30
                });
              }}
            >
              <option value="">Select task type</option>
              {taskTypes.map(type => (
                <option key={type._id} value={type.name}>
                  {type.name} ({type.estimatedDuration} min)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              value={maintenanceConfig?.serviceDetails?.priority || 'medium'}
              onChange={(e) => handleServiceDetailsChange({
                ...maintenanceConfig.serviceDetails,
                priority: e.target.value
              })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estimated Duration</label>
            <div className="duration-display">
              <Clock size={16} />
              <span>{maintenanceConfig?.serviceDetails?.estimatedDuration || 30} minutes</span>
              <small>(Set in system settings)</small>
            </div>
          </div>

          <div className="form-group">
            <label>Special Instructions</label>
            <textarea
              rows="3"
              placeholder="Any special instructions for the technician..."
              value={maintenanceConfig?.serviceDetails?.notes || ''}
              onChange={(e) => handleServiceDetailsChange({
                ...maintenanceConfig.serviceDetails,
                notes: e.target.value
              })}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderRouteStep = () => (
    <div className="step-content route-step">
      <h3>Route Assignment</h3>
      
      {checkingRoute ? (
        <div className="checking-route">
          <div className="spinner"></div>
          <span>Checking route availability...</span>
        </div>
      ) : routeAvailability ? (
        <div className="route-availability">
          {routeAvailability.available ? (
            <div className="route-available">
              <div className="success-header">
                <CheckCircle className="success-icon" />
                <h4>Route Available</h4>
              </div>
              
              <div className="route-details">
                <div className="route-info">
                  <div 
                    className="route-color-indicator" 
                    style={{ backgroundColor: routeAvailability.route.color }}
                  />
                  <div>
                    <strong>{routeAvailability.route.name}</strong>
                    <p>{routeAvailability.route.dayOfWeek}</p>
                  </div>
                </div>
                
                {routeAvailability.route.driver && (
                  <div className="driver-info">
                    <Users size={16} />
                    <span>Driver: {routeAvailability.route.driver.name}</span>
                  </div>
                )}
                
                <div className="capacity-info">
                  <span>Capacity: {routeAvailability.route.currentLoad}/{routeAvailability.route.capacity}</span>
                  <div className="capacity-bar">
                    <div 
                      className="capacity-fill"
                      style={{ width: `${(routeAvailability.route.currentLoad / routeAvailability.route.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <p className="auto-assign-note">
                This maintenance will be automatically assigned to this route
              </p>
            </div>
          ) : (
            <div className="route-unavailable">
              <div className="warning-header">
                <AlertCircle className="warning-icon" />
                <h4>No Route Available</h4>
              </div>
              
              <p>{routeAvailability.reason}</p>
              
              {routeAvailability.suggestions && routeAvailability.suggestions.length > 0 && (
                <div className="suggestions">
                  <h5>Suggestions:</h5>
                  <ul>
                    {routeAvailability.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="floating-task-notice">
                <AlertCircle size={16} />
                <p>
                  This maintenance will be added to the floating tasks queue 
                  and can be manually assigned later.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : location ? (
        <div className="no-location-warning">
          <AlertCircle className="warning-icon" />
          <p>Unable to check route availability. Please try again.</p>
        </div>
      ) : (
        <div className="no-location-warning">
          <AlertCircle className="warning-icon" />
          <p>Please enter a delivery address to check route availability.</p>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderEnableStep();
      case 1:
        return renderScheduleStep();
      case 2:
        return renderServiceStep();
      case 3:
        return renderRouteStep();
      default:
        return null;
    }
  };

  return (
    <div className="enhanced-maintenance-config">
      {renderStepIndicator()}
      <div className="step-content-container">
        {renderStepContent()}
      </div>
      
      {maintenanceConfig?.enabled && activeStep < 3 && (
        <div className="step-navigation">
          <button
            className="btn-next"
            onClick={() => setActiveStep(activeStep + 1)}
            disabled={
              (activeStep === 1 && !maintenanceConfig?.schedule?.frequency) ||
              (activeStep === 2 && !maintenanceConfig?.serviceDetails?.taskType)
            }
          >
            Next Step
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedMaintenanceConfig;