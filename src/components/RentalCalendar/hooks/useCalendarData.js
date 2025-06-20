"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";

const useCalendarData = (token, filters) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Demo data for when API is not available
  const getDemoEvents = () => {
    const today = new Date();
    const events = [];
    
    // Add some demo deliveries
    for (let i = 0; i < 5; i++) {
      const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + i * 3);
      
      events.push({
        id: `demo-delivery-${i}`,
        title: `Delivery: Customer ${i + 1}`,
        start: deliveryDate.toISOString(),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        textColor: '#ffffff',
        extendedProps: {
          type: 'delivery',
          orderId: `ORD-${1000 + i}`,
          customer: `Customer ${i + 1}`,
          status: i === 0 ? 'overdue' : 'scheduled',
          address: `${100 + i} Demo Street, London, EC1A ${i + 1}BB`,
          items: `${i + 2}x Generators, ${(i + 1) * 5}x Fence Panels`,
          itemsDetail: [
            {
              name: 'Generators',
              quantity: i + 2,
              model: 'Honda EU22i',
              serialNumbers: Array(i + 2).fill(0).map((_, idx) => `GEN-2024-${1000 + i * 10 + idx}`)
            },
            {
              name: 'Fence Panels',
              quantity: (i + 1) * 5,
              model: 'Heras Standard',
              dimensions: '3.5m x 2m'
            }
          ],
          notes: i === 0 ? 'Urgent delivery required' : null,
          contact: `John Smith`,
          phone: `+44 7${700 + i}0 123456`,
          email: `customer${i + 1}@example.com`,
          assignedStaff: {
            driver: `Driver ${String.fromCharCode(65 + i)}`,
            helper: i % 2 === 0 ? `Helper ${i + 1}` : null
          },
          vehicle: {
            registration: `AB${String(i + 1).padStart(2, '0')} XYZ`,
            type: i < 3 ? 'Large Van' : 'Truck',
            capacity: i < 3 ? '3.5t' : '7.5t'
          },
          scheduledTime: `${9 + i}:00`,
          estimatedDuration: '45 mins',
          createdAt: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000).toISOString()
        }
      });
    }
    
    // Add some demo collections
    for (let i = 0; i < 3; i++) {
      const collectionDate = new Date(today);
      collectionDate.setDate(today.getDate() + i * 4 + 2);
      
      events.push({
        id: `demo-collection-${i}`,
        title: `Collection: Customer ${i + 6}`,
        start: collectionDate.toISOString(),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        textColor: '#ffffff',
        extendedProps: {
          type: 'return',
          orderId: `ORD-${2000 + i}`,
          customer: `Customer ${i + 6}`,
          status: 'scheduled',
          address: `${200 + i} Demo Avenue, Manchester, M1 ${i + 1}AA`,
          items: `${i + 1}x Scaffolding, ${(i + 2) * 3}x Tools`,
          itemsDetail: [
            {
              name: 'Scaffolding Sets',
              quantity: i + 1,
              model: 'Layher Allround',
              components: '10m towers with platforms'
            },
            {
              name: 'Power Tools',
              quantity: (i + 2) * 3,
              model: 'Various',
              includes: ['Drills', 'Saws', 'Sanders']
            }
          ],
          notes: i === 1 ? 'Customer requested morning collection' : null,
          contact: `Jane Doe`,
          phone: `+44 7${800 + i}0 654321`,
          email: `customer${i + 6}@example.com`,
          assignedStaff: {
            driver: `Driver ${String.fromCharCode(68 + i)}`,
            helper: `Helper ${i + 4}`
          },
          vehicle: {
            registration: `CD${String(i + 1).padStart(2, '0')} ABC`,
            type: 'Flatbed Truck',
            capacity: '7.5t'
          },
          scheduledTime: `${14 + i}:00`,
          estimatedDuration: '60 mins',
          originalDeliveryDate: new Date(Date.now() - (14 + i * 2) * 24 * 60 * 60 * 1000).toISOString(),
          rentalDuration: `${14 + i * 2} days`,
          createdAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - (8 - i) * 24 * 60 * 60 * 1000).toISOString()
        }
      });
    }
    
    // Add demo maintenance routes (grouped by route)
    const routes = [
      { name: 'North Route', color: '#EF4444', jobs: 5 },
      { name: 'South Route', color: '#3B82F6', jobs: 3 },
      { name: 'East Route', color: '#10B981', jobs: 7 },
      { name: 'West Route', color: '#8B5CF6', jobs: 4 }
    ];
    
    routes.forEach((route, i) => {
      const maintenanceDate = new Date(today);
      maintenanceDate.setDate(today.getDate() + i + 1);
      
      // Create demo jobs for this route
      const jobs = [];
      for (let j = 0; j < route.jobs; j++) {
        jobs.push({
          id: `job-${i}-${j}`,
          productName: ['Generator', 'Pump', 'Compressor', 'Heater'][j % 4],
          customerName: `Customer ${i * 10 + j + 1}`,
          address: `${100 + j} ${route.name} Street, City`,
          serviceType: ['inspection', 'cleaning', 'repair'][j % 3],
          scheduledTime: `${9 + j}:00`,
          estimatedDuration: 30,
          technician: `Tech ${j + 1}`,
          status: 'scheduled',
          priority: j === 0 ? 'high' : 'medium'
        });
      }
      
      events.push({
        id: `demo-maintenance-route-${i}`,
        title: `Maintenance Route: ${route.name} (${route.jobs} jobs)`,
        start: maintenanceDate.toISOString(),
        backgroundColor: route.color,
        borderColor: route.color,
        textColor: '#ffffff',
        extendedProps: {
          type: 'maintenance-route',
          routeId: `route-${i}`,
          routeName: route.name,
          totalJobs: route.jobs,
          jobs: jobs,
          isGrouped: true
        }
      });
    });
    
    return events;
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Use demo data if token is "demo-token"
    if (token === "demo-token") {
      setTimeout(() => {
        setEvents(getDemoEvents());
        setLoading(false);
      }, 500); // Simulate API delay
      return;
    }

    try {
      const response = await axios.get(
        `${BaseURL}/calendar/events`,
        {
          headers: {
            authorization: `Bearer ${token}`
          },
          params: {
            ...filters,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
            types: filters.type === 'all'
              ? ['delivery', 'return', 'maintenance']
              : filters.type === 'collection'
                ? ['return']
                : [filters.type]
          }
        }
      );

      if (response.data.success) {
        // Transform the events to FullCalendar format
        const transformedEvents = response.data.data.map(event => {
          // Set colors based on event type
          let backgroundColor, borderColor;
          if (event.type === 'delivery') {
            backgroundColor = '#10b981';
            borderColor = '#059669';
          } else if (event.type === 'maintenance') {
            backgroundColor = '#f59e0b';
            borderColor = '#d97706';
          } else {
            backgroundColor = '#3b82f6';
            borderColor = '#2563eb';
          }
          
          return {
            id: event.id || event._id,
            title: event.title,
            start: event.start || event.date,
            backgroundColor: event.backgroundColor || backgroundColor,
            borderColor: event.borderColor || borderColor,
            textColor: '#ffffff',
            extendedProps: event.extendedProps || {
              type: event.type,
              orderId: event.orderId,
              customer: event.customer || event.customerName,
              status: event.status,
              address: event.address,
              items: event.items,
              itemsDetail: event.itemsDetail || [],
              notes: event.notes,
              contact: event.contact,
              phone: event.phone,
              email: event.email,
              assignedStaff: event.assignedStaff || {},
              vehicle: event.vehicle || {},
              scheduledTime: event.scheduledTime,
              estimatedDuration: event.estimatedDuration,
              createdAt: event.createdAt,
              updatedAt: event.updatedAt,
              // Maintenance specific fields
              jobType: event.jobType,
              serviceType: event.serviceType,
              productName: event.productName,
              route: event.route,
              routeColor: event.routeColor,
              technician: event.technician,
              priority: event.priority
            }
          };
        });

        setEvents(transformedEvents);
      }
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      
      // If API fails, use demo data as fallback
      if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
        setEvents(getDemoEvents());
      } else {
        setError(err.message || "Failed to load calendar events");
      }
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [fetchEvents, token]);

  const refetch = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch, updateEvents: setEvents };
};

export default useCalendarData;