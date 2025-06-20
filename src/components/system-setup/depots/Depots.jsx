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
import apiServices from "../../../../services/apiService";
import { useRouter } from "next/navigation";
import ImportDataModal from "../import-data/ImportDataModal";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import DeleteModel from "@/components/common/DeleteModel/DeleteModel";
import { openDeleteModal } from "@/store/deleteModalSlice";
import { useDispatch } from "react-redux";
import TableComponent from "@/components/common/table/TableComponent";
import ExportData from "@/components/common/imports/ExportData";
import { setDefaultColumns } from "@/store/columnVisibilitySlice";

export default function Depots() {
  const [depotsData, setdepotsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const [depotId, setdepotId] = useState(null);
  const debouncedSearch = useDebounce(search, 1000); // Add debounce with a 500ms delay
  const router = useRouter();

  const dispatch = useDispatch();
  const toast = useRef();
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiServices.get(
        `/depots/list?search=${debouncedSearch}&page=${page}&limit=${rows}}`,
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
    code: "Code",
    telephone: "Telephone",
    country: "Country",
    action: "Action",
  };

  useEffect(() => {
    dispatch(setDefaultColumns({ tableName: "", columns: Object.keys(Columns) }));
  }, [dispatch]);

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
      case "telephone":
        return <Tag value={item.telephone} />;
      case "country":
        return <Tag severity={"success"} value={item.country} />;
      case "action":
        return (
          <div className="flex gap-4">
            <Link
              style={{ color: "#337ab7" }}
              href={`/system-setup/depots/update/${item?._id}`}
            >
              <div className="">
                <FaEdit className="text-orangecolor cursor-pointer" />
              </div>
            </Link>
            <i
              className="pi pi-trash ml-2 cursor-pointer text-red"
              onClick={() => {
                setdepotId(item._id);
                dispatch(
                  openDeleteModal({
                    id: item._id,
                    route: "/depots",
                    redirect: "/system-setup/depots",
                  }),
                );
              }}
            />
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
      <ImportDataModal ListData={[{ name: "Depots" }]} />
      
     <ExportData route='/depots/export' nameFile='depots'/>
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
            <Link href={"/system-setup/depots/add"}>
              <Button className="" colorScheme={"orange"}>
                Add Depot
              </Button>
            </Link>
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
