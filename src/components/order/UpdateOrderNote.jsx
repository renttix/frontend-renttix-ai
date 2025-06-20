"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  Button,
  InputText,
  Toast,
  DataTable,
  Column,
} from "primereact";
import { RiStickyNoteAddLine } from "react-icons/ri";

import axios from "axios";
import { useSelector } from "react-redux";
import { FaUser } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import CanceButton from "@/components/Buttons/CanceButton";
import { Avatar } from "primereact/avatar";
import { ScrollTop } from "primereact/scrolltop";
import { InputTextarea } from "primereact/inputtextarea";
import { BaseURL } from "../../../utils/baseUrl";
import { Divider } from "primereact/divider";
import moment from "moment";

const UpdateOrderNote = ({ rowData,handleRefresh }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setsubmitLoading] = useState(false);
  const [name, setName] = useState(rowData?.name||"");
  const [description, setdescription] = useState(rowData?.description||'');
  const [roles, setRoles] = useState([]);
  const { token,user } = useSelector((state) => state?.authReducer);
  const toastRef = React.useRef(null);

useEffect(()=>{
  setName(rowData.name)
  setdescription(rowData.description)
},[rowData])

  console.log({rowData})
  const addRole = async () => {
    setsubmitLoading(true);
    try {
      const payload = {
        name: name,
        description: description,
        author:user._id
      };
      const response = await axios.put(
        `${BaseURL}/order/order-notes/${rowData?._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setsubmitLoading(false);
        if (rowData) {
            handleRefresh((prevFlag) => !prevFlag);
        }
        setdescription("");
        setName("");
        toastRef.current.show({
          severity: "success",
          summary: "Success",
          detail: response.data.message,
          life: 3000,
        });
        setTimeout(() => setVisible(false), 2000);
      }
    } catch (error) {
      setsubmitLoading(false);
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message,
        life: 3000,
      });
    }
  };

  

  return (
    <>
      <Toast ref={toastRef} />
<i
                         onClick={() => {
                            setVisible(true);
                          }}
                        className="pi pi-pen-to-square mr-2 text-primary cursor-pointer"
                      />


      <Dialog
        header={`Update Notes - (${rowData?.orderId?.orderId})`}
        maximizable
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => setVisible(false)}
      >
        {/* <Divider align="left">
    <div className="inline-flex align-items-center">
        <b>{rowData.orderId}</b> -
        <b>{rowData.customerId.name}</b>
    </div>
</Divider> */}
        <div className="field mb-5">
          <div className="grid grid-cols-1 gap-2 ">
            <div className="flex flex-col gap-1">
              <label className="mt-2.5 block text-[0.9em] font-bold text-black">
                Title
              </label>
              <InputText
                placeholder="title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mb-3 w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="mt-2.5 block text-[0.9em] font-bold text-black">
                Description
              </label>
              <InputTextarea
                rows={4}
                value={description}
                onChange={(e) => setdescription(e.target.value)}
                placeholder="Write here..."
                className="mb-3 w-full"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-5">
            <CanceButton onClick={() => setVisible(false)} />

            <Button label="Update" loading={submitLoading} onClick={addRole} />
          </div>
        </div>
    
      
      </Dialog>
    </>
  );
};

export default UpdateOrderNote;
