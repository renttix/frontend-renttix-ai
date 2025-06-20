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
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import DeleteModel from "@/components/common/DeleteModel/DeleteModel";
import { openDeleteModal } from "@/store/deleteModalSlice";
import { useDispatch, useSelector } from "react-redux";
import TableComponent from "@/components/common/table/TableComponent";

export default function TaxClasses() {
  const [depotsData, setdepotsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const [taxId, settaxId] = useState(null)
  const dispatch = useDispatch();
  const debouncedSearch = useDebounce(search, 1000); 
  const router = useRouter();
  const { loadingModal } = useSelector(
    (state) => state.delete,
  );
console.log(loadingModal,"loadingModal")
  const toast = useRef();

  const handleDelete = (id) => {
    console.log(id);
    setdepotsData((prevData) => prevData.filter((item) => item._id !== id));
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiServices.get(
        `/tax-classes/list?search=${debouncedSearch}&page=${page}&limit=${rows}}`,
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

  const Columns = {
    name: "Name",
    description: "Description",
    type: "Type",
    defaultStatus: "Default",
    action: "Action",
  };

  const renderColumnsBody = (field, item) => {
    switch (field) {
      case "name":
        return  <Button
        size="small"
        label={item.name}
        link
        onClick={() =>
          router.push(`/system-setup/tax-classes/update/${item._id}`)
        }
      />

      case "type":
        return (
          <>
           <Tag severity={"success"} value={item.type} />
          </>
        );
      case "defaultStatus":
        return (
          <div className="">
            <Tag
              severity={"success"}
              value={item.defaultStatus == true ? "Yes" : "No"}
            />
          </div>
        );


      case "action":
        return (
          <React.Fragment>
            <Link href={`/system-setup/tax-classes/update/${item._id}`}>
            <i className="pi pi-pen-to-square mr-2 text-primary" /></Link>
            {/* <i
            className="pi pi-trash text-red"
            onClick={() => confirmDeleteorder(rowData)}
          /> */}
          </React.Fragment>
        );
      default:
        return item[field];
    }
  };
  return (
    <div className="card">
      <GoPrevious route={"/system-setup/"} />
      <DeleteModel handleDeleteLocallay={()=>handleDelete(taxId)} />
      <Toast ref={toast} />
      <div className=" mb-5 flex justify-between  pb-4">
        <div className="flex items-center justify-start gap-2">
          <label className="text-[20px] font-semibold text-dark-2 dark:text-white">Tax Class</label>
          <Badge
            value={depotsData?.length}
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
            <Link href={"/system-setup/tax-classes/add"}>
              <Button className="" colorScheme={"orange"}>
                Add Account
              </Button>
            </Link>
          </div>
        </div>
      </div>

{/*      
          <DataTable value={depotsData || []}
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
                    router.push(`/system-setup/tax-classes/update/${item._id}`)
                  }
                />
              )}
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="description"
              header="Description"
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="type"
              header="Type"
              style={{ width: "25%" }}
              body={(item) => (
                <>
                  <Tag severity={"success"} value={item.type} />
                </>
              )}
            ></Column>
            <Column
              field="defaultStatus"
              header="Default"
              body={(item) => {
                return (
                  <div className="">
                    <Tag
                      severity={"success"}
                      value={item.defaultStatus == true ? "Yes" : "No"}
                    />
                  </div>
                );
              }}
              style={{ width: "25%" }}
            ></Column>
            <Column
              field="action"
              header="Action"
              style={{ width: "25%" }}
              body={(item) => {
                return (
                  <div className="flex gap-4">
                    
                    <i
                      className="pi pi-trash ml-2 text-red cursor-pointer"
                      //   onClick={() => confirmDeleteProduct(rowData)}
                      onClick={() => {
                        settaxId(item._id)
                        dispatch(
                          openDeleteModal({
                            id: item._id,
                            route: "/tax-classes",
                            redirect: "/system-setup/tax-classes",
                          }),
                        );
                        
                      }}
                    />
                  </div>
                );
              }}
            ></Column>
          </DataTable> */}
          <TableComponent
            loading={loading}
              tableName="Orders"
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
