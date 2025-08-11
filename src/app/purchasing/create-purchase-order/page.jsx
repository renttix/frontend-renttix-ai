import DefaultLayout from '@/components/Layouts/DefaultLaout'
import NewPurchaseOrderPage from '@/components/purchase-orders/NewPurchaseOrderPage'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <NewPurchaseOrderPage/>
        </DefaultLayout>
    </div>
  )
}

export default page