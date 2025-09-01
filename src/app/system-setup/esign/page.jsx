import DefaultLayout from '@/components/Layouts/DefaultLaout'
import EsignSettings from '@/components/system-setup/esign/EsignSettings'
import React from 'react'

const page = () => {
  return (
    <div>
    <DefaultLayout>
        <EsignSettings/>
    </DefaultLayout>
    </div>
  )
}

export default page