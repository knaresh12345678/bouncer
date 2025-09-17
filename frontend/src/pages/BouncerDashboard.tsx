import React, { useState } from 'react';

const BouncerDashboard: React.FC = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

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
    <div className="bg-white w-64 min-h-screen shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-700 p-2 rounded-xl">
            <span className="text-white font-bold text-xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SecureGuard</h1>
            <p className="text-sm text-gray-500">Bouncer Portal</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: '📊' },
          { id: 'bookings', name: 'My Bookings', icon: '📅' },
          { id: 'availability', name: 'Availability', icon: '⏰' },
          { id: 'profile', name: 'Profile', icon: '👤' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gray-50 p-4 rounded-xl">
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <span className="text-blue-700 text-2xl">📅</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">$2,450</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <span className="text-green-700 text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rating</p>
                  <p className="text-3xl font-bold text-gray-900">4.9</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <span className="text-yellow-600 text-2xl">⭐</span>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Availability Status</h3>
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
              <span className="text-gray-700 font-medium">
                {isAvailable ? 'You are available for bookings' : 'You are not available for bookings'}
              </span>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Bookings</h3>
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <p className="text-gray-600">This section is under development.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1">
        <MainContent />
      </div>
    </div>
  );
};

export default BouncerDashboard;