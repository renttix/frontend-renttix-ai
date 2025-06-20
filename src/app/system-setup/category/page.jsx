import CategoryList from '@/components/category/CategoryList'
import DefaultLayout from '@/components/Layouts/DefaultLaout'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <CategoryList/>
        </DefaultLayout>
    </div>
  )
}

export default page