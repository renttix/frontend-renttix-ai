import Calculator from '@/components/Calculator/Calculator'
import DefaultLayout from '@/components/Layouts/DefaultLaout'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <Calculator/>
        </DefaultLayout>
    </div>
  )
}

export default page