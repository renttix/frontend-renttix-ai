"use client";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useRef, useState } from "react";

import { BaseURL } from "../../../utils/baseUrl";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import useDebounce from "@/hooks/useDebounce";
import { FaRegClone, FaClone } from "react-icons/fa";

import { Toast } from "primereact/toast";

import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import apiServices from "../../../services/apiService";
import CanceButton from "../Buttons/CanceButton";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import AddDepotsModal from "../system-setup/depots/AddDepotsModal";
import AddPaymentTermsModal from "../system-setup/payment-terms/AddPaymentTermsModal";
import CreateInvoiceRunCodeModel from "../system-setup/invoice-run-code/CreateInvoiceRunCodeModel";
import CreateCustomerModal from "../customer/CreateCustomerModal";
import { Skeleton } from "primereact/skeleton";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputSwitch } from "primereact/inputswitch";
import ConfirmLink from "../confirmLink/ConfirmLink";
import { setDirty, clearDirty } from "../../store/dirtySlice";
import PhoneInputField from "../PhoneInputField/PhoneInputField";

const CreateOrder = () => {
  const [data, setData] = useState([]);
  const toast = useRef(null);
  const router = useRouter();
  const [loading, setloading] = useState(false);
  const [searchLoading, setsearchLoading] = useState(false);
  const [searchDetailLocation, setsearchDetailLocation] = useState(false);
  const [error, seterror] = useState(false);
  const { user } = useSelector((state) => state?.authReducer);
  const [paymetTermData, setpaymetTermData] = useState([]);
  const [invoiceRunData, setinvoiceRunData] = useState([]);
  const { token } = useSelector((state) => state?.authReducer);
  const todayDate = new Date();
  const formattedDate = todayDate.toISOString().split("T")[0];
  const [populateDate, setpopulateDate] = useState("");
  const [code, setcode] = useState("");
  const [depotsData, setdepotsData] = useState([]);
  const [paymentTermsValue, setpaymentTermsValue] = useState({});
  const [invoiceRunCodeValue, setinvoiceRunCodeValue] = useState({});
  const [depotvalue, setdepotvalue] = useState({});
  const [phone, setPhone] = useState("");
  const [paymentTermsRefresh, setpaymentTermsRefresh] = useState(false); // State to trigger refresh
  const [depotRefresh, setdepotRefresh] = useState(false);
  const [invoiceRunCodeRefresh, setinvoiceRunCodeRefresh] = useState(false);
  const [customerRefresh, setcustomerRefresh] = useState(false);

  const [selectedAccount, setselectedAccount] = useState(null);
  const [cloneCustomerAddress, setcloneCustomerAddress] = useState(null);

  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [isCopy, setisCopy] = useState(false);
  const [isread, setisread] = useState(false);

  const [formData, setFormData] = useState({
    account: "",
    billingPlaceName: "",
    address1: "",
    address2: "",
    city: "",
    country: "",
    postcode: "",
    orderDate: formattedDate,
    instruction: "",
    deliveryPlaceName: "",
    deliveryAddress1: "",
    deliveryAddress2: "",
    email: "",
    deliveryCity: "",
    deliveryCountry: "",
    deliveryPostcode: "",
    deliveryDate: formattedDate,
    chargingStartDate: "",
    useExpectedReturnDate: false,
    expectedReturnDate: "",
    customerReference: "",
    siteContact: "",
    salesPerson: "",
    invoiceInBatch: 0,
    orderedBy: "",

    billingPeriod: "",
    vendorId: user?._id,
    customerId: "",
    cunstomerQuickbookId: "",
  });
  const dispatch = useDispatch();

  const debouncedSearchForAddress = useDebounce(query, 1000); // Add debounce with a 500ms delay
  const refreshInvoiceRun = () => setinvoiceRunCodeRefresh((prev) => !prev);
  const refreshPaymentTerms = () => {
    setpaymentTermsRefresh((prev) => !prev);
  };
  const refreshDepots = () => {
    setdepotRefresh((prev) => !prev);
  };
  const refresCustomerss = () => {
    setcustomerRefresh((prev) => !prev);
  };
  const selectedAccountTemplate = (option, props) => {
    if (option) {
      return (
        <div className="align-items-center flex">
          {/* <img
            alt={option.name.name}
            src={`${imageBaseURL}${option.thumbnail}`}
            className={`flag mr-2 flag-${option.name.name.toLowerCase()}`}
            style={{ width: "18px" }}
          /> */}
          <div>{option.name.name}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const fetchData = async () => {
    setloading(true);
    try {
      const response = await apiServices.get(`/depots?limit=${1000}}`);
      const result = response.data;
      if (result.success) {
        const defaults = {
          _id: "111111123456789123456789",
          name: "Default",
          description: "Default united kingdom loaction",
          code: "1234",
          email: "default@gmail.com",
          telephone: "+1 (813) 965-3335",
          fax: "34343",
          website: "https://www.xafugolycujuk.org.uk",
          address1: "Qui modi soluta nisi",
          address2: "Animi illo nostrum ",
          city: "Default",
          country: "Default",
          postCode: "1234",
        };
        setdepotsData([defaults, ...result.data]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [depotRefresh]);
  useEffect(() => {
    if (selectedAccount == undefined) {
      setFormData({
        ...formData,
        billingPlaceName: "",
        account: "",
        address1: "",
        address2: "",
        city: "",
        country: "",
        postcode: "",
        customerId: "",
        cunstomerQuickbookId: "",
      });
      setpaymentTermsValue("");
      setinvoiceRunCodeValue("");
    } else {
      const {
        name,
        addressLine1,
        email,
        addressLine2,
        city,
        country,
        postCode,
        _id,
        customerID,
        invoiceRunCode,
        paymentTerm,
        telephone
      } = selectedAccount;
      setFormData({
        ...formData,
        billingPlaceName: name?.name || "",
        account: name?.name || "",
        email: email || "",
        address1: addressLine1 || "",
        address2: addressLine2 || "",
        city: city || "",
        country: country || "",
        postcode: postCode || "",
        customerId: _id || "",
        cunstomerQuickbookId: customerID || "",
      });
      setpaymentTermsValue(paymentTerm?._id || "");
      setinvoiceRunCodeValue(invoiceRunCode?._id || "");
            setPhone(telephone)

    }
  }, [selectedAccount]);

  useEffect(() => {
    if (cloneCustomerAddress == undefined) {
      setFormData({
        ...formData,
        deliveryAddress1: "",
        deliveryAddress2: "",
        email: "",
        deliveryCity: "",
        deliveryCountry: "",
        deliveryPostcode: "",
      });
    } else {
      const {
        deliveryAddress1,
        deliveryAddress2,
        deliveryCity,
        deliveryCountry,
        deliveryPostcode,
      } = cloneCustomerAddress;
      setFormData({
        ...formData,
        deliveryAddress1: deliveryAddress1 || "",
        deliveryAddress2: deliveryAddress2 || "",
        deliveryCity: deliveryCity || "",
        deliveryCountry: deliveryCountry || "",
        deliveryPostcode: deliveryPostcode || "",

      });
    }
  }, [cloneCustomerAddress]);

  const clearAddress = () => {
    setisCopy(false);
    setcloneCustomerAddress({
      deliveryAddress1: "",
      deliveryAddress2: "",

      deliveryCity: "",
      deliveryCountry: "",
      deliveryPostcode: "",
    });
  };

  const handleInputChangeAddress = async () => {
    dispatch(setDirty());
    setsearchLoading(true);
    try {
      const response = await axios.get(
        `${BaseURL}/google/location-suggestions`,
        {
          params: { query: debouncedSearchForAddress },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setsearchLoading(false);

      setLocations(response.data.suggestions);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.error || "Failed to fetch location data",
      });
      console.error("Error fetching location data:", error);
      setsearchLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearchForAddress) {
      handleInputChangeAddress();
    }
  }, [debouncedSearchForAddress]);

  // const handleLocationSelect = (location) => {
  //   setisread(true);
  //   setQuery(``);
  //   setFormData({
  //     ...formData,
  //     state: location.region,
  //     deliveryAddress1: `${location.name}, ${location.region}, ${location.country}`,
  //     deliveryAddress2: `${location.name}, ${location.region}, ${location.region}, ${location.country}`,
  //     deliveryCity: location.county,
  //     deliveryCountry: location.country,
  //   });

  //   setLocations([]);
  // };
  const handleLocationSelect = async (location) => {
    dispatch(setDirty());
    setsearchDetailLocation(true);
    try {
      setisread(true);
      setQuery(``);
      setLocations([]);
      const response = await axios.get(`${BaseURL}/google/place-details`, {
        params: { place_id: location.place_id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setsearchDetailLocation(false);

      setisread(true);
      setQuery(``);
      console.log("Full Address Details:", response.data);
      let locationData = response.data;
      setFormData({
        ...formData,
        state: locationData.state,
        deliveryAddress1: `${locationData.formattedAddress}`,
        deliveryAddress2: `${locationData.formattedAddress}, ${locationData.city}, ${locationData.state}, ${locationData.country}`,
        deliveryCity: locationData.city,
        deliveryCountry: locationData.country,
        deliveryPostcode: locationData.postalCode,
      });
      // setSelectedLocation(response.data);
      setsearchDetailLocation(false);
    } catch (error) {
      console.error("Error fetching place details:", error);
      setsearchDetailLocation(false);
    }
  };
  const clearAddressSearch = () => {
    setisread(false);
    setFormData({
      state: "",
      deliveryCountry: "",
      deliveryAddress1: "",
      deliveryAddress2: "",
      deliveryCity: "",
      deliveryPostcode: "",
    });
    setQuery("");
  };

  const copyAdress = () => {
    setisCopy(true);
    setcloneCustomerAddress({
      deliveryAddress1: formData.address1,
      deliveryAddress2: formData.address2,

      deliveryCity: formData.city,
      deliveryCountry: formData.country,
      deliveryPostcode: formData.postcode,
    });
  };

  const countryOptionTemplate = (option) => {
    return (
      <div className="align-items-center flex">
        {/* <img
          alt={option.name.name}
          src={`${imageBaseURL}${option.thumbnail}`}
          className={`flag mr-2 flag-${option.name.name.toLowerCase()}`}
          style={{ width: "18px" }}
        /> */}
        <div>{option.name.name}</div>
        <div className="ml-4">{option.type}</div>
        {/* <div className="ml-4">{option.active ? "Active" : "Disabled"}</div> */}
      </div>
    );
  };
  useEffect(() => {
    setpopulateDate(formData.deliveryDate);
  }, [formData.deliveryDate]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      chargingStartDate: populateDate,
    }));
  }, [populateDate]);

  const debouncedSearch = useDebounce(formData.account, 500); // Add debounce with a 500ms delay

  const handleInputChange = (event) => {
    dispatch(setDirty());
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSwitchChange = (event) => {
    dispatch(setDirty());
    const { name, value, type, checked } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleComboBoxChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      account: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${BaseURL}/order/customer?vendorId=${user?._id}&limit=${1000}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.success) {
        setData(result?.data);
      } else {
        seterror(result?.message);
      }
    };
    fetchData();
  }, [debouncedSearch, user, customerRefresh]);
  const handleSubmit = async (event) => {
    dispatch(clearDirty());
    const orderPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      orderPayload.append(key, value);
    });
    orderPayload.append("invoiceRunCode", invoiceRunCodeValue._id ?? "");
    orderPayload.append("paymentTerm", paymentTermsValue._id ?? "");
    if (depotvalue?.name !== "Default") {
      orderPayload.append("depot", depotvalue?._id || "");
    }
    orderPayload.append("phoneNumber", phone ?? "");
    setloading(true);
    event.preventDefault();

    try {
      const response = await axios.post(
        `${BaseURL}/order/create-order`,
        orderPayload,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        router.push(`/order/${response.data.data._id}`);
        setloading(false);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: response.data?.message,
          life: 3000,
        });
      } else {
        // Handle error response
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: response.data?.message,
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message,
        life: 3000,
      });
      // Handle network error
      setloading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      //   setloading(true);
      const response = await axios.get(`${BaseURL}/payment-terms`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setpaymetTermData(response.data.data);
      } else {
        console.log(response?.data?.message);
      }
    };
    fetchData();
  }, [paymentTermsRefresh]);

  useEffect(() => {
    const fetchData = async () => {
      //   setloading(true);
      const response = await axios.get(`${BaseURL}/invoice-run-code`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setinvoiceRunData(response.data.data);
      } else {
        console.log(response?.data?.message);
      }
    };
    fetchData();
  }, [invoiceRunCodeRefresh]);

  const isPaymentTermID = paymetTermData?.filter(
    (item) => item._id === formData.paymentTerm,
  );

  const invoiceRun = invoiceRunData?.filter(
    (item) => item._id === formData.invoiceRunCode,
  );

  const today = new Date().toISOString().split("T")[0];
  const isRequired = () => {
    return <span className="text-red">*</span>;
  };
