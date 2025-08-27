import React from "react";
import { FaRegCreditCard } from "react-icons/fa6";
import {
  FaBalanceScale,
  FaCalculator,
  FaClipboard,
  FaCube,
  FaHandshake,
  FaIndustry,
  FaMoneyBill,
  FaPercent,
  FaThLarge,
  FaThList,
  FaTimesCircle,
  FaUser,
  FaUserLock,
  FaPalette,
} from "react-icons/fa";
import { BiSolidCategory } from "react-icons/bi";

import { PiPlugFill } from "react-icons/pi";
import { BsBuilding } from "react-icons/bs";
import { FaUpload } from "react-icons/fa";
import { FaChartPie } from "react-icons/fa";

import { FaDownload } from "react-icons/fa";

import { LuFileText } from "react-icons/lu";
import { FiMap } from "react-icons/fi";
import { PiShieldCheck } from "react-icons/pi";
import Link from "next/link";

const rolesAndPermissions = {
  title: "Roles and Permission",

  data: [
    {
      title: "Roles & Permissions",
      link: "/system-setup/roles",
      description:
        "Roles & Permissions control user access by defining actions and data visibility based on assigned roles.",
      icon: FaUserLock,
    },
  ],
};

const accountData = {
  title: "Your Account",

  data: [
    {
      title: "Subscription And Billing",
      link: "/system-setup/subscription-billing",
      description:
        "Review your subscription or enter and amend your card details",
      icon: FaRegCreditCard,
    },
    {
      title: "Company Details",
      link: "/system-setup/company-details",
      description: "View or amend your company details",
      icon: FaIndustry,
    },
    {
      title: "Close My Account",
      link: "/",
      description: "Cancel your subscription and deactivate your account",
      icon: FaTimesCircle,
    },
    {
      title: "Integrations",
      link: "/system-setup/integrations",
      description:
        "Enhance the capabilities of your system by integrating with third-party software",
      icon: PiPlugFill,
    },
  ],
};
const settingInfo = {
  title: "Your Settings",

  data: [
    {
      title: "List Of Values",
      link: "/system-setup/list-value",
      description:
        "Customise your own lists across the system for specific business processes or personalised reporting",
      icon: FaThList,
    },
    // {
    //   title: "Company Details",
    //   link: "/",
    //   description: "View or amend your company details",
    //   icon: FaIndustry,
    // },
    // {
    //   title: "Close My Account",
    //   link: "/",
    //   description: "Cancel your subscription and deactivate your account",
    //   icon: FaTimesCircle,
    // },
    // {
    //   title: "Integrations",
    //   link: "/system-setup/integrations",
    //   description:
    //     "Enhance the capabilities of your system by integrating with third-party software",
    //   icon: PiPlugFill,
    // },
  ],
};

const maintenenceData = {
  title: "Maintenance Data",
  data: [
    {
      title: "Companies",
      link: "/",
      description:
        "A collection of system wide settings allowing you to customise the application to suit your own company's needs",
      icon: FaIndustry,
    },
    {
      title: "Depots",
      link: "/system-setup/depots",
      description:
        "Depots are locations you operate from. They can also be considered as stores or branches",
      icon: BsBuilding,
    },
    {
      title: "Routing",
      link: "/system-setup/routing",
      description:
        "Configure service routes and delivery areas using geofencing for regular maintenance scheduling",
      icon: FiMap,
    },
    {
      title: "Maintenance Task Types",
      link: "/system-setup/maintenance-task-types",
      description:
        "Define task types and their default durations for maintenance operations",
      icon: FaClipboard,
    },
    {
      title: "Product Groups",
      link: "/",
      description:
        "Product Groups are folders for your products.",
      icon: FaThLarge,
    },
    {
      title: "Surcharge Groups",
      link: "/",
      description:
        "Surcharges are an optional but powerful feature.",
      icon: FaThLarge,
    },
    {
      title: "Surcharges",
      link: "/",
      description:
        "Surcharges provide the charging mechanism for additional charges added to an order",
      icon: FaRegCreditCard,
    },
    {
      title: "Document Numbers",
      link: "/system-setup/document-number",
      description: "Configure the document number structure within the system",
      icon: LuFileText,
    },
    {
      title: "Document Appearance",
      link: "/system-setup/document-appearance",
      description: "Customize the look and feel of your documents with templates and themes",
      icon: FaPalette,
    },
  ],
};

