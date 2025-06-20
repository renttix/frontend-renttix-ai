import SubCategoryList from '@/components/category/SubCategoryList'
import DefaultLayout from '@/components/Layouts/DefaultLaout'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <SubCategoryList/>
        </DefaultLayout>
    </div>
  )
}

export default page