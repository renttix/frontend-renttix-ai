"use client";
import React, { useRef, useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useDispatch, useSelector } from "react-redux";
import { BaseURL } from "../../../utils/baseUrl";
import axios from "axios";
import CanceButton from "../Buttons/CanceButton";
import { useRouter } from "next/navigation";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import AvatarUpload from "./AvatarUpload";
import { ProgressBar } from "primereact/progressbar";

const UserPreferences = () => {
  const toast = useRef();
  const { user } = useSelector((state) => state?.authReducer);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(0);

  // Theme options
  const themeOptions = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" }
  ];

  // Language options
  const languageOptions = [
    { label: "English", value: "en" },
    { label: "Spanish", value: "es" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Italian", value: "it" },
    { label: "Portuguese", value: "pt" },
    { label: "Chinese", value: "zh" },
    { label: "Japanese", value: "ja" },
    { label: "Arabic", value: "ar" }
  ];

  // Time zone options (simplified list)
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
    { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
    { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
    { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
    { label: "DD-MM-YYYY", value: "DD-MM-YYYY" }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(
          `${BaseURL}/vender/profile-completion/${user?._id}`
        );
        if (res?.data.success) {
          setProfileCompleted(res?.data?.completionPercentage);
        }
      } catch (error) {
        console.error("Error fetching profile completion:", error);
      }
    };
    fetchUserData();
  }, [user]);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string(),
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${BaseURL}/users/preferences/${user?._id}`,
        values
      );
      
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "User preferences updated successfully",
        life: 3000,
      });

      // Update user state if needed
      // dispatch(setUpdateUser(response?.data?.data?.user));
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to update preferences",
        life: 3000,
      });
      console.error("Error updating preferences:", error);
    }
  };

  return (
    <div>
      <div className="flex gap-3">
        <GoPrevious route={`/dashboard`} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          Profile & Preferences
        </h2>
      </div>

      <Toast ref={toast} position="top-right" />
      <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

      {/* Profile Completion and Avatar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
        <div className="col-span-2 p-4"></div>
        <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
          <div className="text-center mb-3">
            <label htmlFor="" className="font-semibold text-dark-2 dark:text-white">
              Profile {profileCompleted}% completed!
            </label>
            <ProgressBar color="#f9791d" value={profileCompleted}></ProgressBar>
          </div>
          <div className="flex items-center justify-center mt-4">
            <div className="mb-12 flex flex-col justify-center">
              <div className="group relative">
                <div className="absolute bottom-22 left-22">
                  <label className="hidden font-semibold text-[#333] group-hover:block">
                    Upload Avatar
                  </label>
                </div>
                <div className="group-hover:opacity-15">
                  <AvatarUpload completionPercentage={profileCompleted} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

      <Formik
        initialValues={{
          // Personal Information
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          phone: user?.phone || "",
          
          // Preferences
          theme: user?.preferences?.theme || "light",
          language: user?.preferences?.language || "en",
          timeZone: user?.preferences?.timeZone || "UTC",
          dateFormat: user?.preferences?.dateFormat || "MM/DD/YYYY",
          
          // Notification Settings
          emailNotifications: user?.preferences?.emailNotifications ?? true,
          pushNotifications: user?.preferences?.pushNotifications ?? true,
          smsNotifications: user?.preferences?.smsNotifications ?? false,
          
          // Display Preferences
          compactView: user?.preferences?.compactView ?? false,
          showSidebar: user?.preferences?.showSidebar ?? true,
          itemsPerPage: user?.preferences?.itemsPerPage || 10,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, handleChange, setFieldValue }) => (
          <Form>
            {/* Personal Information Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
              <div className="col-span-2 p-4">
                <h3 className="font-bold">Personal Information</h3>
              </div>
              <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      First Name <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.firstName}
                      name="firstName"
                      placeholder="First Name"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="firstName"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Last Name <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.lastName}
                      name="lastName"
                      placeholder="Last Name"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="lastName"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Email <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.email}
                      name="email"
                      placeholder="Email"
                      className="w-full"
                      disabled
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Phone Number
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.phone}
                      name="phone"
                      placeholder="Phone Number"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

            {/* Display Preferences Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
              <div className="col-span-2 p-4">
                <h3 className="font-bold">Display Preferences</h3>
              </div>
              <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Theme
                    </label>
                    <Dropdown
                      value={values.theme}
                      options={themeOptions}
                      onChange={(e) => setFieldValue("theme", e.value)}
                      placeholder="Select Theme"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Language
                    </label>
                    <Dropdown
                      value={values.language}
                      options={languageOptions}
                      onChange={(e) => setFieldValue("language", e.value)}
                      placeholder="Select Language"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Time Zone
                    </label>
                    <Dropdown
                      value={values.timeZone}
                      options={timeZoneOptions}
                      onChange={(e) => setFieldValue("timeZone", e.value)}
                      placeholder="Select Time Zone"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Date Format
                    </label>
                    <Dropdown
                      value={values.dateFormat}
                      options={dateFormatOptions}
                      onChange={(e) => setFieldValue("dateFormat", e.value)}
                      placeholder="Select Date Format"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <InputSwitch
                      checked={values.compactView}
                      onChange={(e) => setFieldValue("compactView", e.value)}
                    />
                    <label className="font-medium text-black dark:text-white">
                      Compact View
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <InputSwitch
                      checked={values.showSidebar}
                      onChange={(e) => setFieldValue("showSidebar", e.value)}
                    />
                    <label className="font-medium text-black dark:text-white">
                      Show Sidebar
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

            {/* Notification Settings Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
              <div className="col-span-2 p-4">
                <h3 className="font-bold">Notification Settings</h3>
              </div>
              <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-black dark:text-white">
                        Email Notifications
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <InputSwitch
                      checked={values.emailNotifications}
                      onChange={(e) => setFieldValue("emailNotifications", e.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-black dark:text-white">
                        Push Notifications
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <InputSwitch
                      checked={values.pushNotifications}
                      onChange={(e) => setFieldValue("pushNotifications", e.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-black dark:text-white">
                        SMS Notifications
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <InputSwitch
                      checked={values.smsNotifications}
                      onChange={(e) => setFieldValue("smsNotifications", e.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

            {/* Submit Buttons */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
              <div className="col-span-2"></div>
              <div className="col-span-8 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="flex justify-end gap-4 p-3">
                  <CanceButton onClick={() => router.back()} />
                  <Button 
                    label="Save Preferences" 
                    type="submit" 
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UserPreferences;