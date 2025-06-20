import NotesDetail from '@/components/customer/NotesDetail'
import DefaultLayout from '@/components/Layouts/DefaultLaout'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
        <NotesDetail/>
        </DefaultLayout>
    </div>
  )
}

export default page