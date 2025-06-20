import DefaultLayout from '@/components/Layouts/DefaultLaout'
import CompanyDetailsForm from '@/components/system-setup/company-details/CompanyDetailsForm'
import SchedulingPreferences from '@/components/system-setup/company-details/SchedulingPreferences'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <CompanyDetailsForm/>
            <SchedulingPreferences/>
        </DefaultLayout>
    </div>
  )
}

export default page