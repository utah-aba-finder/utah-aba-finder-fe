import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, ArrowLeft } from 'lucide-react';
import { testPasswordReset, testAvailableEndpoints } from '../Utility/ApiCall';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('📧 Please enter your email address', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: '#F59E0B',
          color: 'white',
          fontSize: '16px',
          fontWeight: '500'
        }
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('📧 Please enter a valid email address', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: '#F59E0B',
          color: 'white',
          fontSize: '16px',
          fontWeight: '500'
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      // Trim whitespace from email
      const trimmedEmail = email.trim();
      
      // First, test the password reset functionality
      const testResult = await testPasswordReset(trimmedEmail);
      
      if (!testResult.success) {
        
        // Check if it's a 404 error (endpoint not found)
        if (testResult.status === 404) {
          toast.error('Password reset functionality is not available. Please contact support for assistance.', {
            position: "top-center",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: {
              background: '#EF4444',
              color: 'white',
              fontSize: '16px',
              fontWeight: '500'
            }
          });
          
          // Show additional help information
          setTimeout(() => {
            toast.info('For immediate assistance, please contact the administrator or use the Contact Us page.', {
              position: "top-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              style: {
                background: '#3B82F6',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500'
              }
            });
          }, 2000);
        } else {
          // Show generic error message
          toast.error(`Password reset failed: ${testResult.error}`, {
            position: "top-center",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: {
              background: '#EF4444',
              color: 'white',
              fontSize: '16px',
              fontWeight: '500'
            }
          });
        }
        return;
      }

      // Use the password reset endpoint
      const endpoint = 'https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/password_resets';

      // If test passes, proceed with the actual request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: trimmedEmail
        })
      });

      let responseData;
      try {
        const responseText = await response.text();
        
        if (responseText) {
          responseData = JSON.parse(responseText);
        } else {
          responseData = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 422) {
          throw new Error(responseData.message || 'Invalid request. Please check your email address.');
        } else if (response.status === 404) {
          throw new Error('Password reset service not found. Please contact support.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later or contact support.');
        } else {
          throw new Error(responseData.message || responseData.error || `Failed to send password reset email (${response.status})`);
        }
      }

      // According to API docs, both success cases return 200 status
      // Success case 1: "Password reset instructions sent to your email"
      // Success case 2: "If the email exists, password reset instructions have been sent"
      if (response.ok && (responseData.message || responseData.error?.includes("If the email exists"))) {
        // Success case - password reset instructions sent
        setIsSubmitted(true);
        toast.success('✅ Password reset email sent!', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500'
          }
        });
        return; // Exit early since we've handled success
      }

      // If we reach here, something unexpected happened
      console.warn('Unexpected response:', responseData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset request error:', error);
      toast.error(error instanceof Error ? error.message : '❌ Failed to send password reset email. Please try again.', {
        position: "top-center",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '16px',
          fontWeight: '500'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Check Your Email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-4 text-center text-sm text-gray-500">
              Please check your inbox and spam folder for an email from <strong>utahabalocator@gmail.com</strong>
            </p>
            <p className="mt-2 text-center text-sm text-gray-500">
              Click the link in the email to reset your password. The link will expire in 6 hours.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </button>
            
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Another Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center text-blue-600 hover:text-blue-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </button>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </button>
            </p>
            
            <p className="mt-4 text-sm text-gray-500">
              Need help?{' '}
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Contact Support
              </button>
            </p>
            
            {/* Debug buttons - remove in production */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={async () => {
                  console.log('=== DEBUG: Testing password reset ===');
                  const testResult = await testPasswordReset(email);
                  console.log('Debug test result:', testResult);
                  alert(`Debug result: ${JSON.stringify(testResult, null, 2)}`);
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Debug: Test Password Reset
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  console.log('=== DEBUG: Testing available endpoints ===');
                  const testResult = await testAvailableEndpoints();
                  console.log('Available endpoints:', testResult);
                  alert(`Available endpoints: ${JSON.stringify(testResult, null, 2)}`);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 ml-4"
              >
                Debug: Test Available Endpoints
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 