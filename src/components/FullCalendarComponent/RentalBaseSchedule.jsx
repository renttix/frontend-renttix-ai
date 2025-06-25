

// This tells Next.js that this component needs to run in the browser (client-side)
// because it uses interactive features like drag & drop
"use client";

// STEP 1: IMPORTING TOOLS AND LIBRARIES
// Think of imports like getting tools from a toolbox before building something

// React is like the main building blocks for creating interactive websites
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

// date-fns is like a calendar helper - it helps us work with dates easily
// Instead of doing complex math with dates, we use these pre-made functions
import {
  format,        // Changes how dates look (like "Jan 15, 2025")
  addDays,       // Adds days to a date (like "today + 5 days")
  addMonths,     // Adds months to a date
  subMonths,     // Subtracts months from a date
  startOfMonth,  // Gets the first day of a month
  endOfMonth,    // Gets the last day of a month
  eachDayOfInterval, // Gets all days between two dates
  getDay,        // Gets what day of the week it is (0=Sunday, 1=Monday, etc.)
  startOfWeek,   // Gets the first day of a week
  endOfWeek,     // Gets the last day of a week
  isToday,       // Checks if a date is today
  isSameDay,     // Checks if two dates are the same day
  addWeeks,      // Adds weeks to a date
  subWeeks,      // Subtracts weeks from a date
} from "date-fns";

// react-dnd helps us create drag and drop functionality
// Like being able to drag items around on the screen with your mouse
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// clsx helps us combine CSS classes conditionally
// Like saying "if it's a weekend, make it blue, otherwise make it white"
import clsx from "clsx";

// PrimeReact components are pre-built UI pieces (like LEGO blocks for websites)
import { Tag } from "primereact/tag";           // Shows labels/badges
import { Dropdown } from "primereact/dropdown"; // Shows dropdown menus
import { Dialog } from "primereact/dialog";     // Shows popup windows
import { InputText } from "primereact/inputtext"; // Text input boxes
import { Button } from "primereact/button";     // Clickable buttons
import { Calendar } from "primereact/calendar"; // Date picker
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog"; // "Are you sure?" popups
import { Menu } from "primereact/menu";         // Right-click menus
import { Toast } from "primereact/toast";       // Notification messages

// STEP 2: SETTING UP CONSTANTS
// Constants are like rules or settings that never change during the program
// Think of them like the rules of a board game - they stay the same

// These are the different ways we can look at the calendar
// Like choosing between daily view, weekly view, or monthly view on your phone's calendar
const VIEW_TYPES = {
  DAY: "day",      // Shows just one day at a time
  WEEK: "week",    // Shows a whole week (7 days)
  MONTH: "month",  // Shows a whole month (about 30 days)
};

// These help us filter what kind of equipment we want to see
// Like filtering your music by genre (rock, pop, etc.)
const FILTER_TYPES = {
  ALL: "all",                // Show everything
  AVAILABLE: "available",    // Show only equipment that's free to rent
  ON_HIRE: "on_hire",       // Show only equipment that's currently rented out
};

// These are all the different types of equipment the company rents out
// Think of it like different categories in a rental store
const PRODUCT_TYPES = {
  PORTABLE_TOILET: "Portable Toilet",   // Regular portable bathrooms
  DISABLED_TOILET: "Disabled Toilet",   // Accessible bathrooms for wheelchairs
  SHOWER: "Shower",                     // Portable showers
  GROUNDHOG: "Groundhog",              // Special construction equipment
  STORE_10FT: "10ft Store",            // Small storage containers
  OFFICE_20FT: "20ft Office",          // Mobile office trailers
};

// Different quality levels for toilets (like economy vs first class on a plane)
const TOILET_CATEGORIES = {
  STANDARD: "Standard",           // Basic model
  HOT_WASH: "Hot Wash",          // Has hot water for washing hands
  DISABLED_ACCESS: "Disabled Access", // Wheelchair accessible
  LUXURY: "Luxury",              // Fancy version with extra features
};

// This is like a detailed specification sheet for each type of equipment
// Think of it like a Pokemon card that tells you everything about each Pokemon
const PRODUCT_CONFIGS = {
  // Configuration for Portable Toilets
  [PRODUCT_TYPES.PORTABLE_TOILET]: {
    count: 150,        // How many we have in total (like having 150 Pokemon cards)
    prefix: "PT",      // Short code used in names (PT-0001, PT-0002, etc.)
    categories: Object.values(TOILET_CATEGORIES), // All the different types available
    color: "bg-blue-500",        // Main color for this equipment type
    lightColor: "bg-blue-50",    // Lighter version of the color
    borderColor: "border-blue-200", // Color for borders/outlines
    textColor: "text-blue-700",     // Color for text
    ringColor: "ring-blue-500",     // Color for focus rings
    gradient: "from-blue-500 to-blue-600", // Gradient colors for fancy effects
  },
  
  // Configuration for Disabled Access Toilets
  [PRODUCT_TYPES.DISABLED_TOILET]: {
    count: 50,         // We have 50 of these (fewer because they're specialized)
    prefix: "DT",      // These get names like DT-0001, DT-0002, etc.
    categories: ["Standard", "Premium"], // Only 2 types available
    color: "bg-emerald-500",     // Green color (emerald is a green gem)
    lightColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    ringColor: "ring-emerald-500",
    gradient: "from-emerald-500 to-emerald-600",
  },
  
  // Configuration for Portable Showers
  [PRODUCT_TYPES.SHOWER]: {
    count: 40,         // 40 shower units available
    prefix: "SH",      // Names like SH-0001, SH-0002, etc.
    categories: ["Basic", "Premium", "Luxury"], // 3 different quality levels
    color: "bg-cyan-500",        // Cyan is a blue-green color (like water!)
    lightColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    textColor: "text-cyan-700",
    ringColor: "ring-cyan-500",
    gradient: "from-cyan-500 to-cyan-600",
  },
  
  // Configuration for Groundhogs (special construction equipment)
  [PRODUCT_TYPES.GROUNDHOG]: {
    count: 15,         // Only 15 because they're expensive/specialized
    prefix: "GH",      // Names like GH-0001, GH-0002, etc.
    categories: ["Standard", "Heavy Duty"], // 2 types: normal and extra strong
    color: "bg-amber-500",       // Amber is yellow-orange (like construction colors!)
    lightColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    ringColor: "ring-amber-500",
    gradient: "from-amber-500 to-amber-600",
  },
  
  // Configuration for 10ft Storage Containers
  [PRODUCT_TYPES.STORE_10FT]: {
    count: 4,          // Only 4 available (probably expensive/large)
    prefix: "S10",     // Names like S10-0001, S10-0002, etc.
    categories: ["Storage"], // Only one type - just for storage
    color: "bg-purple-500",      // Purple color
    lightColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    ringColor: "ring-purple-500",
    gradient: "from-purple-500 to-purple-600",
  },
  
  // Configuration for 20ft Office Trailers
  [PRODUCT_TYPES.OFFICE_20FT]: {
    count: 25,         // 25 mobile offices available
    prefix: "O20",     // Names like O20-0001, O20-0002, etc.
    categories: ["Basic", "Executive"], // 2 types: simple and fancy
    color: "bg-rose-500",        // Rose is a pinkish-red color
    lightColor: "bg-rose-50",
    borderColor: "border-rose-200",
    textColor: "text-rose-700",
    ringColor: "ring-rose-500",
    gradient: "from-rose-500 to-rose-600",
  },
};

// Different reasons why someone might rent our equipment
// Like different categories of movies (action, comedy, drama, etc.)
const BOOKING_TYPES = {
  CONSTRUCTION: "construction",  // Building sites, road work, etc.
  EVENT: "event",               // Festivals, concerts, outdoor parties
  EMERGENCY: "emergency",       // Urgent situations (broken pipes, disasters)
  MAINTENANCE: "maintenance",   // Regular upkeep and repairs
};

// Colors for different booking types - like having different colored folders
// Each booking type gets its own visual style so you can quickly tell them apart
const BOOKING_COLORS = {
  // Construction bookings are blue (like blueprints and hard hats)
  construction: "bg-gradient-to-r from-primary-500 to-primary-600 border-primary-600 shadow-glow",
  
  // Event bookings are green (like "go" or "success" - fun events!)
  event: "bg-gradient-to-r from-success-500 to-success-600 border-success-600 shadow-glow-success",
  
  // Emergency bookings are orange/red (like warning lights or stop signs)
  emergency: "bg-gradient-to-r from-orange-500 to-orange-600 border-orange-600 shadow-glow-orange",
  
  // Maintenance bookings are yellow (like caution signs)
  maintenance: "bg-gradient-to-r from-warning-500 to-warning-600 border-warning-600 shadow-glow-warning",
};

// Simple color codes for equipment status (available vs busy)
// Like traffic lights: green = go, red = stop
const STATUS_COLORS = {
  available: "success",  // Green color for "ready to rent"
  on_hire: "error",     // Red color for "currently rented out"
};

// Styles for the little badges that show equipment status
// Like having different colored stickers to mark things
const STATUS_BADGE_STYLES = {
  available: "badge-success",  // Green badge style
  on_hire: "badge-error",     // Red badge style
};

// Types of things we can drag and drop around the calendar
// Like defining what pieces you can move in a board game
const ITEM_TYPES = {
  BOOKING: "booking",  // You can drag booking appointments around
  TOILET: "toilet",    // You can drag equipment rows to reorder them
};

/**
 * STEP 3: CREATING FAKE DATA FOR TESTING
 *
 * This function creates pretend equipment data for our calendar
 * Think of it like creating fake Pokemon cards to test a Pokemon game
 * In a real app, this data would come from a database
 */
const generateMockAssets = () => {
  // Create an empty list to store all our equipment
  const assets = [];
  
  // Go through each type of equipment (toilets, showers, etc.)
  Object.entries(PRODUCT_TYPES).forEach(([key, productType]) => {
    // Get the configuration for this equipment type
    const config = PRODUCT_CONFIGS[productType];
    
    // First, create a "header" row for this equipment type
    // Like a folder name that groups all the items of this type
    assets.push({
      id: `header-${key}`,        // Unique identifier (like a barcode)
      type: 'product-header',     // This is a group header, not individual equipment
      productType,                // What type of equipment this is
      name: productType,          // Display name
      count: config.count,        // How many items we have
      color: config.color,        // What color to show this group
      isExpanded: true,           // Start with the group opened (not collapsed)
      assets: []                  // List of equipment in this group (empty for now)
    });
    
    // Now create individual pieces of equipment for this type
    // Like creating individual Pokemon cards for each Pokemon type
    for (let i = 1; i <= config.count; i++) {
      // Create a unique ID number for this piece of equipment
      // padStart(4, "0") makes sure we get PT-0001 instead of PT-1
      const assetNumber = `${config.prefix}-${i.toString().padStart(4, "0")}`;
      
      // Randomly decide if this equipment is available or being rented
      // Math.random() gives us a number between 0 and 1
      // > 0.3 means 70% chance of being available (0.3 to 1.0)
      const isAvailable = Math.random() > 0.3;
      
      // Pick a random category for this equipment
      // Math.floor rounds down, so we get a whole number for the array index
      const category = config.categories[Math.floor(Math.random() * config.categories.length)];
      
      // Create the equipment object with all its properties
      const asset = {
        id: assetNumber,           // Unique ID like "PT-0001"
        type: 'asset',             // This is an individual piece of equipment
        productType,               // What type it is (toilet, shower, etc.)
        assetNumber,               // The ID number
        name: `${productType} ${assetNumber}`, // Full name like "Portable Toilet PT-0001"
        status: isAvailable ? "available" : "on_hire", // Is it free or rented?
        category,                  // What quality level (Standard, Luxury, etc.)
        capacity: category.includes('Luxury') || category.includes('Executive') ? 2 : 1, // How many people can use it
        location: isAvailable ? "Depot" : `Site ${Math.floor(Math.random() * 20) + 1}`, // Where it is
        parentHeader: `header-${key}` // Which group header this belongs to
      };

      // If the equipment is currently rented out, add rental information
      if (!isAvailable) {
        const today = new Date();
        
        // Pick random start date (could be up to 15 days ago or 15 days in future)
        const hireStartDays = Math.floor(Math.random() * 30) - 15;
        
        // Pick random rental duration (7 to 28 days)
        const hireDurationDays = Math.floor(Math.random() * 21) + 7;
        
        // Calculate the actual dates
        const onHireDate = addDays(today, hireStartDays);
        const offHireDate = addDays(onHireDate, hireDurationDays);
        
        // Add rental information to the equipment
        asset.onHireDate = format(onHireDate, "yyyy-MM-dd");
        asset.offHireDate = format(offHireDate, "yyyy-MM-dd");
        asset.rentalDetails = {
          customer: `Customer ${Math.floor(Math.random() * 100) + 1}`, // Random customer name
          currentLocation: asset.location // Where the customer is using it
        };
      }
      
      // Add this piece of equipment to our list
      assets.push(asset);
    }
  });
  
  // Return the complete list of all equipment
  return assets;
};

