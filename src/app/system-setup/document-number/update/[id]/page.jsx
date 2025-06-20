import DefaultLayout from '@/components/Layouts/DefaultLaout'
import UpdateDocumentNumber from '@/components/system-setup/document-number/UpdateDocumentNumber'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <UpdateDocumentNumber/>
        </DefaultLayout>
    </div>
  )
}

export default page