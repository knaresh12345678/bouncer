import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Award,
  HeadphonesIcon,
  Target,
  Zap
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-['Inter']">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-800 p-2 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">SecureGuard</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-200">
                Home
              </a>
              <a href="#services" className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-200">
                Services
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-200">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-800 font-medium transition-colors duration-200">
                Contact
              </a>
              <Link
                to="/login"
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Sign In
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-700 p-2 rounded-lg hover:bg-gray-100">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Elite Security
                  <span className="text-blue-700 block">Solutions</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Connect with verified professionals for premium security services – from personal protection to event security.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-lg inline-flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200">
                  Watch Demo
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-700" />
                  <span className="text-sm font-medium text-gray-700">500+ Clients</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">Industry Leader</span>
                </div>
              </div>
            </div>

            {/* Right side - Image/Illustration Placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <Shield className="h-20 w-20 text-white" />
                    <div className="text-right">
                      <div className="text-white/80 text-sm">Security Level</div>
                      <div className="text-white text-3xl font-bold">Premium</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-lg">Background Verified</span>
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-lg">Licensed Professional</span>
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-lg">24/7 Available</span>
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-yellow-400 text-black p-4 rounded-full shadow-lg animate-bounce">
                <Zap className="h-8 w-8" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-full shadow-lg">
                <Star className="h-8 w-8 text-yellow-400 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Why Choose SecureGuard?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide world-class security services with unmatched reliability and professionalism.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-blue-700 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Verified Pros</h4>
              <p className="text-gray-600 leading-relaxed">
                All our security professionals are thoroughly vetted and certified for your peace of mind.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-2xl border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-yellow-400 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-10 w-10 text-black" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">24/7</h3>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Support</h4>
              <p className="text-gray-600 leading-relaxed">
                Round-the-clock availability and support for all your security needs, any time of day.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-green-600 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">99.9%</h3>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Success Rate</h4>
              <p className="text-gray-600 leading-relaxed">
                Proven track record of successful security operations with exceptional client satisfaction.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-purple-600 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <HeadphonesIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Live</h3>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Monitoring</h4>
              <p className="text-gray-600 leading-relaxed">
                Real-time tracking and communication throughout your security service engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badge Section */}
      <section className="py-16 bg-gradient-to-r from-blue-700 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-6">
                <Award className="h-16 w-16 text-yellow-400" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Trusted by 500+ Clients Worldwide
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust SecureGuard for their security needs across the globe.
              </p>
            </div>
            <div className="flex justify-center items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2 text-white">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
                <span className="text-lg font-semibold">4.9/5 Rating</span>
              </div>
              <div className="h-8 w-px bg-white/30"></div>
              <div className="flex items-center space-x-2 text-white">
                <Users className="h-6 w-6 text-blue-300" />
                <span className="text-lg font-semibold">500+ Happy Clients</span>
              </div>
              <div className="h-8 w-px bg-white/30"></div>
              <div className="flex items-center space-x-2 text-white">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span className="text-lg font-semibold">100% Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Ready to Secure Your Next Event?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied clients who trust SecureGuard for their security needs. Get started in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-lg inline-flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-700 p-2 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">SecureGuard</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Premium security services for events, businesses, and personal protection worldwide.
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Event Security</span></li>
                <li><span className="text-gray-400">Personal Protection</span></li>
                <li><span className="text-gray-400">Corporate Security</span></li>
                <li><span className="text-gray-400">Crowd Control</span></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">info@secureguard.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">123 Security St, City, State</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 SecureGuard. All rights reserved. | Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;