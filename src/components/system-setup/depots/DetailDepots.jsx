"use client";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import React, { useEffect, useState } from "react";
import apiServices from "../../../../services/apiService";
import { useParams, useRouter } from "next/navigation";
import { BaseURL } from "../../../../utils/baseUrl";
import Loader from "@/components/common/Loader";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import { Dialog } from "primereact/dialog";
import { openDeleteModal } from "@/store/deleteModalSlice";
import { useDispatch, useSelector } from "react-redux";
import DeleteModel from "@/components/common/DeleteModel/DeleteModel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import DepotsProduct from "./DepotsProduct";
import { Divider } from "primereact/divider";

const DetailDepots = () => {
  const [data, setdata] = useState({});
  const [loading, setloading] = useState(true);
  const { user } = useSelector((state) => state?.authReducer);
  const [product, setproduct] = useState([]);

  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    const fetchDepotDetails = async () => {
      setloading(true);
      try {
        const response = await apiServices.get(
          `${BaseURL}/depots/detail/${id}`,
        );
        setloading(false);
        setproduct(response.data.product);
        setdata(response.data.data);
      } catch (error) {
        setloading(false);

        console.log(error);
      }
    };
    fetchDepotDetails();
  }, [id]);

  if (loading) {
    return (
      <section className="flex h-screen items-center justify-center">
        <Loader />
      </section>
    );
  }
  return (
    <div>
      <GoPrevious route={"/system-setup/depots"} />
      <div className="col-span-12 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-12 md:w-[100%] lg:col-span-10 lg:w-[100%]  xl:col-span-10 xl:w-[70%] 2xl:w-[70%]">
        <h2 className="text-xl font-bold text-dark-2 dark:text-white md:text-2xl">
          {data.name}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Personal Details */}
          <div className="flex items-center justify-center">
            <Avatar
              label={data?.name?.slice(0, 3)}
              className="mr-2 h-[10rem] w-[10rem] bg-primary text-4xl font-bold text-white md:h-[10rem] "
            />
          </div>
          <div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dark-2 dark:text-white">
                Details
              </h3>

              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Code:
                </span>
                <span className="text-dark-2 dark:text-white">{data.code}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Company:
                </span>
                <span className="text-dark-2 dark:text-white">
                  {user.legalName}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Email:
                </span>
                <span className="text-dark-2 dark:text-white">
                  {data.email}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Address:
                </span>
                <span className="text-dark-2 dark:text-white">{`${data.address2} ${data.city} ${data.country}`}</span>
              </div>
            </div>
          </div>
          {/* Payment Details */}
          <div>
            <h3 className="text-lg font-semibold text-dark-2 dark:text-white">
              Actions
            </h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-end gap-2">
                {/* <span className="font-medium text-dark-2 dark:text-white">Edit:</span> */}
                <Button
                  icon="pi pi-pen-to-square"
                  rounded
                  outlined
                  onClick={() =>
                    router.push(`/system-setup/depots/update/${id}`)
                  }
                  severity="help"
                  aria-label="Favorite"
                />
              </div>
              <DeleteModel />
              <div className="flex items-start gap-2">
                {/* <span className="font-medium text-dark-2 dark:text-white">Total Delete:</span> */}
                <Button
                  icon="pi pi-times"
                  rounded
                  onClick={() => {
                    dispatch(
                      openDeleteModal({
                        id: id,
                        route: "/depots",
                        redirect: "/system-setup/depots",
                      }),
                    );
                  }}
                  outlined
                  severity="danger"
                  aria-label="Cancel"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Divider/>

      <label htmlFor="" className="my-3 font-bold text-xl text-dark-2 dark:text-white">Depots Products</label>
      <DepotsProduct depotData={product} />
    </div>
  );
};

export default DetailDepots;
