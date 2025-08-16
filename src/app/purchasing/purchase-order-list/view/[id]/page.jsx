import DefaultLayout from '@/components/Layouts/DefaultLaout'
import PurchaseOrderView from '@/components/purchase-orders/PurchaseOrderView'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <PurchaseOrderView/>
        </DefaultLayout>
    </div>
  )
}

export default page