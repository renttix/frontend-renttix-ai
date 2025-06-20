"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { ButtonGroup } from "primereact/buttongroup";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";
import { Slider } from "primereact/slider";
import { format } from "date-fns";
import CalendarHelpDialog from "./CalendarHelpDialog";

const CalendarHeader = ({ currentView, setCurrentView, calendarRef, onShowFloatingTasks }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [settings, setSettings] = useState({
    showWeekends: true,
    startWeekOn: 'sunday',
    defaultView: 'dayGridMonth',
    eventDisplay: 'block',
    maxEventsPerDay: 3,
    showLegend: true,
    enableDragDrop: true,
    showFloatingTasksButton: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Apply settings immediately for some options
    if (key === 'showWeekends' && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.setOption('weekends', value);
    }
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('calendarSettings', JSON.stringify(settings));
    setShowSettings(false);
    
    // Apply settings
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.setOption('weekends', settings.showWeekends);
      calendarApi.setOption('dayMaxEvents', settings.maxEventsPerDay);
      calendarApi.setOption('eventDisplay', settings.eventDisplay);
    }
  };
  const handlePrevMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.prev();
  };

  const handleNextMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.next();
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.today();
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      // Map timeGridDay to listDay for better individual job display
      const actualView = view === 'timeGridDay' ? 'listDay' : view;
      calendarApi.changeView(actualView);
    }
  };

  const getCurrentMonth = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const date = calendarApi.getDate();
      return format(date, "MMMM yyyy");
    }
    return format(new Date(), "MMMM yyyy");
  };

  return (
    <div className="calendar-header">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
          <i className="pi pi-calendar text-primary"></i>
          Rental Calendar
        </h2>
        
        <div className="flex items-center gap-2">
          {onShowFloatingTasks && (
            <Button
              icon="pi pi-exclamation-triangle"
              rounded
              text
              severity="warning"
              tooltip="Unassigned Maintenance Tasks"
              tooltipOptions={{ position: 'bottom' }}
              onClick={onShowFloatingTasks}
              badge="!"
              badgeClassName="p-badge-warning"
            />
          )}
          <Button
            icon="pi pi-question-circle"
            rounded
            text
            severity="help"
            tooltip="Calendar Help"
            tooltipOptions={{ position: 'bottom' }}
            onClick={() => setShowHelp(true)}
          />
          <Button
            icon="pi pi-cog"
            rounded
            text
            severity="secondary"
            tooltip="Calendar Settings"
            tooltipOptions={{ position: 'bottom' }}
            onClick={() => setShowSettings(true)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Button 
            icon="pi pi-chevron-left" 
            onClick={handlePrevMonth}
            rounded
            outlined
            size="small"
          />
          
          <h3 className="text-xl font-semibold min-w-[150px] text-center">
            {getCurrentMonth()}
          </h3>
          
          <Button 
            icon="pi pi-chevron-right" 
            onClick={handleNextMonth}
            rounded
            outlined
            size="small"
          />
          
          <Button 
            label="Today" 
            onClick={handleToday}
            size="small"
            className="ml-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <ButtonGroup>
            <Button
              label="Month"
              onClick={() => handleViewChange("dayGridMonth")}
              severity={currentView === "dayGridMonth" ? "primary" : "secondary"}
              size="small"
            />
            <Button
              label="Week"
              onClick={() => handleViewChange("timeGridWeek")}
              severity={currentView === "timeGridWeek" ? "primary" : "secondary"}
              size="small"
            />
            <Button
              label="Day"
              onClick={() => handleViewChange("timeGridDay")}
              severity={currentView === "timeGridDay" || currentView === "listDay" ? "primary" : "secondary"}
              size="small"
            />
          </ButtonGroup>
          
          <div className="ml-4">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <input 
                type="text" 
                className="p-inputtext p-component p-inputtext-sm"
                placeholder="Search..."
                disabled // Will be enabled in Phase 2
              />
            </span>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog
        header="Calendar Settings"
        visible={showSettings}
        onHide={() => setShowSettings(false)}
        style={{ width: '500px' }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowSettings(false)}
              className="p-button-text"
            />
            <Button
              label="Save Settings"
              icon="pi pi-check"
              onClick={handleSaveSettings}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Display Options */}
          <div className="field">
            <h4 className="text-lg font-semibold mb-3">Display Options</h4>
            <div className="flex flex-col gap-3">
              <div className="flex align-items-center">
                <Checkbox
                  inputId="showWeekends"
                  checked={settings.showWeekends}
                  onChange={(e) => handleSettingChange('showWeekends', e.checked)}
                />
                <label htmlFor="showWeekends" className="ml-2">Show weekends</label>
              </div>
              
              <div className="flex align-items-center">
                <Checkbox
                  inputId="showLegend"
                  checked={settings.showLegend}
                  onChange={(e) => handleSettingChange('showLegend', e.checked)}
                />
                <label htmlFor="showLegend" className="ml-2">Show calendar legend</label>
              </div>
              
              <div className="flex align-items-center">
                <Checkbox
                  inputId="enableDragDrop"
                  checked={settings.enableDragDrop}
                  onChange={(e) => handleSettingChange('enableDragDrop', e.checked)}
                />
                <label htmlFor="enableDragDrop" className="ml-2">Enable drag and drop</label>
              </div>
            </div>
          </div>

          {/* Week Start Day */}
          <div className="field">
            <h4 className="text-lg font-semibold mb-3">Week Start Day</h4>
            <div className="flex flex-col gap-2">
              <div className="flex align-items-center">
                <RadioButton
                  inputId="sunday"
                  name="weekStart"
                  value="sunday"
                  onChange={(e) => handleSettingChange('startWeekOn', e.value)}
                  checked={settings.startWeekOn === 'sunday'}
                />
                <label htmlFor="sunday" className="ml-2">Sunday</label>
              </div>
              <div className="flex align-items-center">
                <RadioButton
                  inputId="monday"
                  name="weekStart"
                  value="monday"
                  onChange={(e) => handleSettingChange('startWeekOn', e.value)}
                  checked={settings.startWeekOn === 'monday'}
                />
                <label htmlFor="monday" className="ml-2">Monday</label>
              </div>
            </div>
          </div>

          {/* Default View */}
          <div className="field">
            <h4 className="text-lg font-semibold mb-3">Default View</h4>
            <div className="flex flex-col gap-2">
              <div className="flex align-items-center">
                <RadioButton
                  inputId="monthView"
                  name="defaultView"
                  value="dayGridMonth"
                  onChange={(e) => handleSettingChange('defaultView', e.value)}
                  checked={settings.defaultView === 'dayGridMonth'}
                />
                <label htmlFor="monthView" className="ml-2">Month</label>
              </div>
              <div className="flex align-items-center">
                <RadioButton
                  inputId="weekView"
                  name="defaultView"
                  value="timeGridWeek"
                  onChange={(e) => handleSettingChange('defaultView', e.value)}
                  checked={settings.defaultView === 'timeGridWeek'}
                />
                <label htmlFor="weekView" className="ml-2">Week</label>
              </div>
              <div className="flex align-items-center">
                <RadioButton
                  inputId="dayView"
                  name="defaultView"
                  value="timeGridDay"
                  onChange={(e) => handleSettingChange('defaultView', e.value)}
                  checked={settings.defaultView === 'timeGridDay'}
                />
                <label htmlFor="dayView" className="ml-2">Day</label>
              </div>
            </div>
          </div>

          {/* Max Events Per Day */}
          <div className="field">
            <h4 className="text-lg font-semibold mb-3">
              Max Events Per Day: {settings.maxEventsPerDay}
            </h4>
            <Slider
              value={settings.maxEventsPerDay}
              onChange={(e) => handleSettingChange('maxEventsPerDay', e.value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </Dialog>

      {/* Help Dialog */}
      <CalendarHelpDialog
        visible={showHelp}
        onHide={() => setShowHelp(false)}
      />
    </div>
  );
};

export default CalendarHeader;