/**
 * STEP 4: CREATING FAKE BOOKING DATA
 *
 * This function creates pretend rental appointments for our calendar
 * Think of it like creating fake appointments in a doctor's appointment book
 * Each booking represents someone renting a piece of equipment for specific dates
 */
const generateMockBookings = (assets) => {
  // Create an empty list to store all the rental appointments
  const bookings = [];
  const today = new Date();
  
  // Get all the possible reasons for renting (construction, event, etc.)
  const bookingTypes = Object.keys(BOOKING_TYPES);
  
  // Look through all our equipment and create bookings for the ones that are rented out
  // We only want actual equipment (not the group headers)
  assets
    .filter(asset => asset.type === 'asset' && (asset.status === "on_hire" || asset.status === "Live"))
    .forEach((asset, index) => {
      // Pick a random reason why this equipment is rented
      const bookingType = bookingTypes[Math.floor(Math.random() * bookingTypes.length)];
      
      // Figure out the start and end dates for this rental
      let startDate, endDate;
      
      // If we already know when this equipment is rented, use those dates
      if (asset.onHireDate && asset.offHireDate) {
        startDate = new Date(asset.onHireDate);
        endDate = new Date(asset.offHireDate);
      } else {
        // Otherwise, make up some random dates
        // This creates dates anywhere from 30 days ago to 30 days from now
        startDate = addDays(today, Math.floor(Math.random() * 60) - 30);
        
        // Make the rental last 1 to 14 days
        const duration = Math.floor(Math.random() * 14) + 1;
        endDate = addDays(startDate, duration);
      }
      
      // Create a booking object with all the rental information
      bookings.push({
        id: `booking-${asset.id}-${index}`,  // Unique ID for this booking
        title: `${BOOKING_TYPES[bookingType]} Hire`, // What it's for (like "Construction Hire")
        assetId: asset.id,                   // Which piece of equipment this is for
        start: format(startDate, "yyyy-MM-dd"), // When the rental starts
        end: format(endDate, "yyyy-MM-dd"),     // When the rental ends
        type: bookingType,                   // What category of rental this is
        customer: asset.rentalDetails?.customer || `Customer ${Math.floor(Math.random() * 100) + 1}`, // Who rented it
        location: asset.rentalDetails?.currentLocation || asset.location, // Where they're using it
        productType: asset.productType,      // What type of equipment it is
      });
    });
    
  // Return the complete list of all rental appointments
  return bookings;
};

/**
 * STEP 5: HELPER FUNCTIONS FOR WORKING WITH DATES
 *
 * This function figures out what dates to show on the calendar
 * Like deciding if you want to see just today, this week, or this whole month
 */
const generateTimelineDates = (currentDate, viewType) => {
  // Use a switch statement (like a fancy if/else) to handle different view types
  switch (viewType) {
    case VIEW_TYPES.DAY:
      // For day view, just return today (like looking at one page of a calendar)
      return [currentDate];
      
    case VIEW_TYPES.WEEK:
      // For week view, get all 7 days of the current week
      return eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 1 }), // Start on Monday
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),     // End on Sunday
      });
      
    case VIEW_TYPES.MONTH:
    default:
      // For month view, get all days in the current month
      // 'default' means "if none of the above cases match, do this"
      return eachDayOfInterval({
        start: startOfMonth(currentDate), // First day of the month
        end: endOfMonth(currentDate),     // Last day of the month
      });
  }
};

/**
 * HELPER FUNCTION: CHECK IF A BOOKING IS VISIBLE
 *
 * This function checks if a rental appointment should be shown on the current calendar view
 * Like checking if an event happens during the week you're looking at
 */
const isBookingInDateRange = (booking, dates) => {
  // Convert the booking dates to Date objects for easier comparison
  const bookingStart = new Date(booking.start);
  const bookingEnd = new Date(booking.end);
  
  // Get the first and last dates we're currently viewing
  const rangeStart = dates[0];
  const rangeEnd = dates[dates.length - 1];
  
  // Check if the booking overlaps with what we're viewing
  // This uses OR logic (||) - if ANY of these conditions is true, show the booking
  return (
    // Booking starts before our view and ends during our view
    (bookingStart <= rangeEnd && bookingEnd >= rangeStart) ||
    // Booking starts during our view
    (bookingStart >= rangeStart && bookingStart <= rangeEnd) ||
    // Booking ends during our view
    (bookingEnd >= rangeStart && bookingEnd <= rangeEnd)
  );
};

/**
 * HELPER FUNCTION: CHECK IF EQUIPMENT IS RENTED ON A SPECIFIC DATE
 *
 * This function checks if a piece of equipment is being used by a customer on a particular day
 * Like checking if a library book is checked out on a specific date
 */
const isAssetOnHireOnDate = (asset, date) => {
  // First, check if the equipment's status says it's rented out
  // We check for both "on_hire" and "Live" because different parts of the code might use different terms
  const isOnHire = asset.status === "on_hire" || asset.status === "Live";
  
  // If it's not marked as rented, or if we don't have rental dates, it's not rented
  if (!isOnHire || !asset.onHireDate || !asset.offHireDate) {
    return false;
  }
  
  // Convert all dates to Date objects so we can compare them
  const checkDate = new Date(date);      // The date we're checking
  const hireStart = new Date(asset.onHireDate); // When the rental started
  const hireEnd = new Date(asset.offHireDate);   // When the rental ends
  
  // Remove the time part (hours, minutes, seconds) so we only compare dates
  // This prevents problems like "is 2:30 PM on January 15th the same as 8:00 AM on January 15th?"
  checkDate.setHours(0, 0, 0, 0);
  hireStart.setHours(0, 0, 0, 0);
  hireEnd.setHours(0, 0, 0, 0);
  
  // Check if the date we're asking about falls between the rental start and end dates
  // Like asking "is January 15th between January 10th and January 20th?"
  return checkDate >= hireStart && checkDate <= hireEnd;
};

/**
 * HELPER FUNCTION: CHECK IF EQUIPMENT IS AVAILABLE ON A SPECIFIC DATE
 *
 * This function checks if a piece of equipment is free to rent on a particular day
 * Like checking if a library book is available to check out
 */
const isAssetAvailableOnDate = (asset, date) => {
  // If the equipment's status is "available", it's always free to rent
  // We check for both "available" and "Available" because of possible inconsistencies in data
  if (asset.status === "available" || asset.status === "Available") {
    return true;
  }
  
  // If it's marked as rented out, we need to check if it's actually rented on this specific date
  // Sometimes equipment might be marked as "on hire" but the rental period doesn't cover this date
  // Like a book that's generally checked out, but today is before or after the checkout period
  return !isAssetOnHireOnDate(asset, date);
};

/**
 * HELPER FUNCTION: COUNT EQUIPMENT FOR A SPECIFIC DATE AND FILTER
 *
 * This function counts how many pieces of equipment meet certain criteria on a specific date
 * Like counting how many bikes are available to rent on Saturday
 */
const getAssetCountForDateAndFilter = (assets, date, statusFilter) => {
  // First, get only the actual equipment (not the group headers)
  const actualAssets = assets.filter(item => item.type === 'asset');
  
  // Now count based on what type of filter we want
  if (statusFilter === "all") {
    // Count everything: equipment that's available + equipment that's rented on this date
    return actualAssets.filter(asset =>
      (asset.status === "available" || asset.status === "Available") || isAssetOnHireOnDate(asset, date)
    ).length;
  } else if (statusFilter === "available") {
    // Count only equipment that's free to rent on this date
    return actualAssets.filter(asset => isAssetAvailableOnDate(asset, date)).length;
  } else if (statusFilter === "on_hire") {
    // Count only equipment that's currently rented out on this date
    return actualAssets.filter(asset => isAssetOnHireOnDate(asset, date)).length;
  }
  
  // If none of the above filters match, return 0
  return 0;
};

/**
 * HELPER FUNCTION: CHECK IF A DATE IS IN THE FUTURE
 *
 * This function checks if a date is after today
 * Like asking "is Christmas in the future?" (if today is before December 25th)
 */
const isFutureDate = (date) => {
  const today = new Date();        // Get today's date
  const checkDate = new Date(date); // Convert the date we're checking
  
  // Remove the time part so we only compare dates, not specific times
  // This way "January 15th at 2 PM" is the same as "January 15th at 8 AM"
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  // Return true if the check date is after today
  return checkDate > today;
};

/**
 * HELPER FUNCTION: GET RENTAL PERIOD INFORMATION
 *
 * This function checks where a specific date falls within a rental period
 * Like asking "is today the first day, middle day, or last day of someone's vacation?"
 */
const getHirePeriodForAsset = (asset, date) => {
  // If the equipment isn't rented or we don't have rental dates, return nothing
  if (asset.status !== "on_hire" || !asset.onHireDate || !asset.offHireDate) {
    return null;
  }

  // Convert dates so we can work with them
  const checkDate = new Date(date);
  const hireStartDate = new Date(asset.onHireDate);
  const hireEndDate = new Date(asset.offHireDate);

  // If the date we're checking is outside the rental period, return nothing
  if (checkDate < hireStartDate || checkDate > hireEndDate) {
    return null;
  }

  // Figure out what part of the rental period this date represents
  const isStart = isSameDay(checkDate, hireStartDate);   // Is this the first day?
  const isEnd = isSameDay(checkDate, hireEndDate);       // Is this the last day?
  const isMiddle = !isStart && !isEnd;                   // Is this somewhere in between?

  // Return information about this rental period
  return {
    isStart,   // True if this is the start date
    isEnd,     // True if this is the end date
    isMiddle,  // True if this is a middle date
    details: asset.rentalDetails // Information about who rented it and where
  };
};

/**
 * STEP 6: REACT COMPONENTS
 *
 * Now we start building the actual pieces that users see and interact with
 * Think of components like LEGO blocks - small pieces that combine to make something big
 *
 * CONTEXT MENU COMPONENT
 * This creates a right-click menu (like when you right-click on your desktop)
 */
