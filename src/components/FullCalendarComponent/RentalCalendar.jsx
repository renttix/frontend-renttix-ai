"use client";

import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays, isWithinInterval, isSameDay } from "date-fns";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import clsx from "clsx";

// 🚗 Resources (Vehicles/Properties)

// 📅 Generate full month days
const days = eachDayOfInterval({
  start: startOfMonth(new Date(2025, 2, 1)), // March 2025
  end: endOfMonth(new Date(2025, 2, 1)),
});

const resources = [
  { id: "bike", name: "Bike", color: "bg-red-500" },
  { id: "car", name: "Car", color: "bg-blue-500" },
  { id: "apartment", name: "Apartment", color: "bg-green-500" },
];


// 📌 Initial rental bookings
const initialRentals = [
  { id: "1", title: "John's Bike", start: "2025-03-05", end: "2025-03-07", resource: "bike" },
  { id: "2", title: "Jane's Car", start: "2025-03-12", end: "2025-03-14", resource: "car" },
  { id: "3", title: "Mark's Apartment", start: "2025-03-15", end: "2025-03-20", resource: "apartment" },
];

const RentalEvent = ({ rental }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "rental",
    item: { id: rental.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={clsx(
        "text-white text-xs px-2 py-1 rounded shadow-md cursor-pointer absolute",
        resources.find((r) => r.id === rental.resource)?.color,
        { "opacity-50": isDragging }
      )}
      style={{
        left: `${(days.findIndex((d) => isSameDay(d, new Date(rental.start))) / days.length) * 100}%`,
        width: `${
          ((days.findIndex((d) => isSameDay(d, new Date(rental.end))) - days.findIndex((d) => isSameDay(d, new Date(rental.start)))) /
            days.length) *
          100
        }%`,
      }}
    >
      {rental.title}
    </div>
  );
};

export default function RentalCalendar() {
  const [rentals, setRentals] = useState(initialRentals);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 w-full">
        <h1 className="text-2xl font-bold mb-4">Resource Timeline View</h1>

        {/* 📌 Calendar Grid */}
        <div className="border rounded overflow-hidden w-full">
          {/* Header Row - Dates */}
          <div className="grid" style={{ gridTemplateColumns: `150px repeat(${days.length}, 1fr)` }}>
            <div className="p-2 bg-gray-100 text-center font-semibold border-r">Resource</div>
            {days.map((day) => (
              <div key={day} className="p-2 text-center text-xs font-semibold border border-gray-200">
                {format(day, "d")}
              </div>
            ))}
          </div>

          {/* Resource Rows */}
          {resources.map((resource) => (
            <ResourceRow key={resource.id} resource={resource} rentals={rentals} setRentals={setRentals} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

const ResourceRow = ({ resource, rentals, setRentals }) => {
  return (
    <div className="grid border-b" style={{ gridTemplateColumns: `150px repeat(${days.length}, 1fr)`, position: "relative", height: "40px" }}>
      <div className="p-2 bg-gray-50 font-semibold border-r flex items-center">{resource.name}</div>
      <div className="col-span-full relative">
        {/* 📌 Rentals for this resource */}
        {rentals
          .filter((rental) => rental.resource === resource.id)
          .map((rental) => (
            <RentalEvent key={rental.id} rental={rental} />
          ))}
      </div>
    </div>
  );
};
