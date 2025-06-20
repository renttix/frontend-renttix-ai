import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { classNames } from 'primereact/utils';
import './JobCard.css';

const JobCard = ({ 
  job, 
  onDragStart, 
  onDragEnd, 
  onContextMenu,
  isDragging = false,
  isCompact = true 
}) => {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      jobId: job._id,
      routeId: job.routeId,
      date: job.date
    }));
    
    // Create custom drag image
    const dragImage = e.currentTarget.cloneNode(true);
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(-2deg)';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setTimeout(() => document.body.removeChild(dragImage), 0);
    
    if (onDragStart) {
      onDragStart(job);
    }
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(e, job);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getJobTypeIcon = (type) => {
    switch (type) {
      case 'delivery': return 'pi pi-truck';
      case 'collection': return 'pi pi-inbox';
      case 'service': return 'pi pi-wrench';
      default: return 'pi pi-box';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const cardClassName = classNames('job-card', {
    'job-card-dragging': isDragging,
    'job-card-compact': isCompact,
    'job-card-recurring': job.isRecurring,
    [`job-card-${job.status}`]: true
  });

  if (isCompact) {
    return (
      <>
        <Tooltip target={`.job-card-${job._id}`} position="top" />
        <div
          className={`${cardClassName} job-card-${job._id}`}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onContextMenu={handleContextMenu}
          data-pr-tooltip={`${job.customerName} - ${job.orderNumber}`}
        >
          <div className="job-card-header">
            <i className={getJobTypeIcon(job.type)} />
            <span className="job-card-time">{formatTime(job.scheduledTime)}</span>
            {job.isRecurring && <i className="pi pi-refresh job-card-recurring-icon" />}
          </div>
          <div className="job-card-body">
            <div className="job-card-customer">{job.customerName}</div>
            <div className="job-card-order">#{job.orderNumber}</div>
          </div>
          <Tag 
            value={job.status} 
            severity={getStatusColor(job.status)}
            className="job-card-status"
          />
        </div>
      </>
    );
  }

  // Full card view (for expanded mode)
  return (
    <Card
      className={cardClassName}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onContextMenu={handleContextMenu}
    >
      <div className="job-card-full">
        <div className="job-card-full-header">
          <div className="job-card-full-type">
            <i className={getJobTypeIcon(job.type)} />
            <span>{job.type}</span>
          </div>
          <Tag 
            value={job.status} 
            severity={getStatusColor(job.status)}
          />
        </div>
        
        <div className="job-card-full-content">
          <h4>{job.customerName}</h4>
          <p className="job-card-full-order">Order: #{job.orderNumber}</p>
          <p className="job-card-full-address">{job.address}</p>
          <p className="job-card-full-time">
            <i className="pi pi-clock" />
            {formatTime(job.scheduledTime)}
          </p>
          {job.notes && (
            <p className="job-card-full-notes">
              <i className="pi pi-comment" />
              {job.notes}
            </p>
          )}
        </div>
        
        {job.isRecurring && (
          <div className="job-card-full-recurring">
            <i className="pi pi-refresh" />
            <span>Recurring Job</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default JobCard;