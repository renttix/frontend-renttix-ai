"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TbFileInvoice } from "react-icons/tb";
import Loader from "../common/Loader";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button, Dialog, InputText, Calendar, Dropdown, TabView, TabPanel } from "primereact";
import moment from "moment";
import _ from "lodash";
import useDebounce from "@/hooks/useDebounce";
import { BaseURL, imageBaseURL } from "../../../utils/baseUrl";
import axios from "axios";
import Link from "next/link";

import { ListBox } from "primereact/listbox";
import { FaSearch } from "react-icons/fa";
import { Avatar } from "primereact/avatar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import OrderProductTable from "./OrderProductTable";
import { Skeleton } from "primereact/skeleton";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { Toast } from "primereact/toast";
import RouteAssignmentBadge from "../maintenance/RouteAssignmentBadge";
import MaintenanceHistoryPanel from "../maintenance/MaintenanceHistoryPanel";
import MaintenanceHistoryTest from "../maintenance/MaintenanceHistoryTest";

const CustomComboBox = ({
  options = [],
  placeholder = "Search…",
  loading = false,
  onChange,
  formData,
  setFormData,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapperRef = useRef(null);

  // Debounce the input before filtering
  const debounced = useDebounce(inputValue, 300);

  // Filter options when debounced input changes
  useEffect(() => {
    if (!debounced) {
      setFilteredOptions([]);
      return;
    }
    const term = debounced.toLowerCase();
    setFilteredOptions(
      options.filter((o) => o.productName.toLowerCase().includes(term)),
    );
    setHighlighted(0);
  }, [options, debounced]);

  useEffect(() => {
    if (!formData.productName) {
      setInputValue("");
    }
  }, [formData.productName]);
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        setHighlighted((h) => Math.min(h + 1, filteredOptions.length - 1));
        e.preventDefault();
        break;
      case "ArrowUp":
        setHighlighted((h) => Math.max(h - 1, 0));
        e.preventDefault();
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlighted]) {
          selectOption(filteredOptions[highlighted]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  // Handle selection
  const selectOption = useCallback(
    (option) => {
      if (option.quantity === 0) return;
      setInputValue(option.productName);
      setOpen(false);
      onChange({ target: { name: "productName", value: option.productName } });
      setFormData((prev) => ({
        ...prev,
        productName: option.productName,
        quantity: 1,
        rate:
          option.rentPrice == null
            ? "sale-price"
            : `${option?.rateDefinition?.minimumRentalPeriod} days`,
        price: option?.rentPrice ?? option?.salePrice,
        product: option?.id,
        status: option?.status,
        taxRate: option?.taxClass?.taxRate ?? 0,
        Day1: option?.rateDefinition?.dayRates[0]?.rate ?? 0,
        Day2: option?.rateDefinition?.dayRates[1]?.rate ?? 0,
        Day3: option?.rateDefinition?.dayRates[2]?.rate ?? 0,
        Day4: option?.rateDefinition?.dayRates[3]?.rate ?? 0,
        Day5: option?.rateDefinition?.dayRates[4]?.rate ?? 0,
        Day6: option?.rateDefinition?.dayRates[5]?.rate ?? 0,
        Day7: option?.rateDefinition?.dayRates[6]?.rate ?? 0,
        rentalDaysPerWeek: option?.rateDefinition?.rentalDaysPerWeek,
        minimumRentalPeriod: option?.rateDefinition?.minimumRentalPeriod,
        currency: option?.currency,
      }));
    },
    [onChange, setFormData],
  );

  useEffect(()=>{
    if(inputValue===""){
       setFormData((prev) => ({
          ...prev,
          productName: "",
          quantity: 0,
          rate: "",
          price: 0,
          product: "",
          minimumRentalPeriod:""
        }));
    }
  })
  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-col items-center overflow-hidden rounded-md border">
        <div className="p-inputgroup flex-1">

          <span className="p-inputgroup-addon">
            {formData.productName ? (
              <img
                src={`${imageBaseURL}${options.find((o) => o.productName === formData.productName)?.thumbnail}`}
                alt="thumb"
                onError={(e) =>
                  (e.currentTarget.src = "/images/product/placeholder.webp")
                }
                className="h-5 w-5 rounded object-cover"
              />
            ) : (
              <i className="pi pi-search size-5" />
            )}
          </span>
          <InputText
            name="productName"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="w-full py-2 focus:outline-none"
          />
        </div>
      </div>

      {open && inputValue && (
        <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow-lg">
          {loading ? (
            [1, 2, 3].map((i) => (
              <Skeleton key={i} height="2rem" className="mx-4 mb-2" />
            ))
          ) : (
            <ul>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => (
                  <li
                    key={opt?._id}
                    onClick={() => selectOption(opt)}
                    onMouseEnter={() => setHighlighted(idx)}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-gray-100 ${idx === highlighted ? "bg-gray-100" : ""} ${opt?.quantity === 0 ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <img
                      src={`${imageBaseURL}${opt?.thumbnail}`}
                      alt="thumb"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "/images/product/placeholder.webp")
                      }
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <span className="w-1/2 text-sm text-gray-700">
                        {opt?.productName}
                      </span>
                      <span
                        className={`w-1/8 rounded-full px-3 py-1 text-xs text-white ${opt?.status === "available" ? "bg-green-500" : "bg-orange-500"}`}
                      >
                        {opt?.status}
                      </span>
                      {opt?.rateDefinition?.minimumRentalPeriod != null && (
                        <span className="w-1/8 rounded-full bg-orange-500 px-3 py-1 text-xs text-white">
                          {opt?.rateDefinition.minimumRentalPeriod}{" "}
                          {opt?.rateDefinition.minimumRentalPeriod === 1
                            ? "Day"
                            : "Days"}
                        </span>
                      )}
                      <span className="w-1/8 rounded-full bg-green-500 px-3 py-1 text-xs text-white">
                        {opt?.quantity === 0 ? "0 Stock" : opt?.quantity}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 font-semibold text-red-600">
                  Product not found!
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const ViewOrder = () => {
  const [data, setData] = useState([]);
  const [orderData, setorderData] = useState([]);
  const [loading, setloading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useSelector((state) => state?.authReducer);
  const [error, seterror] = useState("");
  const { token } = useSelector((state) => state?.authReducer);
  const [action, setaction] = useState("");
  const [ref, setref] = useState("");
  const [bookdate, setbookdate] = useState("");
  const [charging, setcharging] = useState(0);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [modelLoading, setmodelLoading] = useState(false);
  const [orderLoading, setorderLoading] = useState(false);
  const [fetchProductLoading, setfetchProductLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const [minDay, setminDay] = useState([]);
  const toast = useRef();
  const { modelOpen, modalData } = useSelector((state) => state.modal);
  const currencyKey = useSelector(
    (state) => state?.authReducer?.user?.currencyKey,
  );
  const [generateRef, setgenerateRef] = useState("");
  const [refLoader, setrefLoader] = useState(false);

  // const { isOpen, onOpen, onClose } = useDisclosure();

  const [formValues, setFormValues] = useState({
    productName: "",
    quantity: 0,
    rate: "",
    price: 0,
    product: "",
    orderId: params.id,
    status: "",
    rateEngine: "",
    taxRate: "",
    currency: "",
    Day1: "",
    Day2: "",
    Day3: "",
    Day4: "",
    Day5: "",
    Day6: "",
    Day7: "",
    rentalDaysPerWeek: "",
    minimumRentalPeriod: "",
  });
  const debouncedSearch = useDebounce(formValues.productName, 500); // Add debounce with a 500ms delay

  useEffect(() => {
    const fetchdata = async () => {
      // setloading(true);
      setorderLoading(true);
      try {
        const res = await axios.get(`${BaseURL}/order/${params.id}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        if (res.data.data) {
          setorderData(res.data.data);
          setorderLoading(false);
        }
      } catch (error) {
        setorderLoading(false);
        seterror("Server Error");
      }
    };
    fetchdata();
  }, [modelOpen]);

  const handleClic = async () => {
    setIsAdding(true);
    try {
      const body = {
        // productName: ,
        quantity: formValues?.quantity,
        rate: `${formValues.minimumRentalPeriod} days`,
        price: formValues?.price,
        orderId: params.id,
        product: formValues?.product,
        taxRate: formValues.taxRate,
        currency: formValues.currency,
        Day1: formValues.Day1,
        Day2: formValues.Day2,
        Day3: formValues.Day3,
        Day4: formValues.Day4,
        Day5: formValues.Day5,
        Day6: formValues.Day6,
        Day7: formValues.Day7,
        rentalDaysPerWeek: formValues.rentalDaysPerWeek,
        minimumRentalPeriod: formValues.minimumRentalPeriod,
      };
      if (body?.quantity == 0) {
        return;
      }
      // for (let key in body) {
      //   if (!body[key]) {
      //     return;
      //   }
      // }

      const res = await axios.patch(`${BaseURL}/order/update-products/`, body, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });
      setIsAdding(false);
      // toast({
      //   title: res.data?.message,
      //   status: "success",
      //   position: " top-right",
      //   duration: 2000,
      //   isClosable: true,
      // });

      if (res.data.data) {
        setorderData(res.data.data);
        setFormValues((prev) => ({
          ...prev,
          productName: "",
          quantity: 0,
          rate: "",
          price: 0,
          product: "",
          
        }));
      }
    } catch (error) {
      console.log(error);
      setIsAdding(false);
      // toast({
      //   title: error.response.data?.message,
      //   status: "error",
      //   position: " top-right",
      //   duration: 2000,
      //   isClosable: true,
      // });
    }
  };

  const filteredData =
    action === ""
      ? orderData?.products
      : orderData?.products?.filter((item) => item.status === action);
  const finalOutput = [];
  const AllocatedData = filteredData?.map((item) => finalOutput.push(item._id));
  const allocationData = {
    orderId: orderData?._id,
    productIds: finalOutput,
    reference: ref,
    bookDate: bookdate,
    charging: charging,
    invoiceRunCode: orderData?.invoiceRunCode?.code,
    paymentTerms: orderData?.paymentTerm?.days,
  };

  // if (action == "allocated") {
  //   allocationData.deliveryCharge = charging;
  // } else {
  //   allocationData.returnCharge = charging;
  // }

  // post api for allocated invoice
  const handleSubmit = async (event) => {
    event.preventDefault();
    setmodelLoading(true);

    try {
      const response = await axios.post(
        `${BaseURL}/order/${action === "allocated" ? "bookout" : "bookin"}`,
        allocationData,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        },
      );
      setmodelLoading(true);

      if (response.data.success) {
        setmodelLoading(false);

        // onClose();
        // toast({
        //   title: response.data?.message,
        //   status: "success",
        //   position: " top-right",
        //   duration: 2000,
        //   isClosable: true,
        // });

        router.push(
          `/order/note/${
            response.data.data.noteId
          }-${encodeURIComponent(response?.data?.data.deliveryType)}`,
        );
      } else {
        // Handle error response
        // toast({
        //   title: response.data?.message,
        //   status: "success",
        //   position: " top-right",
        //   duration: 2000,
        //   isClosable: true,
        // });
        setmodelLoading(false);
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message || "server error",
        life: 3000,
      });
      // toast({
      //   title: error.response.data?.message,
      //   status: "error",
      //   position: " top-right",
      //   duration: 2000,
      //   isClosable: true,
      // });
      // Handle network error
      setmodelLoading(false);
      console.error("Error submitting order:", error);
    }
  };

  useEffect(() => {
    const fetchListViewData = async () => {
      setfetchProductLoading(true);
      try {
        const res = await axios.get(
          orderData?.depot?.name == undefined
            ? `${BaseURL}/order/product/list?vendorId=${user._id}&search=${debouncedSearch}`
            : `${BaseURL}/order/product/list?vendorId=${user._id}&search=${debouncedSearch}&depots=${orderData?.depot?.name}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.data.success) {
          setfetchProductLoading(false);
          setData(res.data.data);
        }
      } catch (error) {
        setfetchProductLoading(false);
        // toast({
        //   title: error.response.data?.message,
        //   status: "error",
        //   position: " top-right",
        //   duration: 2000,
        //   isClosable: true,
        // });
      }
    };
    fetchListViewData();
  }, [debouncedSearch, setfetchProductLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  useEffect(() => {
    const fetchRateDefinitions = async () => {
      if (!token) return;
      try {
        const response = await axios.get(
          `${BaseURL}/rate-definition/minimum-rental-periods`,
          {
            headers: { authorization: `Bearer ${token}` },
          },
        );
        setminDay(response.data?.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchRateDefinitions();
  }, [token]); // Runs when `token` or `refresh` changes

  // if (orderLoading) {
  //   return (
  //     <section className="flex h-screen items-center justify-center">
  //       <Loader />
  //     </section>
  //   );
  // }

  // if (error) {
  //   return (
  //     <section className="flex h-screen items-center justify-center">
  //       <label>{error}</label>
  //     </section>
  //   );
  // }
  const rateTitleHandle = (item) => {
    if (item === "daily") {
      return "Daily";
    }
    if (item === "monthly") {
      return "Monthly";
    }
    if (item === "sale-price") {
      return "Sale";
    }

    if (
      item === "weekly-5" ||
      item === "weekly-7" ||
      item === "weekly-minimum"
    ) {
      return "Weekly";
    }
  };

  const checkStatusFlag = (item) => {
    if (item === "allocated") {
      return "Items (Book Out)";
    }
    if (item === "onrent") {
      return "Items (Book In)";
    } else {
      return "Quick Pick";
    }
  };
  const handleActionChange = (e) => setaction(e.value);

  const handleStock = () => {
    let orgProduct = _.find(data, { id: formValues.product });
    if (orgProduct == undefined) {
      return undefined;
    }
    if (formValues.quantity <= orgProduct?.quantity) {
      return true;
    }
    return false;
  };

  function isCurrentDateGreaterThanChargingDate(chargingDate) {
    const currentDate = new Date();
    const chargingDateObj = new Date(chargingDate);

    if (currentDate == chargingDateObj) {
      return true;
    } else if (currentDate <= chargingDateObj) {
      return true;
    } else {
      return false;
    }
  }
  const fetchRandomWord = async (order) => {
    setrefLoader(true);
    try {
      const response = await fetch(
        "https://random-word-api.herokuapp.com/word?length=4",
      );
      const data = await response.json();

      if (data.length > 0) {
        const word = data[0];
        const date = new Date(order?.createdAt);
        const formattedDate = date
          .toLocaleDateString("en-GB")
          .split("/")
          .join("");
        setrefLoader(false);
        setgenerateRef(`${word}${formattedDate}`);
      }
    } catch (error) {
      setrefLoader(false);
      console.error("Error fetching word:", error);
    }
  };

  const generateRefrence = (item) => {
    setrefLoader(true);
    fetchRandomWord(item);
  };

  useEffect(() => {
    setref(generateRef);
  }, [generateRef]);
  function checkChargingDate(chargingStartDate) {
    const currentDate = new Date();
    const chargingStart = new Date(chargingStartDate);

    // Check if the chargingStartDate is today (ignoring the time part)
    if (
      currentDate.getFullYear() === chargingStart.getFullYear() &&
      currentDate.getMonth() === chargingStart.getMonth() &&
      currentDate.getDate() === chargingStart.getDate()
    ) {
      return true;
    }

    // Check if current date is before the charging start date
    if (currentDate < chargingStart) {
      return true;
    }

    return false;
  }

  const dateAvailable = checkChargingDate(orderData?.chargingStartDate);
  const hasAllocatedStatus = orderData?.products?.some(
    (item) => item.status === "allocated",
  );
  const hasOnrentdStatus = orderData?.products?.some(
    (item) => item.status === "onrent",
  );



  return (
    <div>
      <div className="flex gap-3">
        <GoPrevious route={"/order/create"} />
        <Toast ref={toast} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white ">
          Order Detail
        </h2>
      </div>
      
      <TabView className="mt-4">
        <TabPanel header="Order Details">
          <div className="rounded-lg border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Personal Details */}
          <div className="grid grid-cols-2">
            <div className="">
              <div
                className={`h-50 w-50 ${
                  true ? "bg-slate-400" : "bg-orangecolor"
                }  flex items-center justify-center rounded-md text-white`}
              >
                <TbFileInvoice className="text-[100px]" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-dark-2 dark:text-white md:text-2xl">
                <Link
                  className="font-semibold  capitalize text-[#337ab7]"
                  href={`/customer/${orderData?.customerId}`}
                >
                  {orderData?.billingPlaceName}
                </Link>
              </h2>
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Number:
                </span>
                <span className="text-dark-2 dark:text-white">
                  {" "}
                  {orderData?.orderId}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Depot:
                </span>
                {orderData?.depot?.name == null ? (
                  "Default"
                ) : (
                  <span className="text-dark-2 dark:text-white">
                    {" "}
                    <Link
                      className="font-semibold  capitalize text-[#337ab7]"
                      href={`/system-setup/depots/detail/${orderData?.depot?._id ?? "Default"}`}
                    >
                      {orderData?.depot?.name}
                    </Link>
                  </span>
                )}
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Invoice Run Code:
                </span>

                <span className="text-dark-2 dark:text-white">
                  {" "}
                  <Link
                    className="font-semibold  capitalize text-[#337ab7]"
                    href={`/system-setup/invoice-run-code/update/${orderData?.invoiceRunCode?._id}`}
                  >
                    {orderData?.invoiceRunCode?.name || ""}
                  </Link>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Delivery Address:
                </span>
                <span className="text-dark-2 dark:text-white">
                  {`${orderData?.address1 || ""}
                 ${orderData?.city || ""},  ${orderData?.country || ""}`}
                </span>
              </div>
              {orderData?.maintenanceConfig?.enabled && (
                <div className="flex items-start gap-2">
                  <span className="font-medium text-dark-2 dark:text-white">
                    Maintenance Route:
                  </span>
                  <RouteAssignmentBadge order={orderData} size="normal" />
                </div>
              )}
            </div>
          </div>
          {/* Payment Details */}
          <div>
            <h3 className="text-lg font-semibold text-dark-2 dark:text-white">
              Payments
            </h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Order Date:
                </span>
                <span className="text-dark-2 dark:text-white">
                  {" "}
                  {moment(orderData?.orderDate).format("ll")}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Delivery Date:
                </span>
                <span className="text-dark-2 dark:text-white">
                  {moment(orderData?.deliveryDate).format("ll")}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Charging Start Date:
                </span>
                <span className="text-dark-2 dark:text-white">
                  {moment(orderData?.chargingStartDate).format("ll")}
                </span>
              </div>
              {orderData?.isPaid && (
                <div className="flex items-start gap-2">
                  <span className="font-medium text-dark-2 dark:text-white">
                    Next billing cycle Date:
                  </span>
                  <span className="text-dark-2 dark:text-white">
                    {moment(orderData?.recurringCycleDate).format("ll")}
                  </span>
                </div>
              )}
              {orderData?.useExpectedReturnDate && (
                <div className="flex items-start gap-2">
                  <span className="font-medium text-dark-2 dark:text-white">
                    Expected Return Date:
                  </span>
                  <span className="text-dark-2 dark:text-white">
                    {moment(orderData?.expectedReturnDate).format("ll")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 rounded-lg border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <div className="">
          <div className="my-3 flex items-center justify-between">
            <h2 className="mb-1 text-lg font-semibold">
              {action === "allocated"
                ? "Allocated Action"
                : action === "onrent"
                  ? "On Rent Action"
                  : "Choose Action"}
            </h2>
            <div className="flex gap-4">
              {action === "allocated" && (
                <div className="flex gap-3">
                  <Button
                    label={`Accept Book Out (${filteredData.length})`}
                    className="p-button-sm"
                    disabled={filteredData.length === 0}
                    onClick={() => setDialogVisible(true)}
                  />
                  <Button
                    label="Cancel"
                    className="p-button-sm p-button-danger"
                    onClick={() => setaction("")}
                  />
                </div>
              )}
              {action === "onrent" && (
                <div className="flex gap-3">
                  <Button
                    label={`Accept Book In (${filteredData.length})`}
                    className="p-button-sm"
                    disabled={filteredData.length === 0 || !bookdate}
                    onClick={() => setDialogVisible(true)}
                  />
                  <Button
                    label="Cancel"
                    className="p-button-sm p-button-danger"
                    onClick={() => setaction("")}
                  />
                </div>
              )}
              {(hasAllocatedStatus || hasOnrentdStatus) && (
                <Dropdown
                  value={action}
                  onChange={handleActionChange}
                  options={[
                    ...(hasAllocatedStatus
                      ? [{ label: "Book Out", value: "allocated" }]
                      : []),
                    ...(hasOnrentdStatus
                      ? [{ label: "Book In", value: "onrent" }]
                      : []),
                  ]}
                  placeholder="Action"
                  className="w-36"
                />
              )}
            </div>
          </div>

          <Dialog
            visible={dialogVisible}
            onHide={() => setDialogVisible(false)}
            header="Confirmation"
            footer={
              <div>
                <Button
                  label={action === "allocated" ? "Book Out" : "Book In"}
                  loading={modelLoading}
                  icon="pi pi-check"
                  onClick={handleSubmit}
                  className="p-button-sm p-button-warning"
                />
                <Button
                  label="Cancel"
                  icon="pi pi-times"
                  onClick={() => setDialogVisible(false)}
                  className="p-button-sm p-button-secondary"
                />
              </div>
            }
          >
            <p>
              Are you sure you want to{" "}
              {action === "allocated" ? "Book Out" : "Book In"} the selected
              item?
            </p>
          </Dialog>

          {(action === "allocated" || action === "onrent") && (
            <div className="mb-4">
              <h3 className="text-md py-2 font-semibold">
                {action === "allocated" ? "Book Out" : "Book In"} Details (
                {filteredData.length} Selected)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {/* <div className="flex flex-col">
                  <label className="mb-1 text-sm">Reference</label>
                  <InputText
                    value={ref}
                    onChange={(e) => setref(e.target.value)}
                    placeholder="Enter Reference"
                    className="w-full"
                  />
                </div> */}
                <div className="flex flex-col gap-1">
                  <label>Reference</label>
                  <div className="p-inputgroup flex-1">
                    <InputText
                      placeholder="Reference"
                      value={ref}
                      onChange={(e) => setref(e.target.value)}
                    />
                    {ref == "" ? (
                      <Button
                        tooltip="Generate Refrence"
                        loading={refLoader}
                        onClick={() => generateRefrence(orderData)}
                        tooltipOptions={{ showDelay: 100, hideDelay: 100 }}
                        icon="pi pi-sync"
                      />
                    ) : (
                      <Button
                        onClick={() => setref("")}
                        icon="pi pi-times"
                        className="p-button-danger"
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm">
                    {action === "allocated" ? "Book Out Date" : "Book In Date"}
                  </label>
                  <Calendar
                    value={bookdate}
                    onChange={(e) => setbookdate(e.value)}
                    showIcon
                    dateFormat="yy-mm-dd"
                    placeholder="Select Date"
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm">
                    {action === "allocated"
                      ? "Delivery Charging"
                      : "Collection Charging"}
                  </label>
                  <InputText
                    value={charging}
                    onChange={(e) => setcharging(e.target.value)}
                    placeholder="Enter Charging Amount"
                    type="number"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
          {/* {!orderData?.isRecurringCycle && <> */}
          {action !== "allocated" && action !== "onrent" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Product Name</label>
                {/*    <InputText
            name="productName"
            value={formValues.productName}
            onChange={handleInputChange}
            placeholder="Enter Product Name"
            className="w-full"
          /> */}
                <CustomComboBox
                  loading={fetchProductLoading}
                  options={data}
                  placeholder="Product"
                  onChange={handleInputChange}
                  formData={formValues}
                  setFormData={setFormValues}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-sm">Quantity</label>
                  <InputText
                    textColor={
                      handleStock() == undefined
                        ? ""
                        : !handleStock()
                          ? "crimson"
                          : ""
                    }
                    focusBorderColor={
                      handleStock() == undefined
                        ? ""
                        : !handleStock()
                          ? "crimson"
                          : ""
                    }
                    borderColor={
                      handleStock() == undefined
                        ? ""
                        : !handleStock()
                          ? "crimson"
                          : ""
                    }
                    name="quantity"
                    type="number"
                    className="w-full"
                    value={formValues.quantity}
                    onChange={handleInputChange}
                  />
                </div>
                {formValues.status != "Sale" && (
                  <div className="flex flex-col">
                    <label className="text-[0.9em]">
                      Minimum Rental Period
                    </label>
                    <div className="">
                      {formValues.rate != "sale-price" ? (
                        // <InputText
                        //   isReadOnly
                        //   className="w-full"
                        //   name="rate"
                        //   value={formValues.rate}
                        //   onChange={handleInputChange}
                        // />

                        <Dropdown
                          name="minimumRentalPeriod"
                          value={formValues.minimumRentalPeriod}
                          options={minDay}
                          // optionLabel="name"
                          // optionValue="minimumRentalPeriod"
                          onChange={handleInputChange}
                          className="md:w-14rem w-full text-[0.9em]"
                          checkmark={true}
                          highlightOnSelect={false}
                        />
                      ) : (
                        <InputText value={"Sale"} disabled />
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[0.9em]">
                    {rateTitleHandle(formValues.rate)} Price
                  </label>

                  <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">{currencyKey}</span>
                    <InputText
                      name="price"
                      type="Number"
                      value={formValues.price}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center pt-6">
                  {!handleStock() ? (
                    <div className=" ">
                      <Button loading={isAdding} label="Add" />
                    </div>
                  ) : (
                    <div className="">
                      <Button
                      onClick={handleClic}
                      loading={isAdding}
                      label="Add"
                      icon={"pi pi-plus"}
                    />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* </>} */}
        </div>
      </div>
          <div className="my-4 " />
          <div className="rounded-lg border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <OrderProductTable
              orderId={orderData?.orderId}
              orderCompleteId={orderData?._id}
              thData={[
                "Name",
                "Status",
                "Type",
                "Qty",
                "Price",
                "Tax",
                "Total",
                " ",
              ]}
              trData={filteredData}
              setorderData={setorderData}
            />
          </div>
        </TabPanel>
        
        <TabPanel header="Maintenance History">
          {orderData?._id && (
            <>
              <MaintenanceHistoryTest orderId={orderData._id} />
              <MaintenanceHistoryPanel
                orderId={orderData._id}
                orderDetails={orderData}
              />
            </>
          )}
        </TabPanel>
      </TabView>
    </div>
  );
};

export default ViewOrder;
