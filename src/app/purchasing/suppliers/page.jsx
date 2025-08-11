import DefaultLayout from '@/components/Layouts/DefaultLaout'
import SuppliersList from '@/components/Suppliers/SuppliersList'
import React from 'react'

const page = () => {
  return (
    <div>
<DefaultLayout>
        <SuppliersList/>

    </DefaultLayout>    </div>
  )
}

export default page