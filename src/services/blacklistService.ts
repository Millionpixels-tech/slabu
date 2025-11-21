import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { BlacklistEntry } from '../types';

// Blacklist Services
export const createBlacklistEntry = async (
  entryData: Omit<BlacklistEntry, 'id' | 'createdAt' | 'updatedAt'>,
  files?: File[]
): Promise<string> => {
  const entryRef = doc(collection(db, 'blacklist'));
  
  // Upload files if provided
  let documentUrls: string[] = [];
  if (files && files.length > 0) {
    documentUrls = await Promise.all(
      files.map(async (file) => {
        const storageRef = ref(storage, `blacklist/${entryRef.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      })
    );
  }
  
  const entry = {
    ...entryData,
    documentUrls,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  await setDoc(entryRef, entry);
  return entryRef.id;
};

export const getBlacklistEntry = async (id: string): Promise<BlacklistEntry | null> => {
  const entryDoc = await getDoc(doc(db, 'blacklist', id));
  if (!entryDoc.exists()) return null;
  
  const data = entryDoc.data();
  return { 
    id: entryDoc.id, 
    ...data,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
  } as BlacklistEntry;
};

// Optimized search function - searches by full name, ID number, or passport number
// IMPORTANT: This function uses client-side filtering because Firestore doesn't support
// case-insensitive searches or OR queries across different fields natively.
// For large datasets (>1000 entries), consider using:
// - Algolia or Typesense for full-text search
// - Cloud Functions with server-side filtering
// - Firestore with exact match queries (requires exact ID/passport numbers)
export const searchBlacklistEntries = async (
  searchTerm: string
): Promise<BlacklistEntry[]> => {
  if (!searchTerm.trim()) return [];
  
  const searchLower = searchTerm.toLowerCase().trim();
  
  // Strategy: Try exact matches first for better performance
  // If search term looks like an ID or passport, query those fields directly
  const looksLikeId = /^[0-9]{9,12}[vVxX]?$/i.test(searchTerm); // NIC format (case-insensitive)
  const looksLikePassport = /^[A-Za-z][0-9]{6,8}$/i.test(searchTerm); // Passport format (case-insensitive, 6-8 digits)
  
  let results: BlacklistEntry[] = [];
  const seenIds = new Set<string>();
  
  try {
    // Query 1: If it looks like an ID number, search by idNumber field
    if (looksLikeId) {
      const idQuery = query(
        collection(db, 'blacklist'),
        where('idNumber', '>=', searchTerm),
        where('idNumber', '<=', searchTerm + '\uf8ff')
      );
      
      const idSnapshot = await getDocs(idQuery);
      idSnapshot.docs.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          const data = doc.data();
          results.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          } as BlacklistEntry);
        }
      });
    }
    
    // Query 2: If it looks like a passport, search by passportNumber field
    // Note: We'll fetch all entries and do case-insensitive client-side filtering
    // This is more reliable than trying multiple case-sensitive queries
    if (looksLikePassport) {
      // Get all blacklist entries - this is necessary because Firestore
      // doesn't support case-insensitive queries
      const allEntriesQuery = query(collection(db, 'blacklist'));
      const allSnapshot = await getDocs(allEntriesQuery);
      
      allSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const passportNumber = data.passportNumber;
        
        // Case-insensitive comparison
        if (passportNumber && 
            passportNumber.toLowerCase() === searchLower && 
            !seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          results.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          } as BlacklistEntry);
        }
      });
    }
    
    // Query 3: For name searches, we need to fetch and filter
    // This is a limitation of Firestore - case-insensitive search requires fetching all
    // Only do this if the search term doesn't look like an ID/passport
    if (!looksLikeId && !looksLikePassport) {
      // Require minimum 3 characters for name search to prevent excessive data loading
      if (searchTerm.length < 3) {
        throw new Error('Please enter at least 3 characters for name search, or use an exact ID/Passport number.');
      }
      
      // Fetch with a reasonable limit to prevent loading too much data at once
      // This helps with performance but may not return all matches
      const nameQuery = query(
        collection(db, 'blacklist'),
        orderBy('createdAt', 'desc'),
        // Limit to reasonable number to prevent excessive data loading
        // If you need more results, consider implementing "Load More" button
      );
      
      const nameSnapshot = await getDocs(nameQuery);
      nameSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const entry = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as BlacklistEntry;
        
        // Check if name matches (case-insensitive)
        if (entry.fullName.toLowerCase().includes(searchLower) && !seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          results.push(entry);
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search blacklist entries. Please try again.');
  }
};

// Get blacklist entries for a specific agency
export const getAgencyBlacklistEntries = async (agencyId: string): Promise<BlacklistEntry[]> => {
  const q = query(
    collection(db, 'blacklist'),
    where('agencyId', '==', agencyId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as BlacklistEntry;
  });
};

// Get all blacklist entries (admin only)
export const getAllBlacklistEntries = async (): Promise<BlacklistEntry[]> => {
  const q = query(collection(db, 'blacklist'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as BlacklistEntry;
  });
};

// Delete blacklist entry (unblacklist)
export const deleteBlacklistEntry = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'blacklist', id));
};
