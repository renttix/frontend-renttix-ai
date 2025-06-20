"use client";

import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { format } from "date-fns";
import { Divider } from "primereact/divider";
import { Badge } from "primereact/badge";
import "./DayActionMenu.css";

const DayActionMenu = ({ 
  date, 
  position, 
  onHide, 
  dayData,
  onViewDetails,
  onCreateNewRental,
  onTerminateRental,
  onCheckAvailability 
}) => {
  const formattedDate = date ? format(date, "EEEE, MMMM d, yyyy") : "";
  const dayOfWeek = date ? format(date, "EEEE") : "";
  const monthDay = date ? format(date, "MMMM d") : "";
  const year = date ? format(date, "yyyy") : "";

  const hasEvents = dayData && (dayData.deliveries > 0 || dayData.collections > 0);

  return (
    <Dialog
      visible={!!date}
      onHide={onHide}
      header={null}
      footer={null}
      style={{ width: '400px' }}
      position="center"
      modal
      className="day-action-dialog"
      dismissableMask
      draggable={false}
    >
      {/* Custom Header */}
      <div className="day-action-header">
        <div className="date-display">
          <div className="day-of-week">{dayOfWeek}</div>
          <div className="month-day">{monthDay}</div>
          <div className="year">{year}</div>
        </div>
        <Button 
          icon="pi pi-times" 
          rounded 
          text 
          severity="secondary"
          onClick={onHide}
          className="close-button"
        />
      </div>

      {/* Day Summary */}
      {hasEvents && (
        <div className="day-summary">
          <div className="summary-grid">
            {dayData.deliveries > 0 && (
              <div className="summary-item deliveries">
                <i className="pi pi-truck"></i>
                <div className="summary-content">
                  <span className="summary-count">{dayData.deliveries}</span>
                  <span className="summary-label">Deliveries</span>
                </div>
              </div>
            )}
            {dayData.collections > 0 && (
              <div className="summary-item collections">
                <i className="pi pi-box"></i>
                <div className="summary-content">
                  <span className="summary-count">{dayData.collections}</span>
                  <span className="summary-label">Collections</span>
                </div>
              </div>
            )}
          </div>
          {dayData.hasOverdue && (
            <div className="overdue-warning">
              <i className="pi pi-exclamation-triangle"></i>
              <span>Some items are overdue</span>
            </div>
          )}
        </div>
      )}

      <Divider />

      {/* Action Buttons */}
      <div className="action-buttons">
        <Button
          label="View Day Details"
          icon="pi pi-calendar"
          onClick={() => {
            onViewDetails?.();
            onHide();
          }}
          className="action-button view-details"
          severity="info"
          outlined
        />
        
        <Button
          label="Create New Rental"
          icon="pi pi-plus-circle"
          onClick={() => {
            onCreateNewRental?.();
            onHide();
          }}
          className="action-button create-rental"
          severity="success"
        />
        
        <Button
          label="Terminate Rental"
          icon="pi pi-times-circle"
          onClick={() => {
            onTerminateRental?.();
            onHide();
          }}
          className="action-button terminate-rental"
          severity="danger"
          outlined
        />
        
        <Button
          label="Check Availability"
          icon="pi pi-chart-line"
          onClick={() => {
            onCheckAvailability?.();
            onHide();
          }}
          className="action-button check-availability"
          severity="secondary"
          outlined
        />
      </div>

      {/* Quick Tips */}
      <div className="quick-tips">
        <div className="tip">
          <i className="pi pi-info-circle"></i>
          <span>Tip: You can drag and drop events to reschedule them</span>
        </div>
      </div>
    </Dialog>
  );
};

export default DayActionMenu;