"use client";

import React, { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import RentalCalendar from "../RentalCalendar";
import StackedBar from "../Chat/StackedBar";
import LineStyles from "../Chat/LineStyles";
import DoughnutChart from "../Chat/DoughnutChart";
import LastOrder from "./LastOrder";

const Ecommerce = () => {
  const router = useRouter();
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const handleViewFullCalendar = () => {
    setShowFullCalendar(true);
  };

  const handleCloseFullCalendar = () => {
    setShowFullCalendar(false);
  };

  // If showing full calendar view, render it in full screen mode
  if (showFullCalendar) {
    return (
      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-2">
            <i className="pi pi-calendar text-primary"></i>
            Full Calendar View
          </h1>
          <Button
            label="Close Calendar View"
            icon="pi pi-times"
            onClick={handleCloseFullCalendar}
            className="p-button-secondary"
          />
        </div>
        <Card className="p-0 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="p-4">
            <RentalCalendar isDashboardView={false} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Main Calendar Section - Principal Item */}
      <div className="mb-6">
        <Card className="p-0 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="p-4 border-b border-stroke dark:border-dark-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
                <i className="pi pi-calendar text-primary"></i>
                Rental Calendar Overview
              </h2>
              <Button
                label="View Full Calendar"
                icon="pi pi-external-link"
                onClick={handleViewFullCalendar}
                className="p-button-sm"
              />
            </div>
          </div>
          <div className="p-4">
            {/* Embedded Calendar with limited height for dashboard view */}
            <div style={{ height: '500px', overflow: 'hidden' }}>
              <RentalCalendar isDashboardView={true} />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Dashboard Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        <Card className="col-span-1 sm:col-span-2 lg:col-span-4 p-4 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="flex h-full items-center justify-center">
            <DoughnutChart />
          </div>
        </Card>
        <Card className="col-span-1 sm:col-span-2 lg:col-span-4 p-4 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="flex h-full w-full flex-col justify-end">
            <StackedBar />
          </div>
        </Card>
        <Card className="col-span-1 sm:col-span-2 lg:col-span-4 p-4 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <LineStyles />
        </Card>
      </div>

      {/* Tertiary Dashboard Items */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        <Card className="col-span-1 sm:col-span-2 lg:col-span-8 p-4 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <LastOrder />
        </Card>
        <Card className="col-span-1 sm:col-span-2 lg:col-span-4 p-4 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <label htmlFor="">Recent Transactions</label>
        </Card>
      </div>
    </div>
  );
};

export default Ecommerce;