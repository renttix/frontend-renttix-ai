"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import Link from "next/link";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Badge } from "primereact/badge";
import { Tag } from "primereact/tag";
import useDebounce from "@/hooks/useDebounce";
import { Toast } from "primereact/toast";
import { FaEdit } from "react-icons/fa";
import Loader from "@/components/common/Loader";
import apiServices from "../../../../services/apiService";
import { MdDeleteForever } from "react-icons/md";
import CanceButton from "@/components/Buttons/CanceButton";
import { Dialog } from "primereact/dialog";
import { BaseURL } from "../../../../utils/baseUrl";
import TableComponent from "@/components/common/table/TableComponent";
import { useDispatch } from "react-redux";
import { setDefaultColumns } from "@/store/columnVisibilitySlice";

export default function PaymentTerms() {
  const [paymentTerms, setpaymentTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const debouncedSearch = useDebounce(search, 1000); // Add debounce with a 500ms delay
const dispatch = useDispatch()
  const toast = useRef();
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiServices.get(
        `/payment-terms?search=${debouncedSearch}&page=${page}&limit=${rows}}`,
      );
      const result = response.data;
      if (result.success) {
        setpaymentTerms(result.data);
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
const response = await apiServices.delete(`${BaseURL}/payment-terms/${id}`)
const result = response.data
      if (result.success) {
        // Remove the deleted customer locally
        setpaymentTerms((prevPaymentTerms) =>
          prevPaymentTerms.filter((item) => item._id !== id),
        );
        setTotalRecords((prevTotal) => prevTotal - 1);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Payment Terms deleted successfully!",
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: result.message || "Failed to delete Payment Terms!",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting Payment Terms:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while deleting the Payment Terms.",
        life: 3000,
      });
    } finally {
      setLoading(false);
      setVisible(false); // Close the confirmation dialog
    }
  };


  const onSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const onPageChange = (event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  };

  const Columns = {
    name: "Name",
    code: "Code",
    description: "Description",
    periodType: "Period Type",
    action: "Action",
  };

  useEffect(() => {
    dispatch(setDefaultColumns({ tableName: "", columns: Object.keys(Columns) }));
  }, [dispatch]);

  const renderColumnsBody = (field, item) => {
    switch (field) {
   
   
      
      case "periodType":
        return (
          <div className="">
            <Tag severity={"success"} value={item.periodType} />
          </div>
        );;
      case "code":
        return <Tag severity={"warning"} value={item.code} />;
      case "action":
        return (
          <div className="flex gap-4">
            <Link
              style={{ color: "#337ab7" }}
              href={`/system-setup/payment-terms/update/${item?._id}`}
            >
              <div className="">
                <FaEdit className="text-orangecolor cursor-pointer" />
              </div>
            </Link>
            <MdDeleteForever
              className="cursor-pointer text-red-500"
              onClick={() => setVisible(item._id)} // Pass customer ID to dialog
            />
          </div>
        );
      default:
        return item[field];
    }
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
      <div className=" mb-5 flex justify-between  pb-4">
        <div className="flex items-center justify-start gap-2">
          <label className="text-[20px] font-semibold">Payment Terms</label>
          <Badge
            value={paymentTerms?.length}
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
            <Link href={"/system-setup/payment-terms/add"}>
              <Button className="" colorScheme={"orange"}>
                Add Account
              </Button>
            </Link>
          </div>
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

         <TableComponent
                  loading={loading}
                    tableName="depots"
                    columns={Columns}
                    data={paymentTerms}
                    renderColumnBody={renderColumnsBody}
                  />
          
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
