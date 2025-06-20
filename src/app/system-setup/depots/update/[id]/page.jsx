import DefaultLayout from '@/components/Layouts/DefaultLaout'
import UpdateDepots from '@/components/system-setup/depots/UpdateDepots'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <UpdateDepots/>
        </DefaultLayout>
    </div>
  )
}

export default page