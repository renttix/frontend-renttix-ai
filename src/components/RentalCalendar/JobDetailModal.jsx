"use client";

import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Timeline } from "primereact/timeline";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Card } from "primereact/card";
import { format } from "date-fns";

const JobDetailModal = ({ visible, onHide, jobData }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!jobData) return null;

  const isDelivery = jobData.type === 'delivery';
  const statusColor = jobData.status === 'completed' ? 'success' : 
                     jobData.status === 'overdue' ? 'danger' : 'info';

  // Timeline events for job history
  const timelineEvents = [
    {
      status: 'Order Created',
      date: jobData.createdAt,
      icon: 'pi pi-shopping-cart',
      color: '#9C27B0'
    },
    {
      status: 'Scheduled',
      date: jobData.updatedAt,
      icon: 'pi pi-calendar',
      color: '#673AB7'
    },
    {
      status: isDelivery ? 'Ready for Delivery' : 'Ready for Collection',
      date: new Date().toISOString(),
      icon: 'pi pi-check',
      color: '#FF9800'
    },
    ...(jobData.status === 'completed' ? [{
      status: 'Completed',
      date: new Date().toISOString(),
      icon: 'pi pi-check-circle',
      color: '#4CAF50'
    }] : [])
  ];

  const customizedMarker = (item) => {
    return (
      <span className="flex w-8 h-8 items-center justify-center text-white rounded-full shadow-md" 
            style={{ backgroundColor: item.color }}>
        <i className={item.icon}></i>
      </span>
    );
  };

  const customizedContent = (item) => {
    return (
      <div className="flex flex-col">
        <span className="font-semibold">{item.status}</span>
        <span className="text-sm text-gray-600">
          {format(new Date(item.date), 'dd/MM/yyyy HH:mm')}
        </span>
      </div>
    );
  };

  const header = (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <i className={`pi ${isDelivery ? 'pi-truck' : 'pi-box'} text-2xl ${isDelivery ? 'text-green-600' : 'text-blue-600'}`}></i>
        <div>
          <h3 className="text-xl font-semibold m-0">
            {isDelivery ? 'Delivery' : 'Collection'} Job #{jobData.orderId}
          </h3>
          <p className="text-sm text-gray-600 m-0">{jobData.customer}</p>
        </div>
      </div>
      <Tag value={jobData.status || 'Scheduled'} severity={statusColor} />
    </div>
  );

  const footer = (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <Button
          label="Print Job Sheet"
          icon="pi pi-print"
          severity="secondary"
          outlined
        />
        <Button
          label="Send SMS"
          icon="pi pi-mobile"
          severity="secondary"
          outlined
        />
      </div>
      <div className="flex gap-2">
        <Button
          label="Edit Job"
          icon="pi pi-pencil"
          severity="warning"
        />
        <Button
          label="Close"
          icon="pi pi-times"
          severity="secondary"
          onClick={onHide}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={header}
      footer={footer}
      style={{ width: "80vw" }}
      breakpoints={{ "960px": "90vw", "640px": "95vw" }}
      modal
      maximizable
    >
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {/* Overview Tab */}
        <TabPanel header="Overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Information */}
            <Card title="Customer Information" className="h-full">
              <div className="space-y-2">
                <p><strong>Name:</strong> {jobData.customer}</p>
                <p><strong>Contact:</strong> {jobData.contact || 'N/A'}</p>
                <p className="flex items-center gap-2">
                  <strong>Phone:</strong> 
                  {jobData.phone ? (
                    <a href={`tel:${jobData.phone}`} className="text-blue-600 hover:underline">
                      {jobData.phone}
                    </a>
                  ) : 'N/A'}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Email:</strong> 
                  {jobData.email ? (
                    <a href={`mailto:${jobData.email}`} className="text-blue-600 hover:underline">
                      {jobData.email}
                    </a>
                  ) : 'N/A'}
                </p>
                <Divider />
                <p><strong>Delivery Address:</strong></p>
                <p className="text-gray-600">{jobData.address}</p>
                <Button
                  label="Get Directions"
                  icon="pi pi-map"
                  size="small"
                  className="mt-2"
                  onClick={() => {
                    const encodedAddress = encodeURIComponent(jobData.address);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                  }}
                />
              </div>
            </Card>

            {/* Job Details */}
            <Card title="Job Details" className="h-full">
              <div className="space-y-2">
                <p><strong>Job Type:</strong> {isDelivery ? 'Delivery' : 'Collection'}</p>
                <p><strong>Order ID:</strong> {jobData.orderId}</p>
                <p><strong>Scheduled Date:</strong> {format(new Date(jobData.scheduledDate || new Date()), 'dd/MM/yyyy')}</p>
                <p><strong>Scheduled Time:</strong> {jobData.scheduledTime || '09:00'}</p>
                <p><strong>Estimated Duration:</strong> {jobData.estimatedDuration || '45 mins'}</p>
                <p><strong>Status:</strong> <Tag value={jobData.status || 'Scheduled'} severity={statusColor} /></p>
                {!isDelivery && jobData.originalDeliveryDate && (
                  <>
                    <Divider />
                    <p><strong>Original Delivery:</strong> {format(new Date(jobData.originalDeliveryDate), 'dd/MM/yyyy')}</p>
                    <p><strong>Rental Duration:</strong> {jobData.rentalDuration || 'N/A'}</p>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Notes Section */}
          {jobData.notes && (
            <Card title="Special Instructions" className="mt-4">
              <div className="p-3 bg-yellow-50 rounded">
                <i className="pi pi-exclamation-triangle text-yellow-600 mr-2"></i>
                {jobData.notes}
              </div>
            </Card>
          )}
        </TabPanel>

        {/* Items Tab */}
        <TabPanel header="Items">
          <div className="space-y-4">
            {jobData.itemsDetail && jobData.itemsDetail.length > 0 ? (
              jobData.itemsDetail.map((item, idx) => (
                <Card key={idx} className="shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">
                        {item.quantity}x {item.name}
                      </h4>
                      {item.model && <p><strong>Model:</strong> {item.model}</p>}
                      {item.dimensions && <p><strong>Dimensions:</strong> {item.dimensions}</p>}
                      {item.components && <p><strong>Components:</strong> {item.components}</p>}
                      {item.includes && (
                        <p><strong>Includes:</strong> {item.includes.join(', ')}</p>
                      )}
                    </div>
                    <div>
                      {item.serialNumbers && (
                        <div>
                          <p className="font-semibold mb-1">Serial Numbers:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.serialNumbers.map((sn, snIdx) => (
                              <Tag key={snIdx} value={sn} className="text-xs" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-gray-600">{jobData.items || 'No items specified'}</p>
            )}
          </div>
        </TabPanel>

        {/* Assignment Tab */}
        <TabPanel header="Assignment">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Staff Assignment */}
            <Card title="Assigned Staff" className="h-full">
              {jobData.assignedStaff ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <i className="pi pi-user text-2xl text-gray-600"></i>
                    <div>
                      <p className="font-semibold">Driver</p>
                      <p className="text-gray-600">{jobData.assignedStaff.driver || 'Not assigned'}</p>
                    </div>
                  </div>
                  {jobData.assignedStaff.helper && (
                    <div className="flex items-center gap-3">
                      <i className="pi pi-users text-2xl text-gray-600"></i>
                      <div>
                        <p className="font-semibold">Helper</p>
                        <p className="text-gray-600">{jobData.assignedStaff.helper}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No staff assigned</p>
              )}
            </Card>

            {/* Vehicle Assignment */}
            <Card title="Assigned Vehicle" className="h-full">
              {jobData.vehicle ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <i className="pi pi-car text-2xl text-gray-600"></i>
                    <div>
                      <p className="font-semibold">{jobData.vehicle.registration || 'Not assigned'}</p>
                      <p className="text-gray-600">{jobData.vehicle.type}</p>
                      <p className="text-sm text-gray-500">Capacity: {jobData.vehicle.capacity}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No vehicle assigned</p>
              )}
            </Card>
          </div>

          {/* Route Information */}
          <Card title="Route Information" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-semibold">Estimated Distance</p>
                <p className="text-gray-600">12.5 miles</p>
              </div>
              <div>
                <p className="font-semibold">Estimated Travel Time</p>
                <p className="text-gray-600">25 minutes</p>
              </div>
              <div>
                <p className="font-semibold">Route Status</p>
                <Tag value="Optimized" severity="success" />
              </div>
            </div>
          </Card>
        </TabPanel>

        {/* History Tab */}
        <TabPanel header="History">
          <Timeline 
            value={timelineEvents} 
            align="alternate" 
            className="customized-timeline"
            marker={customizedMarker}
            content={customizedContent}
          />
          
          {/* Activity Log */}
          <Card title="Activity Log" className="mt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span>Job created by Admin User</span>
                <span className="text-gray-500">{format(new Date(jobData.createdAt), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span>Vehicle assigned: {jobData.vehicle?.registration}</span>
                <span className="text-gray-500">{format(new Date(jobData.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span>Driver assigned: {jobData.assignedStaff?.driver}</span>
                <span className="text-gray-500">{format(new Date(jobData.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
              </div>
            </div>
          </Card>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel header="Documents">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Delivery Note" className="text-center">
              <i className="pi pi-file-pdf text-6xl text-red-500 mb-3"></i>
              <p className="mb-3">DN-{jobData.orderId}</p>
              <div className="flex gap-2 justify-center">
                <Button label="View" icon="pi pi-eye" size="small" />
                <Button label="Download" icon="pi pi-download" size="small" severity="secondary" />
              </div>
            </Card>
            
            <Card title="Proof of Delivery" className="text-center">
              {jobData.status === 'completed' ? (
                <>
                  <i className="pi pi-check-circle text-6xl text-green-500 mb-3"></i>
                  <p className="mb-3">Signed by customer</p>
                  <div className="flex gap-2 justify-center">
                    <Button label="View" icon="pi pi-eye" size="small" />
                    <Button label="Download" icon="pi pi-download" size="small" severity="secondary" />
                  </div>
                </>
              ) : (
                <>
                  <i className="pi pi-clock text-6xl text-gray-400 mb-3"></i>
                  <p className="text-gray-500">Pending completion</p>
                </>
              )}
            </Card>
          </div>
        </TabPanel>
      </TabView>
    </Dialog>
  );
};

export default JobDetailModal;