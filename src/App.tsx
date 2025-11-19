import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AuthActionHandler } from './pages/AuthActionHandler';
import { HomePage } from './pages/HomePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AddBlacklistPage } from './pages/AddBlacklistPage';
import { BlacklistDetailPage } from './pages/BlacklistDetailPage';
import { AgencyDetailPage } from './pages/AgencyDetailPage';
import { AgencyProfilePage } from './pages/AgencyProfilePage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { EditProfilePage } from './pages/EditProfilePage';

// Redirect component to handle root route
const RootRedirect = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <Navigate to="/home" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/action" element={<AuthActionHandler />} />

          {/* Protected Routes - Agency */}
          <Route
            path="/home"
            element={
              <ProtectedRoute requiredRole="agency">
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-blacklist"
            element={
              <ProtectedRoute requiredRole="agency">
                <AddBlacklistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blacklist/:id"
            element={
              <ProtectedRoute>
                <BlacklistDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/:id"
            element={
              <ProtectedRoute>
                <AgencyDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="agency">
                <AgencyProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/profile"
            element={
              <ProtectedRoute requiredRole="agency">
                <AgencyProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/edit-profile"
            element={
              <ProtectedRoute requiredRole="agency">
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/change-password"
            element={
              <ProtectedRoute requiredRole="agency">
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* 404 - Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App
