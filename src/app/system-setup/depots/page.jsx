import DefaultLayout from '@/components/Layouts/DefaultLaout'
import Depots from '@/components/system-setup/depots/Depots'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <Depots/>
        </DefaultLayout>

    </div>
  )
}

export default page