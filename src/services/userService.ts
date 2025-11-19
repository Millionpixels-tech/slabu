import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  updateEmail, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from 'firebase/auth';
import { db, auth } from './firebase';
import type { User } from '../types';

export const getUserData = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  
  return { uid: userDoc.id, ...userDoc.data() } as User;
};

export const createUserDocument = async (
  userId: string,
  email: string,
  role: 'admin' | 'agency',
  agencyId?: string
): Promise<void> => {
  await setDoc(doc(db, 'users', userId), {
    email,
    role,
    agencyId,
    createdAt: serverTimestamp(),
  });
};

export const reauthenticateUser = async (currentPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No authenticated user found');
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
};

export const changeUserEmail = async (newEmail: string, currentPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user found');
  }

  // Re-authenticate user before changing email
  await reauthenticateUser(currentPassword);

  // Update email in Firebase Auth
  await updateEmail(user, newEmail);

  // Update email in Firestore user document
  await updateDoc(doc(db, 'users', user.uid), {
    email: newEmail,
  });

  // Update email in agency document if user is an agency
  const userData = await getUserData(user.uid);
  if (userData?.role === 'agency' && userData.agencyId) {
    await updateDoc(doc(db, 'agencies', userData.agencyId), {
      email: newEmail,
    });
  }
};

export const changeUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user found');
  }

  // Re-authenticate user before changing password
  await reauthenticateUser(currentPassword);

  // Update password in Firebase Auth
  await updatePassword(user, newPassword);
};

export const changeUserPhone = async (newPhone: string, currentPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user found');
  }

  // Re-authenticate user before changing phone
  await reauthenticateUser(currentPassword);

  // Get user data to check if they have an agency
  const userData = await getUserData(user.uid);
  
  // Update phone in agency document if user is an agency
  if (userData?.role === 'agency' && userData.agencyId) {
    await updateDoc(doc(db, 'agencies', userData.agencyId), {
      phone: newPhone,
    });
  }
};
