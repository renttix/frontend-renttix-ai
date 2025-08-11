import DefaultLayout from '@/components/Layouts/DefaultLaout'
import EditSupplierPage from '@/components/Suppliers/EditSupplierPage'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <EditSupplierPage/>
        </DefaultLayout>
    </div>
  )
}

export default page