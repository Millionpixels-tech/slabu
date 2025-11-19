import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Agency } from '../types';

// Agency Services
export const createAgency = async (
  userId: string, 
  agencyData: Partial<Agency>,
  registrationDocument?: File
): Promise<string> => {
  const agencyRef = doc(collection(db, 'agencies'));
  
  // Upload registration document if provided
  let registrationDocumentUrl: string | undefined;
  if (registrationDocument) {
    const storageRef = ref(storage, `agencies/${agencyRef.id}/registration-document`);
    await uploadBytes(storageRef, registrationDocument);
    registrationDocumentUrl = await getDownloadURL(storageRef);
  }
  
  const agency: Omit<Agency, 'id'> = {
    ...agencyData as Omit<Agency, 'id'>,
    userId,
    status: 'pending',
    registrationDocumentUrl,
    createdAt: Timestamp.now() as unknown as Date,
  };
  
  await setDoc(agencyRef, agency);
  
  // Store agency ID in user document for quick access
  await setDoc(doc(db, 'users', userId), {
    email: agencyData.email,
    role: 'agency',
    agencyId: agencyRef.id,
    createdAt: serverTimestamp(),
  });
  
  return agencyRef.id;
};

export const getAgency = async (agencyId: string): Promise<Agency | null> => {
  const agencyDoc = await getDoc(doc(db, 'agencies', agencyId));
  if (!agencyDoc.exists()) return null;
  
  return { id: agencyDoc.id, ...agencyDoc.data() } as Agency;
};

export const getPendingAgencies = async (): Promise<Agency[]> => {
  const q = query(
    collection(db, 'agencies'), 
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agency));
};

export const updateAgencyStatus = async (
  agencyId: string, 
  status: 'approved' | 'rejected',
  adminId: string
): Promise<void> => {
  await updateDoc(doc(db, 'agencies', agencyId), {
    status,
    approvedBy: adminId,
    approvedAt: serverTimestamp(),
  });
};

export const getAgencyByUserId = async (userId: string): Promise<Agency | null> => {
  const q = query(collection(db, 'agencies'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Agency;
};
