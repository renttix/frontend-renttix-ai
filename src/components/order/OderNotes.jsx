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
import Link from "next/link";

const OderNotes = ({ rowData }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setsubmitLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setdescription] = useState("");
  const [roles, setRoles] = useState([]);
  const { token,user } = useSelector((state) => state?.authReducer);
  console.log({user})
  const toastRef = React.useRef(null);
  const addRole = async () => {
    setsubmitLoading(true);
    try {
      const payload = {
        name: name,
        description: description,
        customerId: rowData?.customerId?._id,
        orderId: rowData?._id,
        author:user?._id
      };
      const response = await axios.post(
        `${BaseURL}/order/order-notes`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setsubmitLoading(false);
        // if (user) {
        //   refreshFlag((prevFlag) => !prevFlag);
        // }
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

  const fetchRoles = async (orderId, customerId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BaseURL}/order/order-note-details?orderId=${orderId}&customerId=${customerId}`,
        {
          headers: { authorization: `Bearer ${token}` },
        },
      );
      setRoles(response.data.data);
    } catch (err) {
      toastRef.current.show({
        severity: "error",
        summary: "Message",
        detail: err.response.data.message,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toastRef} />

      <RiStickyNoteAddLine
        onClick={() => {
          setVisible(true);
          fetchRoles(rowData?._id, rowData?.customerId?._id); // Call API only on click
        }}
        className="mr-2 cursor-pointer text-primary"
      />

      <Dialog
        header={`Create New Notes - (${rowData.orderId})`}
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

            <Button label="Add" loading={submitLoading} onClick={addRole} />
          </div>
        </div>
        <label
          htmlFor=""
          className=" font-semibold text-dark-2 dark:text-white"
        >
          <Divider align="center">
            <span className="p-tag">Last 5 Recent Note</span>
          </Divider>
        </label>

        {roles?.length >= 1 ? (
          <div className=" ">
            <DataTable
              value={(roles || []).slice(0,5)}
              size="small"
              showGridlines
              scrollable
              scrollHeight="400px"
              // header="Existing Role List"
              // className="custom-datatable"
              responsiveLayout="scroll"
            >
              <Column
                header="Title"
                body={(rowData) => (
                  <div className="flex items-center gap-5 capitalize">
                    {/* <FaUser className="text-[20px] text-[#555555]" /> */}
                    <span className="text-[14px] font-semibold">
                      {rowData?.name}
                    </span>
                  </div>
                )}
              />
              <Column
                header="Auther"
                body={(rowData) => (
                  <div className="flex items-center gap-5 capitalize">
                    {/* <FaUser className="text-[20px] text-[#555555]" /> */}
                    <span className="text-[14px] font-semibold">
                      {rowData?.author?.legalName}-<cite>{rowData?.author?.role}</cite>
                    </span>
                  </div>
                )}
              />
                    <Column
                header="Description"
                body={(rowData) => (
                  <div className="flex items-center gap-5 capitalize">
                    {/* <FaUser className="text-[20px] text-[#555555]" /> */}
                    <span className="text-[14px] font-semibold">
                      {rowData?.description}
                    </span>
                  </div>
                )}
              />
              <Column
                header="Created Date"
                body={(rowData) => (
                  <div className="flex items-center gap-5 capitalize">
                    {/* <FaUser className="text-[20px] text-[#555555]" /> */}
                    <span className="text-[14px] font-semibold">
                      {moment(rowData?.createdAt).format("lll")}
                    </span>
                  </div>
                )}
              />
                 <Column
                header="Updated Date"
                body={(rowData) => (
                  <div className="flex items-center gap-5 capitalize">
                    {/* <FaUser className="text-[20px] text-[#555555]" /> */}
                    <span className="text-[14px] font-semibold">
                      {moment(rowData?.updatedAt).format("lll")}
                    </span>
                  </div>
                )}
              />
                   <Column
                header="Action"
                body={(rowData) => (
                  <Link href={`/customer/notes/${rowData?._id}`}>
                 <i className="pi pi-eye text-primary"/>
                  
                  </Link>
                )}
              />
            </DataTable>
            <ScrollTop
              target="parent"
              threshold={100}
              className="w-2rem h-2rem border-round bg-primary"
              icon="pi pi-arrow-up text-base"
            />
          </div>
        ) : (
          "No Order Notes Found!."
        )}
      </Dialog>
    </>
  );
};

export default OderNotes;
