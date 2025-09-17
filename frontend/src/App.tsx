import React, { useState } from 'react'
import SimpleLanding from './pages/SimpleLanding'
import LoginPage from './pages/LoginPage'
import ModernLoginPage from './pages/ModernLoginPage'
import LoginSelection from './pages/LoginSelection'
import RoleBasedLogin from './pages/RoleBasedLogin'
import RegistrationPage from './pages/RegistrationPage'
import BouncerDashboard from './pages/BouncerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import { AuthProvider } from './contexts/AuthContext'

type UserType = 'admin' | 'user' | 'bouncer';

function App() {
  const [currentPage, setCurrentPage] = useState('login-selection')
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null)

  const handleUserTypeSelection = (userType: UserType) => {
    setSelectedUserType(userType);
    setCurrentPage('role-based-login');
  };

  const handleBackToSelection = () => {
    setCurrentPage('login-selection');
    setSelectedUserType(null);
  };

  const handleLoginSuccess = (userType: UserType) => {
    // Redirect to appropriate dashboard based on user type
    switch (userType) {
      case 'admin':
        setCurrentPage('admin');
        break;
      case 'bouncer':
        setCurrentPage('bouncer');
        break;
      case 'user':
        setCurrentPage('user');
        break;
      default:
        setCurrentPage('login-selection');
    }
    setSelectedUserType(null);
  };

  const handleRegistrationSuccess = () => {
    setCurrentPage('login-selection');
  };

  const handleRegisterClick = () => {
    setCurrentPage('register');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login-selection':
        return <LoginSelection onSelectUserType={handleUserTypeSelection} onRegisterClick={handleRegisterClick} />
      case 'role-based-login':
        return selectedUserType ? (
          <RoleBasedLogin
            userType={selectedUserType}
            onBack={handleBackToSelection}
            onLoginSuccess={handleLoginSuccess}
            onRegisterClick={handleRegisterClick}
          />
        ) : <LoginSelection onSelectUserType={handleUserTypeSelection} onRegisterClick={handleRegisterClick} />
      case 'landing':
        return <SimpleLanding />
      case 'login':
        return <LoginPage />
      case 'modern-login':
        return <ModernLoginPage />
      case 'user':
        return <UserDashboard />
      case 'bouncer':
        return <BouncerDashboard />
      case 'admin':
        return <AdminDashboard />
      case 'register':
        return <RegistrationPage onRegistrationSuccess={handleRegistrationSuccess} />
      default:
        return <LoginSelection onSelectUserType={handleUserTypeSelection} onRegisterClick={handleRegisterClick} />
    }
  }

  // Compact navigation overlay (for demo purposes)
  const NavigationOverlay = () => (
    <div className="fixed top-2 right-2 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 p-2">
        <div className="flex space-x-1">
          <button
            onClick={() => {
              setCurrentPage('login-selection');
              setSelectedUserType(null);
            }}
            className={`p-2 rounded-md text-xs transition-colors ${
              currentPage === 'login-selection' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Login Selection"
          >
            🚪
          </button>
          <button
            onClick={() => setCurrentPage('landing')}
            className={`p-2 rounded-md text-xs transition-colors ${
              currentPage === 'landing' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Landing Page"
          >
            🏠
          </button>
          <button
            onClick={() => setCurrentPage('login')}
            className={`p-2 rounded-md text-xs transition-colors ${
              currentPage === 'login' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Basic Login"
          >
            🔐
          </button>
          <button
            onClick={() => setCurrentPage('modern-login')}
            className={`p-2 rounded-md text-xs transition-colors ${
              currentPage === 'modern-login' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Modern Login"
          >
            ✨
          </button>
          <button
            onClick={() => setCurrentPage('user')}
            className={`p-2 rounded-md text-xs transition-colors ${
              currentPage === 'user' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="User Dashboard"
          >
            👤
          </button>
          <button
            onClick={() => setCurrentPage('bouncer')}
            className={`p-2 rounded-md text-xs transition-colors ${
              currentPage === 'bouncer' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Bouncer Dashboard"
          >
            🛡️
          </button>
          <button
            onClick={() => setCurrentPage('admin')}
            className={`p-2 rounded-md text-xs transition-colors ${
              currentPage === 'admin' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Admin Dashboard"
          >
            👑
          </button>
          <button
            onClick={() => setCurrentPage('register')}
            className={`p-2 rounded-md text-xs transition-colors ${
              currentPage === 'register' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Register"
          >
            📝
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <AuthProvider>
      <div className="relative">
        {renderPage()}
        <NavigationOverlay />
      </div>
    </AuthProvider>
  )
}

export default App