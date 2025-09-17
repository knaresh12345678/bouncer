import React, { useState } from 'react';
import { useAuth, UserType } from '../contexts/AuthContext';

interface RoleBasedLoginProps {
  userType: UserType;
  onBack: () => void;
  onLoginSuccess: (userType: UserType) => void;
  onRegisterClick?: () => void;
}

const RoleBasedLogin: React.FC<RoleBasedLoginProps> = ({ userType, onBack, onLoginSuccess, onRegisterClick }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Validate input fields
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Attempt login using auth context
      const loginSuccess = await login(email, password, userType);

      if (loginSuccess) {
        // Success - show message and redirect
        const userTypeCapitalized = userType.charAt(0).toUpperCase() + userType.slice(1);
        setSuccessMessage(`${userTypeCapitalized} login successful! Redirecting...`);

        setTimeout(() => {
          onLoginSuccess(userType);
        }, 1000);
      } else {
        setError('Invalid email or password. Please check your credentials and try again.');
      }

    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getThemeConfig = () => {
    switch (userType) {
      case 'admin':
        return {
          gradient: 'from-slate-800 via-slate-700 to-slate-900',
          accent: 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500',
          icon: '👑',
          title: 'Admin Login',
          subtitle: 'System Administration Portal',
          inputFocus: 'focus:ring-slate-500 focus:border-slate-500',
          linkColor: 'text-slate-600 hover:text-slate-500',
          demoEmail: 'admin@secureguard.com',
          demoPassword: 'admin123'
        };
      case 'user':
        return {
          gradient: 'from-blue-800 via-blue-700 to-blue-900',
          accent: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          icon: '👤',
          title: 'User Login',
          subtitle: 'Customer Portal',
          inputFocus: 'focus:ring-blue-500 focus:border-blue-500',
          linkColor: 'text-blue-600 hover:text-blue-500',
          demoEmail: 'user@secureguard.com',
          demoPassword: 'user123'
        };
      case 'bouncer':
        return {
          gradient: 'from-emerald-800 via-emerald-700 to-emerald-900',
          accent: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
          icon: '🛡️',
          title: 'Bouncer Login',
          subtitle: 'Security Professional Portal',
          inputFocus: 'focus:ring-emerald-500 focus:border-emerald-500',
          linkColor: 'text-emerald-600 hover:text-emerald-500',
          demoEmail: 'bouncer@secureguard.com',
          demoPassword: 'bouncer123'
        };
      default:
        return {
          gradient: 'from-blue-800 via-blue-700 to-blue-900',
          accent: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          icon: '🛡️',
          title: 'Login',
          subtitle: 'Portal',
          inputFocus: 'focus:ring-blue-500 focus:border-blue-500',
          linkColor: 'text-blue-600 hover:text-blue-500',
          demoEmail: 'user@secureguard.com',
          demoPassword: 'user123'
        };
    }
  };

  const theme = getThemeConfig();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Back Button */}
        <div className="text-left">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to selection</span>
          </button>
        </div>

        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl mb-6">
            <span className="text-4xl">{theme.icon}</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {theme.title}
          </h2>
          <p className="text-white/70 text-sm mb-4">
            {theme.subtitle}
          </p>
          <div className="inline-block px-4 py-2 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
            SecureGuard Platform
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm py-10 px-8 shadow-2xl rounded-3xl border border-white/20">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 text-sm font-medium">{successMessage}</span>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 ${theme.inputFocus} transition-all duration-200 bg-gray-50/50`}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 ${theme.inputFocus} transition-all duration-200 bg-gray-50/50`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.5 7.5m4.242 4.242L15 15" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`h-4 w-4 ${theme.inputFocus.replace('focus:', '')} border-gray-300 rounded`}
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className={`font-medium ${theme.linkColor} transition-colors`}>
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white ${theme.accent} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>Sign in to {userType.charAt(0).toUpperCase() + userType.slice(1)} Portal</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center mb-4">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Demo Credentials
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-2">
                  {userType.charAt(0).toUpperCase() + userType.slice(1)} Account
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>📧 {theme.demoEmail}</div>
                  <div>🔑 {theme.demoPassword}</div>
                </div>
              </div>
            </div>

            {/* Register Link */}
            {onRegisterClick && (
              <div className="border-t border-gray-200 pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Don't have an account?
                  </p>
                  <button
                    onClick={onRegisterClick}
                    className={`inline-flex items-center space-x-2 ${theme.linkColor} hover:underline font-medium text-sm transition-colors`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Register New Account</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Security Badge */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-white/80 text-xs font-medium">SSL Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedLogin;