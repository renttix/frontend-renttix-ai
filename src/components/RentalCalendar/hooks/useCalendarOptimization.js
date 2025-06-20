"use client";

import { useMemo, useCallback, useRef, useEffect } from "react";

// Simple debounce implementation
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Simple throttle implementation
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const useCalendarOptimization = () => {
  const renderCountRef = useRef(0);
  const performanceMetricsRef = useRef({
    lastRenderTime: 0,
    averageRenderTime: 0,
    totalRenders: 0
  });

  // Track render performance
  useEffect(() => {
    renderCountRef.current++;
    const currentTime = performance.now();
    const metrics = performanceMetricsRef.current;
    
    if (metrics.lastRenderTime) {
      const renderTime = currentTime - metrics.lastRenderTime;
      metrics.averageRenderTime = 
        (metrics.averageRenderTime * metrics.totalRenders + renderTime) / 
        (metrics.totalRenders + 1);
      metrics.totalRenders++;
      
      // Log performance warning if render takes too long
      if (renderTime > 16.67) { // 60fps threshold
        console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    metrics.lastRenderTime = currentTime;
  });

  // Memoized event processor
  const processEvents = useMemo(() => {
    return (events) => {
      const dayData = {};
      const eventMap = new Map();
      
      events.forEach(event => {
        const dateKey = event.start.split('T')[0];
        
        if (!dayData[dateKey]) {
          dayData[dateKey] = {
            deliveries: 0,
            collections: 0,
            maintenance: 0,
            events: [],
            hasOverdue: false,
            totalValue: 0
          };
        }
        
        const type = event.extendedProps.type;
        const status = event.extendedProps.status;
        
        if (type === 'delivery') {
          dayData[dateKey].deliveries++;
        } else if (type === 'return') {
          dayData[dateKey].collections++;
        } else if (type === 'maintenance' || type === 'maintenance-route') {
          // For maintenance routes, count as 1 route regardless of jobs inside
          dayData[dateKey].maintenance++;
        }
        
        if (status === 'overdue') {
          dayData[dateKey].hasOverdue = true;
        }
        
        dayData[dateKey].events.push(event);
        eventMap.set(event.id, event);
      });
      
      return { dayData, eventMap };
    };
  }, []);

  // Debounced filter handler
  const createDebouncedFilter = useCallback((callback, delay = 300) => {
    return debounce(callback, delay);
  }, []);

  // Throttled scroll handler for infinite scroll
  const createThrottledScroll = useCallback((callback, delay = 100) => {
    return throttle(callback, delay);
  }, []);

  // Optimized event update handler
  const createOptimizedEventUpdater = useCallback((updateEvents) => {
    return (update) => {
      updateEvents(prevEvents => {
        switch (update.type) {
          case 'delivery:created':
          case 'collection:created':
            // Use Set to prevent duplicates
            const eventIds = new Set(prevEvents.map(e => e.id));
            if (!eventIds.has(update.event.id)) {
              return [...prevEvents, update.event];
            }
            return prevEvents;
            
          case 'event:updated':
            // Use map for efficient updates
            return prevEvents.map(event => 
              event.id === update.event.id ? update.event : event
            );
            
          case 'event:cancelled':
            // Use filter for removals
            return prevEvents.filter(event => event.id !== update.eventId);
            
          case 'batch:update':
            // Replace all events for batch updates
            return update.events;
            
          default:
            return prevEvents;
        }
      });
    };
  }, []);

  // Virtual scrolling helper for large datasets
  const createVirtualScroller = useCallback((items, itemHeight, containerHeight) => {
    const totalHeight = items.length * itemHeight;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const bufferCount = 5; // Items to render outside visible area
    
    return (scrollTop) => {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferCount);
      const endIndex = Math.min(
        items.length, 
        startIndex + visibleCount + (bufferCount * 2)
      );
      
      return {
        visibleItems: items.slice(startIndex, endIndex),
        offsetY: startIndex * itemHeight,
        totalHeight
      };
    };
  }, []);

  // Lazy loading helper
  const createLazyLoader = useCallback((loadMore, threshold = 0.8) => {
    return (scrollElement) => {
      if (!scrollElement) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      if (scrollPercentage > threshold) {
        loadMore();
      }
    };
  }, []);

  // Image optimization helper
  const optimizeImageUrl = useCallback((url, width = 200) => {
    if (!url) return '';
    
    // Add image optimization parameters
    const optimizedUrl = new URL(url);
    optimizedUrl.searchParams.set('w', width);
    optimizedUrl.searchParams.set('q', '75'); // 75% quality
    optimizedUrl.searchParams.set('fm', 'webp'); // WebP format
    
    return optimizedUrl.toString();
  }, []);

  // Cache management
  const createCache = useCallback((maxSize = 100) => {
    const cache = new Map();
    const accessOrder = [];
    
    return {
      get: (key) => {
        const value = cache.get(key);
        if (value !== undefined) {
          // Move to end (most recently used)
          const index = accessOrder.indexOf(key);
          if (index > -1) {
            accessOrder.splice(index, 1);
          }
          accessOrder.push(key);
        }
        return value;
      },
      
      set: (key, value) => {
        // Remove oldest if at capacity
        if (cache.size >= maxSize && !cache.has(key)) {
          const oldest = accessOrder.shift();
          cache.delete(oldest);
        }
        
        cache.set(key, value);
        accessOrder.push(key);
      },
      
      clear: () => {
        cache.clear();
        accessOrder.length = 0;
      }
    };
  }, []);

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    return {
      renderCount: renderCountRef.current,
      ...performanceMetricsRef.current
    };
  }, []);

  return {
    processEvents,
    createDebouncedFilter,
    createThrottledScroll,
    createOptimizedEventUpdater,
    createVirtualScroller,
    createLazyLoader,
    optimizeImageUrl,
    createCache,
    getPerformanceMetrics
  };
};

export default useCalendarOptimization;