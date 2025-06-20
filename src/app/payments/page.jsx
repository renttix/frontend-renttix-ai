import DefaultLayout from '@/components/Layouts/DefaultLaout'
import PaymentsElite from '@/components/payments/PaymentsElite'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <PaymentsElite/>
        </DefaultLayout>
    </div>
  )
}

export default page