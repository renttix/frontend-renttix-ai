"use client";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";

const TestAccessibility = () => {
  const { user } = useSelector((state) => state?.authReducer);
  const [currentFontSize, setCurrentFontSize] = useState("");
  const [appliedClasses, setAppliedClasses] = useState([]);

  useEffect(() => {
    const checkAccessibilityStatus = () => {
      const root = document.documentElement;
      
      // Get current font size
      const fontSize = root.style.fontSize || "Not set";
      setCurrentFontSize(fontSize);
      
      // Get applied classes
      const classes = [];
      if (root.classList.contains("high-contrast")) classes.push("high-contrast");
      if (root.classList.contains("reduce-motion")) classes.push("reduce-motion");
      if (root.classList.contains("enhanced-focus")) classes.push("enhanced-focus");
      if (root.classList.contains("large-cursor")) classes.push("large-cursor");
      if (root.classList.contains("extra-large-cursor")) classes.push("extra-large-cursor");
      
      setAppliedClasses(classes);
      
      // Log to console
      console.log("🔍 Test Page - Current font size:", fontSize);
      console.log("🔍 Test Page - Applied classes:", classes);
      console.log("🔍 Test Page - User preferences:", user?.preferences);
      console.log("🔍 Test Page - Color blind mode:", root.getAttribute("data-color-blind-mode"));
      console.log("🔍 Test Page - Text spacing:", root.style.getPropertyValue("--text-spacing"));
    };
    
    // Check immediately
    checkAccessibilityStatus();
    
    // Check again after a delay
    const timer = setTimeout(checkAccessibilityStatus, 1000);
    
    return () => clearTimeout(timer);
  }, [user]);

  return (
    <DefaultLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Accessibility Settings Test Page</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">Font Size:</span>
              <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                {currentFontSize}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">Applied Classes:</span>
              <span className="font-mono text-sm">
                {appliedClasses.length > 0 ? appliedClasses.join(", ") : "None"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">User Font Preference:</span>
              <span className="font-mono text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                {user?.preferences?.fontSize || "Not set"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Preferences (from Redux)</h2>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(user?.preferences, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Text Sizes</h2>
          <div className="space-y-3">
            <p className="text-sm">This is small text (should scale with font size setting)</p>
            <p className="text-base">This is base text (should scale with font size setting)</p>
            <p className="text-lg">This is large text (should scale with font size setting)</p>
            <p className="text-xl">This is extra large text (should scale with font size setting)</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
            Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700 dark:text-yellow-300">
            <li>Open your browser console (F12)</li>
            <li>Navigate to your profile page</li>
            <li>Change the font size setting</li>
            <li>Save the changes</li>
            <li>Return to this page and check if the font size has changed</li>
            <li>The "Current Font Size" should match your selected preference</li>
          </ol>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default TestAccessibility;