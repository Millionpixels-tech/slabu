import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserData, changeUserEmail, changeUserPassword, changeUserPhone } from '../services/userService';
import { createAgency, getAgencyByUserId } from '../services/agencyService';
import type { User, AuthContextType, Agency } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userData = await getUserData(firebaseUser.uid);
        if (userData) {
          setCurrentUser(userData);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userData = await getUserData(result.user.uid);
    
    if (!userData) {
      await signOut(auth);
      throw new Error('User data not found');
    }
    
    // Check if agency is approved
    if (userData.role === 'agency') {
      const agency = await getAgencyByUserId(result.user.uid);
      if (!agency || agency.status !== 'approved') {
        await signOut(auth);
        throw new Error('Your agency registration is pending approval');
      }
    }
    
    setCurrentUser(userData);
  };

  const signup = async (email: string, password: string, agencyData: Partial<Agency>, registrationDocument?: File) => {
    // Create auth user
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create agency document
    await createAgency(result.user.uid, {
      ...agencyData,
      email,
    }, registrationDocument);
    
    // User document is created in createAgency function
    // Don't set current user yet - they need admin approval
    await signOut(auth);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const forgotPassword = async (email: string) => {
    // Note: For this to work correctly, you must configure the authorized domain
    // in Firebase Console -> Authentication -> Settings -> Authorized domains
    // And set up the action URL in Firebase Console -> Authentication -> Templates
    const actionCodeSettings = {
      // This URL will be used in the email for continuing the reset process
      url: window.location.origin + '/login',
      handleCodeInApp: false, // Changed to false - user will handle reset in our app
    };
    
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  };

  const verifyResetCode = async (oobCode: string): Promise<string> => {
    // Verify the password reset code and return the email
    return await verifyPasswordResetCode(auth, oobCode);
  };

  const resetPassword = async (oobCode: string, newPassword: string) => {
    // Confirm the password reset with the code and new password
    await confirmPasswordReset(auth, oobCode, newPassword);
  };

  const changeEmail = async (newEmail: string, currentPassword: string) => {
    await changeUserEmail(newEmail, currentPassword);
    // Refresh user data to get updated email
    if (currentUser) {
      const userData = await getUserData(currentUser.uid);
      if (userData) {
        setCurrentUser(userData);
      }
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await changeUserPassword(currentPassword, newPassword);
  };

  const changePhone = async (newPhone: string, currentPassword: string) => {
    await changeUserPhone(newPhone, currentPassword);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isAgency = currentUser?.role === 'agency';

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyResetCode,
    changeEmail,
    changePassword,
    changePhone,
    isAdmin,
    isAgency,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
