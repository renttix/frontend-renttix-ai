import DispatchCalendar from '@/components/dispatchCalendar/DispatchCalendar'
import DefaultLayout from '@/components/Layouts/DefaultLaout'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <DispatchCalendar/>
        </DefaultLayout>
    </div>
  )
}

export default page