"use client";

import React from "react";

const CalendarLegend = () => {
  const legendItems = [
    { icon: "pi-truck", color: "text-green-600", label: "Deliveries", bgColor: "bg-green-100" },
    { icon: "pi-box", color: "text-blue-600", label: "Collections", bgColor: "bg-blue-100" },
    { icon: "pi-map-marker", color: "text-purple-600", label: "Maintenance Routes", bgColor: "bg-purple-100" },
    { icon: "pi-exclamation-triangle", color: "text-orange-600", label: "Overdue", bgColor: "bg-orange-100" },
    { icon: "pi-check-circle", color: "text-gray-600", label: "Completed", bgColor: "bg-gray-100" }
  ];

  return (
    <div className="calendar-legend mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="font-medium">Legend:</span>
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`${item.bgColor} p-1 rounded`}>
              <i className={`pi ${item.icon} ${item.color}`}></i>
            </div>
            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarLegend;