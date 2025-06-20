import DefaultLayout from '@/components/Layouts/DefaultLaout'
import DetailDepots from '@/components/system-setup/depots/DetailDepots'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <DetailDepots/>
        </DefaultLayout>
    </div>
  )
}

export default page