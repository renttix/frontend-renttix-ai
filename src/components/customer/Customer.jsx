"use client";
import React, { useEffect, useState } from "react";
import apiServices from "../../../services/apiService";
import { useParams } from "next/navigation";
import Loader from "../common/Loader";
import TableOrders from "./TableOrders";
import InvoiceCustomers from "./InvoiceCustomers";
import { TabView, TabPanel } from 'primereact/tabview';
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { Fieldset } from "primereact/fieldset";
import { Paginator } from "primereact/paginator";
import TableComponent from "../common/table/TableComponent";
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";
import moment from "moment";
import Link from "next/link";
import { openDeleteModal } from "@/store/deleteModalSlice";
import DeleteModel from "../common/DeleteModel/DeleteModel";
import { useDispatch, useSelector } from "react-redux";
import UpdateOrderNote from "../order/UpdateOrderNote";
import ChargeCustomerForm from "../system-setup/subscription-billing/ChargeCustomerForm";
import { formatCurrency } from "../../../utils/helper";
import PaymentHistory from "../system-setup/subscription-billing/PaymentHistory";
import DisconnectCard from "../system-setup/subscription-billing/DisconnectCard";
import AddCardButton from "../system-setup/subscription-billing/AddCardButton";


const Customer = () => {
  const [data, setdata] = useState({});
  const [loading, setloading] = useState(false);
  const [orderNoteLoading, setorderNoteLoading] = useState(false)
  const [orderNotes, setorderNotes] = useState([])
  const [totalRecords, setTotalRecords] = useState(0);
  const [orderNoteId, setorderNoteId] = useState(null)
  const [refreshFlag, setRefreshFlag] = useState(false);
  const { user } = useSelector((state) => state?.authReducer);


  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);

  const params = useParams();
  const dispatch = useDispatch()
  const [invoice, setinvoice] = useState([]);
  const Columns = {
  
    'orderId.orderId': "OrderNo",
    name: "Title",
    description: "Description",
    "author.legalName":"Author",
    createdAt:"Issue Date",
    action: "Action",
  };

  const handleDelete = (id) => {
    console.log(id);
    setorderNotes((prevData) => prevData.filter((item) => item._id !== id));
  };

  const handleRefresh = () => {
    setRefreshFlag((prevFlag) => !prevFlag);
  };
  const fetchData = async () => {
    setloading(true);
    try {
      const response = await apiServices.get(`/customer/customer/${params.id}`);

      if (response.data.success) {
        setdata(response?.data?.data?.customer);
        setinvoice(response?.data?.data?.invoice);

        setloading(false);
      }
    } catch (err) {
      setloading(false);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchDataNotes = async () => {
    setorderNoteLoading(true)
    try {
      const response = await apiServices.get(`/order/customer-order-notes/?customerId=${params.id}`);

      if (response.data.success) {
        setorderNotes(response?.data?.data);
        setTotalRecords(response.data.pagination.total);

        setorderNoteLoading(false)
      }
    } catch (err) {
      setorderNoteLoading(false)
    } finally {
      setorderNoteLoading(false)
    }
  };

  // const onSearch = (e) => {
  //   setSearch(e.target.value);
  //   setPage(1);
  // };

  const onPageChange = (event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  };

  const renderColumnsBody = (field, item) => {
    switch (field) {
      case "orderId.orderId":
        return (
          <Link
            className="text-[#0068d6]"
            href={`/order/${item.orderId._id}`}
          >{`${item.orderId.orderId.slice(4)}`}</Link>
        );
        case "name":
          return (
            <Link
            className="text-[#0068d6] capitalize"
            href={`/customer/notes/${item._id}`}
          >
       {item.name}
                     
                     </Link> 
          );
      case "createdAt":
        return (
          <div className=" min-w-70">
           <label className="w-[400px]" htmlFor="">{moment(item?.createdAt).format('llll') }</label>
          </div>
        );
        case "author.legalName":
          return (
            <div className="  ">
               <label className="w-[150px] block" htmlFor="">{item?.author?.legalName}</label>
               <label className=" block capitalize text-sm" htmlFor="">{item?.author?.role}</label>
            </div>
          );
      
    
  
      

      case "action":
        return (
               <React.Fragment>
         <div className="flex">
         <Link
            className="text-[#0068d6]"
            href={`/customer/notes/${item._id}`}
          >
          <i className="pi pi-eye text-primary mr-4"/>
                     
                     </Link> 
                      <UpdateOrderNote handleRefresh={handleRefresh} rowData={item} />
                            <i
                                    className="pi pi-trash ml-2 cursor-pointer text-red"
                                    onClick={() => {
                                      setorderNoteId(item._id);
                                      dispatch(
                                        openDeleteModal({
                                          id: item._id,
                                          route: "/customer/order-note",
                                          redirect: `/customer/${params.id}`,
                                        }),
                                      );
                                    }}
                                  />
         </div>
                    </React.Fragment>
        );
      default:
        return item[field];
    }
  };

  useEffect(() => {
    fetchDataNotes();
  }, [refreshFlag]);

  if (loading) {
    return (
      <section className="flex h-screen items-center justify-center">
        <Loader />
      </section>
    );
  }
  const data1 = Array.isArray(data?.delivernotes) ? data?.delivernotes : [];
  const data2 = Array.isArray(data?.returnnotes) ? data?.returnnotes : [];

  const mergedData = [...data1, ...data2];

  const sortedData = mergedData
    ?.filter((item) => item?.returnNote?.startsWith("DN"))
    ?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));


  return (
    <div className="space-y-8">
         <div className="flex gap-3">
    <GoPrevious route={'/customer/listing'}/>
    <DeleteModel handleDeleteLocallay={() => handleDelete(orderNoteId)} />
       <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white ">
       Customer Details
      </h2>
    </div>
    {/* Customer Details Card */}
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <h2 className="text-xl font-bold text-dark-2 dark:text-white md:text-2xl">
        {data?.name}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Personal Details */}
        <div>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <span className="font-medium text-dark-2 dark:text-white">Number:</span>
              <span className="text-dark-2 dark:text-white">{data.number}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-dark-2 dark:text-white">Email:</span>
              <span className="text-dark-2 dark:text-white">{data.email}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-dark-2 dark:text-white">Address:</span>
              <span className="text-dark-2 dark:text-white">
                {`${data.addressLine1 ?? ""}, ${data.addressLine2 ?? ""}, ${data.city}, ${data.postCode}, ${data.country}`}
              </span>
            </div>
          </div>
        </div>
        {/* Payment Details */}
        <div>
          <h3 className="text-lg font-semibold text-dark-2 dark:text-white">Payments</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-2">
              <span className="font-medium text-dark-2 dark:text-white">Total QuickBook Balance:</span>
              <span className="text-dark-2 dark:text-white">  {formatCurrency(sortedData.filter((item) => item.totalPrice).reduce((acc, note) => acc + note.totalPrice, 0),user?.currencyKey)}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-dark-2 dark:text-white">Total Balance:</span>
              <span className="text-dark-2 dark:text-white">
              {formatCurrency(data?.totalPrice,user?.currencyKey)}
              </span>
            </div>     
            {/* <div className="flex items-start gap-2">
            <ChargeCustomerForm/>
            <DisconnectCard customerId={data?._id}/>
            <AddCardButton customerId={data?._id} />
           
            </div>   */}
            
          </div>
          
        </div>
      </div>
    </div>
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <TabView >
                <TabPanel header="Orders">
                <div >
      {/* Add content for orders here */}
      <TableOrders
            thData={[
              "Name",
              "",
              "",
              "Status",
              "Delivery Date",

              "Depot",
              // "Action",
            ]}
            trData={data?.orders}
          />
    </div>
                </TabPanel>
                <TabPanel header="Invoices">
                <div >

                <InvoiceCustomers
            name={data?.name}
            thData={[
              "Name",
              "Status",
              "Type",
              "Invoice Date",
              "Goods",
              "Tax",
              'Suspension',
              "Total (Inc. TAX)",
              "Action",
            ]}
            trData={invoice}
          />
    </div>
                </TabPanel>
                <TabPanel header="Notes">
                  {/* {orderNotes?.map((item)=>(
                    <>
                    <Fieldset className="mb-2" legend={item?.name}>
    <p className="m-0">
{item?.description}
    </p>
</Fieldset>
                    </>
                  ))} */}

<TableComponent
            loading={orderNoteLoading}
            tableName="Notes"
            columns={Columns}
            data={orderNotes}
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

                  </TabPanel>
                  <TabPanel header="Transaction">
                    <PaymentHistory data={data}/>
                  </TabPanel>
            </TabView>
        </div>
    {/* Orders Section */}

  
    {/* Invoices Section */}

  </div>
  
  );
};

export default Customer;
