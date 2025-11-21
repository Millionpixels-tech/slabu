import { useState, useCallback, useMemo } from 'react';
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
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setHasSearched(false);
    setSearchError(null);
  }, []);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      return;
    }

    // Check if it looks like an ID or passport (these don't need minimum length)
    const looksLikeId = /^[0-9]{9,12}[vVxX]?$/.test(trimmedSearch);
    const looksLikePassport = /^[A-Za-z][0-9]{6,8}$/.test(trimmedSearch);
    
    // For name searches, require minimum 3 characters
    if (!looksLikeId && !looksLikePassport && trimmedSearch.length < 3) {
      setSearchError('Please enter at least 3 characters for name search, or use an exact ID/Passport number.');
      return;
    }

    setHasSearched(true);
    setSearchError(null);
    setResults([]);
    
    try {
      const data = await searchEntries(trimmedSearch);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search. Please try again.';
      setSearchError(errorMessage);
    }
  }, [searchTerm, searchEntries]);
  
  // Memoize the search button disabled state
  const isSearchDisabled = useMemo(() => !searchTerm.trim() || loading, [searchTerm, loading]);

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
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="e.g., Saman Kumara, N1234567, or 199012345678V"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
                {searchTerm && !loading && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <Button 
                type="submit" 
                isLoading={loading} 
                disabled={isSearchDisabled}
                className="sm:whitespace-nowrap"
              >
                Search
              </Button>
            </div>
            {searchError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{searchError}</p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              💡 <strong>Tip:</strong> Search by full name (min. 3 characters), NIC number, or passport number
            </p>
          </form>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <div>
            {loading ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary-600 border-t-transparent"></div>
                  <p className="text-gray-600 font-medium">Searching database...</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Skeleton Loading Cards */}
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Found {results.length} result{results.length !== 1 ? 's' : ''}
                  </h2>
                  <button
                    onClick={handleClearSearch}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear Search
                  </button>
                </div>
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
