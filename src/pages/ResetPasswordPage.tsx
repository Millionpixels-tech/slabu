import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage = () => {
  const { resetPassword, verifyResetCode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  useEffect(() => {
    const verifyCode = async () => {
      const code = searchParams.get('oobCode');
      
      if (!code) {
        setError('Invalid or missing reset code');
        setVerifyingCode(false);
        return;
      }

      try {
        const userEmail = await verifyResetCode(code);
        setEmail(userEmail);
        setOobCode(code);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Invalid or expired reset code. Please request a new password reset link.'
        );
      } finally {
        setVerifyingCode(false);
      }
    };

    verifyCode();
  }, [searchParams, verifyResetCode]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!oobCode) {
      setError('Invalid reset code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword(oobCode, data.password);
      // Show success message and redirect to login
      alert('Password successfully reset! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (verifyingCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !oobCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              slabu.lk
            </h1>
            <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
              Reset Password Failed
            </h2>
          </div>

          <Card>
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>

            <div className="mt-6 text-center space-y-2">
              <Link
                to="/forgot-password"
                className="block text-sm text-gray-600 hover:text-primary-600"
              >
                Request a new reset link
              </Link>
              <Link
                to="/login"
                className="block text-sm text-gray-600 hover:text-primary-600"
              >
                Back to Login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            slabu.lk
          </h1>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Set New Password
          </h2>
          {email && (
            <p className="mt-2 text-sm text-gray-600">
              Resetting password for: <span className="font-medium">{email}</span>
            </p>
          )}
        </div>

        <Card>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
            />

            <Button type="submit" isLoading={loading} className="w-full">
              Reset Password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
