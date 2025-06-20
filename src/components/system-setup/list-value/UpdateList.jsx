"use client";
import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import axios from "axios";
import { useSelector } from "react-redux";
import { BaseURL } from "../../../../utils/baseUrl";

const UpdateList = ({ title, parent, id, fetchDataList }) => {
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setloading] = useState(false)
  const toast = useRef(null);
  const { token } = useSelector((state) => state?.authReducer);

  const updateCategory = async () => {
    setloading(true)
    try {
      const response = await axios.post(
        `${BaseURL}/list/value-list`,
        {
          parentId: id,
          name: name,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setloading(false)
        fetchDataList();
        setVisible(false); 
        setName("");
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: response.data.message,
          life: 2000,
        });
      } else {
        setloading(false)
        console.error("Failed to update category:", response.data.message);
      }
    } catch (error) {
              setloading(false)

      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "An error occurred",
        life: 2000,
      });
      console.error("Error updating category:", error);
    }
  };

  const footerContent = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setVisible(false)}
        className="p-button-text"
      />
      <Button
        label="Add"
        loading={loading}
        icon="pi pi-check"
        onClick={updateCategory}
        className="p-button-orange"
      />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <Button
        label={title ?? "Add List of values"}
        icon="pi pi-plus"
        className="p-button-orange"
        onClick={() => setVisible(true)}
      />
      <Dialog
        header={
          parent == null
            ? "Add List of values"
            : `Add List of values in ${parent}`
        }
        visible={visible}
        style={{ width: "450px" }}
        footer={footerContent}
        onHide={() => setVisible(false)}
      >
        <div className="field">
          <label htmlFor="name" className="block">
            Name
          </label>
          <InputText
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
            className="w-full"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default UpdateList;
