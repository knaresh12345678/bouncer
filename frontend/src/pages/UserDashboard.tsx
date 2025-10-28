import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking, Bouncer, BookingRequest } from '../contexts/BookingContext';
import axios from 'axios';
import { LogOut, User, Settings, Bell } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { getAvailableBouncers, createBookingRequest, makeBooking, getUserBookings } = useBooking();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWantBouncerForm, setShowWantBouncerForm] = useState(false);
  const [showStartBooking, setShowStartBooking] = useState(false);
  const [bookingType, setBookingType] = useState<'individual' | 'group' | null>(null);
  const [selectedBouncers, setSelectedBouncers] = useState<Bouncer[]>([]);
  // Individual state for each form field to prevent focus loss
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Helper function to get full name
  const getFullName = () => {
    if (!user) return 'User';
    return `${user.first_name} ${user.last_name}`.trim();
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

  const recentBookings = [
    {
      id: 1,
      title: 'Wedding Security',
      date: 'Dec 25, 2024',
      time: '4:00 PM - 11:00 PM',
      location: 'Sunset Gardens',
      status: 'Completed',
      bouncer: 'Mike Johnson',
      amount: '$525'
    },
    {
      id: 2,
      title: 'Birthday Party',
      date: 'Dec 28, 2024',
      time: '7:00 PM - 1:00 AM',
      location: '123 Oak Street',
      status: 'Confirmed',
      bouncer: 'Sarah Wilson',
      amount: '$350'
    },
    {
      id: 3,
      title: 'Corporate Event',
      date: 'Jan 5, 2025',
      time: '6:00 PM - 12:00 AM',
      location: 'Business Center',
      status: 'Pending',
      bouncer: 'Pending Assignment',
      amount: '$480'
    }
  ];

  // TopBar component
  const TopBar = () => (
    <div className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-xl bg-gray-900 border border-gray-700">
          <span className="text-blue-400 font-bold text-xl">🛡️</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">SecureGuard</h1>
          <p className="text-xs text-gray-400">Customer Portal</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-800 transition-all duration-200 hover:scale-105">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-800 transition-all duration-200 hover:scale-105">
          <Settings className="w-5 h-5 text-gray-300" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-4 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-700">
          <div className="p-1 rounded-full bg-blue-600">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{getFullName()}</p>
            <p className="text-xs text-gray-400">Customer</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600/20 border border-red-600/30 hover:bg-red-600/30 transition-all duration-200 hover:scale-105 group"
        >
          <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300" />
          <span className="text-sm font-medium text-red-400 group-hover:text-red-300 hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="w-64 lg:w-64 md:w-56 sm:w-48 min-h-screen bg-black border-r border-gray-800">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gray-900 border border-gray-700">
            <span className="text-blue-400 font-bold text-xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SecureGuard</h1>
            <p className="text-sm text-gray-400">Customer Portal</p>
          </div>
        </div>
      </div>

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
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-lg transform scale-105'
                : 'bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 hover:text-white hover:shadow-md hover:scale-102'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-600">
              <span className="text-white font-bold text-sm">{getInitials()}</span>
            </div>
            <div>
              <p className="font-medium text-white">{getFullName()}</p>
              <p className="text-sm text-gray-400">Customer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MainContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-black min-h-screen">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-white">Welcome back, {user?.first_name || 'User'}!</h2>
            <p className="text-gray-400">Manage your security bookings and services</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Start Booking Card */}
            <div className="p-6 rounded-lg text-white hover:shadow-lg transition-all duration-300" style={{backgroundColor: '#2563EB'}}>
              <h3 className="text-lg font-semibold mb-2" style={{color: '#FFFFFF'}}>Start Booking</h3>
              <p className="mb-4" style={{color: '#E5E7EB'}}>Find available professionals for your event</p>
              <button
                onClick={() => setShowStartBooking(true)}
                className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{backgroundColor: '#2563EB', color: '#FFFFFF'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1D4ED8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2563EB'}
              >
                Browse Bouncers
              </button>
            </div>

            {/* Want Bouncer Card */}
            <div className="p-6 rounded-lg text-white hover:shadow-lg transition-all duration-300" style={{backgroundColor: '#10B981'}}>
              <h3 className="text-lg font-semibold mb-2" style={{color: '#FFFFFF'}}>Want Bouncer</h3>
              <p className="mb-4" style={{color: '#E5E7EB'}}>Post your event requirements</p>
              <button
                onClick={() => setShowWantBouncerForm(true)}
                className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{backgroundColor: '#10B981', color: '#FFFFFF'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#10B981'}
              >
                Post Request
              </button>
            </div>

            <div className="p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300" style={{backgroundColor: '#FFFFFF'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{color: '#475569'}}>Active Bookings</p>
                  <p className="text-3xl font-bold" style={{color: '#1E293B'}}>2</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <span className="text-green-700 text-2xl">📅</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300" style={{backgroundColor: '#FFFFFF'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{color: '#475569'}}>Total Spent</p>
                  <p className="text-3xl font-bold" style={{color: '#1E293B'}}>$1,355</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <span className="text-purple-700 text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="p-6 rounded-lg shadow-lg" style={{backgroundColor: '#FFFFFF'}}>
            <h3 className="text-xl font-bold mb-6" style={{color: '#1E293B'}}>Recent Bookings</h3>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:scale-102" style={{backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold" style={{color: '#1E293B'}}>{booking.title}</h4>
                      <p style={{color: '#475569'}}>{booking.date} • {booking.time}</p>
                      <p className="text-sm" style={{color: '#475569'}}>📍 {booking.location}</p>
                      <p className="text-sm" style={{color: '#475569'}}>👤 {booking.bouncer}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold" style={{color: '#1E293B'}}>{booking.amount}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Bouncers Preview */}
          <div className="p-6 rounded-lg shadow-lg" style={{backgroundColor: '#FFFFFF'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{color: '#1E293B'}}>Available Professionals</h3>
              <button
                onClick={() => setActiveTab('book')}
                className="px-3 py-1 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-md hover:scale-105"
                style={{color: '#2563EB', backgroundColor: 'transparent'}}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#EBF4FF';
                  e.target.style.color = '#1D4ED8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#2563EB';
                }}
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Mike Johnson', rating: 4.9, experience: '8 years', rate: '$45/hr' },
                { name: 'Sarah Wilson', rating: 4.8, experience: '6 years', rate: '$40/hr' },
                { name: 'David Brown', rating: 4.7, experience: '10 years', rate: '$50/hr' }
              ].map((bouncer, index) => (
                <div key={index} className="rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:scale-102" style={{backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-full" style={{backgroundColor: '#2563EB'}}>
                      <span className="text-white font-bold text-sm">
                        {bouncer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium" style={{color: '#1E293B'}}>{bouncer.name}</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400 text-sm">⭐</span>
                        <span className="text-sm" style={{color: '#475569'}}>{bouncer.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm space-y-1" style={{color: '#475569'}}>
                    <p>🎖️ {bouncer.experience} experience</p>
                    <p>💰 {bouncer.rate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'book') {
      const availableBouncers = getAvailableBouncers();

      return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{color: '#1E293B'}}>Book Security</h2>
            <p style={{color: '#475569'}}>Browse and select professional security experts for your event</p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowWantBouncerForm(true)}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{backgroundColor: '#10B981', color: '#FFFFFF'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#10B981'}
            >
              + Post Event Request
            </button>
            <button
              onClick={() => setShowStartBooking(true)}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{backgroundColor: '#2563EB', color: '#FFFFFF'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1D4ED8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2563EB'}
            >
              Browse Available Bouncers
            </button>
          </div>

          {/* Available Bouncers Grid */}
          <div className="p-6 rounded-lg shadow-lg" style={{backgroundColor: '#FFFFFF'}}>
            <h3 className="text-xl font-bold mb-6" style={{color: '#1E293B'}}>Available Security Professionals</h3>

            {availableBouncers.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">😔</span>
                <h4 className="text-lg font-semibold mb-2" style={{color: '#1E293B'}}>No Bouncers Available</h4>
                <p style={{color: '#475569'}}>All professionals are currently busy. Please try again later or post a request.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableBouncers.map((bouncer) => (
                  <div key={bouncer.id} className="rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:scale-102" style={{backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 rounded-full" style={{backgroundColor: '#2563EB'}}>
                        <span className="text-white font-bold text-lg">
                          {bouncer.firstName[0]}{bouncer.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg" style={{color: '#1E293B'}}>
                          {bouncer.firstName} {bouncer.lastName}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-400">⭐</span>
                          <span className="font-medium" style={{color: '#475569'}}>{bouncer.rating}</span>
                          <span className="text-green-600 text-sm font-medium">Available</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4" style={{color: '#475569'}}>
                      <p className="text-sm">🎖️ {bouncer.experience} experience</p>
                      <p className="text-sm">💰 ${bouncer.hourlyRate}/hour</p>
                      <p className="text-sm">📍 {bouncer.location}</p>
                      <p className="text-sm">✅ {bouncer.completedJobs} completed jobs</p>
                    </div>

                    <p className="text-sm mb-4" style={{color: '#475569'}}>{bouncer.bio}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {bouncer.specialties.slice(0, 3).map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{backgroundColor: '#F1F5F9', color: '#475569'}}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBouncers([bouncer]);
                        setBookingType('individual');
                        setShowStartBooking(true);
                      }}
                      className="w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:scale-105"
                      style={{backgroundColor: '#2563EB', color: '#FFFFFF'}}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#1D4ED8'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#2563EB'}
                    >
                      Select Bouncer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Posted Requests */}
          {bookingRequests.length > 0 && (
            <div className="p-6 rounded-lg shadow-lg" style={{backgroundColor: '#FFFFFF'}}>
              <h3 className="text-xl font-bold mb-6" style={{color: '#1E293B'}}>Your Posted Requests</h3>
              <div className="space-y-4">
                {bookingRequests.slice(-3).reverse().map((request) => (
                  <div key={request.id} className="rounded-lg p-4 transition-all duration-300 hover:shadow-lg" style={{backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB'}}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold" style={{color: '#1E293B'}}>{request.eventName}</h4>
                        <p style={{color: '#475569'}}>{request.date} • {request.time}</p>
                        <p className="text-sm" style={{color: '#475569'}}>📍 {request.location}</p>
                        <p className="text-sm" style={{color: '#475569'}}>💰 Budget: ${request.price}</p>
                        {request.description && (
                          <p className="text-sm mt-1" style={{color: '#475569'}}>{request.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

  // Form validation - using individual state variables
  const validateWantBouncerForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!date) newErrors.date = 'Date is required';
    if (!time) newErrors.time = 'Time is required';
    if (!price || isNaN(Number(price))) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Want Bouncer form submission
  const handleWantBouncerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateWantBouncerForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Submit to backend API
      const response = await axios.post('/api/bookings/', {
        eventName: eventName,
        location: location,
        date: date,
        time: time,
        price: Number(price),
        description: description
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        // Also update local context for immediate UI updates
        await createBookingRequest({
          eventName: eventName,
          location: location,
          date: date,
          time: time,
          price: Number(price),
          userId: user?.id || '',
          description: description
        });

        // Reset form fields
        setEventName('');
        setLocation('');
        setDate('');
        setTime('');
        setPrice('');
        setDescription('');
        setShowWantBouncerForm(false);
        setErrors({});
        setSubmitError('');

        // Show success message
        alert('Bouncer request posted successfully! Redirecting to browse available bouncers...');

        // Automatically redirect to Book Security tab to see available bouncers
        setActiveTab('book');
      }
    } catch (error: any) {
      console.error('Error creating booking request:', error);

      // Handle different types of errors
      if (error.response?.status === 401) {
        setSubmitError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 400) {
        setSubmitError(error.response.data?.detail || 'Invalid form data. Please check your inputs.');
      } else if (error.response?.status === 500) {
        setSubmitError('Server error. Please try again later.');
      } else if (error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Failed to post request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
      setShowStartBooking(false);
      setBookingType(null);

      alert('Booking confirmed successfully!');
    } catch (error) {
      console.error('Error making booking:', error);
      alert('Failed to confirm booking. Please try again.');
    }
  };

  // Want Bouncer Modal
  const WantBouncerModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{color: '#1E293B'}}>Want Bouncer</h2>
            <button
              onClick={() => setShowWantBouncerForm(false)}
              className="w-8 h-8 rounded-full text-xl transition-all duration-200 hover:shadow-md hover:scale-110"
              style={{color: '#DC2626', backgroundColor: 'transparent'}}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#FEE2E2';
                e.target.style.color = '#B91C1C';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#DC2626';
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleWantBouncerSubmit} className="space-y-4">
            <div key="eventName">
              <label className="block text-sm font-medium mb-1" style={{color: '#1E293B'}}>
                Event Name *
              </label>
              <input
                id="want-bouncer-event-name"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.eventName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Wedding, Birthday Party, Corporate Event..."
                autoComplete="off"
              />
              {errors.eventName && <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>}
            </div>

            <div key="location">
              <label className="block text-sm font-medium mb-1" style={{color: '#1E293B'}}>
                Location *
              </label>
              <input
                id="want-bouncer-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Venue address or location"
                autoComplete="off"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div key="date">
                <label className="block text-sm font-medium mb-1" style={{color: '#1E293B'}}>
                  Date *
                </label>
                <input
                  id="want-bouncer-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              <div key="time">
                <label className="block text-sm font-medium mb-1" style={{color: '#1E293B'}}>
                  Time *
                </label>
                <input
                  id="want-bouncer-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.time ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            <div key="price">
              <label className="block text-sm font-medium mb-1" style={{color: '#1E293B'}}>
                Budget ($) *
              </label>
              <input
                id="want-bouncer-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your budget"
                autoComplete="off"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div key="description">
              <label className="block text-sm font-medium mb-1" style={{color: '#1E293B'}}>
                Additional Details
              </label>
              <textarea
                id="want-bouncer-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any specific requirements or details..."
                autoComplete="off"
              />
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowWantBouncerForm(false)}
                className="flex-1 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 border"
                style={{backgroundColor: '#FFFFFF', color: '#1E293B', borderColor: '#E5E7EB'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#FFFFFF'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50"
                style={{backgroundColor: isSubmitting ? '#9CA3AF' : '#2563EB', color: '#FFFFFF'}}
                onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#1D4ED8')}
                onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2563EB')}
              >
                {isSubmitting ? 'Posting...' : 'Post Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Start Booking Modal
  const StartBookingModal = () => {
    const availableBouncers = getAvailableBouncers();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{color: '#1E293B'}}>Start Booking</h2>
              <button
                onClick={() => {
                  setShowStartBooking(false);
                  setBookingType(null);
                  setSelectedBouncers([]);
                }}
                className="w-8 h-8 rounded-full text-xl transition-all duration-200 hover:shadow-md hover:scale-110"
                style={{color: '#DC2626', backgroundColor: 'transparent'}}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#FEE2E2';
                  e.target.style.color = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#DC2626';
                }}
              >
                ×
              </button>
            </div>

            {!bookingType ? (
              <div className="space-y-6">
                <p className="text-gray-600 mb-6">Choose your booking type:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setBookingType('individual')}
                    className="p-6 rounded-lg text-left transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md"
                    style={{backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '2px solid #2563EB';
                      e.currentTarget.style.backgroundColor = '#EBF4FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '1px solid #E5E7EB';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">👤</span>
                      <h3 className="text-lg font-semibold" style={{color: '#1E293B'}}>Individual Bouncer</h3>
                    </div>
                    <p style={{color: '#475569'}}>Select one professional for your event</p>
                  </button>

                  <button
                    onClick={() => setBookingType('group')}
                    className="p-6 rounded-lg text-left transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md"
                    style={{backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '2px solid #2563EB';
                      e.currentTarget.style.backgroundColor = '#EBF4FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '1px solid #E5E7EB';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">👥</span>
                      <h3 className="text-lg font-semibold" style={{color: '#1E293B'}}>Group Booking</h3>
                    </div>
                    <p style={{color: '#475569'}}>Select multiple professionals for your event</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold" style={{color: '#1E293B'}}>
                    {bookingType === 'individual' ? 'Select Individual Bouncer' : 'Select Group of Bouncers'}
                  </h3>
                  <button
                    onClick={() => {
                      setBookingType(null);
                      setSelectedBouncers([]);
                    }}
                    className="px-3 py-1 rounded-lg text-sm transition-all duration-200 hover:shadow-md hover:scale-105"
                    style={{color: '#2563EB', backgroundColor: 'transparent'}}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#EBF4FF';
                      e.target.style.color = '#1D4ED8';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#2563EB';
                    }}
                  >
                    ← Back to selection
                  </button>
                </div>

                {availableBouncers.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">😔</span>
                    <h3 className="text-lg font-semibold mb-2" style={{color: '#1E293B'}}>No Bouncers Available</h3>
                    <p style={{color: '#475569'}}>All professionals are currently busy. Please try again later.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {availableBouncers.map((bouncer) => (
                        <div
                          key={bouncer.id}
                          className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                            selectedBouncers.some(b => b.id === bouncer.id)
                              ? 'shadow-lg hover:shadow-xl'
                              : 'shadow-md hover:shadow-lg hover:scale-102'
                          }`}
                          style={{
                            backgroundColor: selectedBouncers.some(b => b.id === bouncer.id) ? '#EBF4FF' : '#FFFFFF',
                            border: selectedBouncers.some(b => b.id === bouncer.id) ? '2px solid #2563EB' : '1px solid #E5E7EB'
                          }}
                          onClick={() => handleBouncerSelection(bouncer)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 rounded-full" style={{backgroundColor: '#2563EB'}}>
                                <span className="text-white font-bold">
                                  {bouncer.firstName[0]}{bouncer.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold" style={{color: '#1E293B'}}>
                                  {bouncer.firstName} {bouncer.lastName}
                                </h4>
                                <div className="flex items-center space-x-4 text-sm" style={{color: '#475569'}}>
                                  <span className="flex items-center space-x-1">
                                    <span className="text-yellow-400">⭐</span>
                                    <span>{bouncer.rating}</span>
                                  </span>
                                  <span>{bouncer.experience} experience</span>
                                  <span>${bouncer.hourlyRate}/hr</span>
                                </div>
                                <p className="text-sm mt-1" style={{color: '#475569'}}>{bouncer.bio}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex flex-wrap gap-1 mb-2">
                                {bouncer.specialties.slice(0, 2).map((specialty, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 text-xs rounded-full"
                                    style={{backgroundColor: '#F1F5F9', color: '#475569'}}
                                  >
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                              <span className="text-green-600 text-sm font-medium">Available</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedBouncers.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold" style={{color: '#1E293B'}}>
                              Selected: {selectedBouncers.length} bouncer(s)
                            </p>
                            <p className="text-sm" style={{color: '#475569'}}>
                              Total: ${selectedBouncers.reduce((sum, b) => sum + b.hourlyRate, 0)}/hr
                            </p>
                          </div>
                          <button
                            onClick={handleBookingConfirm}
                            className="px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                            style={{backgroundColor: '#2563EB', color: '#FFFFFF'}}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#1D4ED8'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563EB'}
                          >
                            Confirm Booking
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 overflow-x-auto">
          <MainContent />
        </div>
      </div>

      {/* Modals */}
      {showWantBouncerForm && <WantBouncerModal />}
      {showStartBooking && <StartBookingModal />}
    </div>
  );
};

export default UserDashboard;