useEffect(() => {
  if (!selectedAccount) return;

  // grab the customer’s own IDs
  const { paymentTerm, invoiceRunCode } = selectedAccount;

  // find the full option objects in your loaded arrays
  const defaultPT = paymetTermData.find(pt => pt._id === paymentTerm?._id);
  const defaultIR = invoiceRunData.find(ir => ir._id === invoiceRunCode?._id);

  if (defaultPT)      setpaymentTermsValue(defaultPT);
  if (defaultIR)      setinvoiceRunCodeValue(defaultIR);
}, [selectedAccount, paymetTermData, invoiceRunData]);
  return (
    <div>
      {/* <Breadcrumb pageName="Create Order" /> */}

      <div className="flex gap-3">
        <GoPrevious route={"/order/list"} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white ">
          Create Order
        </h2>
      </div>
      <Toast ref={toast} position="top-right" />
      <div class="grid grid-cols-10 gap-4">
        <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Name and Description</h3>
        </div>
        <div class="col-span-8 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-8 lg:col-span-8 xl:col-span-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            <div className="">
              {/* <label className="mt-2.5 block text-[0.9em] font-bold  text-black">
                Select Customer {isRequired()}
              </label> */}

              <div className="mt-1 flex items-center justify-between">
                {/* <Link
                  href={"/customer/listing"}
                  className="block p-0 text-[0.9em] font-bold text-blue-500"
                >
                  Select Customer {isRequired()}
                </Link> */}
                <ConfirmLink href={"/customer/listing"}>
                  <label className="mt-2.5 block cursor-pointer text-[0.9em] font-bold text-blue-500">
                    Select Customer {isRequired()}
                  </label>
                </ConfirmLink>
                <CreateCustomerModal refreshParent={refresCustomerss} />
              </div>

              {/* <InputText
                name="productName"
                placeholder="Product Name"
                value={formData.productName}
                onChange={handleInputChange}
              /> */}
              <Dropdown
                value={selectedAccount}
                onChange={(e) => {
                  dispatch(setDirty());
                  setselectedAccount(e.value);
                }}
                options={data}
                optionLabel="name"
                placeholder="Select customer"
                showClear
                filter
                valueTemplate={selectedAccountTemplate}
                itemTemplate={countryOptionTemplate}
                className="md:w-14rem w-full"
              />

              {error && formData.productName == ""
                ? formData.productName == "" && (
                    <label className="text-[0.8em] text-red">
                      Product name is required.
                    </label>
                  )
                : ""}
            </div>
            <div className="">
              <label className="mt-2.5 block text-[0.9em] font-bold text-black">
                Order Date {isRequired()}
              </label>
              <InputText
                name="orderDate"
                type="date"
                min={today}
                value={formData.orderDate}
                onChange={handleInputChange}
              />

              {formData.orderDate === "" && (
                <label className="text-[0.8em] text-red">
                  Order Date is required.
                </label>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            <div className="">
              <label className="mt-2.5 block text-[0.9em] font-bold  text-black">
                Delivery Date {isRequired()}
              </label>
              <InputText
                isDisabled={formData.orderDate === ""}
                name="deliveryDate"
                type="date"
                min={formData.orderDate}
                value={formData.deliveryDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="">
              <label className="mt-2.5 block text-[0.9em] font-bold text-black">
                Charging Start Date {isRequired()}
              </label>
              <InputText
                isDisabled={formData.deliveryDate === ""}
                name="chargingStartDate"
                type="date"
                min={formData.deliveryDate}
                value={formData.chargingStartDate}
                onChange={handleInputChange}
              />
              {formData.chargingStartDate === "" && (
                <label className="text-[0.8em] text-red">
                  Charging Start Date is required.
                </label>
              )}
            </div>
            <div className="flex flex-col py-4">
              <label className="mt-2.5 block text-[0.9em] font-bold text-black">
                Use Expected Return Date
              </label>

              <InputSwitch
                className="py-3"
                name="useExpectedReturnDate"
                checked={formData.useExpectedReturnDate}
                onChange={handleSwitchChange}
              />
            </div>
            <div className="">
              {formData.useExpectedReturnDate && (
                <>
                  <label className="mt-2.5 block text-[0.9em] font-bold text-black">
                    Estimate Return Date {isRequired()}
                  </label>
                  <InputText
                    name="expectedReturnDate"
                    type="date"
                    min={formData.chargingStartDate}
                    value={formData.expectedReturnDate}
                    onChange={handleInputChange}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <hr className="hr my-6" />
      <div class="mt-4 grid grid-cols-10 gap-8">
        <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Addresses</h3>
        </div>
        <div class="col-span-8 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-8 lg:col-span-8 xl:col-span-5">
          <label htmlFor="">Billing Place </label>
          <label className="mt-2.5 block text-[0.9em] font-bold  text-black">
            Address {isRequired()}
          </label>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            <div className="">
              <InputText
                name="address1"
                type="text"
                placeholder="Address 1"
                value={formData.address1}
                onChange={handleInputChange}
              />
            </div>
            <div className="">
              <InputText
                name="address2"
                type="text"
                placeholder="Address 2"
                value={formData.address2}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="">
              <InputText
                name="city"
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
              />
              {formData.city === "" && (
                <label className="text-[0.8em] text-red">
                  City is Required.
                </label>
              )}
            </div>
            <div className="">
              <InputText
                name="country"
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
              />
              {formData.country === "" && (
                <label className="text-[0.8em] text-red">
                  Country is Required.
                </label>
              )}
            </div>
            <div className="">
              <InputText
                name="postcode"
                type="text"
                placeholder="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
              />
              {formData.postcode === "" && (
                <label className="text-[0.8em] text-red">
                  Post code is Required.
                </label>
              )}
            </div>
          </div>

          <div className="flex  items-center justify-between gap-8">
            <div className="flex w-full justify-between">
              <label htmlFor="">Delivery Place </label>
              <div className="">
                {searchDetailLocation && (
                  <ProgressSpinner style={{ width: "30px", height: "30px" }} />
                )}
              </div>
            </div>
            {formData.address1 != "" && (
              <>
                {!isCopy ? (
                  <FaRegClone
                    className="cloneAdress cursor-pointer"
                    onClick={copyAdress}
                  />
                ) : (
                  <FaClone
                    className="cloneAdress cursor-pointer"
                    data-pr-tooltip="Copy billing address"
                    onClick={clearAddress}
                  />
                )}
              </>
            )}
          </div>
          <div className="relative my-3">
            <IconField className="mb-1">
              {formData.deliveryAddress1.length != "" ? (
                <InputIcon
                  className="pi pi-times cursor-pointer text-2xl"
                  onClick={() => clearAddressSearch()}
                  color="orange.500"
                ></InputIcon>
              ) : (
                <InputIcon className="pi pi-search"> </InputIcon>
              )}
              <div className="p-inputgroup flex-1">
                <Button>Search</Button>

                <InputText
                  isReadOnly={isread}
                  // onChange={handleChange}
                  // value={values.street}
                  value={query}
                  className=" w-full truncate"
                  onChange={(e) => setQuery(e.target.value)}
                  name="street"
                  placeholder="Search Address"
                />
              </div>
            </IconField>

            {searchLoading ? (
              <>
                <Skeleton className="mb-2"></Skeleton>
                <Skeleton className="mb-2"></Skeleton>
                <Skeleton className="mb-2"></Skeleton>
              </>
            ) : (
              <>
                {" "}
                {locations.length !== 0 && (
                  <div
                    className={`absolute z-999999 h-auto w-auto overflow-x-auto rounded-xl border bg-gray  px-3 py-1 `}
                  >
                    <ol className="text-[16px]">
                      {locations.map((location, index) => (
                        <li
                          className={`${
                            index == locations.length - 1 ? "" : "border-b-2 "
                          } cursor-pointer py-1`}
                          key={index}
                          onClick={() => handleLocationSelect(location)} // Update values on selection
                        >
                          {location.description}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1">
            <div className="">
              <InputText
                name="deliveryAddress1"
                type="text"
                placeholder="Address 1"
                value={formData.deliveryAddress1}
                onChange={handleInputChange}
              />
              {formData.deliveryAddress1 === "" && (
                <label className="text-[0.8em] text-red">
                  Address is Required.
                </label>
              )}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1">
            <div className="">
              <InputText
                name="deliveryAddress2"
                type="text"
                placeholder="Address 2"
                value={formData.deliveryAddress2}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="">
              <InputText
                name="deliveryCity"
                type="text"
                placeholder="City"
                value={formData.deliveryCity}
                onChange={handleInputChange}
              />
              {formData.deliveryCity === "" && (
                <label className="text-[0.8em] text-red">
                  City is Required.
                </label>
              )}
            </div>
            <div className="">
              <InputText
                name="deliveryCountry"
                type="text"
                placeholder="Country"
                value={formData.deliveryCountry}
                onChange={handleInputChange}
              />
              {formData.deliveryCountry === "" && (
                <label className="text-[0.8em] text-red">
                  Country is Required.
                </label>
              )}
            </div>
            <div className="">
              <InputText
                name="deliveryPostcode"
                type="text"
                placeholder="Postcode"
                value={formData.deliveryPostcode}
                onChange={handleInputChange}
              />
              {formData.deliveryPostcode === "" && (
                <label className="text-[0.8em] text-red">
                  Post code is Required.
                </label>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 ">
            <div className="w-full">
              <PhoneInputField value={phone} onChange={setPhone} />
            </div>
          </div>
        </div>
      </div>
      <hr className="hr my-5" />
      <div class="grid grid-cols-10 gap-4">
        <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Details</h3>
        </div>
        <div class="col-span-8 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-8 lg:col-span-8 xl:col-span-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            <div className="">
              <label className="mt-2.5 block text-[0.9em] font-bold  text-black">
                Customer Refrence
              </label>
              <InputText
                name="customerReference"
                type="text"
                placeholder="Reference"
                value={formData.customerReference}
                onChange={handleInputChange}
              />
            </div>
            <div className="">
              <label className="mt-2.5 block text-[0.9em] font-bold text-black">
                Order By
              </label>
              <InputText
                name="orderedBy"
                type="text"
                placeholder="Order By"
                value={formData.orderedBy}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            <div className="">
              {/* <Link
                className="mt-2.5 block text-[0.9em] font-bold text-[#337ab7] "
                href={"/system-setup/depots"}
              >
                Depot
                
              </Link> */}
              <div className="mt-2 flex w-full justify-between">
                <ConfirmLink href={"/system-setup/depots"}>
                  <label className="mt-2.5 block cursor-pointer text-[0.9em] font-bold text-blue-500">
                    Depots
                  </label>
                </ConfirmLink>
                <div className="">
                  <AddDepotsModal refreshParent={refreshDepots} />
                </div>
              </div>
              <Dropdown
                name="depotvalue"
                value={depotvalue}
                onChange={(e) => setdepotvalue(e.value)}
                options={depotsData}
                optionLabel="name"
                clearIcon
                showClear
                placeholder="Select"
                className="md:w-14rem w-full"
              />
            </div>
            <div className="">
              <label className="mt-2.5 block text-[0.9em] font-bold text-black">
                Sales Person
              </label>
              <InputText
                name="salesPerson"
                placeholder="Enter Sale Person"
                type="text"
                value={formData.salesPerson}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            <div className="">
              {/* <Link
                className="mt-2.5 block text-[0.9em] font-bold text-[#337ab7] "
                href={"/system-setup/invoice-run-code"}
              >
                Invoice Run Code
              </Link> */}
              <div className="mt-1 flex items-center justify-between">
                <ConfirmLink href={"/system-setup/invoice-run-code"}>
                  <label className="mt-2.5 block cursor-pointer text-[0.9em] font-bold text-blue-500">
                    Invoice Run Code
                  </label>
                </ConfirmLink>
                <CreateInvoiceRunCodeModel refreshParent={refreshInvoiceRun} />
              </div>
              <Dropdown
                name="invoiceRunCodeValue"
                value={invoiceRunCodeValue}
                onChange={(e) => setinvoiceRunCodeValue(e.value)}
                options={invoiceRunData}
                optionLabel="name"
                placeholder="Select Code"
                className="md:w-14rem w-full"
              />
            </div>
            <div className="">
              {/* <Link
                className="mt-2.5 block text-[0.9em] font-bold text-[#337ab7] "
                href={"/system-setup/payment-terms"}
              >
                Payment Terms
              </Link> */}
              <div className="mt-1 flex items-center justify-between">
                <ConfirmLink href={"/system-setup/payment-terms"}>
                  <label className="mt-2.5 block cursor-pointer text-[0.9em] font-bold text-blue-500">
                    Payment Terms
                  </label>
                </ConfirmLink>
                <AddPaymentTermsModal refreshParent={refreshPaymentTerms} />
              </div>
              <Dropdown
                name="paymentTermsValue"
                value={paymentTermsValue}
                onChange={(e) => setpaymentTermsValue(e.value)}
                options={paymetTermData}
                optionLabel="name"
                placeholder="Select Terms"
                className="md:w-14rem w-full"
              />
            </div>
            <div className=""></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1">
            <div>
              <label className="mt-2.5 block text-[0.9em] font-bold text-black">
                Instruction
              </label>
              <InputTextarea
                rows={6}
                name="instruction"
                placeholder="Write instruction..."
                value={formData.instruction}
                onChange={handleInputChange}
                className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
      <hr className="hr my-5" />
      <div class="mt-5 grid grid-cols-10 gap-4">
        <div class="col-span-2  p-4 ">
          {/* <h3 className="font-bold">Upload Product Photos </h3> */}
        </div>
        <div class="col-span-5  p-4">
          <div className="flex justify-end gap-7 ">
            <div className="">
              <CanceButton onClick={() => router.back()} />
            </div>
            <div className="">
              <Button
                size="small"
                loading={loading}
                label="Save"
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
