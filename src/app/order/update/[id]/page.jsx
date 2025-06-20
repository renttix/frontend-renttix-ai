import DefaultLayout from '@/components/Layouts/DefaultLaout'
import UpdateOrder from '@/components/order/UpdateOrder'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <UpdateOrder/>
        </DefaultLayout>
    </div>
  )
}

export default page