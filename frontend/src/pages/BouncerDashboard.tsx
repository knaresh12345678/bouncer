import React, { useState } from 'react';
import { useBooking } from '../contexts/BookingContext';

const BouncerDashboard: React.FC = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { bookingRequests } = useBooking();

  // Get pending booking requests
  const pendingRequests = bookingRequests.filter(request => request.status === 'pending');

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

  const Sidebar = () => (
    <div className="w-64 min-h-screen shadow-lg" style={{backgroundColor: '#450B36'}}>
      <div className="p-6 border-b border-purple-600">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-700 p-2 rounded-xl">
            <span className="text-white font-bold text-xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SecureGuard</h1>
            <p className="text-sm text-purple-200">Bouncer Portal</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 px-4 space-y-3">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: '📊' },
          { id: 'bookings', name: 'My Bookings', icon: '📅' },
          { id: 'availability', name: 'Availability', icon: '⏰' },
          { id: 'profile', name: 'Profile', icon: '👤' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 shadow-sm ${
              activeTab === item.id
                ? 'bg-white text-blue-700 border-2 border-blue-500 shadow-md transform scale-105'
                : 'bg-white text-gray-700 hover:shadow-md hover:bg-blue-50 hover:text-gray-900'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-700 p-2 rounded-full">
              <span className="text-white font-bold text-sm">JD</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">John Doe</p>
              <p className="text-sm text-gray-500">Bouncer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MainContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="p-8 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Manage your bookings and availability</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow" style={{backgroundColor: '#A66B0F'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-200">Active Bookings</p>
                  <p className="text-3xl font-bold text-white">3</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <span className="text-blue-700 text-2xl">📅</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow" style={{backgroundColor: '#A66B0F'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-200">This Month</p>
                  <p className="text-3xl font-bold text-white">$2,450</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <span className="text-green-700 text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow" style={{backgroundColor: '#A66B0F'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-200">Rating</p>
                  <p className="text-3xl font-bold text-white">4.9</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <span className="text-yellow-600 text-2xl">⭐</span>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Card */}
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200" style={{backgroundColor: '#A66B0F'}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Availability Status</h3>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </div>
            </div>
            <p className="text-orange-200 mb-6">
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
              <span className="text-white font-medium">
                {isAvailable ? 'You are available for bookings' : 'You are not available for bookings'}
              </span>
            </div>
          </div>

          {/* New Booking Requests */}
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200" style={{backgroundColor: '#A66B0F'}}>
            <h3 className="text-xl font-bold text-white mb-6">New Booking Requests</h3>
            <div className="space-y-4">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{request.eventName}</h4>
                        <p className="text-gray-600">{request.date} • {request.time}</p>
                        <p className="text-gray-500 text-sm">📍 {request.location}</p>
                        {request.description && (
                          <p className="text-gray-500 text-sm mt-1">{request.description}</p>
                        )}
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
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200" style={{backgroundColor: '#A66B0F'}}>
            <h3 className="text-xl font-bold text-white mb-6">Upcoming Bookings</h3>
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
        <div className="p-8 rounded-2xl shadow-sm border border-gray-200" style={{backgroundColor: '#A66B0F'}}>
          <p className="text-orange-200">This section is under development.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex" style={{
      backgroundColor: '#450B36'
    }}>
      <Sidebar />
      <div className="flex-1">
        <MainContent />
      </div>
    </div>
  );
};

export default BouncerDashboard;