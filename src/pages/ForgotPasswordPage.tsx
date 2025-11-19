import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send password reset email'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Blacklist System
          </h1>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <Card>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">
                Password reset email sent! Please check your inbox and follow
                the instructions to reset your password.
              </p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="agency@example.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />

              <Button type="submit" isLoading={loading} className="w-full">
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="block text-sm text-gray-600 hover:text-primary-600"
            >
              Back to Login
            </Link>
            <Link
              to="/signup"
              className="block text-sm text-gray-600 hover:text-primary-600"
            >
              Create a new account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
