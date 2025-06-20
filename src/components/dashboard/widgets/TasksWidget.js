import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Checkbox } from 'primereact/checkbox';
import { Skeleton } from 'primereact/skeleton';
import { fetchWidgetData } from '../../../services/dashboardService';
import './TasksWidget.css';

const TasksWidget = ({ config = {} }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTasks();
    
    // Set up refresh interval if configured
    if (config.refreshInterval) {
      const interval = setInterval(loadTasks, config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [config]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tasks data
      const data = await fetchWidgetData('tasks', {
        status: config.status || 'pending',
        limit: config.limit || 10,
        priority: config.priority
      });
      
      setTasks(data?.tasks || getDefaultTasks());
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
      setTasks(getDefaultTasks());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTasks = () => {
    return [
      {
        id: 1,
        title: 'Deliver equipment to Site A',
        type: 'delivery',
        priority: 'high',
        dueTime: '10:00 AM',
        status: 'pending',
        assignee: 'John Smith'
      },
      {
        id: 2,
        title: 'Collect rental from Customer B',
        type: 'collection',
        priority: 'medium',
        dueTime: '2:00 PM',
        status: 'pending',
        assignee: 'Jane Doe'
      },
      {
        id: 3,
        title: 'Maintenance check on Asset #123',
        type: 'maintenance',
        priority: 'low',
        dueTime: '4:00 PM',
        status: 'pending',
        assignee: 'Mike Johnson'
      },
      {
        id: 4,
        title: 'Process return inspection',
        type: 'inspection',
        priority: 'medium',
        dueTime: '11:30 AM',
        status: 'in-progress',
        assignee: 'Sarah Wilson'
      },
      {
        id: 5,
        title: 'Update inventory counts',
        type: 'admin',
        priority: 'low',
        dueTime: 'EOD',
        status: 'pending',
        assignee: 'Admin Team'
      }
    ];
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'delivery': return 'pi-truck';
      case 'collection': return 'pi-inbox';
      case 'maintenance': return 'pi-wrench';
      case 'inspection': return 'pi-search';
      case 'admin': return 'pi-file';
      default: return 'pi-check-circle';
    }
  };

  const handleTaskToggle = (taskId) => {
    // In a real implementation, this would update the task status
    console.log('Toggle task:', taskId);
  };

  if (loading) {
    return (
      <div className="tasks-widget">
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 border rounded">
              <Skeleton shape="circle" size="2rem" />
              <div className="flex-1">
                <Skeleton width="70%" height="1rem" className="mb-2" />
                <Skeleton width="40%" height="0.8rem" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-red-500">
        <i className="pi pi-exclamation-triangle mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="tasks-widget">
      <div className="tasks-header mb-3 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {tasks.filter(t => t.status === 'pending').length} pending tasks
        </div>
        <Button 
          icon="pi pi-plus" 
          label="Add Task" 
          size="small" 
          className="p-button-text"
        />
      </div>

      <div className="tasks-list space-y-2">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`task-item p-3 border rounded-lg hover:shadow-sm transition-shadow ${
              task.status === 'completed' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={task.status === 'completed'}
                onChange={() => handleTaskToggle(task.id)}
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <i className={`${getTypeIcon(task.type)} text-sm`} />
                    <span className={`font-medium ${
                      task.status === 'completed' ? 'line-through' : ''
                    }`}>
                      {task.title}
                    </span>
                  </div>
                  <Badge 
                    value={task.priority} 
                    severity={getPriorityColor(task.priority)}
                    className="text-xs"
                  />
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <i className="pi pi-clock" />
                    {task.dueTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="pi pi-user" />
                    {task.assignee}
                  </span>
                  {task.status === 'in-progress' && (
                    <Badge value="In Progress" severity="info" className="text-xs" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <i className="pi pi-check-circle text-4xl mb-2" />
          <p>No tasks at the moment</p>
        </div>
      )}
    </div>
  );
};

export default TasksWidget;