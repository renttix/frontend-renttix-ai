import DefaultLayout from '@/components/Layouts/DefaultLaout'
import SuspensionsList from '@/components/suspensions/SuspensionsList'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <SuspensionsList/>
        </DefaultLayout>
    </div>
  )
}

export default page