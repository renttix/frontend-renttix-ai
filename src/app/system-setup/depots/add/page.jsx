import DefaultLayout from '@/components/Layouts/DefaultLaout'
import AddDepots from '@/components/system-setup/depots/AddDepots'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <AddDepots/>
        </DefaultLayout>
    </div>
  )
}

export default page