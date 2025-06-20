import React, { useState, useEffect } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { SelectButton } from "primereact/selectbutton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiTool, FiPlus, FiTrash2, FiClock, FiCalendar,
  FiAlertCircle, FiDollarSign, FiCheckCircle, FiInfo,
  FiRepeat, FiShield, FiActivity
} from "react-icons/fi";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";

export default function MaintenanceStep({ formData, updateFormData, errors, token }) {
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
            priority: 'high'
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
            priority: 'medium'
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
      requiresCertification: false
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
          Define maintenance requirements to ensure product reliability and safety
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
                  Require inspection when product is returned from rental
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
          </div>
          
          {/* Cost Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiDollarSign className="mr-2 text-green-600" />
                  Estimated Annual Maintenance Cost
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Based on configured schedules and frequencies
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-700">
                  ${calculateMaintenanceCost().toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">per year</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
      
      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
      >
        <div className="flex items-start">
          <FiAlertCircle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Maintenance Best Practices:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Regular maintenance prevents breakdowns and extends product life</li>
              <li>Document all maintenance requirements for compliance</li>
              <li>Consider maintenance costs when setting rental prices</li>
              <li>Schedule maintenance during low-demand periods</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}