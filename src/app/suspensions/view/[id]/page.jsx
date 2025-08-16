import DefaultLayout from '@/components/Layouts/DefaultLaout'
import SuspensionView from '@/components/suspensions/SuspensionView'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
<SuspensionView/>
        </DefaultLayout>
    </div>
  )
}

export default page