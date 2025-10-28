import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserType } from '../contexts/AuthContext';
import { Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface UserLoginPageProps {
  userType?: UserType;
}

const UserLoginPage: React.FC<UserLoginPageProps> = ({ userType = 'user' }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password, userType);

      if (success) {
        // Navigate based on user type
        switch (userType) {
          case 'admin':
            navigate('/admin');
            break;
          case 'bouncer':
            navigate('/bouncer');
            break;
          case 'user':
          default:
            navigate('/dashboard');
            break;
        }
      } else {
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Use the specific error message from the backend if available
      if (error.message) {
        setError(error.message);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const getUserTypeInfo = () => {
    switch (userType) {
      case 'admin':
        return {
          title: 'Admin Login',
          subtitle: 'Access the admin dashboard',
          gradient: 'from-slate-700 to-slate-900',
          buttonColor: 'bg-slate-600 hover:bg-slate-700',
        };
      case 'bouncer':
        return {
          title: 'Bouncer Login',
          subtitle: 'Access your professional dashboard',
          gradient: 'from-emerald-700 to-emerald-900',
          buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
        };
      case 'user':
      default:
        return {
          title: 'User Login',
          subtitle: 'Access your booking dashboard',
          gradient: 'from-blue-700 to-blue-900',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const userTypeInfo = getUserTypeInfo();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-xl flex items-center justify-center shadow-lg" style={{backgroundColor: '#2563EB'}}>
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold" style={{color: '#1E293B'}}>
            {userTypeInfo.title}
          </h2>
          <p className="mt-2 text-sm" style={{color: '#475569'}}>
            {userTypeInfo.subtitle}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="rounded-lg p-4" style={{backgroundColor: '#FEE2E2', border: '1px solid #FECACA'}}>
                <p className="text-sm" style={{color: '#DC2626'}}>{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{color: '#1E293B'}}>
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{color: '#1E293B'}}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] ${userTypeInfo.buttonColor}`}
                style={{backgroundColor: isLoading ? '#9CA3AF' : '#2563EB'}}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Login as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Navigation Links */}
        <div className="text-center space-y-4">
          <p className="text-sm" style={{color: '#475569'}}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium transition-colors"
              style={{color: '#2563EB'}}
            >
              Sign up here
            </Link>
          </p>

          <div>
            <Link
              to="/"
              className="inline-flex items-center text-sm transition-colors"
              style={{color: '#475569'}}
            >
              ← Back to portal selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginPage;