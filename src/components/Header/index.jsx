import Link from "next/link";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";
import Image from "next/image";
import SearchForm from "@/components/Header/SearchForm";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setHeaderTitle } from "@/store/headerTitleSlice";
import { Toast } from "primereact/toast";
import { io } from "socket.io-client";
import { imageBaseURL } from "../../../utils/baseUrl";
import { TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";

import {
  toggleSidebar,
  setSidebarOpen,
  toggleCollapsed,
} from "@/store/uiSlice";
import { Button } from "primereact/button";
// const socket = io("http://localhost:7000");
const socket = io("https://saasrental.io", {
  path: "/socket.io",
  transports: ["websocket"],
});




const Header = ({ sidebarOpen, setSidebarOpen }) => {
    const { user } = useSelector((state) => state?.authReducer);
  const vendorId =user?._id
  const dispatch = useDispatch();
  const path = window.location.pathname;
  console.log(path);
  const toast = useRef(null);



  useEffect(() => {

    function removeImagePrefix(path) {
      return path?.replace(/^images[\\/]/, "").replace(/\\/g, "/"); // Convert `\` to `/`
    }
    socket.emit("joinVendorRoom", vendorId);
  
    socket.on("newNotification", (notification) => {
      console.log("New Notification:", notification);
  
      toast.current.show({
        severity: "info",
        summary: "New Notification",
        
        content: (
          <div className="flex items-start gap-3 p-3">
            {/* User Profile Image */}
            <Image
              width={40}
              height={40}
              src={`${imageBaseURL}images/${removeImagePrefix(notification?.data?.user?.profile_Picture)}`}
              alt="User"
              className="rounded-full object-cover w-10 h-10 border border-gray-300 dark:border-dark-4"
            />
  
            {/* Notification Content */}
            <div className="flex-1">
              <p className="text-sm font-medium text-dark dark:text-white">
                {notification?.data?.user?.legalName}{" "}
                <span className="text-xs text-gray-500">
                  {notification?.data?.user?.role}
                </span>
              </p>
  
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {notification?.type}
              </p>
  
             
            </div>
          </div>
        ),
        life: 20000, // Display duration
      });
    });
  
    return () => {
      socket.off("newNotification");
    };
  }, []);
  
  const headerTitle = useSelector((state) => state.headerTitle);

  const pathHandle = (item) => {
    if (item === "/") {
      return dispatch(setHeaderTitle("Dashboard"));
    }
    if (item === "/product/product-list" || item === "/product/add-product") {
      return dispatch(setHeaderTitle("Products"));
    }
    if (item === "/order/list") {
      return dispatch(setHeaderTitle("Orders"));
    }

    if (item === "/order/create") {
      return dispatch(setHeaderTitle("Orders"));
    }
    if (item === "/invoicing/invoice-batch") {
      return dispatch(setHeaderTitle("Invoicing"));
    }

    if (item === "/invoicing/invoice-run") {
      return dispatch(setHeaderTitle("Invoicing"));
    }
    if (item === "/system-setup") {
      return dispatch(setHeaderTitle("System Setup"));
    }
      if (item === "/suspensions") {
      return dispatch(setHeaderTitle("Suspensions"));
    }
    if (item === "/customer/create") {
      return dispatch(setHeaderTitle("Customer"));
    }
    if (item === "/customer/listing") {
      return dispatch(setHeaderTitle("Customer"));
    }
    if (item === "/profile") {
      return dispatch(setHeaderTitle("Profile"));
    }
  };

  useEffect(() => {
    pathHandle(path);
  }, [pathHandle, path]);

  const isSideBarOpen = useSelector((state) => state.ui.sidebarOpen);

  return (
    <header className="sticky top-0 z-999 flex w-full border-b border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark">
       <Toast ref={toast} position="top-center" />
      <div className="flex flex-grow items-center justify-between px-4 py-5 shadow-2 md:px-5 2xl:px-10">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-dark-3 dark:bg-dark-2 lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-dark delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && "!w-full delay-300"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-dark delay-150 duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && "delay-400 !w-full"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-dark delay-200 duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && "!w-full delay-500"
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-dark delay-300 duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && "!h-0 !delay-[0]"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-dark duration-200 ease-in-out dark:bg-white ${
                    !sidebarOpen && "!h-0 !delay-200"
                  }`}
                ></span>
              </span>
            </span>
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}

          <Link className="block flex-shrink-0 lg:hidden" href="/">
            {/* <Image
              width={32}
              height={32}
              src={"/images/logo/logo-icon.svg"}
              alt="Logo"
            /> */}
          </Link>
        </div>

        <div className="block">
          <div className=" flex items-center gap-4">
            {isSideBarOpen ? (
              <TbLayoutSidebarLeftCollapse
                className="text-4xl cursor-pointer text-orange-500 hover:text-orange-600 transition-colors duration-200"
                onClick={() => dispatch(toggleSidebar())}
              />
            ) : (
              <TbLayoutSidebarLeftExpand
                className="text-4xl cursor-pointer text-orange-500 hover:text-orange-600 transition-colors duration-200"
                onClick={() => dispatch(toggleSidebar())}
              />
            )}
            {/* <i className="pi pi-bars sm:hidden  shadow-lg hover:duration-75 hover:shadow-orange-500/50 hover:shadow-xl  cursor-pointer hover:bg-primary hover rounded-full p-2 hover:text-white" onClick={() => dispatch(toggleSidebar())} style={{ fontSize: '1rem' }}></i> */}

            <h1 className="mb-0.5 text-heading-5 font-bold text-dark dark:text-white">
              {headerTitle}
            </h1>
            {/* <p className="font-medium">Vendor Dashboard</p> */}
          </div>
        </div>

        <div className="flex items-center justify-normal gap-2 2xsm:gap-4 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* <!-- Search Form --> */}
            <SearchForm />
            {/* <!-- Search Form --> */}

            {/* <!-- Notification Menu Area --> */}
            <DropdownNotification />
            {/* <!-- Notification Menu Area --> */}
          </ul>

          {/* <!-- User Area --> */}
          <DropdownUser />
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
