import React from 'react';
import backgroundImage from '../assets/background.png';

interface FuturisticBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const FuturisticBackground: React.FC<FuturisticBackgroundProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Subtle animated grid pattern overlay */}
      <div className="absolute inset-0 opacity-20 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-600/5"></div>
      </div>

      {/* Floating geometric elements */}
      <div className="absolute top-20 left-20 w-64 h-64 futuristic-float">
        <div className="w-full h-full border-2 border-cyan-500/20 rounded-full animate-pulse"></div>
      </div>

      <div className="absolute bottom-20 right-20 w-96 h-96 futuristic-float animation-delay-2000">
        <div className="w-full h-full border-2 border-blue-500/20 rounded-lg rotate-45 animate-pulse"></div>
      </div>

      {/* Circuit lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10 z-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0066ff" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Circuit path lines */}
        <path d="M 100 100 L 300 100 L 300 200 L 500 200"
              stroke="url(#circuitGradient)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse" />

        <path d="M 600 50 L 600 150 L 400 150 L 400 300"
              stroke="url(#circuitGradient)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse animation-delay-1000" />

        <circle cx="100" cy="100" r="4" fill="#00d4ff" className="animate-pulse" />
        <circle cx="300" cy="100" r="4" fill="#00d4ff" className="animate-pulse animation-delay-500" />
        <circle cx="300" cy="200" r="4" fill="#00d4ff" className="animate-pulse animation-delay-1000" />
        <circle cx="500" cy="200" r="4" fill="#00d4ff" className="animate-pulse animation-delay-1500" />
        <circle cx="600" cy="50" r="4" fill="#0066ff" className="animate-pulse animation-delay-2000" />
        <circle cx="600" cy="150" r="4" fill="#0066ff" className="animate-pulse animation-delay-2500" />
        <circle cx="400" cy="150" r="4" fill="#0066ff" className="animate-pulse animation-delay-3000" />
        <circle cx="400" cy="300" r="4" fill="#0066ff" className="animate-pulse animation-delay-3500" />
      </svg>

      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent z-10"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/20 to-transparent z-10"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/20 to-transparent z-10"></div>

      {/* Main content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export default FuturisticBackground;