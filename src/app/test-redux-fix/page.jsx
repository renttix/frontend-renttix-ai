"use client";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSidebarOpen } from "@/store/uiSlice";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";

const TestReduxFix = () => {
  const dispatch = useDispatch();
  const [testValue, setTestValue] = React.useState(true);
  const [logs, setLogs] = React.useState([]);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  useEffect(() => {
    addLog("Component mounted - Testing Redux actions", "info");
  }, []);

  const testReduxAction = () => {
    try {
      addLog("Testing setSidebarOpen(true)...", "info");
      dispatch(setSidebarOpen(true));
      addLog("✅ setSidebarOpen(true) dispatched successfully", "success");
      
      setTimeout(() => {
        addLog("Testing setSidebarOpen(false)...", "info");
        dispatch(setSidebarOpen(false));
        addLog("✅ setSidebarOpen(false) dispatched successfully", "success");
      }, 1000);
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, "error");
    }
  };

  const handleToggleChange = (e) => {
    try {
      addLog(`Toggle changed - Event: ${JSON.stringify(e)}`, "info");
      addLog(`Toggle value: ${e.value}`, "info");
      setTestValue(e.value);
      dispatch(setSidebarOpen(e.value));
      addLog("✅ Toggle dispatch successful", "success");
    } catch (error) {
      addLog(`❌ Toggle error: ${error.message}`, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Redux Toggle Fix Test</h1>
        
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <span>Test Toggle (PrimeReact InputSwitch)</span>
              <InputSwitch
                checked={testValue}
                onChange={handleToggleChange}
              />
            </div>
            
            <Button
              label="Test Redux Action Directly"
              onClick={testReduxAction}
              severity="primary"
              className="w-full"
            />
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No activity yet...</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm font-mono ${
                    log.type === "error"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : log.type === "success"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  [{log.timestamp}] {log.message}
                </div>
              ))
            )}
          </div>
        </Card>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded">
          <p className="text-sm">
            <strong>Note:</strong> This page tests the Redux action dispatch without authentication.
            If you see any "Actions must be plain objects" errors, they will appear in the log above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestReduxFix;