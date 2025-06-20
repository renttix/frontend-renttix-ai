
'use client'
import { Button } from 'primereact/button'
import React, { useEffect, useState } from 'react'
import GoPrevious from '../common/GoPrevious/GoPrevious'
import { Avatar } from 'primereact/avatar'
import { Divider } from 'primereact/divider'
import { useParams } from 'next/navigation'
import apiServices from '../../../services/apiService'
import UpdateOrderNote from '../order/UpdateOrderNote'
import { openDeleteModal } from '@/store/deleteModalSlice'
import { useDispatch } from 'react-redux'
import DeleteModel from '../common/DeleteModel/DeleteModel'
import moment from 'moment'
import Loader from '../common/Loader'
import { Fieldset } from 'primereact/fieldset'

const NotesDetail = () => {
    const params = useParams()
    const [data, setdata] = useState({})
    const [loading, setloading] = useState(false)
    const dispatch = useDispatch()
    const [refreshFlag, setRefreshFlag] = useState(false);


    const handleRefresh = () => {
        setRefreshFlag((prevFlag) => !prevFlag);
      };
    const fetchDataNotes = async () => {
        setloading(true)
        try {
          const response = await apiServices.get(`/order/order-note/${params.id}`);
    
          if (response.data.success) {
            setdata(response?.data?.data);
    
            setloading(false)
          }
        } catch (err) {
          setloading(false)
        } finally {
          setloading(false)
        }
      };
      useEffect(()=>{
        fetchDataNotes()
      },[refreshFlag])


if(loading){
    return <>
    <div className="flex justify-center items-center w-full h-screen">

        <Loader/>
    </div>
    </>
}

  return (
    <div>
          <GoPrevious route={"/customer/listing"} />
          <DeleteModel   handleDeleteLocallay={() =>console.log('') } />

      <div className="col-span-12 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-12 md:w-[100%] lg:col-span-10 lg:w-[100%]  xl:col-span-10 xl:w-[70%] 2xl:w-[70%]">
        {/* <h2 className="text-xl font-bold text-dark-2 dark:text-white md:text-2xl">
          dfsdfsdfd
        </h2> */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Personal Details */}
          <div className="flex items-center justify-center">
            <Avatar
            //   label={data?.name?.slice(0, 3)}
              label={data?.orderId?.orderId}
              className="mr-2 h-[10rem] w-[10rem] bg-primary dark:bg-transparent  rounded-[10px] border border-strokep-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card text-4xl font-bold text-white md:h-[10rem] "
            />
          </div>
          <div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dark-2 dark:text-white capitalize">
              {data.name}
              </h3>

              {/* <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Title:
                </span>
                <span className="text-dark-2 dark:text-white font-semibold capitalize">{data.name}</span>
              </div> */}
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                  Author:
                </span>
                <span className="text-dark-2 dark:text-white">
                 {data?.auther?.legalName||""} / <span className=' capitalize'> {data?.auther?.role||""}</span>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                Created Date:
                </span>
                <span className="text-dark-2 dark:text-white">
                {moment(data?.createdAt).format('llll') }
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-dark-2 dark:text-white">
                Updated Date:
                </span>
                <span className="text-dark-2 dark:text-white">
                {moment(data?.updatedAt).format('llll') }
                </span>
              </div>
         
            </div>
          </div>
          {/* Payment Details */}
          <div>
            <h3 className="text-lg font-semibold text-dark-2 dark:text-white">
              Actions
            </h3>
            <div className="mt-4 space-y-5">
              <div className="flex items-end gap-2">
                {/* <span className="font-medium text-dark-2 dark:text-white">Edit:</span> */}
                <UpdateOrderNote handleRefresh={handleRefresh} rowData={data} />
                
              </div>
              {/* <DeleteModel /> */}
              <div className="flex items-start gap-6">
                {/* <span className="font-medium text-dark-2 dark:text-white">Total Delete:</span> */}

                <i
                  className="pi pi-trash text-red cursor-pointer"
              
                onClick={() => {
                                      dispatch(
                                        openDeleteModal({
                                          id: data._id,
                                          route: "/customer/order-note",
                                          redirect: `/customer/listing`,
                                        }),
                                      );
                                    }}
            
                  aria-label="Cancel"
                />
              </div>
            </div>
          </div>
    
        </div>
   
              <Fieldset legend="Description" className='mt-4'>
    <label className="m-0">
        {data.description}
    </label>
</Fieldset>
        
      </div>
    </div>
  )
}

export default NotesDetail