import DefaultLayout from '@/components/Layouts/DefaultLaout'
import EditPurchaseOrderPage from '@/components/purchase-orders/EditPurchaseOrderPage'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <EditPurchaseOrderPage/>
        </DefaultLayout>
    </div>
  )
}

export default page