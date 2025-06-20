"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { useSelector } from "react-redux";
import Link from "next/link";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Badge } from "primereact/badge";
import { BaseURL } from "../../../../../utils/baseUrl";
import { Tag } from "primereact/tag";
import useDebounce from "@/hooks/useDebounce";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import AddRoleModal from "../role-permission/add-role-modal/AddRoleModal";
import Loader from "@/components/common/Loader";

export default function PaginatorTemplateDemo() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const debouncedSearch = useDebounce(search, 1000); // Add debounce with a 500ms delay

  const toast = useRef();
  const { token } = useSelector((state) => state?.authReducer);

  const handleSwitchChange = async (id, checked) => {
    console.log(id, checked);
    try {
      setCustomers((prevData) =>
        prevData.map((item) =>
          item._id === id ? { ...item, accountStatus: checked } : item,
        ),
      );

      const response = await axios.put(
        `${BaseURL}/sub-vendor/sub-user-status`,
        { id: id, accountStatus: checked },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.current.show({
          severity: checked ? "success" : "error",
          summary: "Status Changed",
          detail: `Account ${checked ? "Activated" : "Disabled"} successfully!`,
          life: 3000,
        });
      }
    } catch (error) {
      // toast.current.show({
      //   severity: "error",
      //   summary: "Error",
      //   detail: error.response.data.message,
      //   life: 3000,
      // });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BaseURL}/sub-vendor/all-sub-user?search=${debouncedSearch}&page=${page}&limit=${rows}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.success) {
        setCustomers(result.data);
        setTotalRecords(result.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rows, debouncedSearch]);

  const onSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to the first page when search changes
  };

  const onPageChange = (event) => {
    setPage(event.page + 1); // PrimeReact uses 0-based index for pages
    setRows(event.rows);
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <div className=" mb-5 flex justify-between  pb-4">
        <div className="flex items-center justify-start gap-2">
          <label className="text-[20px] font-semibold">Accounts</label>
          <Badge
            value={customers?.length}
            size="small"
            severity="warning"
          ></Badge>
        </div>
        <div className="flex justify-between gap-4">
          <div className="align-items-center justify-content-between flex flex-wrap gap-2">
            <IconField iconPosition="right">
              {search == null || search == "" ? (
                <InputIcon className="pi pi-search" />
              ) : (
                <></>
              )}
              <InputText
                placeholder="Search"
                value={search}
                onChange={onSearch}
              />
            </IconField>
          </div>

          <div className="">
            <Link href={"/system-setup/roles/create"}>
              <Button className="" colorScheme={"orange"}>
                Add Account
              </Button>
            </Link>
          </div>
          <AddRoleModal />
        </div>
      </div>

      {loading ? (
        <>
          <div className="flex  h-svh items-center justify-center">
            <Loader />{" "}
          </div>
        </>
      ) : (
        <>
          <DataTable
            value={customers || []}
            paginator={false}
            showGridlines 
             scrollable scrollHeight="400px"
            className="mb-3"
            // loading={loading}
            rows={rows}
            tableStyle={{ minWidth: "50rem" }}
            
          >
            <Column
              sortable
              field="legalName"
              header="Name"
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="email"
              header="Email"
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="role"
              header="Role"
              style={{ width: "25%" }}
              body={(item) => (
                <>
                  <Tag severity={"success"} value={item.role} />
                </>
              )}
            ></Column>
            <Column
              field="accountStatus"
              header="Type"
              body={(info) => {
                return (
                  <div className="">
                    <InputSwitch
                      checked={info.accountStatus}
                      onChange={(e) => handleSwitchChange(info._id, e.value)}
                    />
                  </div>
                );
              }}
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="type"
              header="Action"
              style={{ width: "25%" }}
              body={(info) => {
                return (
                  <div className="flex gap-4">
                    <Link
                      style={{ color: "#337ab7" }}
                      href={`/system-setup/roles/update/${info?._id}`}
                    >
                      <div className="">
                        <FaEdit className="text-orangecolor cursor-pointer text-primary" />
                      </div>
                    </Link>
                  </div>
                );
              }}
            ></Column>
          </DataTable>
          <Paginator
            first={(page - 1) * rows}
            rows={rows}
            totalRecords={totalRecords}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={onPageChange}
            template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
          />
        </>
      )}
    </div>
  );
}