const ContextMenu = ({ visible, x, y, items, onHide }) => {
  // useRef is like putting a sticky note on something so you can find it later
  // We use it to reference the menu element in the HTML
  const menuRef = React.useRef(null);
  
  // useState is like a variable that can change and tells React to update the screen when it does
  // This tracks where to position the menu so it doesn't go off the screen
  const [adjustedPosition, setAdjustedPosition] = React.useState({ x, y });

  // useEffect is like setting up rules that happen automatically when things change
  // This one makes sure the menu doesn't go off the edge of the screen
  React.useEffect(() => {
    // Only run this if the menu is visible and we can access the menu element
    if (visible && menuRef.current) {
      // getBoundingClientRect() tells us the size and position of the menu
      const menuRect = menuRef.current.getBoundingClientRect();
      // Get the size of the browser window
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Start with the original position where the user right-clicked
      let adjustedX = x;
      let adjustedY = y;
      
      // If the menu would go off the right edge of the screen, move it left
      if (x + menuRect.width > viewportWidth) {
        adjustedX = viewportWidth - menuRect.width - 10; // 10px padding from edge
      }
      
      // If the menu would go off the bottom edge of the screen, move it up
      if (y + menuRect.height > viewportHeight) {
        adjustedY = viewportHeight - menuRect.height - 10; // 10px padding from edge
      }
      
      // Update the position if we had to move it
      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    }
  }, [visible, x, y]); // Run this whenever the menu visibility or position changes

  // This useEffect handles keyboard shortcuts and clicking outside the menu
  React.useEffect(() => {
    // If the menu isn't visible, don't set up any listeners
    if (!visible) return;

    // Function to handle when someone presses a key
    const handleKeyDown = (e) => {
      // If they press the Escape key, close the menu
      if (e.key === 'Escape') {
        onHide();
      }
    };

    // Function to handle when someone clicks somewhere
    const handleClickOutside = (e) => {
      // If they clicked outside the menu, close it
      // menuRef.current.contains(e.target) checks if the click was inside the menu
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onHide();
      }
    };

    // Set up the event listeners (like setting up security cameras)
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup function - this runs when the component unmounts or dependencies change
    // It's like turning off the security cameras when you don't need them anymore
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onHide]); // Run this when visibility or the onHide function changes

  // If the menu isn't visible, don't show anything
  if (!visible) return null;

  // JSX is like HTML but with superpowers - it lets us mix HTML with JavaScript
  return (
    <>
      {/* This is an invisible backdrop that catches clicks outside the menu */}
      {/* It's like an invisible shield that detects when you click away from the menu */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ backgroundColor: 'transparent' }}
      />
      
      {/* This is the actual visible menu */}
      <div
        ref={menuRef}  // This connects our menuRef to this div element
        className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-[9999] min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          // Position the menu where the user right-clicked (after our adjustments)
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
        }}
        role="menu"  // Tells screen readers this is a menu
        aria-orientation="vertical"  // Tells screen readers the menu items are stacked vertically
      >
        {/* Loop through each menu item and create buttons for them */}
        {/* .map() is like going through a list and doing something with each item */}
        {items.map((item, index) => {
          // If this item is just a separator line (like a divider), show a line
          if (item.separator) {
            return (
              <div
                key={`separator-${index}`}  // React needs a unique "key" for each item in a list
                className="border-t border-gray-200 dark:border-gray-600 my-1"
                role="separator"
              />
            );
          }

          // Otherwise, create a clickable button for this menu item
          return (
            <button
              key={item.label}  // Use the item's label as the unique key
              onClick={(e) => {
                // When someone clicks this button:
                e.preventDefault();    // Don't do the default button behavior
                e.stopPropagation();  // Don't let this click bubble up to other elements
                onHide();             // Close the menu
                item.command();       // Run the function associated with this menu item
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
              role="menuitem"         // Tell screen readers this is a menu item
              disabled={item.disabled} // Make the button unclickable if it's disabled
            >
              {/* If this menu item has an icon, show it */}
              {item.icon && (
                <span className="mr-3 text-gray-500 dark:text-gray-400">
                  {item.icon}
                </span>
              )}
              
              {/* Show the text label for this menu item */}
              <span className="flex-1 text-left">{item.label}</span>
              
              {/* If this menu item has a keyboard shortcut, show it */}
              {item.shortcut && (
                <span className="ml-3 text-xs text-gray-400 dark:text-gray-500">
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

/**
 * PRODUCT HEADER COMPONENT
 *
 * This component creates the header rows for each equipment type (like "Portable Toilets")
 * It shows summary information and can be clicked to expand/collapse the individual equipment items
 * Think of it like a folder in a file system that you can open to see the files inside
 */
const ProductHeader = ({
  productHeader,
  dates,
  onToggleExpand,
  totalBookings,
  availableCount,
  onHireCount,
  allAssets,
  onShowItemsOnHire,
  onBlueBoxContextMenu,
  statusFilter
}) => {
  const config = PRODUCT_CONFIGS[productHeader.productType];
  
  return (
    <div
      className={clsx(
        "grid border-b-2 border-secondary-200 dark:border-secondary-600",
        "bg-gradient-to-r from-secondary-50 via-white to-secondary-50",
        "dark:from-secondary-800 dark:via-secondary-700 dark:to-secondary-800",
        "hover:from-secondary-100 hover:via-secondary-50 hover:to-secondary-100",
        "dark:hover:from-secondary-700 dark:hover:via-secondary-600 dark:hover:to-secondary-700",
        "transition-all duration-300 cursor-pointer group",
        "shadow-sm hover:shadow-md",
        "h-16" // Fixed height for uniform product header rows
      )}
      style={{
        gridTemplateColumns: `240px 100px 140px repeat(${dates.length}, 1fr)`,
        height: "64px", // Explicit height override for consistency
        maxHeight: "64px", // Prevent expansion beyond set height
      }}
      onClick={() => onToggleExpand(productHeader.id)}
    >
      {/* Product Type with Expand/Collapse */}
      <div className="flex items-center border-r border-secondary-200 dark:border-secondary-600 p-4 h-full overflow-hidden">
        <div className="flex items-center space-x-3">
          {/* Expand/Collapse Icon */}
          <div className={clsx(
            "p-1.5 rounded-lg transition-all duration-300",
            "bg-white/50 group-hover:bg-white group-hover:shadow-sm",
            "dark:bg-secondary-600/50 dark:group-hover:bg-secondary-600"
          )}>
            <svg
              className={clsx(
                "w-4 h-4 transition-all duration-300",
                config.textColor,
                productHeader.isExpanded ? "rotate-90" : "rotate-0"
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Product Type Info */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-3">
              <div className={clsx(
                "w-4 h-4 rounded-lg shadow-sm border-2 border-white",
                config.color,
                "group-hover:scale-110 transition-transform duration-200"
              )} />
              <span className="text-base font-semibold text-secondary-900 dark:text-secondary-100">
                {productHeader.productType}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-600 dark:text-secondary-400">
                {productHeader.count} units total
              </span>
              <span className={clsx(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                config.lightColor,
                config.textColor,
                config.borderColor,
                "border"
              )}>
                {config.prefix}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary - Available */}
      <div className="flex items-center justify-center border-r border-secondary-200 dark:border-secondary-600 p-4 h-full overflow-hidden">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-success-500"></div>
            <div className="text-lg font-bold text-success-600 dark:text-success-400">
              {availableCount}
            </div>
          </div>
          <div className="text-xs font-medium text-secondary-600 dark:text-secondary-400 uppercase tracking-wide">
            Available
          </div>
        </div>
      </div>

      {/* Status Summary - On Hire */}
      <div className="flex items-center justify-center border-r border-secondary-200 dark:border-secondary-600 p-4 h-full overflow-hidden">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {onHireCount}
            </div>
          </div>
          <div className="text-xs font-medium text-secondary-600 dark:text-secondary-400 uppercase tracking-wide">
            On Hire
          </div>
        </div>
      </div>

      {/* Date Cells - Show items on hire indicators */}
      {dates.map((date, index) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const isWeekend = getDay(date) === 0 || getDay(date) === 6;
        const isFuture = isFutureDate(date);
        
        // Count assets for this product type on this date using consistent helper function
        const productAssets = allAssets.filter(asset => asset.parentHeader === productHeader.id);
        const filteredAssetCount = getAssetCountForDateAndFilter(productAssets, dateStr, statusFilter);
        
        const handleDateClick = () => {
          if (filteredAssetCount > 0) {
            onShowItemsOnHire(date);
          }
        };

        const handleBlueBoxContextMenu = (e) => {
          if (filteredAssetCount > 0) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get the filtered assets for this date using consistent helper functions
            const getFilteredAssetsForDate = () => {
              const productAssets = allAssets.filter(asset => asset.parentHeader === productHeader.id);
              
              return productAssets.filter(asset => {
                if (statusFilter === "all") {
                  return (asset.status === "available" || asset.status === "Available") || isAssetOnHireOnDate(asset, dateStr);
                } else if (statusFilter === "available") {
                  return isAssetAvailableOnDate(asset, dateStr);
                } else if (statusFilter === "on_hire") {
                  return isAssetOnHireOnDate(asset, dateStr);
                }
                return false;
              });
            };
            
            onBlueBoxContextMenu(e, {
              date: dateStr,
              productType: productHeader.productType,
              assetsOnHire: filteredAssetCount,
              assets: getFilteredAssetsForDate()
            });
          }
        };
        
        return (
          <div
            key={`header-${productHeader.id}-${index}`}
            className={clsx(
              "h-full border-r border-secondary-200 dark:border-secondary-600",
              "flex items-center justify-center text-sm font-medium transition-all duration-200 overflow-hidden",
              isWeekend && "bg-secondary-100/50 dark:bg-secondary-700/50",
              isToday(date) && "bg-gradient-to-br from-warning-100 to-warning-200 dark:from-warning-900/40 dark:to-warning-800/40 shadow-inner",
              filteredAssetCount > 0 && "bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20",
              isFuture && "italic opacity-80" // Add italic styling for future date columns
            )}
          >
            {filteredAssetCount > 0 && (
              <div
                className={clsx(
                  "text-xs cursor-pointer transition-colors font-bold",
                  isFuture
                    ? "text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                )}
                onClick={handleDateClick}
                onContextMenu={handleBlueBoxContextMenu}
                title={`${filteredAssetCount} ${productHeader.productType} assets ${statusFilter === 'all' ? 'total' : statusFilter === 'available' ? 'available' : 'on hire'}${isFuture ? ' (Future - Uncertain)' : ''}`}
                style={isFuture ? {
                  fontStyle: 'italic',
                  fontWeight: 'bold',
                  transform: 'skew(-12deg)',
                  letterSpacing: '0.5px'
                } : {}}
              >
                {filteredAssetCount}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Enhanced Draggable Booking Event Component
 * Implements advanced drag functionality with visual feedback and editing
 */
const BookingEvent = ({ booking, dates, onMoveBooking, onEditBooking, onDeleteBooking }) => {
  // Calculate grid positioning for the booking event
  const startDate = new Date(booking.start);
  const endDate = new Date(booking.end);
  
  // Check if booking extends into future dates
  const hasFutureDates = dates.some(date => {
    const dateInRange = date >= startDate && date <= endDate;
    return dateInRange && isFutureDate(date);
  });
  
  const startIndex = dates.findIndex(date => isSameDay(date, startDate));
  const endIndex = dates.findIndex(date => isSameDay(date, endDate));
  
  // Skip if booking is outside visible range
  if (startIndex === -1 && endIndex === -1) {
    return null;
  }
  
  const adjustedStartIndex = Math.max(0, startIndex);
  const adjustedEndIndex = Math.min(dates.length - 1, endIndex === -1 ? dates.length - 1 : endIndex);
  
  const gridColumnStart = adjustedStartIndex + 4; // Account for fixed columns
  const gridColumnEnd = adjustedEndIndex + 5;

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onEditBooking(booking);
  };
  
  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={clsx(
        "relative bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-xs px-1 py-0.5 rounded opacity-25 hover:opacity-40 transition-opacity cursor-pointer",
        hasFutureDates && "italic" // Apply italic styling for bookings extending into future
      )}
      style={{
        gridColumnStart,
        gridColumnEnd,
        gridRow: 2,
        zIndex: 2,
        height: "12px",
        fontSize: "9px",
        marginTop: "44px"
      }}
      title={`${booking.title} - ${booking.customer}${hasFutureDates ? ' (Future - Uncertain)' : ''} (Double-click to edit)`}
    >
      <span className={clsx("truncate text-xs", hasFutureDates && "italic")}>{booking.title}</span>
    </div>
  );
};

/**
 * Hire Period Bar Component
 * Renders hire period bars with color coding for start, middle, and end days
 */
const HirePeriodBar = ({ asset, dates, onShowRentalDetails, onHirePeriodContextMenu }) => {
  // Only render if asset is on hire and has hire period data
  if (asset.status !== "on_hire" || !asset.onHireDate || !asset.offHireDate) {
    return null;
  }

  const startDate = new Date(asset.onHireDate);
  const endDate = new Date(asset.offHireDate);
  
  // Check if hire period extends into future dates
  const hasFutureDates = dates.some(date => {
    const dateInRange = date >= startDate && date <= endDate;
    return dateInRange && isFutureDate(date);
  });
  
  // Find start and end indices in the visible date range
  const startIndex = dates.findIndex(date => isSameDay(date, startDate));
  const endIndex = dates.findIndex(date => isSameDay(date, endDate));
  
  // Calculate adjusted indices for visible range
  const adjustedStartIndex = Math.max(0, startIndex === -1 ? 0 : startIndex);
  const adjustedEndIndex = Math.min(dates.length - 1, endIndex === -1 ? dates.length - 1 : endIndex);
  
  // Skip rendering if hire period is completely outside visible range
  if (startDate > dates[dates.length - 1] || endDate < dates[0]) {
    return null;
  }

  // Handle click on hire period bar
  const handleHirePeriodClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onShowRentalDetails(asset);
  };

  // Handle right-click context menu on hire period bar
  const handleHirePeriodContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onHirePeriodContextMenu(e, {
      asset,
      startDate,
      endDate,
      customer: asset.rentalDetails?.customer,
      location: asset.rentalDetails?.currentLocation || asset.location
    });
  };

  // Calculate positioning for the rental bar overlay
  const fixedColumnsWidth = 480; // 240px + 100px + 140px
  const dateColumnWidth = `calc((100% - ${fixedColumnsWidth}px) / ${dates.length})`;
  const startPosition = `calc(${fixedColumnsWidth}px + ${adjustedStartIndex} * ${dateColumnWidth})`;
  const barWidth = `calc(${adjustedEndIndex - adjustedStartIndex + 1} * ${dateColumnWidth})`;

  // Create ABSOLUTE POSITIONED beautiful gradient rental bar
  return (
    <div
      onClick={handleHirePeriodClick}
      onContextMenu={handleHirePeriodContextMenu}
      className={clsx(
        "absolute cursor-pointer transition-all duration-300 hover:scale-y-150 hover:shadow-2xl",
        hasFutureDates && "italic opacity-80" // Apply italic styling for hire periods extending into future
      )}
      style={{
        left: startPosition,
        width: barWidth,
        top: "50%",
        transform: "translateY(-50%)",
        height: "16px",
        zIndex: 50,
        borderRadius: "8px",
        background: "linear-gradient(90deg, #10b981 0%, #6b7280 50%, #ef4444 100%)",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3), 0 3px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
        border: "2px solid rgba(255, 255, 255, 0.4)",
        margin: "0 4px",
      }}
      title={`🟢 GREEN → GREY → RED RENTAL BAR 🔴\n${format(startDate, "MMM d")} → ${format(endDate, "MMM d")}\nCustomer: ${asset.rentalDetails?.customer || 'Unknown Customer'}\nLocation: ${asset.rentalDetails?.currentLocation || asset.location}${hasFutureDates ? '\n\n⚠️ FUTURE DATES - UNCERTAIN' : ''}\n\n✨ CLICK FOR DETAILS ✨`}
    >
      {/* Premium glossy overlay */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 30%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.1) 100%)",
          borderRadius: "8px"
        }}
      />
      
      {/* Large invisible click area */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "-16px",
          height: "48px"
        }}
      />
    </div>
  );
};

/**
 * Enhanced Drop Zone Component for Date Cells
 * Handles dropping bookings and click-to-create functionality
 */
const DateCell = ({ date, assetId, onDropBooking, onCreateBooking, isWeekend, hasBooking, conflicts = [] }) => {
  const [{ isOver, canDrop, itemType }, drop] = useDrop({
    accept: [ITEM_TYPES.BOOKING],
    drop: (item) => {
      if (item.type === 'booking') {
        // Check for conflicts before dropping
        const conflictExists = conflicts.some(c =>
          isSameDay(new Date(c.start), date) ||
          isSameDay(new Date(c.end), date) ||
          (new Date(c.start) <= date && new Date(c.end) >= date)
        );
        
        if (conflictExists) {
          // Show conflict warning but still allow drop (user decision)
          setTimeout(() => {
            confirmDialog({
              message: 'This date conflicts with existing bookings. Continue anyway?',
              header: 'Booking Conflict Warning',
              icon: 'pi pi-exclamation-triangle',
              accept: () => onDropBooking(item.booking.id, assetId, format(date, "yyyy-MM-dd")),
              reject: () => {}
            });
          }, 100);
          return;
        }
        
        onDropBooking(item.booking.id, assetId, format(date, "yyyy-MM-dd"));
      }
    },
    canDrop: (item) => {
      // Can always drop, but will show warning for conflicts
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      itemType: monitor.getItemType(),
    }),
  });

  const handleCellClick = () => {
    if (!hasBooking) {
      onCreateBooking(assetId, format(date, "yyyy-MM-dd"));
    }
  };

  const hasConflict = conflicts.length > 0;
  const isFuture = isFutureDate(date);

  return (
    <div
      ref={drop}
      onClick={handleCellClick}
      className={clsx(
        "relative h-full border-r border-gray-200 transition-all duration-200 group overflow-hidden",
        "dark:border-gray-700 cursor-pointer",
        
        // Base colors
        isWeekend && !isOver && !isToday(date) && "bg-gray-50 dark:bg-gray-800",
        
        // Today highlighting
        isToday(date) && "bg-yellow-50 dark:bg-yellow-900 border-yellow-300 shadow-inner",
        
        // Booking status
        hasBooking && !isOver && "bg-orange-50 dark:bg-orange-900",
        !hasBooking && !isOver && !isToday(date) && !isWeekend && "hover:bg-blue-25 dark:hover:bg-blue-950",
        
        // Drag over states
        isOver && canDrop && !hasConflict && "bg-green-100 dark:bg-green-900 border-green-400 border-2 shadow-inner",
        isOver && canDrop && hasConflict && "bg-orange-100 dark:bg-orange-900 border-orange-400 border-2 shadow-inner",
        isOver && !canDrop && "bg-orange-100 dark:bg-orange-900 border-orange-400 border-2 shadow-inner",
        
        // Conflict indication
        hasConflict && !isOver && "border-l-4 border-l-orange-400",
        
        // Future date styling
        isFuture && "italic opacity-80"
      )}
    >
      {/* Drop indicator */}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
            canDrop && !hasConflict && "bg-green-500 text-dark dark:text-white",
            canDrop && hasConflict && "bg-orange-500 text-dark dark:text-white",
            !canDrop && "bg-orange-500 text-dark dark:text-white"
          )}>
            {canDrop && !hasConflict && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {canDrop && hasConflict && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {!canDrop && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Click to create indicator */}
      {!hasBooking && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-6 h-6 rounded-full bg-blue-500 text-dark dark:text-white flex items-center justify-center shadow-lg text-xs">
            +
          </div>
        </div>
      )}

      {/* Conflict indicator */}
      {hasConflict && !isOver && (
        <div className="absolute top-1 right-1">
          <div className="w-3 h-3 rounded-full bg-orange-400" title="Booking conflict detected" />
        </div>
      )}

      {/* Date number for smaller views */}
      {isToday(date) && (
        <div className="absolute bottom-0 right-1 text-xs font-bold text-yellow-600 dark:text-yellow-300">
          {format(date, "d")}
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Draggable Asset Row Component
 * Displays asset information with drag & drop reordering and advanced booking management
 */
const AssetRow = ({
  asset,
  bookings,
  dates,
  onDropBooking,
  onMoveBooking,
  onCreateBooking,
  onEditBooking,
  onDeleteBooking,
  onMoveAsset,
  onShowRentalDetails,
  onHirePeriodContextMenu,
  index,
  isDraggingAsset,
  allBookings
}) => {
  // Drag and drop for asset row reordering
  const [{ isDragging }, dragAsset] = useDrag({
    type: ITEM_TYPES.TOILET, // Keep same type for compatibility
    item: { id: asset.id, asset, index, type: 'asset' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver: isAssetOver }, dropAsset] = useDrop({
    accept: ITEM_TYPES.TOILET,
    drop: (item) => {
      if (item.index !== index) {
        onMoveAsset(item.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Filter bookings for this specific asset that fall within the date range
  const assetBookings = bookings.filter(
    booking => booking.assetId === asset.id && isBookingInDateRange(booking, dates)
  );

  // Create a map of dates that have bookings for quick lookup
  const bookedDates = useMemo(() => {
    const dateMap = new Set();
    assetBookings.forEach(booking => {
      const start = new Date(booking.start);
      const end = new Date(booking.end);
      let current = start;
      while (current <= end) {
        dateMap.add(format(current, "yyyy-MM-dd"));
        current = addDays(current, 1);
      }
    });
    return dateMap;
  }, [assetBookings]);

  // Detect conflicts for each date (only for the SAME asset with overlapping bookings)
  const getConflictsForDate = useCallback((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const checkDate = new Date(dateStr);
    
    // Get all bookings for THIS specific asset on this date
    const assetBookingsOnDate = allBookings.filter(booking => {
      if (booking.assetId !== asset.id) return false; // Only same asset
      const start = new Date(booking.start);
      const end = new Date(booking.end);
      return checkDate >= start && checkDate <= end;
    });
    
    // A conflict only exists if there are 2 or more bookings for the same asset on the same date
    return assetBookingsOnDate.length > 1 ? assetBookingsOnDate : [];
  }, [allBookings, asset.id]);

  return (
    <div
      ref={dropAsset}
      className={clsx(
        "grid border-b border-secondary-200 dark:border-secondary-700",
        "transition-all duration-300 relative group/row",
        "hover:bg-gradient-to-r hover:from-secondary-50/50 hover:to-white/50",
        "dark:hover:from-secondary-800/50 dark:hover:to-secondary-700/50",
        "hover:shadow-sm",
        "h-16", // Fixed height for uniform asset rows
        isDragging && "opacity-60 scale-[0.98] rotate-1 shadow-xl",
        isAssetOver && "bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 border-primary-200 shadow-inner",
        isDraggingAsset && "shadow-lg"
      )}
      style={{
        gridTemplateColumns: `240px 100px 140px repeat(${dates.length}, 1fr)`,
        height: "64px", // Explicit height override for consistency
        maxHeight: "64px", // Prevent expansion beyond set height
        zIndex: isDragging ? 1000 : 1,
      }}
    >
      {/* Enhanced drag indicator */}
      {isAssetOver && (
        <div className="absolute inset-0 border-2 border-dashed border-primary-400 pointer-events-none rounded-lg animate-pulse" />
      )}

      {/* Asset Number with Enhanced Drag Handle */}
      <div className="flex items-center border-r border-secondary-200 dark:border-secondary-700 p-4 group/asset h-full overflow-hidden">
        {/* Modern Drag Handle */}
        <div
          ref={dragAsset}
          className={clsx(
            "mr-3 p-2 rounded-lg cursor-grab hover:cursor-grabbing transition-all duration-300",
            "opacity-0 group-hover/row:opacity-60 group-hover/asset:opacity-100",
            "hover:bg-secondary-200 dark:hover:bg-secondary-600",
            "hover:shadow-sm hover:scale-110",
            isDragging && "cursor-grabbing opacity-100 bg-secondary-200 dark:bg-secondary-600"
          )}
          title="Drag to reorder asset rows"
        >
          <svg className="w-4 h-4 text-secondary-500 dark:text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a1 1 0 000 2h6a1 1 0 100-2H7zM7 8a1 1 0 000 2h6a1 1 0 100-2H7zM7 14a1 1 0 000 2h6a1 1 0 100-2H7z" />
          </svg>
        </div>

        <div className="flex flex-col space-y-1">
          <span className="text-base font-semibold text-secondary-900 dark:text-secondary-100 font-mono">
            {asset.assetNumber}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary-600 dark:text-secondary-400">
              {asset.location}
            </span>
            {asset.capacity > 1 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-200">
                {asset.capacity}x
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modern Status Badge */}
      <div className="flex items-center justify-center border-r border-secondary-200 dark:border-secondary-700 p-4 h-full overflow-hidden">
        <span className={clsx(
          "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold",
          "transition-all duration-200 hover:scale-105",
          (asset.status === "available" || asset.status === "Available")
            ? "bg-orange-50 text-orange-700 border border-orange-200"
            : "bg-green-50 text-green-700 border border-green-200"
        )}>
          <div className={clsx(
            "w-2 h-2 rounded-full mr-2",
            (asset.status === "available" || asset.status === "Available") ? "bg-orange-400" : "bg-green-400"
          )}></div>
          {(asset.status === "available" || asset.status === "Available") ? "Available" : "Live"}
        </span>
      </div>

      {/* Enhanced Category */}
      <div className="flex items-center border-r border-secondary-200 dark:border-secondary-700 p-4 h-full overflow-hidden">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">
            {asset.category}
          </span>
          <span className="text-xs text-secondary-500 dark:text-secondary-400">
            {asset.productType}
          </span>
        </div>
      </div>

      {/* Enhanced Date Cells */}
      {dates.map((date, dateIndex) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const hasBooking = bookedDates.has(dateStr);
        const isWeekend = getDay(date) === 0 || getDay(date) === 6;
        const conflicts = getConflictsForDate(date);
        
        return (
          <DateCell
            key={`${asset.id}-${dateIndex}`}
            date={date}
            assetId={asset.id}
            onDropBooking={onDropBooking}
            onCreateBooking={onCreateBooking}
            isWeekend={isWeekend}
            hasBooking={hasBooking}
            conflicts={conflicts}
          />
        );
      })}


      {/* Green Hire Period Bars */}
      <HirePeriodBar asset={asset} dates={dates} onShowRentalDetails={onShowRentalDetails} onHirePeriodContextMenu={onHirePeriodContextMenu} />

    </div>
  );
};

/**
 * Advanced Calendar Navigation Component
 * Handles date navigation, view switching, and filtering controls
 */
const CalendarNavigation = ({
  currentDate,
  setCurrentDate,
  viewType,
  setViewType,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  toilets,
}) => {
  // Calculate status counts for filter buttons using today's date
  const statusCounts = useMemo(() => {
    const actualAssets = toilets.filter(item => item.type === 'asset');
    const totalCount = actualAssets.length;
    
    // Use simple arithmetic: Available = Total - On Hire
    const onHireCount = actualAssets.filter(asset => asset.status === "on_hire" || asset.status === "Live").length;
    const availableCount = totalCount - onHireCount;
    
    return {
      all: totalCount,
      available: availableCount,
      on_hire: onHireCount
    };
  }, [toilets]);
  // Navigation handlers optimized with date-fns
  const handlePrevious = useCallback(() => {
    switch (viewType) {
      case VIEW_TYPES.DAY:
        setCurrentDate(prev => addDays(prev, -1));
        break;
      case VIEW_TYPES.WEEK:
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case VIEW_TYPES.MONTH:
      default:
        setCurrentDate(prev => subMonths(prev, 1));
        break;
    }
  }, [viewType, setCurrentDate]);

  const handleNext = useCallback(() => {
    switch (viewType) {
      case VIEW_TYPES.DAY:
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case VIEW_TYPES.WEEK:
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case VIEW_TYPES.MONTH:
      default:
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  }, [viewType, setCurrentDate]);

  // Generate category options from toilets data
  const categoryOptions = useMemo(() => {
    const categories = [...new Set(toilets.map(toilet => toilet.category))];
    return [
      { label: "All Categories", value: "all" },
      ...categories.map(cat => ({ label: cat, value: cat }))
    ];
  }, [toilets]);

  // Format display title based on view type
  const getDisplayTitle = () => {
    switch (viewType) {
      case VIEW_TYPES.DAY:
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case VIEW_TYPES.WEEK:
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `Week of ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case VIEW_TYPES.MONTH:
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  return (
    <div className="mb-8 card p-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-6">
        {/* Enhanced Date Navigation */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              className={clsx(
                "btn-secondary",
                "w-12 h-12 rounded-xl shadow-md hover:shadow-lg",
                "hover:scale-105 active:scale-95",
                "bg-gradient-to-br from-white to-secondary-50",
                "border-2 border-secondary-200 hover:border-primary-300",
                "text-secondary-600 hover:text-primary-600"
              )}
              aria-label="Previous period"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNext}
              className={clsx(
                "btn-secondary",
                "w-12 h-12 rounded-xl shadow-md hover:shadow-lg",
                "hover:scale-105 active:scale-95",
                "bg-gradient-to-br from-white to-secondary-50",
                "border-2 border-secondary-200 hover:border-primary-300",
                "text-secondary-600 hover:text-primary-600"
              )}
              aria-label="Next period"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-secondary-900 to-secondary-700 dark:from-secondary-100 dark:to-secondary-300 bg-clip-text text-transparent">
              {getDisplayTitle()}
            </h2>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 font-medium">
              Calendar View • {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
            </p>
          </div>
        </div>

        {/* Modern Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Enhanced Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Status:
            </label>
            <div className="flex overflow-hidden rounded-xl border-2 border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-800">
              {Object.entries(FILTER_TYPES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(value)}
                  className={clsx(
                    "px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                    "border-r border-secondary-200 last:border-r-0 dark:border-secondary-600",
                    "hover:scale-105 active:scale-95",
                    statusFilter === value
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-dark dark:text-white shadow-lg shadow-primary-500/25"
                      : "text-secondary-700 hover:bg-white dark:text-secondary-300 dark:hover:bg-secondary-700 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <div className={clsx(
                      "w-2 h-2 rounded-full",
                      key === "AVAILABLE" && "bg-success-500",
                      key === "ON_HIRE" && "bg-orange-500",
                      key === "ALL" && "bg-secondary-400"
                    )}></div>
                    <span>{key === "ALL" ? "All" : key === "AVAILABLE" ? "Available" : "On Hire"}</span>
                    <span className={clsx(
                      "ml-1 px-2 py-0.5 text-xs font-bold rounded-full",
                      statusFilter === value
                        ? "bg-white/20 text-dark dark:text-white"
                        : "bg-secondary-200 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-300"
                    )}>
                      {statusCounts[value]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Category Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Category:
            </label>
            <div className="min-w-[200px]">
              <Dropdown
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.value)}
                options={categoryOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="Select Category"
                className="w-full"
                showClear
                pt={{
                  root: { className: "h-10 text-sm border-secondary-200 dark:border-secondary-600 rounded-xl" },
                  input: { className: "p-3 text-sm" },
                  item: { className: "p-2 text-sm hover:bg-secondary-100 dark:hover:bg-secondary-700" },
                }}
              />
            </div>
          </div>

          {/* Modern View Type Buttons */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
              View:
            </label>
            <div className="flex overflow-hidden rounded-xl border-2 border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-800">
              {Object.entries(VIEW_TYPES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setViewType(value)}
                  className={clsx(
                    "px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                    "border-r border-secondary-200 last:border-r-0 dark:border-secondary-600",
                    "hover:scale-105 active:scale-95",
                    viewType === value
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-dark dark:text-white shadow-lg shadow-primary-500/25"
                      : "text-secondary-700 hover:bg-white dark:text-secondary-300 dark:hover:bg-secondary-700 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <div className={clsx(
                      "w-2 h-2 rounded-full",
                      viewType === value ? "bg-white" : "bg-secondary-400"
                    )}></div>
                    <span>{key.charAt(0) + key.slice(1).toLowerCase()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Statistics Summary Component
 * Displays key metrics and insights about the toilet fleet
 */
const StatsSummary = ({ toilets, bookings, filteredToilets }) => {
  const stats = useMemo(() => {
    // Only count actual assets, not product headers
    const actualAssets = toilets.filter(item => item.type === 'asset');
    const totalToilets = actualAssets.length;
    
    // Use today's date for current status calculations
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    
    // Count assets based on their actual availability TODAY
    const availableToilets = actualAssets.filter(asset => isAssetAvailableOnDate(asset, todayStr)).length;
    const onHireToilets = actualAssets.filter(asset => isAssetOnHireOnDate(asset, todayStr)).length;
    
    const utilizationRate = totalToilets > 0 ? ((onHireToilets / totalToilets) * 100).toFixed(1) : "0.0";
    const activeBookings = bookings.length;
    
    // Count only actual assets in filtered results
    const filteredAssets = filteredToilets.filter(item => item.type === 'asset');
    
    return {
      totalToilets,
      availableToilets,
      onHireToilets,
      utilizationRate,
      activeBookings,
      filteredCount: filteredAssets.length,
    };
  }, [toilets, bookings, filteredToilets]);

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {stats.totalToilets}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Units</div>
      </div>
      
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="text-2xl font-bold text-green-600">
          {stats.availableToilets}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
      </div>
      
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="text-2xl font-bold text-red-600">
          {stats.onHireToilets}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">On Hire</div>
      </div>
      
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="text-2xl font-bold text-blue-600">
          {stats.utilizationRate}%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Utilization</div>
      </div>
      
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="text-2xl font-bold text-purple-600">
          {stats.activeBookings}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Active Bookings</div>
      </div>
      
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="text-2xl font-bold text-orange-600">
          {stats.filteredCount}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Filtered Results</div>
      </div>
    </div>
  );
};

/**
 * Enhanced Booking Dialog Component
 * Provides comprehensive booking creation and editing functionality
 */
const BookingDialog = ({ visible, onHide, booking, assets, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    assetId: '',
    start: null,
    end: null,
    type: 'construction',
    location: ''
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        title: booking.title || '',
        customer: booking.customer || '',
        assetId: booking.assetId || '',
        start: booking.start ? new Date(booking.start) : null,
        end: booking.end ? new Date(booking.end) : null,
        type: booking.type || 'construction',
        location: booking.location || ''
      });
    } else {
      setFormData({
        title: '',
        customer: '',
        assetId: '',
        start: null,
        end: null,
        type: 'construction',
        location: ''
      });
    }
  }, [booking, visible]);

  const handleSave = () => {
    if (!formData.title || !formData.customer || !formData.assetId || !formData.start || !formData.end) {
      return;
    }

    const bookingData = {
      ...formData,
      id: booking?.id || `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      start: format(formData.start, 'yyyy-MM-dd'),
      end: format(formData.end, 'yyyy-MM-dd')
    };

    onSave(bookingData);
    onHide();
  };

  const bookingTypeOptions = Object.entries(BOOKING_TYPES).map(([key, value]) => ({
    label: value.charAt(0).toUpperCase() + value.slice(1),
    value: key
  }));

  const assetOptions = assets.map(asset => ({
    label: `${asset.assetNumber} - ${asset.productType} (${asset.category})`,
    value: asset.id
  }));

  return (
    <Dialog
      header={booking ? "Edit Booking" : "Create New Booking"}
      visible={visible}
      onHide={onHide}
      style={{ width: '500px' }}
      className="p-fluid"
      modal
      draggable={false}
      resizable={false}
    >
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
          <InputText
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter booking title"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Customer</label>
          <InputText
            value={formData.customer}
            onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
            placeholder="Enter customer name"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Asset Unit</label>
          <Dropdown
            value={formData.assetId}
            onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.value }))}
            options={assetOptions}
            optionLabel="label"
            optionValue="value"
            placeholder="Select asset unit"
            className="w-full"
            filter
            showClear
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Type</label>
          <Dropdown
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.value }))}
            options={bookingTypeOptions}
            optionLabel="label"
            optionValue="value"
            placeholder="Select booking type"
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <Calendar
              value={formData.start}
              onChange={(e) => setFormData(prev => ({ ...prev, start: e.value }))}
              dateFormat="yy-mm-dd"
              placeholder="Select start date"
              className="w-full"
              showIcon
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
            <Calendar
              value={formData.end}
              onChange={(e) => setFormData(prev => ({ ...prev, end: e.value }))}
              dateFormat="yy-mm-dd"
              placeholder="Select end date"
              className="w-full"
              showIcon
              minDate={formData.start}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
          <InputText
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Enter location"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          label="Cancel"
          onClick={onHide}
          className="p-button-outlined"
        />
        <Button
          label={booking ? "Update" : "Create"}
          onClick={handleSave}
          disabled={!formData.title || !formData.customer || !formData.toiletId || !formData.start || !formData.end}
        />
      </div>
    </Dialog>
  );
};

/**
 * Rental Details Modal Component
 * Displays detailed rental information for hire periods
 */
const RentalDetailsModal = ({ visible, onHide, asset }) => {
  if (!asset) return null;

  const startDate = asset.onHireDate ? new Date(asset.onHireDate) : null;
  const endDate = asset.offHireDate ? new Date(asset.offHireDate) : null;
  
  const formatDateRange = () => {
    if (!startDate || !endDate) return 'Date range not available';
    return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return 'N/A';
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const getStatusDisplay = () => {
    return {
      label: 'Active',
      color: 'orange',
      bgColor: 'bg-orange-500'
    };
  };

  const statusInfo = getStatusDisplay();

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Rental Details"
      style={{ width: '500px' }}
      className="p-fluid"
      modal
      dismissableMask
      closeOnEscape
    >
      <div className="space-y-6">
        {/* Asset Information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Asset Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asset Number
              </label>
              <p className="text-sm font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                {asset.assetNumber}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <p className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                {asset.productType}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <p className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                {asset.category}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-2">
                <span className={clsx(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-dark dark:text-white",
                  statusInfo.bgColor
                )}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Customer Information
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer
              </label>
              <p className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                {asset.rentalDetails?.customer || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Location
              </label>
              <p className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                {asset.rentalDetails?.currentLocation || asset.location || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Hire Period Information */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Hire Period
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                On Hire Date
              </label>
              <p className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                {startDate ? format(startDate, "MMM d, yyyy") : 'Not set'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Off Hire Date
              </label>
              <p className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                {endDate ? format(endDate, "MMM d, yyyy") : 'Not set'}
              </p>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration
              </label>
              <p className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                {calculateDuration()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            label="Close"
            icon="pi pi-times"
            onClick={onHide}
            className="p-button-secondary"
          />
        </div>
      </div>
    </Dialog>
  );
};

/**
 * Items On Hire Modal Component
 * Shows detailed, searchable view of items on hire for a specific date
 */
const ItemsOnHireModal = ({ visible, onHide, date, assets, allAssets }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState("all");

  if (!date || !assets) return null;

  // Filter assets that are on hire on the specific date
  const assetsOnHireOnDate = allAssets.filter(asset => {
    if (asset.status !== "on_hire" || !asset.onHireDate || !asset.offHireDate) {
      return false;
    }
    
    const checkDate = new Date(date);
    const hireStart = new Date(asset.onHireDate);
    const hireEnd = new Date(asset.offHireDate);
    
    return checkDate >= hireStart && checkDate <= hireEnd;
  });

  // Apply search and filter
  const filteredAssets = assetsOnHireOnDate.filter(asset => {
    const matchesSearch = searchTerm === "" ||
      asset.assetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.rentalDetails?.customer || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedAssetType === "all" || asset.productType === selectedAssetType;
    
    return matchesSearch && matchesType;
  });

  // Group by asset type
  const assetsByType = filteredAssets.reduce((acc, asset) => {
    if (!acc[asset.productType]) {
      acc[asset.productType] = [];
    }
    acc[asset.productType].push(asset);
    return acc;
  }, {});

  // Get unique asset types for filter dropdown
  const assetTypes = [...new Set(assetsOnHireOnDate.map(asset => asset.productType))];

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`Items On Hire - ${format(new Date(date), "MMM d, yyyy")}`}
      style={{ width: '800px', maxHeight: '80vh' }}
      className="p-fluid"
      modal
      dismissableMask
      closeOnEscape
    >
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Assets
            </label>
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by asset number, type, category, or customer..."
              className="w-full"
            />
          </div>
          
          <div className="flex-shrink-0 w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asset Type
            </label>
            <Dropdown
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.value)}
              options={[
                { label: "All Types", value: "all" },
                ...assetTypes.map(type => ({ label: type, value: type }))
              ]}
              className="w-full"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {filteredAssets.length} of {assetsOnHireOnDate.length} items on hire
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Assets List by Type */}
        <div className="max-h-96 overflow-y-auto space-y-4">
          {Object.keys(assetsByType).length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No assets found matching your criteria
            </div>
          ) : (
            Object.entries(assetsByType).map(([assetType, typeAssets]) => (
              <div key={assetType} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <div className={clsx("w-3 h-3 rounded-full mr-2", PRODUCT_CONFIGS[assetType]?.color)} />
                    {assetType} ({typeAssets.length})
                  </h4>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {typeAssets.map(asset => (
                    <div key={asset.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {asset.assetNumber}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              On Hire
                            </span>
                          </div>
                          
                          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Category:</span> {asset.category}
                          </div>
                          
                          {asset.rentalDetails && (
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Customer:</span>
                                <span className="ml-1 text-gray-600 dark:text-gray-400">
                                  {asset.rentalDetails.customer}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                                <span className="ml-1 text-gray-600 dark:text-gray-400">
                                  {asset.rentalDetails.currentLocation}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {asset.onHireDate && asset.offHireDate && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Hire Period:</span>
                              <span className="ml-1">
                                {format(new Date(asset.onHireDate), "MMM d")} - {format(new Date(asset.offHireDate), "MMM d, yyyy")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            label="Close"
            icon="pi pi-times"
            onClick={onHide}
            className="p-button-secondary"
          />
        </div>
      </div>
    </Dialog>
  );
};

/**
 * STEP 7: THE MAIN CALENDAR COMPONENT
 *
 * This is the main component that brings everything together
 * Think of this like the main controller of a video game - it manages all the different parts
 *
 * Enhanced Main Renttix Calendar Component
 * High-performance, feature-rich equipment rental scheduling system with drag & drop
 */
export default function RenttixCalendar() {
  
  // STEP 7A: REFS - LIKE GETTING DIRECT ACCESS TO THINGS
  // useRef is like having a remote control for specific parts of your component
  // It lets you directly access and control elements without re-rendering the whole component
  
  const toast = useRef(null);  // Reference to the notification system
  const menu = useRef(null);   // Reference to the right-click context menu

  // STEP 7B: STATE VARIABLES - LIKE THE MEMORY OF YOUR COMPONENT
  // useState is React's way of remembering information that can change
  // When state changes, React automatically updates what the user sees
  // Think of state like variables that trigger a screen refresh when they change
  
  // Calendar view settings (what the user is currently looking at)
  const [currentDate, setCurrentDate] = useState(new Date());        // What date/month we're viewing
  const [viewType, setViewType] = useState(VIEW_TYPES.MONTH);        // Day/Week/Month view
  const [statusFilter, setStatusFilter] = useState(FILTER_TYPES.ALL); // Filter by available/rented/all
  const [categoryFilter, setCategoryFilter] = useState("all");        // Filter by equipment category

  // Search functionality (letting users find specific equipment)
  const [searchQuery, setSearchQuery] = useState("");           // What the user typed in the search box
  const [filteredAssets, setFilteredAssets] = useState([]);     // List of equipment matching the search
  const [searchResultsCount, setSearchResultsCount] = useState(0); // How many results we found

  // Dialog/popup windows (for creating and editing bookings)
  const [showBookingDialog, setShowBookingDialog] = useState(false);     // Is the booking popup open?
  const [editingBooking, setEditingBooking] = useState(null);            // Which booking are we editing?
  const [isDraggingAsset, setIsDraggingAsset] = useState(false);         // Is someone dragging equipment around?
  
  // Modal windows for showing detailed information
  const [showRentalDetailsModal, setShowRentalDetailsModal] = useState(false); // Is rental details popup open?
  const [selectedRentalAsset, setSelectedRentalAsset] = useState(null);         // Which rental are we showing details for?
  
  // Modal for showing all items rented on a specific date
  const [showItemsOnHireModal, setShowItemsOnHireModal] = useState(false); // Is the "items on hire" popup open?
  const [selectedDate, setSelectedDate] = useState(null);                  // Which date are we showing items for?

  // Right-click context menu (like the menu that appears when you right-click on desktop)
  const [contextMenu, setContextMenu] = useState({
    visible: false,  // Is the menu currently showing?
    x: 0,           // Horizontal position where user right-clicked
    y: 0,           // Vertical position where user right-clicked
    items: [],      // List of menu options to show
    data: null      // Information about what was right-clicked
  });

  // Main data (all the equipment and rental appointments)
  // We initialize these with fake data using our generator functions
  const [assets, setAssets] = useState(() => generateMockAssets());              // All our equipment
  const [bookings, setBookings] = useState(() => generateMockBookings(generateMockAssets())); // All rental appointments

  // Keep track of the order of equipment rows (for drag & drop reordering)
  const [assetOrder, setAssetOrder] = useState([]);

  // STEP 7C: REACT HOOKS - SPECIAL FUNCTIONS THAT ADD SUPERPOWERS TO COMPONENTS
  
  // useEffect - RUNS CODE WHEN SOMETHING CHANGES
  // Think of useEffect like setting up automatic rules
  // "When the assets list changes, automatically update the asset order"
  useEffect(() => {
    // Create a list of all asset IDs in the same order as the assets list
    setAssetOrder(assets.map(asset => asset.id));
  }, [assets]); // The [assets] part means "run this when the assets array changes"

  // STEP 7D: PERFORMANCE OPTIMIZATION - MAKING THE APP RUN FASTER
  
  // useMemo - REMEMBERS EXPENSIVE CALCULATIONS
  // Think of useMemo like a smart calculator that remembers its answers
  // If you ask it "what's 2+2" again, it just says "4" without recalculating
  const timelineDates = useMemo(
    () => generateTimelineDates(currentDate, viewType), // The expensive calculation
    [currentDate, viewType] // Only recalculate when these values change
  );
  // This prevents us from regenerating the same dates over and over

  // Another memoized calculation - filter out only the actual equipment (not group headers)
  const allAssets = useMemo(() =>
    assets.filter(asset => asset.type === 'asset'), // Get only real equipment
    [assets] // Only recalculate when the assets list changes
  );

  // STEP 7E: SEARCH FUNCTIONALITY - HELPING USERS FIND THINGS
  
  // useCallback - REMEMBERS FUNCTIONS SO THEY DON'T GET RECREATED UNNECESSARILY
  // Think of useCallback like having a favorite recipe written down
  // Instead of figuring out the recipe every time, you just look at your written copy
  const performSearch = useCallback((query) => {
    // If the search box is empty, show no results
    if (!query.trim()) {
      setFilteredAssets([]);
      setSearchResultsCount(0);
      return;
    }

    // Split the search by commas (so users can search "PT-0001, DT-0005, Site 7")
    // .trim() removes extra spaces, .filter() removes empty strings
    const searchTerms = query.toLowerCase().split(',').map(term => term.trim()).filter(term => term);
    const matchedAssets = [];

    // Look through every piece of equipment to see if it matches the search
    allAssets.forEach(asset => {
      // Create a big string of all the searchable information about this equipment
      const searchableText = [
        asset.assetNumber,  // Like "PT-0001"
        asset.name,         // Like "Portable Toilet PT-0001"
        asset.productType,  // Like "Portable Toilet"
        asset.category,     // Like "Standard"
        asset.status,       // Like "available"
        asset.location      // Like "Depot"
      ].join(' ').toLowerCase(); // Join them all together and make lowercase

      // Check if ANY of the search terms match this equipment
      // .some() returns true if at least one search term matches
      const matches = searchTerms.some(term => {
        return searchableText.includes(term) ||           // Check the big combined string
               asset.assetNumber.toLowerCase().includes(term) ||  // Check asset number specifically
               asset.productType.toLowerCase().includes(term) ||  // Check product type specifically
               asset.category.toLowerCase().includes(term) ||     // Check category specifically
               asset.status.toLowerCase().includes(term) ||       // Check status specifically
               asset.location.toLowerCase().includes(term);       // Check location specifically
      });

      // If we found a match, add this equipment to our results
      if (matches) {
        matchedAssets.push(asset);
      }
    });

    // Update the state with our search results
    setFilteredAssets(matchedAssets);
    setSearchResultsCount(matchedAssets.length);
  }, [allAssets]); // Only recreate this function if allAssets changes

  // Function to handle when someone types in the search box
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;  // Get what they typed
    setSearchQuery(query);         // Remember what they typed
    performSearch(query);          // Search for it
  }, [performSearch]);

  // Function to clear/reset the search
  const clearSearch = useCallback(() => {
    setSearchQuery("");      // Clear the search box
    setFilteredAssets([]);   // Clear the results
    setSearchResultsCount(0); // Reset the counter
  }, []);

  // Helper function to toggle product header expansion
  const handleToggleExpand = useCallback((headerId) => {
    setAssets(prevAssets =>
      prevAssets.map(asset =>
        asset.id === headerId
          ? { ...asset, isExpanded: !asset.isExpanded }
          : asset
      )
    );
  }, []);

  // Filter visible rows based on expansion state, filters, and search
  const visibleRows = useMemo(() => {
    const rows = [];
    const isSearchActive = searchQuery.trim().length > 0;
    
    assets.forEach(asset => {
      if (asset.type === 'product-header') {
        let childAssets = allAssets.filter(a => a.parentHeader === asset.id);
        
        // If search is active, filter child assets by search results first
        if (isSearchActive) {
          childAssets = childAssets.filter(child =>
            filteredAssets.some(filtered => filtered.id === child.id)
          );
        }
        
        // Apply other filters with date-aware status filtering
        const filteredChildren = childAssets.filter(childAsset => {
          // Category filter first
          if (categoryFilter !== "all" && childAsset.category !== categoryFilter) {
            return false;
          }
          
          // Date-aware status filter using today's date for consistency
          if (statusFilter !== FILTER_TYPES.ALL) {
            const today = new Date();
            const todayStr = format(today, "yyyy-MM-dd");
            
            if (statusFilter === FILTER_TYPES.AVAILABLE) {
              return isAssetAvailableOnDate(childAsset, todayStr);
            } else if (statusFilter === FILTER_TYPES.ON_HIRE) {
              return isAssetOnHireOnDate(childAsset, todayStr);
            }
          }
          
          return true;
        });
        
        // Only show product header if it has matching children or no search is active
        if (!isSearchActive || filteredChildren.length > 0) {
          // Use simple arithmetic: Available = Total - On Hire
          const totalCount = filteredChildren.length;
          const onHireCount = filteredChildren.filter(a => a.status === "on_hire" || a.status === "Live").length;
          const availableCount = totalCount - onHireCount;
          
          rows.push({
            ...asset,
            availableCount,
            onHireCount,
            childAssets: filteredChildren,
            // Auto-expand when search is active and has results
            isExpanded: isSearchActive ? filteredChildren.length > 0 : asset.isExpanded
          });
          
          // Show child assets if expanded (or if search is active with results)
          if ((isSearchActive && filteredChildren.length > 0) || asset.isExpanded) {
            // Apply custom ordering to child assets
            const orderedChildren = filteredChildren.sort((a, b) => {
              const aIndex = assetOrder.indexOf(a.id);
              const bIndex = assetOrder.indexOf(b.id);
              
              // If both are not in assetOrder, sort naturally by asset number
              if (aIndex === -1 && bIndex === -1) {
                return a.assetNumber.localeCompare(b.assetNumber);
              }
              
              // If only one is in assetOrder, that one comes first
              if (aIndex === -1) return 1;
              if (bIndex === -1) return -1;
              
              // Both are in assetOrder, use their positions
              return aIndex - bIndex;
            });
            
            rows.push(...orderedChildren);
          }
        }
      }
    });
    
    return rows;
  }, [assets, allAssets, statusFilter, categoryFilter, assetOrder, searchQuery, filteredAssets]);

  // STEP 7F: EVENT HANDLERS - FUNCTIONS THAT RESPOND TO USER ACTIONS
  // These are like the controls on a video game - they respond when users do things
  
  /**
   * DRAG & DROP BOOKING HANDLER
   * This function runs when someone drags a booking to a different date
   * Like moving a sticky note from one day to another on a calendar
   */
  const handleDropBooking = useCallback((bookingId, assetId, newStartDate) => {
    // setState functions can take a function that receives the previous state
    // This is useful when the new state depends on the old state
    setBookings(prevBookings => {
      // .map() goes through each booking and potentially changes it
      return prevBookings.map(booking => {
        // Only change the booking that was dragged
        if (booking.id === bookingId) {
          // Calculate how long the original booking was
          const originalStart = new Date(booking.start);
          const originalEnd = new Date(booking.end);
          const duration = Math.ceil((originalEnd - originalStart) / (1000 * 60 * 60 * 24));
          
          // Set the new end date to maintain the same duration
          const newEnd = addDays(new Date(newStartDate), duration);
          
          // Return a new booking object with updated information
          // The ... (spread operator) copies all the old properties, then we override specific ones
          return {
            ...booking,              // Copy everything from the old booking
            assetId,                 // Update which equipment this is for
            start: newStartDate,     // Update the start date
            end: format(newEnd, "yyyy-MM-dd"), // Update the end date
          };
        }
        // For all other bookings, return them unchanged
        return booking;
      });
    });
  }, []); // Empty dependency array means this function never changes

  /**
   * BOOKING MOVE HANDLER
   * This function runs when someone moves a booking to different equipment
   */
  const handleMoveBooking = useCallback((bookingId, newAssetId) => {
    setBookings(prevBookings => {
      return prevBookings.map(booking => {
        if (booking.id === bookingId) {
          // Only change the equipment assignment
          return { ...booking, assetId: newAssetId };
        }
        return booking;
      });
    });
  }, []);

  /**
   * CREATE NEW BOOKING HANDLER
   * This function runs when someone clicks on an empty calendar cell to create a booking
   * Like clicking on an empty time slot in a doctor's appointment book
   */
  const handleCreateBooking = useCallback((assetId, startDate) => {
    // Find the equipment they clicked on so we can get its details
    const asset = allAssets.find(a => a.id === assetId);
    
    // Set up the booking information for the dialog popup
    setEditingBooking({
      assetId,                        // Which equipment this booking is for
      start: startDate,               // When it starts
      end: startDate,                 // When it ends (initially same day)
      title: '',                      // Empty title - user will fill this in
      customer: '',                   // Empty customer - user will fill this in
      type: 'construction',           // Default to construction type
      location: asset?.location || '' // Start with the equipment's current location
    });
    
    // Show the booking creation dialog
    setShowBookingDialog(true);
  }, [allAssets]); // Recreate this function when allAssets changes

  /**
   * Edit booking handler
   */
  const handleEditBooking = useCallback((booking) => {
    setEditingBooking(booking);
    setShowBookingDialog(true);
  }, []);

  /**
   * Delete booking handler
   */
  const handleDeleteBooking = useCallback((bookingId) => {
    setBookings(prevBookings => {
      return prevBookings.filter(booking => booking.id !== bookingId);
    });
  }, []);

  /**
   * Save booking handler (for both create and edit)
   */
  const handleSaveBooking = useCallback((bookingData) => {
    setBookings(prevBookings => {
      const existingIndex = prevBookings.findIndex(b => b.id === bookingData.id);
      if (existingIndex >= 0) {
        // Update existing booking
        const updated = [...prevBookings];
        updated[existingIndex] = bookingData;
        return updated;
      } else {
        // Add new booking
        return [...prevBookings, bookingData];
      }
    });
  }, []);

  /**
   * Asset reordering handler
   */
  const handleMoveAsset = useCallback((fromIndex, toIndex) => {
    setAssetOrder(prevOrder => {
      const newOrder = [...prevOrder];
      const [movedItem] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedItem);
      return newOrder;
    });
  }, []);

  /**
   * Close booking dialog handler
   */
  const handleCloseBookingDialog = useCallback(() => {
    setShowBookingDialog(false);
    setEditingBooking(null);
  }, []);

  /**
   * Show rental details handler
   */
  const handleShowRentalDetails = useCallback((asset) => {
    setSelectedRentalAsset(asset);
    setShowRentalDetailsModal(true);
  }, []);

  /**
   * Close rental details modal handler
   */
  const handleCloseRentalDetailsModal = useCallback(() => {
    setShowRentalDetailsModal(false);
    setSelectedRentalAsset(null);
  }, []);

  /**
   * Show items on hire for specific date handler
   */
  const handleShowItemsOnHire = useCallback((date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setShowItemsOnHireModal(true);
  }, []);

  /**
   * Close items on hire modal handler
   */
  const handleCloseItemsOnHireModal = useCallback(() => {
    setShowItemsOnHireModal(false);
    setSelectedDate(null);
  }, []);

  /**
   * Blue box context menu handler
   */
  const handleBlueBoxContextMenu = useCallback((event, data) => {
    const { clientX: x, clientY: y } = event;
    
    const menuItems = [
      {
        label: "View All Items",
        icon: "pi pi-eye",
        command: () => {
          const date = new Date(data.date);
          handleShowItemsOnHire(date);
        }
      },
      { separator: true },
      {
        label: "Export Daily Report",
        icon: "pi pi-file-export",
        command: () => {
          console.log(`Exporting daily report for ${data.productType} on ${data.date}`, data);
          toast.current.show({
            severity: 'success',
            summary: 'Export Started',
            detail: `Exporting daily report for ${data.assetsOnHire} ${data.productType} assets on ${data.date}`,
            life: 3000
          });
        }
      },
      {
        label: "Mark All for Maintenance Check",
        icon: "pi pi-wrench",
        command: () => {
          console.log(`Marking ${data.assetsOnHire} ${data.productType} assets for maintenance`, data);
          toast.current.show({
            severity: 'info',
            summary: 'Maintenance Scheduled',
            detail: `Marked ${data.assetsOnHire} ${data.productType} assets for maintenance check`,
            life: 3000
          });
        }
      },
      {
        label: "Send Reminder to Customers",
        icon: "pi pi-envelope",
        command: () => {
          console.log(`Sending reminders for ${data.productType} assets`, data);
          toast.current.show({
            severity: 'info',
            summary: 'Reminders Sent',
            detail: `Sending reminders to customers for ${data.assetsOnHire} ${data.productType} assets`,
            life: 3000
          });
        }
      }
    ];

    setContextMenu({
      visible: true,
      x,
      y,
      items: menuItems,
      data
    });
  }, [handleShowItemsOnHire]);

  /**
   * Hire period context menu handler
   */
  const handleHirePeriodContextMenu = useCallback((event, data) => {
    const { clientX: x, clientY: y } = event;
    
    const menuItems = [
      {
        label: "View Rental Details",
        icon: "pi pi-info-circle",
        command: () => {
          handleShowRentalDetails([data].asset);
        }
      },
      { separator: true },
      {
        label: "Extend Rental",
        icon: "pi pi-clock",
        command: () => {
          console.log(`Extending rental for asset ${data.asset.assetNumber}`, data);
          toast.current.show({
            severity: 'success',
            summary: 'Rental Extended',
            detail: `Extending rental for ${data.asset.assetNumber} - ${data.customer}`,
            life: 3000
          });
        }
      },
      {
        label: "End Rental Early",
        icon: "pi pi-stop-circle",
        command: () => {
          console.log(`Ending rental early for asset ${data.asset.assetNumber}`, data);
          toast.current.show({
            severity: 'warn',
            summary: 'Rental Ended Early',
            detail: `Ending rental early for ${data.asset.assetNumber} - ${data.customer}`,
            life: 3000
          });
        }
      },
      {
        label: "Contact Customer",
        icon: "pi pi-phone",
        command: () => {
          console.log(`Contacting customer for asset ${data.asset.assetNumber}`, data);
          toast.current.show({
            severity: 'info',
            summary: 'Contacting Customer',
            detail: `Contacting customer: ${data.customer || 'Unknown'} for asset ${data.asset.assetNumber}`,
            life: 3000
          });
        }
      },
      {
        label: "View Asset History",
        icon: "pi pi-chart-line",
        command: () => {
          console.log(`Viewing asset history for ${data.asset.assetNumber}`, data);
          toast.current.show({
            severity: 'info',
            summary: 'Asset History',
            detail: `Viewing asset history for ${data.asset.assetNumber} - ${data.asset.productType}`,
            life: 3000
          });
        }
      }
    ];

    setContextMenu({
      visible: true,
      x,
      y,
      items: menuItems,
      data
    });
  }, [handleShowRentalDetails]);

  /**
   * Close context menu handler
   */
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(prev => ({
      ...prev,
      visible: false
    }));
  }, []);

  // Context menu items for PrimeReact Menu
  const contextMenuItems = useMemo(() => {
    return contextMenu.items;
  }, [contextMenu.items]);

  // Handle context menu positioning and show/hide
  useEffect(() => {
    if (contextMenu.visible && menu.current) {
      // Create a synthetic event at the specified coordinates
      const syntheticEvent = {
        preventDefault: () => {},
        currentTarget: {
          getBoundingClientRect: () => ({
            left: contextMenu.x,
            top: contextMenu.y,
            right: contextMenu.x,
            bottom: contextMenu.y,
            width: 0,
            height: 0
          })
        },
        target: {
          getBoundingClientRect: () => ({
            left: contextMenu.x,
            top: contextMenu.y,
            right: contextMenu.x,
            bottom: contextMenu.y,
            width: 0,
            height: 0
          })
        }
      };
      
      menu.current.show(syntheticEvent);
    }
  }, [contextMenu.visible, contextMenu.x, contextMenu.y]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-[1800px] p-6">
          {/* Modern Page Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <svg className="w-6 h-6 text-dark dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold dark:text-white bg-gradient-to-r from-secondary-900 via-primary-700 to-secondary-900 dark:from-secondary-100 dark:via-primary-300 dark:to-secondary-100 bg-clip-text text-dark-2">
                  Renttix Multi-Asset Scheduler
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mx-auto mt-2"></div>
              </div>
            </div>
            <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto leading-relaxed">
              Manage your fleet of <span className="font-semibold text-primary-600 dark:text-primary-400">{allAssets.length} assets</span> across <span className="font-semibold text-primary-600 dark:text-primary-400">{Object.keys(PRODUCT_TYPES).length} product lines</span> with advanced scheduling and intuitive drag-and-drop functionality
            </p>
          </div>

          {/* Statistics Summary */}
          <StatsSummary
            toilets={allAssets}
            bookings={bookings}
            filteredToilets={allAssets.filter(asset => {
              if (statusFilter !== FILTER_TYPES.ALL && asset.status !== statusFilter) return false;
              if (categoryFilter !== "all" && asset.category !== categoryFilter) return false;
              return true;
            })}
          />

          {/* Multi-Asset Search */}
          <div className="mb-8">
            <div className="card bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 shadow-lg border-0 p-6">
              <div className="flex items-center space-x-4">
                {/* Search Icon and Label */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                    <svg className="w-5 h-5 text-dark dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                      Multi-Asset Search
                    </h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Search by asset ID, location, category, or status
                    </p>
                  </div>
                </div>

                {/* Search Input */}
                <div className="flex-1 relative">
                  <div className="relative">
                    <InputText
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="e.g., PT-0011, PT-0013, Site 7, Depot, Available, Disabled Access..."
                      className="w-full pl-4 pr-12 py-3 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl
                               focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20
                               dark:bg-gray-700 dark text-dark:dark:text-white dark:placeholder-gray-400
                               transition-all duration-200 shadow-sm hover:shadow-md"
                      style={{ minHeight: '48px' }}
                    />
                    {searchQuery && (
                      <Button
                        icon="pi pi-times"
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2
                                 w-8 h-8 rounded-lg p-button-text p-button-secondary
                                 hover:bg-gray-100 dark:hover:bg-gray-600"
                        tooltip="Clear search"
                        tooltipOptions={{ position: 'left' }}
                      />
                    )}
                  </div>
                </div>

                {/* Search Results Counter */}
                {searchQuery && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-700">
                    <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                      {searchResultsCount} {searchResultsCount === 1 ? 'asset' : 'assets'} found
                    </span>
                  </div>
                )}
              </div>

              {/* Search Help Text */}
              <div className="mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Search Tips:</span> Use comma-separated values for multiple assets (e.g: PT-0011, DT-0005).
                    Search works across asset IDs, locations, categories, and status. Partial matches supported.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Navigation and Filters */}
          <CalendarNavigation
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            viewType={viewType}
            setViewType={setViewType}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            toilets={allAssets}
          />

          {/* Modern Calendar Grid */}
          <div className="card overflow-hidden shadow-xl border-0 animate-fade-in">
            <div className="overflow-x-auto scrollbar-thin">
              <div className="min-w-[1400px]">
                {/* Enhanced Calendar Header */}
                <div
                  className={clsx(
                    "grid border-b-2 border-secondary-200 dark:border-secondary-600",
                    "bg-gradient-to-r from-secondary-50 via-white to-secondary-50",
                    "dark:from-secondary-800 dark:via-secondary-700 dark:to-secondary-800",
                    "h-16" // Fixed height for uniform header row
                  )}
                  style={{
                    gridTemplateColumns: `240px 100px 140px repeat(${timelineDates.length}, 1fr)`,
                    height: "64px", // Explicit height override for consistency
                    maxHeight: "64px", // Prevent expansion beyond set height
                  }}
                >
                  {/* Modern Fixed Column Headers */}
                  <div className="border-r border-secondary-200 dark:border-secondary-600 p-4 text-center h-full flex items-center justify-center overflow-hidden">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-secondary-900 dark:text-secondary-100">Asset Details</span>
                    </div>
                  </div>
                  <div className="border-r border-secondary-200 dark:border-secondary-600 p-4 text-center h-full flex items-center justify-center overflow-hidden">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-success-500 to-orange-500"></div>
                      <span className="font-semibold text-secondary-900 dark:text-secondary-100">Status</span>
                    </div>
                  </div>
                  <div className="border-r border-secondary-200 dark:border-secondary-600 p-4 text-center h-full flex items-center justify-center overflow-hidden">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-secondary-900 dark:text-secondary-100">Category</span>
                    </div>
                  </div>

                  {/* Enhanced Date Headers */}
                  {timelineDates.map((date, index) => {
                    const isWeekend = getDay(date) === 0 || getDay(date) === 6;
                    const isCurrentDay = isToday(date);
                    const isFuture = isFutureDate(date);
                    
                    return (
                      <div
                        key={index}
                        className={clsx(
                          "border-r border-secondary-200 dark:border-secondary-600 p-3 text-center transition-all duration-200",
                          "hover:bg-secondary-100/50 dark:hover:bg-secondary-600/50 h-full flex flex-col justify-center overflow-hidden",
                          isWeekend && "bg-secondary-100/30 dark:bg-secondary-700/30",
                          isCurrentDay && "bg-gradient-to-br from-warning-100 to-warning-200 dark:from-warning-900/40 dark:to-warning-800/40 shadow-inner border-warning-300 dark:border-warning-600",
                          isFuture && "italic opacity-80" // Add italic styling for future dates
                        )}
                      >
                        <div className={clsx(
                          "text-base font-bold mb-1",
                          isCurrentDay ? "text-warning-800 dark:text-warning-200" : "text-secondary-900 dark:text-secondary-100",
                          isFuture && "italic" // Apply italic to date number
                        )}>
                          {format(date, "d")}
                        </div>
                        <div className={clsx(
                          "text-xs font-medium uppercase tracking-wide",
                          isCurrentDay ? "text-warning-700 dark:text-warning-300" : "text-secondary-600 dark:text-secondary-400",
                          isFuture && "italic" // Apply italic to day name
                        )}>
                          {format(date, viewType === VIEW_TYPES.DAY ? "EEEE" : "EEE")}
                        </div>
                        {viewType === VIEW_TYPES.DAY && (
                          <div className={clsx(
                            "text-xs mt-1",
                            isCurrentDay ? "text-warning-600 dark:text-warning-400" : "text-secondary-500 dark:text-secondary-500",
                            isFuture && "italic" // Apply italic to month
                          )}>
                            {format(date, "MMM")}
                          </div>
                        )}
                        {isCurrentDay && (
                          <div className="w-full h-0.5 bg-gradient-to-r from-warning-500 to-warning-600 rounded-full mt-2"></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Hierarchical Asset Rows */}
                <div className="max-h-[600px] overflow-y-auto">
                  {visibleRows.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-gray-500 dark:text-gray-400">
                      No assets found matching the current filters
                    </div>
                  ) : (
                    visibleRows.map((row, index) => {
                      if (row.type === 'product-header') {
                        return (
                          <ProductHeader
                            key={row.id}
                            productHeader={row}
                            dates={timelineDates}
                            onToggleExpand={handleToggleExpand}
                            totalBookings={bookings.filter(b =>
                              row.childAssets.some(asset => asset.id === b.assetId)
                            )}
                            availableCount={row.availableCount}
                            onHireCount={row.onHireCount}
                            allAssets={allAssets}
                            onShowItemsOnHire={handleShowItemsOnHire}
                            onBlueBoxContextMenu={handleBlueBoxContextMenu}
                            statusFilter={statusFilter}
                          />
                        );
                      } else {
                        return (
                          <AssetRow
                            key={row.id}
                            asset={row}
                            bookings={bookings}
                            dates={timelineDates}
                            onDropBooking={handleDropBooking}
                            onMoveBooking={handleMoveBooking}
                            onCreateBooking={handleCreateBooking}
                            onEditBooking={handleEditBooking}
                            onDeleteBooking={handleDeleteBooking}
                            onMoveAsset={handleMoveAsset}
                            onShowRentalDetails={handleShowRentalDetails}
                            onHirePeriodContextMenu={handleHirePeriodContextMenu}
                            index={index}
                            isDraggingAsset={isDraggingAsset}
                            allBookings={bookings}
                          />
                        );
                      }
                    })
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Enhanced Booking Dialog */}
          <BookingDialog
            visible={showBookingDialog}
            onHide={handleCloseBookingDialog}
            booking={editingBooking}
            assets={allAssets}
            onSave={handleSaveBooking}
          />

          {/* Rental Details Modal */}
          <RentalDetailsModal
            visible={showRentalDetailsModal}
            onHide={handleCloseRentalDetailsModal}
            asset={selectedRentalAsset}
          />

          {/* Items On Hire Modal */}
          <ItemsOnHireModal
            visible={showItemsOnHireModal}
            onHide={handleCloseItemsOnHireModal}
            date={selectedDate}
            assets={assets}
            allAssets={allAssets}
          />

          {/* Confirm Dialog for Deletions */}
          <ConfirmDialog />

          {/* PrimeReact Toast */}
          <Toast ref={toast} />

          {/* PrimeReact Menu */}
          <Menu
            ref={menu}
            model={contextMenuItems}
            popup
            onHide={handleCloseContextMenu}
          />

        </div>
      </div>
    </DndProvider>
  );
}

