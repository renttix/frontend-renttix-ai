import DefaultLayout from '@/components/Layouts/DefaultLaout'
import ReportsDashboard from '@/components/reports/ReportsDashboard'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <ReportsDashboard/>
        </DefaultLayout>
    </div>
  )
}

export default page