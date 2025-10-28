import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        {/* Futuristic loading container */}
        <div className="glass-card p-12 max-w-sm mx-auto">
          {/* Animated circuit pattern */}
          <div className="circuit-pattern absolute inset-0 opacity-20 rounded-2xl"></div>

          {/* Central loading animation */}
          <div className="relative z-10">
            <div className="relative mx-auto mb-8">
              {/* Outer rotating ring */}
              <div className="spinner-futuristic absolute inset-0"></div>

              {/* Inner glow circle */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full neon-pulse"></div>

              {/* Pulsing rings */}
              <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping animation-delay-200"></div>
            </div>

            {/* Loading text with gradient */}
            <h2 className="gradient-text text-2xl font-bold mb-2 font-['Orbitron']">
              INITIALIZING
            </h2>
            <p className="text-gray-400 text-sm animate-pulse">
              Connecting to secure network...
            </p>

            {/* Progress indicators */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="text-xs text-gray-500">System check</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse animation-delay-200"></div>
                <div className="text-xs text-gray-500">Authentication</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-400"></div>
                <div className="text-xs text-gray-500">Loading interface</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;