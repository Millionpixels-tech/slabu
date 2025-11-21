import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  createBlacklistEntry as createEntry,
  searchBlacklistEntries,
  getBlacklistEntry,
  getAgencyBlacklistEntries,
} from '../services/blacklistService';
import type { BlacklistEntry } from '../types';

// Cache for agency names to avoid redundant fetches
const agencyNameCache = new Map<string, string>();

export const useBlacklist = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const agencyNameRef = useRef<string | null>(null);

  const createBlacklistEntry = useCallback(async (
    data: Omit<BlacklistEntry, 'id' | 'createdAt' | 'updatedAt' | 'agencyId' | 'agencyName' | 'addedBy'>,
    files?: File[]
  ) => {
    if (!currentUser?.agencyId) {
      throw new Error('No agency ID found');
    }

    setLoading(true);
    setError(null);

    try {
      // Use cached agency name if available
      let agencyName = agencyNameCache.get(currentUser.agencyId);
      
      if (!agencyName) {
        const { getAgency } = await import('../services/agencyService');
        const agency = await getAgency(currentUser.agencyId);
        agencyName = agency?.name || 'Unknown Agency';
        // Cache the agency name for future use
        agencyNameCache.set(currentUser.agencyId, agencyName);
        agencyNameRef.current = agencyName;
      }

      const entryId = await createEntry(
        {
          ...data,
          agencyId: currentUser.agencyId,
          agencyName,
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
  }, [currentUser]);

  const searchEntries = useCallback(async (searchTerm: string) => {
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
  }, []);

  const getEntry = useCallback(async (id: string) => {
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
  }, []);

  const getAgencyEntries = useCallback(async (agencyId: string) => {
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
  }, []);

  return {
    loading,
    error,
    createBlacklistEntry,
    searchEntries,
    getEntry,
    getAgencyEntries,
  };
};
