"use client";
import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
// import { customerService } from "./service/customerService";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import axios from "axios";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { useRouter } from "next/navigation";
import { BaseURL } from "../../../utils/baseUrl";
import Link from "next/link";
import { MultiSelect } from "primereact/multiselect";
import { ProgressSpinner } from "primereact/progressspinner";
import Loader from "../common/Loader";
import CanceButton from "../Buttons/CanceButton";
import { Checkbox } from "primereact/checkbox";
import { LuFilter } from "react-icons/lu";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import TableComponent from "../common/table/TableComponent";
import { setDefaultColumns } from "@/store/columnVisibilitySlice";
import { FaEdit } from "react-icons/fa";
import { Paginator } from "primereact/paginator";
import useDebounce from "@/hooks/useDebounce";


export default function CustomerListing() {
  let emptycustomer = {
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

  const [customers, setcustomers] = useState([]);
  const [customerDialog, setcustomerDialog] = useState(false);
  const [deletecustomerDialog, setDeletecustomerDialog] = useState(false);
  const [deleteOrdersDialog, setDeleteOrdersDialog] = useState(false);
  const [customer, setcustomer] = useState(emptycustomer);
  const [selectedcustomers, setSelectedcustomers] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [deleteLoader, setdeleteLoader] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const [globalFilter, setGlobalFilter] = useState(null);
  const toast = useRef(null);
  const [loading, setloading] = useState(false);
  const dt = useRef(null);
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const debouncedSearch = useDebounce(search, 1000); // Add debounce with a 500ms delay

  const [visibleColumns, setVisibleColumns] = useState([
    { field: "name.name", header: "Customer", visible: true },
    { field: "type", header: "Type", visible: true },
    { field: "status", header: "Status", visible: true },
    { field: "city", header: "City", visible: true },
    { field: "action", header: "Action", visible: true },
  ]);

  const dispatch = useDispatch();
  const Columns = {
    title: "Customer", // Key in quotes to make it valid
    type: "Type",
    status: "Status",
    city: "City",
    action: "Action",
  };

  const { token } = useSelector((state) => state?.authReducer);

  useEffect(() => {
    setloading(true);
    axios
      .get(
        `${BaseURL}/customer/customer?search=${debouncedSearch}&page=${page}&limit=${rows}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      )
      .then((response) => {
        setloading(false);
        setcustomers(response.data.data);
        setTotalRecords(response.data.pagination.total);
      })
      .catch((error) => {
        // setError(error);
        setloading(false);
      });
  }, [token, page, rows, debouncedSearch]);

  const hideDialog = () => {
    setSubmitted(false);
    setcustomerDialog(false);
  };

  const hideDeletecustomerDialog = () => {
    setDeletecustomerDialog(false);
  };

  const hideDeleteOrdersDialog = () => {
    setDeleteOrdersDialog(false);
  };

  const savecustomer = () => {
    setSubmitted(true);

    if (customer.name.trim()) {
      let _customers = [...customers];
      let _customer = { ...customer };

      if (customer.id) {
        const index = findIndexById(customer.id);

        _customers[index] = _customer;
        toast.current.show({
          severity: "success",
          summary: "Successful",
          detail: "customer Updated",
          life: 3000,
        });
      } else {
        _customer.id = createId();
        _customer.image = "customer-placeholder.svg";
        _customers.push(_customer);
        toast.current.show({
          severity: "success",
          summary: "Successful",
          detail: "customer Created",
          life: 3000,
        });
      }

      setcustomers(_customers);
      setcustomerDialog(false);
      setcustomer(emptycustomer);
    }
  };

  const confirmDeletecustomer = (customer) => {
    setcustomer(customer);
    setDeletecustomerDialog(true);
  };

  const deletecustomer = async () => {
    setdeleteLoader(true);
    try {
      let res = await axios.delete(
        `${BaseURL}/customer/customer/${customer._id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      let _customers = customers.filter((val) => val._id !== customer._id);

      setcustomers(_customers);
      setDeletecustomerDialog(false);
      setcustomer(emptycustomer);
      setdeleteLoader(false);
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
      setdeleteLoader(false);
      console.log(error);
    }
  };

  const findIndexById = (id) => {
    let index = -1;

    for (let i = 0; i < customers.length; i++) {
      if (customers[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  };

  const createId = () => {
    let id = "";
    let chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return id;
  };

  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const confirmDeleteSelected = () => {
    setDeleteOrdersDialog(true);
  };

  const deleteSelectedcustomers = () => {
    let _customers = customers.filter(
      (val) => !selectedcustomers.includes(val),
    );

    setcustomers(_customers);
    setDeleteOrdersDialog(false);
    setSelectedcustomers(null);
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: "customers Deleted",
      life: 3000,
    });
  };

  const getSeverity = (item) => {
    switch (item.type) {
      case "Customer":
        return "success";

      case "Supplier":
        return "info";

      case "Reseller":
        return "";
      case "Sub-Contractor":
        return "info";

      default:
        return null;
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
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        {/* <Button
          label="New customer"
          icon="pi pi-plus"
          severity="success"
          onClick={openNew}
        /> */}
        <Button
          label="Export"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={exportCSV}
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          style={{ background: "red" }}
          onClick={confirmDeleteSelected}
          disabled={!selectedcustomers || !selectedcustomers.length}
        />
      </div>
    );
  };

  useEffect(() => {
    dispatch(
      setDefaultColumns({ tableName: "", columns: Object.keys(Columns) }),
    );
  }, [dispatch]);

  const renderColumnsBody = (field, item) => {
    switch (field) {
      case "title":
        return (
          <Button
            size="small"
            label={item.title}
            link
            onClick={() =>
              router.push(`/customer/${item._id}`)
            }
          />
        );
      case "type":
        return <Tag severity={getSeverity(item)} value={item.type} />;
      case "status":
        return (
          <Tag
            severity={item.status === "Active" ? "success" : "danger"}
            value={item.status}
          />
        );
      case "country":
        return <Tag severity={"success"} value={item.country} />;
      case "action":
        return (
          <div className="flex gap-4">
            <Link href={`/customer/update/${item._id}`}>
          <i className="pi pi-pen-to-square mr-2 text-primary" /> </Link>
        <i
          className="pi pi-trash ml-2 text-red cursor-pointer"
          onClick={() => confirmDeletecustomer(item)}
        />
          </div>
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

  const deletecustomerDialogFooter = (
    <React.Fragment>
      <div className="flex justify-end gap-2">
        <CanceButton onClick={hideDeletecustomerDialog} />
        <Button
          label="Yes"
          icon={"pi pi-check"}
          loading={deleteLoader}
          severity="danger"
          onClick={deletecustomer}
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
          onClick={deleteSelectedcustomers}
        />
      </div>
    </React.Fragment>
  );

  return (
    <div>
      {/* <Breadcrumb pageName="Customers" />
       */}
      <div className="flex gap-3">
        <GoPrevious route={"/dashboard"} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white ">
Customer List        </h2>
      </div>
      <Toast ref={toast} />
      <div className="card">
        <Toolbar
          className="mb-4"
          left={leftToolbarTemplate}
          // right={rightToolbarTemplate}
          right={header}
        ></Toolbar>

        <>
          {/* <div className="card justify-content-center flex">
              <div
                onClick={() => setVisible(true)}
                className="flex items-center justify-start"
              >
                <label htmlFor="" className="cursor-pointer py-1 font-bold">
                  Show/Hide Columns
                </label>
                <LuFilter
                  className="text-lg"
                  severity=""
                  label="Show/Hide Columns"
                  icon="pi pi-external-link"
                />
              </div>
              <Dialog
                header="Show/Hide Columns"
                visible={visible}
                style={{ width: "50vw" }}
                onHide={() => {
                  if (!visible) return;
                  setVisible(false);
                }}
              >
                <div className="mb-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {visibleColumns.map((col) => (
                      <div key={col.field} className="align-items-center flex">
                        <Checkbox
                          type="checkbox"
                          checked={col.visible}
                          onChange={() => toggleColumnVisibility(col.field)}
                          className="mr-2"
                        />
                        <label>{col.header}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </Dialog>
            </div> */}
          {/* <DataTable ref={dt}
              value={customers || []}
              selection={selectedcustomers}
              onSelectionChange={(e) => setSelectedcustomers(e.value)}
              dataKey="_id"
              paginator
              className="rounded-[10px] border border-stroke bg-white py-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card"
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              emptyMessage="No customers found."
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Customers"
              globalFilter={globalFilter}
            >
              <Column selectionMode="multiple" exportable={false}></Column>
        
              {visibleColumns.find(
                (col) => col.field === "name.name" && col.visible,
              ) && (
                <Column
                  field="name.name"
                  sortable
                  header="Customer"
                  body={representativeBodyTemplate}
                />
              )}
              {visibleColumns.find(
                (col) => col.field === "type" && col.visible,
              ) && (
                <Column
                  field={"type"}
                  header="Type"
                  body={(item) => {
                    return (
                      <>
                        <Tag
                          severity={getSeverity(item)}
                          value={item.type}
                        ></Tag>
                      </>
                    );
                  }}
                  sortable
                  style={{ minWidth: "8rem" }}
                ></Column>
              )}
              {visibleColumns.find(
                (col) => col.field === "status" && col.visible,
              ) && (
                <Column
                  field="status"
                  header="Status"
                  sortable
                  body={(item) => {
                    return (
                      <>
                        <Tag
                          severity={
                            item.status === "Active" ? "success" : "danger"
                          }
                          value={item.status}
                        ></Tag>
                      </>
                    );
                  }}
                  style={{ minWidth: "10rem" }}
                ></Column>
              )}
              {visibleColumns.find(
                (col) => col.field === "city" && col.visible,
              ) && (
                <Column
                  field="city"
                  header="City"
                  sortable
                  body={(item) => {
                    return (
                      <>
                        <span>{item.city}</span>
                      </>
                    );
                  }}
                  style={{ minWidth: "10rem" }}
                ></Column>
              )}
              {visibleColumns.find(
                (col) => col.field === "action" && col.visible,
              ) && (
                <Column
                  body={actionBodyTemplate}
                  field="action"
                  header="Action"
                  exportable={false}
                  style={{ minWidth: "12rem" }}
                ></Column>
              )}
            </DataTable> */}
          <TableComponent
            loading={loading}
            tableName="Customer"
            columns={Columns}
            data={customers}
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
      </div>

      <Dialog
        visible={deletecustomerDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deletecustomerDialogFooter}
        onHide={hideDeletecustomerDialog}
      >
        <div className="confirmation-content flex items-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {customer && (
            <span>
              Are you sure you want to delete <b>{customer.name.name}</b>?
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
          {customer && (
            <span>Are you sure you want to delete the selected Orders?</span>
          )}
        </div>
      </Dialog>
    </div>
  );
}