const AccountingData = {
  title: "Accounting And Charging ",
  data: [
    {
      title: "Tax Classes",
      link: "/system-setup/tax-classes",
      description:
        "Tax classes allow you to maintain tax classifications for your customers and products",
      icon: FaThLarge,
    },
    {
      title: "Tax Rates",
      link: "/",
      description:
        "Tax Rates are used by tax rules to calculate tax charges on an order and invoice",
      icon: FaPercent,
    },
    {
      title: "Tax Rules",
      link: "/",
      description:
        "Tax Rules are defined as a combination of a customer tax class and a product tax class with an associated tax rate",
      icon: FaBalanceScale,
    },
    {
      title: "General Ledger Templates",
      link: "/",
      description:
        "General Ledger Templates allow you to create a template for general ledger postings",
      icon: FaClipboard,
    },
    {
      title: "Revenue groups",
      link: "/system-setup/tax-classes",
      description:
        "Revenue groups allow you to categorise the rental and sale income generated from your products and surcharges during the invoicing process",
      icon: FaChartPie,
    },
    {
      title: "Payment Terms",
      link: "/system-setup/payment-terms",
      description: "The number of days in which payment for the invoice is due",
      icon: FaHandshake,
    },
    {
      title: "Payment Methods",
      link: "/",
      description:
        "Payment methods allow you to set up different ways to make payments within the system",
      icon: FaMoneyBill,
    },
    {
      title: "Rate definitions",
      link: "/system-setup/rate-definition",
      description:
        "Rate definitions allow you to configure how to charge for your rental items",
      icon: FaCalculator,
    },
    {
      title: "Invoice Run Codes",
      link: "/system-setup/invoice-run-code",
      description:
        "Invoice Run Codes can be used to group your orders in readiness for an invoice run.",
      icon: FaCube,
    },
    {
      title: "Damage Waiver",
      link: "/system-setup/damage-waiver",
      description:
        "Configure damage waiver levels and settings for equipment rental protection.",
      icon: PiShieldCheck,
    },
  ],
};
const UtilitiesData = {
  title: "Utilities",
  data: [
    {
      title: "Export Data",
      link: "/system-setup/",
      description:
        "You can easily export a variety of data. The data is exported as a set of comma-separated values (CSV) files",
      icon: FaUpload,
    },
    {
      title: "Import Data",
      link: "/system-setup/import-data",
      description: "Import a variety of data easily into your system",
      icon: FaDownload,
    },
      {
      title: "Categories",
      link: "/system-setup/category",
      description: "Defiend category and sub categroy of product",
      icon: BiSolidCategory,
    },
  ],
};

