"use client";

import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";
import SelectGroupOne from "@/components/FormElements/SelectGroup/SelectGroupOne";
import CanceButton from "@/components/Buttons/CanceButton";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";


const ImportData = ({ListData}) => {
    const data = ListData
    const [visible, setVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState(data[0]);
  const toast = useRef();

  const { token } = useSelector((state) => state?.authReducer);
  const router = useRouter();
  const pathname = usePathname();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Set selected file
  };

  const removeFile = () => {
    setSelectedFile(null); // Clear file state
    // Clear the file input value to allow re-selection of the same file
    const fileInput = document.getElementById("fileInput");
    fileInput.value = ""; // Reset file input field
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile || !selectedOption) {
      alert("Please select both a file and a data type.");
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", selectedFile);

    try {
      const res = await axios.post(
        `${BaseURL}/imports/${data[0].name}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

     
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "File uploaded successfully",
          life: 2000,
        });
        setVisible(false)

        setSelectedFile(null); // Clear file after success
      
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: error.response.data?.message,
        detail: error.response.data?.errors,
        life: 2000,
      });
      // console.error("Error uploading file:", error.response ? error.response.data : error);
      // alert("Error uploading file: " + (error.response?.data?.message || error.message));
    }
  };

  const filePath = ((item)=>{
    if(item==="Product"){
      return '/template/product_template.csv'
    }
    if(item==="Depots"){
      return '/template/depots_template.csv'
    }
  })

  return (
    <>
      <Toast ref={toast} />
        
        <Button label="Import" icon="pi pi-file-import" onClick={() => setVisible(true)} />
             <Dialog header="Import Data" visible={visible} style={{ width: '50vw' }} onHide={() => {if (!visible) return; setVisible(false); }}>
           
    <Card className=" bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card ">
      <h3 className="mb-4 text-lg font-semibold text-dark-2 dark:text-white">
        Import Data
      </h3>
      {/* Select Data Type */}
      <div className="grid grid-cols-1  gap-2 md:grid-cols-2">
        <div className="mb-4">
          <InputText
            value={data[0].name}
            readOnly
            optionLabel="name"
            placeholder="Select"
            className="md:w-14rem w-full capitalize"
          />
        </div>

        <div className="">
          <label
            htmlFor="fileInput"
            className="inline-block cursor-pointer rounded bg-primary px-8 py-[15px]  text-sm text-white transition duration-200 hover:bg-orange-600"
          >
            Select File
          </label>
          <input
            id="fileInput"
            type="file"
            name="csvFile"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Custom File Upload Section */}
      <div className="mb-4">
        {/* Custom File Input */}

        {/* Display Selected File */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {selectedFile && (
            <div className="mt-2 mb-4 flex items-center justify-between rounded-[10px] border border-stroke bg-white p-2 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
              <Tag severity="warning" value={selectedFile.name} />
              <Button
                icon="pi pi-times"
                className="p-button-text p-button-sm text-red"
                onClick={removeFile}
              />
            </div>
          )}
        </div>

        <Button icon="pi pi-file-excel" onClick={()=>router.push(filePath(selectedOption.name))}  size="small" className=" capitalize mt-2" label={`Get Template (${selectedOption.name})`}  />

      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <CanceButton
          onClick={() =>
            pathname === "/system-setup/import-data"
              ? router.back()
              : setVisible(false)
          }
          title="Cancel"
        />
        <Button
          label="Import"
          className="px-8"
          size="small"
          onClick={handleBulkUpload}
          disabled={!selectedFile}
        />
      </div>
    </Card>  </Dialog></>
  );
};

export default ImportData;
