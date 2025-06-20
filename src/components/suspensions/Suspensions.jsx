"use client";
import React, { useEffect, useRef, useState } from "react";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import CanceButton from "../Buttons/CanceButton";
import { BaseURL } from "../../../utils/baseUrl";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
import apiServices from "../../../services/apiService";
import { useSelector } from "react-redux";
const moment = require("moment");
import { MultiSelect } from "primereact/multiselect";

const Suspensions = () => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return [today, tomorrow];
  });
  const [type, setType] = useState({ name: "" });
  const [loading, setloading] = useState(false);
  const [fetchLoading, setfetchLoading] = useState(false);
  const [data, setdata] = useState([]);
  const toast = useRef();
  const router = useRouter();

  console.log(dateRange);
  const startDate = moment(dateRange[0] || new Date()).startOf('day'); 
  const endDate = moment(dateRange[1] || dateRange[0]).startOf('day'); 
  const differenceInDays = endDate.diff(startDate, "days") ; 
  const { token } = useSelector((state) => state?.authReducer);
  const [selectedIds, setSelectedIds] = useState([]);


  const handleChange = (selectedItems) => {
    setSelectedIds(selectedItems.map((item) => item?._id));
  };

  const fetchOrder = async (item) => {
    try {
      setfetchLoading(true);
      const response = await apiServices.get(`/${item}`);
      setdata(response.data.data);
      fetchLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setfetchLoading(false);
    }
  };

  useEffect(() => {
    const typeMapping = {
      Order: "order",
      Depot: "depots",
      Account: "customer",
    };

    if (type?.name && typeMapping[type.name]) {
      fetchOrder(typeMapping[type.name]);
    }
  }, [type?.name]);

  const typedata = [
    { name: "Account" },
    { name: "Depot" },
    { name: "Order" },
    // { name: "Company" },
    // { name: "Place" },
    // { name: "Order Item" },
  ];

  const handleSubmit = async () => {
    setloading(true);
    const suspensionData = {
      reason,
      description,
      dateRange,
      type: type?.name,
      entityIds:selectedIds
    };

    try {
      const response = await axios.post(
        `${BaseURL}/suspension`,
        suspensionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // const response= apiServices.create('/suspension',suspensionData)
      setReason("")
      setDescription("");
      setType({name:""})
      setDateRange(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return [today, tomorrow];
      })
      setSelectedIds([])
      console.log("Response:", response?.data);
      toast.current.show({
        severity: "success",
        summary: "Creation Success",
        detail: response?.data?.message || "Failed to create Suspension.",
        life: 3000,
      });
      setloading(false);
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Creation Failed",
        detail:
          error?.response?.data?.message || "Failed to create Suspension.",
        life: 3000,
      });
      setloading(false);
      console.error("Error submitting form:", error);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <div className="h-screen">
      <GoPrevious route={"/dashboard"} />

      <Toast ref={toast} />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-2">
          <h3 className="text-[25px] font-bold text-black dark:text-white">
            New Suspensions
          </h3>
        </div>
        <div className="col-span-12 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-8">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1">
              <div className="field flex flex-col gap-1">
                <label
                  className="text-[0.9em] font-bold text-black"
                  htmlFor="reason"
                >
                  Reason
                </label>
                <InputText
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1">
              <div className="field flex flex-col gap-1">
                <label
                  className="text-[0.9em] font-bold text-black"
                  htmlFor="description"
                >
                  Description
                </label>
                <InputTextarea
                  id="description"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="field flex flex-col gap-1">
                <label
                  className="text-[0.9em] font-bold text-black"
                  htmlFor="dateRange"
                >
                  Date Range
                </label>
                <Calendar
                  id="dateRange"
                  selectionMode="range"
                  readOnlyInput
                  hideOnRangeSelection
                  value={dateRange}
                  onChange={(e) => setDateRange(e.value)}
                />
              </div>
              <div className="flex items-center justify-start">
                <div className="field flex flex-col gap-1">
                  <label
                    className="text-[0.9em] font-bold text-black"
                    htmlFor="dateRange"
                  >
                    Day Suspensions{" "}
                  </label>
                  <InputText
                    readOnly
                    value={` ${differenceInDays}`}
                    className="text-[1em] font-bold text-red"
                    htmlFor="suspensions"
                  ></InputText>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="field flex flex-col gap-1">
                <label
                  className="text-[0.9em] font-bold text-black"
                  htmlFor="type"
                >
                  Type
                </label>
                <Dropdown
                  id="type"
                  options={typedata}
                  showClear
                  optionLabel="name"
                  placeholder="Select Type"
                  className="md:w-14rem w-full"
                  value={type}
                  onChange={(e) => setType(e.value)}
                />
              </div>
            </div>

            {["Account", "Depot", "Order"].includes(type?.name) && (
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="card p-fluid">
                  <MultiSelect
                  loading={fetchLoading}
                    value={data?.filter((item) =>
                      selectedIds?.includes(item._id),
                    )}
                    options={data}
                    onChange={(e) => handleChange(e.value)}
                    optionLabel="name"
                    placeholder={`Select ${type?.name || ""}`}
                    filter
                    display="chip"
                    showSelectAll
                  />
                </div>
                {/* <div className="mt-3">
        <strong>Selected IDs:</strong> {JSON.stringify(selectedIds)}
      </div> */}
              </div>
            )}
            <div className="flex justify-end">
              <div className="flex gap-6">
                <CanceButton />
                <Button
                  loading={loading}
                  onClick={handleSubmit}
                  size="small"
                  className="font-bold"
                >
                  Add Suspension
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suspensions;
