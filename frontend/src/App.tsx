import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import UnifiedLogin from './pages/UnifiedLogin'
import RegistrationPage from './pages/RegistrationPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import BouncerDashboard from './pages/BouncerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import LoadingSpinner from './components/LoadingSpinner'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { BookingProvider } from './contexts/BookingContext'
import { Toaster } from 'react-hot-toast'

type UserType = 'admin' | 'user' | 'bouncer';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: UserType;
  redirectTo?: string
}> = ({ children, allowedRole, redirectTo = '/login' }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  // If a specific role is required, check it
  if (allowedRole && currentUser.userType !== allowedRole) {
    // Redirect to appropriate dashboard based on user role
    const roleRedirects = {
      admin: '/admin',
      bouncer: '/bouncer',
      user: '/user'
    };
    return <Navigate to={roleRedirects[currentUser.userType] || '/login'} replace />;
  }

  return <>{children}</>;
};

// Dashboard Router Component
const DashboardRouter: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  switch (currentUser.userType) {
    case 'admin':
      return <AdminDashboard />;
    case 'bouncer':
      return <BouncerDashboard />;
    case 'user':
      return <UserDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// App Content Component
const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  // Show loading spinner while checking authentication on app start
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="relative min-h-screen">
        <Routes>
          {/* Login and Registration */}
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Dashboard Routes - Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } />

          {/* Direct Dashboard Routes - Protected */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/bouncer" element={
            <ProtectedRoute allowedRole="bouncer">
              <BouncerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/user" element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } />

          {/* Catch all other routes - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Global Toaster for notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppContent />
      </BookingProvider>
    </AuthProvider>
  );
}

export default App