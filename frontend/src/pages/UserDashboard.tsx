import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking, Bouncer, BookingRequest } from '../contexts/BookingContext';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getAvailableBouncers, createBookingRequest, makeBooking, getUserBookings } = useBooking();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWantBouncerForm, setShowWantBouncerForm] = useState(false);
  const [showStartBooking, setShowStartBooking] = useState(false);
  const [bookingType, setBookingType] = useState<'individual' | 'group' | null>(null);
  const [selectedBouncers, setSelectedBouncers] = useState<Bouncer[]>([]);
  const [wantBouncerForm, setWantBouncerForm] = useState({
    eventName: '',
    location: '',
    date: '',
    time: '',
    price: '',
    description: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="w-64 min-h-screen shadow-lg" style={{backgroundColor: '#450B36'}}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-700 p-2 rounded-xl">
            <span className="text-white font-bold text-xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SecureGuard</h1>
            <p className="text-sm text-purple-200">Customer Portal</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 px-4 space-y-3">
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
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.first_name || 'User'}!</h2>
            <p className="text-yellow-100">Manage your security bookings and services</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Start Booking Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2">Start Booking</h3>
              <p className="text-blue-100 mb-4">Find available professionals for your event</p>
              <button
                onClick={() => setShowStartBooking(true)}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Browse Bouncers
              </button>
            </div>

            {/* Want Bouncer Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-2xl text-white hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold mb-2">Want Bouncer</h3>
              <p className="text-blue-100 mb-4">Post your event requirements</p>
              <button
                onClick={() => setShowWantBouncerForm(true)}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Post Request
              </button>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow" style={{backgroundColor: '#A66B0F', borderColor: '#8B5A0C'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-100">Active Bookings</p>
                  <p className="text-3xl font-bold text-white">2</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <span className="text-green-700 text-2xl">📅</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow" style={{backgroundColor: '#A66B0F', borderColor: '#8B5A0C'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-100">Total Spent</p>
                  <p className="text-3xl font-bold text-white">$1,355</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <span className="text-purple-700 text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="p-6 rounded-2xl shadow-sm border" style={{backgroundColor: '#A66B0F', borderColor: '#8B5A0C'}}>
            <h3 className="text-xl font-bold text-white mb-6">Recent Bookings</h3>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="rounded-xl p-4 hover:shadow-md transition-shadow" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)'}}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{booking.title}</h4>
                      <p className="text-yellow-100">{booking.date} • {booking.time}</p>
                      <p className="text-yellow-200 text-sm">📍 {booking.location}</p>
                      <p className="text-yellow-200 text-sm">👤 {booking.bouncer}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-white">{booking.amount}</p>
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
          <div className="p-6 rounded-2xl shadow-sm border" style={{backgroundColor: '#A66B0F', borderColor: '#8B5A0C'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Available Professionals</h3>
              <button
                onClick={() => setActiveTab('book')}
                className="text-yellow-200 hover:text-yellow-100 font-medium text-sm"
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
                <div key={index} className="rounded-xl p-4 hover:shadow-md transition-shadow" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)'}}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-700 p-2 rounded-full">
                      <span className="text-white font-bold text-sm">
                        {bouncer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{bouncer.name}</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400 text-sm">⭐</span>
                        <span className="text-yellow-200 text-sm">{bouncer.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-yellow-200 space-y-1">
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
        <h2 className="text-3xl font-bold text-white mb-4">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>
        <div className="p-8 rounded-2xl shadow-sm border" style={{backgroundColor: '#A66B0F', borderColor: '#8B5A0C'}}>
          <p className="text-yellow-100">This section is under development.</p>
        </div>
      </div>
    );
  };

  // Form validation
  const validateWantBouncerForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!wantBouncerForm.eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!wantBouncerForm.location.trim()) newErrors.location = 'Location is required';
    if (!wantBouncerForm.date) newErrors.date = 'Date is required';
    if (!wantBouncerForm.time) newErrors.time = 'Time is required';
    if (!wantBouncerForm.price || isNaN(Number(wantBouncerForm.price))) {
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
    try {
      await createBookingRequest({
        eventName: wantBouncerForm.eventName,
        location: wantBouncerForm.location,
        date: wantBouncerForm.date,
        time: wantBouncerForm.time,
        price: Number(wantBouncerForm.price),
        userId: user?.id || '',
        description: wantBouncerForm.description
      });

      // Reset form and close modal
      setWantBouncerForm({
        eventName: '',
        location: '',
        date: '',
        time: '',
        price: '',
        description: ''
      });
      setShowWantBouncerForm(false);
      setErrors({});

      // Show success message (you could add a toast notification here)
      alert('Bouncer request posted successfully!');
    } catch (error) {
      console.error('Error creating booking request:', error);
      alert('Failed to post request. Please try again.');
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
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Want Bouncer</h2>
            <button
              onClick={() => setShowWantBouncerForm(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleWantBouncerSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                value={wantBouncerForm.eventName}
                onChange={(e) => setWantBouncerForm(prev => ({ ...prev, eventName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.eventName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Wedding, Birthday Party, Corporate Event..."
              />
              {errors.eventName && <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={wantBouncerForm.location}
                onChange={(e) => setWantBouncerForm(prev => ({ ...prev, location: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Venue address or location"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={wantBouncerForm.date}
                  onChange={(e) => setWantBouncerForm(prev => ({ ...prev, date: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={wantBouncerForm.time}
                  onChange={(e) => setWantBouncerForm(prev => ({ ...prev, time: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.time ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={wantBouncerForm.price}
                onChange={(e) => setWantBouncerForm(prev => ({ ...prev, price: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your budget"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Details
              </label>
              <textarea
                rows={3}
                value={wantBouncerForm.description}
                onChange={(e) => setWantBouncerForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any specific requirements or details..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowWantBouncerForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Start Booking</h2>
              <button
                onClick={() => {
                  setShowStartBooking(false);
                  setBookingType(null);
                  setSelectedBouncers([]);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {!bookingType ? (
              <div className="space-y-6">
                <p className="text-gray-600 mb-6">Choose your booking type:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setBookingType('individual')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">👤</span>
                      <h3 className="text-lg font-semibold text-gray-900">Individual Bouncer</h3>
                    </div>
                    <p className="text-gray-600">Select one professional for your event</p>
                  </button>

                  <button
                    onClick={() => setBookingType('group')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">👥</span>
                      <h3 className="text-lg font-semibold text-gray-900">Group Booking</h3>
                    </div>
                    <p className="text-gray-600">Select multiple professionals for your event</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {bookingType === 'individual' ? 'Select Individual Bouncer' : 'Select Group of Bouncers'}
                  </h3>
                  <button
                    onClick={() => {
                      setBookingType(null);
                      setSelectedBouncers([]);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ← Back to selection
                  </button>
                </div>

                {availableBouncers.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">😔</span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bouncers Available</h3>
                    <p className="text-gray-600">All professionals are currently busy. Please try again later.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {availableBouncers.map((bouncer) => (
                        <div
                          key={bouncer.id}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedBouncers.some(b => b.id === bouncer.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => handleBouncerSelection(bouncer)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="bg-blue-700 p-3 rounded-full">
                                <span className="text-white font-bold">
                                  {bouncer.firstName[0]}{bouncer.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {bouncer.firstName} {bouncer.lastName}
                                </h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span className="flex items-center space-x-1">
                                    <span className="text-yellow-400">⭐</span>
                                    <span>{bouncer.rating}</span>
                                  </span>
                                  <span>{bouncer.experience} experience</span>
                                  <span>${bouncer.hourlyRate}/hr</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{bouncer.bio}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex flex-wrap gap-1 mb-2">
                                {bouncer.specialties.slice(0, 2).map((specialty, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
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
                            <p className="font-semibold text-gray-900">
                              Selected: {selectedBouncers.length} bouncer(s)
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: ${selectedBouncers.reduce((sum, b) => sum + b.hourlyRate, 0)}/hr
                            </p>
                          </div>
                          <button
                            onClick={handleBookingConfirm}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen flex" style={{
      backgroundColor: '#450B36'
    }}>
      <Sidebar />
      <div className="flex-1">
        <MainContent />
      </div>

      {/* Modals */}
      {showWantBouncerForm && <WantBouncerModal />}
      {showStartBooking && <StartBookingModal />}
    </div>
  );
};

export default UserDashboard;