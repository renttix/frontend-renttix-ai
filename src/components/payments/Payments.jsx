"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
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
import { useRouter } from "next/navigation";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import DeleteModel from "@/components/common/DeleteModel/DeleteModel";
import { openDeleteModal } from "@/store/deleteModalSlice";
import { useDispatch, useSelector } from "react-redux";
import TableComponent from "@/components/common/table/TableComponent";
import ExportData from "@/components/common/imports/ExportData";
import { setDefaultColumns } from "@/store/columnVisibilitySlice";
import apiServices from "../../../services/apiService";
import { formatCurrency } from "../../../utils/helper";
import { SelectButton } from "primereact/selectbutton";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
const items = [
  { name: "All", value: "" },
  { name: "Draft", value: "Draft" },
  { name: "Confirmed", value: "Confirmed" },
  { name: "Posted", value: "Posted" },
];
export default function Payments() {
  const [depotsData, setdepotsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState("");
  const [paymentstate, setPaymentState] = useState("");
  console.log(invoiceStatus);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [depotId, setdepotId] = useState(null);
  const debouncedSearch = useDebounce(search, 1000); // Add debounce with a 500ms delay
  const router = useRouter();
  const { user } = useSelector((state) => state?.authReducer);

  const dispatch = useDispatch();
  const toast = useRef();
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiServices.get(
        `/invoice/all-invoices?search=${debouncedSearch}&page=${page}&limit=${rows}&status=${invoiceStatus}&paymentStatus=${paymentstate}`,
      );
      const result = response.data;
      if (result.success) {
        setdepotsData(result.data);
        setTotalRecords(result.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    console.log(id);
    setdepotsData((prevData) => prevData.filter((item) => item._id !== id));
  };

  useEffect(() => {
    fetchData();
  }, [page, rows, debouncedSearch, invoiceStatus, paymentstate]);

  const onSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const onPageChange = (event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  };

  const Columns = {
    invocie: "Invoice No",
    customerName: "Customer",
    invoiceDate: "invoice Date",
    invoiceUptoDate: "invoice Upto Date",
    status: "Status",
    total: "Amount",
    paymentStatus: "Payment Satus",

    action: "Action",
  };

  useEffect(() => {
    dispatch(
      setDefaultColumns({ tableName: "", columns: Object.keys(Columns) }),
    );
  }, [dispatch]);

  const handleInvoicePayment = async (rowData) => {
    console.log({rowData})
    const InvoicePayload = {
      invoiceId:rowData?._id,
      amount:rowData?.total,
      currency:user?.currencyKey,
      email:rowData?.customerEmail,
      vendorId:user?._id,
      customerId:rowData?.customer_id,
      invoiceNo:rowData?.invocie,
      orderId:rowData?.orderNumber,
      chargingStartDate:rowData?.invoiceUptoDate
    }
    // setLoading(true);


  
    try {
      const { data } = await axios.post(`${BaseURL}/stripes/payment/signle-invoice`, InvoicePayload);
  
      if (data?.url) {
        console.log(data?.url)
        // window.location.href = data.url; 
      } else {
        throw new Error("Invalid payment URL received.");
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Payment Error",
        detail: error?.response?.data?.message || "Failed to initiate payment.",
        life: 3000,
      });
    }
  
    // setLoading(false);
  };

  const renderColumnsBody = (field, item) => {
    switch (field) {
      case "name":
        return (
          <Button
            size="small"
            label={item.name}
            link
            onClick={() =>
              router.push(`/system-setup/depots/detail/${item._id}`)
            }
          />
        );
      case "code":
        return <span>{item.code}</span>;
      case "status":
        return (
          <Tag
            severity={
              item.status == "Posted"
                ? "success"
                : item?.status === "Confirmed"
                  ? "warning"
                  : "info"
            }
            value={item?.status}
          />
        );
      case "paymentStatus":
        return (
          <Tag
            severity={item.paymentStatus === "Unpaid" ? "danger" : "success"}
            value={item?.paymentStatus}
          />
        );
      case "total":
        return (
          <Tag
            severity={item.paymentStatus === "Unpaid" ? "danger" : "success"}
            value={formatCurrency(item?.total, user?.currencyKey)}
          />
        );
      case "action":
        return (
          <div className="flex gap-4">
      {item?.status=='Posted' && item?.paymentStatus=="Unpaid" &&
      <i className="pi pi-bell cursor-pointer text-primary"  onClick={async()=> await handleInvoicePayment(item)} style={{ fontSize: '2rem' }}></i>

                }
          </div>
        );
      default:
        return item[field];
    }
  };

  return (
    <div className="">
      <GoPrevious route={"/system-setup/"} />
      <Toast ref={toast} />

      <DeleteModel handleDeleteLocallay={() => handleDelete(depotId)} />
      <div className=" mb-5 flex justify-between  pb-4">
        <div className="flex flex-wrap gap-2 ">
          {/* <ImportDataModal ListData={[{ name: "Depots" }]} /> */}

          <div className="card justify-content-between gap-5 flex w-full">
            <SelectButton
              size={"small"}
              value={invoiceStatus}
              onChange={(e) => setInvoiceStatus(e.value)}
              optionLabel="name"
              options={items}
            />
            <SelectButton
              value={paymentstate}
              onChange={(e) => setPaymentState(e.value)}
              optionLabel="name"
              options={[
                { name: "All", value: "" },
                { name: "Paid", value: "Paid" },
                { name: "Unpaid", value: "Unpaid" },
              ]}
            />
          </div>
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

        
        </div>
      </div>

      <TableComponent
        loading={loading}
        tableName="depots"
        columns={Columns}
        data={depotsData}
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
    </div>
  );
}
