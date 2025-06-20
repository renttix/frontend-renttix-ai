import DefaultLayout from '@/components/Layouts/DefaultLaout'
import ImportData from '@/components/system-setup/import-data/ImportData'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <ImportData/>
        </DefaultLayout>
    </div>
  )
}

export default page