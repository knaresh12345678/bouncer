import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast, { Toaster } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Shield, Zap, UserPlus, Phone } from 'lucide-react'
import FuturisticBackground from '../components/FuturisticBackground'

interface FormData {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  accountType: 'user' | 'bouncer'
  otp?: string
}

interface FormErrors {
  email?: string
  fullName?: string
  phoneNumber?: string
  password?: string
  confirmPassword?: string
  accountType?: string
  otp?: string
}

interface OtpState {
  isSent: boolean
  isVerified: boolean
  isLoading: boolean
  cooldown: number
  attempts: number
}

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    accountType: 'user',
    otp: ''
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [otpState, setOtpState] = useState<OtpState>({
    isSent: false,
    isVerified: false,
    isLoading: false,
    cooldown: 0,
    attempts: 0
  })

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate])

  // OTP cooldown timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpState.cooldown > 0) {
      interval = setInterval(() => {
        setOtpState(prev => ({
          ...prev,
          cooldown: prev.cooldown - 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpState.cooldown]);

  // Strict email validation function
  const validateEmail = (email: string): boolean => {
    // Enhanced regex pattern for stricter email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Additional validation to prevent invalid TLDs like .commmmm
    const parts = email.split('.');
    if (parts.length < 2) return false;

    // Check TLD length (between 2 and 6 characters)
    const tld = parts[parts.length - 1];
    if (tld.length < 2 || tld.length > 6) return false;

    // Check if TLD contains only letters
    if (!/^[a-zA-Z]+$/.test(tld)) return false;

    // Check domain part (between @ and .)
    const domainPart = email.substring(email.lastIndexOf('@') + 1, email.lastIndexOf('.'));
    if (!domainPart || domainPart.length < 2) return false;

    return emailRegex.test(email);
  };

  // Send OTP function
  const sendOtp = async () => {
    if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setOtpState(prev => ({ ...prev, isLoading: true }));

    const phoneNumber = formData.phoneNumber.replace(/\D/g, '');

    console.log('🚀 [FRONTEND] Sending OTP request...');
    console.log('   Phone Number:', phoneNumber);

    try {
      const response = await fetch('http://localhost:8000/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber
        })
      });

      const data = await response.json();

      console.log('📡 [FRONTEND] OTP API Response:', {
        status: response.status,
        data: data
      });

      if (response.ok && data.status === 'success') {
        // Store session ID for verification
        localStorage.setItem('otp_session_id', data.session_id);

        setOtpState(prev => ({
          ...prev,
          isSent: true,
          cooldown: 30,
          isLoading: false,
          attempts: 0
        }));

        // Show detailed success message
        const provider = data.provider || 'development';
        const maskedPhone = data.phone_number || phoneNumber.slice(-4).padStart(8, '*');

        toast.success(
          `📱 OTP sent successfully via ${provider}!`,
          {
            duration: 4000,
            position: 'top-center',
          }
        );

        console.log('✅ [FRONTEND] OTP sent successfully:', {
          session_id: data.session_id,
          provider: provider,
          phone: maskedPhone,
          expires_in: data.expires_in
        });

      } else {
        // Handle detailed error responses
        let errorMessage = 'Failed to send OTP';

        if (data.error) {
          errorMessage = data.error;
          console.error('❌ [FRONTEND] Backend error:', {
            error: data.error,
            code: data.code,
            provider_errors: data.provider_errors,
            details: data.details
          });
        } else {
          console.error('❌ [FRONTEND] Unknown error:', data);
        }

        toast.error(
          `❌ ${errorMessage}`,
          {
            duration: 5000,
            position: 'top-center',
          }
        );

        setOtpState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error: any) {
      console.error('💥 [FRONTEND] Network/Client error:', error);

      toast.error(
        '❌ Network error. Please check your connection and try again.',
        {
          duration: 5000,
          position: 'top-center',
        }
      );

      setOtpState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Verify OTP function
  const verifyOtp = async (otp: string) => {
    if (!otp || otp.length !== 6) {
      setFormErrors(prev => ({
        ...prev,
        otp: 'Please enter a 6-digit OTP'
      }));
      return;
    }

    setOtpState(prev => ({ ...prev, isLoading: true }));

    const phoneNumber = formData.phoneNumber.replace(/\D/g, '');
    const sessionId = localStorage.getItem('otp_session_id') || '';

    console.log('🔐 [FRONTEND] Verifying OTP...');
    console.log('   Phone Number:', phoneNumber);
    console.log('   OTP:', otp);
    console.log('   Session ID:', sessionId);

    try {
      const response = await fetch('http://localhost:8000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          otp: otp,
          session_id: sessionId
        })
      });

      const data = await response.json();

      console.log('📡 [FRONTEND] Verify OTP API Response:', {
        status: response.status,
        data: data
      });

      if (response.ok && data.status === 'success') {
        setOtpState(prev => ({
          ...prev,
          isVerified: true,
          isLoading: false,
          attempts: 0
        }));

        toast.success(
          '✅ Phone number verified successfully!',
          {
            duration: 3000,
            position: 'top-center',
          }
        );

        setFormErrors(prev => ({ ...prev, otp: undefined }));

        console.log('✅ [FRONTEND] OTP verification successful:', {
          phone: data.phone_number,
          attempts_used: data.attempts_used
        });

      } else {
        // Handle detailed error responses
        const newAttempts = otpState.attempts + 1;
        let errorMessage = 'Invalid OTP';
        let errorCode = 'INVALID_OTP';

        if (data.error) {
          errorMessage = data.error;
          errorCode = data.code;

          console.error('❌ [FRONTEND] Backend verification error:', {
            error: data.error,
            code: data.code,
            attempts_left: data.attempts_left,
            attempts_used: data.attempts_used,
            details: data.details
          });
        }

        setOtpState(prev => ({
          ...prev,
          isLoading: false,
          attempts: newAttempts
        }));

        // Handle specific error cases
        if (errorCode === 'MAX_ATTEMPTS_EXCEEDED') {
          toast.error(
            '❌ Too many attempts. Please request a new OTP.',
            {
              duration: 5000,
              position: 'top-center',
            }
          );

          setOtpState(prev => ({
            ...prev,
            isSent: false,
            isVerified: false
          }));

          setFormErrors(prev => ({
            ...prev,
            otp: '❌ Maximum attempts exceeded. Please request a new OTP.'
          }));

        } else if (errorCode === 'OTP_EXPIRED' || errorCode === 'SESSION_INVALID') {
          toast.error(
            '❌ OTP expired. Please request a new OTP.',
            {
              duration: 5000,
              position: 'top-center',
            }
          );

          setOtpState(prev => ({
            ...prev,
            isSent: false,
            isVerified: false
          }));

          setFormErrors(prev => ({
            ...prev,
            otp: '❌ OTP expired. Please request a new OTP.'
          }));

        } else {
          // General invalid OTP case
          const attemptsLeft = data.attempts_left || (3 - newAttempts);

          setFormErrors(prev => ({
            ...prev,
            otp: `❌ ${errorMessage}`
          }));

          if (newAttempts >= 3) {
            toast.error(
              '❌ Too many attempts. Please request a new OTP.',
              {
                duration: 5000,
                position: 'top-center',
              }
            );

            setOtpState(prev => ({
              ...prev,
              isSent: false,
              isVerified: false
            }));

          } else {
            toast.error(
              `❌ ${errorMessage}`,
              {
                duration: 3000,
                position: 'top-center',
              }
            );
          }
        }
      }
    } catch (error: any) {
      console.error('💥 [FRONTEND] Network/Client verification error:', error);

      setFormErrors(prev => ({
        ...prev,
        otp: '❌ Network error. Please try again.'
      }));

      setOtpState(prev => ({ ...prev, isLoading: false }));

      toast.error(
        '❌ Network error. Please check your connection and try again.',
        {
          duration: 5000,
          position: 'top-center',
        }
      );
    }
  };

  // Validate single field and update errors
  const validateField = (name: keyof FormData, value: string, currentFormData?: FormData): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Please enter your full name';
        return undefined;

      case 'email':
        if (!value.trim()) return 'Please enter your email';
        if (!validateEmail(value)) {
          console.log('Email validation failed for:', value);
          return 'Please enter a valid email address';
        }
        return undefined;

      case 'phoneNumber':
        // Phone number is now optional
        if (value.trim() && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          return 'Please enter a valid 10-digit phone number or leave empty';
        }
        return undefined;

      case 'otp':
        if (otpState.isSent && !otpState.isVerified && !value) {
          return 'Please enter the OTP sent to your phone';
        }
        if (value && value.length !== 6) {
          return 'OTP must be 6 digits';
        }
        return undefined;

      case 'password':
        if (!value) return 'Please enter a password';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return 'Password must contain uppercase, lowercase, and number';
        return undefined;

      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (currentFormData && value !== currentFormData.password) return 'Passwords do not match';
        return undefined;

      case 'accountType':
        if (!value) return 'Please select an account type';
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Validate each field
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof FormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });

    setFormErrors(errors);

    // Show toast for first error only
    if (!isValid) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
    }

    return isValid;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let processedValue = value

    // Format phone number input (only allow digits, max 10)
    if (name === 'phoneNumber') {
      // Remove all non-digit characters
      processedValue = value.replace(/\D/g, '').slice(0, 10)
    }

    // Format OTP input (only allow digits, max 6)
    if (name === 'otp') {
      processedValue = value.replace(/\D/g, '').slice(0, 6)
    }

    // Create updated form data first
    const updatedFormData = {
      ...formData,
      [name]: processedValue
    };

    setFormData(updatedFormData)

    // Validate field on change and clear error if valid
    const fieldName = name as keyof FormData;
    const error = validateField(fieldName, processedValue, updatedFormData);

    console.log(`Validating ${fieldName} with value "${processedValue}":`, error || 'valid');

    setFormErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    // Auto-verify OTP when 6 digits are entered
    if (name === 'otp' && processedValue.length === 6 && !otpState.isVerified) {
      verifyOtp(processedValue);
    }
  }

  // Check if form is valid for enabling/disabling submit button
  const isFormValid = (): boolean => {
    // Check if all required fields are filled (phone number is now optional)
    const allFieldsFilled =
      formData.fullName.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.confirmPassword &&
      formData.accountType;

    if (!allFieldsFilled) {
      console.log('Form not valid - missing required fields');
      return false;
    }

    // Check if there are any validation errors
    const hasErrors = Object.values(formErrors).some(error => error !== undefined);
    console.log('Form errors:', formErrors, 'Has errors:', hasErrors);
    return !hasErrors;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const loadingToast = toast.loading('Creating your account...');

      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || ''

      const success = await register({
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phoneNumber || '', // Send empty string if phone is not provided
        password: formData.password,
        userType: formData.accountType
      })

      toast.dismiss(loadingToast)

      if (success) {
        // Log phone verification status
        if (formData.phoneNumber.trim()) {
          console.log('Phone verification skipped — registration completed successfully with phone number.');
        } else {
          console.log('Phone verification skipped — registration completed successfully without phone number.');
        }

        toast.success(
          `🎉 Registration successful! Your ${formData.accountType} account has been created. Redirecting to login...`,
          {
            duration: 3000,
            position: 'top-center',
          }
        )

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error('Registration failed. Please try again.');
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-3xl">
          {/* Futuristic registration card with fade-in animation - wider rectangular layout */}
          <div className="glass-card p-10 electric-glow animate-fade-in">
            {/* Animated circuit pattern overlay */}
            <div className="circuit-pattern absolute inset-0 opacity-10 rounded-2xl"></div>

            {/* Header with futuristic icon */}
            <div className="text-center mb-10 relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 mb-6 relative">
                {/* Rotating outer ring */}
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-spin-slow"></div>

                {/* Central icon container */}
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center neon-pulse">
                  <UserPlus className="w-10 h-10 text-white" />
                </div>

                {/* Floating accent elements */}
                <User className="absolute -top-2 -right-2 w-6 h-6 text-orange-400 animate-pulse" />
                <Zap className="absolute -bottom-2 -left-2 w-6 h-6 text-yellow-400 animate-pulse animation-delay-1000" />
              </div>

              <h1 className="gradient-text text-4xl font-bold mb-3 font-['Orbitron'] tracking-wider">
                CREATE ACCOUNT
              </h1>
              <p className="text-gray-400 text-sm">
                Join the Bouncer Network today
              </p>
            </div>

            {/* Registration Form - Wider layout with two columns */}
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              {/* Two Column Layout for Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Full Name Field */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-cyan-400 mb-3 font-['Rajdhani'] tracking-wider">
                      FULL NAME
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-cyan-400" />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="input-futuristic w-full pl-12 pr-4 py-4"
                        placeholder="Enter your full name"
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-cyan-400 mb-3 font-['Rajdhani'] tracking-wider">
                      EMAIL ADDRESS
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
                        className={`input-futuristic w-full pl-12 pr-4 py-4 ${
                          formErrors.email
                            ? 'border-red-500 shadow-red-500/50 shadow-lg'
                            : 'border-cyan-500/20'
                        }`}
                        placeholder="Enter your email"
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          formErrors.email ? 'bg-red-400' : 'bg-green-400'
                        }`}></div>
                      </div>
                    </div>
                    {formErrors.email && (
                      <p className="mt-2 text-sm text-red-400 font-['Rajdhani'] flex items-center">
                        <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-cyan-400 mb-3 font-['Rajdhani'] tracking-wider">
                      PHONE NUMBER (Optional)
                    </label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-cyan-400" />
                        </div>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className={`input-futuristic w-full pl-12 pr-4 py-4 ${
                            formErrors.phoneNumber
                              ? 'border-red-500 shadow-red-500/50 shadow-lg'
                              : 'border-cyan-500/20'
                          }`}
                          placeholder="Enter your phone number (optional)"
                          maxLength={10}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${
                            formErrors.phoneNumber ? 'bg-red-400' : 'bg-yellow-400'
                          }`}></div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={
                          otpState.isLoading ||
                          otpState.cooldown > 0 ||
                          !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))
                        }
                        className={`px-6 py-4 rounded-lg font-['Rajdhani'] font-bold tracking-wider transition-all duration-300 relative overflow-hidden group ${
                          otpState.isLoading || otpState.cooldown > 0
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg hover:shadow-cyan-500/25'
                        }`}
                      >
                        {otpState.isLoading ? (
                          <div className="flex items-center">
                            <div className="spinner-futuristic w-4 h-4 mr-2"></div>
                            SENDING...
                          </div>
                        ) : otpState.cooldown > 0 ? (
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            {otpState.cooldown}s
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            SEND OTP
                          </div>
                        )}
                      </button>
                    </div>
                    {formErrors.phoneNumber && (
                      <p className="mt-2 text-sm text-red-400 font-['Rajdhani'] flex items-center">
                        <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                        {formErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* OTP Verification Field */}
                  {otpState.isSent && (
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-cyan-400 mb-3 font-['Rajdhani'] tracking-wider">
                        ENTER OTP
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-cyan-400" />
                        </div>
                        <input
                          type="text"
                          id="otp"
                          name="otp"
                          value={formData.otp || ''}
                          onChange={handleInputChange}
                          className={`input-futuristic w-full pl-12 pr-4 py-4 ${
                            formErrors.otp
                              ? 'border-red-500 shadow-red-500/50 shadow-lg'
                              : otpState.isVerified
                              ? 'border-green-500 shadow-green-500/50 shadow-lg'
                              : 'border-cyan-500/20'
                          }`}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          required
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          {otpState.isLoading ? (
                            <div className="spinner-futuristic w-4 h-4"></div>
                          ) : otpState.isVerified ? (
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          ) : formErrors.otp ? (
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          ) : (
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                      {formErrors.otp ? (
                        <p className="mt-2 text-sm text-red-400 font-['Rajdhani'] flex items-center">
                          <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                          {formErrors.otp}
                        </p>
                      ) : otpState.isVerified ? (
                        <p className="mt-2 text-sm text-green-400 font-['Rajdhani'] flex items-center">
                          <span className="w-1 h-1 bg-green-400 rounded-full mr-2"></span>
                          ✅ Verified Successfully
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-gray-400 font-['Rajdhani'] flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          Enter the 6-digit code sent to your phone
                        </p>
                      )}
                    </div>
                  )}

                  {/* Account Type Field */}
                  <div>
                    <label htmlFor="accountType" className="block text-sm font-medium text-cyan-400 mb-3 font-['Rajdhani'] tracking-wider">
                      ACCOUNT TYPE
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-cyan-400" />
                      </div>
                      <select
                        id="accountType"
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleInputChange}
                        className="input-futuristic w-full pl-12 pr-4 py-4 appearance-none cursor-pointer"
                        required
                      >
                        <option value="user">👤 Customer - Book security services</option>
                        <option value="bouncer">🛡️ Security Professional - Provide services</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
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
                        placeholder="Create a strong password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-cyan-400 mb-3 font-['Rajdhani'] tracking-wider">
                      CONFIRM PASSWORD
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-cyan-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="input-futuristic w-full pl-12 pr-14 py-4"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-4 flex items-center text-cyan-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Security Info Box */}
                  <div className="glass-card p-6 border-cyan-500/20">
                    <h3 className="text-cyan-400 font-semibold mb-3 font-['Rajdhani'] tracking-wide">
                      🔒 SECURITY REQUIREMENTS
                    </h3>
                    <ul className="text-gray-400 text-sm space-y-2 font-['Rajdhani']">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                        Password must be at least 8 characters
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                        Include uppercase, lowercase, and numbers
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-orange-400 rounded-full mr-3 animate-pulse"></span>
                        Phone number is optional (OTP temporarily disabled)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button - Full width across columns */}
              <div className="lg:col-span-2">
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  className={`btn-accent-registration w-full py-5 text-lg font-['Rajdhani'] font-bold tracking-wider relative overflow-hidden group ${
                    !isFormValid() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner-futuristic w-6 h-6 mr-3"></div>
                      CREATING ACCOUNT...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus className="w-5 h-5 mr-3" />
                      CREATE ACCOUNT
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                  )}
                </button>
              </div>
            </form>

            {/* Login Link and Security Badges */}
            <div className="lg:col-span-2">
              {/* Login Link */}
              <div className="mt-10 text-center relative z-10">
                <div className="glass-card p-4 border-cyan-500/20 inline-block">
                  <p className="text-sm text-gray-400 font-['Rajdhani']">
                    ALREADY HAVE AN ACCOUNT?{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="font-bold text-cyan-400 hover:text-white transition-colors tracking-wide ml-2"
                    >
                      LOGIN HERE →
                    </button>
                  </p>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-8 flex justify-center space-x-6 lg:space-x-8 relative z-10">
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
      </div>
    </FuturisticBackground>
  )
}

export default RegistrationPage