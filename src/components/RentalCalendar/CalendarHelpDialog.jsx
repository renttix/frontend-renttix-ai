"use client";

import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Divider } from "primereact/divider";

const CalendarHelpDialog = ({ visible, onHide }) => {
  const helpSections = [
    {
      title: "Navigation",
      icon: "pi-compass",
      content: (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <i className="pi pi-chevron-left text-primary mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Previous/Next Month</h5>
              <p className="text-sm text-gray-600">Use the arrow buttons to navigate between months</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <i className="pi pi-calendar-today text-primary mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Today Button</h5>
              <p className="text-sm text-gray-600">Click "Today" to quickly return to the current date</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <i className="pi pi-eye text-primary mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">View Modes</h5>
              <p className="text-sm text-gray-600">Switch between Month, Week, and Day views using the view buttons</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Creating Bookings",
      icon: "pi-plus-circle",
      content: (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <i className="pi pi-calendar-plus text-success mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Click on a Date</h5>
              <p className="text-sm text-gray-600">Click any date to open the action menu</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <i className="pi pi-truck text-success mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Create New Rental</h5>
              <p className="text-sm text-gray-600">Select "Create New Rental" from the action menu to book equipment</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <i className="pi pi-info-circle text-success mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Fill Booking Details</h5>
              <p className="text-sm text-gray-600">Complete the rental form with customer, product, and delivery information</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Viewing Details",
      icon: "pi-info-circle",
      content: (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <i className="pi pi-calendar text-info mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Event Indicators</h5>
              <p className="text-sm text-gray-600">Each day shows counts for deliveries (truck icon), collections (box icon), and maintenance (map icon)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <i className="pi pi-search-plus text-info mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Click Events</h5>
              <p className="text-sm text-gray-600">Click on any event to view detailed information about that booking</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <i className="pi pi-list text-info mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Day Details</h5>
              <p className="text-sm text-gray-600">Select "View Day Details" to see all events for a specific date</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Calendar Features",
      icon: "pi-cog",
      content: (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <i className="pi pi-filter text-primary mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Filters</h5>
              <p className="text-sm text-gray-600">Use filters to show specific types of events, statuses, or depots</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <i className="pi pi-arrows-alt text-primary mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Drag & Drop</h5>
              <p className="text-sm text-gray-600">Drag events to reschedule them (if enabled in settings)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <i className="pi pi-check-circle text-primary mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Availability Check</h5>
              <p className="text-sm text-gray-600">Check product availability before creating bookings</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <i className="pi pi-exclamation-triangle text-warning mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Floating Tasks</h5>
              <p className="text-sm text-gray-600">View and assign unscheduled maintenance tasks</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Keyboard Shortcuts",
      icon: "pi-keyboard",
      content: (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">N</kbd>
              <span className="text-sm">New Rental</span>
            </div>
            
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">D</kbd>
              <span className="text-sm">Day Details</span>
            </div>
            
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">A</kbd>
              <span className="text-sm">Check Availability</span>
            </div>
            
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">R</kbd>
              <span className="text-sm">Refresh Calendar</span>
            </div>
            
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">V</kbd>
              <span className="text-sm">Toggle View</span>
            </div>
            
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">T</kbd>
              <span className="text-sm">Go to Today</span>
            </div>
            
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">←</kbd>
              <span className="text-sm">Previous Month</span>
            </div>
            
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">→</kbd>
              <span className="text-sm">Next Month</span>
            </div>
          </div>
          
          <Divider />
          
          <p className="text-sm text-gray-600">
            <i className="pi pi-info-circle mr-2"></i>
            Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">?</kbd> to show keyboard shortcuts at any time
          </p>
        </div>
      )
    },
    {
      title: "Legend",
      icon: "pi-palette",
      content: (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 bg-green-500 rounded mt-1"></div>
            <div>
              <h5 className="font-semibold mb-1">Deliveries</h5>
              <p className="text-sm text-gray-600">Green events indicate scheduled deliveries</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 bg-blue-500 rounded mt-1"></div>
            <div>
              <h5 className="font-semibold mb-1">Collections</h5>
              <p className="text-sm text-gray-600">Blue events indicate scheduled collections/returns</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 bg-purple-500 rounded mt-1"></div>
            <div>
              <h5 className="font-semibold mb-1">Maintenance</h5>
              <p className="text-sm text-gray-600">Purple events indicate maintenance tasks</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <i className="pi pi-exclamation-triangle text-orange-500 mt-1"></i>
            <div>
              <h5 className="font-semibold mb-1">Overdue</h5>
              <p className="text-sm text-gray-600">Warning icon indicates overdue items</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 bg-gray-300 rounded mt-1"></div>
            <div>
              <h5 className="font-semibold mb-1">Completed</h5>
              <p className="text-sm text-gray-600">Faded events indicate completed tasks</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2">
          <i className="pi pi-question-circle text-primary"></i>
          <span>Calendar Help</span>
        </div>
      }
      visible={visible}
      onHide={onHide}
      style={{ width: '90vw', maxWidth: '700px' }}
      modal
      dismissableMask
      draggable={false}
      resizable={false}
      footer={
        <div className="flex justify-end">
          <Button
            label="Got it!"
            icon="pi pi-check"
            onClick={onHide}
            className="p-button-primary"
          />
        </div>
      }
    >
      <TabView>
        {helpSections.map((section, index) => (
          <TabPanel
            key={index}
            header={
              <span className="flex items-center gap-2">
                <i className={`pi ${section.icon}`}></i>
                <span className="hidden sm:inline">{section.title}</span>
              </span>
            }
          >
            <div className="p-2">
              {section.content}
            </div>
          </TabPanel>
        ))}
      </TabView>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <i className="pi pi-lightbulb text-blue-600 mt-1"></i>
          <div>
            <h5 className="font-semibold text-blue-800 mb-1">Pro Tip</h5>
            <p className="text-sm text-blue-700">
              The calendar automatically updates in real-time when other users make changes. 
              Look for the "Live" indicator in the top-right corner to confirm you're connected.
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CalendarHelpDialog;