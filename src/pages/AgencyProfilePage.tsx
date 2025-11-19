import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { getAgencyByUserId } from '../services/agencyService';
import { getAgencyBlacklistEntries, deleteBlacklistEntry } from '../services/blacklistService';
import type { Agency, BlacklistEntry } from '../types';

export const AgencyProfilePage = () => {
  const { currentUser } = useAuth();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [allEntries, setAllEntries] = useState<BlacklistEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (currentUser?.agencyId) {
      loadAgencyData();
    }
  }, [currentUser]);

  useEffect(() => {
    filterEntries();
  }, [searchTerm, allEntries]);

  const loadAgencyData = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      const [agencyData, entriesData] = await Promise.all([
        getAgencyByUserId(currentUser.uid),
        currentUser.agencyId ? getAgencyBlacklistEntries(currentUser.agencyId) : Promise.resolve([]),
      ]);

      setAgency(agencyData);
      setAllEntries(entriesData);
      setFilteredEntries(entriesData);

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

  const filterEntries = () => {
    if (!searchTerm.trim()) {
      setFilteredEntries(allEntries);
      setCurrentPage(1);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = allEntries.filter(entry => {
      const nameMatch = entry.fullName.toLowerCase().includes(searchLower);
      const idMatch = entry.idNumber.toLowerCase().includes(searchLower);
      const passportMatch = entry.passportNumber.toLowerCase().includes(searchLower);
      return nameMatch || idMatch || passportMatch;
    });

    setFilteredEntries(filtered);
    setCurrentPage(1);
  };

  const handleUnblacklist = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to unblacklist ${name}?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteBlacklistEntry(id);
      setAllEntries(allEntries.filter(e => e.id !== id));
      setFilteredEntries(filteredEntries.filter(e => e.id !== id));
    } catch (err) {
      setError('Failed to unblacklist entry');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntries = filteredEntries.slice(startIndex, endIndex);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!agency) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600">Agency profile not found</p>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Agency Profile</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">View your agency details and manage blacklisted users</p>
          </div>
          <Link to="/agency/edit-profile" className="self-start">
            <Button variant="primary" size="sm">Edit Profile</Button>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Agency Details */}
        <Card title="Agency Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Agency Name</label>
              <p className="mt-1 text-base text-gray-900">{agency.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email Address</label>
              <p className="mt-1 text-base text-gray-900">{agency.email}</p>
            </div>

            {agency.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                <p className="mt-1 text-base text-gray-900">{agency.phone}</p>
              </div>
            )}

            {agency.registrationNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Registration Number</label>
                <p className="mt-1 text-base text-gray-900">{agency.registrationNumber}</p>
              </div>
            )}

            {agency.contactPerson && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Contact Person</label>
                <p className="mt-1 text-base text-gray-900">{agency.contactPerson}</p>
              </div>
            )}

            {agency.address && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="mt-1 text-base text-gray-900">{agency.address}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span
                className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
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

            <div>
              <label className="block text-sm font-medium text-gray-500">Member Since</label>
              <p className="mt-1 text-base text-gray-900">
                {agency.createdAt ? new Date(agency.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Blacklist Entries */}
        <Card title="My Blacklisted Users">
          {/* Search Bar */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by name, ID number, or passport number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <p className="mt-2 text-sm text-gray-600">
              Total entries: <span className="font-semibold">{filteredEntries.length}</span>
              {searchTerm && ` (filtered from ${allEntries.length})`}
            </p>
          </div>

          {currentEntries.length === 0 ? (
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No matching entries' : 'No entries yet'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'Try a different search term'
                  : "You haven't added any blacklist entries yet"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Passport
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/blacklist/${entry.id}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                          >
                            {entry.fullName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.idNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.passportNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUnblacklist(entry.id, entry.fullName)}
                            disabled={deletingId === entry.id}
                          >
                            {deletingId === entry.id ? 'Removing...' : 'Unblacklist'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Visible only on mobile */}
              <div className="md:hidden space-y-4">
                {currentEntries.map((entry) => (
                  <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <Link
                        to={`/blacklist/${entry.id}`}
                        className="text-base font-semibold text-primary-600 hover:text-primary-700 break-words"
                      >
                        {entry.fullName}
                      </Link>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">ID Number:</span>
                        <span className="text-gray-900 break-words text-right">{entry.idNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Passport:</span>
                        <span className="text-gray-900 break-words text-right">{entry.passportNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Added:</span>
                        <span className="text-gray-900">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleUnblacklist(entry.id, entry.fullName)}
                        disabled={deletingId === entry.id}
                        className="w-full"
                      >
                        {deletingId === entry.id ? 'Removing...' : 'Unblacklist'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 border-t border-gray-200 pt-4 space-y-3">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredEntries.length)}</span> of{' '}
                    <span className="font-medium">{filteredEntries.length}</span> results
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex gap-2">
                            {showEllipsis && (
                              <span className="px-3 py-1 text-gray-500 hidden sm:inline">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? 'primary' : 'secondary'}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};
