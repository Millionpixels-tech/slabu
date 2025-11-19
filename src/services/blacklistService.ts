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
  
  return { id: entryDoc.id, ...entryDoc.data() } as BlacklistEntry;
};

// Optimized search function - searches by full name, ID number, or passport number
export const searchBlacklistEntries = async (
  searchTerm: string
): Promise<BlacklistEntry[]> => {
  if (!searchTerm.trim()) return [];
  
  const searchLower = searchTerm.toLowerCase().trim();
  
  // Fetch all blacklist entries and perform client-side filtering
  // This is necessary because Firestore doesn't support OR queries across different fields
  // For production with large datasets, consider using Algolia, Elasticsearch, or similar
  const allEntriesQuery = query(
    collection(db, 'blacklist'),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(allEntriesQuery);
  const allEntries = snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as BlacklistEntry));
  
  // Filter entries that match the search term in any field
  const filteredEntries = allEntries.filter(entry => {
    const fullNameMatch = entry.fullName.toLowerCase().includes(searchLower);
    const idNumberMatch = entry.idNumber.toLowerCase().includes(searchLower);
    const passportMatch = entry.passportNumber.toLowerCase().includes(searchLower);
    
    return fullNameMatch || idNumberMatch || passportMatch;
  });
  
  return filteredEntries;
};

// Get blacklist entries for a specific agency
export const getAgencyBlacklistEntries = async (agencyId: string): Promise<BlacklistEntry[]> => {
  const q = query(
    collection(db, 'blacklist'),
    where('agencyId', '==', agencyId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlacklistEntry));
};

// Get all blacklist entries (admin only)
export const getAllBlacklistEntries = async (): Promise<BlacklistEntry[]> => {
  const q = query(collection(db, 'blacklist'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlacklistEntry));
};

// Delete blacklist entry (unblacklist)
export const deleteBlacklistEntry = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'blacklist', id));
};
