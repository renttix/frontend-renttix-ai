import DefaultLayout from '@/components/Layouts/DefaultLaout'
import PurchaseOrdersList from '@/components/purchase-orders/PurchaseOrdersList'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <PurchaseOrdersList/>
        </DefaultLayout>
    </div>
  )
}

export default page