const IconPlacement = ({ icon: Icon }) => {
  return Icon ? <Icon className="mb-2 text-[50px] text-[#555]" /> : null;
};
const SystemSetup = () => {
  return (
    <div>
      <div className="text-[#333]">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 p-4 sm:col-span-12 md:col-span-3  xl:col-span-3 ">
            <label className="py-2 text-[20px] font-bold dark:text-white">
              {rolesAndPermissions.title}
            </label>
          </div>
          <div class="col-span-12 p-4 dark:bg-[#122031] md:col-span-9 lg:col-span-9 xl:col-span-9">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
              {rolesAndPermissions.data.map((item, index) => (
                <Link key={index} href={item.link}>
                  <div className="flex h-50 cursor-pointer flex-col hover:bg-orange-100 dark:hover:bg-dark-2 ease-out transition-shadow items-center  justify-center rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4  text-black">
                    <IconPlacement icon={item.icon}  />
                    <label className="text-center cursor-pointer">{item.title}</label>
                    <label className="text-center cursor-pointer">{item.description}</label>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 p-4 sm:col-span-12 md:col-span-3  xl:col-span-3 ">
            <label className="py-2 text-[20px] font-bold dark:text-white">
              {accountData.title}
            </label>
          </div>
          <div class="col-span-12 p-4 dark:bg-[#122031] md:col-span-9 lg:col-span-9 xl:col-span-9">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
              {accountData.data.map((item, index) => (
                <Link className="cursor-pointer" key={index} href={item.link}>
                  <div className="flex h-50 cursor-pointer flex-col hover:bg-orange-100 dark:hover:bg-dark-2  transition-shadow items-center   justify-center rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4  text-black">
                    <IconPlacement icon={item.icon} />
                    <label className="text-center cursor-pointer">{item.title}</label>
                    <label className="text-center cursor-pointer">{item.description}</label>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 p-4 sm:col-span-12 md:col-span-3  xl:col-span-3 ">
            <label className="py-2 text-[20px] font-bold dark:text-white">
              {settingInfo.title}
            </label>
          </div>
          <div class="col-span-12 p-4 dark:bg-[#122031] md:col-span-9 lg:col-span-9 xl:col-span-9">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
              {settingInfo.data.map((item, index) => (
                <Link key={index} href={item.link}>
                  <div className="flex h-50 cursor-pointer flex-col hover:bg-orange-100 dark:hover:bg-dark-2 ease-out transition-shadow items-center  justify-center rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4  text-black">
                    <IconPlacement icon={item.icon} />
                    <label className="text-center cursor-pointer">{item.title}</label>
                    <label className="text-center cursor-pointer">{item.description}</label>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 p-4 sm:col-span-12 md:col-span-3  xl:col-span-3 ">
            <label className="py-2 text-[20px] font-bold dark:text-white">
              {maintenenceData.title}
            </label>
          </div>
          <div class="col-span-12 p-4 dark:bg-[#122031] md:col-span-9 lg:col-span-9 xl:col-span-9">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
              {maintenenceData.data.map((item, index) => (
                <Link key={index} href={item.link}>
                  <div className="flex h-50 cursor-pointer flex-col hover:bg-orange-100 dark:hover:bg-dark-2 ease-out transition-shadow items-center  justify-center rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4  text-black">
                    <IconPlacement icon={item.icon} />
                    <label className="text-center cursor-pointer">{item.title}</label>
                    <label className="text-center cursor-pointer">{item.description}</label>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 p-4 sm:col-span-12 md:col-span-3  xl:col-span-3 ">
            <label className="py-2 text-[20px] font-bold dark:text-white">
              {AccountingData.title}
            </label>
          </div>
          <div class="col-span-12 p-4 dark:bg-[#122031] md:col-span-9 lg:col-span-9 xl:col-span-9">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
              {AccountingData.data.map((item, index) => (
                <Link key={index} href={item.link}>
                  <div className="flex h-50 cursor-pointer flex-col hover:bg-orange-100 dark:hover:bg-dark-2 ease-out transition-shadow items-center  justify-center rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4  text-black">
                    <IconPlacement icon={item.icon} />
                    <label className="text-center cursor-pointer">{item.title}</label>
                    <label className="text-center cursor-pointer">{item.description}</label>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 p-4 sm:col-span-12 md:col-span-3  xl:col-span-3 ">
            <label className="py-2 text-[20px] font-bold dark:text-white">
              {UtilitiesData.title}
            </label>
          </div>
          <div class="col-span-12 p-4 dark:bg-[#122031] md:col-span-9 lg:col-span-9 xl:col-span-9">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
              {UtilitiesData.data.map((item, index) => (
                <Link key={index} href={item.link}>
                  <div className="flex h-50 cursor-pointer flex-col hover:bg-orange-100 dark:hover:bg-dark-2 ease-out transition-shadow items-center  justify-center rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4  text-black">
                    <IconPlacement icon={item.icon} />
                    <label className="text-center cursor-pointer">{item.title}</label>
                    <label className="text-center cursor-pointer">{item.description}</label>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSetup;
