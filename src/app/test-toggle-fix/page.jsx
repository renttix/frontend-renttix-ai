"use client";
import React, { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { useSelector, useDispatch } from "react-redux";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Divider } from "primereact/divider";
import { setSidebarOpen } from "@/store/uiSlice";

const TestToggleFix = () => {
  const { user } = useSelector((state) => state?.authReducer);
  const isSidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const dispatch = useDispatch();
  const [testLog, setTestLog] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
  };

  const testSidebarToggle = () => {
    const newState = !isSidebarOpen;
    addLog(`Testing sidebar toggle: ${isSidebarOpen} -> ${newState}`);
    dispatch(setSidebarOpen(newState));
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Toggle Functionality Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current State Card */}
          <Card title="Current State" className="shadow-lg">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">Sidebar Visibility (Redux)</span>
                <Badge 
                  value={isSidebarOpen ? "VISIBLE" : "HIDDEN"} 
                  severity={isSidebarOpen ? "success" : "danger"}
                />
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">User Preference (showSidebar)</span>
                <Badge 
                  value={user?.preferences?.showSidebar ? "TRUE" : "FALSE"} 
                  severity={user?.preferences?.showSidebar ? "success" : "danger"}
                />
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">Email Notifications</span>
                <Badge 
                  value={user?.preferences?.emailNotifications ? "ON" : "OFF"} 
                  severity={user?.preferences?.emailNotifications ? "success" : "warning"}
                />
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium">Compact View</span>
                <Badge 
                  value={user?.preferences?.compactView ? "ON" : "OFF"} 
                  severity={user?.preferences?.compactView ? "info" : "warning"}
                />
              </div>
            </div>
          </Card>
          
          {/* Test Actions Card */}
          <Card title="Test Actions" className="shadow-lg">
            <div className="space-y-4">
              <Button 
                label="Toggle Sidebar (Redux)" 
                icon="pi pi-bars"
                onClick={testSidebarToggle}
                className="w-full"
                severity="primary"
              />
              
              <Button 
                label="Go to Profile Page" 
                icon="pi pi-user"
                onClick={() => window.location.href = '/profile'}
                className="w-full"
                severity="secondary"
              />
              
              <Divider />
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check the current state above</li>
                  <li>Go to Profile page and toggle preferences</li>
                  <li>Save changes and return here</li>
                  <li>Verify that states are synchronized</li>
                </ol>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Activity Log */}
        <Card title="Activity Log" className="shadow-lg mt-6">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testLog.length === 0 ? (
              <p className="text-gray-500">No activity yet...</p>
            ) : (
              testLog.map((log, index) => (
                <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </Card>
        
        {/* Debug Info */}
        <Card title="Debug Information" className="shadow-lg mt-6">
          <pre className="text-xs overflow-x-auto bg-gray-100 dark:bg-gray-900 p-4 rounded">
            {JSON.stringify({
              userId: user?._id,
              preferences: user?.preferences,
              reduxUIState: {
                sidebarOpen: isSidebarOpen
              }
            }, null, 2)}
          </pre>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default TestToggleFix;