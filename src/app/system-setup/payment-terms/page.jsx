import DefaultLayout from '@/components/Layouts/DefaultLaout'
import PaymentTermsElite from '@/components/system-setup/payment-terms/PaymentTermsElite'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <PaymentTermsElite/>
        </DefaultLayout>
    </div>
  )
}

export default page