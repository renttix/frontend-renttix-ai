"use client";
import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { BaseURL } from "../../../utils/baseUrl";
import Link from "next/link";
import CanceButton from "../Buttons/CanceButton";
import Loader from "../common/Loader";
import { Checkbox } from "primereact/checkbox";
import { LuFilter } from "react-icons/lu";
import ExportData from "../common/imports/ExportData";
import TableComponent from "../common/table/TableComponent";
import { useRouter } from "next/navigation";
import useDebounce from "@/hooks/useDebounce";
import { Paginator } from "primereact/paginator";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { setDefaultColumns } from "@/store/columnVisibilitySlice";
import { formatCurrency } from "../../../utils/helper";

export default function InvioceBatchList() {
  let emptyinvoice = {
    id: null,
    name: "",
    image: null,
    description: "",
    category: null,
    price: 0,
    quantity: 0,
    rating: 0,
    inventoryStatus: "INSTOCK",
  };

  const [invoices, setinvoices] = useState([]);
  const [invoiceDialog, setinvoiceDialog] = useState(false);
  const [deleteinvoiceDialog, setDeleteinvoiceDialog] = useState(false);
  const [deleteOrdersDialog, setDeleteOrdersDialog] = useState(false);
  const [invoice, setinvoice] = useState(emptyinvoice);
  const [selectedinvoices, setSelectedinvoices] = useState(null);
  const [globalFilter, setGlobalFilter] = useState(null);
  const toast = useRef(null);
  const [loading, setloading] = useState(false);

  const dt = useRef(null);
  const [visible, setVisible] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const debouncedSearch = useDebounce(search, 1000); // Add debounce with a 500ms delay

  const router = useRouter();
  const dispatch = useDispatch();

  const { token, user } = useSelector((state) => state?.authReducer);


  useEffect(() => {
    setloading(true);
    axios
      .get(
        `${BaseURL}/invoice/invoice-batches?search=${debouncedSearch}&page=${page}&limit=${rows}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        setTotalRecords(response.data.pagination.total);

        setinvoices(response.data.data);
        setloading(false);
      })
      .catch((error) => {
        // setError(error);
        setloading(false);
      });
  }, [page, rows, debouncedSearch]);



  const hideDeleteinvoiceDialog = () => {
    setDeleteinvoiceDialog(false);
  };

  const hideDeleteOrdersDialog = () => {
    setDeleteOrdersDialog(false);
  };

  const confirmDeleteinvoice = (invoice) => {
    setinvoice(invoice);
    setDeleteinvoiceDialog(true);
  };

  const deleteinvoice = async () => {
    setloading(true);
    try {
      let res = await axios.delete(`${BaseURL}/invoice/${invoice._id}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      let _invoices = invoices.filter((val) => val._id !== invoice._id);

      setinvoices(_invoices);
      setDeleteinvoiceDialog(false);
      setinvoice(emptyinvoice);
      setloading(false);
      toast.current.show({
        severity: "success",
        summary: "Successful",
        detail: res.data.message,
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data.message,
        life: 3000,
      });
      setloading(false);
      console.log(error);
    }
  };

  const confirmDeleteSelected = () => {
    setDeleteOrdersDialog(true);
  };

  const deleteSelectedinvoices = () => {
    let _invoices = invoices.filter((val) => !selectedinvoices.includes(val));

    setinvoices(_invoices);
    setDeleteOrdersDialog(false);
    setSelectedinvoices(null);
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: "invoices Deleted",
      life: 3000,
    });
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        {/* <Button
          label="New invoice"
          icon="pi pi-plus"
          severity="success"
          onClick={openNew}
        /> */}

        <ExportData route="/invoice/export" nameFile="invoice-batch" />

        <Button
          label="Delete"
          icon="pi pi-trash"
          style={{ background: "red" }}
          onClick={confirmDeleteSelected}
          disabled={!selectedinvoices || !selectedinvoices.length}
        />
      </div>
    );
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
    account: "Name",
    description: "Description",
    batchDate: "Batch Date",
    totalInvoice: "Total Invoices",
    totalPrice: "Total (Inc. TAX)",
    action: "Action",
  };

  useEffect(() => {
    dispatch(
      setDefaultColumns({ tableName: "Orders", columns: Object.keys(Columns) }),
    );
  }, [dispatch]);

  const renderColumnsBody = (field, item) => {
    switch (field) {
      case "account":
        return (
          <Button
            size="small"
            label={item.name}
            link
            onClick={() => router.push(`/invoicing/invoice-batch/${item?._id}`)}
          />
        );


        case 'batchDate':
          return (
            <label>{moment(item?.batchDate).format('l')}</label>
          )

        case 'totalPrice':
        return (
          <label>{formatCurrency(item.totalPrice,user?.currencyKey)}</label>
        )

      case "action":
        return (
          <i
            className="pi pi-trash ml-2 cursor-pointer text-red"
            onClick={() => confirmDeleteinvoice(rowData)}
          />
        );
      default:
        return item[field];
    }
  };

  const header = (
    <div className="align-items-center justify-content-between flex flex-wrap gap-2">
      <IconField iconPosition="right">
        {search == null || search == "" ? (
          <InputIcon className="pi pi-search" />
        ) : (
          <></>
        )}
        <InputText placeholder="Search" value={search} onChange={onSearch} />
      </IconField>
    </div>
  );

  const deleteinvoiceDialogFooter = (
    <React.Fragment>
      <div className="flex justify-end gap-2">
        <CanceButton onClick={hideDeleteinvoiceDialog} />
        <Button
          label="Yes"
          icon={"pi pi-check"}
          loading={loading}
          severity="danger"
          onClick={deleteinvoice}
        />
      </div>
    </React.Fragment>
  );
  const deleteOrdersDialogFooter = (
    <React.Fragment>
      <div className="flex justify-end gap-2">
        <CanceButton onClick={hideDeleteOrdersDialog} />
        <Button
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          onClick={deleteSelectedinvoices}
        />
      </div>
    </React.Fragment>
  );

  return (
    <div>
      {/* <Breadcrumb pageName="Invoice Batch" />
       */}

      <div className="flex gap-3">
        <GoPrevious route={"/dashboard"} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white ">
          Invoice Batch
        </h2>
      </div>
      <Toast ref={toast} />
      <div className="card">
        <Toolbar
          className="mb-4"
          left={leftToolbarTemplate}
          // right={rightToolbarTemplate}
          right={header}
        ></Toolbar>

        <TableComponent
          loading={loading}
          tableName="InvoiveBatch"
          columns={Columns}
          data={invoices}
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

      <Dialog
        visible={deleteinvoiceDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteinvoiceDialogFooter}
        onHide={hideDeleteinvoiceDialog}
      >
        <div className="confirmation-content flex items-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {invoice && (
            <span>
              Are you sure you want to delete <b>{invoice.name}</b>?
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={deleteOrdersDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteOrdersDialogFooter}
        onHide={hideDeleteOrdersDialog}
      >
        <div className="confirmation-content flex items-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {invoice && (
            <span>Are you sure you want to delete the selected Orders?</span>
          )}
        </div>
      </Dialog>
    </div>
  );
}
