import ZohoIntegrationPage from '@/app/[company]/system-setup/integrations/zoho/page'
import DefaultLayout from '@/components/Layouts/DefaultLaout'
import ZohoIntegration from '@/components/system-setup/integrations/integration-account/ZohoIntegration'
import React from 'react'

const page = () => {
  return (
    <div>
        <DefaultLayout>
            <ZohoIntegrationPage/>
        </DefaultLayout>
    </div>
  )
}

export default page