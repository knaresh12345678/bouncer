import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast, { Toaster } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, Shield, Cpu, Zap } from 'lucide-react'
// Background is now set via backgroundImage style
import ForgotPasswordModal from '../components/ForgotPasswordModal'

interface FormData {
  email: string
  password: string
}

const UnifiedLogin: React.FC = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  // Redirect if already authenticated on component mount
  React.useEffect(() => {
    if (isAuthenticated) {
      // Get user role and redirect to appropriate dashboard
      const userRole = localStorage.getItem('bouncer_user_role') || 'user';
      redirectToDashboard(userRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, not on isAuthenticated changes

  const redirectToDashboard = (role: string) => {
    console.log('[FRONTEND] Redirecting user to dashboard based on role:', role);

    // Normalize role to lowercase to handle case variations
    const normalizedRole = role.toLowerCase().trim();
    console.log('[FRONTEND] Normalized role:', normalizedRole);

    // Navigate to the specific dashboard based on role
    const roleRoutes = {
      admin: '/admin',
      bouncer: '/bouncer',
      user: '/user'
    };

    const targetRoute = roleRoutes[normalizedRole as keyof typeof roleRoutes];

    if (!targetRoute) {
      console.error('[FRONTEND] Invalid account type found:', normalizedRole);
      console.error('[FRONTEND] Available roles:', Object.keys(roleRoutes));
      toast.error('Invalid account type. Please contact support.');
      return;
    }

    console.log(`[FRONTEND] Navigating ${normalizedRole} user to: ${targetRoute}`);
    navigate(targetRoute, { replace: true });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      // Attempt login without specifying role - backend will determine it
      const success = await login(formData.email, formData.password)

      if (success) {
        // Get user role from response or storage
        const userRole = localStorage.getItem('bouncer_user_role') || 'user'

        console.log('[FRONTEND] Login successful. User role:', userRole);

        // Show success message with role
        const roleMessages = {
          admin: '👑 Welcome back, Admin!',
          bouncer: '🛡️ Welcome back, Bouncer!',
          user: '👤 Welcome back, User!'
        }

        toast.success(roleMessages[userRole as keyof typeof roleMessages] || '✅ Login successful!', {
          duration: 2000
        })

        // Redirect immediately to the role-specific dashboard
        setTimeout(() => {
          redirectToDashboard(userRole)
        }, 500) // Reduced timeout for faster redirect
      } else {
        toast.error('❌ Invalid email or password')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.message?.includes('role')) {
        toast.error('⚠️ Account type mismatch')
      } else if (error.message?.includes('deactivated')) {
        toast.error('🚫 Account is deactivated')
      } else {
        toast.error('❌ Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleForgotPasswordSuccess = (email: string) => {
    // Navigate to reset password page with email parameter
    navigate(`/reset-password?email=${encodeURIComponent(email)}`)
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/login-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(26, 35, 50, 0.9)',
            color: '#fff',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#00ff88',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ff3366',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="flex items-center justify-end min-h-screen p-4 pr-8 md:pr-16 lg:pr-24">
        <div className="w-full max-w-md">
          {/* Futuristic login card */}
          <div className="glass-card p-8 electric-glow">
            {/* Animated circuit pattern overlay */}
            <div className="circuit-pattern absolute inset-0 opacity-10 rounded-2xl"></div>

            {/* Header with futuristic icon */}
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 mb-6 relative">
                {/* Rotating outer ring */}
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-spin-slow"></div>

                {/* Central icon container */}
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center neon-pulse">
                  <Shield className="w-10 h-10 text-white" />
                </div>

                {/* Floating accent elements */}
                <Cpu className="absolute -top-2 -right-2 w-6 h-6 text-cyan-400 animate-pulse" />
                <Zap className="absolute -bottom-2 -left-2 w-6 h-6 text-orange-400 animate-pulse animation-delay-1000" />
              </div>

              <h1 className="text-4xl font-bold mb-3 font-['Inter'] tracking-tight text-blue-600">
                MY BOUNCER
              </h1>
              <p className="text-gray-400 text-sm">
                Authenticate to access the Bouncer Network
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-cyan-400 mb-3 font-['Rajdhani'] tracking-wider">
                  MAIL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-cyan-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-futuristic w-full pl-12 pr-4 py-4"
                    placeholder="Enter your mail"
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-cyan-400 mb-3 font-['Rajdhani'] tracking-wider">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-cyan-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-futuristic w-full pl-12 pr-14 py-4"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-4 flex items-center text-cyan-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 bg-gray-800 border-cyan-500/30 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900"
                  />
                  <span className="ml-3 block text-sm text-gray-400 font-['Rajdhani']">STAY CONNECTED</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-cyan-400 hover:text-white transition-colors font-['Rajdhani'] tracking-wide"
                >
                  FORGOT PASSWORD
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-accent-futuristic w-full py-4 text-lg font-['Rajdhani'] font-bold tracking-wider relative overflow-hidden group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-futuristic w-6 h-6 mr-3"></div>
                    AUTHENTICATING...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Zap className="w-5 h-5 mr-2" />
                    LOGIN
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center relative z-10">
              <div className="glass-card p-4 border-cyan-500/20">
                <p className="text-sm text-gray-400 font-['Rajdhani']">
                  NEW USER?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="font-bold text-cyan-400 hover:text-white transition-colors tracking-wide ml-2"
                  >
                    REGISTER HERE →
                  </button>
                </p>
              </div>
            </div>

            {/* Security badges */}
            <div className="mt-6 flex justify-center space-x-4 relative z-10">
              <div className="flex items-center text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="font-['Rajdhani']">SECURE</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
                <span className="font-['Rajdhani']">ENCRYPTED</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
                <span className="font-['Rajdhani']">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={handleForgotPasswordSuccess}
      />
    </div>
  )
}

export default UnifiedLogin