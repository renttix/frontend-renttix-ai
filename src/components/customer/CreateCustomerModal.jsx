"use client";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BaseURL } from "../../../utils/baseUrl";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import Link from "next/link";
import { Button } from "primereact/button";
import CanceButton from "../Buttons/CanceButton";
import { Tag } from "primereact/tag";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { Dialog } from "primereact/dialog";
import { Skeleton } from "primereact/skeleton";
import useDebounce from "@/hooks/useDebounce";
import ConfirmLink from "../confirmLink/ConfirmLink";
import { setDirty, clearDirty } from "../../store/dirtySlice";
import PhoneInputField from "../PhoneInputField/PhoneInputField";
import CreateInvoiceRunCodeModel from "../system-setup/invoice-run-code/CreateInvoiceRunCodeModel";
import AddPaymentTermsModal from "../system-setup/payment-terms/AddPaymentTermsModal";

const CreateCustomerModal = ({ refreshParent }) => {
  const toast = useRef();
  const [loading, setloading] = useState(false);
  const { user } = useSelector((state) => state?.authReducer);
  const router = useRouter();
  const [data, setdata] = useState([]);
  const [invoiceRunData, setinvoiceRunData] = useState([]);
  const [visible, setVisible] = useState(false);

  // dropdown state
  const [statusValue, setstatusValue] = useState("");
  const [invoiceRunCodeValue, setinvoiceRunCodeValue] = useState({
    name: "",
  });
  const [paymentTermsValue, setpaymentTermsValue] = useState("");
  const [customerTypeValue, setcustomerTypeValue] = useState("");
  const [taxClassValue, settaxClassValue] = useState("");
  const [industryValue, setindustryValue] = useState("");
  const [phone, setPhone] = useState("");
    const [invoiceRunCodeRefresh, setinvoiceRunCodeRefresh] = useState(false);
  const [paymentTermsRefresh, setpaymentTermsRefresh] = useState(false); // State to trigger refresh
  const [paymetTermData, setpaymetTermData] = useState([]);

  const [formValues, setFormValues] = useState({
    name: "",
    lastName: "",
    number: "",
    owner: "",
    stop: false,
    active: false,
    cashCustomer: false,
    canTakePayments: false,
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "",
    postCode: "",
    email: "",
    // telephone: "",
    fax: "",
    website: "",
    type: "Customer",
    industry: "",
    status: "Active",
    taxClass: "",
    parentAccount: "",
    invoiceRunCode: "",
    paymentTerm: "",
    vendorId: user?._id,
  });
  const dispatch = useDispatch();

  const [image, setImage] = useState(null);
  const [taxClass, settaxClass] = useState([]);
  const { token } = useSelector((state) => state?.authReducer);
 const [customerTypeOptions, setCustomerTypeOptions] = useState([]);
  const [parentId, setparentId] = useState("");

  useEffect(() => {
    const fetchCustomerTypes = async () => {
      try {
        const resp = await axios.get(
          `${BaseURL}/list/value-list/children?parentName=Customer Type`,
          {
            headers: { authorization: `Bearer ${token}` },
          },
        );
        if (resp.data.success) {
          setCustomerTypeOptions(resp.data.children);
          setparentId(resp.data.parentId);
        }
      } catch (err) {
        console.error("Could not load customer types:", err);
      }
    };
    fetchCustomerTypes();
  }, [token]);
  const [imagePreview, setImagePreview] = useState(
    "/images/customers/default-image.png",
  );

  const refreshInvoiceRun = () => setinvoiceRunCodeRefresh((prev) => !prev);
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
  const refreshPaymentTerms = () => {
    setpaymentTermsRefresh((prev) => !prev);
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
  const handleInputChange = (e) => {
    dispatch(setDirty());

    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
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
        setdata(response.data.data);
      } else {
        console.log(response?.data?.message);
      }
    };
    fetchData();
  }, []);



  const handleSubmit = async () => {
    dispatch(clearDirty());

    setloading(true);
    try {
      const formData = new FormData();

      // Update formValues with dropdown state values
      const updatedFormValues = {
        ...formValues,
        type: customerTypeValue,
        // industry: industryValue.name,
        status: statusValue.name,
        taxClass: taxClassValue.name,
        invoiceRunCode: invoiceRunCodeValue._id,
        paymentTerm: paymentTermsValue._id,
      };

      // Add fields to FormData
      formData.append("thumbnail", image);
      formData.append("telephone", phone ?? "");

      Object.keys(updatedFormValues).forEach((key) => {
        formData.append(key, updatedFormValues[key]);
      });

      const response = await axios.post(
        `${BaseURL}/customer/customer/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${token}`,
          },
        },
      );
      setVisible(false);
      if (response.data.success) {
        refreshParent();
        setFormValues({
           name: "",
    lastName: "",
    number: "",
    owner: "",
    stop: false,
    active: false,
    cashCustomer: false,
    canTakePayments: false,
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "",
    postCode: "",
    email: "",
    // telephone: "",
    fax: "",
    website: "",
    type: "Customer",
    industry: "",
    status: "Active",
    taxClass: "",
    parentAccount: "",
    invoiceRunCode: "",
    paymentTerm: "",
    vendorId:'',
        })
        setpaymentTermsValue("")
        setcustomerTypeValue("")
        setstatusValue("")
        setinvoiceRunCodeValue({name: ""})
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: response.data?.message,
          life: 3000,
        });

        setloading(false);
      }
      console.log("Form submitted successfully:", response.data);
    } catch (error) {
      if (error.response.data.error?.Fault?.type === "ValidationFault") {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail:
            error?.response?.data?.error?.Fault?.Error[0]?.Message ||
            "server error",
          life: 3000,
        });
      } else {
        if (user?.isQuickBook) {
          window.location.href = `${BaseURL}/auth?vendorId=${user?._id}&redirctURL=${window.location.href}`;
        }
      }
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data.message,
        life: 3000,
      });

      console.error(
        "Error submitting form:",
        error?.response?.data?.error?.Fault?.type || "server error",
      );
      setloading(false);
    }
  };

  useEffect(() => {
    const fetchTaxClass = async () => {
      try {
        const response = await axios.get(`${BaseURL}/tax-classes/account`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        settaxClass(response?.data?.data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTaxClass();
  }, []);

  const isPaymentTermID = data?.filter(
    (item) => item._id === formValues.paymentTerm,
  );

  const invoiceRun = invoiceRunData?.filter(
    (item) => item._id === formValues.invoiceRunCode,
  );

  const generateAssetNo = () => {
    const newNo = `No-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setFormValues((prev) => ({ ...prev, number: newNo }));
  };
  // --- Google Maps Autocomplete Hooks ---
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQuery) {
      setLocations([]);
      return;
    }
    setSearchLoading(true);
    axios
      .get(`${BaseURL}/google/location-suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: debouncedQuery },
      })
      .then((res) => setLocations(res.data.suggestions || []))
      .catch(console.error)
      .finally(() => setSearchLoading(false));
  }, [debouncedQuery, token]);

  // On suggestion select
  const handleLocationSelect = async (loc) => {
    setIsReadOnly(true);
    setQuery("");
    setLocations([]);
    setSearchLoading(true);
    try {
      const { data: place } = await axios.get(
        `${BaseURL}/google/place-details`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { place_id: loc.place_id },
        },
      );
      setFormValues((prev) => ({
        ...prev,
        addressLine1: place.formattedAddress,
        addressLine2: `${place.city || ""}, ${place.state || ""}, ${place.country || ""}`,
        city: place.city,
        country: place.country,
        postCode: place.postalCode,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Clear the autocomplete
  const clearAddressSearch = () => {
    setIsReadOnly(false);
    setQuery("");
    setLocations([]);
    setFormValues((prev) => ({
      ...prev,
      addressLine1: "",
      addressLine2: "",
      city: "",
      country: "",
      postCode: "",
    }));
  };

    const isRequired = () => {
    return <span className="text-red">*</span>;
  };
  return (
    <div>
      <Toast ref={toast} />
      <div
        onClick={() => setVisible(true)}
        className="flex cursor-pointer items-center justify-center gap-2 text-blue-500"
      >
        <label className=" block cursor-pointer text-[0.9em] font-bold ">
          Create Customer
        </label>
        <i
          className="pi pi-plus-circle
"
        />
      </div>
      <Dialog
        maximizable
        header="Create Customer"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        {/* <Toast ref={toast} position="top-right" /> */}

        <div class="grid grid-cols-1 gap-4 md:grid-cols-10">
          {/* <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Information</h3>
        </div> */}
          {/* <div class="col-span-12 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5"> */}
          <div class="col-span-12 rounded-[10px] ">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label>First Name {isRequired()}</label>
                <InputText
                  placeholder="First Name"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Last Name</label>
                <InputText
                  placeholder="Last Name"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleInputChange}
                />
              </div>
              {/* <div>
                <label>Number</label>
                <div className="p-inputgroup">
                  <InputText
                    placeholder="Asset Number"
                    name="number"
                    value={formValues.number}
                    onChange={handleInputChange}
                  />
                  <Button
                    icon="pi pi-refresh"
                    className="p-button-text p-button-sm"
                    onClick={generateAssetNo}
                    tooltip="Generate Number"
                    tooltipOptions={{ position: "top" }}
                  />
                </div>
              </div> */}
              {/* <div className="flex flex-col items-center justify-center gap-2">
                <label>On Hold</label>
                <InputSwitch
                  colorScheme="orange"
                  size="lg"
                  name="onStop"
                  checked={formValues.onStop}
                  onChange={handleInputChange}
                />
              </div> */}
              {/* <div>
                <label>Owner</label>
                <InputText
                  placeholder="Required"
                  name="owner"
                  value={formValues.owner}
                  onChange={handleInputChange}
                />
              </div> */}
            </div>
            {/* <div className="flex flex-col items-center justify-center gap-2">
                <label>On Hold</label>
                <InputSwitch
                  colorScheme="orange"
                  size="lg"
                  name="onStop"
                  checked={formValues.onStop}
                  onChange={handleInputChange}
                />
              </div> */}
            {/* <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-1">
            <div className=" flex justify-between">
              <div className="flex flex-col items-center justify-center gap-2">
                <label>On Hold</label>
                <InputSwitch
                  colorScheme="orange"
                  size="lg"
                  name="onStop"
                  checked={formValues.onStop}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <label>Active</label>
                <InputSwitch
                  colorScheme="orange"
                  size="lg"
                  name="active"
                  checked={formValues.active}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <label>Cash Customer</label>
                <InputSwitch
                  colorScheme="orange"
                  size="lg"
                  name="cashCustomer"
                  checked={formValues.cashCustomer}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <label>Can Take Payments</label>
                <InputSwitch
                  colorScheme="orange"
                  size="lg"
                  name="canTakePayments"
                  checked={formValues.canTakePayments}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div> */}
          </div>
        </div>

        {/* Address */}
        <hr className="hr my-6" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-10">
          {/* <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Address</h3>
        </div> */}
          {/* <div class="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5"> */}
          <div class="col-span-12 rounded-[10px] ">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              <div className="flex">
                <div className="w-full">
                  <label>Address Line 1</label>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                      <div className="relative">
                        <div className="p-inputgroup">
                          <Button>Search</Button>
                          <InputText
                            value={query || formValues.addressLine1}
                            onChange={(e) => setQuery(e.target.value)}
                            readOnly={isReadOnly}
                            placeholder="Search Address"
                            className="w-full"
                          />
                          {isReadOnly && (
                            <Button
                              icon="pi pi-times"
                              // className="p-button-text p-button-sm absolute top-2 right-2"
                              onClick={clearAddressSearch}
                            />
                          ) }
                        </div>
                        <div className="flex flex-col py-2">
                          {searchLoading ? (
                            <>
                              <Skeleton className="mb-2"></Skeleton>
                              <Skeleton className="mb-2"></Skeleton>
                              <Skeleton className="mb-2"></Skeleton>
                            </>
                          ) : (
                            <ul className="absolute left-0 right-0 z-10 max-h-48 overflow-auto rounded-md border bg-dark-8 dark:border-dark-2 dark:bg-dark-3">
                              {locations.map((loc, i) => (
                                <li
                                  key={i}
                                  className="cursor-pointer p-2 hover:bg-gray-100"
                                  onClick={() => handleLocationSelect(loc)}
                                >
                                  {loc.description}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <InputText
                        placeholder="Address Line 2"
                        name="addressLine2"
                        value={formValues.addressLine2}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="">
                  <InputText
                    placeholder="City"
                    name="city"
                    value={formValues.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="">
                  <InputText
                    placeholder="Country"
                    name="country"
                    value={formValues.country}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="">
                  <InputText
                    placeholder="Postcode"
                    name="postCode"
                    value={formValues.postCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex">
                  <div className="w-full">
                    <label>Email {isRequired()}</label>
                    <div className="flex flex-col gap-2">
                      <InputText
                        placeholder=""
                        name="email"
                        value={formValues.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="">
                  <label>Telephone</label>
                  <PhoneInputField
                    name="telephone"
                    value={phone}
                    onChange={setPhone}
                  />
                </div>
                <div className="">
                  <label>Fax</label>
                  <InputText
                    placeholder=""
                    name="fax"
                    value={formValues.fax}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="">
                  <label>Website</label>
                  <InputText
                    placeholder=""
                    name="website"
                    value={formValues.website}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Detail */}
        <hr className="hr my-6" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-10">
          {/* <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Detail</h3>
        </div> */}
          {/* <div class="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5"> */}
          <div class="col-span-12 rounded-[10px] ">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex">
                <div className="w-full">
                                 <ConfirmLink href={`/system-setup/list-value/${parentId}`}>
                                   <label className="  block cursor-pointer text-[0.9em] font-bold text-blue-500">
                                      <label>Type {isRequired()}</label>
                                   </label>
                                 </ConfirmLink>
                                
                               <div className="flex flex-col gap-2">
                                 <Dropdown
                                   className="w-full"
                                   placeholder="Select customer type"
                                   name="customerTypeValue"
                                   value={customerTypeValue}
                                   onChange={(e) => setcustomerTypeValue(e.value)}
                                   options={customerTypeOptions}
                                   optionLabel="name"
                                   optionValue="name"
                                   checkmark
                                 />
                               </div>
                </div>
              </div>
              <div className="flex">
                <div className="w-full">
                  <label>Status {isRequired()}</label>
                  <div className="flex flex-col gap-2">
                    <Dropdown
                      className="w-full"
                      placeholder="Select option"
                      name="statusValue"
                      value={statusValue}
                      onChange={(e) => setstatusValue(e.value)}
                      options={[
                        { name: "Active", _id: "1" },
                        { name: "Inactive", _id: "2" },
                      ]}
                      optionLabel="name"
                      checkmark={true}
                      highlightOnSelect={false}
                    />
                  </div>
                </div>
              </div>
              {/* <div className="flex">
                <div className="w-full">
                  <label>Industry</label>
                  <div className="flex flex-col gap-2">
                    <Dropdown
                      className="w-full"
                      placeholder="Select option"
                      name="industryValue"
                      value={industryValue}
                      onChange={(e) => setindustryValue(e.value)}
                      options={[
                        { name: "Agriculture", _id: "1" },
                        { name: "Plant and Tools", _id: "2" },
                        { name: "Automotive", _id: "3" },
                        { name: "Others", _id: "4" },
                      ]}
                      optionLabel="name"
                      checkmark={true}
                      highlightOnSelect={false}
                    />
                  </div>
                </div>
              </div> */}

              {/* <div className="flex items-center justify-start gap-4">
                <div className="w-full">
                  <ConfirmLink href={"/system-setup/tax-classes"}>
                    <label className="mt-2.5 block cursor-pointer text-[0.9em] font-bold text-blue-500">
                      Tax Class
                    </label>
                  </ConfirmLink>
                  <Dropdown
                    className="w-full"
                    placeholder="Select option"
                    name="taxClassValue"
                    value={taxClassValue}
                    onChange={(e) => settaxClassValue(e.value)}
                    options={taxClass}
                    optionLabel="name"
                    checkmark={true}
                    highlightOnSelect={false}
                  />
                </div>
              </div> */}
            </div>
          </div>
        </div>
        {/* Additional Info */}
        <hr className="hr my-6" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-10">
          {/* <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Additional Info</h3>
        </div> */}
          {/* <div class="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5"> */}
          <div class="col-span-12 rounded-[10px] ">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* <div className="flex">
                <div className="w-full">
                  <label>Parent Account</label>
                  <div className="flex flex-col gap-2">
                    <InputText
                      name="parentAccount"
                      value={formValues.parentAccount}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div> */}
              <div className="flex">
                <div className="w-full">
               <div className="flex justify-between items-center">
                 <ConfirmLink href={"/system-setup/invoice-run-code"}>
                  <label className="mt-2.5 block cursor-pointer mb-1 text-[0.9em] font-bold text-blue-500">
                    Invoice Run Code {isRequired()}
                  </label>
                                  

                </ConfirmLink>
                <CreateInvoiceRunCodeModel refreshParent={refreshInvoiceRun} />
           </div>
                  <div className="flex flex-col gap-2">
                    <Dropdown
                      className="w-full"
                      placeholder="Select option"
                      name="invoiceRunCodeValue"
                      value={invoiceRunCodeValue}
                      onChange={(e) => setinvoiceRunCodeValue(e.value)}
                      options={invoiceRunData}
                      optionLabel="name"
                      checkmark={true}
                      highlightOnSelect={false}
                    />
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center">
                          <ConfirmLink href={"/system-setup/payment-terms"}>
                           <label className="mt-2.5 block cursor-pointer text-[0.9em] mb-1 font-bold text-blue-500">
                             Payment Terms {isRequired()}
                           </label>
                         </ConfirmLink>
                           <AddPaymentTermsModal refreshParent={refreshPaymentTerms} />
                      </div>
                <div className="flex flex-col gap-2">
                  <Dropdown
                    className="w-full"
                    placeholder="(No Payment Term)"
                    name="paymentTermsValue"
                    value={paymentTermsValue}
                    onChange={(e) => setpaymentTermsValue(e.value)}
                    options={paymetTermData}
                    optionLabel="name"
                    checkmark={true}
                    highlightOnSelect={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr className="hr my-6" />
        <div class="mt-5 grid grid-cols-10 gap-4">
          <div class="col-span-2  p-4 ">
            {/* <h3 className="font-bold">Upload Product Photos </h3> */}
          </div>
          <div class="col-span-12  p-4">
            <div className="flex justify-end gap-7 ">
              <div className="">
                <CanceButton onClick={() => router.back()} />
              </div>
              <div className="">
                <Button
                  size="small"
                  loading={loading}
                  disabled={
                    // invoiceRunCodeValue?.name == "" ||
                    // paymentTermsValue.name == ""
                    //   ? true
                    //   : false
                    formValues.name === "" || formValues.email === ""
                  }
                  label="Save"
                  onClick={handleSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CreateCustomerModal;
