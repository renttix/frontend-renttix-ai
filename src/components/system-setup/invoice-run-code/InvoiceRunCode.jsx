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
import { Tag } from "primereact/tag";
import useDebounce from "@/hooks/useDebounce";
import { Toast } from "primereact/toast";
import { FaHandshake } from "react-icons/fa";
// import AddRoleModal from "../role-permission/add-role-modal/AddRoleModal";
import Loader from "@/components/common/Loader";
import { BaseURL } from "../../../../utils/baseUrl";
import { Dialog } from "primereact/dialog";
import { MdDeleteForever } from "react-icons/md";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CanceButton from "@/components/Buttons/CanceButton";

export default function InvoiceRunCode() {
  const [invoiceCode, setInvoiceRunCode] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const debouncedSearch = useDebounce(search, 1000); // Add debounce with a 500ms delay

  const toast = useRef();
  const { token } = useSelector((state) => state?.authReducer);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BaseURL}/invoice-run-code?search=${debouncedSearch}&&page=${page}&&limit=${rows}`,
        // `${BaseURL}/sub-vendor/all-sub-user?search=${debouncedSearch}&page=${page}&limit=${rows}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.success) {
        setInvoiceRunCode(result.data);
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

  const deleteCustomer = async (id) => {
    try {
      const response = await fetch(`${BaseURL}/invoice-run-code/${id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        // Remove the deleted customer locally
        setInvoiceRunCode((previnvoiceCode) =>
          previnvoiceCode.filter((customer) => customer._id !== id),
        );
        setTotalRecords((prevTotal) => prevTotal - 1);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Customer deleted successfully!",
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: result.message || "Failed to delete customer!",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while deleting the customer.",
        life: 3000,
      });
    } finally {
      setLoading(false);
      setVisible(false); // Close the confirmation dialog
    }
  };

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
      <div className="card justify-content-center flex">
        <Dialog
          header="Confirmation"
          visible={visible}
          onHide={() => setVisible(false)}
          footer={
            <div className="flex justify-end gap-2">
              <div className="">
                <CanceButton onClick={() => setVisible(false)} />
              </div>
              <Button
                label="Yes"
                size="small"
                icon="pi pi-check"
                onClick={() => deleteCustomer(visible)} // Pass the customer ID to delete
                autoFocus
              />
            </div>
          }
        >
          <p>Are you sure you want to delete this code?</p>
        </Dialog>
      </div>
      <div className=" mb-5 flex justify-between  ">
        <div className="flex items-center justify-start gap-2">
          <label className="text-[20px] font-semibold">Invoice Run Codes</label>
          <Badge
            value={invoiceCode?.length}
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
            <Link href={"/system-setup/invoice-run-code/create"}>
              <Button className="" colorScheme={"orange"}>
                Add Invoice Run Code
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <hr className="mb-7 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark " />


      {loading ? (
        <>
          <div className="flex  h-svh items-center justify-center">
            <Loader />{" "}
          </div>
        </>
      ) : (
        <>
          <DataTable
            value={invoiceCode || []}
            paginator={false}
            className=" border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card mb-3"
            // loading={loading}
            rows={rows}
            tableStyle={{ minWidth: "50rem" }}
          >
            <Column
              sortable
              field="name"
              body={(info) => {
                return (
                  <span>
                    <Link
                      style={{ color: "#337ab7" }}
                      href={`/system-setup/invoice-run-code/update/${info?._id}`}
                    >
                      <div className="flex items-center justify-start gap-3">
                        <FaHandshake className="text-[40px] text-[#555]  dark:text-white" />
                        <label className=" capitalize">{info.name}</label>
                      </div>
                    </Link>
                  </span>
                );
              }}
              header="Name"
              style={{ width: "25%" }}
            ></Column>

            <Column
              field="code"
              header="Code"
              style={{ width: "25%" }}
              body={(item) => (
                <>
                  <Tag severity={"success"} value={item.code} />
                </>
              )}
            ></Column>
            <Column
              field="description"
              header="Description"
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="type"
              header="Action"
              style={{ width: "25%" }}
              body={(info) => {
                return (
                  <div className="flex gap-4">
                    <div className="">
                      <MdDeleteForever
                        className="cursor-pointer text-red-500"
                        onClick={() => setVisible(info._id)} // Pass customer ID to dialog
                      />
                    </div>
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
