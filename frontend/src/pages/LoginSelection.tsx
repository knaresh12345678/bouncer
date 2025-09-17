import React from 'react';

interface LoginSelectionProps {
  onSelectUserType: (userType: 'admin' | 'user' | 'bouncer') => void;
  onRegisterClick?: () => void;
}

const LoginSelection: React.FC<LoginSelectionProps> = ({ onSelectUserType, onRegisterClick }) => {
  const loginTypes = [
    {
      type: 'admin' as const,
      title: 'Admin Portal',
      subtitle: 'System Administration',
      description: 'Manage users, bouncers, bookings and oversee all operations',
      icon: '👑',
      gradient: 'from-slate-700 to-slate-900',
      hoverGradient: 'hover:from-slate-600 hover:to-slate-800',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700'
    },
    {
      type: 'user' as const,
      title: 'User Portal',
      subtitle: 'Book Security Services',
      description: 'Find and book verified security professionals for your events',
      icon: '👤',
      gradient: 'from-blue-700 to-blue-900',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-800',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700'
    },
    {
      type: 'bouncer' as const,
      title: 'Bouncer Portal',
      subtitle: 'Security Professional',
      description: 'Manage your bookings, availability and earnings dashboard',
      icon: '🛡️',
      gradient: 'from-emerald-700 to-emerald-900',
      hoverGradient: 'hover:from-emerald-600 hover:to-emerald-800',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{
      backgroundColor: '#450B36'
    }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #2563eb 2px, transparent 2px), radial-gradient(circle at 75% 75%, #2563eb 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          {/* Logo */}
          <div className="mx-auto h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-gray-200 mb-8">
            <div className="bg-blue-700 p-3 rounded-2xl">
              <span className="text-white text-2xl">🛡️</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to SecureGuard
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Professional Security Services Platform
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Choose your portal to access your personalized dashboard and manage your security needs
          </p>
        </div>

        {/* Login Type Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {loginTypes.map((loginType) => (
            <div
              key={loginType.type}
              onClick={() => onSelectUserType(loginType.type)}
              className="group relative cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
            >
              {/* Card */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden h-full hover:shadow-2xl transition-all duration-300">
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${loginType.gradient} ${loginType.hoverGradient} p-6 text-white relative overflow-hidden transition-all duration-300`}>
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>

                  {/* Icon */}
                  <div className={`${loginType.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <span className={`text-3xl ${loginType.iconColor}`}>{loginType.icon}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-1">{loginType.title}</h3>
                  <p className="text-white/80 font-medium">{loginType.subtitle}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {loginType.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {loginType.type === 'admin' && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">User Management</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">System Analytics</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Reports & Insights</span>
                        </div>
                      </>
                    )}
                    {loginType.type === 'user' && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Book Security Services</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Track Bookings</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Rate & Review</span>
                        </div>
                      </>
                    )}
                    {loginType.type === 'bouncer' && (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Manage Schedule</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Accept Bookings</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Track Earnings</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Button */}
                  <button className={`w-full bg-gradient-to-r ${loginType.gradient} ${loginType.hoverGradient} text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 group-hover:shadow-lg transform group-hover:scale-[1.02]`}>
                    <span className="flex items-center justify-center space-x-2">
                      <span>Continue as {loginType.title.split(' ')[0]}</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${loginType.gradient} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-300 -z-10 blur-xl`}></div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pt-8">
          <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 shadow-sm">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm font-medium">Secure & Encrypted Platform</span>
          </div>
        </div>

        {/* Register New Account */}
        {onRegisterClick && (
          <div className="text-center">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
              <p className="text-gray-600 mb-4">
                Don't have an account with us yet?
              </p>
              <button
                onClick={onRegisterClick}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Register New Account</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@secureguard.com" className="text-blue-600 hover:text-blue-500 font-medium">
              support@secureguard.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;