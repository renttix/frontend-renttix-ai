import DefaultLayout from '@/components/Layouts/DefaultLaout'
import ProductDetail from '@/components/product/ProductDetail'
import React from 'react'

const page = () => {
  return (
    <div>
              <DefaultLayout>
                <ProductDetail/>
              </DefaultLayout>
        
    </div>
  )
}

export default page