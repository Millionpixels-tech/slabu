import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

interface SignUpFormData {
  agencyName: string;
  email: string;
  phone: string;
  address: string;
  registrationNumber: string;
  contactPerson: string;
  registrationDocument: FileList;
  password: string;
  confirmPassword: string;
}

export const SignUpPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const password = watch('password');

  const onSubmit = async (data: SignUpFormData) => {
    setError('');
    setLoading(true);

    try {
      const registrationDocument = data.registrationDocument?.[0];
      
      await signup(data.email, data.password, {
        name: data.agencyName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        registrationNumber: data.registrationNumber,
        contactPerson: data.contactPerson,
      }, registrationDocument);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
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
              Registration Successful!
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Your agency registration has been submitted. An admin will review your request shortly. 
              You'll be able to login once approved.
            </p>
            <p className="mt-4 text-sm text-gray-500">Redirecting to login...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Blacklist System</h1>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">Create Agency Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <Card>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Agency Name"
                placeholder="ABC Security Agency"
                error={errors.agencyName?.message}
                {...register('agencyName', { required: 'Agency name is required' })}
              />

              <Input
                label="Registration Number"
                placeholder="REG123456"
                error={errors.registrationNumber?.message}
                {...register('registrationNumber', { required: 'Registration number is required' })}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="info@agency.com"
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
                label="Phone Number"
                type="tel"
                placeholder="+1 234 567 8900"
                error={errors.phone?.message}
                {...register('phone', { required: 'Phone number is required' })}
              />

              <Input
                label="Contact Person"
                placeholder="John Doe"
                error={errors.contactPerson?.message}
                {...register('contactPerson', { required: 'Contact person is required' })}
              />

              <div className="md:col-span-2">
                <Input
                  label="Address"
                  placeholder="123 Main St, City, Country"
                  error={errors.address?.message}
                  {...register('address', { required: 'Address is required' })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agency Registration Document *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  {...register('registrationDocument', { required: 'Registration document is required' })}
                />
                {errors.registrationDocument && (
                  <p className="mt-1 text-sm text-red-600">{errors.registrationDocument.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Upload your agency registration certificate (PDF, JPG, or PNG)
                </p>
              </div>

              <Input
                label="Password"
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
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              Create Account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
