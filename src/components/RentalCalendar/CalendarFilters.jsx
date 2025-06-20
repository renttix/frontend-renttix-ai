"use client";

import React from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const CalendarFilters = ({ filters, setFilters, onFilterChange }) => {
  const typeOptions = [
    { label: "All Types", value: "all" },
    { label: "Deliveries Only", value: "delivery" },
    { label: "Collections Only", value: "collection" },
    { label: "Maintenance Routes Only", value: "maintenance" }
  ];

  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Overdue", value: "overdue" }
  ];

  const depotOptions = [
    { label: "All Depots", value: "all" },
    { label: "Main Depot", value: "main" },
    { label: "North Depot", value: "north" },
    { label: "South Depot", value: "south" }
  ];

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      type: "all",
      status: "all",
      depot: "all"
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = filters.type !== "all" || filters.status !== "all" || filters.depot !== "all";

  return (
    <div className="calendar-filters mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Filters:</span>
        
        <Dropdown
          value={filters.type}
          options={typeOptions}
          onChange={(e) => handleFilterChange("type", e.value)}
          placeholder="All Types"
          className="w-auto"
          size="small"
        />
        
        <Dropdown
          value={filters.status}
          options={statusOptions}
          onChange={(e) => handleFilterChange("status", e.value)}
          placeholder="All Status"
          className="w-auto"
          size="small"
          disabled // Will be enabled when status tracking is implemented
        />
        
        <Dropdown
          value={filters.depot}
          options={depotOptions}
          onChange={(e) => handleFilterChange("depot", e.value)}
          placeholder="All Depots"
          className="w-auto"
          size="small"
          disabled // Will be enabled when depot filtering is implemented
        />
        
        {hasActiveFilters && (
          <Button
            label="Clear Filters"
            icon="pi pi-times"
            onClick={clearFilters}
            severity="secondary"
            size="small"
            text
          />
        )}
      </div>
    </div>
  );
};

export default CalendarFilters;