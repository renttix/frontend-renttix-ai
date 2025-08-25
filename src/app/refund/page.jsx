import RefundingInvoices from '@/components/invoicing/RefundingInvoices'
import DefaultLayout from '@/components/Layouts/DefaultLaout'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
        <RefundingInvoices/>
        </DefaultLayout>
    </div>
  )
}

export default page