"use client";
import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";
import CanceButton from "@/components/Buttons/CanceButton";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import apiServices from "../../../../services/apiService";
import useDebounce from "@/hooks/useDebounce";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import { useSelector } from "react-redux";
import Loader from "@/components/common/Loader";
import { Skeleton } from "primereact/skeleton";
import { ProgressSpinner } from "primereact/progressspinner";


const AddDepots = () => {
  const [loading, setloading] = useState(false);
  const [searchLoading, setsearchLoading] = useState(false)
  const [searchDetailLocation, setsearchDetailLocation] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    email: "",
    telephone: "",
    depotManager:"",
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
  const [isread, setisread] = useState(false);
  const toast = React.useRef(null);
  const { token } = useSelector((state) => state?.authReducer);
  const router = useRouter();
  const debouncedSearch = useDebounce(query, 1000); // Add debounce with a 500ms delay


  const handleChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.value,
    });
  };



  // const handleInputChange = async () => {
   
  
  //     try {
  //       const response = await axios.get(
  //         `https://api.positionstack.com/v1/forward`,
  //         {
  //           params: {
  //             access_key: "480d2d0162b5c86063197f5c2991f8d5",
  //             query: debouncedSearch,
  //             limit: 5,
  //           },
  //         },
  //       );
        
  //       setLocations(response.data.data);
  //     } catch (error) {
  //       toast.current.show({
  //         severity: "error",
  //         summary: "Info",
  //         detail: error.response.data.error.message,
  //       });
  //       console.error("Error fetching location data:", error);
  //     }
    
  // };

  // useEffect(()=>{
  //   handleInputChange()
  // },[debouncedSearch])

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
    setisread(false);
    setFormData({
      state: "",
      city: "",
      address1:'',
      address2:"",
      country: "",
      postCode:""
    })
    setQuery("");
  };

  // const handleSubmit = async () => {
  //   setloading(true);
  //   try {
  //     const response = apiServices.post(`${BaseURL}/depots`,formData,)

  //     if(response.data.success){
  //       router.push("/system-setup/depots/");
  //       setloading(false);
  //       toast.current.show({
  //         severity: "success",
  //         summary: "Success",
  //         detail: response.data?.message,
  //         life: 2000,
  //       });
  //     }
      
  //   } catch (error) {
  //     setloading(false);
  //     toast.current.show({
  //       severity: "error",
  //       summary: "Error",
  //       detail: error.response.data?.message,
  //       life: 2000,
  //     });
  //   }
  // };
const handleSubmit = async () => {
  setloading(true);

  // 1️⃣ Perform only the API call inside try/catch
  let data;
  try {
    const response = await apiServices.post(`${BaseURL}/depots`, formData);
    data = response.data;
  } catch (error) {
    toast.current.show({
      severity: 'error',
      summary: 'Error',
      detail: error?.response?.data?.message || 'Server error creating depot.',
      life: 3000,
    });
    setloading(false);
    return; // stop execution here
  }

  // 2️⃣ Now handle the response
  if (data.success) {
    toast.current.show({
      severity: 'success',
      summary: 'Success',
      detail: data.message || 'Depot created successfully!',
      life: 3000,
    });

    // 3️⃣ Safely call your callbacks
    typeof refreshParent === 'function' && refreshParent();
    typeof setVisible === 'function' && setVisible(false);
    typeof setDepotsData === 'function' &&
      setDepotsData((prev) => [...prev, data.depot]);

    // 4️⃣ Reset form
    setFormData({
      name: '',
      description: '',
      code: '',
      email: '',
      telephone: '',
      depotManager: '',
      fax: '',
      website: '',
      address1: '',
      address2: '',
      city: '',
      country: '',
      postCode: '',
    });
  } else {
    // API returned success: false
    toast.current.show({
      severity: 'warn',
      summary: 'Creation Failed',
      detail: data.message || 'Failed to create depot.',
      life: 3000,
    });
  }

  setloading(false);
};

    const isRequired = () => {
    return <span className="text-red">*</span>;
  };
  return (
    <div className="">
       <GoPrevious route={'/system-setup/depots'} />
      <Toast ref={toast} />
      <div class="grid grid-cols-1 gap-4 md:grid-cols-12 ">
        <div class="col-span-12 p-4  lg:col-span-3 xl:col-span-2 ">
          <h3 className="font-bold">New Depots</h3>
        </div>
        <div class="col-span-12 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-12 md:w-[100%] lg:col-span-10 lg:w-[100%]  xl:col-span-10 xl:w-[70%] 2xl:w-[70%]">
          <div className="grid gap-4">
            {/* Name */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="field">
                <label
                  className=" text-[0.9em] font-bold text-black"
                  htmlFor="name"
                >
                  Name {isRequired()}
                </label>
                <InputText
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange(e, "name")}
                />
              </div>
              <div className="field">
                <label
                  className=" text-[0.9em] font-bold text-black"
                  htmlFor="name"
                >
                  Code {isRequired()}
                </label>
                <InputText 
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange(e, "code")}
                />
              </div>
            </div>

            {/* Description */}
            <div className="field">
              <label
                className=" text-[0.9em] font-bold text-black"
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

            {/* Rate Type and Active */}

            <hr className="my-4  bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark " />
       
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
              <div className="field flex flex-col">
                <label
                  className=" text-[0.9em] font-bold text-black"
                  htmlFor="telephone"
                >
                  Telephone
                </label>
                <InputText
                  value={formData.telephone}
                  type="tel"
                  onChange={(e) => handleChange(e, "telephone")}
                 placeholder="Telephone" />
              </div>

              <div className="field flex flex-col">
                <label
                  className=" text-[0.9em] font-bold text-black"
                  htmlFor="fax"
                >
                  Fax
                </label>
                <InputText 
                type="number"
                  value={formData.fax}
                  onChange={(e) => handleChange(e, "fax")}
                placeholder="Fax" />
              </div>
            </div>

            <div className="field flex flex-col">
              <label
                className=" text-[0.9em] font-bold text-black"
                htmlFor="website"
              >
                Website{" "}
              </label>
              <InputText 
              type="url"
                value={formData.website}
                onChange={(e) => handleChange(e, "website")}
              placeholder="website" />
            </div>

            <hr className="my-4  bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark " />

            {/* Rental Days Per Week */}

            {/* Minimum Rental Period */}
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
  
            <div className="field flex flex-col">
              <label
                className=" text-[0.9em] font-bold text-black"
                htmlFor="address2"
              >
                Address2
              </label>
              <InputText 
                value={formData.address2}
                onChange={(e) => handleChange(e, "address2")}
              placeholder="Address2" />
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="field flex flex-col">
                <InputText   value={formData.city} name="city"
                  onChange={(e) => handleChange(e, "city")} id="city" placeholder="City" />
              </div>
              <div className="field flex flex-col">
                <InputText   value={formData.country}
                  onChange={(e) => handleChange(e, "country")} id="country" placeholder="Country" />
              </div>
              <div className="field flex flex-col">
                <InputText   value={formData.postCode}
                  onChange={(e) => handleChange(e, "postCode")} id="postcode" placeholder="PostCode" />
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex justify-end gap-5">
              <div className="">
                <CanceButton onClick={() => router.back()} />
              </div>
              <Button
                size="small"
                label="Add Depots"
                loading={loading}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDepots;
