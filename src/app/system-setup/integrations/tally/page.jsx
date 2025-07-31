import TallyIntegrationPage from '@/app/[company]/system-setup/integrations/tally/page'
import DefaultLayout from '@/components/Layouts/DefaultLaout'
import TallyIntegration from '@/components/system-setup/integrations/integration-account/TallyIntegration'
import React from 'react'

const page = () => {
  return (
    <div>
        
        <DefaultLayout>
            <TallyIntegrationPage/>
        </DefaultLayout>
    </div>
  )
}

export default page