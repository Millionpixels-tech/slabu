import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { getAgency } from '../services/agencyService';
import type { Agency } from '../types';

export const AgencyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAgencyData();
  }, [id]);

  const loadAgencyData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const agencyData = await getAgency(id);

      setAgency(agencyData);

      if (!agencyData) {
        setError('Agency not found');
      }
    } catch (err) {
      setError('Failed to load agency data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !agency) {
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Agency Not Found</h3>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{agency.name}</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">Agency Profile</p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium self-start ${
              agency.status === 'approved'
                ? 'bg-green-100 text-green-800'
                : agency.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {agency.status.charAt(0).toUpperCase() + agency.status.slice(1)}
          </span>
        </div>

        {/* Agency Details */}
        <Card title="Agency Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Agency Name</label>
              <p className="mt-1 text-base text-gray-900 break-words">{agency.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email Address</label>
              <p className="mt-1 text-base text-gray-900 break-words">{agency.email}</p>
            </div>

            {agency.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                <p className="mt-1 text-base text-gray-900 break-words">{agency.phone}</p>
              </div>
            )}

            {agency.registrationNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Registration Number
                </label>
                <p className="mt-1 text-base text-gray-900 break-words">{agency.registrationNumber}</p>
              </div>
            )}

            {agency.contactPerson && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Contact Person</label>
                <p className="mt-1 text-base text-gray-900 break-words">{agency.contactPerson}</p>
              </div>
            )}

            {agency.address && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="mt-1 text-base text-gray-900 break-words">{agency.address}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500">Registered Date</label>
              <p className="mt-1 text-base text-gray-900">
                {new Date(agency.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {agency.approvedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Approved Date</label>
                <p className="mt-1 text-base text-gray-900">
                  {new Date(agency.approvedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};
