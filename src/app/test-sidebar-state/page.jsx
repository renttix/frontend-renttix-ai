"use client";
import React, { useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { useSelector, useDispatch } from "react-redux";
import { setSidebarOpen } from "@/store/uiSlice";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

export default function TestSidebarState() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer.user);
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  
  // Log state changes
  useEffect(() => {
    console.log("🔍 [TestSidebarState] Current state:", {
      reduxSidebarOpen: sidebarOpen,
      userPreference: user?.preferences?.showSidebar,
      timestamp: new Date().toISOString()
    });
  }, [sidebarOpen, user?.preferences?.showSidebar]);

  const handleToggleSidebar = () => {
    const newState = !sidebarOpen;
    console.log("🔄 [TestSidebarState] Toggling sidebar to:", newState);
    dispatch(setSidebarOpen(newState));
  };

  const handleClearPersistedState = () => {
    console.log("🗑️ [TestSidebarState] Clearing persisted state...");
    localStorage.removeItem('persist:root');
    window.location.reload();
  };

  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Sidebar State Debugging</h1>
        
        <Card className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium">Redux Sidebar State:</span>
              <span className={`font-bold ${sidebarOpen ? 'text-green-600' : 'text-red-600'}`}>
                {sidebarOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium">User Preference (showSidebar):</span>
              <span className={`font-bold ${user?.preferences?.showSidebar ? 'text-green-600' : 'text-red-600'}`}>
                {user?.preferences?.showSidebar === undefined 
                  ? 'NOT SET' 
                  : user?.preferences?.showSidebar ? 'TRUE' : 'FALSE'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <span className="font-medium">User ID:</span>
              <span className="font-mono text-sm">{user?._id || 'NOT LOADED'}</span>
            </div>
          </div>
        </Card>

        <Card className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            <Button 
              label={`Toggle Sidebar (Set to ${!sidebarOpen})`}
              onClick={handleToggleSidebar}
              className="w-full"
              severity={sidebarOpen ? "danger" : "success"}
            />
            
            <Button 
              label="Clear Persisted State & Reload"
              onClick={handleClearPersistedState}
              className="w-full"
              severity="warning"
            />
            
            <Button 
              label="Go to User Preferences"
              onClick={() => window.location.href = '/profile'}
              className="w-full"
              severity="info"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-auto">
            <pre>{JSON.stringify({
              redux: {
                sidebarOpen,
                uiState: useSelector((state) => state.ui)
              },
              user: {
                id: user?._id,
                preferences: user?.preferences,
                hasPreferences: !!user?.preferences
              },
              localStorage: {
                hasPersistedRoot: !!localStorage.getItem('persist:root')
              }
            }, null, 2)}</pre>
          </div>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Expected Behavior:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Redux sidebar state should match user preference after login</li>
            <li>Sidebar state should persist across page refreshes</li>
            <li>Changes in user preferences should immediately update the sidebar</li>
            <li>No flickering or unexpected collapses should occur</li>
          </ul>
        </div>
      </div>
    </DefaultLayout>
  );
}