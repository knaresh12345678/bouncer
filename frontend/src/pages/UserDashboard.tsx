import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const Sidebar = () => (
    <div className="bg-white w-64 min-h-screen shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-700 p-2 rounded-xl">
            <span className="text-white font-bold text-xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SecureGuard</h1>
            <p className="text-sm text-gray-500">Customer Portal</p>
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
              <span className="text-white font-bold text-sm">{getInitials()}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{getFullName()}</p>
              <p className="text-sm text-gray-500">Customer</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.first_name || 'User'}!</h2>
            <p className="text-gray-600">Manage your security bookings and services</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
              <h3 className="text-lg font-semibold mb-2">Book Security</h3>
              <p className="text-blue-100 mb-4">Find professionals for your event</p>
              <button
                onClick={() => setActiveTab('book')}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Start Booking
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">2</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <span className="text-green-700 text-2xl">📅</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">$1,355</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <span className="text-purple-700 text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h3>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{booking.title}</h4>
                      <p className="text-gray-600">{booking.date} • {booking.time}</p>
                      <p className="text-gray-500 text-sm">📍 {booking.location}</p>
                      <p className="text-gray-500 text-sm">👤 {booking.bouncer}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-gray-900">{booking.amount}</p>
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Available Professionals</h3>
              <button
                onClick={() => setActiveTab('book')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All →
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'Mike Johnson', rating: 4.9, experience: '8 years', rate: '$45/hr' },
                { name: 'Sarah Wilson', rating: 4.8, experience: '6 years', rate: '$40/hr' },
                { name: 'David Brown', rating: 4.7, experience: '10 years', rate: '$50/hr' }
              ].map((bouncer, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-700 p-2 rounded-full">
                      <span className="text-white font-bold text-sm">
                        {bouncer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{bouncer.name}</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400 text-sm">⭐</span>
                        <span className="text-gray-600 text-sm">{bouncer.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
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

export default UserDashboard;