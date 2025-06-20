"use client";
import React, { useRef, useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./UserPreferencesElite.css";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { TabView, TabPanel } from "primereact/tabview";
import { ProgressBar } from "primereact/progressbar";
import { Badge } from "primereact/badge";
import { Divider } from "primereact/divider";
import { Password } from "primereact/password";
import { Timeline } from "primereact/timeline";
import { Chip } from "primereact/chip";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { BaseURL } from "../../../utils/baseUrl";
import apiServices from "../../../services/apiService";
import { useRouter } from "next/navigation";
import AvatarUpload from "./AvatarUpload";
import useColorMode from "@/hooks/useColorMode";
import { setUpdateUser } from "@/store/authSlice";
import { setSidebarOpen } from "@/store/uiSlice";
import {
  FiUser, FiSettings, FiBell, FiShield, FiActivity,
  FiMail, FiPhone, FiGlobe, FiCalendar,
  FiMonitor, FiSmartphone, FiMessageSquare, FiLock,
  FiCheck, FiInfo, FiSun, FiMoon, FiEye,
  FiTrendingUp, FiPackage, FiDollarSign, FiUsers
} from "react-icons/fi";

const UserPreferencesElite = () => {
  const toast = useRef();
  const { user } = useSelector((state) => state?.authReducer);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [colorMode, setColorMode] = useColorMode();
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeProducts: 0,
    totalRevenue: 0,
    customerCount: 0
  });

  // Theme options
  const themeOptions = [
    { label: "Light", value: "light", icon: <FiSun /> },
    { label: "Dark", value: "dark", icon: <FiMoon /> },
    { label: "System", value: "system", icon: <FiMonitor /> }
  ];

  // Language options
  const languageOptions = [
    { label: "English", value: "en", flag: "🇬🇧" },
    { label: "Spanish", value: "es", flag: "🇪🇸" },
    { label: "French", value: "fr", flag: "🇫🇷" },
    { label: "German", value: "de", flag: "🇩🇪" },
    { label: "Italian", value: "it", flag: "🇮🇹" },
    { label: "Portuguese", value: "pt", flag: "🇵🇹" },
    { label: "Chinese", value: "zh", flag: "🇨🇳" },
    { label: "Japanese", value: "ja", flag: "🇯🇵" },
    { label: "Arabic", value: "ar", flag: "🇸🇦" }
  ];

  // Time zone options
  const timeZoneOptions = [
    { label: "UTC", value: "UTC" },
    { label: "Eastern Time (US & Canada)", value: "America/New_York" },
    { label: "Central Time (US & Canada)", value: "America/Chicago" },
    { label: "Mountain Time (US & Canada)", value: "America/Denver" },
    { label: "Pacific Time (US & Canada)", value: "America/Los_Angeles" },
    { label: "London", value: "Europe/London" },
    { label: "Paris", value: "Europe/Paris" },
    { label: "Berlin", value: "Europe/Berlin" },
    { label: "Moscow", value: "Europe/Moscow" },
    { label: "Dubai", value: "Asia/Dubai" },
    { label: "Mumbai", value: "Asia/Kolkata" },
    { label: "Singapore", value: "Asia/Singapore" },
    { label: "Hong Kong", value: "Asia/Hong_Kong" },
    { label: "Tokyo", value: "Asia/Tokyo" },
    { label: "Sydney", value: "Australia/Sydney" }
  ];

  // Date format options
  const dateFormatOptions = [
    { label: "MM/DD/YYYY", value: "MM/DD/YYYY", example: "12/31/2024" },
    { label: "DD/MM/YYYY", value: "DD/MM/YYYY", example: "31/12/2024" },
    { label: "YYYY-MM-DD", value: "YYYY-MM-DD", example: "2024-12-31" },
    { label: "DD-MM-YYYY", value: "DD-MM-YYYY", example: "31-12-2024" }
  ];

  useEffect(() => {
    fetchUserData();
    fetchRecentActivity();
    fetchUserStats();
  }, [user]);

  const fetchUserData = async () => {
    if (!user?._id) return;
    try {
      const res = await apiServices.get(
        `/vender/profile-completion/${user?._id}`
      );
      if (res?.data.success) {
        setProfileCompleted(res?.data?.completionPercentage);
      }
    } catch (error) {
      console.error("Error fetching profile completion:", error);
    }
  };

  const fetchRecentActivity = async () => {
    setRecentActivity([
      { 
        date: new Date().toISOString(), 
        action: "Profile updated", 
        icon: <FiUser />,
        color: "#10b981"
      },
      { 
        date: new Date(Date.now() - 86400000).toISOString(), 
        action: "Password changed", 
        icon: <FiLock />,
        color: "#f59e0b"
      },
      { 
        date: new Date(Date.now() - 172800000).toISOString(), 
        action: "Email notifications enabled", 
        icon: <FiBell />,
        color: "#3b82f6"
      },
      { 
        date: new Date(Date.now() - 259200000).toISOString(), 
        action: "Theme changed to dark", 
        icon: <FiMoon />,
        color: "#8b5cf6"
      }
    ]);
  };

  const fetchUserStats = async () => {
    setStats({
      totalOrders: 156,
      activeProducts: 42,
      totalRevenue: 125430,
      customerCount: 89
    });
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string(),
    currentPassword: Yup.string(),
    newPassword: Yup.string()
      .when('currentPassword', {
        is: (val) => val && val.length > 0,
        then: (schema) => schema.required('New password is required when changing password')
          .min(8, 'Password must be at least 8 characters')
      }),
    confirmPassword: Yup.string()
      .when('newPassword', {
        is: (val) => val && val.length > 0,
        then: (schema) => schema.required('Please confirm your new password')
          .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      })
  });

  const handleSubmit = async (values, { setValues }) => {
    setLoading(true);
    console.log("🔍 Submitting preferences:", values);
    console.log("🔍 Accessibility settings being sent:", {
      fontSize: values.fontSize,
      highContrast: values.highContrast,
      textSpacing: values.textSpacing,
      colorBlindMode: values.colorBlindMode,
      reduceMotion: values.reduceMotion,
      cursorSize: values.cursorSize,
      screenReaderOptimized: values.screenReaderOptimized,
      keyboardNavigation: values.keyboardNavigation,
      focusIndicators: values.focusIndicators
    });
    
    try {
      if (values.theme !== colorMode) {
        setColorMode(values.theme);
      }

      const response = await apiServices.put(
        `/users/preferences/${user?._id}`,
        values
      );
      
      console.log("✅ Response from server:", response.data);
      console.log("✅ Updated user preferences:", response.data.data?.user?.preferences);
      
      // Update the user data in Redux store
      if (response.data.success && response.data.data.user) {
        console.log("🔄 Dispatching setUpdateUser with:", response.data.data.user);
        console.log("🔄 User preferences being dispatched:", response.data.data.user.preferences);
        
        try {
          dispatch(setUpdateUser(response.data.data.user));
          console.log("✅ setUpdateUser dispatched successfully");
        } catch (error) {
          console.error("❌ Error dispatching setUpdateUser:", error);
        }
        
        // Update UI state for sidebar visibility
        if (response.data.data.user.preferences.showSidebar !== undefined) {
          console.log("🔄 Updating sidebar visibility in UI state:", response.data.data.user.preferences.showSidebar);
          
          try {
            dispatch(setSidebarOpen(response.data.data.user.preferences.showSidebar));
            console.log("✅ setSidebarOpen dispatched successfully");
          } catch (error) {
            console.error("❌ Error dispatching setSidebarOpen:", error);
          }
        }
        
        // Update form values to reflect the new state
        const updatedPreferences = response.data.data.user.preferences;
        setValues({
          ...values,
          ...updatedPreferences,
          firstName: response.data.data.user.firstName || values.firstName,
          lastName: response.data.data.user.lastName || values.lastName,
          email: response.data.data.user.email || values.email,
          phone: response.data.data.user.phone || values.phone,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        // Also manually trigger accessibility update as a fallback
        const root = document.documentElement;
        const fontSize = response.data.data.user.preferences.fontSize;
        switch (fontSize) {
          case "small":
            root.style.fontSize = "14px";
            break;
          case "large":
            root.style.fontSize = "18px";
            break;
          case "extra-large":
            root.style.fontSize = "20px";
            break;
          default:
            root.style.fontSize = "16px";
        }
        console.log("🔄 Manually applied font size:", fontSize, "->", root.style.fontSize);
      }
      
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Your preferences have been updated successfully",
        life: 3000,
      });

      // Refresh user data to ensure consistency
      await fetchUserData();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to update preferences",
        life: 3000,
      });
      console.error("❌ Error updating preferences:", error);
      console.error("❌ Error response:", error.response?.data);
    }
  };

  const handleThemeChange = (value, setFieldValue) => {
    setFieldValue("theme", value);
    setColorMode(value);
  };

  const profileHeader = (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white mb-8 shadow-2xl" role="banner" aria-label="Profile Header">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl -ml-32 -mb-32"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative">
              <AvatarUpload completionPercentage={profileCompleted} />
            </div>
            {/* Tooltip hint */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Click to change your avatar
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">Profile Completion</span>
            <Badge
              value={`${profileCompleted}%`}
              severity={profileCompleted >= 80 ? "success" : profileCompleted >= 50 ? "warning" : "danger"}
              className="font-bold"
            />
          </div>
        </div>
        
        {/* User Info Section */}
        <div className="text-center lg:text-left flex-1 space-y-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-xl text-gray-300 mb-1">{user?.email}</p>
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <Chip
                label={user?.role || "Vendor"}
                className="bg-primary/20 text-primary-light border border-primary/30"
              />
              <Chip
                label={user?.status || "Active"}
                className="bg-green-500/20 text-green-300 border border-green-500/30"
                icon="pi pi-check-circle"
              />
            </div>
          </div>
          
          <div className="max-w-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-400">Profile Strength</span>
              <span className="text-sm font-bold text-gray-300">{profileCompleted}%</span>
            </div>
            <ProgressBar
              value={profileCompleted}
              className="h-3"
              color={profileCompleted >= 80 ? "#10b981" : profileCompleted >= 50 ? "#f59e0b" : "#ef4444"}
              showValue={false}
            />
            {profileCompleted < 100 && (
              <p className="text-xs text-gray-400 mt-2">
                Complete your profile to unlock all features
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const activityTemplate = (item) => {
    return (
      <div className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <div 
          className="p-2 rounded-full"
          style={{ backgroundColor: `${item.color}20`, color: item.color }}
        >
          {item.icon}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{item.action}</p>
          <p className="text-xs text-gray-500">
            {new Date(item.date).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 lg:p-8" role="main" aria-label="User Profile and Preferences">
        <Toast ref={toast} position="top-right" role="status" aria-live="polite" />
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile & Preferences</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your personal information and customize your experience</p>
        </div>
        
        {profileHeader}

      <Formik
        initialValues={{
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          phone: user?.phone || "",
          theme: user?.preferences?.theme || colorMode || "light",
          language: user?.preferences?.language || "en",
          timeZone: user?.preferences?.timeZone || "UTC",
          dateFormat: user?.preferences?.dateFormat || "MM/DD/YYYY",
          emailNotifications: user?.preferences?.emailNotifications ?? true,
          pushNotifications: user?.preferences?.pushNotifications ?? true,
          smsNotifications: user?.preferences?.smsNotifications ?? false,
          compactView: user?.preferences?.compactView ?? false,
          showSidebar: user?.preferences?.showSidebar ?? true,
          itemsPerPage: user?.preferences?.itemsPerPage || 10,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          twoFactorEnabled: user?.preferences?.twoFactorEnabled ?? false,
          
          // Accessibility Settings
          fontSize: user?.preferences?.fontSize || "medium",
          highContrast: user?.preferences?.highContrast ?? false,
          reduceMotion: user?.preferences?.reduceMotion ?? false,
          screenReaderOptimized: user?.preferences?.screenReaderOptimized ?? false,
          keyboardNavigation: user?.preferences?.keyboardNavigation ?? true,
          focusIndicators: user?.preferences?.focusIndicators ?? true,
          colorBlindMode: user?.preferences?.colorBlindMode || "none",
          textSpacing: user?.preferences?.textSpacing || "normal",
          cursorSize: user?.preferences?.cursorSize || "normal"
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, handleChange, setFieldValue, errors, touched }) => (
          <Form>
            <div className="mt-8">
              <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                className="elite-tabs bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              >
                <TabPanel
                  header={
                    <span className="flex items-center gap-2">
                      <FiUser aria-hidden="true" /> Personal Info
                    </span>
                  }
                  aria-label="Personal Information Tab"
                >
                  <Card className="border-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                          First Name <span className="text-red-500" aria-label="required">*</span>
                        </label>
                        <span className="p-input-icon-left w-full">
                          <FiUser className="text-gray-400" />
                          <InputText
                            id="firstName"
                            name="firstName"
                            value={values.firstName}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                            className={`w-full ${errors.firstName && touched.firstName ? 'p-invalid' : ''}`}
                            aria-required="true"
                            aria-invalid={errors.firstName && touched.firstName}
                            aria-describedby={errors.firstName && touched.firstName ? "firstName-error" : undefined}
                          />
                        </span>
                        <ErrorMessage name="firstName" component="small" className="p-error" id="firstName-error" role="alert" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <span className="p-input-icon-left w-full">
                          <FiUser className="text-gray-400" />
                          <InputText
                            name="lastName"
                            value={values.lastName}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                            className={`w-full ${errors.lastName && touched.lastName ? 'p-invalid' : ''}`}
                          />
                        </span>
                        <ErrorMessage name="lastName" component="small" className="p-error" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <span className="p-input-icon-left w-full">
                          <FiMail className="text-gray-400" />
                          <InputText
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            disabled
                            className="w-full"
                          />
                        </span>
                        <small className="text-gray-500">Email cannot be changed</small>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone Number
                        </label>
                        <span className="p-input-icon-left w-full">
                          <FiPhone className="text-gray-400" />
                          <InputText
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            className="w-full"
                          />
                        </span>
                      </div>
                    </div>
                  </Card>
                </TabPanel>

                <TabPanel 
                  header={
                    <span className="flex items-center gap-2">
                      <FiSettings /> Display Preferences
                    </span>
                  }
                >
                  <Card className="border-0">
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <FiMonitor /> Theme Preference
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {themeOptions.map((option) => (
                            <div
                              key={option.value}
                              className={`
                                relative cursor-pointer rounded-lg p-4 text-center transition-all
                                ${values.theme === option.value 
                                  ? 'bg-primary text-white shadow-lg' 
                                  : 'bg-white dark:bg-gray-800 hover:shadow-md'
                                }
                              `}
                              onClick={() => handleThemeChange(option.value, setFieldValue)}
                            >
                              <div className="text-3xl mb-2 flex justify-center">
                                {option.icon}
                              </div>
                              <p className="font-medium">{option.label}</p>
                              {values.theme === option.value && (
                                <div className="absolute top-2 right-2">
                                  <FiCheck className="text-xl" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                          <FiInfo className="inline mr-1" />
                          Theme changes are applied immediately
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <FiGlobe className="inline mr-2" />
                            Language
                          </label>
                          <Dropdown
                            value={values.language}
                            options={languageOptions}
                            onChange={(e) => setFieldValue("language", e.value)}
                            placeholder="Select Language"
                            className="w-full"
                            itemTemplate={(option) => (
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{option.flag}</span>
                                <span>{option.label}</span>
                              </div>
                            )}
                            valueTemplate={(option) => option ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{option.flag}</span>
                                <span>{option.label}</span>
                              </div>
                            ) : "Select Language"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <FiGlobe className="inline mr-2" />
                            Time Zone
                          </label>
                          <Dropdown
                            value={values.timeZone}
                            options={timeZoneOptions}
                            onChange={(e) => setFieldValue("timeZone", e.value)}
                            placeholder="Select Time Zone"
                            className="w-full"
                            filter
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            <FiCalendar className="inline mr-2" />
                            Date Format
                          </label>
                          <Dropdown
                            value={values.dateFormat}
                            options={dateFormatOptions}
                            onChange={(e) => setFieldValue("dateFormat", e.value)}
                            placeholder="Select Date Format"
                            className="w-full"
                            itemTemplate={(option) => (
                              <div>
                                <span className="font-medium">{option.label}</span>
                                <span className="text-sm text-gray-500 ml-2">({option.example})</span>
                              </div>
                            )}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Items Per Page
                          </label>
                          <Dropdown
                            value={values.itemsPerPage}
                            options={[10, 20, 30, 50, 100].map(n => ({ label: n, value: n }))}
                            onChange={(e) => setFieldValue("itemsPerPage", e.value)}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <Divider />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-medium">Compact View</h4>
                            <p className="text-sm text-gray-500">Show more content in less space</p>
                          </div>
                          <InputSwitch
                            checked={values.compactView}
                            onChange={(e) => {
                              console.log("🔄 Compact View toggled:", e.value);
                              setFieldValue("compactView", e.value);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-medium">Show Sidebar</h4>
                            <p className="text-sm text-gray-500">Toggle navigation sidebar visibility</p>
                          </div>
                          <InputSwitch
                            checked={values.showSidebar}
                            onChange={(e) => {
                              try {
                                // PrimeReact InputSwitch passes the value directly in e.value
                                console.log("🔄 Show Sidebar onChange event:", e);
                                const newValue = e.value;
                                console.log("🔄 Show Sidebar toggled to:", newValue);
                                
                                // Update Formik field
                                setFieldValue("showSidebar", newValue);
                                
                                // Check if action and dispatch are available
                                if (!setSidebarOpen) {
                                  console.error("❌ setSidebarOpen action is not defined!");
                                  return;
                                }
                                
                                if (!dispatch) {
                                  console.error("❌ dispatch function is not defined!");
                                  return;
                                }
                                
                                // Dispatch the action
                                console.log("🔄 Dispatching setSidebarOpen with value:", newValue);
                                dispatch(setSidebarOpen(newValue));
                                console.log("✅ setSidebarOpen dispatched successfully");
                              } catch (error) {
                                console.error("❌ Error in Show Sidebar onChange:", error);
                                console.error("Error stack:", error.stack);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabPanel>

                <TabPanel 
                  header={
                    <span className="flex items-center gap-2">
                      <FiBell /> Notifications
                    </span>
                  }
                >
                  <Card className="border-0">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-500 text-white rounded-full">
                            <FiMail className="text-2xl" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Email Notifications</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Receive important updates via email
                            </p>
                          </div>
                        </div>
                        <InputSwitch
                          checked={values.emailNotifications}
                          onChange={(e) => {
                            console.log("🔄 Email Notifications toggled:", e.value);
                            setFieldValue("emailNotifications", e.value);
                          }}
                          className="scale-125"
                        />
                      </div>

                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-500 text-white rounded-full">
                            <FiSmartphone className="text-2xl" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Push Notifications</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Get instant alerts in your browser
                            </p>
                          </div>
                        </div>
                        <InputSwitch
                          checked={values.pushNotifications}
                          onChange={(e) => {
                            console.log("🔄 Push Notifications toggled:", e.value);
                            setFieldValue("pushNotifications", e.value);
                          }}
                          className="scale-125"
                        />
                      </div>

                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-purple-500 text-white rounded-full">
                            <FiMessageSquare className="text-2xl" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">SMS Notifications</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Receive text messages for critical alerts
                            </p>
                          </div>
                        </div>
                        <InputSwitch
                          checked={values.smsNotifications}
                          onChange={(e) => {
                            console.log("🔄 SMS Notifications toggled:", e.value);
                            setFieldValue("smsNotifications", e.value);
                          }}
                          className="scale-125"
                        />
                      </div>
                    </div>
                  </Card>
                </TabPanel>

                <TabPanel 
                  header={
                    <span className="flex items-center gap-2">
                      <FiShield /> Security
                    </span>
                  }
                >
                  <Card className="border-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Current Password
                            </label>
                            <Password
                              name="currentPassword"
                              value={values.currentPassword}
                              onChange={handleChange}
                              placeholder="Enter current password"
                              toggleMask
                              className="w-full"
                              inputClassName="w-full"
                              feedback={false}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              New Password
                            </label>
                            <Password
                              name="newPassword"
                              value={values.newPassword}
                              onChange={handleChange}
                              placeholder="Enter new password"
                              toggleMask
                              className="w-full"
                              inputClassName="w-full"
                            />
                            <ErrorMessage name="newPassword" component="small" className="p-error" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Confirm Password
                            </label>
                            <Password
                              name="confirmPassword"
                              value={values.confirmPassword}
                              onChange={handleChange}
                              placeholder="Confirm new password"
                              toggleMask
                              className="w-full"
                              inputClassName="w-full"
                              feedback={false}
                            />
                            <ErrorMessage name="confirmPassword" component="small" className="p-error" />
                          </div>
                        </div>
                      </div>

                      <Divider />

                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-500 text-white rounded-full">
                            <FiShield className="text-2xl" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                        </div>
                        <InputSwitch
                          checked={values.twoFactorEnabled}
                          onChange={(e) => {
                            console.log("🔄 Two-Factor Authentication toggled:", e.value);
                            setFieldValue("twoFactorEnabled", e.value);
                          }}
                          className="scale-125"
                        />
                      </div>
                    </div>
                  </Card>
                </TabPanel>

                <TabPanel
                  header={
                    <span className="flex items-center gap-2">
                      <FiEye /> Accessibility
                    </span>
                  }
                >
                  <Card className="border-0">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" id="accessibility-heading">
                        <FiEye aria-hidden="true" /> Accessibility Options
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6" aria-describedby="accessibility-heading">
                        Customize your experience with these accessibility settings to make the application more comfortable and easier to use.
                      </p>
                      
                      {/* Font Size */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Font Size
                        </label>
                        <Dropdown
                          value={values.fontSize}
                          options={[
                            { label: "Small", value: "small" },
                            { label: "Medium (Default)", value: "medium" },
                            { label: "Large", value: "large" },
                            { label: "Extra Large", value: "extra-large" }
                          ]}
                          onChange={(e) => setFieldValue("fontSize", e.value)}
                          placeholder="Select Font Size"
                          className="w-full"
                        />
                      </div>

                      {/* Color Blind Mode */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Color Blind Mode
                        </label>
                        <Dropdown
                          value={values.colorBlindMode}
                          options={[
                            { label: "None", value: "none" },
                            { label: "Protanopia (Red-Green)", value: "protanopia" },
                            { label: "Deuteranopia (Red-Green)", value: "deuteranopia" },
                            { label: "Tritanopia (Blue-Yellow)", value: "tritanopia" },
                            { label: "Achromatopsia (Complete)", value: "achromatopsia" }
                          ]}
                          onChange={(e) => setFieldValue("colorBlindMode", e.value)}
                          placeholder="Select Color Blind Mode"
                          className="w-full"
                        />
                      </div>

                      {/* Text Spacing */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Text Spacing
                        </label>
                        <Dropdown
                          value={values.textSpacing}
                          options={[
                            { label: "Compact", value: "compact" },
                            { label: "Normal", value: "normal" },
                            { label: "Relaxed", value: "relaxed" },
                            { label: "Loose", value: "loose" }
                          ]}
                          onChange={(e) => setFieldValue("textSpacing", e.value)}
                          placeholder="Select Text Spacing"
                          className="w-full"
                        />
                      </div>

                      {/* Cursor Size */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Cursor Size
                        </label>
                        <Dropdown
                          value={values.cursorSize}
                          options={[
                            { label: "Normal", value: "normal" },
                            { label: "Large", value: "large" },
                            { label: "Extra Large", value: "extra-large" }
                          ]}
                          onChange={(e) => setFieldValue("cursorSize", e.value)}
                          placeholder="Select Cursor Size"
                          className="w-full"
                        />
                      </div>

                      <Divider />

                      {/* Toggle Options */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-medium">High Contrast Mode</h4>
                            <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
                          </div>
                          <InputSwitch
                            checked={values.highContrast}
                            onChange={(e) => {
                              console.log("🔄 High Contrast toggled:", e.value);
                              setFieldValue("highContrast", e.value);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-medium">Reduce Motion</h4>
                            <p className="text-sm text-gray-500">Minimize animations and transitions</p>
                          </div>
                          <InputSwitch
                            checked={values.reduceMotion}
                            onChange={(e) => {
                              console.log("🔄 Reduce Motion toggled:", e.value);
                              setFieldValue("reduceMotion", e.value);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-medium">Screen Reader Optimization</h4>
                            <p className="text-sm text-gray-500">Optimize interface for screen readers</p>
                          </div>
                          <InputSwitch
                            checked={values.screenReaderOptimized}
                            onChange={(e) => {
                              console.log("🔄 Screen Reader Optimization toggled:", e.value);
                              setFieldValue("screenReaderOptimized", e.value);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-medium">Enhanced Keyboard Navigation</h4>
                            <p className="text-sm text-gray-500">Enable advanced keyboard shortcuts</p>
                          </div>
                          <InputSwitch
                            checked={values.keyboardNavigation}
                            onChange={(e) => {
                              console.log("🔄 Keyboard Navigation toggled:", e.value);
                              setFieldValue("keyboardNavigation", e.value);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="font-medium">Focus Indicators</h4>
                            <p className="text-sm text-gray-500">Show clear focus indicators for navigation</p>
                          </div>
                          <InputSwitch
                            checked={values.focusIndicators}
                            onChange={(e) => {
                              console.log("🔄 Focus Indicators toggled:", e.value);
                              setFieldValue("focusIndicators", e.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <FiInfo className="inline mr-2" />
                          These accessibility settings will be applied across the entire application to improve your experience.
                        </p>
                      </div>
                    </div>
                  </Card>
                </TabPanel>

                <TabPanel
                  header={
                    <span className="flex items-center gap-2">
                      <FiActivity /> Activity
                    </span>
                  }
                >
                  <Card className="border-0">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <Timeline
                      value={recentActivity}
                      content={activityTemplate}
                      className="customized-timeline"
                    />
                  </Card>
                </TabPanel>
              </TabView>

              <div className="flex justify-end gap-4 mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <Button
                  label="Cancel"
                  severity="secondary"
                  onClick={() => router.back()}
                  className="px-6 py-3"
                />
                <Button
                  label="Save Changes"
                  type="submit"
                  loading={loading}
                  icon="pi pi-check"
                  aria-label="Save all profile changes"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  </div>
  );
};

export default UserPreferencesElite;