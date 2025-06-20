import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import axios from 'axios';
import { BaseURL } from '../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import { formatDate } from '../../../utils/helper';
import './UnroutedTasksPanel.css';

const UnroutedTasksPanel = ({ onAssign, onRefresh }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  
  const { token } = useSelector((state) => state?.authReducer);
  const toast = useRef(null);

  useEffect(() => {
    fetchUnroutedTasks();
    fetchRoutes();
  }, []);

  const fetchUnroutedTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BaseURL}/maintenance/floating-tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Ensure tasks is always an array
      const tasksData = response.data.data;
      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
      } else {
        console.warn('Unexpected tasks data format:', tasksData);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching unrouted tasks:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch unrouted tasks',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(
        `${BaseURL}/routes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Ensure routes is always an array
      const routesData = response.data.data;
      if (Array.isArray(routesData)) {
        setRoutes(routesData);
      } else {
        console.warn('Unexpected routes data format:', routesData);
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const priorityTemplate = (rowData) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'danger',
      urgent: 'danger'
    };
    return (
      <Tag 
        value={rowData.maintenanceConfig?.serviceDetails?.priority || 'medium'} 
        severity={colors[rowData.maintenanceConfig?.serviceDetails?.priority || 'medium']} 
      />
    );
  };

  const ageTemplate = (rowData) => {
    const hours = rowData.ageInHours || 0;
    const severity = hours > 48 ? 'danger' : hours > 24 ? 'warning' : 'info';
    return <Tag value={`${hours}h`} severity={severity} />;
  };

  const dateTemplate = (rowData) => {
    return formatDate(rowData.nextServiceDate || rowData.createdAt);
  };

  const taskTypeTemplate = (rowData) => {
    return rowData.maintenanceConfig?.serviceDetails?.taskType || 'Standard Service';
  };

  const actionTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-map-marker"
        label="Assign"
        className="p-button-sm"
        onClick={() => handleSingleAssign(rowData)}
      />
    );
  };

  const handleSingleAssign = (task) => {
    setSelectedTasks([task]);
    setShowAssignmentModal(true);
  };

  const handleBatchAssign = () => {
    if (selectedTasks.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select tasks to assign',
      });
      return;
    }
    setShowAssignmentModal(true);
  };

  const performAssignment = async () => {
    if (!selectedRoute) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a route',
      });
      return;
    }

    setAssignmentLoading(true);
    try {
      const assignments = selectedTasks.map(task => ({
        taskId: task._id,
        routeId: selectedRoute._id,
        notes: assignmentNotes
      }));

      const response = await axios.post(
        `${BaseURL}/maintenance/floating-tasks/batch-assign`,
        { assignments },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `${selectedTasks.length} task(s) assigned to ${selectedRoute.name}`,
      });

      // Reset and refresh
      setShowAssignmentModal(false);
      setSelectedTasks([]);
      setSelectedRoute(null);
      setAssignmentNotes('');
      fetchUnroutedTasks();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error assigning tasks:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to assign tasks',
      });
    } finally {
      setAssignmentLoading(false);
    }
  };

  const routeColorTemplate = (route) => {
    return (
      <div className="flex align-items-center gap-2">
        <div 
          className="route-color-indicator" 
          style={{ 
            backgroundColor: route.color || '#6B7280',
            width: '20px',
            height: '20px',
            borderRadius: '4px'
          }}
        />
        <span>{route.name}</span>
      </div>
    );
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <div className="flex align-items-center gap-2">
        <Button
          icon={`pi pi-chevron-${expanded ? 'down' : 'right'}`}
          className="p-button-text p-button-sm"
          onClick={() => setExpanded(!expanded)}
        />
        <h3 className="m-0">Unrouted Maintenance Tasks</h3>
        <Badge value={tasks.length} severity="warning" />
      </div>
      <div className="flex gap-2">
        <Button
          icon="pi pi-refresh"
          className="p-button-text"
          onClick={fetchUnroutedTasks}
          loading={loading}
          tooltip="Refresh"
        />
        <Button
          label="Batch Assign"
          icon="pi pi-send"
          className="p-button-sm"
          disabled={selectedTasks.length === 0}
          onClick={handleBatchAssign}
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Card className="unrouted-tasks-panel mb-3">
        {header}
        {expanded && (
          <DataTable
            value={tasks || []}
            selection={selectedTasks}
            onSelectionChange={(e) => setSelectedTasks(e.value)}
            loading={loading}
            paginator
            rows={10}
            className="p-datatable-sm mt-3"
            emptyMessage="No unrouted tasks - all maintenance is assigned!"
            selectionMode="checkbox"
          >
            <Column selectionMode="multiple" style={{ width: '3rem' }} />
            <Column field="customerName" header="Customer" />
            <Column field="address" header="Location" />
            <Column body={taskTypeTemplate} header="Task" />
            <Column body={dateTemplate} header="Due Date" />
            <Column body={priorityTemplate} header="Priority" />
            <Column body={ageTemplate} header="Age" />
            <Column body={actionTemplate} header="Action" style={{ width: '8rem' }} />
          </DataTable>
        )}
      </Card>

      {/* Assignment Modal */}
      <Dialog
        visible={showAssignmentModal}
        onHide={() => setShowAssignmentModal(false)}
        header="Assign Maintenance Tasks to Route"
        style={{ width: '600px' }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowAssignmentModal(false)}
              className="p-button-text"
            />
            <Button
              label="Assign"
              icon="pi pi-check"
              onClick={performAssignment}
              loading={assignmentLoading}
              disabled={!selectedRoute}
            />
          </div>
        }
      >
        {/* Task Summary */}
        <div className="task-summary mb-3">
          <h4>Tasks to Assign ({selectedTasks.length})</h4>
          <div className="task-list">
            {selectedTasks.map(task => (
              <div key={task._id} className="task-item p-2 surface-100 border-round mb-2">
                <div className="flex justify-content-between align-items-center">
                  <span className="font-medium">{task.customerName}</span>
                  <Tag 
                    value={task.maintenanceConfig?.serviceDetails?.priority || 'medium'} 
                    severity={
                      task.maintenanceConfig?.serviceDetails?.priority === 'urgent' ? 'danger' :
                      task.maintenanceConfig?.serviceDetails?.priority === 'high' ? 'danger' :
                      task.maintenanceConfig?.serviceDetails?.priority === 'low' ? 'success' :
                      'warning'
                    } 
                  />
                </div>
                <small className="text-600">{task.address}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Route Selection */}
        <div className="route-selection mb-3">
          <h4>Select Target Route</h4>
          <Dropdown
            value={selectedRoute}
            options={routes}
            onChange={(e) => setSelectedRoute(e.value)}
            optionLabel="name"
            placeholder="Choose a route..."
            className="w-full"
            itemTemplate={routeColorTemplate}
            valueTemplate={selectedRoute ? routeColorTemplate : null}
          />
        </div>

        {/* Assignment Notes */}
        <div className="assignment-notes">
          <label className="font-medium">Assignment Notes (Optional)</label>
          <InputTextarea
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            rows={3}
            className="w-full mt-2"
            placeholder="Any special instructions for these assignments..."
          />
        </div>
      </Dialog>
    </>
  );
};

export default UnroutedTasksPanel;