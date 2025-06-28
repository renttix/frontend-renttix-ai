"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useSelector } from "react-redux";

const menuGroups = [
  {
    name: "MAIN MENU",
    menuItems: [
      {
        icon: (
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3 3H10V10H3V3ZM5 5V8H8V5H5ZM14 3H21V10H14V3ZM16 5V8H19V5H16ZM3 14H10V21H3V14ZM5 16V19H8V16H5ZM14 14H21V21H14V14ZM16 16V19H19V16H16Z"
              fill="currentColor"
            />
          </svg>
        ),
        label: "Dashboard",
        route: "/dashboard",
      },

      {
        icon: (
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3 7L12 2L21 7V17L12 22L3 17V7ZM12 4.236L6 7.618V16.382L12 19.764L18 16.382V7.618L12 4.236ZM9 9H15V11H9V9ZM9 13H15V15H9V13Z"
              fill="currentColor"
            />
          </svg>
        ),
        label: "Products",
        route: "#",
        children: [
          { label: "All Product", route: "/product/product-list" },
          { label: "Add Product", route: "/product/add-product" },
        ],
      },
      {
        icon: (
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3 3C3 2.44772 3.44772 2 4 2H5.58579C6.07041 2 6.53857 2.21071 6.85355 2.58579L8.41421 4.41421H19C19.5128 4.41421 19.9355 4.79289 19.9933 5.29864L21.4933 18.2986C21.5698 18.9803 21.0376 19.5858 20.3511 19.5858H7.64886C6.96241 19.5858 6.43024 18.9803 6.50672 18.2986L6.83496 15.4142H18.1349L17.0086 7.41421H7.70711L5.29289 4.58579H4V3ZM7 20.5858C7 19.7582 7.67157 19.0858 8.5 19.0858C9.32843 19.0858 10 19.7582 10 20.5858C10 21.4132 9.32843 22.0858 8.5 22.0858C7.67157 22.0858 7 21.4132 7 20.5858ZM17 20.5858C17 19.7582 17.6716 19.0858 18.5 19.0858C19.3284 19.0858 20 19.7582 20 20.5858C20 21.4132 19.3284 22.0858 18.5 22.0858C17.6716 22.0858 17 21.4132 17 20.5858Z"
              fill="currentColor"
            />
          </svg>
        ),
        label: "Orders",
        route: "#",
        children: [
          { label: "Orders", route: "/order/list" },
          { label: "Create Order", route: "/order/create" },
          { label: "Terminate Rental", route: "/order/terminate" },
          { label: "Quick Off Hire", route: "/order/quick-off-hire" },
        ],
      },
      {
        icon: (
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 2C5.44772 2 5 2.44772 5 3V21C5 21.2761 5.22386 21.5 5.5 21.5C5.65379 21.5 5.8003 21.4473 5.9129 21.3536L8 19.5L10.0871 21.3536C10.2733 21.5128 10.5371 21.5128 10.7233 21.3536L12.8104 19.5L14.8975 21.3536C15.0837 21.5128 15.3475 21.5128 15.5337 21.3536L17.6208 19.5L19.7079 21.3536C19.8205 21.4473 19.967 21.5 20.1208 21.5C20.3969 21.5 20.6208 21.2761 20.6208 21V3C20.6208 2.44772 20.1731 2 19.6208 2H6ZM7 4H18.6208V19.2426L17.1208 18.0303C16.8769 17.8297 16.5205 17.8297 16.2766 18.0303L14.1895 19.8839L12.1024 18.0303C11.8585 17.8297 11.5021 17.8297 11.2582 18.0303L9.17109 19.8839L7 18.2426V4ZM9 7C8.44772 7 8 7.44772 8 8C8 8.55228 8.44772 9 9 9H15C15.5523 9 16 8.55228 16 8C16 7.44772 15.5523 7 15 7H9ZM8 12C8 11.4477 8.44772 11 9 11H15C15.5523 11 16 11.4477 16 12C16 12.5523 15.5523 13 15 13H9C8.44772 13 8 12.5523 8 12ZM9 15C8.44772 15 8 15.4477 8 16C8 16.5523 8.44772 17 9 17H13C13.5523 17 14 16.5523 14 16C14 15.4477 13.5523 15 13 15H9Z"
              fill="currentColor"
            />
          </svg>
        ),
        label: "Invoicing",
        route: "#",
        children: [
          { label: "Invoice Batches", route: "/invoicing/invoice-batch" },
          { label: "Invoice Run", route: "/invoicing/invoice-run" },
        ],
      },
      {
        icon: (
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7H3V5ZM3 9H21V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9ZM7 14C7 13.4477 7.44772 13 8 13H10C10.5523 13 11 13.4477 11 14V16C11 16.5523 10.5523 17 10 17H8C7.44772 17 7 16.5523 7 16V14Z"
              fill="currentColor"
            />
          </svg>
        ),
        label: "Payments",
        route: "/payments",
      },
      {
        icon: (
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.9999 1.25C9.37654 1.25 7.24989 3.37665 7.24989 6C7.24989 8.62335 9.37654 10.75 11.9999 10.75C14.6232 10.75 16.7499 8.62335 16.7499 6C16.7499 3.37665 14.6232 1.25 11.9999 1.25ZM8.74989 6C8.74989 4.20507 10.205 2.75 11.9999 2.75C13.7948 2.75 15.2499 4.20507 15.2499 6C15.2499 7.79493 13.7948 9.25 11.9999 9.25C10.205 9.25 8.74989 7.79493 8.74989 6Z"
              fill=""
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.9999 12.25C9.68634 12.25 7.55481 12.7759 5.97534 13.6643C4.41937 14.5396 3.24989 15.8661 3.24989 17.5L3.24982 17.602C3.24869 18.7638 3.24728 20.222 4.5263 21.2635C5.15577 21.7761 6.03637 22.1406 7.2261 22.3815C8.41915 22.6229 9.97412 22.75 11.9999 22.75C14.0257 22.75 15.5806 22.6229 16.7737 22.3815C17.9634 22.1406 18.844 21.7761 19.4735 21.2635C20.7525 20.222 20.7511 18.7638 20.75 17.602L20.7499 17.5C20.7499 15.8661 19.5804 14.5396 18.0244 13.6643C16.445 12.7759 14.3134 12.25 11.9999 12.25ZM4.74989 17.5C4.74989 16.6487 5.37127 15.7251 6.71073 14.9717C8.02669 14.2315 9.89516 13.75 11.9999 13.75C14.1046 13.75 15.9731 14.2315 17.289 14.9717C18.6285 15.7251 19.2499 16.6487 19.2499 17.5C19.2499 18.8078 19.2096 19.544 18.5263 20.1004C18.1558 20.4022 17.5364 20.6967 16.4761 20.9113C15.4192 21.1252 13.9741 21.25 11.9999 21.25C10.0257 21.25 8.58063 21.1252 7.52368 20.9113C6.46341 20.6967 5.84401 20.4022 5.47348 20.1004C4.79021 19.544 4.74989 18.8078 4.74989 17.5Z"
              fill=""
            />
          </svg>
        ),
        label: "Customer",
        route: "#",
        children: [
          { label: "Account", route: "/customer/listing" },
          { label: "Create Customer", route: "/customer/create" },
        ],
      },

      {
        icon: (
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 4C6.55228 4 7 4.44772 7 5V19C7 19.5523 6.55228 20 6 20C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM18 5C18 4.44772 17.5523 4 17 4C16.4477 4 16 4.44772 16 5V19C16 19.5523 16.4477 20 17 20C17.5523 20 18 19.5523 18 19V5Z"
              fill="currentColor"
            />
          </svg>
        ),
        label: "Suspensions",
        route: "/suspensions",
      },
      {
        icon: (
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 2C7.55228 2 8 2.44772 8 3V5H16V3C16 2.44772 16.4477 2 17 2C17.5523 2 18 2.44772 18 3V5H19C20.6569 5 22 6.34315 22 8V19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V8C2 6.34315 3.34315 5 5 5H6V3C6 2.44772 6.44772 2 7 2Z"
              fill="currentColor"
            />
            <path
              d="M4 10H20V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V10Z"
              fill="currentColor"
            />
            <circle cx="7" cy="14" r="1" fill="white" />
            <circle cx="12" cy="14" r="1" fill="white" />
            <circle cx="17" cy="14" r="1" fill="white" />
            <circle cx="7" cy="17" r="1" fill="white" />
            <circle cx="12" cy="17" r="1" fill="white" />
            <circle cx="17" cy="17" r="1" fill="white" />
          </svg>
        ),
        label: "Calendar",
        route: "#",
        children: [
          { label: "Standard View", route: "/calendar" },
          { label: "Resource Timeline View", route: "/calendar/base-schedule" },
          { label: "Dispatch Calendar", route: "/calendar/dispatch" },
        ],
      },
      {
        icon: (
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* outer body */}
            <path
              d="M4 2h16a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"
              fill="currentColor"
            />
            {/* display window */}
            <path d="M6 5h12v3H6V5z" fill="white" />
            {/* buttons row 1 */}
            <rect
              x="6"
              y="10"
              width="4"
              height="4"
              rx="0.5"
              fill="currentColor"
            />
            <rect
              x="11"
              y="10"
              width="4"
              height="4"
              rx="0.5"
              fill="currentColor"
            />
            <rect x="16" y="10" width="2" height="2" fill="currentColor" />
            {/* buttons row 2 */}
            <rect
              x="6"
              y="15"
              width="4"
              height="4"
              rx="0.5"
              fill="currentColor"
            />
            <rect
              x="11"
              y="15"
              width="4"
              height="4"
              rx="0.5"
              fill="currentColor"
            />
            <rect x="16" y="15" width="2" height="2" fill="currentColor" />
          </svg>
        ),
        label: "Calculator ",
        route: "/calculator ",
      },
    ],
  },
  {
    name: "OTHERS",
    menuItems: [
      {
        icon: (
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C9.51472 2 7.5 4.01472 7.5 6.5C7.5 8.98528 9.51472 11 12 11C14.4853 11 16.5 8.98528 16.5 6.5C16.5 4.01472 14.4853 2 12 2ZM9.5 6.5C9.5 5.11929 10.6193 4 12 4C13.3807 4 14.5 5.11929 14.5 6.5C14.5 7.88071 13.3807 9 12 9C10.6193 9 9.5 7.88071 9.5 6.5ZM5 19C5 15.9624 7.46243 13.5 10.5 13.5H13.5C16.5376 13.5 19 15.9624 19 19C19 19.5523 18.5523 20 18 20C17.4477 20 17 19.5523 17 19C17 16.7909 15.2091 15 13 15H11C8.79086 15 7 16.7909 7 19C7 19.5523 6.55228 20 6 20C5.44772 20 5 19.5523 5 19Z"
              fill="currentColor"
            />
          </svg>
        ),
        label: "Profile & Preferences",
        route: "/profile",
        // children: [{ label: "Basic ", route: "/profile" }],
      },
      {
        icon: (
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.5 1.75C3.87665 1.75 1.75 3.87665 1.75 6.5C1.75 9.12335 3.87665 11.25 6.5 11.25C9.12335 11.25 11.25 9.12335 11.25 6.5C11.25 3.87665 9.12335 1.75 6.5 1.75ZM3.25 6.5C3.25 4.70507 4.70507 3.25 6.5 3.25C8.29493 3.25 9.75 4.70507 9.75 6.5C9.75 8.29493 8.29493 9.75 6.5 9.75C4.70507 9.75 3.25 8.29493 3.25 6.5Z"
              fill=""
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.5 12.75C14.8766 12.75 12.75 14.8766 12.75 17.5C12.75 20.1234 14.8766 22.25 17.5 22.25C20.1234 22.25 22.25 20.1234 22.25 17.5C22.25 14.8766 20.1234 12.75 17.5 12.75ZM14.25 17.5C14.25 15.7051 15.7051 14.25 17.5 14.25C19.2949 14.25 20.75 15.7051 20.75 17.5C20.75 19.2949 19.2949 20.75 17.5 20.75C15.7051 20.75 14.25 19.2949 14.25 17.5Z"
              fill=""
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.75 6.5C12.75 3.87665 14.8766 1.75 17.5 1.75C20.1234 1.75 22.25 3.87665 22.25 6.5C22.25 9.12335 20.1234 11.25 17.5 11.25C14.8766 11.25 12.75 9.12335 12.75 6.5ZM17.5 3.25C15.7051 3.25 14.25 4.70507 14.25 6.5C14.25 8.29493 15.7051 9.75 17.5 9.75C19.2949 9.75 20.75 8.29493 20.75 6.5C20.75 4.70507 19.2949 3.25 17.5 3.25Z"
              fill=""
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.5 12.75C3.87665 12.75 1.75 14.8766 1.75 17.5C1.75 20.1234 3.87665 22.25 6.5 22.25C9.12335 22.25 11.25 20.1234 11.25 17.5C11.25 14.8766 9.12335 12.75 6.5 12.75ZM3.25 17.5C3.25 15.7051 4.70507 14.25 6.5 14.25C8.29493 14.25 9.75 15.7051 9.75 17.5C9.75 19.2949 8.29493 20.75 6.5 20.75C4.70507 20.75 3.25 19.2949 3.25 17.5Z"
              fill=""
            />
          </svg>
        ),
        label: "System Setup",
        route: "/system-setup",
      },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen, className }) => {
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");

  const pathname = usePathname();
  const { user, role } = useSelector((state) => state?.authReducer);

  const permission = user?.permissions;

  user?.permission?.push("Profile");
  const filterMenuByPermissions = (menuGroups, permission) => {
    // If user is Admin, show all menu items
    if (role === "Admin") {
      console.log("👑 [Sidebar] Admin user detected, showing all menu items");
      return menuGroups;
    }

    // If no permissions or user data, show all menu items (for development/debugging)
    if (!permission || !user || permission.length === 0) {
      console.log("⚠️ [Sidebar] No permissions found, showing all menu items");
      return menuGroups;
    }

    // For non-admin users with permissions, filter based on permissions
    return menuGroups.map((group) => {
      const filteredMenuItems = group.menuItems
        .map((item) => {
          // Check if the main label is in permissions
          if (permission?.includes(item.label)) {
            return item;
          }
          // Check children if they exist
          if (item.children) {
            const filteredChildren = item.children.filter((child) =>
              permission?.includes(child.label),
            );
            if (filteredChildren?.length > 0) {
              return { ...item, children: filteredChildren };
            }
          }
          return null;
        })
        .filter(Boolean); // Remove null values

      return { ...group, menuItems: filteredMenuItems };
    });
  };

  const filteredMenu = filterMenuByPermissions(menuGroups, permission);

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`absolute ${className}  left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden border-r border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark lg:static lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0 duration-300 ease-linear"
            : "-translate-x-full"
        }`}
      >
        {/* <!-- SIDEBAR HEADER --> */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10">
          <Link href="/">
            <Image
              width={176}
              height={32}
              src={"/images/logo/logo-dark.svg"}
              alt="Logo"
              priority
              className="dark:hidden"
              style={{ width: "auto", height: "auto" }}
            />
            <Image
              width={176}
              height={32}
              src={"/images/logo/logo.svg"}
              alt="Logo"
              priority
              className="hidden dark:block"
              style={{ width: "auto", height: "auto" }}
            />
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block lg:hidden"
          >
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill=""
              />
            </svg>
          </button>
        </div>
        {/* <!-- SIDEBAR HEADER --> */}

        <div className="no-scrollbar  flex flex-col overflow-y-hidden  duration-300 ease-linear">
          {/* <!-- Sidebar Menu --> */}
          <nav className="mt-1 px-4 lg:px-6">
            {filteredMenu.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                  {group.name}
                </h3>

                <ul className="mb-6 flex flex-col gap-2">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={pageName}
                      setPageName={setPageName}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {/* <!-- Sidebar Menu --> */}
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
