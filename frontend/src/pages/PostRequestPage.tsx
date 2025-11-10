import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import axios from 'axios';
import { ArrowLeft, Calendar, MapPin, Clock, DollarSign, FileText } from 'lucide-react';

const PostRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBookingRequest } = useBooking();

  // Form state
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Form validation
  const validateForm = () => {
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('bouncer_access_token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Submit to backend API
      const response = await axios.post('/bookings/', {
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

        // Show success message and redirect to dashboard
        alert('Bouncer request posted successfully! Redirecting to dashboard...');
        navigate('/user');
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

  // Handle cancel button
  const handleCancel = () => {
    navigate('/user');
  };

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Header */}
      <div className="dashboard-nav h-16 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg dashboard-glass-card hover:border-blue-500/40 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" style={{color: 'var(--dashboard-text-muted)'}} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{color: 'var(--dashboard-text)'}}>Post Bouncer Request</h1>
            <p className="text-xs" style={{color: 'var(--dashboard-text-muted)'}}>Create a new security request</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 pl-4 pr-4 py-2 rounded-lg dashboard-glass-card">
            <div className="p-1 rounded-full" style={{background: 'linear-gradient(135deg, var(--dashboard-accent-blue), var(--dashboard-accent-purple))'}}>
              <span className="text-white font-bold text-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{color: 'var(--dashboard-text)'}}>
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs" style={{color: 'var(--dashboard-text-muted)'}}>Customer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-bg min-h-screen p-4 md:p-6 lg:p-8">
        {/* Floating Orbs Background */}
        <div className="dashboard-float-orb floating-orb-1"></div>
        <div className="dashboard-float-orb floating-orb-2"></div>
        <div className="dashboard-float-orb floating-orb-3"></div>

        {/* Circuit Pattern */}
        <div className="dashboard-circuit"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="dashboard-glass-card p-8">
            {/* Form Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{background: 'linear-gradient(135deg, var(--dashboard-accent-blue), var(--dashboard-accent-purple))'}}>
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{color: 'var(--dashboard-text)'}}>
                Create Bouncer Request
              </h2>
              <p style={{color: 'var(--dashboard-text-muted)'}}>
                Fill in the details below to post your security requirements
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Name */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-2" style={{color: 'var(--dashboard-text)'}}>
                  <FileText className="w-4 h-4" />
                  <span>Event Name *</span>
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className={`dashboard-input ${errors.eventName ? 'border-red-500' : ''}`}
                  placeholder="Wedding, Birthday Party, Corporate Event..."
                  autoComplete="off"
                />
                {errors.eventName && (
                  <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-2" style={{color: 'var(--dashboard-text)'}}>
                  <MapPin className="w-4 h-4" />
                  <span>Location *</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`dashboard-input ${errors.location ? 'border-red-500' : ''}`}
                  placeholder="Venue address or location"
                  autoComplete="off"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium mb-2" style={{color: 'var(--dashboard-text)'}}>
                    <Calendar className="w-4 h-4" />
                    <span>Date *</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`dashboard-input ${errors.date ? 'border-red-500' : ''}`}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium mb-2" style={{color: 'var(--dashboard-text)'}}>
                    <Clock className="w-4 h-4" />
                    <span>Time *</span>
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`dashboard-input ${errors.time ? 'border-red-500' : ''}`}
                  />
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                  )}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-2" style={{color: 'var(--dashboard-text)'}}>
                  <DollarSign className="w-4 h-4" />
                  <span>Budget ($) *</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`dashboard-input ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="Enter your budget"
                  autoComplete="off"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              {/* Additional Details */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium mb-2" style={{color: 'var(--dashboard-text)'}}>
                  <FileText className="w-4 h-4" />
                  <span>Additional Details</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="dashboard-input resize-none"
                  placeholder="Any specific requirements or details..."
                  autoComplete="off"
                />
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-sm">{submitError}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 dashboard-glass-card hover:border-red-500/40 transition-all duration-200 hover:scale-105 font-medium"
                  style={{color: 'var(--dashboard-text)'}}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 dashboard-neon-btn disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Posting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostRequestPage;