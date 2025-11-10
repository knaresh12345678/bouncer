import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking, Bouncer, BookingRequest } from '../contexts/BookingContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, User, Settings, Bell } from 'lucide-react';
import PostRequestModal from '../components/PostRequestModal';

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { getAvailableBouncers, createBookingRequest, makeBooking, getUserBookings } = useBooking();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPostRequestModal, setShowPostRequestModal] = useState(false);
  const [showStartBookingModal, setShowStartBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState<'individual' | 'group' | null>(null);
  const [selectedBouncers, setSelectedBouncers] = useState<Bouncer[]>([]);

  
  // Helper function to get full name
  const getFullName = () => {
    if (!user) return 'User';
    return `${user.first_name} ${user.last_name}`.trim();
  };

  // Handle Post Request modal submission
  const handlePostRequestSubmit = async (formData: any) => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('bouncer_access_token');
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    // Submit to backend API
    const response = await axios.post('/bookings/', {
      eventName: formData.eventName,
      location: formData.location,
      date: formData.date,
      time: formData.time,
      price: Number(formData.price),
      description: formData.description,
      bookType: formData.bookType || 'individual',
      memberCount: formData.memberCount ? Number(formData.memberCount) : null
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200 || response.status === 201) {
      // Update local context for immediate UI updates
      await createBookingRequest({
        eventName: formData.eventName,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        price: Number(formData.price),
        userId: user?.id || '',
        description: formData.description
      });

      // Show success message
      alert('Bouncer request posted successfully!');
    }
  };

  // Handle modal close
  const handleClosePostRequestModal = () => {
    setShowPostRequestModal(false);
  };

  // Helper function to get initials
  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    // The ProtectedRoute will automatically redirect to login
  };

  // State for dynamic data
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [availableProfessionals, setAvailableProfessionals] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);

  // State for service profiles (bouncer profiles from database)
  const [individualProfiles, setIndividualProfiles] = useState<any[]>([]);
  const [groupProfiles, setGroupProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // Data fetching functions
  const fetchRecentBookings = async () => {
    if (!user?.id) return;

    setIsLoadingBookings(true);
    try {
      const token = localStorage.getItem('bouncer_access_token');
      if (!token) return;

      // TODO: Replace with actual API endpoint
      // const response = await axios.get(`/api/users/${user.id}/bookings`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });

      // Placeholder: Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now, use existing context data or empty array
      const bookings = getUserBookings ? getUserBookings() : [];
      setRecentBookings(bookings.slice(0, 3)); // Show only 3 most recent
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchAvailableProfessionals = async () => {
    setIsLoadingProfessionals(true);
    try {
      // TODO: Replace with actual API endpoint
      // const response = await axios.get('/api/bouncers/available');

      // Placeholder: Use existing context data
      const professionals = getAvailableBouncers ? getAvailableBouncers() : [];
      setAvailableProfessionals(professionals);
    } catch (error) {
      console.error('Error fetching available professionals:', error);
    } finally {
      setIsLoadingProfessionals(false);
    }
  };

  // Fetch service profiles from database
  const fetchServiceProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      const response = await axios.get('/service-profiles');

      if (response.data) {
        setIndividualProfiles(response.data.individual_profiles || []);
        setGroupProfiles(response.data.group_profiles || []);
      }
    } catch (error) {
      console.error('Error fetching service profiles:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchRecentBookings();
    fetchAvailableProfessionals();
    fetchServiceProfiles();
  }, [user?.id]);

  // TopBar component
  const TopBar = () => (
    <div className="dashboard-nav h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-xl dashboard-glass-card">
          <span className="text-blue-400 font-bold text-xl">🛡️</span>
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{color: 'var(--dashboard-text)'}}>My Bouncer</h1>
          <p className="text-xs" style={{color: 'var(--dashboard-text-muted)'}}>Customer Portal</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg dashboard-glass-card hover:border-blue-500/40 transition-all duration-200 hover:scale-105">
          <Bell className="w-5 h-5" style={{color: 'var(--dashboard-text-muted)'}} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg dashboard-glass-card hover:border-blue-500/40 transition-all duration-200 hover:scale-105">
          <Settings className="w-5 h-5" style={{color: 'var(--dashboard-text-muted)'}} />
        </button>

        {/* User Profile */}
        <button
          onClick={() => navigate('/user/profile')}
          className="flex items-center space-x-3 pl-4 pr-4 py-2 rounded-lg dashboard-glass-card hover:border-blue-500/40 transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <div className="p-1 rounded-full" style={{background: 'linear-gradient(135deg, var(--dashboard-accent-blue), var(--dashboard-accent-purple))'}}>
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium" style={{color: 'var(--dashboard-text)'}}>{getFullName()}</p>
            <p className="text-xs" style={{color: 'var(--dashboard-text-muted)'}}>Customer</p>
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg dashboard-glass-card hover:border-red-500/40 transition-all duration-200 hover:scale-105 group"
        >
          <LogOut className="w-4 h-4" style={{color: '#ef4444'}} />
          <span className="text-sm font-medium hidden sm:inline group-hover:text-red-300" style={{color: '#ef4444'}}>Logout</span>
        </button>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="w-64 lg:w-64 md:w-56 sm:w-48 min-h-screen border-r border-gray-800" style={{background: 'var(--dashboard-bg)'}}>
      
      <nav className="mt-6 px-4 space-y-2">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: '📊' },
          { id: 'book', name: 'Book Security', icon: '➕' },
          { id: 'bookings', name: 'My Bookings', icon: '📅' },
          { id: 'history', name: 'History', icon: '📋' },
          { id: 'profile', name: 'Profile', icon: '👤' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              // Navigate to profile route instead of using internal tab
              if (item.id === 'profile') {
                navigate('/user/profile');
              } else {
                setActiveTab(item.id);
              }
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              activeTab === item.id
                ? 'dashboard-nav-item active'
                : 'dashboard-nav-item'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium" style={{color: activeTab === item.id ? 'var(--dashboard-accent-blue)' : 'var(--dashboard-text-muted)'}}>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="dashboard-glass-card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full" style={{background: 'linear-gradient(135deg, var(--dashboard-accent-blue), var(--dashboard-accent-purple))'}}>
              <span className="text-white font-bold text-sm">{getInitials()}</span>
            </div>
            <div>
              <p className="font-medium" style={{color: 'var(--dashboard-text)'}}>{getFullName()}</p>
              <p className="text-sm" style={{color: 'var(--dashboard-text-muted)'}}>Customer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MainContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="dashboard-bg min-h-screen p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
          {/* Floating Orbs Background */}
          <div className="dashboard-float-orb floating-orb-1"></div>
          <div className="dashboard-float-orb floating-orb-2"></div>
          <div className="dashboard-float-orb floating-orb-3"></div>

          {/* Circuit Pattern */}
          <div className="dashboard-circuit"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2" style={{color: 'var(--dashboard-text)'}}>Welcome back, {user?.first_name || 'User'}!</h2>
            <p style={{color: 'var(--dashboard-text-muted)'}}>Manage your security bookings and services</p>
          </div>

          {/* Quick Actions - Unified Horizontal Layout */}
          <div className="relative z-10 dashboard-saas-grid">
            {/* Start Booking Card - Blue Gradient */}
            <div className="dashboard-saas-card blue">
              <div className="dashboard-saas-icon blue">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="dashboard-saas-title">Start Booking</h3>
              <p className="dashboard-saas-description">Find available professionals for your event</p>
              <button
                onClick={() => setShowStartBookingModal(true)}
                className="dashboard-saas-btn blue"
              >
                Browse Bouncers
              </button>
              <div className="dashboard-saas-particle dashboard-saas-particle-1"></div>
              <div className="dashboard-saas-particle dashboard-saas-particle-2"></div>
              <div className="dashboard-saas-particle dashboard-saas-particle-3"></div>
            </div>

            {/* Want Bouncer Card - Purple Gradient */}
            <div className="dashboard-saas-card purple">
              <div className="dashboard-saas-icon purple">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="dashboard-saas-title">Want Bouncer</h3>
              <p className="dashboard-saas-description">Post your event requirements and get quotes</p>
              <button
                onClick={() => setShowPostRequestModal(true)}
                className="dashboard-saas-btn purple"
              >
                Post Request
              </button>
              <div className="dashboard-saas-particle dashboard-saas-particle-1"></div>
              <div className="dashboard-saas-particle dashboard-saas-particle-2"></div>
              <div className="dashboard-saas-particle dashboard-saas-particle-3"></div>
            </div>

            {/* Active Bookings Card - Green Gradient */}
            <div className="dashboard-saas-card green">
              <div className="dashboard-saas-stats">
                <div>
                  <p className="dashboard-saas-number">2</p>
                  <p className="dashboard-saas-label">Active Bookings</p>
                </div>
                <div className="dashboard-saas-icon green">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <button className="dashboard-saas-btn green">
                View All
              </button>
              <div className="dashboard-saas-particle dashboard-saas-particle-1"></div>
              <div className="dashboard-saas-particle dashboard-saas-particle-2"></div>
              <div className="dashboard-saas-particle dashboard-saas-particle-3"></div>
            </div>

            {/* Total Spent Card - Orange Gradient */}
            <div className="dashboard-saas-card orange">
              <div className="dashboard-saas-stats">
                <div>
                  <p className="dashboard-saas-number">₹1,355</p>
                  <p className="dashboard-saas-label">Total Spent</p>
                </div>
                <div className="dashboard-saas-icon orange">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08.402-2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <button className="dashboard-saas-btn orange">
                View History
              </button>
              <div className="dashboard-saas-particle dashboard-saas-particle-1"></div>
              <div className="dashboard-saas-particle dashboard-saas-particle-2"></div>
              <div className="dashboard-saas-particle dashboard-saas-particle-3"></div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="relative z-10 dashboard-glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{color: 'var(--dashboard-text)'}}>Recent Bookings</h3>
              <button
                onClick={() => setActiveTab('bookings')}
                className="dashboard-neon-btn px-3 py-1 text-sm"
              >
                View All →
              </button>
            </div>

            {isLoadingBookings ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3" style={{color: 'var(--dashboard-text-muted)'}}>Loading bookings...</span>
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h4 className="text-lg font-semibold mb-2" style={{color: 'var(--dashboard-text)'}}>No Bookings Yet</h4>
                <p style={{color: 'var(--dashboard-text-muted)'}}>
                  You haven't made any security bookings yet. Click "Start Booking" to find professionals for your event.
                </p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="mt-4 px-6 py-3 dashboard-neon-btn text-sm"
                >
                  Browse Professionals
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="dashboard-glass-card p-4 transition-all duration-300 hover:scale-102 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold" style={{color: 'var(--dashboard-text)'}}>{booking.title || 'Security Booking'}</h4>
                        <p style={{color: 'var(--dashboard-text-muted)'}}>{booking.date || 'Date TBD'} • {booking.time || 'Time TBD'}</p>
                        <p className="text-sm" style={{color: 'var(--dashboard-text-muted)'}}>📍 {booking.location || 'Location TBD'}</p>
                        <p className="text-sm" style={{color: 'var(--dashboard-text-muted)'}}>👤 {booking.bouncer || 'Professional TBD'}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-bold" style={{color: 'var(--dashboard-text)'}}>{booking.amount || '$0'}</p>
                        <span className={`dashboard-badge ${
                          booking.status === 'Completed' ? 'dashboard-badge-success' :
                          booking.status === 'Confirmed' ? 'dashboard-badge-info' :
                          booking.status === 'Pending' ? 'dashboard-badge-warning' :
                          'dashboard-badge-warning'
                        }`}>
                          {booking.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Professionals Preview */}
          <div className="relative z-10 dashboard-glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{color: 'var(--dashboard-text)'}}>Available Professionals</h3>
              <button
                onClick={() => setActiveTab('book')}
                className="dashboard-neon-btn px-3 py-1 text-sm"
              >
                View All →
              </button>
            </div>

            {isLoadingProfessionals ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3" style={{color: 'var(--dashboard-text-muted)'}}>Loading professionals...</span>
              </div>
            ) : availableProfessionals.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h4 className="text-lg font-semibold mb-2" style={{color: 'var(--dashboard-text)'}}>No Professionals Available</h4>
                <p style={{color: 'var(--dashboard-text-muted)'}}>
                  All security professionals are currently busy. Please try again later or post a request for your specific needs.
                </p>
                <button
                  onClick={() => setShowPostRequestModal(true)}
                  className="mt-4 px-6 py-3 dashboard-neon-btn text-sm"
                >
                  Post Request
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableProfessionals.slice(0, 3).map((professional, index) => (
                  <div key={professional.id || index} className="dashboard-glass-card p-4 transition-all duration-300 hover:scale-102 cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-full" style={{background: 'linear-gradient(135deg, var(--dashboard-accent-blue), var(--dashboard-accent-purple))'}}>
                        <span className="text-white font-bold text-sm">
                          {professional.name ?
                            professional.name.split(' ').map(n => n[0]).join('') :
                            professional.firstName && professional.lastName ?
                              `${professional.firstName[0]}${professional.lastName[0]}` :
                              '?'
                          }
                        </span>
                      </div>
                      <div>
                        <p className="font-medium" style={{color: 'var(--dashboard-text)'}}>
                          {professional.name || `${professional.firstName || ''} ${professional.lastName || ''}`.trim() || 'Professional Name'}
                        </p>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400 text-sm">⭐</span>
                          <span className="text-sm" style={{color: 'var(--dashboard-text-muted)'}}>
                            {professional.rating || '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm space-y-1" style={{color: 'var(--dashboard-text-muted)'}}>
                      <p>🎖️ {professional.experience || '0 years'} experience</p>
                      <p>💰 {professional.rate || professional.hourlyRate ? `$${professional.rate || professional.hourlyRate}/hr` : 'Rate TBD'}</p>
                      <p>📍 {professional.location || 'Location TBD'}</p>
                    </div>
                  </div>
                ))}
                {availableProfessionals.length > 3 && (
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setActiveTab('book')}
                      className="text-sm px-4 py-2 dashboard-glass-card hover:border-blue-500/40 transition-all duration-200"
                      style={{color: 'var(--dashboard-text-muted)'}}
                    >
                      View {availableProfessionals.length - 3} more →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'book') {
      return (
        <div className="dashboard-bg min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
          {/* Floating Orbs Background */}
          <div className="dashboard-float-orb floating-orb-1"></div>
          <div className="dashboard-float-orb floating-orb-2"></div>
          <div className="dashboard-float-orb floating-orb-3"></div>

          {/* Circuit Pattern */}
          <div className="dashboard-circuit"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2" style={{color: 'var(--dashboard-text)'}}>Browse Bouncers</h2>
            <p style={{color: 'var(--dashboard-text-muted)'}}>Select professional security experts for your event</p>
          </div>

          {/* Quick Action Buttons */}
          <div className="relative z-10 flex flex-wrap gap-4">
            <button
              onClick={() => setShowPostRequestModal(true)}
              className="px-6 py-3 dashboard-neon-btn"
            >
              + Post Event Request
            </button>
            <button
              onClick={() => fetchServiceProfiles()}
              className="px-6 py-3 dashboard-glass-card hover:border-blue-500/40 transition-all duration-200 hover:scale-105"
              style={{color: 'var(--dashboard-text)'}}
            >
              🔄 Refresh Profiles
            </button>
          </div>

          {isLoadingProfiles ? (
            <div className="relative z-10 flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3" style={{color: 'var(--dashboard-text-muted)'}}>Loading profiles...</span>
            </div>
          ) : (
            <>
              {/* Individual Booking Section */}
              <div className="relative z-10 dashboard-glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{background: 'linear-gradient(135deg, var(--dashboard-accent-blue), var(--dashboard-accent-purple))'}}>
                      <span className="text-white text-2xl">👤</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{color: 'var(--dashboard-text)'}}>Individual Booking</h3>
                      <p style={{color: 'var(--dashboard-text-muted)'}}>Book one professional for your event</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/user/browse/bouncers/individual-booking')}
                    className="dashboard-neon-btn px-4 py-2 text-sm"
                  >
                    View All →
                  </button>
                </div>

                {individualProfiles.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👤</div>
                    <h4 className="text-lg font-semibold mb-2" style={{color: 'var(--dashboard-text)'}}>No Individual Profiles Available</h4>
                    <p style={{color: 'var(--dashboard-text-muted)'}}>
                      No bouncers have posted individual profiles yet. Check back later!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {individualProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="dashboard-glass-card p-6 transition-all duration-300 hover:scale-105 hover:border-blue-500/40"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 rounded-full" style={{background: 'linear-gradient(135deg, var(--dashboard-accent-blue), var(--dashboard-accent-purple))'}}>
                            <span className="text-white font-bold text-lg">
                              {profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg" style={{color: 'var(--dashboard-text)'}}>
                              {profile.name || 'Unknown'}
                            </h4>
                            <span className="dashboard-badge dashboard-badge-success text-xs">Available</span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4" style={{color: 'var(--dashboard-text-muted)'}}>
                          <p className="text-sm flex items-center space-x-2">
                            <span>📍</span>
                            <span>{profile.location || 'Location not specified'}</span>
                          </p>
                          <p className="text-sm flex items-center space-x-2">
                            <span>📞</span>
                            <span>{profile.phone_number || 'Phone not provided'}</span>
                          </p>
                          <p className="text-sm flex items-center space-x-2">
                            <span>💰</span>
                            <span>₹{profile.amount_per_hour || '0'}/hour</span>
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            alert(`Booking ${profile.name} for your event! This feature will be connected soon.`);
                          }}
                          className="w-full px-4 py-2 dashboard-neon-btn text-sm"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Group Booking Section */}
              <div className="relative z-10 dashboard-glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                      <span className="text-white text-2xl">👥</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{color: 'var(--dashboard-text)'}}>Group Booking</h3>
                      <p style={{color: 'var(--dashboard-text-muted)'}}>Hire multiple professionals for larger events</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/user/browse/bouncers/group-booking')}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#FFFFFF'
                    }}
                  >
                    View All →
                  </button>
                </div>

                {groupProfiles.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h4 className="text-lg font-semibold mb-2" style={{color: 'var(--dashboard-text)'}}>No Group Profiles Available</h4>
                    <p style={{color: 'var(--dashboard-text-muted)'}}>
                      No bouncer groups have posted profiles yet. Check back later!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="dashboard-glass-card p-6 transition-all duration-300 hover:scale-105 hover:border-green-500/40"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 rounded-full" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                            <span className="text-white font-bold text-lg">
                              {profile.group_name ? profile.group_name.substring(0, 2).toUpperCase() : '??'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg" style={{color: 'var(--dashboard-text)'}}>
                              {profile.group_name || 'Unknown Group'}
                            </h4>
                            <span className="dashboard-badge dashboard-badge-success text-xs">
                              {profile.member_count || 0} Members
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4" style={{color: 'var(--dashboard-text-muted)'}}>
                          <p className="text-sm flex items-center space-x-2">
                            <span>📍</span>
                            <span>{profile.location || 'Location not specified'}</span>
                          </p>
                          <p className="text-sm flex items-center space-x-2">
                            <span>💰</span>
                            <span>₹{profile.amount_per_hour || '0'}/hour per member</span>
                          </p>
                          {profile.members && (
                            <div className="mt-3 pt-3 border-t border-gray-700/30">
                              <p className="text-xs font-medium mb-2" style={{color: 'var(--dashboard-text)'}}>Team Members:</p>
                              <div className="space-y-1">
                                {(() => {
                                  try {
                                    const members = typeof profile.members === 'string' ? JSON.parse(profile.members) : profile.members;
                                    return (
                                      <>
                                        {members.slice(0, 3).map((member: any, idx: number) => (
                                          <p key={idx} className="text-xs" style={{color: 'var(--dashboard-text-muted)'}}>
                                            • {member.name}
                                          </p>
                                        ))}
                                        {members.length > 3 && (
                                          <p className="text-xs" style={{color: 'var(--dashboard-text-muted)'}}>
                                            +{members.length - 3} more
                                          </p>
                                        )}
                                      </>
                                    );
                                  } catch (e) {
                                    return <p className="text-xs" style={{color: 'var(--dashboard-text-muted)'}}>Team info unavailable</p>;
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            alert(`Booking ${profile.group_name} for your event! This feature will be connected soon.`);
                          }}
                          className="w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#FFFFFF'
                          }}
                        >
                          Book Group
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="p-4 md:p-6 lg:p-8">
        <h2 className="text-3xl font-bold mb-4" style={{color: '#1E293B'}}>
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>
        <div className="p-8 rounded-lg shadow-lg" style={{backgroundColor: '#FFFFFF'}}>
          <p style={{color: '#1E293B'}}>This section is under development.</p>
        </div>
      </div>
    );
  };

  

  
  // Handle bouncer selection
  const handleBouncerSelection = (bouncer: Bouncer) => {
    if (bookingType === 'individual') {
      setSelectedBouncers([bouncer]);
    } else if (bookingType === 'group') {
      const isSelected = selectedBouncers.some(b => b.id === bouncer.id);
      if (isSelected) {
        setSelectedBouncers(prev => prev.filter(b => b.id !== bouncer.id));
      } else {
        setSelectedBouncers(prev => [...prev, bouncer]);
      }
    }
  };

  // Handle booking confirmation
  const handleBookingConfirm = async () => {
    if (selectedBouncers.length === 0) {
      alert('Please select at least one bouncer');
      return;
    }

    try {
      await makeBooking({
        type: bookingType!,
        selectedBouncers
      });

      // Reset selection and close modal
      setSelectedBouncers([]);
      setShowStartBookingModal(false);
      setBookingType(null);

      alert('Booking confirmed successfully!');
    } catch (error) {
      console.error('Error making booking:', error);
      alert('Failed to confirm booking. Please try again.');
    }
  };

  
  // Modern Start Booking Modal Component
  const StartBookingModal = () => {
    const handleIndividualBooking = () => {
      console.log('Individual Booking selected - Navigating to individual booking page');
      setShowStartBookingModal(false);
      // Navigate to individual booking page
      navigate('/user/browse/bouncers/individual-booking');
    };

    const handleGroupBooking = () => {
      console.log('Group Booking selected - Navigating to group booking page');
      setShowStartBookingModal(false);
      // Navigate to group booking page
      navigate('/user/browse/bouncers/group-booking');
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowStartBookingModal(false);
      }
    };

    return (
      <div
        className="dashboard-booking-modal-overlay"
        onClick={handleOverlayClick}
      >
        <div className="dashboard-booking-modal-container">
          <div className="dashboard-booking-modal-header">
            <h2 className="dashboard-booking-modal-title">Start Booking</h2>
            <button
              onClick={() => setShowStartBookingModal(false)}
              className="dashboard-booking-modal-close"
            >
              ×
            </button>
          </div>

          <div className="dashboard-booking-modal-body">
            <div className="dashboard-booking-options-grid">
              <button
                onClick={handleIndividualBooking}
                className="dashboard-booking-option-btn individual"
              >
                <span className="dashboard-booking-option-icon">👤</span>
                <h3 className="dashboard-booking-option-title">Individual Booking</h3>
                <p className="dashboard-booking-option-description">
                  Book one professional for your event security needs
                </p>
              </button>

              <button
                onClick={handleGroupBooking}
                className="dashboard-booking-option-btn group"
              >
                <span className="dashboard-booking-option-icon">👥</span>
                <h3 className="dashboard-booking-option-title">Group Booking</h3>
                <p className="dashboard-booking-option-description">
                  Hire multiple professionals for larger events
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  
  return (
    <div className="min-h-screen dashboard-bg">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 overflow-x-auto">
          <MainContent />
        </div>
      </div>

      {/* Modals */}
      {showPostRequestModal && (
        <PostRequestModal
          onClose={handleClosePostRequestModal}
          onSubmit={handlePostRequestSubmit}
        />
      )}
      {showStartBookingModal && <StartBookingModal />}
    </div>
  );
};

export default UserDashboard;