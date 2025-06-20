import DefaultLayout from '@/components/Layouts/DefaultLaout'
import AddTaxClass from '@/components/system-setup/tax-classes/AddTaxClass'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <AddTaxClass/>
        </DefaultLayout>
    </div>
  )
}

export default page