import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import UnifiedLogin from './pages/UnifiedLogin'
import RegistrationPage from './pages/RegistrationPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import BouncerDashboard from './pages/BouncerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import UserProfile from './pages/UserProfile'
import PostRequestPage from './pages/PostRequestPage'
import IndividualBookingPage from './pages/IndividualBookingPage'
import GroupBookingPage from './pages/GroupBookingPage'
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

  // Check authentication from both state AND localStorage
  // This prevents race conditions where state hasn't updated yet after login
  const hasToken = localStorage.getItem('bouncer_access_token');
  const storedUserData = localStorage.getItem('bouncer_current_user');

  let effectiveUser = currentUser;

  // If state hasn't updated yet but we have data in localStorage, use that
  if (!currentUser && storedUserData && hasToken) {
    try {
      effectiveUser = JSON.parse(storedUserData);
      console.log('[ProtectedRoute] Using localStorage user data (state not ready yet):', effectiveUser);
    } catch (e) {
      console.error('[ProtectedRoute] Failed to parse stored user data:', e);
    }
  }

  // Check if user is authenticated (either from state or localStorage)
  if ((!isAuthenticated && !hasToken) || !effectiveUser) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // If a specific role is required, check it
  if (allowedRole && effectiveUser.userType !== allowedRole) {
    console.log('[ProtectedRoute] Role mismatch. Required:', allowedRole, 'Actual:', effectiveUser.userType);
    // Redirect to appropriate dashboard based on user role
    const roleRedirects = {
      admin: '/admin',
      bouncer: '/bouncer',
      user: '/user'
    };
    return <Navigate to={roleRedirects[effectiveUser.userType] || '/login'} replace />;
  }

  console.log('[ProtectedRoute] Access granted for role:', effectiveUser.userType);
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

          {/* User Profile Page - Protected */}
          <Route path="/user/profile" element={
            <ProtectedRoute allowedRole="user">
              <UserProfile />
            </ProtectedRoute>
          } />

          {/* Post Request Page - Protected */}
          <Route path="/user/post-request" element={
            <ProtectedRoute allowedRole="user">
              <PostRequestPage />
            </ProtectedRoute>
          } />

          {/* Individual Booking Page - Protected */}
          <Route path="/user/browse/bouncers/individual-booking" element={
            <ProtectedRoute allowedRole="user">
              <IndividualBookingPage />
            </ProtectedRoute>
          } />

          {/* Group Booking Page - Protected */}
          <Route path="/user/browse/bouncers/group-booking" element={
            <ProtectedRoute allowedRole="user">
              <GroupBookingPage />
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