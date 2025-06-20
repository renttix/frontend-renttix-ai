import DefaultLayout from '@/components/Layouts/DefaultLaout'
import DocumentNumberListing from '@/components/system-setup/document-number/DocumentNumberListing'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <DocumentNumberListing/>
        </DefaultLayout>
    </div>
  )
}

export default page