"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import useDebounce from "../../hooks/useDebounce";
import { BaseURL } from "../../../utils/baseUrl";
import TableComponent from "../common/table/TableComponent";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { Tag } from "primereact/tag";
import UpdateCategoryModel from "./UpdateCategoryModel";
import { Paginator } from "primereact/paginator";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// columns definition
const columns = {
  name: "Name",
  isActive: "Status",
  toggle: "Toggle",
  action: "Action",
};

export default function SubCategoryList() {
  const { token } = useSelector((s) => s.authReducer);
  const toast = useRef(null);
  const params = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(20);
  const [parentTitle, setParentTitle] = useState("");

  // edit dialog
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [editName, setEditName] = useState("");
  const router = useRouter();

      const handleRefresh = () => {
    setRefreshFlag((prevFlag) => !prevFlag);
  };

  // fetch sub-categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BaseURL}/category-sub-list`, {
          params: {
            name: debouncedSearch,
            page,
            limit: rows,
            parentId: params.id,
          },
           headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.data.success) {
          setData(res.data.data);
          setParentTitle(res.data.parent);
          setTotalRecords(res.data.pagination.total);
        }
      } catch (err) {
        toast.current.show({
          severity: "error",
          summary: "Load Error",
          detail: err.message,
          life: 3000,
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [debouncedSearch, page, rows, params.id,refreshFlag]);

  // page change
  const onPageChange = (e) => {
    setPage(e.page + 1);
    setRows(e.rows);
  };

  // toggle active
  const toggleStatus = async (item) => {
    const updated = { ...item, isActive: !item.isActive };
    setData((d) => d.map((x) => (x._id === item._id ? updated : x)));
    try {
      const res = await axios.put(
        `${BaseURL}/category`,
        { id: item._id, isActive: updated.isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.current.show({
        severity: updated.isActive ? "success" : "warn",
        summary: updated.isActive ? "Activated" : "Disabled",
        detail: res.data.message,
        life: 2000,
      });
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.response?.data?.message || err.message,
        life: 3000,
      });
    }
  };

  // open edit dialog
  const openEdit = (item) => {
    setEditItemId(item._id);
    setEditName(item.name);
    setDialogVisible(true);
  };

  // save edit
  const saveEdit = async () => {
    try {
      const res = await axios.put(
        `${BaseURL}/category/update`,
        { id: editItemId, name: editName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setData((d) =>
        d.map((x) => (x._id === editItemId ? { ...x, name: editName } : x)),
      );
      toast.current.show({
        severity: "success",
        summary: "Updated",
        detail: res.data.message,
        life: 2000,
      });
      setDialogVisible(false);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.response?.data?.message || err.message,
        life: 3000,
      });
    }
  };

  // client-side delete
  const confirmDelete = (id) => {
    setData((d) => d.filter((x) => x._id !== id));
    toast.current.show({
      severity: "info",
      summary: "Deleted",
      detail: "Sub-category removed",
      life: 2000,
    });
  };

  // render cell
  const renderColumnBody = (field, item) => {
    switch (field) {
      case "name":
        return (
          <Link href={`/system-setup/category/sub-category/${item._id}`}>
            <span className="text-blue-600 underline">{item.name}</span>
          </Link>
        );
      case "isActive":
        return (
          <Tag
            value={item.isActive ? "Active" : "Disabled"}
            severity={item.isActive ? "success" : "danger"}
          />
        );
      case "toggle":
        return (
          <InputSwitch
            checked={item.isActive}
            onChange={() => toggleStatus(item)}
          />
        );
      case "action":
        return (
          <div className="flex gap-2">
            <Button
              icon="pi pi-pencil"
              className="p-button-text p-button-sm"
              onClick={() => openEdit(item)}
            />
            <Button
              icon="pi pi-trash"
              className="p-button-text p-button-sm p-button-danger"
              onClick={() => confirmDelete(item._id)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // force refetch after Add


  return (
    <div className="p-8">
      <Toast ref={toast} />

      <div className="mb-4 flex items-center justify-between">
        {/* <GoPrevious route="/system-setup/category" />
         */}
        <div className="flex gap-4">
          <i
            onClick={() => router.back()}
            className="pi cursor-pointer pi-arrow-left t mb-4 rounded-md bg-primary px-4 py-2 text-white dark:bg-slate-500 dark:text-dark"
          />
          <h2 className="text-xl font-semibold">
            Sub-categories of {parentTitle}
          </h2>
        </div>
        <div className="flex gap-2">
          <div className="">
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="p-inputtext-sm"
            />
          </div>
          <UpdateCategoryModel
            title="Add New Sub Category"
            parent={parentTitle}
            id={params.id}
            fetchDataList={handleRefresh}
          />
        </div>
      </div>

      <TableComponent
        tableName="sub-category"
        columns={columns}
        data={data}
        loading={loading}
        renderColumnBody={renderColumnBody}
        isSelection={false}
        onSelectionChange={() => {}}
      />

      <Paginator
        first={(page - 1) * rows}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[5, 10, 20, 50]}
        onPageChange={onPageChange}
        template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      />

      <Dialog
        header="Update Sub Category"
        visible={isDialogVisible}
        style={{ width: "350px" }}
        modal
        onHide={() => setDialogVisible(false)}
      >
        <div className="flex flex-col gap-2">
          <label>Name</label>
          <InputText
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => setDialogVisible(false)}
          />
          <Button
            label="Save"
            icon="pi pi-check"
            className="p-button-sm p-button-success"
            onClick={saveEdit}
          />
        </div>
      </Dialog>
    </div>
  );
}
