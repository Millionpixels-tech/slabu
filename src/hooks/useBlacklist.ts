import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  createBlacklistEntry as createEntry,
  searchBlacklistEntries,
  getBlacklistEntry,
  getAgencyBlacklistEntries,
} from '../services/blacklistService';
import type { BlacklistEntry } from '../types';

export const useBlacklist = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBlacklistEntry = async (
    data: Omit<BlacklistEntry, 'id' | 'createdAt' | 'updatedAt' | 'agencyId' | 'agencyName' | 'addedBy'>,
    files?: File[]
  ) => {
    if (!currentUser?.agencyId) {
      throw new Error('No agency ID found');
    }

    setLoading(true);
    setError(null);

    try {
      // Get agency name - in a real app, cache this
      const { getAgency } = await import('../services/agencyService');
      const agency = await getAgency(currentUser.agencyId);

      const entryId = await createEntry(
        {
          ...data,
          agencyId: currentUser.agencyId,
          agencyName: agency?.name || 'Unknown Agency',
          addedBy: currentUser.uid,
        },
        files
      );

      return entryId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create blacklist entry';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchEntries = async (searchTerm: string) => {
    setLoading(true);
    setError(null);

    try {
      const results = await searchBlacklistEntries(searchTerm);
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search blacklist entries';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEntry = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const entry = await getBlacklistEntry(id);
      return entry;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get blacklist entry';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAgencyEntries = async (agencyId: string) => {
    setLoading(true);
    setError(null);

    try {
      const entries = await getAgencyBlacklistEntries(agencyId);
      return entries;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get agency entries';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createBlacklistEntry,
    searchEntries,
    getEntry,
    getAgencyEntries,
  };
};
