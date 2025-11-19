import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useBlacklist } from '../hooks/useBlacklist';

interface BlacklistFormData {
  fullName: string;
  passportNumber: string;
  idNumber: string;
  address: string;
  description: string;
}

export const AddBlacklistPage = () => {
  const navigate = useNavigate();
  const { createBlacklistEntry, loading } = useBlacklist();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BlacklistFormData>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: BlacklistFormData) => {
    setError('');
    
    try {
      await createBlacklistEntry(data, files.length > 0 ? files : undefined);
      setSuccess(true);
      reset();
      setFiles([]);
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add blacklist entry');
    }
  };

  if (success) {
    return (
      <Layout>
        <Card className="max-w-2xl mx-auto">
          <div className="text-center py-8">
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
              Blacklist Entry Added Successfully!
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              The individual has been added to the blacklist database.
            </p>
            <p className="mt-4 text-sm text-gray-500">Redirecting to home page...</p>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add to Blacklist</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Add a new individual to the blacklist database
          </p>
        </div>

        <Card>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Full Name *"
                  placeholder="John Doe"
                  error={errors.fullName?.message}
                  {...register('fullName', { required: 'Full name is required' })}
                />
              </div>

              <Input
                label="Passport Number *"
                placeholder="P1234567"
                error={errors.passportNumber?.message}
                {...register('passportNumber', { required: 'Passport number is required' })}
              />

              <Input
                label="ID Number *"
                placeholder="ID123456789"
                error={errors.idNumber?.message}
                {...register('idNumber', { required: 'ID number is required' })}
              />

              <div className="md:col-span-2">
                <Input
                  label="Address *"
                  placeholder="123 Main Street, City, Country"
                  error={errors.address?.message}
                  {...register('address', { required: 'Address is required' })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px] ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Provide details about why this individual is being blacklisted..."
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* File Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supporting Documents (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload files</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF, DOC up to 10MB each
                    </p>
                  </div>
                </div>

                {/* Selected Files */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Selected files ({files.length}):
                    </p>
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
                className="flex-1 w-full"
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={loading} className="flex-1 w-full">
                Add to Blacklist
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
