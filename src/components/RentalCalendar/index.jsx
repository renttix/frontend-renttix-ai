"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { useRef } from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarFilters from "./CalendarFilters";
import CalendarLegend from "./CalendarLegend";
import DayActionMenu from "./DayActionMenu";
import CreateRentalModalEnhanced from "./CreateRentalModalEnhanced";
import TerminateRentalModal from "./TerminateRentalModal";
import DayDetailsModal from "./DayDetailsModal";
import AvailabilityModal from "./AvailabilityModal";
import CalendarErrorBoundary from "./CalendarErrorBoundary";
import FloatingTasksPanel from "./FloatingTasksPanel";
import useCalendarData from "./hooks/useCalendarData";
import useCalendarSocket from "./hooks/useCalendarSocket";
import useCalendarOptimization from "./hooks/useCalendarOptimization";
import useCalendarKeyboard from "./hooks/useCalendarKeyboard";
import "./RentalCalendar.css";

const RentalCalendarContent = ({ isDashboardView = false }) => {
  const router = useRouter();
  
  // Load saved settings
  const savedSettings = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('calendarSettings') || '{}')
    : {};
  
  const [currentView, setCurrentView] = useState(savedSettings.defaultView || "dayGridMonth");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });
  const [showCreateRentalModal, setShowCreateRentalModal] = useState(false);
  const [showTerminateRentalModal, setShowTerminateRentalModal] = useState(false);
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showFloatingTasks, setShowFloatingTasks] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dayDetailsInitialTab, setDayDetailsInitialTab] = useState(0);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    depot: "all",
  });
  
  const toast = useRef(null);
  const calendarRef = useRef(null);
  const { token, user } = useSelector((state) => state?.authReducer);
  
  // Use optimization hook
  const {
    processEvents,
    createDebouncedFilter,
    createOptimizedEventUpdater,
    getPerformanceMetrics
  } = useCalendarOptimization();
  
  // Fetch calendar data using custom hook
  const { events, loading, error, refetch, updateEvents } = useCalendarData(token, filters);

  // Optimized event processor
  const { dayData, eventMap } = useMemo(() => {
    return processEvents(events);
  }, [events, processEvents]);

  // Handle real-time updates with optimization
  const handleSocketUpdate = useMemo(() => {
    return createOptimizedEventUpdater(updateEvents);
  }, [createOptimizedEventUpdater, updateEvents]);

  // Initialize Socket.io connection
  const { connected } = useCalendarSocket(token, user?._id, handleSocketUpdate);

  // Debounced filter handler
  const handleFilterChange = useMemo(() => {
    return createDebouncedFilter((newFilters) => {
      refetch();
    }, 300);
  }, [createDebouncedFilter, refetch]);

  // Handle view changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      // Map timeGridDay to listDay for better individual job display
      const actualView = currentView === 'timeGridDay' ? 'listDay' : currentView;
      calendarApi.changeView(actualView);
    }
  }, [currentView]);

  // Keyboard shortcuts
  const { showKeyboardHelp } = useCalendarKeyboard({
    onCreateRental: () => {
      setSelectedDate(new Date());
      setShowCreateRentalModal(true);
    },
    onViewDetails: () => {
      setSelectedDate(new Date());
      setShowDayDetailsModal(true);
    },
    onCheckAvailability: () => {
      setSelectedDate(new Date());
      setShowAvailabilityModal(true);
    },
    onRefresh: refetch,
    onToggleView: () => {
      const views = ['dayGridMonth', 'timeGridWeek', 'timeGridDay'];
      const currentIndex = views.indexOf(currentView);
      const nextIndex = (currentIndex + 1) % views.length;
      setCurrentView(views[nextIndex]);
    },
    onNavigateMonth: (direction) => {
      const calendarApi = calendarRef.current?.getApi();
      if (direction === 'prev') calendarApi?.prev();
      else if (direction === 'next') calendarApi?.next();
      else if (direction === 'today') calendarApi?.today();
    },
    calendarRef
  });

  // Custom day cell rendering to show delivery/collection/maintenance counts
  const dayCellContent = useCallback((arg) => {
    const dateKey = arg.date.toISOString().split('T')[0];
    const data = dayData[dateKey];
    
    return (
      <div className="custom-day-cell" data-date={dateKey}>
        <div className="day-number">{arg.dayNumberText}</div>
        {data && (
          <div className="day-counts">
            {data.deliveries > 0 && (
              <span className="delivery-count">
                <i className="pi pi-truck text-green-600"></i> {data.deliveries}
              </span>
            )}
            {data.collections > 0 && (
              <span className="collection-count">
                <i className="pi pi-box text-blue-600"></i> {data.collections}
              </span>
            )}
            {data.maintenance > 0 && (
              <span className="maintenance-count">
                <i className="pi pi-map-marker text-purple-600"></i> {data.maintenance}
              </span>
            )}
            {data.hasOverdue && (
              <i className="pi pi-exclamation-triangle text-orange-500 text-xs"></i>
            )}
          </div>
        )}
      </div>
    );
  }, [dayData]);

  // Handle date click
  const handleDateClick = useCallback((info) => {
    setSelectedDate(info.date);
    
    // Calculate menu position based on click coordinates
    const rect = info.dayEl.getBoundingClientRect();
    setActionMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    
    setShowActionMenu(true);
  }, []);

  // Handle event click - Updated to open DayDetailsModal
  const handleEventClick = useCallback((info) => {
    const event = info.event;
    const eventDate = event.start;
    
    // Set the selected date to the event's date
    setSelectedDate(eventDate);
    
    // Set the initial tab based on event type
    if (event.extendedProps.type === 'delivery') {
      setDayDetailsInitialTab(0); // Deliveries tab
    } else if (event.extendedProps.type === 'return') {
      setDayDetailsInitialTab(1); // Collections tab
    }
    
    // Open the DayDetailsModal
    setShowDayDetailsModal(true);
  }, []);

  // Calendar event styling
  const eventClassNames = useCallback((arg) => {
    const type = arg.event.extendedProps.type;
    const status = arg.event.extendedProps.status;
    const classes = [`event-${type}`];
    
    if (status === 'completed') classes.push('event-completed');
    if (status === 'overdue') classes.push('event-overdue');
    
    return classes;
  }, []);

  // Custom event content
  const eventContent = useCallback((eventInfo) => {
    const isDelivery = eventInfo.event.extendedProps.type === 'delivery';
    const status = eventInfo.event.extendedProps.status;
    
    return (
      <div className="custom-event-content">
        <i className={`pi ${isDelivery ? 'pi-truck' : 'pi-box'} mr-1`}></i>
        <span className="event-title">{eventInfo.event.title}</span>
        {status === 'overdue' && <i className="pi pi-exclamation-triangle ml-1 text-orange-500"></i>}
      </div>
    );
  }, []);

  // Handle drag and drop
  const handleEventDrop = useCallback((info) => {
    const event = info.event;
    const oldDate = info.oldEvent.start;
    const newDate = event.start;
    const oldTime = info.oldEvent.start?.toTimeString();
    const newTime = event.start?.toTimeString();
    
    // Check if it's just a time change within the same day (reordering)
    const isSameDay = oldDate.toDateString() === newDate.toDateString();
    const isReordering = isSameDay && oldTime !== newTime;
    
    const message = isReordering
      ? `Reorder ${event.title} to ${newTime.split(' ')[0]}?`
      : `Move ${event.title} from ${oldDate.toDateString()} to ${newDate.toDateString()}?`;
    
    if (window.confirm(message)) {
      console.log("Event moved:", event.id, newDate);
      
      toast.current?.show({
        severity: 'success',
        summary: isReordering ? 'Event Reordered' : 'Event Rescheduled',
        detail: isReordering
          ? `${event.title} has been reordered to ${newTime.split(' ')[0]}`
          : `${event.title} has been moved to ${newDate.toDateString()}`,
        life: 3000
      });
    } else {
      info.revert();
    }
  }, []);

  // Log performance metrics in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const metrics = getPerformanceMetrics();
        console.log('Calendar Performance:', metrics);
      }, 10000); // Log every 10 seconds

      return () => clearInterval(interval);
    }
  }, [getPerformanceMetrics]);

  return (
    <div className={`rental-calendar-container ${isDashboardView ? 'dashboard-view' : ''}`}>
      <Toast ref={toast} />
      
      {/* Connection Status Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Button
          icon="pi pi-question-circle"
          rounded
          text
          severity="help"
          tooltip="Keyboard Shortcuts"
          tooltipOptions={{ position: 'bottom' }}
          onClick={showKeyboardHelp}
        />
        <Tag 
          value={connected ? "Live" : "Offline"} 
          severity={connected ? "success" : "danger"}
          icon={connected ? "pi pi-wifi" : "pi pi-exclamation-triangle"}
        />
      </div>
      
      <CalendarHeader
        currentView={currentView}
        setCurrentView={setCurrentView}
        calendarRef={calendarRef}
        onShowFloatingTasks={() => setShowFloatingTasks(true)}
      />
      
      <CalendarFilters 
        filters={filters}
        setFilters={setFilters}
        onFilterChange={handleFilterChange}
      />
      
      <div className="calendar-wrapper">
        {loading && (
          <div className="calendar-loading">
            <i className="pi pi-spin pi-spinner text-4xl"></i>
            <p>Loading calendar events...</p>
          </div>
        )}
        
        {error && (
          <div className="calendar-error">
            <i className="pi pi-exclamation-triangle text-4xl text-red-500"></i>
            <p>Error loading calendar: {error}</p>
            <Button label="Retry" onClick={refetch} />
          </div>
        )}
        
        {!loading && !error && (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={currentView === 'timeGridDay' ? 'listDay' : currentView}
            headerToolbar={false}
            events={events}
            views={{
              dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' }
              },
              timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
              },
              timeGridDay: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                slotDuration: '01:00:00',
                slotLabelInterval: '01:00',
                allDaySlot: true,
                slotMinTime: '00:00:00',
                slotMaxTime: '24:00:00',
                eventOverlap: false,
                eventOrder: 'start,title'
              },
              listDay: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                listDayFormat: false,
                noEventsText: 'No jobs scheduled for this day'
              }
            }}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventClassNames={eventClassNames}
            eventContent={eventContent}
            dayCellContent={dayCellContent}
            height="auto"
            dayMaxEvents={savedSettings.maxEventsPerDay || 3}
            moreLinkText="more"
            eventDisplay={savedSettings.eventDisplay || "block"}
            editable={savedSettings.enableDragDrop !== false}
            eventDrop={handleEventDrop}
            weekends={savedSettings.showWeekends !== false}
            eventDurationEditable={false}
            // Day view specific settings
            slotEventOverlap={false}
            eventResizableFromStart={false}
            // Performance optimizations
            eventOrderStrict={true}
            progressiveEventRendering={true}
            handleWindowResize={true}
            windowResizeDelay={200}
          />
        )}
      </div>
      
      {!isDashboardView && <CalendarLegend />}
      
      {/* Modals */}
      {showActionMenu && (
        <DayActionMenu
          date={selectedDate}
          position={actionMenuPosition}
          onHide={() => setShowActionMenu(false)}
          dayData={selectedDate ? dayData[selectedDate.toISOString().split('T')[0]] : null}
          onViewDetails={() => {
            setDayDetailsInitialTab(2); // All Events tab
            setShowDayDetailsModal(true);
            setShowActionMenu(false);
          }}
          onCreateNewRental={() => {
            setShowCreateRentalModal(true);
            setShowActionMenu(false);
          }}
          onTerminateRental={() => {
            router.push('/order/terminate');
            setShowActionMenu(false);
          }}
          onCheckAvailability={() => {
            setShowAvailabilityModal(true);
            setShowActionMenu(false);
          }}
        />
      )}
      
      <CreateRentalModalEnhanced
        visible={showCreateRentalModal}
        onHide={() => {
          setShowCreateRentalModal(false);
          setSelectedProduct(null);
        }}
        prefilledDate={selectedDate}
        prefilledProduct={selectedProduct}
        onSuccess={() => {
          refetch();
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Rental created successfully',
            life: 3000
          });
        }}
      />
      
      <TerminateRentalModal
        visible={showTerminateRentalModal}
        onHide={() => setShowTerminateRentalModal(false)}
        order={selectedOrder}
        onSuccess={() => {
          refetch();
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Collection scheduled successfully',
            life: 3000
          });
        }}
      />
      
      <DayDetailsModal
        visible={showDayDetailsModal}
        onHide={() => {
          setShowDayDetailsModal(false);
          setDayDetailsInitialTab(0); // Reset to default tab
        }}
        date={selectedDate}
        dayData={selectedDate ? dayData[selectedDate.toISOString().split('T')[0]] : null}
        initialTab={dayDetailsInitialTab}
        onCreateRental={() => {
          setShowDayDetailsModal(false);
          setShowCreateRentalModal(true);
        }}
        onTerminateRental={(order) => {
          setShowDayDetailsModal(false);
          router.push('/order/terminate');
        }}
      />
      
      <AvailabilityModal
        visible={showAvailabilityModal}
        onHide={() => setShowAvailabilityModal(false)}
        date={selectedDate}
        onCreateRental={(date, product) => {
          setSelectedDate(date);
          setSelectedProduct(product);
          setShowAvailabilityModal(false);
          setShowCreateRentalModal(true);
        }}
      />
      
      {showFloatingTasks && (
        <FloatingTasksPanel
          onTaskAssigned={() => {
            refetch();
            toast.current.show({
              severity: 'success',
              summary: 'Success',
              detail: 'Task assigned to route',
              life: 3000
            });
          }}
          onClose={() => setShowFloatingTasks(false)}
        />
      )}
    </div>
  );
};

// Main component with error boundary
const RentalCalendar = ({ isDashboardView = false }) => {
  return (
    <CalendarErrorBoundary>
      <RentalCalendarContent isDashboardView={isDashboardView} />
    </CalendarErrorBoundary>
  );
};

export default RentalCalendar;