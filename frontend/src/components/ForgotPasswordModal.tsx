import React, { useState } from 'react'
import { X, Mail, ArrowRight } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (email: string) => void
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('email', email)

      const response = await axios.post('/auth/send-reset-otp', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (response.status === 200) {
        toast.success('✅ OTP sent to your email! Please check your inbox.')

        // In development mode, show the OTP for testing
        if (response.data.development_otp) {
          console.log(`Development OTP for ${email}: ${response.data.development_otp}`)
          toast(`🔢 Development OTP: ${response.data.development_otp}`, {
            duration: 10000,
            style: {
              background: 'rgba(26, 35, 50, 0.9)',
              color: '#fff',
              border: '1px solid rgba(0, 212, 255, 0.3)',
            },
          })
        }

        setTimeout(() => {
          onSuccess(email)
          onClose()
        }, 1500)
      }
    } catch (error: any) {
      console.error('Send OTP error:', error)

      if (error.response?.status === 404) {
        toast.error('❌ No account found with this email address')
      } else if (error.response?.status === 500) {
        toast.error('❌ Failed to send OTP. Please try again.')
      } else {
        toast.error('❌ Network error. Please check your connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setEmail('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-card w-full max-w-md relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Reset Password
              </h2>
              <p className="text-gray-400">
                Enter your registered email address and we'll send you a verification code
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-cyan-400 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-cyan-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-futuristic w-full pl-12 pr-4 py-4"
                    placeholder="Enter your registered email"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="btn-accent-futuristic w-full py-4 font-bold relative overflow-hidden group disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-futuristic w-5 h-5 mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Send Reset Link
                    <ArrowRight className="w-5 h-5 ml-2" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                )}
              </button>
            </form>

            {/* Cancel button */}
            <div className="mt-6 text-center">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-white transition-colors text-sm disabled:opacity-50"
              >
                Cancel, I remember my password
              </button>
            </div>
          </div>
        </div>
      </div>

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
    </>
  )
}

export default ForgotPasswordModal