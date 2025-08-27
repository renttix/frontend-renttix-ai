import DamageWaiverSetupPage from '@/app/[company]/system-setup/damage-waiver/page'
import DefaultLayout from '@/components/Layouts/DefaultLaout'
import DamageWaiverSetup from '@/components/system-setup/damage-waiver/DamageWaiverSetup'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
          <DamageWaiverSetupPage/>
        </DefaultLayout>
    </div>
  )
}

export default page