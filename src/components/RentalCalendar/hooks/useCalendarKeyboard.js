"use client";

import { useEffect, useCallback, useRef } from "react";

const useCalendarKeyboard = ({
  onCreateRental,
  onViewDetails,
  onCheckAvailability,
  onRefresh,
  onToggleView,
  onNavigateMonth,
  calendarRef
}) => {
  const activeElementRef = useRef(null);
  const shortcutsEnabledRef = useRef(true);

  // Check if user is typing in an input
  const isTyping = useCallback(() => {
    const activeElement = document.activeElement;
    const isInput = activeElement.tagName === 'INPUT' || 
                   activeElement.tagName === 'TEXTAREA' ||
                   activeElement.contentEditable === 'true';
    return isInput;
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event) => {
    if (!shortcutsEnabledRef.current || isTyping()) return;

    const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
    const modKey = ctrlKey || metaKey; // Ctrl on Windows/Linux, Cmd on Mac

    // Prevent default for handled shortcuts
    const preventDefault = () => {
      event.preventDefault();
      event.stopPropagation();
    };

    // Global shortcuts
    switch (true) {
      // Create new rental (Ctrl/Cmd + N)
      case modKey && key === 'n':
        preventDefault();
        onCreateRental?.();
        break;

      // View day details (Ctrl/Cmd + D)
      case modKey && key === 'd':
        preventDefault();
        onViewDetails?.();
        break;

      // Check availability (Ctrl/Cmd + A)
      case modKey && key === 'a' && !shiftKey:
        preventDefault();
        onCheckAvailability?.();
        break;

      // Refresh calendar (Ctrl/Cmd + R or F5)
      case (modKey && key === 'r') || key === 'F5':
        preventDefault();
        onRefresh?.();
        break;

      // Toggle view (Ctrl/Cmd + V)
      case modKey && key === 'v':
        preventDefault();
        onToggleView?.();
        break;

      // Navigate months (Arrow keys with Alt)
      case altKey && key === 'ArrowLeft':
        preventDefault();
        onNavigateMonth?.('prev');
        break;

      case altKey && key === 'ArrowRight':
        preventDefault();
        onNavigateMonth?.('next');
        break;

      // Today (Ctrl/Cmd + T or Home)
      case (modKey && key === 't') || key === 'Home':
        preventDefault();
        onNavigateMonth?.('today');
        break;

      // Help (? or Ctrl/Cmd + /)
      case key === '?' || (modKey && key === '/'):
        preventDefault();
        showKeyboardHelp();
        break;

      // Escape - close modals/menus
      case key === 'Escape':
        // Let modals handle their own escape
        break;

      // Calendar navigation with arrow keys
      case ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key) && !modKey && !altKey:
        handleCalendarNavigation(key);
        break;

      // Enter - open selected date
      case key === 'Enter':
        handleEnterKey();
        break;

      // Space - quick add on selected date
      case key === ' ':
        preventDefault();
        handleSpaceKey();
        break;
    }
  }, [onCreateRental, onViewDetails, onCheckAvailability, onRefresh, onToggleView, onNavigateMonth, isTyping]);

  // Handle calendar cell navigation
  const handleCalendarNavigation = useCallback((key) => {
    const calendarApi = calendarRef?.current?.getApi();
    if (!calendarApi) return;

    // Get current selected date or today
    const currentDate = activeElementRef.current || new Date();
    let newDate = new Date(currentDate);

    switch (key) {
      case 'ArrowUp':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'ArrowDown':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'ArrowLeft':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'ArrowRight':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }

    activeElementRef.current = newDate;
    // Focus on the new date cell
    focusDateCell(newDate);
  }, [calendarRef]);

  // Focus on a specific date cell
  const focusDateCell = useCallback((date) => {
    const dateStr = date.toISOString().split('T')[0];
    const cell = document.querySelector(`[data-date="${dateStr}"]`);
    if (cell) {
      cell.focus();
      cell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  // Handle Enter key on selected date
  const handleEnterKey = useCallback(() => {
    if (activeElementRef.current) {
      onViewDetails?.(activeElementRef.current);
    }
  }, [onViewDetails]);

  // Handle Space key on selected date
  const handleSpaceKey = useCallback(() => {
    if (activeElementRef.current) {
      onCreateRental?.(activeElementRef.current);
    }
  }, [onCreateRental]);

  // Show keyboard shortcuts help
  const showKeyboardHelp = useCallback(() => {
    const shortcuts = [
      { keys: 'Ctrl/Cmd + N', description: 'Create new rental' },
      { keys: 'Ctrl/Cmd + D', description: 'View day details' },
      { keys: 'Ctrl/Cmd + A', description: 'Check availability' },
      { keys: 'Ctrl/Cmd + R', description: 'Refresh calendar' },
      { keys: 'Ctrl/Cmd + V', description: 'Toggle view' },
      { keys: 'Alt + ←/→', description: 'Previous/Next month' },
      { keys: 'Ctrl/Cmd + T', description: 'Go to today' },
      { keys: 'Arrow Keys', description: 'Navigate dates' },
      { keys: 'Enter', description: 'Open selected date' },
      { keys: 'Space', description: 'Quick add on date' },
      { keys: 'Escape', description: 'Close modals' },
      { keys: '?', description: 'Show this help' }
    ];

    // Create and show help modal
    const helpContent = shortcuts.map(s => 
      `<div class="flex justify-between py-2">
        <kbd class="px-2 py-1 bg-gray-200 rounded text-sm font-mono">${s.keys}</kbd>
        <span>${s.description}</span>
      </div>`
    ).join('');

    // You can replace this with a proper modal component
    alert('Keyboard Shortcuts:\n\n' + 
      shortcuts.map(s => `${s.keys} - ${s.description}`).join('\n'));
  }, []);

  // Enable/disable shortcuts
  const setShortcutsEnabled = useCallback((enabled) => {
    shortcutsEnabledRef.current = enabled;
  }, []);

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Add ARIA labels to calendar
  useEffect(() => {
    const addAriaLabels = () => {
      // Add role and label to calendar
      const calendar = document.querySelector('.fc');
      if (calendar) {
        calendar.setAttribute('role', 'application');
        calendar.setAttribute('aria-label', 'Rental calendar. Use arrow keys to navigate dates.');
      }

      // Add labels to day cells
      const dayCells = document.querySelectorAll('.fc-daygrid-day');
      dayCells.forEach(cell => {
        const date = cell.getAttribute('data-date');
        if (date) {
          const dateObj = new Date(date);
          const label = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          cell.setAttribute('aria-label', label);
          cell.setAttribute('tabindex', '0');
        }
      });
    };

    // Run after calendar renders
    setTimeout(addAriaLabels, 100);
    
    // Re-run when calendar updates
    const observer = new MutationObserver(addAriaLabels);
    const calendarEl = document.querySelector('.fc');
    if (calendarEl) {
      observer.observe(calendarEl, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  return {
    setShortcutsEnabled,
    showKeyboardHelp,
    focusDateCell
  };
};

export default useCalendarKeyboard;