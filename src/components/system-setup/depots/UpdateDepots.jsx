"use client";
import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";
import CanceButton from "@/components/Buttons/CanceButton";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import apiServices from "../../../../services/apiService";
import useDebounce from "@/hooks/useDebounce";
import Loader from "@/components/common/Loader";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import { ProgressSpinner } from "primereact/progressspinner";
import { Skeleton } from "primereact/skeleton";
import { useSelector } from "react-redux";

const UpdateDepots = () => {
  const [loading, setLoading] = useState(false);
    const [searchLoading, setsearchLoading] = useState(false)
    const [searchDetailLocation, setsearchDetailLocation] = useState(false)
      const [isread, setisread] = useState(false);
      const { token } = useSelector((state) => state?.authReducer);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    email: "",
    depotManager:"",
    telephone: "",
    fax: "",
    website: "",
    address1: "",
    address2: "",
    city: "",
    country: "",
    postCode: "",
  });
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [isRead, setIsRead] = useState(false);
  const toast = React.useRef(null);
  const router = useRouter();
  const { id } = useParams();
  const debouncedSearch = useDebounce(query, 1000); 

  // Fetch existing depot details
  useEffect(() => {
    const fetchDepotDetails = async () => {
      setLoading(true)
      try {
        const response = await apiServices.get(
          `${BaseURL}/depots/detail/${id}`,
        );
        setLoading(false)
        setFormData(response.data.data);
        setQuery(response.data.address1 || "");
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data?.message || "Failed to fetch depot details",
        });
      }
    };
    fetchDepotDetails();
  }, [id]);

  const handleChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.value,
    });
  };

  const handleInputChangeAddress = async () => {
    setsearchLoading(true)
    try {
      const response = await axios.get(
        `${BaseURL}/google/location-suggestions`,
        {
          params: { query: debouncedSearch },
          headers: {
            Authorization: `Bearer ${token}`, // Add token in headers
          },
        }
      );
      setsearchLoading(false)
      setLocations(response.data.suggestions);
    } catch (error) {
      setsearchLoading(false)
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.error || "Failed to fetch location data",
      });
      console.error("Error fetching location data:", error);
    }
  };
  
  useEffect(() => {
    if (debouncedSearch) {
      handleInputChangeAddress();
    }
  }, [debouncedSearch]);

  // const handleLocationSelect = (location) => {
  //   setisread(true);
  //   setQuery(`${location.name}, ${location.region}, ${location.country}`);
  //   setFormData({
  //     state: location.region,
  //     address1:`${location.name}, ${location.region}, ${location.country}`,
  //     address2:`${location.name}, ${location.region}, ${location.region}, ${location.country}`,
  //     city: location.county,
  //     country: location.country,
  //   }); 
  
  //   setLocations([]);
  // };


  const handleLocationSelect = async (location) => {
    try {
      setsearchDetailLocation(true)
      setisread(true);
      setQuery(``);
      setLocations([]);
      const response = await axios.get(`${BaseURL}/google/place-details`, {
        params: { place_id: location.place_id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setsearchDetailLocation(false)
      setisread(true);
      setQuery(``);
      console.log("Full Address Details:", response.data);
      let locationData = response.data
      setFormData({
        ...formData,
            state: locationData.state,
            address1: `${locationData.formattedAddress}`,
            address2: `${locationData.formattedAddress}, ${locationData.city}, ${locationData.state}, ${locationData.country}`,
            city: locationData.city,
            country: locationData.country,
            postCode: locationData.postalCode,
          }); 
      // setSelectedLocation(response.data);

    } catch (error) {
      setsearchDetailLocation(false)
      console.error("Error fetching place details:", error);
    }
  };

  const clearAddress = () => {
    setIsRead(false);
    setFormData({
      ...formData,
      address1: "",
      address2: "",
      city: "",
      country: "",
    });
    setQuery("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await apiServices.update(
        `${BaseURL}/depots/${id}`,
        formData,
      );
      router.push("/system-setup/depots/");
      setLoading(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: response.data?.message,
        life: 2000,
      });
    } catch (error) {
      setLoading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to update depot",
        life: 2000,
      });
    }
  };
  if(loading) {
    return <section className="flex h-screen items-center justify-center">
      <Loader />
    </section>;
  }
  return (
    <div >
        <GoPrevious route={'/system-setup/depots'} />
      <Toast ref={toast} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="col-span-12 p-4 lg:col-span-3 xl:col-span-2">
          <h3 className="font-bold">Update Depot</h3>
        </div>
        <div className="col-span-12 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-12 md:w-[100%] lg:col-span-10 lg:w-[100%]  xl:col-span-10 xl:w-[70%] 2xl:w-[70%]">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="field">
                <label
                  className="text-[0.9em] font-bold text-black"
                  htmlFor="name"
                >
                  Name
                </label>
                <InputText
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange(e, "name")}
                />
              </div>
              <div className="field">
                <label
                  className="text-[0.9em] font-bold text-black"
                  htmlFor="code"
                >
                  Code
                </label>
                <InputText
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange(e, "code")}
                />
              </div>
            </div>

            <div className="field">
              <label
                className="text-[0.9em] font-bold text-black"
                htmlFor="description"
              >
                Description
              </label>
              <InputTextarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange(e, "description")}
                rows={3}
              />
            </div>

            <hr className="my-4" />

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="field flex flex-col">
              <label
                className=" text-[0.9em] font-bold text-black"
                htmlFor="email"
              >
                Depot Manager
              </label>
              <InputText type="text"  value={formData.depotManager}
                  onChange={(e) => handleChange(e, "depotManager")} placeholder="Depot Manager" />
            </div>
            <div className="field flex flex-col">
              <label
                className=" text-[0.9em] font-bold text-black"
                htmlFor="email"
              >
                Email
              </label>
              <InputText type="email"  value={formData.email}
                  onChange={(e) => handleChange(e, "email")} placeholder="Email" />
            </div>
              </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="field">
                <label
                  className="text-[0.9em] font-bold text-black"
                  htmlFor="telephone"
                >
                  Telephone
                </label>
                <InputText
                  value={formData.telephone}
                  type="tel"
                  onChange={(e) => handleChange(e, "telephone")}
                  placeholder="Telephone"
                />
              </div>

              <div className="field">
                <label
                  className="text-[0.9em] font-bold text-black"
                  htmlFor="fax"
                >
                  Fax
                </label>
                <InputText
                  type="number"
                  value={formData.fax}
                  onChange={(e) => handleChange(e, "fax")}
                  placeholder="Fax"
                />
              </div>
            </div>

            <div className="field">
              <label
                className="text-[0.9em] font-bold text-black"
                htmlFor="website"
              >
                Website
              </label>
              <InputText
                type="url"
                value={formData.website}
                onChange={(e) => handleChange(e, "website")}
                placeholder="Website"
              />
            </div>

            <hr className="my-4" />
    <div className="relative ">
                      <IconField className="my-3" >
                        
                            {formData.address1.length != "" ? (
                              <InputIcon
                                className="pi pi-times cursor-pointer text-2xl"
                                onClick={() => clearAddress()}
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
           {searchLoading? <>
           
            <Skeleton className="mb-2"></Skeleton>
            <Skeleton className="mb-2"></Skeleton>
            <Skeleton className="mb-2"></Skeleton>
           </>: <>           
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
                        onClick={() =>
                          handleLocationSelect(location)
                        } // Update values on selection
                      >
                        {location.description}
                      </li>
                    ))}
                  </ol>
                </div>
              )}</>   }
         <div className="flex justify-between w-full">
         <label className="mb-2.5 block font-medium text-black dark:text-white">
                Address1
              </label>
              <div className="">
              {searchDetailLocation && <ProgressSpinner style={{width: '30px', height: '30px'}} />}
              </div>
         </div>

              

                <InputText
                  className=" w-full truncate"
                  value={formData.address1}
                  onChange={(e) => handleChange(e, "address1")}
                  name="address1"
                  placeholder="address1"
                />
              {/* </IconField> */}

            </div>

            <div className="field">
              <label
                className="text-[0.9em] font-bold text-black"
                htmlFor="address2"
              >
                Address 2
              </label>
              <InputText
                value={formData.address2}
                onChange={(e) => handleChange(e, "address2")}
                placeholder="Street Address 2"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="field">
                <label
                  className="text-[0.9em] font-bold text-black"
                  htmlFor="city"
                >
                  City
                </label>
                <InputText
                  value={formData.city}
                  onChange={(e) => handleChange(e, "city")}
                  placeholder="City"
                />
              </div>
              <div className="field">
                <label
                  className="text-[0.9em] font-bold text-black"
                  htmlFor="country"
                >
                  Country
                </label>
                <InputText
                  value={formData.country}
                  onChange={(e) => handleChange(e, "country")}
                  placeholder="Country"
                />
              </div>
              <div className="field">
                <label
                  className="text-[0.9em] font-bold text-black"
                  htmlFor="postCode"
                >
                  Post Code
                </label>
                <InputText
                  value={formData.postCode}
                  onChange={(e) => handleChange(e, "postCode")}
                  placeholder="Post Code"
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-4">
          <CanceButton onClick={() => router.back()} />
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
              className=" bg-primary font-medium text-white"
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateDepots;
