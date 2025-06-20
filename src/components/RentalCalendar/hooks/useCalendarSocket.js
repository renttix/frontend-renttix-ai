"use client";

import { useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { BaseURL } from "../../../../utils/baseUrl";

const useCalendarSocket = (token, vendorId, onEventUpdate) => {
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!token || !vendorId) return;

    // Extract base URL without /api
    const socketUrl = BaseURL.replace('/api', '');
    
    socketRef.current = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Calendar socket connected');
      reconnectAttempts.current = 0;
      
      // Subscribe to calendar events for this vendor
      socketRef.current.emit('calendar:subscribe', {
        vendorId,
        dateRange: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
        }
      });
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Calendar socket disconnected:', reason);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Calendar socket connection error:', error);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        socketRef.current.disconnect();
      }
    });

    // Calendar event listeners
    socketRef.current.on('calendar:delivery:created', (event) => {
      console.log('New delivery created:', event);
      onEventUpdate({
        type: 'delivery:created',
        event: transformSocketEvent(event, 'delivery')
      });
    });

    socketRef.current.on('calendar:collection:created', (event) => {
      console.log('New collection created:', event);
      onEventUpdate({
        type: 'collection:created',
        event: transformSocketEvent(event, 'return')
      });
    });

    socketRef.current.on('calendar:event:updated', (event) => {
      console.log('Event updated:', event);
      onEventUpdate({
        type: 'event:updated',
        event: transformSocketEvent(event)
      });
    });

    socketRef.current.on('calendar:event:cancelled', (eventId) => {
      console.log('Event cancelled:', eventId);
      onEventUpdate({
        type: 'event:cancelled',
        eventId
      });
    });

    // Batch updates for performance
    socketRef.current.on('calendar:batch:update', (updates) => {
      console.log('Batch update received:', updates);
      onEventUpdate({
        type: 'batch:update',
        updates: updates.map(u => ({
          ...u,
          event: transformSocketEvent(u.event, u.type)
        }))
      });
    });
  }, [token, vendorId, onEventUpdate]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('calendar:unsubscribe');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  // Transform socket event to calendar format
  const transformSocketEvent = (socketEvent, type) => {
    return {
      id: socketEvent._id || socketEvent.id,
      title: socketEvent.title || `${type === 'delivery' ? 'Delivery' : 'Collection'}: ${socketEvent.customerName}`,
      start: socketEvent.date || socketEvent.deliveryDate || socketEvent.collectionDate,
      extendedProps: {
        type: type || socketEvent.type,
        orderId: socketEvent.orderId,
        customer: socketEvent.customerName || socketEvent.customer,
        status: socketEvent.status || 'scheduled',
        address: socketEvent.address,
        items: socketEvent.items,
        notes: socketEvent.notes
      }
    };
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    emit,
    connected: socketRef.current?.connected || false,
    disconnect,
    reconnect: connect
  };
};

export default useCalendarSocket;