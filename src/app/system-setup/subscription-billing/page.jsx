import DefaultLayout from '@/components/Layouts/DefaultLaout'
import SubscriptionBilling from '@/components/system-setup/subscription-billing/SubscriptionBilling'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <SubscriptionBilling/>
        </DefaultLayout>
    </div>
  )
}

export default page