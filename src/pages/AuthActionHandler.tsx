import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

/**
 * This page handles Firebase authentication actions (password reset, email verification, etc.)
 * It acts as a bridge between Firebase's hosted UI and our app
 */
export const AuthActionHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    const apiKey = searchParams.get('apiKey');

    // Handle different action modes
    switch (mode) {
      case 'resetPassword':
        // Redirect to our reset password page with the code
        if (oobCode) {
          navigate(`/reset-password?oobCode=${oobCode}${apiKey ? `&apiKey=${apiKey}` : ''}`);
        } else {
          navigate('/forgot-password?error=invalid-code');
        }
        break;

      case 'recoverEmail':
        // Handle email recovery
        navigate('/login?message=email-recovered');
        break;

      case 'verifyEmail':
        // Handle email verification
        navigate('/login?message=email-verified');
        break;

      default:
        // Unknown mode, redirect to login
        navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Processing your request...</p>
      </div>
    </div>
  );
};
