import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { useSelector } from "react-redux";

export default function UpdateCategoryModel({
  title,
  parent,
  id,
  fetchDataList,
  pageName,
}) {
  const toast = useRef(null);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const { token } = useSelector((s) => s.authReducer);

  const headerText = parent
    ? `Add Sub Category in ${parent}`
    : "Add New Category";

  const toggleDialog = () => setVisible((v) => !v);

  const save = async () => {
    try {
      const res = await axios.post(
        `${BaseURL}/category`,
        { parentId: id, name },
      { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchDataList();
        setName("");
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: res.data.message,
          life: 3000,
        });
        toggleDialog();
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: res.data.message,
          life: 3000,
        });
      }
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.response?.data?.message || err.message,
        life: 3000,
      });
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={toggleDialog}
      />
      <Button
        label="Add"
        icon="pi pi-check"
        size="small"
        onClick={save}
        disabled={!name.trim()}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      {pageName === "product" ? (
        <div
          onClick={toggleDialog}
          className="flex cursor-pointer items-center justify-end gap-2 text-blue-500"
        >
          <label className="cursor-pointer text-[0.9em] font-bold ">
            {title || "Add New Category"}
          </label>
          <i className="pi pi-plus-circle" />
        </div>
      ) : (
        <Button
          label={title || "Add New Category"}
          icon="pi pi-plus"
          className="p-button-sm p-button-warning"
          onClick={toggleDialog}
        />
      )}
      <Dialog
        header={headerText}
        visible={visible}
        // style={{ width: "400px" }}
        style={{ width: '50vw' }}
        modal
        className="rounded-xl p-4"
        footer={footer}
        onHide={toggleDialog}
      >
        <div className="flex flex-col gap-2">
          <label className="font-medium">Name</label>
          <InputText
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
            className="w-full"
          />
        </div>
      </Dialog>
    </>
  );
}
