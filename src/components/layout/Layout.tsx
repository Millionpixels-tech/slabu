import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { useState, type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { currentUser, logout, isAdmin, isAgency } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl sm:text-2xl font-bold text-primary-600">
                Blacklist System
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {currentUser && (
                <>
                  {isAgency && (
                    <>
                      <Link
                        to="/home"
                        className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Search
                      </Link>
                      <Link
                        to="/add-blacklist"
                        className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Add Entry
                      </Link>
                      <Link
                        to="/profile"
                        className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        My Profile
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Button variant="secondary" onClick={handleLogout} size="sm">
                    Logout
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            {currentUser && (
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {/* Hamburger icon */}
                  {!mobileMenuOpen ? (
                    <svg
                      className="block h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="block h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && currentUser && (
            <div className="md:hidden pb-3 pt-2 border-t border-gray-200">
              <div className="space-y-1">
                {isAgency && (
                  <>
                    <Link
                      to="/home"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                    >
                      Search
                    </Link>
                    <Link
                      to="/add-blacklist"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                    >
                      Add Entry
                    </Link>
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                    >
                      My Profile
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Blacklist Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
