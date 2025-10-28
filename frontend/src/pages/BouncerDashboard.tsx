import React, { useState, useEffect } from 'react';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { LogOut, User, Settings, Bell } from 'lucide-react';

const BouncerDashboard: React.FC = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { bookingRequests } = useBooking();
  const { logout, currentUser } = useAuth();
  const [apiBookingRequests, setApiBookingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Get pending booking requests from both local context and API
  const pendingRequests = [...bookingRequests.filter(request => request.status === 'pending'), ...apiBookingRequests];

  // Fetch booking requests from API
  const fetchBookingRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/bookings/all');
      if (response.data?.requests) {
        setApiBookingRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error fetching booking requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking requests on component mount
  useEffect(() => {
    fetchBookingRequests();
    // Refresh every 30 seconds to get new requests
    const interval = setInterval(fetchBookingRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    // The ProtectedRoute will automatically redirect to login
  };

  // Helper function to get full name
  const getFullName = () => {
    if (!currentUser) return 'Bouncer';
    return `${currentUser.first_name} ${currentUser.last_name}`.trim();
  };

  // Helper function to get initials
  const getInitials = () => {
    if (!currentUser) return 'B';
    const firstName = currentUser.first_name || '';
    const lastName = currentUser.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const upcomingBookings = [
    {
      id: 1,
      title: 'Corporate Event Security',
      date: 'Dec 25, 2024',
      time: '6:00 PM - 12:00 AM',
      location: 'Grand Hotel Ballroom',
      status: 'Accepted',
      pay: '$450'
    },
    {
      id: 2,
      title: 'Private Party',
      date: 'Dec 28, 2024',
      time: '8:00 PM - 2:00 AM',
      location: '123 Main Street',
      status: 'Pending',
      pay: '$300'
    },
    {
      id: 3,
      title: 'Wedding Security',
      date: 'Jan 2, 2025',
      time: '4:00 PM - 11:00 PM',
      location: 'Sunset Gardens',
      status: 'Accepted',
      pay: '$525'
    }
  ];

  // TopBar component
  const TopBar = () => (
    <div className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-xl bg-gray-900 border border-gray-700">
          <span className="text-green-400 font-bold text-xl">🛡️</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">SecureGuard</h1>
          <p className="text-xs text-gray-400">Bouncer Portal</p>
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
          <div className="p-1 rounded-full bg-green-600">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{getFullName()}</p>
            <p className="text-xs text-gray-400">Security Professional</p>
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
    <div className="w-64 min-h-screen bg-black border-r border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gray-900 border border-gray-700">
            <span className="text-green-400 font-bold text-xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SecureGuard</h1>
            <p className="text-sm text-gray-400">Bouncer Portal</p>
          </div>
        </div>
      </div>

      <nav className="mt-8 px-6 space-y-4">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: '📊' },
          { id: 'bookings', name: 'Book Security', icon: '📅' },
          { id: 'availability', name: 'Availability', icon: '⏰' },
          { id: 'profile', name: 'Profile', icon: '👤' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl text-left transition-all duration-300 shadow-lg ${
              activeTab === item.id
                ? 'bg-green-600/20 border border-green-500/30 text-green-400 shadow-xl transform scale-[1.02]'
                : 'bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 hover:text-white hover:shadow-xl hover:transform hover:scale-[1.01]'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold text-base">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-8 left-6 right-6">
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-700 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-green-600/20 border border-green-500/30">
              <span className="font-bold text-sm text-green-400">{getInitials()}</span>
            </div>
            <div>
              <p className="font-semibold text-white">{getFullName()}</p>
              <p className="text-sm text-gray-400">Security Professional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MainContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="p-8 space-y-8 bg-black min-h-screen">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-gray-400">Manage your bookings and availability</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow" style={{backgroundColor: '#FFFCF7'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-3xl font-bold text-blue-700">3</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <span className="text-blue-700 text-2xl">📅</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow" style={{backgroundColor: '#FFFCF7'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-blue-700">$2,450</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <span className="text-green-700 text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow" style={{backgroundColor: '#FFFCF7'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-3xl font-bold text-blue-700">4.9</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <span className="text-yellow-600 text-2xl">⭐</span>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Card */}
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200" style={{backgroundColor: '#FFFCF7'}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-700">Availability Status</h3>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Toggle your availability to receive new booking requests
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAvailable ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAvailable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-blue-700 font-medium">
                {isAvailable ? 'You are available for bookings' : 'You are not available for bookings'}
              </span>
            </div>
          </div>

          {/* New Booking Requests */}
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200" style={{backgroundColor: '#FFFCF7'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-blue-700">New Booking Requests</h3>
              <button
                onClick={fetchBookingRequests}
                disabled={loading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="space-y-4">
              {loading && pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading booking requests...</p>
                </div>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{request.eventName}</h4>
                        <p className="text-gray-600">{request.date} • {request.time}</p>
                        <p className="text-gray-500 text-sm">📍 {request.location}</p>
                        {request.description && (
                          <p className="text-gray-500 text-sm mt-1">{request.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            ID: {request.id.slice(-8)}
                          </span>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            {request.status || 'Pending'}
                          </span>
                          {request.createdAt && (
                            <span className="text-xs text-gray-500">
                              Posted: {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-bold text-gray-900">${request.price}</p>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                            Accept
                          </button>
                          <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">📝</span>
                  <p className="font-medium">No new requests</p>
                  <p className="text-sm">New booking requests will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200" style={{backgroundColor: '#FFFCF7'}}>
            <h3 className="text-xl font-bold text-blue-700 mb-6">Upcoming Bookings</h3>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{booking.title}</h4>
                      <p className="text-gray-600">{booking.date} • {booking.time}</p>
                      <p className="text-gray-500 text-sm">📍 {booking.location}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-gray-900">{booking.pay}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'Accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>
        <div className="p-8 rounded-2xl shadow-sm border border-gray-200" style={{backgroundColor: '#FFFCF7'}}>
          <p className="text-gray-600">This section is under development.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <MainContent />
        </div>
      </div>
    </div>
  );
};

export default BouncerDashboard;