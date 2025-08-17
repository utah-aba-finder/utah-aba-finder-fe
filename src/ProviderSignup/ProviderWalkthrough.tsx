import React, { useState } from 'react';
import { 
  Building2, 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  FileText, 
  MapPin,
  Star,
  ArrowRight,
  ArrowLeft,
  Mail
} from 'lucide-react';

interface WalkthroughStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  tips?: string[];
  estimatedTime?: string;
}

const ProviderWalkthrough: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const walkthroughSteps: WalkthroughStep[] = [
    {
      id: 1,
      title: "Initial Registration",
      description: "Complete the provider registration form",
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      details: [
        "Fill out basic provider information (name, email, contact details)",
        "Select your provider category from available options",
        "Upload your provider logo (optional but recommended)",
        "Provide website and contact information",
        "Submit the initial registration form"
      ],
      tips: [
        "Have your business information ready before starting",
        "Use a professional email address",
        "Ensure your logo meets size requirements (PNG, JPG, GIF up to 5MB)"
      ],
      estimatedTime: "10-15 minutes"
    },
    {
      id: 2,
      title: "Service Details & Coverage",
      description: "Define your services and coverage area",
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      details: [
        "Specify service delivery methods (in-home, in-clinic, telehealth)",
        "Define age range you serve (minimum and maximum ages)",
        "Set cost information and payment options",
        "Indicate waitlist status and availability",
        "List service specialties and accommodations (Spanish speakers, etc.)",
        "Define your coverage area and locations"
      ],
      tips: [
        "Be specific about your service areas to help families find you",
        "Include all service delivery methods you offer",
        "Be transparent about costs and waitlist status"
      ],
      estimatedTime: "15-20 minutes"
    },
    {
      id: 3,
      title: "Review & Submission",
      description: "Review your information and submit",
      icon: <ClipboardCheck className="h-8 w-8 text-purple-600" />,
      details: [
        "Review all entered information for accuracy",
        "Check that all required fields are completed",
        "Verify contact information and service details",
        "Submit the completed registration",
        "Receive confirmation of submission"
      ],
      tips: [
        "Double-check all information before submitting",
        "Save a copy of your submission for your records",
        "Note your registration ID for future reference"
      ],
      estimatedTime: "5-10 minutes"
    },
    {
      id: 4,
      title: "Admin Review",
      description: "Our team reviews your registration",
      icon: <Clock className="h-8 w-8 text-yellow-600" />,
      details: [
        "Our team reviews your registration (typically 2-3 business days)",
        "We verify business information and credentials",
        "We may contact you for additional information if needed",
        "Your registration status is updated accordingly"
      ],
      tips: [
        "Respond promptly to any requests for additional information",
        "Ensure all business information is current and accurate",
        "Be patient during the review process"
      ],
      estimatedTime: "2-3 business days"
    },
    {
      id: 5,
      title: "Approval & Profile Setup",
      description: "Complete your provider profile setup",
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      details: [
        "Receive approval notification via email",
        "Set up your provider account credentials",
        "Complete your full provider profile",
        "Add detailed service information and photos",
        "Configure notification preferences"
      ],
      tips: [
        "Complete your profile as soon as possible after approval",
        "Add high-quality photos of your facility/team",
        "Keep your information current and accurate"
      ],
      estimatedTime: "20-30 minutes"
    },
    {
      id: 6,
      title: "Go Live & Start Receiving Referrals",
      description: "Your profile is visible to families seeking services",
      icon: <Star className="h-8 w-8 text-orange-600" />,
      details: [
        "Your profile becomes visible to families searching for providers",
        "Families can view your services and contact information",
        "You can update your profile and availability as needed",
        "Build your reputation through the platform"
      ],
      tips: [
        "Keep your profile and availability updated",
        "Ensure your contact information is current",
        "Respond promptly to any inquiries from families"
      ],
      estimatedTime: "Ongoing"
    }
  ];

  const nextStep = () => {
    if (currentStep < walkthroughSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleStepExpansion = (stepId: number) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Building2 className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Provider Onboarding Walkthrough
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about joining our platform as a service provider. 
            Follow this step-by-step guide to get started and make your services discoverable to families.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Journey to Becoming a Provider</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {walkthroughSteps.map((step, index) => (
              <div key={step.id} className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
                <div className="text-xs text-gray-600">
                  {step.title.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {walkthroughSteps[currentStep - 1].icon}
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-white">
                    Step {currentStep}: {walkthroughSteps[currentStep - 1].title}
                  </h2>
                  <p className="text-blue-100 mt-1">
                    {walkthroughSteps[currentStep - 1].description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-100 text-sm">Estimated Time</div>
                <div className="text-white font-semibold">
                  {walkthroughSteps[currentStep - 1].estimatedTime}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Do:</h3>
              <ul className="space-y-2">
                {walkthroughSteps[currentStep - 1].details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {walkthroughSteps[currentStep - 1].tips && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pro Tips:</h3>
                <ul className="space-y-2">
                  {walkthroughSteps[currentStep - 1].tips?.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <Star className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              
              <div className="text-sm text-gray-500">
                Step {currentStep} of {walkthroughSteps.length}
              </div>
              
              <button
                onClick={nextStep}
                disabled={currentStep === walkthroughSteps.length}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* All Steps Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Complete Process Overview</h2>
          <div className="space-y-4">
            {walkthroughSteps.map((step) => (
              <div key={step.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleStepExpansion(step.id)}
                  className="w-full px-4 py-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.id}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-3">{step.estimatedTime}</span>
                      <ArrowRight className={`h-4 w-4 text-gray-400 transition-transform ${
                        expandedStep === step.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                </button>
                
                {expandedStep === step.id && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">What You'll Do:</h4>
                      <ul className="space-y-1 mb-3">
                        {step.details.map((detail, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                      
                      {step.tips && (
                        <>
                          <h4 className="font-medium text-gray-900 mb-2">Pro Tips:</h4>
                          <ul className="space-y-1">
                            {step.tips.map((tip, index) => (
                              <li key={index} className="flex items-start text-sm text-gray-700">
                                <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-center mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join our platform and make your services discoverable to families seeking support. 
            The registration process is simple and our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/provider-signup"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Start Registration Now
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Us for Help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderWalkthrough; 