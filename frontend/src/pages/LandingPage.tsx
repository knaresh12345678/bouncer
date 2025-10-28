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
  Zap,
  HeadphonesIcon
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">SecureGuard</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </a>
              <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Services
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Contact
              </a>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Sign In
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-700 p-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Elite Security
                  <span className="text-blue-600 block">Solutions</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Connect with verified professionals for premium security services – from personal protection to event security.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 rounded-lg inline-flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200">
                  Watch Demo
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-700">4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">500+ Clients</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">Industry Leader</span>
                </div>
              </div>
            </div>

            {/* Right side - Image/Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Shield className="h-16 w-16 text-white" />
                    <div className="text-right">
                      <div className="text-white/80 text-sm">Security Level</div>
                      <div className="text-white text-2xl font-bold">Premium</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-white">
                      <span>Background Verified</span>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span>Licensed Professional</span>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span>24/7 Available</span>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-yellow-500 text-black p-3 rounded-full shadow-lg">
                <Zap className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-full shadow-lg">
                <Star className="h-6 w-6 text-yellow-500 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Why Choose SecureGuard?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide world-class security services with unmatched reliability and professionalism.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-200 group">
              <div className="bg-blue-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">500+</h3>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Verified Pros</h4>
              <p className="text-gray-600">
                All our security professionals are thoroughly vetted and certified.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-2xl border border-yellow-100 hover:shadow-lg transition-all duration-200 group">
              <div className="bg-yellow-500 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">24/7</h3>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Support</h4>
              <p className="text-gray-600">
                Round-the-clock availability for all your security needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-200 group">
              <div className="bg-green-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">99.9%</h3>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Success Rate</h4>
              <p className="text-gray-600">
                Proven track record of successful security operations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-200 group">
              <div className="bg-purple-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <HeadphonesIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Live</h3>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Monitoring</h4>
              <p className="text-gray-600">
                Real-time tracking and communication throughout service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Trusted Worldwide</h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied clients who trust us with their security needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "SecureGuard provided exceptional security for our corporate event. Professional, reliable, and discreet."
              </p>
              <div className="flex items-center">
                <div className="bg-blue-600 p-2 rounded-full text-white font-bold mr-3">
                  JS
                </div>
                <div>
                  <div className="font-semibold text-gray-900">John Smith</div>
                  <div className="text-gray-500 text-sm">CEO, TechCorp</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Outstanding service! The security team was professional and made our wedding day feel completely safe."
              </p>
              <div className="flex items-center">
                <div className="bg-pink-500 p-2 rounded-full text-white font-bold mr-3">
                  MJ
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Maria Johnson</div>
                  <div className="text-gray-500 text-sm">Event Organizer</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Highly recommend! Quick response time and the security personnel were top-notch professionals."
              </p>
              <div className="flex items-center">
                <div className="bg-green-600 p-2 rounded-full text-white font-bold mr-3">
                  RW
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Robert Wilson</div>
                  <div className="text-gray-500 text-sm">Business Owner</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-8">Trusted by 500+ clients worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="bg-gray-200 px-6 py-3 rounded-lg">
                <span className="font-semibold text-gray-700">Fortune 500</span>
              </div>
              <div className="bg-gray-200 px-6 py-3 rounded-lg">
                <span className="font-semibold text-gray-700">Global Events</span>
              </div>
              <div className="bg-gray-200 px-6 py-3 rounded-lg">
                <span className="font-semibold text-gray-700">Private Clients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Secure Your Next Event?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who trust SecureGuard for their security needs. Get started in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 rounded-lg inline-flex items-center justify-center transition-all duration-200 transform hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-lg transition-all duration-200">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">SecureGuard</span>
              </div>
              <p className="text-gray-400">
                Premium security services for events, businesses, and personal protection.
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