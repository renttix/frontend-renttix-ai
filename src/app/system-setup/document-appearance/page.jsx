import DefaultLayout from '@/components/Layouts/DefaultLaout'
import DocumentAppearance from '@/components/system-setup/document-appearance'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <DocumentAppearance/>
        </DefaultLayout>
    </div>
  )
}

export default page