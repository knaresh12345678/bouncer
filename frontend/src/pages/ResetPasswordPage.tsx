import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'
import FuturisticBackground from '../components/FuturisticBackground'

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailFromParams = searchParams.get('email') || ''

  const [formData, setFormData] = useState({
    email: emailFromParams,
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!emailFromParams) {
      toast.error('No email provided. Please start the password reset process again.')
      navigate('/login')
    }
  }, [emailFromParams, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'otp') {
      // Only allow 6 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 6)
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.otp || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields')
      return false
    }

    if (formData.otp.length !== 6) {
      toast.error('OTP must be exactly 6 digits')
      return false
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const formPayload = new FormData()
      formPayload.append('email', formData.email)
      formPayload.append('otp', formData.otp)
      formPayload.append('new_password', formData.newPassword)
      formPayload.append('confirm_password', formData.confirmPassword)

      const response = await axios.post('/auth/verify-reset-otp', formPayload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (response.status === 200) {
        setIsSuccess(true)
        toast.success('🎉 Password reset successfully! Please login again.')

        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (error: any) {
      console.error('Reset password error:', error)

      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.detail || 'Invalid request'

        if (errorMessage.includes('Invalid or expired OTP')) {
          toast.error('❌ Invalid or expired OTP. Please try again.')
        } else if (errorMessage.includes('Passwords do not match')) {
          toast.error('❌ Passwords do not match')
        } else if (errorMessage.includes('Password must be at least')) {
          toast.error('❌ Password must be at least 6 characters long')
        } else {
          toast.error(`❌ ${errorMessage}`)
        }
      } else if (error.response?.status === 500) {
        toast.error('❌ Server error. Please try again later.')
      } else {
        toast.error('❌ Network error. Please check your connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  const handleResendOTP = async () => {
    try {
      const formPayload = new FormData()
      formPayload.append('email', formData.email)

      const response = await axios.post('/auth/send-reset-otp', formPayload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (response.status === 200) {
        toast.success('✅ New OTP sent to your email!')

        // Show development OTP if available
        if (response.data.development_otp) {
          toast(`🔢 New OTP: ${response.data.development_otp}`, {
            duration: 10000,
          })
        }
      }
    } catch (error: any) {
      toast.error('❌ Failed to resend OTP. Please try again.')
    }
  }

  if (isSuccess) {
    return (
      <FuturisticBackground>
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
              iconTheme: {
                primary: '#00ff88',
                secondary: '#fff',
              },
            },
          }}
        />

        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            <div className="glass-card p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">
                Password Reset Successful!
              </h1>

              <p className="text-gray-400 mb-8">
                Your password has been successfully reset. You will be redirected to the login page in a few seconds.
              </p>

              <div className="space-y-4">
                <div className="w-16 h-1 bg-green-500 rounded-full mx-auto animate-pulse"></div>
                <p className="text-sm text-gray-500">
                  Redirecting automatically...
                </p>
              </div>
            </div>
          </div>
        </div>
      </FuturisticBackground>
    )
  }

  return (
    <FuturisticBackground>
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
            iconTheme: {
              primary: '#00ff88',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff3366',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button
            onClick={handleBackToLogin}
            className="flex items-center text-cyan-400 hover:text-white transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </button>

          {/* Reset Password Card */}
          <div className="glass-card p-8 electric-glow">
            {/* Animated circuit pattern overlay */}
            <div className="circuit-pattern absolute inset-0 opacity-10 rounded-2xl"></div>

            {/* Header */}
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 relative">
                {/* Rotating outer ring */}
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-spin-slow"></div>

                {/* Central icon container */}
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center neon-pulse">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>

              <h1 className="gradient-text text-3xl font-bold mb-3 font-['Orbitron'] tracking-wider">
                RESET PASSWORD
              </h1>
              <p className="text-gray-400 text-sm">
                Enter the OTP sent to your email and create a new password
              </p>
              <p className="text-cyan-400 text-xs mt-2">
                Email: {formData.email}
              </p>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Email Field (Readonly) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-cyan-400 mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="input-futuristic w-full px-4 py-4 bg-gray-800/50 cursor-not-allowed"
                  placeholder="Email address"
                />
              </div>

              {/* OTP Field */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-cyan-400 mb-3">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="input-futuristic w-full px-4 py-4 text-center text-2xl font-mono letter-spacing-2"
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={isLoading}
                  />
                  {formData.otp.length === 6 && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-xs text-cyan-400 hover:text-white transition-colors"
                  >
                    Didn't receive code? Resend OTP
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-cyan-400 mb-3">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="input-futuristic w-full px-4 pr-12 py-4"
                    placeholder="Enter new password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-4 flex items-center text-cyan-400 hover:text-white transition-colors"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-cyan-400 mb-3">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-futuristic w-full px-4 pr-12 py-4"
                    placeholder="Confirm new password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-4 flex items-center text-cyan-400 hover:text-white transition-colors"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-accent-futuristic w-full py-4 text-lg font-bold relative overflow-hidden group disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-futuristic w-6 h-6 mr-3"></div>
                    Resetting Password...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Confirm Reset
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </FuturisticBackground>
  )
}

export default ResetPasswordPage