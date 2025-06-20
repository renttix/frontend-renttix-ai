import DefaultLayout from '@/components/Layouts/DefaultLaout'
import AddPaymentTerms from '@/components/system-setup/payment-terms/AddPaymentTerms'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <AddPaymentTerms/>
        </DefaultLayout>
    </div>
  )
}

export default page