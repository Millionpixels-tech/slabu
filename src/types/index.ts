export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'agency';
  agencyId?: string;
  createdAt: Date;
}

export interface Agency {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  registrationNumber?: string;
  contactPerson?: string;
  registrationDocumentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface BlacklistEntry {
  id: string;
  fullName: string;
  passportNumber: string;
  idNumber: string;
  address: string;
  description: string;
  documentUrls?: string[];
  agencyId: string;
  agencyName: string;
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, agencyData: Partial<Agency>, registrationDocument?: File) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (oobCode: string, newPassword: string) => Promise<void>;
  verifyResetCode: (oobCode: string) => Promise<string>;
  changeEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  changePhone: (newPhone: string, currentPassword: string) => Promise<void>;
  isAdmin: boolean;
  isAgency: boolean;
}
