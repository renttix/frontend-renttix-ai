import DefaultLayout from '@/components/Layouts/DefaultLaout'
import Stripe from '@/components/system-setup/subscription-billing/Stripe'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <Stripe/>
        </DefaultLayout>
    </div>
  )
}

export default page