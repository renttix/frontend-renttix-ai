"use client";
import { useParams, useRouter } from "next/navigation";
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
import useDebounce from "@/hooks/useDebounce";
import { ProgressSpinner } from "primereact/progressspinner";
import { Skeleton } from "primereact/skeleton";
import ConfirmLink from "../confirmLink/ConfirmLink";
import { setDirty, clearDirty } from "../../store/dirtySlice";
import PhoneInputField from "../PhoneInputField/PhoneInputField";
import AddPaymentTermsModal from "../system-setup/payment-terms/AddPaymentTermsModal";
import CreateInvoiceRunCodeModel from "../system-setup/invoice-run-code/CreateInvoiceRunCodeModel";
import Loader from "../common/Loader";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaMapMarkerAlt,
  FaFileAlt,
  FaCog,
  FaSave,
  FaTimes,
  FaCheck,
  FaExclamationCircle
} from "react-icons/fa";
import "./styles/UpdateCustomerElite.css";

const UpdateCustomerElite = () => {
  const toast = useRef();
  const [loading, setloading] = useState(false);
  const { user } = useSelector((state) => state?.authReducer);
  const router = useRouter();
  const [data, setdata] = useState([]);
  const [loadPage, setloadPage] = useState(false);
  const [invoiceRunData, setinvoiceRunData] = useState([]);
  const dispatch = useDispatch();
  const [showSuccess, setShowSuccess] = useState(false);

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
  const [paymentTermsRefresh, setpaymentTermsRefresh] = useState(false);
  const [invoiceRunCodeRefresh, setinvoiceRunCodeRefresh] = useState(false);
  const [paymetTermData, setpaymetTermData] = useState([]);

  const { id } = useParams();
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
    fax: "",
    website: "",
    industry: "",
    status: "Active",
    taxClass: "",
    parentAccount: "",
    invoiceRunCode: "",
    paymentTerm: "",
    vendorId: user._id,
  });

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

  const refreshPaymentTerms = () => {
    setpaymentTermsRefresh((prev) => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
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

  const refreshInvoiceRun = () => setinvoiceRunCodeRefresh((prev) => !prev);

  useEffect(() => {
    const fetchData = async () => {
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

  const [imagePreview, setImagePreview] = useState(
    "/images/customers/default-image.png",
  );

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

  useEffect(() => {
    const fetchData = async () => {
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

  useEffect(() => {
    setloadPage(true);
    axios.get(`${BaseURL}/customer/customer/${id}`, {
      headers: { authorization: `Bearer ${token}` }
    })
      .then(res => {
        setloadPage(false)
        const c = res.data.data.customer;
        // Prefill form fields
        setFormValues(prev => ({
          ...prev,
          name: c.name,
          lastName: c.lastName,
          number: c.number,
          owner: c.owner,
          stop: c.stop,
          active: c.active,
          cashCustomer: c.cashCustomer,
          canTakePayments: c.canTakePayments,
          addressLine1: c.addressLine1,
          addressLine2: c.addressLine2,
          city: c.city,
          country: c.country,
          postCode: c.postCode,
          email: c.email,
          fax: c.fax,
          website: c.website,
          industry: c.industry,
          taxClass: c.taxClass,
          type: c.type,
          invoiceRunCode: c.invoiceRunCode,
          paymentTerm: c.paymentTerm,
          vendorId: c.vendorId
        }));
        // Prefill dependent states
        setstatusValue({ name: c.status })
        setPhone(c.telephone);
        setcustomerTypeValue(c.type);
        setpaymentTermsValue(c.paymentTerm);
        setinvoiceRunCodeValue(c.invoiceRunCode);

        // Image preview
        if (c.thumbnail) setImagePreview(c.thumbnail);
      })
      .catch(err => {
        setloadPage(false)
        toast.current.show({ severity: 'error', summary: 'Error', detail: err.message });
      })
      .finally(() => setloadPage(false));
  }, [id, token]);

  const updateHandleSubmit = async () => {
    setloading(true);
    try {
      const formData = new FormData();

      // Update formValues with dropdown state values
      const updatedFormValues = {
        ...formValues,
        type: customerTypeValue,
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

      const response = await axios.put(
        `${BaseURL}/customer/customer/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push(`/customer/listing`);
        }, 1500);
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
        if (user.isQuickBook) {
          window.location.href = `${BaseURL}/auth?vendorId=${user._id}&redirctURL=${window.location.href}`;
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

  const invoiceRun = invoiceRunData?.filter(
    (item) => item._id === formValues.invoiceRunCode,
  );

  const generateAssetNo = () => {
    setFormValues((prev) => {
      const last = prev.number?.replace(/^cust-/, "");
      const lastNum = last ? parseInt(last, 10) : 9;
      const nextNum = lastNum + 1;
      const padded = nextNum.toString().padStart(4, "0");

      return {
        ...prev,
        number: `cust-${padded}`,
      };
    });
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

  if (loadPage) return (
    <div className="update-customer-elite">
      <div className="elite-loading-overlay">
        <div className="elite-loading-content">
          <div className="elite-spinner"></div>
          <p>Loading customer details...</p>
        </div>
      </div>
    </div>
  );

  const isRequired = () => {
    return <span className="elite-required">*</span>;
  };

  return (
    <div className="update-customer-elite">
      <Toast ref={toast} position="top-right" />
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="elite-success-animation"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <FaCheck size={24} style={{ marginRight: '0.5rem' }} />
            Customer Updated Successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        className="elite-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="elite-header-content">
          <GoPrevious route={"/dashboard"} />
          <h1 className="elite-title">
            <FaUser className="elite-title-icon" />
            Update Customer
          </h1>
        </div>
      </motion.div>

      {/* Information Section */}
      <motion.div 
        className="elite-form-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="elite-section-header">
          <FaUser className="elite-section-icon" />
          <h2 className="elite-section-title">Information</h2>
        </div>
        <div className="elite-form-grid">
          <div className="elite-form-group">
            <label className="elite-form-label">
              First Name {isRequired()}
            </label>
            <input
              type="text"
              className="elite-input"
              placeholder="Required"
              name="name"
              value={formValues.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="elite-form-group">
            <label className="elite-form-label">Last Name</label>
            <input
              type="text"
              className="elite-input"
              placeholder="Required"
              name="lastName"
              value={formValues.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </motion.div>

      {/* Address Section */}
      <motion.div 
        className="elite-form-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="elite-section-header">
          <FaMapMarkerAlt className="elite-section-icon" />
          <h2 className="elite-section-title">Address</h2>
        </div>
        <div className="elite-form-group">
          <label className="elite-form-label">Address Line 1</label>
          <div className="elite-address-search">
            <div className="elite-search-group">
              <Button className="elite-search-button">Search</Button>
              <input
                type="text"
                className="elite-input"
                value={query || formValues.addressLine1}
                onChange={(e) => setQuery(e.target.value)}
                readOnly={isReadOnly}
                placeholder="Search Address"
              />
              {isReadOnly && (
                <Button
                  icon="pi pi-times"
                  className="elite-button elite-button-secondary"
                  onClick={clearAddressSearch}
                />
              )}
            </div>
            {searchLoading ? (
              <div className="elite-skeleton" style={{ height: '120px' }}></div>
            ) : (
              locations.length > 0 && (
                <ul className="elite-suggestions-list">
                  {locations.map((loc, i) => (
                    <li
                      key={i}
                      className="elite-suggestion-item"
                      onClick={() => handleLocationSelect(loc)}
                    >
                      {loc.description}
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
          <input
            type="text"
            className="elite-input"
            placeholder="Address Line 2"
            name="addressLine2"
            value={formValues.addressLine2}
            onChange={handleInputChange}
            style={{ marginTop: '1rem' }}
          />
        </div>
        <div className="elite-form-grid">
          <div className="elite-form-group">
            <input
              type="text"
              className="elite-input"
              placeholder="City"
              name="city"
              value={formValues.city}
              onChange={handleInputChange}
            />
          </div>
          <div className="elite-form-group">
            <input
              type="text"
              className="elite-input"
              placeholder="Country"
              name="country"
              value={formValues.country}
              onChange={handleInputChange}
            />
          </div>
          <div className="elite-form-group">
            <input
              type="text"
              className="elite-input"
              placeholder="Postcode"
              name="postCode"
              value={formValues.postCode}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="elite-form-grid">
          <div className="elite-form-group">
            <label className="elite-form-label">
              Email {isRequired()}
            </label>
            <input
              type="email"
              className="elite-input"
              placeholder=""
              name="email"
              value={formValues.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="elite-form-group">
            <label className="elite-form-label">Telephone</label>
            <div className="elite-phone-input">
              <PhoneInputField 
                name="telephone"
                value={phone}
                onChange={setPhone}
              />
            </div>
          </div>
          <div className="elite-form-group">
            <label className="elite-form-label">Fax</label>
            <input
              type="text"
              className="elite-input"
              placeholder=""
              name="fax"
              value={formValues.fax}
              onChange={handleInputChange}
            />
          </div>
          <div className="elite-form-group">
            <label className="elite-form-label">Website</label>
            <input
              type="text"
              className="elite-input"
              placeholder=""
              name="website"
              value={formValues.website}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </motion.div>

      {/* Detail Section */}
      <motion.div 
        className="elite-form-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="elite-section-header">
          <FaFileAlt className="elite-section-icon" />
          <h2 className="elite-section-title">Detail</h2>
        </div>
        <div className="elite-form-grid">
          <div className="elite-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ConfirmLink href={`/system-setup/list-value/${parentId}`}>
                <label className="elite-link">
                  Type {isRequired()}
                </label>
              </ConfirmLink>
            </div>
            <div className="elite-dropdown">
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
          <div className="elite-form-group">
            <label className="elite-form-label">
              Status {isRequired()}
            </label>
            <div className="elite-dropdown">
              <Dropdown
                className="w-full"
                placeholder="Select option"
                name="statusValue"
                value={statusValue}
                onChange={(e) => setstatusValue(e.value)}
                options={[
                  { name: "Active"},
                  { name: "Inactive" },
                ]}
                optionLabel="name"
                checkmark={true}
                highlightOnSelect={false}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Additional Info Section */}
      <motion.div 
        className="elite-form-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="elite-section-header">
          <FaCog className="elite-section-icon" />
          <h2 className="elite-section-title">Additional Info</h2>
        </div>
        <div className="elite-form-grid">
          <div className="elite-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ConfirmLink href={"/system-setup/invoice-run-code"}>
                <label className="elite-link">
                  Invoice Run Code {isRequired()}
                </label>
              </ConfirmLink>
              <CreateInvoiceRunCodeModel
                refreshParent={refreshInvoiceRun}
              />
            </div>
            <div className="elite-dropdown">
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
          <div className="elite-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ConfirmLink href={"/system-setup/payment-terms"}>
                <label className="elite-link">
                  Payment Terms {isRequired()}
                </label>
              </ConfirmLink>
              <AddPaymentTermsModal refreshParent={refreshPaymentTerms} />
            </div>
            <div className="elite-dropdown">
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
      </motion.div>

      {/* Actions */}
      <motion.div 
        className="elite-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <CanceButton 
          onClick={() => router.back()} 
          className="elite-button elite-button-secondary"
        />
        <Button
          loading={loading}
          disabled={
            formValues.name === "" || formValues.email === ""
          }
          label="Update"
          icon={<FaSave size={18} style={{ marginRight: '0.5rem' }} />}
          onClick={updateHandleSubmit}
          className="elite-button elite-button-primary"
        />
      </motion.div>

      {/* Loading Overlay */}
      {loading && (
        <div className="elite-loading-overlay">
          <div className="elite-loading-content">
            <div className="elite-spinner"></div>
            <p>Updating customer...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateCustomerElite;