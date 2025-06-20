"use client";
import React, { useState, ReactNode, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useSelector, useDispatch } from "react-redux";
import apiServices from "../../../services/apiService";
import { setUpdateUser } from "@/store/authSlice";
import { setSidebarOpen } from "@/store/uiSlice";
import { useRouter } from "next/navigation";

export default function DefaultLayout({ children }) {
  const [sidebarOpen, setLocalSidebarOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state?.authReducer);

  // Get sidebar state from Redux UI slice
  const isSideBarOpen = useSelector((state) => state.ui.sidebarOpen);

  // Track if initial sync has been done
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  // Debug logging for sidebar state
  useEffect(() => {
    console.log("🔍 [DefaultLayout] Current states:", {
      reduxSidebarOpen: isSideBarOpen,
      userPreference: user?.preferences?.showSidebar,
      localSidebarOpen: sidebarOpen,
      hasUserData: !!user?._id,
      timestamp: new Date().toISOString()
    });
  }, [isSideBarOpen, user?.preferences?.showSidebar, sidebarOpen, user?._id]);

  // Sync sidebar visibility with user preference - only on initial load or preference change
  useEffect(() => {
    console.log("🔄 [DefaultLayout] Preference sync effect triggered");
    console.log("  - User preference value:", user?.preferences?.showSidebar);
    console.log("  - Current Redux state:", isSideBarOpen);
    console.log("  - Initial sync done:", initialSyncDone);

    if (user?.preferences?.showSidebar !== undefined) {
      // Only sync if this is the first time or if the preference actually changed
      if (!initialSyncDone || user.preferences.showSidebar !== isSideBarOpen) {
        console.log("🔄 [DefaultLayout] Syncing sidebar visibility with user preference:", user.preferences.showSidebar);
        dispatch(setSidebarOpen(user.preferences.showSidebar));
        setInitialSyncDone(true);
        console.log("✅ [DefaultLayout] Dispatched setSidebarOpen with:", user.preferences.showSidebar);
      }
    } else {
      console.log("⚠️ [DefaultLayout] User preferences not loaded yet or showSidebar is undefined");
    }
  }, [user?.preferences?.showSidebar, dispatch, isSideBarOpen, initialSyncDone]);

  // Fetch user data if not available
  useEffect(() => {
    console.log("🔍 [DefaultLayout] User data effect triggered, user ID:", user?._id);
    
    if (!user?._id) {
      console.log("⚠️ [DefaultLayout] No user ID, redirecting to login");
      // Get the company from the current URL or use a default
      const pathSegments = window.location.pathname.split('/');
      const company = pathSegments[1] || 'default';
      router.push(`/${company}/login`);
      return;
    }

    const fetchUserData = async () => {
      try {
        console.log("📡 [DefaultLayout] Fetching user profile data...");
        const res = await apiServices.get("/auth/profile");
        
        console.log("✅ [DefaultLayout] User profile fetched:", {
          success: res.data?.success,
          hasUser: !!res.data?.data?.user,
          hasPreferences: !!res.data?.data?.user?.preferences,
          showSidebar: res.data?.data?.user?.preferences?.showSidebar,
          status: res.data?.data?.user?.status
        });

        if (res.data?.success && res.data?.data?.user) {
          dispatch(setUpdateUser(res.data?.data?.user));

          // Force sync sidebar state after user data is loaded
          if (res.data?.data?.user?.preferences?.showSidebar !== undefined) {
            console.log("🔄 [DefaultLayout] Force syncing sidebar after profile fetch:", res.data?.data?.user?.preferences?.showSidebar);
            dispatch(setSidebarOpen(res.data?.data?.user?.preferences?.showSidebar));
          }
        }
      } catch (error) {
        console.error("❌ [DefaultLayout] Error fetching user profile:", error);
      }
    };

    fetchUserData();
  }, [user?._id, dispatch]); // Added dispatch to dependencies

  // DIAGNOSTIC: Log sidebar rendering decision
  useEffect(() => {
    console.log("🔍 [DIAGNOSTIC] Sidebar Rendering Check:", {
      isSideBarOpen,
      willRenderSidebar: !!isSideBarOpen,
      sidebarComponentImported: !!Sidebar,
      headerComponentImported: !!Header,
      userId: user?._id,
      hasPreferences: !!user?.preferences
    });

    // Check if sidebar element exists in DOM
    setTimeout(() => {
      const sidebarElement = document.querySelector('aside');
      const sidebarContainer = document.querySelector('.flex.h-screen.overflow-hidden');
      console.log("🔍 [DIAGNOSTIC] DOM Check:", {
        sidebarElementExists: !!sidebarElement,
        sidebarElementDisplay: sidebarElement?.style?.display,
        sidebarElementClasses: sidebarElement?.className,
        containerExists: !!sidebarContainer,
        containerChildren: sidebarContainer?.children?.length
      });
    }, 100);
  }, [isSideBarOpen, user?._id]);

  return (
    <>
      {/* <!-- ===== Page Wrapper Star ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Star ===== --> */}
        {console.log("🔍 [RENDER] About to render sidebar, isSideBarOpen:", isSideBarOpen)}
        {isSideBarOpen && (
          <Sidebar
            className="transition duration-700 ease-in-out"
            sidebarOpen={isSideBarOpen}
            setSidebarOpen={(value) => {
              console.log("🔄 [DefaultLayout] Sidebar toggle requested:", value);
              dispatch(setSidebarOpen(value));
            }}
          />
        )}
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Star ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* <!-- ===== Header Star ===== --> */}
          <Header
            sidebarOpen={isSideBarOpen}
            setSidebarOpen={(value) => {
              console.log("🔄 [DefaultLayout] Header toggle requested:", value);
              dispatch(setSidebarOpen(value));
            }}
          />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Star ===== --> */}
          <main>
            {/* <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div> */}
            <div className="mx-auto p-4 md:p-6 2xl:p-10">{children}</div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </>
  );
}
