import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useBlacklist } from '../hooks/useBlacklist';
import type { BlacklistEntry } from '../types';

export const HomePage = () => {
  const { searchEntries, loading } = useBlacklist();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<BlacklistEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      return;
    }

    setHasSearched(true);
    try {
      const data = await searchEntries(searchTerm);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blacklist Search</h1>
            <p className="mt-2 text-gray-600">Search for individuals by name, ID number, or passport number</p>
          </div>
          <Link to="/add-blacklist">
            <Button className="w-full sm:w-auto">+ Add to Blacklist</Button>
          </Link>
        </div>

        {/* Search Form */}
        <Card>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="e.g., Saman Kumara, N1234567, or 199012345678V"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" isLoading={loading} className="sm:whitespace-nowrap">
                Search
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              💡 Tip: You can search using name, NIC number, or passport number
            </p>
          </form>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <div>
            {loading ? (
              <Card>
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Searching...</p>
                </div>
              </Card>
            ) : results.length === 0 ? (
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
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No blacklist entries match your search criteria.
                  </p>
                </div>
              </Card>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((entry) => (
                    <Link key={entry.id} to={`/blacklist/${entry.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {entry.fullName}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Blacklisted
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">ID Number:</span>
                              <p className="text-gray-600">{entry.idNumber}</p>
                            </div>

                            {entry.passportNumber && (
                              <div>
                                <span className="font-medium text-gray-700">Passport:</span>
                                <p className="text-gray-600">{entry.passportNumber}</p>
                              </div>
                            )}

                            <div>
                              <span className="font-medium text-gray-700">Added by:</span>
                              <Link
                                to={`/agency/${entry.agencyId}`}
                                className="text-primary-600 hover:text-primary-700 block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {entry.agencyName}
                              </Link>
                            </div>

                            {entry.description && (
                              <div>
                                <span className="font-medium text-gray-700">Description:</span>
                                <p className="text-gray-600 line-clamp-2">{entry.description}</p>
                              </div>
                            )}

                            <div>
                              <span className="font-medium text-gray-700">Added:</span>
                              <p className="text-gray-600">
                                {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t">
                            <span className="text-sm text-primary-600 font-medium">
                              View full details →
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initial State - Before Search */}
        {!hasSearched && (
          <Card>
            <div className="text-center py-12">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Search Blacklist Database
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                Enter a name, ID number, or passport number above to search for blacklisted individuals. 
                Results will only be displayed if a match is found.
              </p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};
