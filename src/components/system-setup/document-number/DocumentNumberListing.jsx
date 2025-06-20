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

export default function DocumentNumberListing() {
  const [document, setdocument] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const debouncedSearch = useDebounce(search, 1000); // Add debounce with a 500ms delay
  const router = useRouter();

  const toast = useRef();
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiServices.get(
        `/document/doucment-number?search=${debouncedSearch}&page=${page}&limit=${rows}}`,
      );
      const result = response.data;
      if (result.success) {
        setdocument(result.data);
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
    setPage(1);
  };

  const onPageChange = (event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  };

  const buttonStyle = (item) => {
    const styles = {
      country: "success",
      customer: "info",
      global: "secondary",
      company: "blue",
      depot: "warning",
    };

    return styles[item] || "";
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <div className=" mb-5 flex justify-between  pb-4">
        <div className="flex items-center justify-start gap-2">
          <label className="text-[20px] font-semibold text-dark-2 dark:text-white">Document Number</label>
          <Badge
            value={document?.length}
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
            value={document || []}
            paginator={false}
            showGridlines
            scrollable
            scrollHeight="450px"
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
                    router.push(
                      `/system-setup/document-number/update/${item._id}`,
                    )
                  }
                />
              )}
              style={{ width: "25%" }}
            ></Column>
            <Column
             sortable
              field="code"
              header="Code"
              style={{ width: "25%" }}
              body={(item) => (
                <>
                  <Tag severity={"warning"} value={item.code} />
                </>
              )}
            ></Column>
            <Column
             sortable
              field="domain"
              header="Domain	"
              style={{ width: "25%" }}
              body={(item) => (
                <>
                  <Tag severity={"success"} value={item.domain} />
                </>
              )}
            ></Column>
            <Column
             sortable
              field="name"
              header="Type"
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="mask"
              header="Mask"
              style={{ width: "25%" }}
              body={(info) => {
                return (
                  <div className="flex gap-4">
                    <Tag severity={buttonStyle(info.mask)} value={info.mask} />
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
