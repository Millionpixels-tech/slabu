import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { auth } from '../services/firebase';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordFormData) => {
    setError('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        throw new Error('No user is currently signed in');
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, data.newPassword);

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (err.code === 'auth/weak-password') {
        setError('New password is too weak');
      } else {
        setError(err.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Password Changed Successfully!
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Your password has been updated. Redirecting...
              </p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Change Password</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Update your account password</p>
        </div>

        <Card>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              error={errors.currentPassword?.message}
              {...register('currentPassword', {
                required: 'Current password is required',
              })}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.newPassword?.message}
              {...register('newPassword', {
                required: 'New password is required',
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
                required: 'Please confirm your new password',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/profile')}
                className="flex-1 w-full"
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={loading} className="flex-1 w-full">
                Change Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
