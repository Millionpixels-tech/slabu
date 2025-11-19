import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import { getAgencyByUserId } from '../services/agencyService';
import type { Agency } from '../types';

export const EditProfilePage = () => {
  const { currentUser, changeEmail, changePassword, changePhone } = useAuth();
  const navigate = useNavigate();
  const [agency, setAgency] = useState<Agency | null>(null);
  
  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  
  // Phone change state
  const [newPhone, setNewPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.uid) {
      loadAgencyData();
    }
  }, [currentUser]);

  const loadAgencyData = async () => {
    if (!currentUser?.uid) return;
    try {
      const agencyData = await getAgencyByUserId(currentUser.uid);
      setAgency(agencyData);
    } catch (err) {
      console.error('Failed to load agency data:', err);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    // Validation
    if (!newEmail.trim()) {
      setEmailError('Please enter a new email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (newEmail === currentUser?.email) {
      setEmailError('New email must be different from current email');
      return;
    }

    if (!emailPassword) {
      setEmailError('Please enter your current password to confirm');
      return;
    }

    setEmailLoading(true);

    try {
      await changeEmail(newEmail, emailPassword);
      setEmailSuccess('Email updated successfully!');
      setNewEmail('');
      setEmailPassword('');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/agency/profile');
      }, 2000);
    } catch (err: any) {
      console.error('Email change error:', err);
      
      if (err.code === 'auth/wrong-password') {
        setEmailError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setEmailError('This email is already in use by another account.');
      } else if (err.code === 'auth/requires-recent-login') {
        setEmailError('For security, please log out and log in again before changing your email.');
      } else {
        setEmailError(err.message || 'Failed to update email. Please try again.');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePhoneChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setPhoneSuccess('');

    // Validation
    if (!newPhone.trim()) {
      setPhoneError('Please enter a phone number');
      return;
    }

    if (newPhone === agency?.phone) {
      setPhoneError('New phone number must be different from current phone');
      return;
    }

    if (!phonePassword) {
      setPhoneError('Please enter your current password to confirm');
      return;
    }

    setPhoneLoading(true);

    try {
      await changePhone(newPhone, phonePassword);
      setPhoneSuccess('Phone number updated successfully!');
      setNewPhone('');
      setPhonePassword('');
      
      // Reload agency data
      await loadAgencyData();
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/agency/profile');
      }, 2000);
    } catch (err: any) {
      console.error('Phone change error:', err);
      
      if (err.code === 'auth/wrong-password') {
        setPhoneError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/requires-recent-login') {
        setPhoneError('For security, please log out and log in again before changing your phone.');
      } else {
        setPhoneError(err.message || 'Failed to update phone number. Please try again.');
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (!newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/agency/profile');
      }, 2000);
    } catch (err: any) {
      console.error('Password change error:', err);
      
      if (err.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect. Please try again.');
      } else if (err.code === 'auth/weak-password') {
        setPasswordError('New password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/requires-recent-login') {
        setPasswordError('For security, please log out and log in again before changing your password.');
      } else {
        setPasswordError(err.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Update your email, phone number, and password
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/agency/profile')}
          >
            Back to Profile
          </Button>
        </div>

        {/* Current Information Display */}
        <Card title="Current Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Email
              </label>
              <p className="text-base text-gray-900 font-medium">{currentUser?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Phone Number
              </label>
              <p className="text-base text-gray-900 font-medium">
                {agency?.phone || 'Not set'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Note: Other agency details (name, registration number, etc.) cannot be changed. 
              Please contact support if you need to update those details.
            </div>
          </div>
        </Card>

        {/* Change Email Form */}
        <Card title="Change Email Address">
          <form onSubmit={handleEmailChange} className="space-y-4">
            {emailError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{emailError}</p>
              </div>
            )}

            {emailSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{emailSuccess}</p>
              </div>
            )}

            <Input
              label="New Email Address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g., newemail@agency.lk"
              required
              disabled={emailLoading}
            />

            <Input
              label="Current Password (to confirm)"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Enter your current password"
              required
              disabled={emailLoading}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={emailLoading}
              >
                {emailLoading ? 'Updating...' : 'Update Email'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setNewEmail('');
                  setEmailPassword('');
                  setEmailError('');
                  setEmailSuccess('');
                }}
                disabled={emailLoading}
              >
                Clear
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Phone Number Form */}
        <Card title="Change Phone Number">
          <form onSubmit={handlePhoneChange} className="space-y-4">
            {phoneError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{phoneError}</p>
              </div>
            )}

            {phoneSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{phoneSuccess}</p>
              </div>
            )}

            <Input
              label="New Phone Number"
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g., +94 77 123 4567"
              required
              disabled={phoneLoading}
            />

            <Input
              label="Current Password (to confirm)"
              type="password"
              value={phonePassword}
              onChange={(e) => setPhonePassword(e.target.value)}
              placeholder="Enter your current password"
              required
              disabled={phoneLoading}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={phoneLoading}
              >
                {phoneLoading ? 'Updating...' : 'Update Phone'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setNewPhone('');
                  setPhonePassword('');
                  setPhoneError('');
                  setPhoneSuccess('');
                }}
                disabled={phoneLoading}
              >
                Clear
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card title="Change Password">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{passwordSuccess}</p>
              </div>
            )}

            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              required
              disabled={passwordLoading}
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              disabled={passwordLoading}
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              disabled={passwordLoading}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                disabled={passwordLoading}
              >
                Clear
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
