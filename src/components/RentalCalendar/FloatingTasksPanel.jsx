import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tooltip } from 'primereact/tooltip';
import axios from 'axios';
import { BaseURL } from '../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import { Calendar, MapPin, Clock, AlertCircle, Users, CheckCircle } from 'lucide-react';
import './FloatingTasksPanel.css';

const FloatingTasksPanel = ({ onTaskAssigned, onClose }) => {
  const { token } = useSelector((state) => state?.authReducer);
  const [floatingTasks, setFloatingTasks] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [groupBy, setGroupBy] = useState('priority'); // priority, area, date
  const toast = React.useRef(null);

  useEffect(() => {
    fetchFloatingTasks();
    fetchRoutes();
  }, [groupBy]);

  const fetchFloatingTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BaseURL}/maintenance/floating-tasks?groupBy=${groupBy}`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setFloatingTasks(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching floating tasks:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch floating tasks'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(
        `${BaseURL}/route/routes`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setRoutes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedTask || !selectedRoute) return;

    try {
      const response = await axios.post(
        `${BaseURL}/maintenance/floating-tasks/${selectedTask._id}/assign`,
        {
          routeId: selectedRoute._id,
          notes: assignmentNotes
        },
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Task assigned successfully'
        });
        
        setAssignmentDialog(false);
        setSelectedTask(null);
        setSelectedRoute(null);
        setAssignmentNotes('');
        
        fetchFloatingTasks();
        if (onTaskAssigned) onTaskAssigned();
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to assign task'
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getTaskAge = (createdAt) => {
    const days = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const renderTaskCard = (task) => (
    <Card key={task._id} className="floating-task-card mb-3">
      <div className="task-header">
        <div className="task-info">
          <h4 className="task-title">
            {task.orderId?.orderNumber || 'Unknown Order'}
          </h4>
          <p className="task-customer">
            {task.orderId?.customerName || 'Unknown Customer'}
          </p>
        </div>
        <Tag 
          severity={getPriorityColor(task.maintenanceConfig?.serviceDetails?.priority)} 
          value={task.maintenanceConfig?.serviceDetails?.priority?.toUpperCase()}
        />
      </div>

      <div className="task-details">
        <div className="detail-item">
          <MapPin size={16} />
          <span>{task.address}</span>
        </div>
        <div className="detail-item">
          <Clock size={16} />
          <span>{task.maintenanceConfig?.serviceDetails?.estimatedDuration || 30} min</span>
        </div>
        <div className="detail-item">
          <Calendar size={16} />
          <span>Created {getTaskAge(task.createdAt)}</span>
        </div>
      </div>

      {task.reason && (
        <div className="task-reason">
          <AlertCircle size={16} />
          <span>{task.reason}</span>
        </div>
      )}

      <div className="task-actions">
        <Button
          label="Assign to Route"
          icon="pi pi-arrow-right"
          size="small"
          onClick={() => {
            setSelectedTask(task);
            setAssignmentDialog(true);
          }}
        />
      </div>
    </Card>
  );

  const groupTasks = () => {
    if (!Array.isArray(floatingTasks)) return {};

    return floatingTasks.reduce((groups, task) => {
      let key;
      switch (groupBy) {
        case 'priority':
          key = task.maintenanceConfig?.serviceDetails?.priority || 'medium';
          break;
        case 'area':
          key = task.area || 'Unknown Area';
          break;
        case 'date':
          key = new Date(task.createdAt).toLocaleDateString();
          break;
        default:
          key = 'All Tasks';
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
      return groups;
    }, {});
  };

  const groupedTasks = groupTasks();

  return (
    <>
      <Toast ref={toast} />
      
      <div className="floating-tasks-panel">
        <div className="panel-header">
          <h3>Unassigned Maintenance Tasks</h3>
          <Button
            icon="pi pi-times"
            className="p-button-text p-button-rounded"
            onClick={onClose}
          />
        </div>

        <div className="panel-controls">
          <Dropdown
            value={groupBy}
            options={[
              { label: 'Priority', value: 'priority' },
              { label: 'Area', value: 'area' },
              { label: 'Date Created', value: 'date' }
            ]}
            onChange={(e) => setGroupBy(e.value)}
            placeholder="Group by"
          />
          
          <Badge 
            value={Array.isArray(floatingTasks) ? floatingTasks.length : 0} 
            severity="warning"
            className="ml-auto"
          />
        </div>

        <div className="panel-content">
          {loading ? (
            <div className="loading-container">
              <ProgressSpinner />
            </div>
          ) : Object.keys(groupedTasks).length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} className="text-success" />
              <p>No unassigned maintenance tasks</p>
            </div>
          ) : (
            Object.entries(groupedTasks).map(([group, tasks]) => (
              <div key={group} className="task-group">
                <h4 className="group-header">
                  {group} ({tasks.length})
                </h4>
                {tasks.map(task => renderTaskCard(task))}
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog
        visible={assignmentDialog}
        onHide={() => setAssignmentDialog(false)}
        header="Assign Task to Route"
        style={{ width: '500px' }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setAssignmentDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Assign"
              icon="pi pi-check"
              onClick={handleAssignTask}
              disabled={!selectedRoute}
            />
          </div>
        }
      >
        {selectedTask && (
          <div className="assignment-dialog-content">
            <div className="task-summary mb-3">
              <h5>{selectedTask.orderId?.orderNumber}</h5>
              <p>{selectedTask.address}</p>
              <Tag 
                severity={getPriorityColor(selectedTask.maintenanceConfig?.serviceDetails?.priority)} 
                value={selectedTask.maintenanceConfig?.serviceDetails?.priority?.toUpperCase()}
              />
            </div>

            <div className="field">
              <label htmlFor="route">Select Route</label>
              <Dropdown
                id="route"
                value={selectedRoute}
                options={routes}
                onChange={(e) => setSelectedRoute(e.value)}
                optionLabel="name"
                placeholder="Choose a route"
                className="w-full"
                itemTemplate={(route) => (
                  <div className="route-option">
                    <div 
                      className="route-color" 
                      style={{ backgroundColor: route.color }}
                    />
                    <span>{route.name}</span>
                    {route.driver && (
                      <span className="route-driver">
                        <Users size={14} />
                        {route.driver.name}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="field">
              <label htmlFor="notes">Assignment Notes (Optional)</label>
              <textarea
                id="notes"
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
                className="w-full p-inputtextarea"
                placeholder="Any special instructions..."
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default FloatingTasksPanel;