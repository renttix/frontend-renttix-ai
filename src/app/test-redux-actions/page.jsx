"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarOpen } from "@/store/uiSlice";
import { setUpdateUser } from "@/store/authSlice";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

const TestReduxActions = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state?.authReducer);
  const { sidebarOpen } = useSelector((state) => state?.ui);

  const testActions = () => {
    console.log("Testing Redux actions...");
    
    // Test 1: Check if actions are defined
    console.log("setSidebarOpen defined?", typeof setSidebarOpen);
    console.log("setUpdateUser defined?", typeof setUpdateUser);
    
    // Test 2: Try dispatching setSidebarOpen
    try {
      console.log("Dispatching setSidebarOpen(true)");
      dispatch(setSidebarOpen(true));
      console.log("✅ setSidebarOpen(true) dispatched successfully");
    } catch (error) {
      console.error("❌ Error dispatching setSidebarOpen:", error);
    }
    
    // Test 3: Try dispatching setSidebarOpen with false
    try {
      console.log("Dispatching setSidebarOpen(false)");
      dispatch(setSidebarOpen(false));
      console.log("✅ setSidebarOpen(false) dispatched successfully");
    } catch (error) {
      console.error("❌ Error dispatching setSidebarOpen:", error);
    }
    
    // Test 4: Try dispatching with undefined (this should cause the error)
    try {
      console.log("Dispatching setSidebarOpen(undefined)");
      dispatch(setSidebarOpen(undefined));
      console.log("✅ setSidebarOpen(undefined) dispatched successfully");
    } catch (error) {
      console.error("❌ Error dispatching setSidebarOpen(undefined):", error);
    }
    
    // Test 5: Try dispatching undefined action
    try {
      console.log("Dispatching undefined action");
      dispatch(undefined);
      console.log("✅ undefined action dispatched successfully (this shouldn't happen)");
    } catch (error) {
      console.error("❌ Error dispatching undefined action:", error);
    }
  };

  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Redux Actions Test</h1>
        
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <div className="space-y-2">
            <p>Sidebar Open: <strong>{sidebarOpen ? "Yes" : "No"}</strong></p>
            <p>User ID: <strong>{user?._id || "Not logged in"}</strong></p>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <Button 
            label="Run Redux Action Tests" 
            onClick={testActions}
            severity="primary"
            className="w-full"
          />
          <p className="text-sm text-gray-600 mt-4">
            Check the browser console for detailed test results
          </p>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default TestReduxActions;