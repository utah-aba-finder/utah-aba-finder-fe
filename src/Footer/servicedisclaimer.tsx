import React from 'react'

const ServiceDisclaimer = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-1/2 h-full flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Service Disclaimer</h1>
            <p>This is a disclaimer for the services displayed by Autism Services Locator. We are not a provider ourselves, and we do not provide any services. We are simply a platform for families to find providers for free and without judgement. We also understand people's opinions may vary about certain therapies, and we are not here to change that. Nor are we here to promote any specific therapy.</p>
            <p>We <strong>DO NOT condone any abuse towards children or adults with autism.</strong> <br/>
            If a provider is found to be abusive, we will remove their information from our site.</p>
            <p>We also <strong>DO NOT condone harrassment from either providers, families, or individuals.</strong> <br/>
            We will take the appropriate actions to ensure the safety of our users.</p>
        </div>
    </div>
  )
}

export default ServiceDisclaimer;