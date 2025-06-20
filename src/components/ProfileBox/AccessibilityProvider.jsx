"use client";
import { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";

const AccessibilityProvider = ({ children }) => {
  const { user } = useSelector((state) => state?.authReducer);
  const lastPreferencesRef = useRef(null);
  
  // Use useMemo to ensure preferences updates trigger re-renders
  const preferences = useMemo(() => {
    return user?.preferences || {};
  }, [user?.preferences]);

  // Debug logging
  console.log("🔍 AccessibilityProvider - Full user object:", user);
  console.log("🔍 AccessibilityProvider - User preferences object:", user?.preferences);
  console.log("🔍 AccessibilityProvider - User ID:", user?._id);

  // Apply accessibility settings
  const applyAccessibilitySettings = (prefs) => {
    console.log("🎨 Applying accessibility settings:", prefs);
    const root = document.documentElement;
    
    // Font Size
    switch (prefs.fontSize) {
      case "small":
        root.style.fontSize = "14px";
        console.log("📏 Applied small font size: 14px");
        break;
      case "large":
        root.style.fontSize = "18px";
        console.log("📏 Applied large font size: 18px");
        break;
      case "extra-large":
        root.style.fontSize = "20px";
        console.log("📏 Applied extra-large font size: 20px");
        break;
      default:
        root.style.fontSize = "16px";
        console.log("📏 Applied default font size: 16px");
    }

    // High Contrast
    if (prefs.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Reduce Motion
    if (prefs.reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Color Blind Mode
    root.setAttribute("data-color-blind-mode", prefs.colorBlindMode || "none");

    // Text Spacing
    switch (prefs.textSpacing) {
      case "compact":
        root.style.setProperty("--text-spacing", "0.9");
        break;
      case "relaxed":
        root.style.setProperty("--text-spacing", "1.2");
        break;
      case "loose":
        root.style.setProperty("--text-spacing", "1.5");
        break;
      default:
        root.style.setProperty("--text-spacing", "1");
    }

    // Cursor Size
    switch (prefs.cursorSize) {
      case "large":
        root.classList.add("large-cursor");
        break;
      case "extra-large":
        root.classList.add("extra-large-cursor");
        break;
      default:
        root.classList.remove("large-cursor", "extra-large-cursor");
    }

    // Focus Indicators
    if (prefs.focusIndicators) {
      root.classList.add("enhanced-focus");
    } else {
      root.classList.remove("enhanced-focus");
    }

    // Screen Reader Optimization
    if (prefs.screenReaderOptimized) {
      root.setAttribute("data-screen-reader", "true");
    } else {
      root.removeAttribute("data-screen-reader");
    }

    // Keyboard Navigation
    if (prefs.keyboardNavigation) {
      root.setAttribute("data-keyboard-nav", "true");
    } else {
      root.removeAttribute("data-keyboard-nav");
    }
  };

  useEffect(() => {
    console.log("🎨 AccessibilityProvider - Current user preferences:", preferences);
    console.log("🎨 Font size setting:", preferences.fontSize);
    console.log("🎨 High contrast setting:", preferences.highContrast);
    console.log("🎨 Text spacing setting:", preferences.textSpacing);
    console.log("🎨 AccessibilityProvider useEffect triggered with preferences:", JSON.stringify(preferences));
    
    // Early return if no user
    if (!user?._id) {
      console.log("⚠️ AccessibilityProvider - No user found, skipping preference application");
      return;
    }
    
    // Check if preferences have actually changed
    const prefsString = JSON.stringify(preferences);
    if (lastPreferencesRef.current === prefsString) {
      console.log("⚠️ AccessibilityProvider - Preferences unchanged, skipping application");
      return;
    }
    
    lastPreferencesRef.current = prefsString;
    applyAccessibilitySettings(preferences);
    
  }, [preferences, user?._id]); // Dependencies

  return children;
};

export default AccessibilityProvider;