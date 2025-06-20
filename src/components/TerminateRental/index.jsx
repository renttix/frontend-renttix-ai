"use client";

import React, { useState, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { TabView, TabPanel } from "primereact/tabview";
import { useSelector } from "react-redux";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import TerminateRentalStats from "./TerminateRentalStats";
import TerminateRentalFilters from "./TerminateRentalFilters";
import TerminateRentalTable from "./TerminateRentalTable";
import TerminateRentalModal from "./TerminateRentalModal";
import useActiveRentals from "./hooks/useActiveRentals";

const TerminateRentalDashboard = () => {
  const toast = useRef(null);
  const { token, user } = useSelector((state) => state?.authReducer);
  
  const [filters, setFilters] = useState({
    search: "",
    customerId: null,
    productId: null,
    categoryId: null,
    dateFrom: null,
    dateTo: null,
    status: [],
    depot: null,
    page: 1,
    limit: 10,
    sortBy: "deliveryDate",
    sortOrder: "desc"
  });

  const [selectedRental, setSelectedRental] = useState(null);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { 
    rentals, 
    loading, 
    error, 
    totalRecords, 
    refetch 
  } = useActiveRentals(filters, token);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (event) => {
    setFilters({ ...filters, page: event.page + 1, limit: event.rows });
  };

  const handleSort = (event) => {
    setFilters({
      ...filters,
      sortBy: event.sortField,
      sortOrder: event.sortOrder === 1 ? "asc" : "desc"
    });
  };

  const handleTerminate = (rental) => {
    setSelectedRental(rental);
    setShowTerminateModal(true);
  };

  const handleTerminationSuccess = () => {
    setShowTerminateModal(false);
    setSelectedRental(null);
    refetch();
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Rental terminated successfully",
      life: 3000
    });
  };

  // Filter rentals for different tabs
  const overdueRentals = rentals?.filter(r => r.status === 'overdue') || [];
  const dueSoonRentals = rentals?.filter(r => r.status === 'due_soon') || [];

  return (
    <div className="terminate-rental-dashboard">
      <Toast ref={toast} />
      
      <Breadcrumb pageName="Terminate Rental" />
      
      {/* Statistics Cards */}
      <TerminateRentalStats
        loading={loading}
        totalActive={rentals?.length || 0}
        totalOverdue={overdueRentals.length}
        dueToday={rentals?.filter(r => {
          const today = new Date().toDateString();
          return new Date(r.expectedReturnDate).toDateString() === today;
        }).length || 0}
        dueThisWeek={dueSoonRentals.length}
      />
      
      {/* Main Content */}
      <Card className="mt-6">
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Active Rentals" leftIcon="pi pi-list">
            {/* Filters Section */}
            <TerminateRentalFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            
            {/* Table Section */}
            <TerminateRentalTable
              rentals={rentals || []}
              loading={loading}
              error={error}
              totalRecords={totalRecords}
              filters={filters}
              onPageChange={handlePageChange}
              onSort={handleSort}
              onTerminate={handleTerminate}
            />
          </TabPanel>
          
          <TabPanel header="Overdue Rentals" leftIcon="pi pi-exclamation-triangle">
            <TerminateRentalTable
              rentals={overdueRentals}
              loading={loading}
              error={error}
              totalRecords={overdueRentals.length}
              filters={filters}
              onPageChange={handlePageChange}
              onSort={handleSort}
              onTerminate={handleTerminate}
            />
          </TabPanel>
          
          <TabPanel header="Due Soon" leftIcon="pi pi-clock">
            <TerminateRentalTable
              rentals={dueSoonRentals}
              loading={loading}
              error={error}
              totalRecords={dueSoonRentals.length}
              filters={filters}
              onPageChange={handlePageChange}
              onSort={handleSort}
              onTerminate={handleTerminate}
            />
          </TabPanel>
        </TabView>
      </Card>
      
      {/* Termination Modal */}
      {selectedRental && (
        <TerminateRentalModal
          visible={showTerminateModal}
          onHide={() => setShowTerminateModal(false)}
          rental={selectedRental}
          onSuccess={handleTerminationSuccess}
        />
      )}
    </div>
  );
};

export default TerminateRentalDashboard;