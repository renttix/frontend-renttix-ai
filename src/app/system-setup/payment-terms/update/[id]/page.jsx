import DefaultLayout from '@/components/Layouts/DefaultLaout'
import UpdatePaymentTerms from '@/components/system-setup/payment-terms/UpdatePaymentTerms'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <UpdatePaymentTerms/>
        </DefaultLayout>
    </div>
  )
}

export default page