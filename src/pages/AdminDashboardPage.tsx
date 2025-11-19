import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { getPendingAgencies, updateAgencyStatus } from '../services/agencyService';
import { useAuth } from '../contexts/AuthContext';
import type { Agency } from '../types';

export const AdminDashboardPage = () => {
  const { currentUser } = useAuth();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingAgencies();
  }, []);

  const loadPendingAgencies = async () => {
    try {
      setLoading(true);
      const data = await getPendingAgencies();
      setAgencies(data);
    } catch (err) {
      setError('Failed to load pending agencies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (agencyId: string) => {
    if (!currentUser) return;

    setProcessingId(agencyId);
    try {
      await updateAgencyStatus(agencyId, 'approved', currentUser.uid);
      setAgencies(agencies.filter(a => a.id !== agencyId));
    } catch (err) {
      setError('Failed to approve agency');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (agencyId: string) => {
    if (!currentUser) return;

    setProcessingId(agencyId);
    try {
      await updateAgencyStatus(agencyId, 'rejected', currentUser.uid);
      setAgencies(agencies.filter(a => a.id !== agencyId));
    } catch (err) {
      setError('Failed to reject agency');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Review and approve agency registration requests</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {agencies.length === 0 ? (
          <Card>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending agencies</h3>
              <p className="mt-1 text-sm text-gray-500">
                All agency registration requests have been processed.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agencies.map((agency) => (
              <Card key={agency.id} className="flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 break-words">{agency.name}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-600 break-words">{agency.email}</p>
                    </div>
                    
                    {agency.phone && (
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <p className="text-gray-600 break-words">{agency.phone}</p>
                      </div>
                    )}
                    
                    {agency.registrationNumber && (
                      <div>
                        <span className="font-medium text-gray-700">Reg. Number:</span>
                        <p className="text-gray-600 break-words">{agency.registrationNumber}</p>
                      </div>
                    )}
                    
                    {agency.contactPerson && (
                      <div>
                        <span className="font-medium text-gray-700">Contact Person:</span>
                        <p className="text-gray-600 break-words">{agency.contactPerson}</p>
                      </div>
                    )}
                    
                    {agency.address && (
                      <div>
                        <span className="font-medium text-gray-700">Address:</span>
                        <p className="text-gray-600 break-words">{agency.address}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium text-gray-700">Registered:</span>
                      <p className="text-gray-600">
                        {new Date(agency.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {agency.registrationDocumentUrl && (
                      <div>
                        <span className="font-medium text-gray-700">Registration Document:</span>
                        <a
                          href={agency.registrationDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center text-sm text-primary-600 hover:text-primary-700 break-words"
                        >
                          <svg
                            className="w-4 h-4 mr-1 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          View Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(agency.id)}
                    disabled={processingId === agency.id}
                    className="flex-1 w-full"
                  >
                    {processingId === agency.id ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleReject(agency.id)}
                    disabled={processingId === agency.id}
                    className="flex-1 w-full"
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
