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
import { BaseURL } from "../../../../utils/baseUrl";
import { Tag } from "primereact/tag";
import useDebounce from "@/hooks/useDebounce";
import { Toast } from "primereact/toast";
import { FaEdit } from "react-icons/fa";
import Loader from "@/components/common/Loader";
import apiServices from "../../../../services/apiService";
import { useRouter } from "next/navigation";
import { ToggleButton } from "primereact/togglebutton";
import { InputSwitch } from "primereact/inputswitch";
import UpdateList from "./UpdateList";
import { Dialog } from "primereact/dialog";
import axios from "axios";
import { useSelector } from "react-redux";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";

export default function ListValue() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const debouncedSearch = useDebounce(search, 1000); // Add debounce with a 500ms delay
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [editItemId, setEditItemId] = useState(null); // State for the item being edited
  const [editName, seteditName] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [updateLoder, setupdateLoder] = useState(false);

  const handleEditClick = (id, name) => {
    setEditItemId(id); // Set the current item ID to be edited
    seteditName(name);
    setVisible(true); // Open the modal
  };

  const toast = useRef();
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiServices.get(
        `/list/value-list?search=${debouncedSearch}&page=${page}&limit=${rows}}`,
      );
      const result = response.data;
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
  }, [page, rows, debouncedSearch, refreshFlag]);

  const onSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const onPageChange = (event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  };

  const handleToggleChange = async (id, value) => {
    try {
      const response = await apiServices.update(`/list/value-list`, {
        id: id,
        isActive: value,
      });
      if (response.data.success) {
        setCustomers((prevCustomers) =>
          prevCustomers.map((item) =>
            item._id === id ? { ...item, isActive: value } : item,
          ),
        );
        toast.current.show({
          severity: value ? "success" : "error",
          summary: "Status Updated",
          detail: `Type ${value ? "Enabled" : "Disabled"} successfully!`,
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update status.",
        life: 3000,
      });
    }
  };

  const updateCategory = async () => {
    setupdateLoder(true);
    try {
      // API call
      const response = await apiServices.update(`/list/list-value/update`, {
        id: editItemId,
        name: editName,
      });

      // Check for success
      if (response?.data?.success) {
        handleRefresh();
        setupdateLoder(false); // Stop loader
        setVisible(false); // Close modal

        // Show success toast
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: response.data.message,
          life: 3000,
        });

        // Update customers list
        customers((prevData) =>
          prevData.map((category) =>
            category._id === editItemId
              ? { ...category, name: editName }
              : category,
          ),
        );
      } else {
        // Handle API failure (success: false)
        setupdateLoder(false);
        toast.current.show({
          severity: "warn",
          summary: "Update Failed",
          detail: response.data.message || "Failed to update the category.",
          life: 3000,
        });
      }
    } catch (error) {
      // Handle network errors or other unexpected exceptions
      setupdateLoder(false);

      console.error("Error updating category:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshFlag((prevFlag) => !prevFlag);
  };

  return (
    <div className="card">
      <GoPrevious route={"/system-setup/"} />
      <Toast ref={toast} />
      <Dialog
        header="Update Category"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <label htmlFor="">Name</label>
        <InputText
          value={editName}
          onChange={(e) => seteditName(e.target.value)}
          placeholder="Edit Category"
        />
        <div className="mt-5 flex justify-end gap-3">
          <div className="">
            <Button onClick={() => setVisible(false)}>Cancel</Button>
          </div>
          <div className="">
            <Button
              loading={updateLoder}
              onClick={updateCategory}
              severity="warning"
            >
              Update
            </Button>
          </div>
        </div>
      </Dialog>
      <div className=" mb-5 flex justify-between  pb-4">
        <div className="flex items-center justify-start gap-2">
          <label className="text-[20px] font-semibold">List of Values</label>
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
            {/* <Link href={"/system-setup/depots/add"}>
              <Button className="" colorScheme={"orange"}>
                Add Account
              </Button>
            </Link> */}
            <UpdateList
              title={`Add New Value List`}
              parent={null}
              fetchDataList={handleRefresh}
            />
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
          <DataTable
            value={customers || []}
            paginator={false}
            showGridlines
            scrollable
            scrollHeight="400px"
            className="mb-3"
            // loading={loading}
            rows={rows}
            tableStyle={{ minWidth: "50rem" }}
          >
            <Column
              sortable
              field="name"
              header="Name"
              body={(item) => (
                <Button
                  size="small"
                  label={item.name}
                  link
                  onClick={() =>
                    router.push(`/system-setup/list-value/${item._id}`)
                  }
                />
              )}
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="status"
              header="Status"
              body={(item) => (
                <>
                  <Tag
                    severity={item.isActive === true ? "success" : "danger"}
                    value={item.isActive == true ? "Active" : "Disable"}
                  />
                </>
              )}
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="isActive"
              header="Type"
              style={{ width: "25%" }}
              body={(item) => (
                <>
                  <InputSwitch
                    checked={item.isActive}
                    onChange={(e) => handleToggleChange(item._id, e.value)}
                    //   onChange={(e) => setChecked(e.value)}
                    className="w-8rem"
                  />
                </>
              )}
            ></Column>

            <Column
              field="type"
              header="Action"
              style={{ width: "25%" }}
              body={(info) => {
                return (
                  <div className="flex gap-4">
                    <div className="">
                      <FaEdit
                        onClick={() => handleEditClick(info._id, info.name)}
                        className="text-orangecolor cursor-pointer"
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
