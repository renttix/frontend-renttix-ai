import DefaultLayout from '@/components/Layouts/DefaultLaout'
import AddSupplierPage from '@/components/Suppliers/AddSupplierPage'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <AddSupplierPage/>
        </DefaultLayout>
    </div>
  )
}

export default page