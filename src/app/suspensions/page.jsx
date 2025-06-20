import DefaultLayout from '@/components/Layouts/DefaultLaout'
import Suspensions from '@/components/suspensions/Suspensions'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
        <Suspensions/>
        </DefaultLayout>
    </div>
  )
}

export default page