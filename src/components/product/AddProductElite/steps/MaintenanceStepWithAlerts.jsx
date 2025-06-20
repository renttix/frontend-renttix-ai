import React, { useState, useEffect } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { SelectButton } from "primereact/selectbutton";
import { MultiSelect } from "primereact/multiselect";
import { Chip } from "primereact/chip";
import { Message } from "primereact/message";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiTool, FiPlus, FiTrash2, FiClock, FiCalendar,
  FiAlertCircle, FiDollarSign, FiCheckCircle, FiInfo,
  FiRepeat, FiShield, FiActivity, FiBell, FiMail,
  FiMessageSquare, FiSettings, FiExternalLink
} from "react-icons/fi";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";
import useIntegrationStatus from "../../../../hooks/useIntegrationStatus";
import Link from "next/link";

// Alert Configuration Component
const AlertConfiguration = ({ schedule, updateSchedule }) => {
  const { integrations, loading, getAvailableChannels, getChannelStatus } = useIntegrationStatus();
  const [showAlertConfig, setShowAlertConfig] = useState(false);
  
  const channelIcons = {
    dashboard: FiBell,
    email: FiMail,
    sms: FiMessageSquare,
    push: FiBell
  };
  
  const timingUnits = [
    { label: 'Days', value: 'days' },
    { label: 'Hours', value: 'hours' },
    { label: 'Weeks', value: 'weeks' }
  ];
  
  const recipientOptions = [
    { label: 'Manager', value: 'manager' },
    { label: 'Technician', value: 'technician' },
    { label: 'Customer', value: 'customer' },
    { label: 'Admin', value: 'admin' }
  ];
  
  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };
  
  // Initialize alerts if not present
  useEffect(() => {
    if (!schedule.alerts) {
      updateSchedule(schedule.id, {
        alerts: {
          enabled: false,
          notifications: []
        }
      });
    }
  }, []);
  
  const addAlert = () => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      timing: {
        value: 7,
        unit: 'days',
        type: 'before'
      },
      channels: ['dashboard'],
      recipients: ['manager'],
      message: `${schedule.name} due in {days} days for {productName}`,
      priority: schedule.priority || 'medium'
    };
    
    updateSchedule(schedule.id, {
      alerts: {
        ...schedule.alerts,
        notifications: [...(schedule.alerts?.notifications || []), newAlert]
      }
    });
  };
  
  const updateAlert = (alertId, updates) => {
    updateSchedule(schedule.id, {
      alerts: {
        ...schedule.alerts,
        notifications: schedule.alerts.notifications.map(alert =>
          alert.id === alertId ? { ...alert, ...updates } : alert
        )
      }
    });
  };
  
  const removeAlert = (alertId) => {
    updateSchedule(schedule.id, {
      alerts: {
        ...schedule.alerts,
        notifications: schedule.alerts.notifications.filter(a => a.id !== alertId)
      }
    });
  };
  
  const applyAlertTemplate = (type) => {
    let templates = [];
    
    switch (type) {
      case 'standard':
        templates = [
          {
            id: `alert-${Date.now()}-1`,
            timing: { value: 30, unit: 'days', type: 'before' },
            channels: ['email', 'dashboard'],
            recipients: ['manager'],
            message: `${schedule.name} scheduled in 30 days`,
            priority: 'medium'
          },
          {
            id: `alert-${Date.now()}-2`,
            timing: { value: 7, unit: 'days', type: 'before' },
            channels: ['email', 'dashboard'],
            recipients: ['technician'],
            message: `Reminder: ${schedule.name} due in 7 days`,
            priority: 'high'
          }
        ];
        break;
      case 'compliance':
        templates = [
          {
            id: `alert-${Date.now()}-1`,
            timing: { value: 60, unit: 'days', type: 'before' },
            channels: ['email', 'dashboard'],
            recipients: ['manager', 'admin'],
            message: `Compliance alert: ${schedule.name} due in 60 days`,
            priority: 'high'
          },
          {
            id: `alert-${Date.now()}-2`,
            timing: { value: 30, unit: 'days', type: 'before' },
            channels: ['email', 'dashboard', 'sms'],
            recipients: ['manager', 'technician'],
            message: `Critical: ${schedule.name} due in 30 days`,
            priority: 'critical'
          },
          {
            id: `alert-${Date.now()}-3`,
            timing: { value: 7, unit: 'days', type: 'before' },
            channels: ['email', 'dashboard', 'sms'],
            recipients: ['all'],
            message: `URGENT: ${schedule.name} due in 7 days`,
            priority: 'critical'
          }
        ];
        break;
    }
    
    updateSchedule(schedule.id, {
      alerts: {
        enabled: true,
        notifications: templates
      }
    });
  };
  
  const availableChannels = getAvailableChannels();
  
  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <FiBell className="mr-2 text-yellow-600" />
          Alert Settings
        </h4>
        <InputSwitch
          checked={schedule.alerts?.enabled || false}
          onChange={(e) => updateSchedule(schedule.id, {
            alerts: { ...schedule.alerts, enabled: e.value }
          })}
        />
      </div>
      
      {schedule.alerts?.enabled && (
        <div className="space-y-4">
          {/* Integration Status */}
          {!loading && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Available Channels</h5>
              <div className="flex flex-wrap gap-2">
                {['dashboard', 'email', 'sms', 'push'].map(channel => {
                  const status = getChannelStatus(channel);
                  const Icon = channelIcons[channel];
                  const isAvailable = status.available;
                  
                  return (
                    <div
                      key={channel}
                      className={`flex items-center px-3 py-1 rounded-full text-sm ${
                        isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      <span className="capitalize">{channel}</span>
                      {!isAvailable && channel !== 'dashboard' && (
                        <Link href="/system-setup/integrations">
                          <FiExternalLink className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-600" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
              {availableChannels.length === 1 && (
                <Message 
                  severity="info" 
                  text="Configure email or SMS in System Setup → Integrations for more alert options"
                  className="mt-3"
                />
              )}
            </div>
          )}
          
          {/* Quick Alert Templates */}
          <div className="flex gap-2">
            <Button
              label="Standard Alerts"
              className="p-button-sm p-button-outlined"
              onClick={() => applyAlertTemplate('standard')}
              icon={<FiCheckCircle className="mr-2" />}
            />
            <Button
              label="Compliance Alerts"
              className="p-button-sm p-button-outlined"
              onClick={() => applyAlertTemplate('compliance')}
              icon={<FiShield className="mr-2" />}
            />
          </div>
          
          {/* Alert List */}
          <AnimatePresence>
            {schedule.alerts?.notifications?.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Timing Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Alert Timing
                        </label>
                        <div className="flex gap-2">
                          <InputNumber
                            value={alert.timing.value}
                            onValueChange={(e) => updateAlert(alert.id, {
                              timing: { ...alert.timing, value: e.value }
                            })}
                            min={1}
                            className="w-20"
                          />
                          <Dropdown
                            value={alert.timing.unit}
                            onChange={(e) => updateAlert(alert.id, {
                              timing: { ...alert.timing, unit: e.value }
                            })}
                            options={timingUnits}
                            optionLabel="label"
                            optionValue="value"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Channels
                        </label>
                        <MultiSelect
                          value={alert.channels}
                          onChange={(e) => updateAlert(alert.id, { channels: e.value })}
                          options={availableChannels.map(ch => ({ 
                            label: ch.charAt(0).toUpperCase() + ch.slice(1), 
                            value: ch 
                          }))}
                          optionLabel="label"
                          optionValue="value"
                          display="chip"
                          className="w-full"
                          placeholder="Select channels"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Recipients
                        </label>
                        <MultiSelect
                          value={alert.recipients}
                          onChange={(e) => updateAlert(alert.id, { recipients: e.value })}
                          options={recipientOptions}
                          optionLabel="label"
                          optionValue="value"
                          display="chip"
                          className="w-full"
                          placeholder="Select recipients"
                        />
                      </div>
                    </div>
                    
                    {/* Message */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Alert Message
                      </label>
                      <InputText
                        value={alert.message}
                        onChange={(e) => updateAlert(alert.id, { message: e.target.value })}
                        placeholder="Enter alert message"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use {'{productName}'}, {'{days}'}, {'{date}'} as placeholders
                      </p>
                    </div>
                    
                    {/* Priority */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700">Priority:</span>
                      <Chip 
                        label={alert.priority} 
                        className={`${priorityColors[alert.priority]} text-xs`}
                      />
                    </div>
                  </div>
                  
                  <Button
                    icon={<FiTrash2 />}
                    className="p-button-text p-button-sm p-button-danger ml-3"
                    onClick={() => removeAlert(alert.id)}
                    tooltip="Remove alert"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <Button
            label="Add Alert"
            icon={<FiPlus />}
            className="p-button-sm"
            onClick={addAlert}
          />
          
          {(!schedule.alerts?.notifications || schedule.alerts.notifications.length === 0) && (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <FiBell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No alerts configured</p>
              <p className="text-xs text-gray-400 mt-1">
                Add alerts to be notified before maintenance is due
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function MaintenanceStepWithAlerts({ formData, updateFormData, errors, token }) {
  const [taskTypes, setTaskTypes] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Initialize maintenance config if not present
  useEffect(() => {
    if (!formData.maintenanceConfig) {
      updateFormData({
        maintenanceConfig: {
          requiresMaintenance: false,
          schedules: [],
          returnInspection: {
            required: false,
            tasks: []
          }
        }
      });
    }
  }, []);
  
  // Fetch task types
  useEffect(() => {
    const fetchTaskTypes = async () => {
      try {
        const response = await axios.get(`${BaseURL}/task-types`, {
          headers: { authorization: `Bearer ${token}` }
        });
        setTaskTypes(response.data.data || []);
      } catch (error) {
        console.error("Error fetching task types:", error);
      }
    };
    
    if (token) {
      fetchTaskTypes();
    }
  }, [token]);
  
  const maintenanceTemplates = [
    {
      name: "Heavy Equipment",
      icon: FiShield,
      config: {
        schedules: [
          {
            id: `schedule-${Date.now()}-1`,
            type: 'regular',
            name: 'Monthly Service',
            frequency: { value: 30, unit: 'days' },
            tasks: [{ name: 'Full Service Check', duration: 120 }],
            priority: 'high',
            alerts: {
              enabled: true,
              notifications: [
                {
                  id: `alert-${Date.now()}-1`,
                  timing: { value: 7, unit: 'days', type: 'before' },
                  channels: ['dashboard', 'email'],
                  recipients: ['manager', 'technician'],
                  message: 'Monthly service due in {days} days for {productName}',
                  priority: 'high'
                }
              ]
            }
          },
          {
            id: `schedule-${Date.now()}-2`,
            type: 'usage',
            name: 'Usage-Based Service',
            frequency: { value: 100, unit: 'hours' },
            tasks: [{ name: 'Oil & Filter Change', duration: 60 }],
            priority: 'medium'
          }
        ],
        returnInspection: { required: true }
      }
    },
    {
      name: "Electronics",
      icon: FiActivity,
      config: {
        schedules: [
          {
            id: `schedule-${Date.now()}-3`,
            type: 'regular',
            name: 'Calibration',
            frequency: { value: 90, unit: 'days' },
            tasks: [{ name: 'Calibration & Testing', duration: 45 }],
            priority: 'medium',
            alerts: {
              enabled: true,
              notifications: [
                {
                  id: `alert-${Date.now()}-2`,
                  timing: { value: 14, unit: 'days', type: 'before' },
                  channels: ['dashboard', 'email'],
                  recipients: ['technician'],
                  message: 'Calibration due in {days} days',
                  priority: 'medium'
                }
              ]
            }
          }
        ],
        returnInspection: { required: true }
      }
    },
    {
      name: "Simple Equipment",
      icon: FiCheckCircle,
      config: {
        schedules: [],
        returnInspection: {
          required: true,
          tasks: [{ name: 'Clean & Inspect', duration: 15 }]
        }
      }
    }
  ];
  
  const scheduleTypes = [
    { label: 'Regular', value: 'regular', icon: FiCalendar },
    { label: 'Usage-Based', value: 'usage', icon: FiClock },
    { label: 'During Rental', value: 'rental', icon: FiRepeat },
    { label: 'After Return', value: 'return', icon: FiCheckCircle }
  ];
  
  const frequencyUnits = {
    regular: [
      { label: 'Days', value: 'days' },
      { label: 'Weeks', value: 'weeks' },
      { label: 'Months', value: 'months' }
    ],
    usage: [
      { label: 'Hours', value: 'hours' },
      { label: 'Cycles', value: 'cycles' },
      { label: 'Uses', value: 'uses' }
    ],
    rental: [
      { label: 'Days', value: 'days' },
      { label: 'Weeks', value: 'weeks' }
    ],
    return: []
  };
  
  const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' }
  ];
  
  const addSchedule = () => {
    const newSchedule = {
      id: `schedule-${Date.now()}`,
      type: 'regular',
      name: '',
      frequency: { value: 30, unit: 'days' },
      tasks: [],
      priority: 'medium',
      estimatedCost: 0,
      requiresCertification: false,
      alerts: {
        enabled: false,
        notifications: []
      }
    };
    
    updateFormData({
      maintenanceConfig: {
        ...formData.maintenanceConfig,
        schedules: [...(formData.maintenanceConfig?.schedules || []), newSchedule]
      }
    });
  };
  
  const removeSchedule = (scheduleId) => {
    updateFormData({
      maintenanceConfig: {
        ...formData.maintenanceConfig,
        schedules: formData.maintenanceConfig.schedules.filter(s => s.id !== scheduleId)
      }
    });
  };
  
  const updateSchedule = (scheduleId, updates) => {
    updateFormData({
      maintenanceConfig: {
        ...formData.maintenanceConfig,
        schedules: formData.maintenanceConfig.schedules.map(s =>
          s.id === scheduleId ? { ...s, ...updates } : s
        )
      }
    });
  };
  
  const addTask = (scheduleId) => {
    const newTask = {
      id: `task-${Date.now()}`,
      name: '',
      duration: 30,
      taskTypeId: '',
      instructions: ''
    };
    
    updateSchedule(scheduleId, {
      tasks: [...(formData.maintenanceConfig.schedules.find(s => s.id === scheduleId)?.tasks || []), newTask]
    });
  };
  
  const applyTemplate = (template) => {
    updateFormData({
      maintenanceConfig: {
        requiresMaintenance: true,
        ...template.config,
        schedules: template.config.schedules.map(s => ({
          ...s,
          id: `schedule-${Date.now()}-${Math.random()}`
        }))
      }
    });
    setShowTemplates(false);
  };
  
  const calculateMaintenanceCost = () => {
    if (!formData.maintenanceConfig?.schedules) return 0;
    
    return formData.maintenanceConfig.schedules.reduce((total, schedule) => {
      const yearlyOccurrences = schedule.type === 'regular' 
        ? Math.floor(365 / (schedule.frequency.value || 1))
        : 12; // Estimate for other types
      return total + ((schedule.estimatedCost || 0) * yearlyOccurrences);
    }, 0);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiTool className="mr-3 text-blue-600" />
          Maintenance Configuration
        </h2>
        <p className="mt-2 text-gray-600">
          Define maintenance requirements and configure alerts to ensure product reliability
        </p>
      </div>
      
      {/* Maintenance Toggle */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Does this product require maintenance?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Enable if this product needs regular servicing, inspections, or cleaning
            </p>
          </div>
          <InputSwitch
            checked={formData.maintenanceConfig?.requiresMaintenance || false}
            onChange={(e) => updateFormData({
              maintenanceConfig: {
                ...formData.maintenanceConfig,
                requiresMaintenance: e.value
              }
            })}
          />
        </div>
      </div>
      
      {formData.maintenanceConfig?.requiresMaintenance && (
        <>
          {/* Quick Templates */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiInfo className="text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  Maintenance Templates
                </span>
              </div>
              <Button
                label={showTemplates ? "Hide" : "Show"}
                className="p-button-text p-button-sm"
                onClick={() => setShowTemplates(!showTemplates)}
              />
            </div>
            
            {showTemplates && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {maintenanceTemplates.map((template, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => applyTemplate(template)}
                    className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all text-left"
                  >
                    <template.icon className="w-6 h-6 text-blue-600 mb-2" />
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Click to apply template</p>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
          
          {/* Maintenance Schedules */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Maintenance Schedules
              </h3>
              <Button
                label="Add Schedule"
                icon={<FiPlus />}
                onClick={addSchedule}
                className="p-button-sm"
              />
            </div>
            
            <AnimatePresence>
              {formData.maintenanceConfig?.schedules?.map((schedule, index) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-4 bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <InputText
                        value={schedule.name}
                        onChange={(e) => updateSchedule(schedule.id, { name: e.target.value })}
                        placeholder="Schedule Name (e.g., Monthly Service)"
                        className="w-full mb-3"
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <Dropdown
                            value={schedule.type}
                            onChange={(e) => updateSchedule(schedule.id, { type: e.value })}
                            options={scheduleTypes}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full text-sm"
                          />
                        </div>
                        
                        {schedule.type !== 'return' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Frequency
                              </label>
                              <InputNumber
                                value={schedule.frequency.value}
                                onValueChange={(e) => updateSchedule(schedule.id, {
                                  frequency: { ...schedule.frequency, value: e.value }
                                })}
                                min={1}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unit
                              </label>
                              <Dropdown
                                value={schedule.frequency.unit}
                                onChange={(e) => updateSchedule(schedule.id, {
                                  frequency: { ...schedule.frequency, unit: e.value }
                                })}
                                options={frequencyUnits[schedule.type] || []}
                                optionLabel="label"
                                optionValue="value"
                                className="w-full text-sm"
                              />
                            </div>
                          </>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                          </label>
                          <SelectButton
                            value={schedule.priority}
                            onChange={(e) => updateSchedule(schedule.id, { priority: e.value })}
                            options={priorityOptions}
                            className="flex"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Cost
                          </label>
                          <div className="p-inputgroup">
                            <span className="p-inputgroup-addon">$</span>
                            <InputNumber
                              value={schedule.estimatedCost}
                              onValueChange={(e) => updateSchedule(schedule.id, { estimatedCost: e.value })}
                              mode="currency"
                              currency="USD"
                              locale="en-US"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-6">
                          <Checkbox
                            inputId={`cert-${schedule.id}`}
                            checked={schedule.requiresCertification}
                            onChange={(e) => updateSchedule(schedule.id, { requiresCertification: e.checked })}
                          />
                          <label htmlFor={`cert-${schedule.id}`} className="ml-2 text-sm">
                            Requires certified technician
                          </label>
                        </div>
                      </div>
                      
                      {/* Tasks */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Maintenance Tasks
                          </label>
                          <Button
                            label="Add Task"
                            icon={<FiPlus />}
                            onClick={() => addTask(schedule.id)}
                            className="p-button-text p-button-sm"
                          />
                        </div>
                        
                        {schedule.tasks?.map((task, taskIndex) => (
                          <div key={task.id || taskIndex} className="flex items-center gap-2 mb-2">
                            <InputText
                              value={task.name}
                              onChange={(e) => {
                                const updatedTasks = [...schedule.tasks];
                                updatedTasks[taskIndex] = { ...task, name: e.target.value };
                                updateSchedule(schedule.id, { tasks: updatedTasks });
                              }}
                              placeholder="Task name"
                              className="flex-1"
                            />
                            <InputNumber
                              value={task.duration}
                              onValueChange={(e) => {
                                const updatedTasks = [...schedule.tasks];
                                updatedTasks[taskIndex] = { ...task, duration: e.value };
                                updateSchedule(schedule.id, { tasks: updatedTasks });
                              }}
                              suffix=" min"
                              min={1}
                              className="w-32"
                            />
                            <Button
                              icon={<FiTrash2 />}
                              className="p-button-text p-button-sm p-button-danger"
                              onClick={() => {
                                const updatedTasks = schedule.tasks.filter((_, i) => i !== taskIndex);
                                updateSchedule(schedule.id, { tasks: updatedTasks });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Alert Configuration Component */}
                      <AlertConfiguration
                        schedule={schedule}
                        updateSchedule={updateSchedule}
                      />
                    </div>
                    
                    <Button
                      icon={<FiTrash2 />}
                      className="p-button-text p-button-danger ml-4"
                      onClick={() => removeSchedule(schedule.id)}
                      tooltip="Remove schedule"
                      tooltipOptions={{ position: 'left' }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {(!formData.maintenanceConfig?.schedules || formData.maintenanceConfig.schedules.length === 0) && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No maintenance schedules defined</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add schedules to ensure proper product maintenance
                </p>
              </div>
            )}
          </div>
          
          {/* Return Inspection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Return Inspection
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Require inspection when products are returned
                </p>
              </div>
              <InputSwitch
                checked={formData.maintenanceConfig?.returnInspection?.required || false}
                onChange={(e) => updateFormData({
                  maintenanceConfig: {
                    ...formData.maintenanceConfig,
                    returnInspection: {
                      ...formData.maintenanceConfig.returnInspection,
                      required: e.value
                    }
                  }
                })}
              />
            </div>
            
            {formData.maintenanceConfig?.returnInspection?.required && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Inspection Tasks
                </label>
                <div className="mt-2 space-y-2">
                  {formData.maintenanceConfig.returnInspection.tasks?.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <InputText
                        value={task.name}
                        onChange={(e) => {
                          const updatedTasks = [...formData.maintenanceConfig.returnInspection.tasks];
                          updatedTasks[index] = { ...task, name: e.target.value };
                          updateFormData({
                            maintenanceConfig: {
                              ...formData.maintenanceConfig,
                              returnInspection: {
                                ...formData.maintenanceConfig.returnInspection,
                                tasks: updatedTasks
                              }
                            }
                          });
                        }}
                        placeholder="Task name"
                        className="flex-1"
                      />
                      <InputNumber
                        value={task.duration}
                        onValueChange={(e) => {
                          const updatedTasks = [...formData.maintenanceConfig.returnInspection.tasks];
                          updatedTasks[index] = { ...task, duration: e.value };
                          updateFormData({
                            maintenanceConfig: {
                              ...formData.maintenanceConfig,
                              returnInspection: {
                                ...formData.maintenanceConfig.returnInspection,
                                tasks: updatedTasks
                              }
                            }
                          });
                        }}
                        suffix=" min"
                        min={1}
                        className="w-32"
                      />
                      <Button
                        icon={<FiTrash2 />}
                        className="p-button-text p-button-sm p-button-danger"
                        onClick={() => {
                          const updatedTasks = formData.maintenanceConfig.returnInspection.tasks.filter((_, i) => i !== index);
                          updateFormData({
                            maintenanceConfig: {
                              ...formData.maintenanceConfig,
                              returnInspection: {
                                ...formData.maintenanceConfig.returnInspection,
                                tasks: updatedTasks
                              }
                            }
                          });
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    label="Add Task"
                    icon={<FiPlus />}
                    onClick={() => {
                      const newTask = {
                        name: '',
                        duration: 15
                      };
                      updateFormData({
                        maintenanceConfig: {
                          ...formData.maintenanceConfig,
                          returnInspection: {
                            ...formData.maintenanceConfig.returnInspection,
                            tasks: [...(formData.maintenanceConfig.returnInspection.tasks || []), newTask]
                          }
                        }
                      });
                    }}
                    className="p-button-text p-button-sm"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Cost Summary */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiDollarSign className="mr-2 text-yellow-600" />
                  Estimated Annual Maintenance Cost
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Based on scheduled maintenance frequencies
                </p>
              </div>
              <div className="text-2xl font-bold text-yellow-700">
                ${calculateMaintenanceCost().toFixed(2)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}