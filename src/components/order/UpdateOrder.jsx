"use client";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useRef, useState } from "react";
import { InputMask } from "primereact/inputmask";

import { BaseURL, imageBaseURL } from "../../../utils/baseUrl";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import useDebounce from "@/hooks/useDebounce";
import { FaRegClone, FaClone } from "react-icons/fa";

import { Toast } from "primereact/toast";
import moment from "moment";

import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { InputTextarea } from "primereact/inputtextarea";
import apiServices from "../../../services/apiService";
import Link from "next/link";
import CanceButton from "../Buttons/CanceButton";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import Loader from "../common/Loader";
import { InputSwitch } from "primereact/inputswitch";

const UpdateOrder = () => {
  const [data, setData] = useState([]);
  const toast = useRef(null);
  const router = useRouter();
  const [loading, setloading] = useState(false);
  const [isSelected, setisSelected] = useState(false);
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
  const [fetchLoading, setfetchLoading] = useState(false);

  const dateFormate = (item) => {
    console.log(item,'date')
    return moment(item).format("YYYY-DD-DD");
  };
  const params = useParams();

  const [selectedAccount, setselectedAccount] = useState(null);
  const [query, setquery] = useState('')
  const [cloneCustomerAddress, setcloneCustomerAddress] = useState(null);
  const [isCopy, setisCopy] = useState(false);

  console.log(selectedAccount,"selectedAccount")

  console.log(query,"query")
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

  useEffect(() => {
    const fetchCustomerData = async () => {
      setfetchLoading(true);
      try {
        const response = await axios.get(`${BaseURL}/order/${params.id}`, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });
  
        if (response.data.success) {
          setfetchLoading(false);
          const customerData = response.data.data;
          setFormData((prevData) => ({ ...prevData, ...customerData }));
  
          // Pre-fill selected values
          setselectedAccount(customerData?.customerId || null);
          setdepotvalue(customerData?.depot || null);
          setPhone(customerData.phoneNumber||'')
          setinvoiceRunCodeValue(customerData?.invoiceRunCode || null);
          setpaymentTermsValue(customerData?.paymentTerm || null);
        }
      } catch (error) {
        setfetchLoading(false);
        console.error("Error fetching customer data:", error);
      }
    };
  
    fetchCustomerData();
  }, []);
  

  useEffect(() => {
    if (data?.length > 0 && formData?.customerId) {
      const selectedCustomer = data.find(
        (cust) => cust._id === formData.customerId,
      );
      setselectedAccount(selectedCustomer || null);
    }
  }, [data, formData.customerId]);

  

  const selectedAccountTemplate = (option, props) => {
    if (option) {
      return (
        <div className="align-items-center flex">
          <img
            alt={option.name.name}
            src={`${imageBaseURL}${option.thumbnail}`}
            className={`flag mr-2 flag-${option.name.name.toLowerCase()}`}
            style={{ width: "18px" }}
          />
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
  }, []);
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
        addressLine2,
        city,
        country,
        postCode,
        _id,
        customerID,
        invoiceRunCode,
        paymentTerm,
      } = selectedAccount;
      setFormData({
        ...formData,
        billingPlaceName: selectedAccount?.name?.name || "",
        account: selectedAccount?.name?.name || "",
        address1: selectedAccount?.addressLine1 || "",
        address2: selectedAccount?.addressLine2 || "",
        city: selectedAccount?.city || "",
        country: selectedAccount?.country || "",
        postcode: selectedAccount?.postCode || "",
        customerId:selectedAccount?. _id || "",
        cunstomerQuickbookId: selectedAccount?.customerID || "",
      });
      setpaymentTermsValue(paymentTerm?._id || "");
      setinvoiceRunCodeValue(invoiceRunCode?._id || "");
    }
  }, []);

  useEffect(() => {
    if (cloneCustomerAddress == undefined) {
      setFormData({
        ...formData,
        deliveryAddress1: "",
        deliveryAddress2: "",

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

  const handleSwitchChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
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
        <img
          alt={option.name.name}
          src={`${imageBaseURL}${option.thumbnail}`}
          className={`flag mr-2 flag-${option.name.name.toLowerCase()}`}
          style={{ width: "18px" }}
        />
        <div>{option.name.name}</div>
        <div className="ml-4">{option.type}</div>
        {/* <div className="ml-4">{option.active ? "Active" : "Disabled"}</div> */}
      </div>
    );
  };
  // useEffect(() => {
  //   setpopulateDate(formData.deliveryDate);
  // }, [formData.deliveryDate]);

  // useEffect(() => {
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     chargingStartDate: populateDate,
  //   }));
  // }, [populateDate]);

  const debouncedSearch = useDebounce(formData.account, 500); // Add debounce with a 500ms delay

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };




  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${BaseURL}/order/customer?vendorId=${user?._id}&search=${debouncedSearch}&limit=${1000}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.success) {
        setData(result.customers);
      } else {
        seterror(result?.message);
      }
    };
    fetchData();
  }, [debouncedSearch, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setloading(true);
  
    const orderPayload = {
      ...formData,
      invoiceRunCode: invoiceRunCodeValue._id ?? "",
      paymentTerm: paymentTermsValue._id ?? "",
      phoneNumber: phone ?? "",
    };
  
    if (depotvalue?.name !== "Default") {
      orderPayload.depot = depotvalue?._id || "";
    }
  
    try {
      const response = await axios.put(
        `${BaseURL}/order/update-order/${params.id}`,
        orderPayload, 
        {
          headers: {
            "Content-Type": "application/json", 
            authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.data?.success) {
        // router.push(`/order/${response.data.data._id}`);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: response.data?.message || "Order updated successfully!",
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: response.data?.message || "Something went wrong!",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Network error occurred!",
        life: 3000,
      });
    } finally {
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
  }, []);

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
  }, []);

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

  if (fetchLoading) {
    return (
      <>
        <section className="flex h-screen items-center justify-center">
          <Loader />
        </section>
      </>
    );
  }

  return (
    <div>

      <div className="flex gap-3">
        <GoPrevious route={"/order/list"} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white ">
          Update Order
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
              <label className="mt-2.5 block text-[0.9em] font-bold  text-black">
                Select Customer {isRequired()}
              </label>
         
              <Dropdown
                value={selectedAccount}
                onChange={(e) =>{
                    setselectedAccount(e.value)
                    
                }}
                options={data}
                optionLabel="name"
                onFilter={(e)=>setquery(e.filter)}
                placeholder="Select customer"
                showClear
                filter
                filterBy="name.name"

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
                value={dateFormate(formData.orderDate)}
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
                value={dateFormate(formData.deliveryDate)}
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
                value={dateFormate(formData.chargingStartDate)}
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
            <label htmlFor="">Delivery Place </label>
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

          <label className="mt-2.5 block text-[0.9em] font-bold  text-black">
            Address {isRequired()}
          </label>

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
            <div className="w-full">
              <PhoneInput
                country={"us"} // Default country
                value={phone}
                onChange={setPhone}
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
              <Link
                className="mt-2.5 block text-[0.9em] font-bold text-[#337ab7] "
                href={"/system-setup/depots"}
              >
                Depot
              </Link>
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
              <Link
                className="mt-2.5 block text-[0.9em] font-bold text-[#337ab7] "
                href={"/system-setup/invoice-run-code"}
              >
                Invoice Run Code
              </Link>
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
              <Link
                className="mt-2.5 block text-[0.9em] font-bold text-[#337ab7] "
                href={"/system-setup/payment-terms"}
              >
                Payment Terms
              </Link>
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

export default UpdateOrder;
