"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  format,
  addDays,
  addMonths,
  subMonths,
  startOfDay,
  addMinutes,
  isSameDay,
  getDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import clsx from "clsx";
import axios from "axios";
import { useSelector } from "react-redux";
import { BaseURL } from "../../../utils/baseUrl";
import { Tag } from "primereact/tag";
import Loader from "../common/Loader";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";

// View types
const VIEW_TYPES = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
};

const FILTER_TYPES = {
  ALL: "all",
  AVAILABLE: "available",
  RENT: "rented",
  BUSY: "busy",
  MAINTENANCE: "maintenance",
};

const TASK_STATUS = {
  UNASSIGNED: "unassigned",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Status colors
const statusColors = {
  available: "bg-green-100 text-green-800 border-green-200",
  busy: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in use": "bg-blue-100 text-blue-800 border-blue-200",
  maintenance: "bg-red-100 text-red-800 border-red-200",
  offline: "bg-gray-100 text-gray-800 border-gray-200",
};

const taskStatusColors = {
  unassigned: "bg-orange-100 text-orange-800 border-orange-200",
  assigned: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

// Sample resource data with avatars and status
const sampleResources = [
  {
    id: "alex-driver",
    name: "Alex Thompson",
    type: "Driver",
    status: "available",
    utilization: 75,
    avatar: "👨‍💼",
    color: "bg-orange-500",
    skills: ["Delivery", "Heavy Lifting"],
    location: "Depot A",
    phone: "+1-555-0101",
  },
  {
    id: "maria-driver",
    name: "Maria Santos",
    type: "Driver", 
    status: "available",
    utilization: 60,
    avatar: "👩‍💼",
    color: "bg-blue-500",
    skills: ["Delivery", "Customer Service"],
    location: "Depot B",
    phone: "+1-555-0102",
  },
  {
    id: "james-driver",
    name: "James Wilson",
    type: "Driver",
    status: "busy",
    utilization: 90,
    avatar: "👨‍🔧",
    color: "bg-pink-500",
    skills: ["Maintenance", "Delivery"],
    location: "Depot A",
    phone: "+1-555-0103",
  },
  {
    id: "van-1",
    name: "Van #1 ",
    type: "van",
    status: "available",
    utilization: 45,
    avatar: "🚐",
    color: "bg-teal-500",
    capacity: "1000 kg",
    location: "Depot A",
    lastMaintenance: "2024-12-01",
  },
  {
    id: "truck-2",
    name: "Truck ",
    type: "truck",
    status: "in use",
    utilization: 85,
    avatar: "🚛",
    color: "bg-cyan-500",
    capacity: "3500 kg",
    location: "On Route",
    lastMaintenance: "2024-11-15",
  },
  {
    id: "car-1",
    name: "Car #1",
    type: "car",
    status: "maintenance",
    utilization: 0,
    avatar: "🚗",
    color: "bg-indigo-500",
    capacity: "500 kg",
    location: "Service Center",
    lastMaintenance: "2024-12-03",
  }
];

// Sample tasks data
const sampleTasks = [
  {
    id: "task-1",
    title: "Delivery to Downtown",
    customer: "ABC Corp",
    priority: "high",
    status: "unassigned",
    estimatedDuration: 120,
    requiredSkills: ["Delivery"],
    location: "Downtown",
    timeWindow: { start: "09:00", end: "12:00" },
    description: "Urgent delivery of office supplies",
  },
  {
    id: "task-2",
    title: "Pickup from Warehouse",
    customer: "XYZ Ltd",
    priority: "medium",
    status: "unassigned",
    estimatedDuration: 60,
    requiredSkills: ["Heavy Lifting"],
    location: "Industrial Zone",
    timeWindow: { start: "14:00", end: "16:00" },
    description: "Pickup heavy machinery parts",
  },
  {
    id: "task-3",
    title: "Customer Service Call",
    customer: "Tech Solutions",
    priority: "low",
    status: "assigned",
    assignedTo: "maria-driver",
    estimatedDuration: 90,
    requiredSkills: ["Customer Service"],
    location: "Business District",
    timeWindow: { start: "10:00", end: "11:30" },
    description: "On-site technical support",
  },
];

// Generate time slots for a day (configurable interval)
const generateTimeSlots = (date, intervalMinutes = 15) => {
  const slots = [];
  const startTime = startOfDay(date);
  const endTime = addMinutes(startTime, 24 * 60); // 24 hours
  
  let currentTime = startTime;
  while (currentTime < endTime) {
    slots.push(new Date(currentTime));
    currentTime = addMinutes(currentTime, intervalMinutes);
  }
  
  return slots;
};

// Get visible time slots for better screen display (8 AM to 6 PM by default)
const getVisibleTimeSlots = (timeSlots, startHour = 8, endHour = 18) => {
  return timeSlots.filter(slot => {
    const hour = slot.getHours();
    return hour >= startHour && hour < endHour;
  });
};

// Draggable Task Component
const DraggableTask = ({ task, onTaskClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id, task },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const priorityColors = {
    high: "border-l-red-500 bg-red-50",
    medium: "border-l-yellow-500 bg-yellow-50",
    low: "border-l-green-500 bg-green-50",
  };

  return (
    <div
      ref={drag}
      className={clsx(
        "p-3 mb-2 border-l-4 rounded-lg cursor-move shadow-sm hover:shadow-md transition-shadow",
        priorityColors[task.priority],
        isDragging ? "opacity-50" : "opacity-100"
      )}
      onClick={() => onTaskClick(task)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{task.title}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStatusColors[task.status]}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
      <div className="text-xs text-gray-600 mb-1">{task.customer}</div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{task.estimatedDuration}min</span>
        <span className="capitalize">{task.priority}</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {task.timeWindow.start} - {task.timeWindow.end}
      </div>
    </div>
  );
};

// Droppable Time Slot Component
const DroppableTimeSlot = ({ resource, timeSlot, onTaskDrop, assignedTasks }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item) => onTaskDrop(item.task, resource.id, timeSlot),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const slotTasks = assignedTasks.filter(task => 
    task.assignedTo === resource.id && 
    task.scheduledTime === format(timeSlot, "HH:mm")
  );

  return (
    <div
      ref={drop}
      className={clsx(
        "h-20 border-r border-gray-100 dark:border-dark-2 cursor-pointer relative",
        isOver ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-50 dark:hover:bg-dark-2"
      )}
    >
      {slotTasks.map((task, index) => (
        <div
          key={task.id}
          className="absolute inset-1 bg-blue-500 text-white text-xs p-1 rounded shadow-sm"
          style={{ top: `${index * 20 + 4}px`, height: "16px" }}
        >
          <div className="truncate">{task.title}</div>
        </div>
      ))}
    </div>
  );
};

// Resource Row Component
const ResourceRow = ({ resource, timeSlots, onTaskDrop, assignedTasks, onResourceClick }) => {
  return (
    <div className="grid border-b border-gray-200 dark:border-dark-2" style={{
      gridTemplateColumns: `300px repeat(${timeSlots.length}, minmax(60px, 1fr))`,
    }}>
      {/* Resource Info */}
      <div 
        className="flex items-center p-3 border-r border-gray-200 dark:border-dark-3 bg-white dark:bg-dark cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-2"
        onClick={() => onResourceClick(resource)}
      >
        <input type="checkbox" className="mr-3" />
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 ${resource.color}`}>
          <span className="text-lg">{resource.avatar}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{resource.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate ${statusColors[resource.status]}`}>
              {resource.status}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{resource.type}</div>
          <div className="flex items-center mt-1">
            <div className="w-16 h-1 bg-gray-200 rounded-full mr-2">
              <div 
                className={clsx(
                  "h-1 rounded-full",
                  resource.utilization > 80 ? "bg-red-400" : 
                  resource.utilization > 60 ? "bg-yellow-400" : "bg-green-400"
                )} 
                style={{ width: `${resource.utilization}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">{resource.utilization}%</span>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      {timeSlots.map((slot, index) => (
        <DroppableTimeSlot
          key={index}
          resource={resource}
          timeSlot={slot}
          onTaskDrop={onTaskDrop}
          assignedTasks={assignedTasks}
        />
      ))}
    </div>
  );
};

// Advanced Filter Component
const AdvancedFilters = ({ visible, onHide, filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const resourceTypes = [
    { label: "All Types", value: "all" },
    { label: "Drivers", value: "driver" },
    { label: "Vehicles", value: "vehicle" },
    { label: "Equipment", value: "equipment" },
  ];

  const statusOptions = [
    { label: "Available", value: "available" },
    { label: "Busy", value: "busy" },
    { label: "In Use", value: "in use" },
    { label: "Maintenance", value: "maintenance" },
    { label: "Offline", value: "offline" },
  ];

  const skillOptions = [
    { label: "Delivery", value: "delivery" },
    { label: "Heavy Lifting", value: "heavy_lifting" },
    { label: "Customer Service", value: "customer_service" },
    { label: "Maintenance", value: "maintenance" },
  ];

  const handleApply = () => {
    onFiltersChange(localFilters);
    onHide();
  };

  const handleReset = () => {
    const resetFilters = {
      resourceType: "all",
      status: [],
      skills: [],
      utilizationRange: [0, 100],
      location: "",
      showOnlyAvailable: false,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <Dialog
      header="Advanced Filters"
      visible={visible}
      onHide={onHide}
      style={{ width: "500px" }}
      footer={
        <div className="flex justify-between">
          <Button label="Reset" onClick={handleReset} className="p-button-text" />
          <div>
            <Button label="Cancel" onClick={onHide} className="p-button-text mr-2" />
            <Button label="Apply" onClick={handleApply} />
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Resource Type</label>
          <Dropdown
            value={localFilters.resourceType}
            options={resourceTypes}
            onChange={(e) => setLocalFilters({...localFilters, resourceType: e.value})}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <MultiSelect
            value={localFilters.status}
            options={statusOptions}
            onChange={(e) => setLocalFilters({...localFilters, status: e.value})}
            className="w-full"
            placeholder="Select status"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Skills</label>
          <MultiSelect
            value={localFilters.skills}
            options={skillOptions}
            onChange={(e) => setLocalFilters({...localFilters, skills: e.value})}
            className="w-full"
            placeholder="Select skills"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <InputText
            value={localFilters.location}
            onChange={(e) => setLocalFilters({...localFilters, location: e.target.value})}
            className="w-full"
            placeholder="Filter by location"
          />
        </div>

        <div className="flex items-center">
          <Checkbox
            checked={localFilters.showOnlyAvailable}
            onChange={(e) => setLocalFilters({...localFilters, showOnlyAvailable: e.checked})}
            className="mr-2"
          />
          <label className="text-sm">Show only available resources</label>
        </div>
      </div>
    </Dialog>
  );
};

// Task Details Modal
const TaskDetailsModal = ({ task, visible, onHide, onTaskUpdate }) => {
  const [editedTask, setEditedTask] = useState(task || {});

  useEffect(() => {
    setEditedTask(task || {});
  }, [task]);

  const handleSave = () => {
    onTaskUpdate(editedTask);
    onHide();
  };

  if (!task) return null;

  return (
    <Dialog
      header="Task Details"
      visible={visible}
      onHide={onHide}
      style={{ width: "600px" }}
      footer={
        <div>
          <Button label="Cancel" onClick={onHide} className="p-button-text mr-2" />
          <Button label="Save" onClick={handleSave} />
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <InputText
            value={editedTask.title || ""}
            onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Customer</label>
          <InputText
            value={editedTask.customer || ""}
            onChange={(e) => setEditedTask({...editedTask, customer: e.target.value})}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={editedTask.description || ""}
            onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <Dropdown
              value={editedTask.priority}
              options={[
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ]}
              onChange={(e) => setEditedTask({...editedTask, priority: e.value})}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
            <InputText
              type="number"
              value={editedTask.estimatedDuration || ""}
              onChange={(e) => setEditedTask({...editedTask, estimatedDuration: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <InputText
            value={editedTask.location || ""}
            onChange={(e) => setEditedTask({...editedTask, location: e.target.value})}
            className="w-full"
          />
        </div>
      </div>
    </Dialog>
  );
};

// Resource Details Modal
const ResourceDetailsModal = ({ resource, visible, onHide }) => {
  if (!resource) return null;

  return (
    <Dialog
      header="Resource Details"
      visible={visible}
      onHide={onHide}
      style={{ width: "500px" }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl ${resource.color}`}>
            {resource.avatar}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{resource.name}</h3>
            <p className="text-gray-600">{resource.type}</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[resource.status]}`}>
              {resource.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Utilization</label>
            <div className="flex items-center mt-1">
              <div className="w-full h-2 bg-gray-200 rounded-full mr-2">
                <div 
                  className={clsx(
                    "h-2 rounded-full",
                    resource.utilization > 80 ? "bg-red-400" : 
                    resource.utilization > 60 ? "bg-yellow-400" : "bg-green-400"
                  )} 
                  style={{ width: `${resource.utilization}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{resource.utilization}%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <p className="mt-1 text-sm">{resource.location}</p>
          </div>
        </div>

        {resource.skills && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Skills</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {resource.skills.map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {resource.phone && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="mt-1 text-sm">{resource.phone}</p>
          </div>
        )}

        {resource.capacity && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <p className="mt-1 text-sm">{resource.capacity}</p>
          </div>
        )}

        {resource.lastMaintenance && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Maintenance</label>
            <p className="mt-1 text-sm">{resource.lastMaintenance}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
};

// Header Component
const CalendarHeader = ({ 
  currentDate, 
  setCurrentDate, 
  viewType,
  setViewType,
  timeInterval, 
  setTimeInterval,
  onShowFilters,
  onExport,
  onImport,
  scheduledCount,
  unassignedCount
}) => {
  const handlePrevious = () => {
    if (viewType === VIEW_TYPES.DAY) {
      setCurrentDate((prev) => addDays(prev, -1));
    } else if (viewType === VIEW_TYPES.WEEK) {
      setCurrentDate((prev) => addDays(prev, -7));
    } else {
      setCurrentDate((prev) => subMonths(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewType === VIEW_TYPES.DAY) {
      setCurrentDate((prev) => addDays(prev, 1));
    } else if (viewType === VIEW_TYPES.WEEK) {
      setCurrentDate((prev) => addDays(prev, 7));
    } else {
      setCurrentDate((prev) => addMonths(prev, 1));
    }
  };

  const getDateDisplay = () => {
    if (viewType === VIEW_TYPES.DAY) {
      return format(currentDate, "EEEE, MMMM d, yyyy");
    } else if (viewType === VIEW_TYPES.WEEK) {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } else {
      return format(currentDate, "MMMM yyyy");
    }
  };



  return (
    <div className="mb-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-2 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold min-w-[250px]">
              {getDateDisplay()}
            </h2>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-2 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* View Type Tabs */}
          {/* <div className="flex border border-gray-300 dark:border-dark-3 rounded">
            {Object.values(VIEW_TYPES).map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={clsx(
                  "px-3 py-1 text-sm capitalize",
                  viewType === type 
                    ? "bg-blue-500 text-white" 
                    : "hover:bg-gray-100 dark:hover:bg-dark-2"
                )}
              >
                {type}
              </button>
            ))}
          </div> */}
        </div>

        <div className="flex items-center gap-4">
          {/* Statistics */}
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded"></span>
              {scheduledCount} Scheduled
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-orange-500 rounded"></span>
              {unassignedCount} Unassigned
            </span>
          </div>

          {/* Time Interval Control */}
  

          <div className="flex items-center gap-2">
            <button 
              onClick={onShowFilters}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-3 rounded hover:bg-gray-50 dark:hover:bg-dark-2"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filter
            </button>
            <button 
              onClick={onImport}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-3 rounded hover:bg-gray-50 dark:hover:bg-dark-2"
            >
              Import
            </button>
            <button 
              onClick={onExport}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-3 rounded hover:bg-gray-50 dark:hover:bg-dark-2"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Time Header Component
const TimeHeader = ({ timeSlots, viewType }) => {
  return (
    <div className="flex border-b-2 border-gray-200 dark:border-dark-2 bg-gray-50 dark:bg-dark-2 w-full">
      {/* Fixed Resources Column */}
      <div className="min-w-[300px] max-w-[300px] p-3 border-r border-gray-200 dark:border-dark-3 font-semibold">
        Resources
      </div>

      {/* Scrollable Time Slots */}
      <div className="overflow-x-auto w-full calendar-scrollbar">
        <div
          className="grid "
          style={{
            gridTemplateColumns: `repeat(${timeSlots.length}, minmax(60px, 1fr))`,
          }}
        >
          {timeSlots.map((slot, index) => {
            const isHour = slot.getMinutes() === 0;

            return (
              <div
                key={index}
                className={clsx(
                  "p-1 text-center border-r border-gray-200 dark:border-dark-2",
                  isHour ? "border-r border-gray-300" : ""
                )}
              >
                <div className="text-xs font-medium">
                  {format(slot, "h:mm a")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};



// Main Component
export default function DispatchCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState(VIEW_TYPES.DAY);
  const [timeInterval, setTimeInterval] = useState(15);
  const [resources, setResources] = useState(sampleResources);
  const [tasks, setTasks] = useState(sampleTasks);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");
  
  const [filters, setFilters] = useState({
    resourceType: "all",
    status: [],
    skills: [],
    utilizationRange: [0, 100],
    location: "",
    showOnlyAvailable: false,
  });

  const { token } = useSelector((state) => state?.authReducer);

  // Generate time slots based on current date and interval
  const allTimeSlots = generateTimeSlots(currentDate, timeInterval);
  const timeSlots = getVisibleTimeSlots(allTimeSlots);

  // Filter resources based on current filters
  const filteredResources = resources.filter(resource => {
    if (filters.resourceType !== "all") {
      const typeMatch = filters.resourceType === "driver" ? 
        resource.type.toLowerCase() === "driver" :
        resource.type.toLowerCase() !== "driver";
      if (!typeMatch) return false;
    }

    if (filters.status.length > 0 && !filters.status.includes(resource.status)) {
      return false;
    }

    if (filters.skills.length > 0 && resource.skills) {
      const hasSkill = filters.skills.some(skill => 
        resource.skills.some(resourceSkill => 
          resourceSkill.toLowerCase().includes(skill.replace('_', ' '))
        )
      );
      if (!hasSkill) return false;
    }

    if (filters.location && !resource.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    if (filters.showOnlyAvailable && resource.status !== "available") {
      return false;
    }

    return true;
  });

  // Filter tasks based on search and filter
  const filteredTasks = tasks.filter(task => {
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.customer.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (taskFilter !== "all" && task.status !== taskFilter) {
      return false;
    }

    return true;
  });

  const unassignedTasks = filteredTasks.filter(task => task.status === "unassigned");
  const scheduledCount = assignedTasks.length;
  const unassignedCount = unassignedTasks.length;

  // Handle task drop
  const handleTaskDrop = useCallback((task, resourceId, timeSlot) => {
    const scheduledTime = format(timeSlot, "HH:mm");
    
    // Update task status and assignment
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === task.id 
          ? { ...t, status: "assigned", assignedTo: resourceId, scheduledTime }
          : t
      )
    );

    // Add to assigned tasks
    setAssignedTasks(prev => [
      ...prev.filter(t => t.id !== task.id),
      { ...task, assignedTo: resourceId, scheduledTime }
    ]);

    // Update resource utilization (simplified calculation)
    setResources(prevResources =>
      prevResources.map(resource =>
        resource.id === resourceId
          ? { ...resource, utilization: Math.min(100, resource.utilization + 10) }
          : resource
      )
    );
  }, []);

  // Handle task click
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Handle resource click
  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    setShowResourceModal(true);
  };

  // Handle task update
  const handleTaskUpdate = (updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  // Handle export
  const handleExport = () => {
    const exportData = {
      date: format(currentDate, "yyyy-MM-dd"),
      resources: filteredResources,
      tasks: filteredTasks,
      assignments: assignedTasks,
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dispatch-calendar-${format(currentDate, "yyyy-MM-dd")}.json`;
    link.click();
  };

  // Handle import
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.resources) setResources(data.resources);
            if (data.tasks) setTasks(data.tasks);
            if (data.assignments) setAssignedTasks(data.assignments);
          } catch (error) {
            console.error('Error importing data:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full h-full bg-white dark:bg-dark">
        <div className="p-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dispatch Calendar</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-500 rounded"></span>
                  {scheduledCount} Scheduled
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-orange-500 rounded"></span>
                  {unassignedCount} Unassigned
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 dark:border-dark-2 bg-gray-50 dark:bg-dark-2 p-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
                  📋
                </span>
                Unassigned Tasks
              </h3>
              <div className="text-sm text-gray-500 mb-4">{unassignedCount} tasks</div>
              
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  ✓ {tasks.filter(t => t.status === "completed").length}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  📋 {tasks.filter(t => t.status === "assigned").length}
                </span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                  ⏳ {unassignedCount}
                </span>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <svg className="w-4 h-4 absolute right-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex gap-2 mb-4">
                <Dropdown
                  value={taskFilter}
                  options={[
                    { label: "All Tasks", value: "all" },
                    { label: "Unassigned", value: "unassigned" },
                    { label: "Assigned", value: "assigned" },
                    { label: "In Progress", value: "in_progress" },
                    { label: "Completed", value: "completed" },
                  ]}
                  onChange={(e) => setTaskFilter(e.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
              {unassignedTasks.length > 0 ? (
                unassignedTasks.map((task) => (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    onTaskClick={handleTaskClick}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    📦
                  </div>
                  <p className="text-gray-500 text-sm">No unassigned tasks</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Calendar Area */}
          <div className="flex-1 overflow-hidden">
            <div className="px-6">
              <CalendarHeader
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                viewType={viewType}
                setViewType={setViewType}
                timeInterval={timeInterval}
                setTimeInterval={setTimeInterval}
                onShowFilters={() => setShowFilters(true)}
                onExport={handleExport}
                onImport={handleImport}
                scheduledCount={scheduledCount}
                unassignedCount={unassignedCount}
              />

              {/* Calendar Grid */}
              <div className="border border-gray-200 dark:border-dark-2 rounded-lg overflow-hidden bg-white dark:bg-dark">
                <TimeHeader timeSlots={timeSlots} viewType={viewType} />
                
                <div className="max-h-[calc(100vh-300px)]">
                  {loading ? (
                    <div className="flex items-center justify-center h-96">
                      <Loader />
                    </div>
                  ) : (
                    <>
                      {filteredResources.map((resource, index) => (
                        <ResourceRow
                          key={resource.id}
                          resource={resource}
                          timeSlots={timeSlots}
                          onTaskDrop={handleTaskDrop}
                          assignedTasks={assignedTasks}
                          onResourceClick={handleResourceClick}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AdvancedFilters
          visible={showFilters}
          onHide={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={setFilters}
        />

        <TaskDetailsModal
          task={selectedTask}
          visible={showTaskModal}
          onHide={() => setShowTaskModal(false)}
          onTaskUpdate={handleTaskUpdate}
        />

        <ResourceDetailsModal
          resource={selectedResource}
          visible={showResourceModal}
          onHide={() => setShowResourceModal(false)}
        />
      </div>
    </DndProvider>
  );
}
