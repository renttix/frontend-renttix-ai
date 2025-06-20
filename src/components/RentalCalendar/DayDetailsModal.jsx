"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Badge } from "primereact/badge";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { format } from "date-fns";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import JobDetailModal from "./JobDetailModal";

const DayDetailsModal = ({ visible, onHide, date, dayData, initialTab = 0, onCreateRental, onTerminateRental }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [detailedEvents, setDetailedEvents] = useState({ deliveries: [], collections: [] });
  const [showJobDetailModal, setShowJobDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const { token } = useSelector((state) => state?.authReducer);
  const router = useRouter();

  // Update active tab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (visible && date && token) {
      fetchDetailedEvents();
    }
  }, [visible, date, token]);

  const fetchDetailedEvents = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch detailed data for the specific date
      // For now, we'll use the dayData passed from the parent
      if (dayData) {
        setDetailedEvents({
          deliveries: dayData.events.filter(e => e.extendedProps.type === 'delivery'),
          collections: dayData.events.filter(e => e.extendedProps.type === 'return')
        });
      }
    } catch (error) {
      console.error("Error fetching day details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (event) => {
    // Set the selected job with all its extended properties
    setSelectedJob({
      ...event.extendedProps,
      scheduledDate: event.start
    });
    setShowJobDetailModal(true);
  };

  const handleGetDirections = (address) => {
    // Open Google Maps with the address
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleCompleteDelivery = async (eventId) => {
    try {
      // API call to mark delivery as complete
      console.log("Marking delivery as complete:", eventId);
      // Refresh the events after completion
      fetchDetailedEvents();
    } catch (error) {
      console.error("Error completing delivery:", error);
    }
  };

  const renderEventCard = (event, type) => {
    const isDelivery = type === 'delivery';
    const statusColor = event.extendedProps.status === 'completed' ? 'success' : 
                       event.extendedProps.status === 'overdue' ? 'danger' : 'info';

    return (
      <div key={event.id} className="event-card border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <i className={`pi ${isDelivery ? 'pi-truck' : 'pi-box'} text-lg ${isDelivery ? 'text-green-600' : 'text-blue-600'}`}></i>
            <span className="font-semibold">{event.extendedProps.scheduledTime || '09:00'}</span>
            <Tag value={event.extendedProps.status || 'Scheduled'} severity={statusColor} />
            {event.extendedProps.estimatedDuration && (
              <span className="text-sm text-gray-500">({event.extendedProps.estimatedDuration})</span>
            )}
          </div>
          <span className="text-sm text-gray-500">#{event.extendedProps.orderId}</span>
        </div>

        {/* Customer Information */}
        <div className="mb-3">
          <h4 className="font-semibold text-lg">{event.extendedProps.customer}</h4>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <i className="pi pi-map-marker"></i>
            {event.extendedProps.address || '123 Main Street, London, EC1A 1BB'}
          </p>
          <div className="flex gap-4 mt-2 text-sm">
            {event.extendedProps.phone && (
              <a href={`tel:${event.extendedProps.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                <i className="pi pi-phone"></i>
                {event.extendedProps.phone}
              </a>
            )}
            {event.extendedProps.email && (
              <a href={`mailto:${event.extendedProps.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                <i className="pi pi-envelope"></i>
                {event.extendedProps.email}
              </a>
            )}
          </div>
        </div>

        <Divider className="my-3" />

        {/* Items Detail */}
        <div className="mb-3">
          <h5 className="font-medium mb-2">Items:</h5>
          {event.extendedProps.itemsDetail && event.extendedProps.itemsDetail.length > 0 ? (
            <div className="space-y-2">
              {event.extendedProps.itemsDetail.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{item.quantity}x {item.name}</span>
                      {item.model && <span className="text-gray-600"> - {item.model}</span>}
                    </div>
                  </div>
                  {item.serialNumbers && (
                    <div className="text-xs text-gray-500 mt-1">
                      S/N: {item.serialNumbers.join(', ')}
                    </div>
                  )}
                  {item.dimensions && (
                    <div className="text-xs text-gray-500">
                      Dimensions: {item.dimensions}
                    </div>
                  )}
                  {item.components && (
                    <div className="text-xs text-gray-500">
                      Components: {item.components}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">{event.extendedProps.items || 'No items specified'}</p>
          )}
        </div>

        <Divider className="my-3" />

        {/* Staff & Vehicle Assignment */}
        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          <div>
            <h5 className="font-medium mb-1">Assigned Staff:</h5>
            {event.extendedProps.assignedStaff ? (
              <div className="text-gray-600">
                <p><i className="pi pi-user mr-1"></i>Driver: {event.extendedProps.assignedStaff.driver || 'Not assigned'}</p>
                {event.extendedProps.assignedStaff.helper && (
                  <p><i className="pi pi-users mr-1"></i>Helper: {event.extendedProps.assignedStaff.helper}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Not assigned</p>
            )}
          </div>
          <div>
            <h5 className="font-medium mb-1">Vehicle:</h5>
            {event.extendedProps.vehicle ? (
              <div className="text-gray-600">
                <p><i className="pi pi-car mr-1"></i>{event.extendedProps.vehicle.registration || 'Not assigned'}</p>
                {event.extendedProps.vehicle.type && (
                  <p className="text-xs">{event.extendedProps.vehicle.type} ({event.extendedProps.vehicle.capacity})</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Not assigned</p>
            )}
          </div>
        </div>

        {/* Additional Information for Collections */}
        {!isDelivery && event.extendedProps.originalDeliveryDate && (
          <>
            <Divider className="my-3" />
            <div className="text-sm text-gray-600">
              <p><i className="pi pi-calendar mr-1"></i>Original Delivery: {format(new Date(event.extendedProps.originalDeliveryDate), 'dd/MM/yyyy')}</p>
              {event.extendedProps.rentalDuration && (
                <p><i className="pi pi-clock mr-1"></i>Rental Duration: {event.extendedProps.rentalDuration}</p>
              )}
            </div>
          </>
        )}

        {/* Notes */}
        {event.extendedProps.notes && (
          <div className="mb-3 p-2 bg-yellow-50 rounded text-sm">
            <i className="pi pi-exclamation-triangle text-yellow-600 mr-1"></i>
            {event.extendedProps.notes}
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-gray-400 mb-3">
          {event.extendedProps.createdAt && (
            <p>Created: {format(new Date(event.extendedProps.createdAt), 'dd/MM/yyyy HH:mm')}</p>
          )}
          {event.extendedProps.updatedAt && (
            <p>Updated: {format(new Date(event.extendedProps.updatedAt), 'dd/MM/yyyy HH:mm')}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            label="View Full Details"
            icon="pi pi-eye"
            size="small"
            onClick={() => handleViewOrder(event)}
          />
          <Button
            label="Get Directions"
            icon="pi pi-map"
            size="small"
            severity="secondary"
            onClick={() => handleGetDirections(event.extendedProps.address)}
          />
          {event.extendedProps.status !== 'completed' && (
            <Button
              label="Mark Complete"
              icon="pi pi-check"
              size="small"
              severity="success"
              onClick={() => handleCompleteDelivery(event.id)}
            />
          )}
          {isDelivery && event.extendedProps.status !== 'completed' && (
            <Button
              label="Terminate Rental"
              icon="pi pi-times-circle"
              size="small"
              severity="warning"
              onClick={() => onTerminateRental(event.extendedProps)}
            />
          )}
        </div>
      </div>
    );
  };

  const footer = (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <Button
          label="Print Schedule"
          icon="pi pi-print"
          severity="secondary"
          outlined
          onClick={() => window.print()}
        />
        <Button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          outlined
        />
      </div>
      <div className="flex gap-2">
        <Button
          label="Schedule Delivery"
          icon="pi pi-truck"
          severity="success"
          onClick={() => {
            onHide();
            onCreateRental();
          }}
        />
        <Button
          label="Schedule Collection"
          icon="pi pi-box"
          severity="info"
          onClick={() => {
            onHide();
            // In Phase 3, this will open a collection scheduling modal
          }}
        />
      </div>
    </div>
  );

  const formattedDate = date ? format(date, "EEEE, MMMM d, yyyy") : "";

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={formattedDate}
      footer={footer}
      style={{ width: "70vw" }}
      breakpoints={{ "960px": "85vw", "640px": "95vw" }}
      modal
      maximizable
    >
      <div className="day-details-content">
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel 
            header={
              <span className="flex items-center gap-2">
                <i className="pi pi-truck text-green-600"></i>
                Deliveries
                <Badge value={detailedEvents.deliveries.length} severity="success" />
              </span>
            }
          >
            {loading ? (
              <div className="text-center py-8">
                <i className="pi pi-spin pi-spinner text-4xl"></i>
                <p className="mt-2">Loading deliveries...</p>
              </div>
            ) : detailedEvents.deliveries.length > 0 ? (
              <div className="deliveries-list">
                {detailedEvents.deliveries.map(event => renderEventCard(event, 'delivery'))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="pi pi-truck text-4xl mb-2"></i>
                <p>No deliveries scheduled for this date</p>
              </div>
            )}
          </TabPanel>

          <TabPanel 
            header={
              <span className="flex items-center gap-2">
                <i className="pi pi-box text-blue-600"></i>
                Collections
                <Badge value={detailedEvents.collections.length} severity="info" />
              </span>
            }
          >
            {loading ? (
              <div className="text-center py-8">
                <i className="pi pi-spin pi-spinner text-4xl"></i>
                <p className="mt-2">Loading collections...</p>
              </div>
            ) : detailedEvents.collections.length > 0 ? (
              <div className="collections-list">
                {detailedEvents.collections.map(event => renderEventCard(event, 'collection'))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="pi pi-box text-4xl mb-2"></i>
                <p>No collections scheduled for this date</p>
              </div>
            )}
          </TabPanel>

          <TabPanel 
            header={
              <span className="flex items-center gap-2">
                <i className="pi pi-list"></i>
                All Events
                <Badge value={detailedEvents.deliveries.length + detailedEvents.collections.length} />
              </span>
            }
          >
            {loading ? (
              <div className="text-center py-8">
                <i className="pi pi-spin pi-spinner text-4xl"></i>
                <p className="mt-2">Loading events...</p>
              </div>
            ) : (
              <div className="all-events-list">
                {[...detailedEvents.deliveries, ...detailedEvents.collections]
                  .sort((a, b) => (a.extendedProps.scheduledTime || '00:00').localeCompare(b.extendedProps.scheduledTime || '00:00'))
                  .map(event => renderEventCard(event, event.extendedProps.type))}
                {detailedEvents.deliveries.length === 0 && detailedEvents.collections.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <i className="pi pi-calendar text-4xl mb-2"></i>
                    <p>No events scheduled for this date</p>
                  </div>
                )}
              </div>
            )}
          </TabPanel>
        </TabView>
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal
        visible={showJobDetailModal}
        onHide={() => {
          setShowJobDetailModal(false);
          setSelectedJob(null);
        }}
        jobData={selectedJob}
      />
    </Dialog>
  );
};

export default DayDetailsModal;