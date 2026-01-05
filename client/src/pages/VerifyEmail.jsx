import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verify = async () => {
      try {
        const response = await axios.put(`/api/auth/verifyemail/${token}`);
        setStatus('success');
        setMessage('Email verified successfully!');
        
        // If token returned, login user
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
        }
        
        // Redirect after 3 seconds
        setTimeout(() => {
            navigate('/');
        }, 3000);

      } catch (error) {
        console.error('Verification failed', error);
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed. Link may be invalid or expired.');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            
          {status === 'verifying' && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <h2 className="text-xl font-medium text-gray-900">Verifying Email...</h2>
              <p className="mt-2 text-gray-500">Please wait while we confirm your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-medium text-gray-900">Verified!</h2>
              <p className="mt-2 text-gray-500">{message}</p>
              <p className="mt-4 text-sm text-gray-400">Redirecting to dashboard...</p>
              <Link to="/" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Go to Dashboard
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-medium text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-red-600">{message}</p>
              <Link to="/login" className="mt-6 text-blue-600 hover:text-blue-500 font-medium">
                Return to Login
              </Link>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
