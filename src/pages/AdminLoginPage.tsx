import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

interface AdminLoginFormData {
  email: string;
  password: string;
  adminCode: string;
}

// Note: In production, this should be handled more securely
const ADMIN_CODE = 'ADMIN2025'; // This is just for demo purposes

export const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>();

  const onSubmit = async (data: AdminLoginFormData) => {
    setError('');

    // Verify admin code
    if (data.adminCode !== ADMIN_CODE) {
      setError('Invalid admin access code');
      return;
    }

    setLoading(true);

    try {
      await login(data.email, data.password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Blacklist System</h1>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">Admin Login</h2>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ This page is password protected and only accessible to administrators.
            </p>
          </div>
        </div>

        <Card>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Admin Access Code"
              type="password"
              placeholder="Enter admin code"
              error={errors.adminCode?.message}
              {...register('adminCode', {
                required: 'Admin code is required',
              })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="admin@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
              })}
            />

            <Button type="submit" isLoading={loading} className="w-full">
              Sign In as Admin
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full text-sm text-center text-primary-600 hover:text-primary-500"
            >
              Forgot password?
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full text-sm text-center text-gray-600 hover:text-primary-600"
            >
              ← Back to Regular Login
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
