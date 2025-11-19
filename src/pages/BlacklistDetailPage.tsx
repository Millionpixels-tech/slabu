import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useBlacklist } from '../hooks/useBlacklist';
import type { BlacklistEntry } from '../types';

export const BlacklistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getEntry, loading } = useBlacklist();
  const [entry, setEntry] = useState<BlacklistEntry | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    if (!id) return;

    try {
      const data = await getEntry(id);
      setEntry(data);
      if (!data) {
        setError('Blacklist entry not found');
      }
    } catch (err) {
      setError('Failed to load blacklist entry');
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !entry) {
    return (
      <Layout>
        <Card className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Entry Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200"
              >
                Go Back to Search
              </Link>
            </div>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Search
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{entry.fullName}</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">Blacklist Entry Details</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 self-start">
            Blacklisted
          </span>
        </div>

        {/* Main Details */}
        <Card title="Personal Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-base text-gray-900 break-words">{entry.fullName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">ID Number</label>
              <p className="mt-1 text-base text-gray-900 break-words">{entry.idNumber}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Passport Number</label>
              <p className="mt-1 text-base text-gray-900 break-words">{entry.passportNumber}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500">Address</label>
              <p className="mt-1 text-base text-gray-900 break-words">{entry.address}</p>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card title="Description">
          <p className="text-gray-700 whitespace-pre-wrap">{entry.description}</p>
        </Card>

        {/* Documents */}
        {entry.documentUrls && entry.documentUrls.length > 0 && (
          <Card title="Supporting Documents">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entry.documentUrls.map((url, index) => {
                const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                
                return (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    {isImage ? (
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url}
                          alt={`Document ${index + 1}`}
                          className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-48 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">Document {index + 1}</p>
                        </div>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Agency Information */}
        <Card title="Added By">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                to={`/agency/${entry.agencyId}`}
                className="text-lg font-medium text-primary-600 hover:text-primary-700 break-words"
              >
                {entry.agencyName}
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                Added on {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'N/A'}
              </p>
              {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(entry.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
            <Link
              to={`/agency/${entry.agencyId}`}
              className="text-sm text-primary-600 hover:text-primary-700 self-start sm:self-center whitespace-nowrap"
            >
              View Agency Details →
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
