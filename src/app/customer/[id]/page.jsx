import Customer from '@/components/customer/Customer'
import DefaultLayout from '@/components/Layouts/DefaultLaout'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <Customer/>
        </DefaultLayout>
    </div>
  )
}

export default page