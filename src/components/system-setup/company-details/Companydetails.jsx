"use client";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Formik, Form } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BaseURL, imageBaseURL } from "../../../../utils/baseUrl";
import BrandLogo from "@/components/ProfileBox/BrandLogo";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import CanceButton from "@/components/Buttons/CanceButton";
import { Toast } from "primereact/toast";
import axios from "axios";
import { setUpdateUser } from "@/store/authSlice";
import Loader from "@/components/common/Loader";

const Companydetails = () => {
  const { user } = useSelector((state) => state?.authReducer);
  const [visible, setVisible] = useState(false);
  const [countries, setCountries] = useState([]);
  const [defaultCountry, setDefaultCountry] = useState(null);
  const [defaultCurrency, setDefaultCurrency] = useState(null);
    const [defaultCountryCode, setDefaultCountryCode] = useState("");
    const [loader, setloader] = useState(false)
  const [loading, setLoading] = useState(false); 
const toast = useRef()
  const dispatch = useDispatch()
  // Fetch all countries
  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true)
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        const countryList = data.map((country) => ({
          label: country.name.common,
          value: country.cca2,
          flag: country.flags?.png || country.flags?.svg,
          currency: country.currencies ? Object.keys(country.currencies)[0] : "",
        }));
        countryList.sort((a, b) => a.label.localeCompare(b.label));
        setCountries(countryList);
        setLoading(false)
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Fetch user's country info based on IP
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        // ip-api provides country info based on IP
        const response = await fetch("http://ip-api.com/json/?fields=countryCode,currency");
        const data = await response.json();

        if (data && data.countryCode) {
          // Find the country from the list based on the country code from IP
          const country = countries.find((c) => c.value === data.countryCode);
          if (country) {
            setDefaultCountry(country.label);
            setDefaultCountryCode(country.value)
            setDefaultCurrency(country.currency || "");
          }
        }
      } catch (error) {
        console.error("Error fetching user location info:", error);
      } finally {
        setLoading(false); // Set loading to false once the data is fetched
      }
    };

    if (countries.length > 0) {
      fetchUserLocation();
    }
  }, [countries]);  // Only run after countries are loaded

  const countryOptionTemplate = (option) => (
    <div className="flex items-center gap-2">
      {option.flag && (
        <img src={option.flag} alt={option.label} style={{ width: "20px", height: "15px" }} />
      )}
      <span>{option.label}</span>
    </div>
  );

 

  const updateCompanyDetails = async (values) => {
    setloader(true)
    try {
      const response = await axios.put(
        `${BaseURL}/vender/${user?._id}`,
        values,
      );
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: response.data?.message,
        life: 3000,
      });
      setloader(false)
      setVisible(false)
      dispatch(setUpdateUser(response?.data?.data?.user));

      console.log(response.data);
    } catch (error) {
      console.log(error.response.data.message);
      setloader(false)
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data.message,
        life: 3000,
      });

      console.error("Error registering vendor:", error);
      // Handle error response (e.g., show an error message)
    }
  };

  // Don't render Formik until data is ready
  if (loading) {
    return  <div className="flex justify-center items-center h-screen">
      <Loader/>
    
    </div>;
  }


  return (
    <div className="">
      <GoPrevious route={"/system-setup"} />
            <Toast ref={toast} position="top-right" />
      
      <Dialog
        header="Update Country/Currency"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3">


               </div> */}
      <Formik
            initialValues={{
              currencyKey:defaultCurrency || "",
              country:defaultCountry || "",
              countryCode:defaultCountryCode || "",
            }}
            enableReinitialize={true}  // Allow reinitialization with new default values
            onSubmit={async (values) => {
              await updateCompanyDetails(values);
            }}
          >
            {({ setFieldValue, values }) => (
              <Form>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {/* Country Dropdown */}
                  <div>
                    <label className="mt-2.5 block text-[0.9em] font-bold text-black">
                      Country
                    </label>
                    <Dropdown
                      value={values.countryCode}
                      options={countries}
                      onChange={(e) => {
                        const selectedCountry = e.value;
                        const countryObj = countries.find((c) => c.value === selectedCountry);

                        // Update Formik values directly
                        setFieldValue("countryCode", selectedCountry);
                        setFieldValue("currencyKey", countryObj?.currency || "");
                        setFieldValue("country", countryObj?.label || "");
                      }}
                      placeholder="Select a country"
                      
                      showClear
                      optionLabel="label"
                      itemTemplate={countryOptionTemplate}
                      className="w-full"
                    />
                  </div>

                  {/* Currency Display */}
                  <div>
                    <label className="mt-2.5 block text-[0.9em] font-bold text-black">
                      Currency
                    </label>
                  <InputText readOnly value={values.currencyKey }/>
                  </div>
                </div>

                {/* Submit Button */}
         <div className="flex justify-end mt-6">
    <div className="">
    <CanceButton/>
    </div>
        <div className="ml-7">
        <Button loading={loader} size="small" type="submit">Update</Button>
        </div>
         </div>
              </Form>
            )}
          </Formik>
      </Dialog>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="col-span-12 p-4 lg:col-span-3 xl:col-span-2">
          <h3 className="font-bold">Company Details</h3>
        </div>
        <div className="col-span-12 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-12 md:w-[100%] lg:col-span-10 lg:w-[100%] xl:col-span-10 xl:w-[70%] 2xl:w-[70%]">
          <div className="flex items-center justify-center">
            <BrandLogo />
          </div>
          <hr className="my-4" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="field">
              <label
                className=" text-[0.9em] font-bold text-black"
                htmlFor="name"
              >
                Company Name
              </label>
              <InputText readOnly id="name" value={user?.legalName} />
            </div>
            <div className="field">
              <label
                className=" text-[0.9em] font-bold text-black"
                htmlFor="name"
              >
                Email
              </label>
              <InputText readOnly id="name" value={user?.email} />
            </div>
          </div>
          <div className="my-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="field">
              <div className="flex justify-between">
                <label
                  className=" text-[0.9em] font-bold text-black"
                  htmlFor="name"
                >
                  Country
                </label>
                <i
                  onClick={() => setVisible(true)}
                  className="pi pi-pen-to-square cursor-pointer text-primary
"
                />
              </div>
              <InputText readOnly id="name" value={user?.country} />
            </div>
            <div className="field">
              <label
                className=" text-[0.9em] font-bold text-black"
                htmlFor="name"
              >
                Currency
              </label>
              <InputText readOnly id="name" value={user?.currencyKey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Companydetails;
