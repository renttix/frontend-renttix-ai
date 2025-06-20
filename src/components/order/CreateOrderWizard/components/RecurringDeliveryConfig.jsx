"use client";
import React, { useState, useEffect } from 'react';
import { Panel } from 'primereact/panel';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { motion, AnimatePresence } from 'framer-motion';

const RecurringDeliveryConfig = ({ 
  value, 
  onChange, 
  startDate,
  minEndDate = null,
  maxEndDate = null 
}) => {
  const [enabled, setEnabled] = useState(value?.enabled || false);
  const [pattern, setPattern] = useState(value?.pattern || 'weekly');
  const [frequency, setFrequency] = useState(value?.frequency || 1);
  const [endType, setEndType] = useState(value?.endType || 'date');
  const [endDate, setEndDate] = useState(value?.endDate ? new Date(value.endDate) : null);
  const [occurrences, setOccurrences] = useState(value?.occurrences || 10);
  const [weekDays, setWeekDays] = useState(value?.weekDays || []);
  const [monthDay, setMonthDay] = useState(value?.monthDay || 1);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDates, setPreviewDates] = useState([]);

  const patternOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Bi-weekly', value: 'biweekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Custom', value: 'custom' }
  ];

  const weekDayOptions = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 }
  ];

  useEffect(() => {
    if (enabled) {
      const config = {
        enabled,
        pattern,
        frequency,
        endType,
        endDate: endDate?.toISOString(),
        occurrences,
        weekDays,
        monthDay,
        startDate
      };
      onChange(config);
      generatePreview(config);
    } else {
      onChange(null);
      setPreviewDates([]);
    }
  }, [enabled, pattern, frequency, endType, endDate, occurrences, weekDays, monthDay]);

  const generatePreview = (config) => {
    const dates = [];
    const start = new Date(startDate);
    let current = new Date(start);
    let count = 0;
    const maxPreview = 5;

    while (dates.length < maxPreview && count < 100) { // Safety limit
      if (config.pattern === 'daily') {
        current.setDate(current.getDate() + config.frequency);
      } else if (config.pattern === 'weekly' || config.pattern === 'biweekly') {
        const daysToAdd = config.pattern === 'weekly' ? 7 : 14;
        current.setDate(current.getDate() + daysToAdd * config.frequency);
      } else if (config.pattern === 'monthly') {
        current.setMonth(current.getMonth() + config.frequency);
        current.setDate(config.monthDay);
      } else if (config.pattern === 'custom' && config.weekDays.length > 0) {
        // Find next occurrence based on selected weekdays
        do {
          current.setDate(current.getDate() + 1);
        } while (!config.weekDays.includes(current.getDay()));
      }

      // Check end conditions
      if (config.endType === 'date' && config.endDate && current > new Date(config.endDate)) {
        break;
      }
      if (config.endType === 'occurrences' && dates.length >= config.occurrences - 1) {
        break;
      }

      dates.push(new Date(current));
      count++;
    }

    setPreviewDates(dates);
  };

  const handleToggle = (checked) => {
    setEnabled(checked);
    if (!checked) {
      setShowPreview(false);
    }
  };

  const calculateEndDate = () => {
    if (!startDate || endType !== 'occurrences') return null;
    
    const start = new Date(startDate);
    let estimatedEnd = new Date(start);
    
    if (pattern === 'daily') {
      estimatedEnd.setDate(estimatedEnd.getDate() + (occurrences - 1) * frequency);
    } else if (pattern === 'weekly') {
      estimatedEnd.setDate(estimatedEnd.getDate() + (occurrences - 1) * 7 * frequency);
    } else if (pattern === 'biweekly') {
      estimatedEnd.setDate(estimatedEnd.getDate() + (occurrences - 1) * 14 * frequency);
    } else if (pattern === 'monthly') {
      estimatedEnd.setMonth(estimatedEnd.getMonth() + (occurrences - 1) * frequency);
    }
    
    return estimatedEnd;
  };

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Checkbox
          inputId="recurring-enabled"
          checked={enabled}
          onChange={(e) => handleToggle(e.checked)}
        />
        <label htmlFor="recurring-enabled" className="font-semibold cursor-pointer">
          Set up Recurring Delivery
        </label>
      </div>
      {enabled && (
        <Tag 
          value="Recurring" 
          severity="info" 
          icon="pi pi-refresh"
        />
      )}
    </div>
  );

  return (
    <Panel header={header} toggleable collapsed={!enabled}>
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 pt-4"
          >
            {/* Pattern Selection */}
            <div className="field">
              <label className="font-semibold mb-2 block">Delivery Pattern</label>
              <div className="flex flex-wrap gap-3">
                {patternOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <RadioButton
                      inputId={`pattern-${option.value}`}
                      value={option.value}
                      checked={pattern === option.value}
                      onChange={(e) => setPattern(e.value)}
                    />
                    <label htmlFor={`pattern-${option.value}`} className="ml-2 cursor-pointer">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Pattern - Weekday Selection */}
            {pattern === 'custom' && (
              <div className="field">
                <label className="font-semibold mb-2 block">Select Delivery Days</label>
                <div className="flex flex-wrap gap-2">
                  {weekDayOptions.map((day) => (
                    <Button
                      key={day.value}
                      label={day.label}
                      size="small"
                      severity={weekDays.includes(day.value) ? 'primary' : 'secondary'}
                      outlined={!weekDays.includes(day.value)}
                      onClick={() => {
                        if (weekDays.includes(day.value)) {
                          setWeekDays(weekDays.filter(d => d !== day.value));
                        } else {
                          setWeekDays([...weekDays, day.value]);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Frequency for non-custom patterns */}
            {pattern !== 'custom' && pattern !== 'biweekly' && (
              <div className="field">
                <label htmlFor="frequency" className="font-semibold mb-2 block">
                  Every
                </label>
                <div className="flex items-center gap-2">
                  <InputNumber
                    inputId="frequency"
                    value={frequency}
                    onValueChange={(e) => setFrequency(e.value)}
                    min={1}
                    max={30}
                    showButtons
                    buttonLayout="horizontal"
                    style={{ width: '120px' }}
                  />
                  <span>
                    {pattern === 'daily' && 'day(s)'}
                    {pattern === 'weekly' && 'week(s)'}
                    {pattern === 'monthly' && 'month(s)'}
                  </span>
                </div>
              </div>
            )}

            {/* Monthly specific - day of month */}
            {pattern === 'monthly' && (
              <div className="field">
                <label htmlFor="monthDay" className="font-semibold mb-2 block">
                  Day of Month
                </label>
                <InputNumber
                  inputId="monthDay"
                  value={monthDay}
                  onValueChange={(e) => setMonthDay(e.value)}
                  min={1}
                  max={31}
                  showButtons
                  buttonLayout="horizontal"
                  style={{ width: '120px' }}
                />
              </div>
            )}

            {/* End Configuration */}
            <div className="field">
              <label className="font-semibold mb-2 block">End Recurring Delivery</label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <RadioButton
                    inputId="end-date"
                    value="date"
                    checked={endType === 'date'}
                    onChange={(e) => setEndType(e.value)}
                  />
                  <label htmlFor="end-date" className="ml-2 cursor-pointer">
                    On specific date
                  </label>
                </div>
                {endType === 'date' && (
                  <div className="ml-6">
                    <Calendar
                      value={endDate}
                      onChange={(e) => setEndDate(e.value)}
                      minDate={minEndDate || new Date(startDate)}
                      maxDate={maxEndDate}
                      dateFormat="dd/mm/yy"
                      showIcon
                      className="w-full max-w-xs"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <RadioButton
                    inputId="end-occurrences"
                    value="occurrences"
                    checked={endType === 'occurrences'}
                    onChange={(e) => setEndType(e.value)}
                  />
                  <label htmlFor="end-occurrences" className="ml-2 cursor-pointer">
                    After number of deliveries
                  </label>
                </div>
                {endType === 'occurrences' && (
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <InputNumber
                        value={occurrences}
                        onValueChange={(e) => setOccurrences(e.value)}
                        min={2}
                        max={100}
                        showButtons
                        buttonLayout="horizontal"
                        style={{ width: '120px' }}
                      />
                      <span>deliveries</span>
                    </div>
                    {calculateEndDate() && (
                      <small className="text-gray-500">
                        Estimated end date: {calculateEndDate().toLocaleDateString()}
                      </small>
                    )}
                  </div>
                )}

                <div className="flex items-center">
                  <RadioButton
                    inputId="end-never"
                    value="never"
                    checked={endType === 'never'}
                    onChange={(e) => setEndType(e.value)}
                  />
                  <label htmlFor="end-never" className="ml-2 cursor-pointer">
                    No end date (ongoing)
                  </label>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="border-t pt-4">
              <Button
                label={showPreview ? "Hide Preview" : "Show Preview"}
                icon={showPreview ? "pi pi-eye-slash" : "pi pi-eye"}
                size="small"
                text
                onClick={() => setShowPreview(!showPreview)}
              />
              
              {showPreview && previewDates.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Next deliveries:</p>
                  <div className="space-y-1">
                    {previewDates.map((date, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <i className="pi pi-calendar text-gray-400"></i>
                        <span>{date.toLocaleDateString('en-GB', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}</span>
                        {index === 0 && (
                          <Tag value="Next" severity="success" className="text-xs" />
                        )}
                      </div>
                    ))}
                    {endType === 'occurrences' && occurrences > previewDates.length && (
                      <small className="text-gray-500 italic">
                        ...and {occurrences - previewDates.length} more
                      </small>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Summary Message */}
            {enabled && (
              <Message 
                severity="info" 
                text={`Recurring delivery ${pattern} starting ${new Date(startDate).toLocaleDateString()}`}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
};

export default React.memo(RecurringDeliveryConfig);