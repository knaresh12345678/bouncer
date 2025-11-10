import React, { useState, useEffect, useCallback } from 'react';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { LogOut, User, Settings, Bell, UserPlus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';

const BouncerDashboard: React.FC = () => {
  // State management
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { bookingRequests } = useBooking();
  const { logout, currentUser } = useAuth();
  const [apiBookingRequests, setApiBookingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBookClientsModal, setShowBookClientsModal] = useState(false);
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [myProfiles, setMyProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState<any>(null);
  const [individualBookings, setIndividualBookings] = useState<any[]>([]);
  const [groupBookings, setGroupBookings] = useState<any[]>([]);
  const [isLoadingIndividual, setIsLoadingIndividual] = useState(false);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [bookingWorkType, setBookingWorkType] = useState<'individual' | 'group'>('individual');

  // Dashboard metrics state
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  // Get pending booking requests from both local context and API
  const pendingRequests = [...bookingRequests.filter(request => request.status === 'pending'), ...apiBookingRequests];

  // Fetch booking requests from API - memoized to prevent recreation
  const fetchBookingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bouncer_access_token');
      const response = await axios.get('/bookings/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('📋 Booking API Response:', response.data);
      if (response.data?.bookings) {
        console.log('✅ Bookings received:', response.data.bookings.length);
        if (response.data.bookings.length > 0) {
          const firstBooking = response.data.bookings[0];
          console.log('📊 First booking full data:', firstBooking);
          console.log('  📝 Event Name:', firstBooking.event_name);
          console.log('  📍 Location:', firstBooking.event_location);
          console.log('  📅 Start DateTime:', firstBooking.start_datetime);
          console.log('  ⏰ End DateTime:', firstBooking.end_datetime);
          console.log('  💰 Total Amount:', firstBooking.total_amount);
          console.log('  💵 Hourly Rate:', firstBooking.hourly_rate);
          console.log('  👤 User Info:', firstBooking.user_info);
        }
        setApiBookingRequests(response.data.bookings);
      } else {
        console.log('⚠️ No bookings in response');
      }
    } catch (error) {
      console.error('❌ Error fetching booking requests:', error);
      toast.error('Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard metrics - memoized to prevent recreation
  const fetchDashboardMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    try {
      const token = localStorage.getItem('bouncer_access_token');
      const response = await axios.get('/bouncer/dashboard/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('📊 Dashboard Metrics:', response.data);
      if (response.data?.success) {
        setDashboardMetrics(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);

  // Fetch booking requests on component mount
  useEffect(() => {
    fetchBookingRequests();
    fetchDashboardMetrics();
    // Disabled auto-refresh to prevent modal re-renders
    // const interval = setInterval(fetchBookingRequests, 30000);
    // return () => clearInterval(interval);
  }, [fetchBookingRequests, fetchDashboardMetrics]);

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

  // State for dynamic upcoming bookings data
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Function to fetch upcoming bookings from backend - memoized to prevent recreation
  const fetchUpcomingBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const token = localStorage.getItem('bouncer_access_token');
      if (!token) return;

      // TODO: Replace with actual API endpoint
      // const response = await axios.get('/api/bouncers/bookings/upcoming', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // setUpcomingBookings(response.data);

      // Placeholder: Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now, keep empty array
      setUpcomingBookings([]);
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      setUpcomingBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  // Function to fetch bouncer's own profiles - memoized to prevent recreation
  const fetchMyProfiles = useCallback(async () => {
    setIsLoadingProfiles(true);
    try {
      const token = localStorage.getItem('bouncer_access_token');
      if (!token) {
        console.warn('No authentication token found');
        return;
      }

      const response = await axios.get('/service-profiles/my-profiles');

      if (response.data && response.data.success) {
        setMyProfiles(response.data.profiles || []);
      }
    } catch (error) {
      console.error('Error fetching my profiles:', error);
      setMyProfiles([]);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, []);

  // Handler to open edit modal with profile data
  const handleEditProfile = (profile: any) => {
    setEditingProfile(profile);
    setShowEditProfileModal(true);
  };

  // Handler to open delete confirmation modal
  const handleDeleteProfile = (profile: any) => {
    setDeletingProfile(profile);
    setShowDeleteConfirmModal(true);
  };

  // Handler to confirm deletion
  const confirmDeleteProfile = async () => {
    if (!deletingProfile) return;

    try {
      const response = await axios.delete(`/service-profiles/${deletingProfile.id}`);

      if (response.data.success) {
        toast.success('Profile deleted successfully');
        // Refresh profiles list
        await fetchMyProfiles();
        setShowDeleteConfirmModal(false);
        setDeletingProfile(null);
      }
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete profile');
    }
  };

  // Handler to toggle profile active status
  const handleToggleStatus = async (profile: any) => {
    const newStatus = !profile.is_active;
    const statusText = newStatus ? 'activated' : 'deactivated';

    try {
      // Update profile status via PUT endpoint
      const response = await axios.put(`/service-profiles/${profile.id}`, {
        ...profile,
        is_active: newStatus
      });

      if (response.data.success) {
        toast.success(`Profile ${statusText} successfully`);
        // Refresh profiles list to show updated status
        await fetchMyProfiles();
      }
    } catch (error: any) {
      console.error('Error toggling profile status:', error);
      toast.error(error.response?.data?.detail || `Failed to ${newStatus ? 'activate' : 'deactivate'} profile`);
    }
  };

  // Handler to toggle ALL profiles' availability status
  const handleBulkAvailabilityToggle = async (newAvailability: boolean) => {
    try {
      // If no profiles exist, just toggle the switch
      if (myProfiles.length === 0) {
        setIsAvailable(newAvailability);
        toast.info('No profiles to update');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('Updating all profiles...');

      // Update all profiles
      const updatePromises = myProfiles.map(profile =>
        axios.put(`/service-profiles/${profile.id}`, {
          ...profile,
          is_active: newAvailability
        })
      );

      await Promise.all(updatePromises);

      // Update local state
      setIsAvailable(newAvailability);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success message
      if (newAvailability) {
        toast.success('All profiles are now Available', {
          icon: '✅',
          style: {
            background: '#43A047',
            color: 'white',
          },
        });
      } else {
        toast.success('All profiles marked as Unavailable', {
          icon: '⚠️',
          style: {
            background: '#9E9E9E',
            color: 'white',
          },
        });
      }

      // Refresh profiles list to show updated status
      await fetchMyProfiles();
    } catch (error: any) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update profiles availability');
      // Revert the toggle on error
      setIsAvailable(!newAvailability);
    }
  };

  // Fetch individual booking requests
  const fetchIndividualBookings = useCallback(async () => {
    setIsLoadingIndividual(true);
    try {
      const response = await axios.get('/bookings/individual');
      if (response.data && response.data.success) {
        setIndividualBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching individual bookings:', error);
      toast.error('Failed to load individual booking requests');
    } finally {
      setIsLoadingIndividual(false);
    }
  }, []);

  // Fetch group booking requests
  const fetchGroupBookings = useCallback(async () => {
    setIsLoadingGroup(true);
    try {
      const response = await axios.get('/bookings/group');
      if (response.data && response.data.success) {
        setGroupBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching group bookings:', error);
      toast.error('Failed to load group booking requests');
    } finally {
      setIsLoadingGroup(false);
    }
  }, []);

  // Handle accept booking
  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const response = await axios.patch(`/bookings/${bookingId}/status?status=accepted`);
      if (response.data.success) {
        toast.success('Booking accepted successfully!');
        // Refresh both lists
        await fetchIndividualBookings();
        await fetchGroupBookings();
      }
    } catch (error: any) {
      console.error('Error accepting booking:', error);
      toast.error(error.response?.data?.detail || 'Failed to accept booking');
    }
  };

  // Handle reject booking
  const handleRejectBooking = async (bookingId: string) => {
    try {
      const response = await axios.patch(`/bookings/${bookingId}/status?status=rejected`);
      if (response.data.success) {
        toast.success('Booking rejected');
        // Refresh both lists
        await fetchIndividualBookings();
        await fetchGroupBookings();
      }
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      toast.error(error.response?.data?.detail || 'Failed to reject booking');
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchUpcomingBookings();
    fetchMyProfiles();
  }, []);

  // Fetch booking requests when bookings tab is opened
  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchIndividualBookings();
      fetchGroupBookings();
    }
  }, [activeTab, fetchIndividualBookings, fetchGroupBookings]);

  // Show welcome toast POPUP on component mount
  // IMPORTANT: Only the toast popup disappears after 5 seconds, the dashboard remains visible
  useEffect(() => {
    // Display a temporary welcome popup that auto-dismisses after 5 seconds
    // The main dashboard content stays visible - only this popup vanishes
    const welcomeToast = toast.success(
      `Welcome back, ${getFullName()}! 👋`,
      {
        duration: 5000, // Auto-dismiss after 5 seconds
        position: 'top-center',
        style: {
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)',
          backdropFilter: 'blur(12px)',
        },
        icon: '🛡️',
        iconTheme: {
          primary: '#3b82f6',
          secondary: '#fff',
        },
      }
    );

    // Cleanup function - dismiss toast if user navigates away before it auto-dismisses
    return () => {
      toast.dismiss(welcomeToast);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // TopBar component
  const TopBar = () => (
    <div className="h-16 backdrop-blur-lg bg-[#111319]/70 border-b border-gray-700/50 flex items-center justify-between px-6 shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30">
          <span className="text-blue-400 font-bold text-xl">🛡️</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">MyBouncer Portal</h1>
          <p className="text-xs text-gray-400">Professional Security Dashboard</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-[#1E2028]/90 border border-gray-700/50 hover:bg-[#252930] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Bell className="w-5 h-5 text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg bg-[#1E2028]/90 border border-gray-700/50 hover:bg-[#252930] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Settings className="w-5 h-5 text-gray-300" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-4 pr-4 py-2 rounded-lg bg-[#1E2028]/90 border border-gray-700/50">
          <div className="p-1 rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
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
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600/20 border border-red-600/30 hover:bg-red-600/30 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] group"
        >
          <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300" />
          <span className="text-sm font-medium text-red-400 group-hover:text-red-300 hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="w-64 min-h-screen bg-[#12141B] border-r border-gray-800/50">
      <nav className="mt-6 px-6 space-y-3">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: '📊' },
          { id: 'bookings', name: 'Book Clients', icon: '🤝' },
          { id: 'availability', name: 'Availability', icon: '⏰' },
          { id: 'profile', name: 'Post Profile', icon: '👤' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-5 py-4 rounded-xl text-left transition-all duration-300 ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transform scale-[1.02]'
                : 'bg-[#1E2230]/50 border border-gray-700/30 text-gray-300 hover:bg-[#1E2230] hover:border-gray-600/50 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:transform hover:scale-[1.01]'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold text-base">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-8 left-6 right-6">
        <div className="bg-[#1E2028]/90 backdrop-blur-md p-5 rounded-xl border border-gray-700/50 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30">
              <span className="font-bold text-sm text-blue-400">{getInitials()}</span>
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{getFullName()}</p>
              <p className="text-xs text-gray-400">Security Professional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MainContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F1117] to-[#1A1D25] p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
              <p className="text-gray-400">Manage your bookings and availability</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active Bookings */}
              <div className="group bg-[#1E2028]/90 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#2E3340] p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">Active Bookings</p>
                    {isLoadingMetrics ? (
                      <div className="animate-pulse bg-gray-700 h-10 w-16 rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-white">
                        {dashboardMetrics?.active_bookings?.count ?? 0}
                      </p>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-600/10 flex items-center justify-center border border-blue-500/30 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
              </div>

              {/* This Month Earnings */}
              <div className="group bg-[#1E2028]/90 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#2E3340] p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(34,197,94,0.2)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">
                      {dashboardMetrics?.monthly_stats?.month || 'This Month'}
                    </p>
                    {isLoadingMetrics ? (
                      <div className="animate-pulse bg-gray-700 h-10 w-24 rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-white">
                        ₹{dashboardMetrics?.monthly_stats?.revenue?.toLocaleString('en-IN') ?? '0'}
                      </p>
                    )}
                    {!isLoadingMetrics && dashboardMetrics?.monthly_stats && (
                      <p className="text-xs text-gray-500 mt-1">
                        {dashboardMetrics.monthly_stats.bookings_count} bookings • {dashboardMetrics.monthly_stats.hours_worked}h
                      </p>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-600/20 to-green-600/10 flex items-center justify-center border border-green-500/30 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="group bg-[#1E2028]/90 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#2E3340] p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(251,191,36,0.2)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">Rating</p>
                    {isLoadingMetrics ? (
                      <div className="animate-pulse bg-gray-700 h-10 w-16 rounded"></div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-white">
                          {dashboardMetrics?.rating?.average > 0
                            ? dashboardMetrics.rating.average.toFixed(1)
                            : 'N/A'}
                        </p>
                        {dashboardMetrics?.rating && dashboardMetrics.rating.total_reviews > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {dashboardMetrics.rating.total_reviews} reviews
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-600/20 to-yellow-600/10 flex items-center justify-center border border-yellow-500/30 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all duration-300">
                    <span className="text-2xl">⭐</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Card */}
            <div className="bg-[#1B1D25]/90 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#2E3340] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Availability Status</h3>
                  <p className="text-sm text-gray-400">Manage your availability to receive bookings</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isAvailable ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-6">
                <button
                  onClick={() => handleBulkAvailabilityToggle(!isAvailable)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                    isAvailable
                      ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-[0_0_15px_rgba(67,160,71,0.5)]'
                      : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      isAvailable ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-gray-300 font-medium text-sm">
                  {isAvailable ? 'You are available for bookings' : 'You are not available for bookings'}
                </span>
              </div>
            </div>

            {/* New Booking Requests */}
            <div className="bg-[#1B1D25]/90 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#2E3340] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">New Booking Requests</h3>
                  <p className="text-sm text-gray-400 mt-1">Review and accept new client requests</p>
                </div>
                <button
                  onClick={fetchBookingRequests}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <div className="space-y-4">
                {loading && pendingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading booking requests...</p>
                  </div>
                ) : pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => {
                    // Format date and time
                    const formatDateTime = (dateStr: string) => {
                      try {
                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) return null;
                        return {
                          date: date.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
                          time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                        };
                      } catch (error) {
                        console.error('Error formatting date:', error);
                        return null;
                      }
                    };

                    const startDT = request.start_datetime ? formatDateTime(request.start_datetime) : null;
                    const endDT = request.end_datetime ? formatDateTime(request.end_datetime) : null;

                    // Calculate duration
                    const calculateDuration = () => {
                      if (!request.start_datetime || !request.end_datetime) return null;
                      try {
                        const start = new Date(request.start_datetime);
                        const end = new Date(request.end_datetime);
                        const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
                        return hours > 0 ? hours : null;
                      } catch (error) {
                        return null;
                      }
                    };
                    const duration = calculateDuration();

                    return (
                      <div key={request.id} className="bg-[#1E2230]/50 border border-gray-700/50 rounded-xl p-6 hover:bg-[#1E2230] hover:border-gray-600/50 transition-all duration-300 hover:shadow-[0_4px_15px_rgba(59,130,246,0.1)]">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                          {/* Main Content */}
                          <div className="flex-1 space-y-4">
                            {/* Event Name & Description */}
                            <div>
                              <h4 className="font-bold text-white text-xl mb-2">{request.event_name}</h4>
                              {request.event_description && (
                                <p className="text-gray-400 text-sm leading-relaxed">{request.event_description}</p>
                              )}
                            </div>

                            {/* Client Information */}
                            {request.user_info && (
                              <div className="bg-[#252A38]/50 rounded-lg p-4 border border-gray-700/30">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Client Information</p>
                                <div className="space-y-1.5">
                                  <p className="text-white text-sm font-medium">
                                    👤 {request.user_info.first_name} {request.user_info.last_name}
                                  </p>
                                  <p className="text-gray-300 text-sm">
                                    📧 {request.user_info.email}
                                  </p>
                                  {request.user_info.phone && request.user_info.phone !== 'N/A' && (
                                    <p className="text-gray-300 text-sm">
                                      📞 {request.user_info.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Event Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Date & Time */}
                              <div className="flex items-start gap-3">
                                <div className="text-blue-400 mt-0.5">📅</div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date & Time</p>
                                  {startDT ? (
                                    <>
                                      <p className="text-white text-sm font-medium">{startDT.date}</p>
                                      <p className="text-gray-300 text-sm">{startDT.time}{endDT && ` - ${endDT.time}`}</p>
                                      {duration && <p className="text-gray-400 text-xs mt-1">Duration: {duration} hours</p>}
                                    </>
                                  ) : (
                                    <p className="text-gray-400 text-sm">Not specified</p>
                                  )}
                                </div>
                              </div>

                              {/* Location */}
                              <div className="flex items-start gap-3">
                                <div className="text-blue-400 mt-0.5">📍</div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                                  <p className="text-white text-sm font-medium">{request.event_location || 'Not specified'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Special Requirements */}
                            {request.special_requirements && request.special_requirements.trim() && (
                              <div className="flex items-start gap-3">
                                <div className="text-amber-400 mt-0.5">⚠️</div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Special Requirements</p>
                                  <p className="text-gray-300 text-sm">{request.special_requirements}</p>
                                </div>
                              </div>
                            )}

                            {/* Metadata */}
                            <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-gray-700/30">
                              <span className="text-xs bg-gray-700/50 text-gray-300 px-3 py-1.5 rounded-full border border-gray-600/30">
                                ID: {request.id.slice(-8)}
                              </span>
                              <span className="text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-500/30 font-medium uppercase">
                                {request.status}
                              </span>
                              {request.created_at && (
                                <span className="text-xs text-gray-500">
                                  Posted: {new Date(request.created_at).toLocaleDateString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Payment & Actions */}
                          <div className="lg:min-w-[200px] text-left lg:text-right space-y-4">
                            {/* Payment Information */}
                            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-lg p-4 border border-blue-500/20">
                              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Payment</p>
                              <p className="font-bold text-white text-3xl mb-1">₹{request.total_amount?.toLocaleString('en-IN')}</p>
                              {request.hourly_rate && (
                                <p className="text-sm text-gray-400">₹{request.hourly_rate}/hour</p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex lg:flex-col gap-2">
                              <button className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-bold rounded-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all duration-300 hover:scale-105 hover:-translate-y-0.5">
                                Accept Job
                              </button>
                              <button className="flex-1 px-4 py-3 border border-gray-600/50 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700/30 hover:border-gray-500 transition-all duration-300">
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center border border-blue-500/30">
                      <span className="text-4xl">📝</span>
                    </div>
                    <p className="font-semibold text-white mb-2">No new requests</p>
                    <p className="text-sm text-gray-400">New booking requests will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-[#1B1D25]/90 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#2E3340] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Upcoming Bookings</h3>
                  <p className="text-sm text-gray-400 mt-1">Your confirmed security assignments</p>
                </div>
                <button
                  onClick={fetchUpcomingBookings}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-105"
                >
                  Refresh
                </button>
              </div>

              {isLoadingBookings ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">Loading bookings...</span>
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center border border-blue-500/30">
                    <span className="text-6xl">📅</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-3">No upcoming bookings</h4>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    You don't have any upcoming bookings yet. New bookings will appear here once clients confirm your services.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="bg-[#1E2230]/50 border border-gray-700/30 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">✅</div>
                      <p className="text-sm text-gray-300">Keep your profile updated</p>
                    </div>
                    <div className="bg-[#1E2230]/50 border border-gray-700/30 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">🔔</div>
                      <p className="text-sm text-gray-300">Enable notifications</p>
                    </div>
                    <div className="bg-[#1E2230]/50 border border-gray-700/30 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">⭐</div>
                      <p className="text-sm text-gray-300">Maintain good ratings</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="bg-[#1E2230]/50 border border-gray-700/50 rounded-xl p-5 hover:bg-[#1E2230] hover:border-gray-600/50 transition-all duration-300 cursor-pointer hover:shadow-[0_4px_15px_rgba(59,130,246,0.1)]">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg">{booking.title || 'Security Booking'}</h4>
                          <p className="text-gray-300 text-sm mt-1">📅 {booking.date || 'Date TBD'} • ⏰ {booking.time || 'Time TBD'}</p>
                          <p className="text-gray-400 text-sm">📍 {booking.location || 'Location TBD'}</p>
                          {booking.clientName && (
                            <p className="text-gray-400 text-sm mt-1">👤 Client: {booking.clientName}</p>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          <p className="font-bold text-white text-xl">{booking.pay || booking.payment || '₹0'}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'Accepted' || booking.status === 'Confirmed'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                              : booking.status === 'Pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                              : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
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
          </div>
        </div>
      );

    }

    if (activeTab === 'profile') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#0E0E10] to-[#1A1A1E] p-6 md:p-10 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section - Clean & Centered */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-semibold text-white mb-3 tracking-tight">
                Profile Management
              </h2>
              <p className="text-gray-400 text-base">Create and manage your service profiles</p>

              {/* Soft Divider */}
              <div className="mt-6 mx-auto w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            </div>

            {/* Floating Neon Add Button */}
            <div className="flex justify-end mb-8">
              <button
                onClick={() => setShowAddProfileModal(true)}
                className="group relative flex items-center gap-2.5 px-6 py-3 rounded-full font-medium text-white text-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
                }}
              >
                <UserPlus className="w-5 h-5" />
                <span>Add Profile</span>
              </button>
            </div>

          {/* Loading State - Minimal */}
          {isLoadingProfiles ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500/20 border-t-blue-500"></div>
              </div>
              <span className="mt-4 text-gray-400 text-sm">Loading profiles...</span>
            </div>
          ) : myProfiles.length === 0 ? (
            /* Empty State - Clean & Minimal */
            <div className="max-w-2xl mx-auto">
              <div
                className="rounded-3xl p-16 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-400" />
                </div>

                <h3 className="text-2xl font-semibold text-white mb-3">
                  No Profiles Yet
                </h3>

                <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
                  Create your first service profile to start receiving booking requests from clients
                </p>

                <button
                  onClick={() => setShowAddProfileModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
                  }}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Create Profile</span>
                </button>
              </div>
            </div>
          ) : (
            /* Display Profiles - Ultra-Clean Glass Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myProfiles.map((profile, index) => (
                <div
                  key={profile.id}
                  className="group relative rounded-[20px] transition-all duration-500 hover:-translate-y-1 animate-fadeInUp"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    animationDelay: `${index * 100}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="p-6">
                    {/* Header Badges - Minimal */}
                    <div className="flex items-center justify-between mb-6">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wide ${
                          profile.profile_type === 'individual'
                            ? 'bg-blue-500/10 text-blue-300'
                            : 'bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        {profile.profile_type === 'individual' ? 'Individual' : 'Group'}
                      </span>

                      {/* Interactive Active/Inactive Status Toggle - Clean Design */}
                      <button
                        onClick={() => handleToggleStatus(profile)}
                        className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide cursor-pointer"
                        style={{
                          backgroundColor: profile.is_active ? '#43A047' : '#E53935',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease',
                          opacity: 1,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.opacity = '1';
                        }}
                        title={profile.is_active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    {/* Profile Name - Clean Typography */}
                    <h3 className="text-2xl font-semibold text-white mb-6 tracking-tight">
                      {profile.profile_type === 'individual' ? profile.name : profile.group_name}
                    </h3>

                    {/* Profile Details - Lightweight */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm text-gray-300">{profile.location || 'N/A'}</span>
                      </div>

                      {profile.profile_type === 'individual' && profile.phone_number && (
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm text-gray-300">{profile.phone_number}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-white">₹{profile.amount_per_hour || 0}<span className="text-gray-400 font-normal">/hour</span></span>
                      </div>

                      {profile.profile_type === 'group' && (
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm text-gray-300">{profile.member_count || 0} Members</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-white/5">
                        <span className="text-xs text-gray-500">Created {new Date(profile.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons - Clean & Professional Design */}
                    <div className="flex gap-2.5">
                      {/* Edit Button - Teal Gradient */}
                      <button
                        onClick={() => handleEditProfile(profile)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 font-bold text-sm text-white"
                        style={{
                          background: 'linear-gradient(135deg, #00BFA6, #00796B)',
                          borderRadius: '10px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                          transition: 'all 0.3s ease',
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter = 'brightness(1.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = 'brightness(1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.25)';
                        }}
                      >
                        {/* Pencil Icon */}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      {/* Delete Button - Muted Coral Gradient */}
                      <button
                        onClick={() => handleDeleteProfile(profile)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 font-bold text-sm text-white"
                        style={{
                          background: 'linear-gradient(135deg, #FF6F61, #D84315)',
                          borderRadius: '10px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                          transition: 'all 0.3s ease',
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter = 'brightness(1.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = 'brightness(1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.25)';
                        }}
                      >
                        {/* Trash Icon */}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>
      );
    }

    if (activeTab === 'bookings') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F1117] to-[#1A1D25] p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Book Clients</h2>
              <p className="text-gray-400">Review and accept booking requests from clients</p>
            </div>

            {/* Toggle between Individual and Group */}
            <div className="flex space-x-4 bg-[#1B1D25]/90 backdrop-blur-md rounded-xl p-2 w-fit">
              <button
                onClick={() => setBookingWorkType('individual')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  bookingWorkType === 'individual'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                👤 Work as Individual
              </button>
              <button
                onClick={() => setBookingWorkType('group')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  bookingWorkType === 'group'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                👥 Work as Group
              </button>
            </div>

            {/* Individual Bookings Section */}
            {bookingWorkType === 'individual' && (
              <div className="bg-[#1B1D25]/90 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#2E3340] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Individual Work Requests</h3>
                    <p className="text-sm text-gray-400 mt-1">Solo security job requests from clients</p>
                  </div>
                  <button
                    onClick={fetchIndividualBookings}
                    disabled={isLoadingIndividual}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  >
                    {isLoadingIndividual ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {/* Loading State */}
                {isLoadingIndividual ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading individual booking requests...</p>
                  </div>
                ) : individualBookings.length > 0 ? (
                  <div className="space-y-4">
                    {individualBookings.map((booking) => (
                      <div key={booking.id} className="bg-[#1E2230]/50 border border-gray-700/50 rounded-xl p-5 hover:bg-[#1E2230] hover:border-gray-600/50 transition-all duration-300 hover:shadow-[0_4px_15px_rgba(59,130,246,0.1)]">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-white text-lg">{booking.event_name}</h4>
                              <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                                👤 Individual
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-300">📅 {booking.event_date} • ⏰ {booking.event_time}</p>
                              <p className="text-gray-400">📍 {booking.location}</p>
                              {booking.special_requirements && (
                                <p className="text-gray-500 mt-2">{booking.special_requirements}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              <span className="text-xs bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full border border-gray-600/30">
                                Client: {booking.user_name || 'Unknown'}
                              </span>
                              <span className="text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30">
                                {booking.status || 'Pending'}
                              </span>
                              {booking.created_at && (
                                <span className="text-xs text-gray-500">
                                  Posted: {new Date(booking.created_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-left lg:text-right space-y-3">
                            <p className="font-bold text-white text-2xl">₹{booking.total_amount || booking.hourly_rate}</p>
                            <div className="flex lg:flex-col xl:flex-row gap-2">
                              <button
                                onClick={() => handleAcceptBooking(booking.id)}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-medium rounded-lg hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300 hover:scale-105"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectBooking(booking.id)}
                                className="flex-1 px-4 py-2 border border-gray-600/50 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700/30 hover:border-gray-500 transition-all duration-300"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                      <span className="text-3xl">👤</span>
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">No Individual Requests</h4>
                    <p className="text-gray-400">You don't have any pending individual work requests at the moment.</p>
                  </div>
                )}
              </div>
            )}

            {/* Group Bookings Section */}
            {bookingWorkType === 'group' && (
              <div className="bg-[#1B1D25]/90 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-[#2E3340] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Group Work Requests</h3>
                    <p className="text-sm text-gray-400 mt-1">Team security job requests from clients</p>
                  </div>
                  <button
                    onClick={fetchGroupBookings}
                    disabled={isLoadingGroup}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  >
                    {isLoadingGroup ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {/* Loading State */}
                {isLoadingGroup ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading group booking requests...</p>
                  </div>
                ) : groupBookings.length > 0 ? (
                  <div className="space-y-4">
                    {groupBookings.map((booking) => (
                      <div key={booking.id} className="bg-[#1E2230]/50 border border-gray-700/50 rounded-xl p-5 hover:bg-[#1E2230] hover:border-gray-600/50 transition-all duration-300 hover:shadow-[0_4px_15px_rgba(34,197,94,0.1)]">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-white text-lg">{booking.event_name}</h4>
                              <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                                👥 Group
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-300">📅 {booking.event_date} • ⏰ {booking.event_time}</p>
                              <p className="text-gray-400">📍 {booking.location}</p>
                              {booking.special_requirements && (
                                <p className="text-gray-500 mt-2">{booking.special_requirements}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              <span className="text-xs bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full border border-gray-600/30">
                                Client: {booking.user_name || 'Unknown'}
                              </span>
                              <span className="text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30">
                                {booking.status || 'Pending'}
                              </span>
                              {booking.created_at && (
                                <span className="text-xs text-gray-500">
                                  Posted: {new Date(booking.created_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-left lg:text-right space-y-3">
                            <p className="font-bold text-white text-2xl">₹{booking.total_amount || booking.hourly_rate}</p>
                            <div className="flex lg:flex-col xl:flex-row gap-2">
                              <button
                                onClick={() => handleAcceptBooking(booking.id)}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-medium rounded-lg hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300 hover:scale-105"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectBooking(booking.id)}
                                className="flex-1 px-4 py-2 border border-gray-600/50 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700/30 hover:border-gray-500 transition-all duration-300"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                      <span className="text-3xl">👥</span>
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">No Group Requests</h4>
                    <p className="text-gray-400">You don't have any pending group work requests at the moment.</p>
                  </div>
                )}
              </div>
            )}
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

  // Helper function to create cropped image
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Image Cropper Modal Component
  const ImageCropperModal: React.FC<{
    imageSrc: string;
    isOpen: boolean;
    onClose: () => void;
    onCropComplete: (croppedImage: string) => void;
  }> = ({ imageSrc, isOpen, onClose, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const onCropChange = (location: { x: number; y: number }) => {
      setCrop(location);
    };

    const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropSave = async () => {
      if (!croppedAreaPixels) return;

      setIsCropping(true);
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onCropComplete(croppedImage);
        toast.success('✅ Photo cropped successfully!');
        onClose();
      } catch (error) {
        console.error('Error cropping image:', error);
        toast.error('Failed to crop image. Please try again.');
      } finally {
        setIsCropping(false);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full p-6">
          <div className="flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Crop Your Photo</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cropper Area */}
            <div className="relative w-full h-96 bg-black rounded-xl overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={onCropChange}
                onCropComplete={onCropCompleteHandler}
                onZoomChange={setZoom}
              />
            </div>

            {/* Zoom Control */}
            <div className="flex items-center space-x-4 px-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300 text-center">
                <span className="font-semibold text-blue-400">Tip:</span> Use the slider to zoom in/out and drag to reposition your face in the circle.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                disabled={isCropping}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCropping ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Cropping...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save & Continue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Face Verification Component with AI Matching
  const FaceRecognitionCapture: React.FC<{
    onCapture: (faceData: string) => void;
    capturedData: string | null;
    onPhotoUpload?: (photoData: string) => void;
    uploadedPhoto?: string | null;
  }> = ({ onCapture, capturedData, onPhotoUpload, uploadedPhoto }) => {
    const [showConsentPopup, setShowConsentPopup] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [verificationMode, setVerificationMode] = useState<'upload' | 'verify'>('upload');
    const [isMatching, setIsMatching] = useState(false);
    const [matchResult, setMatchResult] = useState<'success' | 'failure' | null>(null);
    const [matchScore, setMatchScore] = useState<number>(0);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [showCropperModal, setShowCropperModal] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Load face-api.js models on mount
    React.useEffect(() => {
      const loadModels = async () => {
        try {
          const MODEL_URL = '/models'; // Models will be placed in public/models directory
          // Load required models for face detection and recognition
          await Promise.all([
            (window as any).faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            (window as any).faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            (window as any).faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            (window as any).faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
          ]);
          setModelsLoaded(true);
          console.log('✅ Face-api.js models loaded successfully');
        } catch (error) {
          console.error('❌ Error loading face-api.js models:', error);
          toast.error('Failed to load face recognition models');
        }
      };

      // Check if face-api is available
      if (typeof window !== 'undefined' && (window as any).faceapi) {
        loadModels();
      }
    }, []);

    // Stop camera stream
    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setCameraActive(false);
      setMatchResult(null);
    };

    // Handle profile photo upload - opens cropper
    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = e.target?.result as string;
        setTempImageSrc(photoData);
        setShowCropperModal(true);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    // Handle cropped image completion
    const handleCroppedImage = (croppedImage: string) => {
      if (onPhotoUpload) {
        onPhotoUpload(croppedImage);
      }
      setVerificationMode('verify');

      // Automatically trigger verification after 1 second
      setTimeout(() => {
        setShowConsentPopup(true);
        toast.info('📸 Please verify your face with live camera', {
          duration: 4000,
        });
      }, 1000);
    };

    // Start camera after consent
    const handleAgree = async () => {
      setShowConsentPopup(false);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraActive(true);
        toast.success('Camera activated successfully');
      } catch (error) {
        console.error('Camera access error:', error);
        toast.error('Failed to access camera. Please check permissions.');
      }
    };

    // Handle cancel
    const handleCancel = () => {
      setShowConsentPopup(false);
      toast.info('Face verification cancelled');
    };

    // Compare faces using face-api.js
    const compareFaces = async (image1: HTMLImageElement, image2: HTMLCanvasElement) => {
      if (!modelsLoaded) {
        toast.error('Face recognition models not loaded yet. Please wait...');
        return null;
      }

      try {
        const faceapi = (window as any).faceapi;

        // Detect faces in both images
        const detection1 = await faceapi
          .detectSingleFace(image1, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        const detection2 = await faceapi
          .detectSingleFace(image2, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection1 || !detection2) {
          return null;
        }

        // Calculate distance between face descriptors (lower = more similar)
        const distance = faceapi.euclideanDistance(detection1.descriptor, detection2.descriptor);

        // Convert distance to similarity score (0-100%)
        const similarity = Math.max(0, (1 - distance) * 100);

        return similarity;
      } catch (error) {
        console.error('Error comparing faces:', error);
        return null;
      }
    };

    // Capture and verify face
    const captureFace = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const faceDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // If in verification mode and uploaded photo exists, compare faces
      if (verificationMode === 'verify' && uploadedPhoto) {
        setIsMatching(true);

        // Create image element from uploaded photo
        const uploadedImage = new Image();
        uploadedImage.src = uploadedPhoto;

        uploadedImage.onload = async () => {
          const similarity = await compareFaces(uploadedImage, canvas);

          setIsMatching(false);

          if (similarity === null) {
            toast.error('Face not verified. Please ensure proper lighting and retry.');
            setMatchResult('failure');
            setMatchScore(0);
          } else {
            setMatchScore(Math.round(similarity));

            // Consider it a match if similarity is above 80% (high accuracy threshold)
            if (similarity >= 80) {
              toast.success(`✅ Face verified successfully! Match: ${Math.round(similarity)}%`);
              setMatchResult('success');
              onCapture(faceDataUrl);
            } else {
              toast.error(`Face not verified (${Math.round(similarity)}%). Please ensure proper lighting and retry.`);
              setMatchResult('failure');
            }
          }

          setIsCapturing(false);

          // Auto-close camera after 3 seconds if successful
          if (similarity && similarity >= 80) {
            setTimeout(() => {
              stopCamera();
            }, 3000);
          }
        };
      } else {
        // Simple capture without verification
        onCapture(faceDataUrl);
        setTimeout(() => {
          setIsCapturing(false);
          stopCamera();
          toast.success('✅ Face captured successfully!');
        }, 1000);
      }
    };

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        stopCamera();
      };
    }, []);

    return (
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-200">
          Face Verification <span className="text-red-400">*</span>
        </label>

        {/* Upload Profile Photo Section */}
        {!uploadedPhoto && !cameraActive && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full px-6 py-4 rounded-xl border-2 border-dashed border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-purple-800/10 hover:from-purple-900/30 hover:to-purple-800/20 text-gray-200 transition-all duration-300 flex flex-col items-center justify-center space-y-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Loading...</p>
                    <p className="text-xs text-gray-400 mt-1">Preparing image editor</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Upload Profile Photo</p>
                    <p className="text-xs text-gray-400 mt-1">Select and crop your photo before upload</p>
                  </div>
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center">
              After uploading, you'll verify your identity using live camera
            </p>
          </div>
        )}

        {/* Display Uploaded Photo */}
        {uploadedPhoto && !capturedData && !cameraActive && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden border-2 border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={uploadedPhoto}
                  alt="Profile photo"
                  className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-purple-400 font-semibold">Profile Photo Uploaded</p>
                  </div>
                  <p className="text-xs text-gray-400">Now verify your face using live camera</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onPhotoUpload) onPhotoUpload(null as any);
                    setVerificationMode('upload');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Start Verification Button */}
            <button
              type="button"
              onClick={() => setShowConsentPopup(true)}
              className="w-full px-6 py-4 rounded-xl border-2 border-dashed border-blue-500/40 bg-gradient-to-br from-blue-900/20 to-blue-800/10 hover:from-blue-900/30 hover:to-blue-800/20 text-gray-200 transition-all duration-300 flex flex-col items-center justify-center space-y-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold">Start Face Verification</p>
                <p className="text-xs text-gray-400 mt-1">Verify your identity with live camera</p>
              </div>
            </button>
          </div>
        )}

        {cameraActive && (
          <div className="relative rounded-xl overflow-hidden border-2 border-blue-500/40 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera overlay with face outline */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-64 h-80 border-4 rounded-full relative transition-colors ${
                matchResult === 'success' ? 'border-green-500/80' :
                matchResult === 'failure' ? 'border-red-500/80' :
                'border-blue-500/60'
              }`}>
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full animate-pulse ${
                  matchResult === 'success' ? 'bg-green-500' :
                  matchResult === 'failure' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}></div>
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full animate-pulse ${
                  matchResult === 'success' ? 'bg-green-500' :
                  matchResult === 'failure' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}></div>
                <div className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full animate-pulse ${
                  matchResult === 'success' ? 'bg-green-500' :
                  matchResult === 'failure' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}></div>
                <div className={`absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full animate-pulse ${
                  matchResult === 'success' ? 'bg-green-500' :
                  matchResult === 'failure' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}></div>
              </div>
            </div>

            {/* Match Result Overlay */}
            {matchResult && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
                <div className={`text-center p-6 rounded-2xl ${
                  matchResult === 'success' ? 'bg-green-500/20 border-2 border-green-500' :
                  'bg-red-500/20 border-2 border-red-500'
                }`}>
                  {matchResult === 'success' ? (
                    <>
                      <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-2xl font-bold text-green-400">Face Matched!</p>
                      <p className="text-sm text-green-300 mt-2">Match Score: {matchScore}%</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-2xl font-bold text-red-400">Face Not Matched</p>
                      <p className="text-sm text-red-300 mt-2">Match Score: {matchScore}%</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Matching Progress Indicator */}
            {isMatching && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-center p-6">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white text-lg font-semibold">Analyzing Face...</p>
                  <p className="text-gray-300 text-sm mt-2">Comparing with profile photo</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="absolute top-4 left-0 right-0 text-center">
              <div className="inline-block px-4 py-2 bg-black/70 backdrop-blur-sm rounded-lg">
                <p className="text-white text-sm font-medium">
                  {isMatching ? 'Analyzing...' :
                   isCapturing ? 'Capturing...' :
                   verificationMode === 'verify' ? 'Position your face to match with profile photo' :
                   'Position your face in the oval'}
                </p>
              </div>
            </div>

            {/* Capture button */}
            {!matchResult && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={captureFace}
                  disabled={isCapturing || isMatching}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isCapturing || isMatching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isMatching ? 'Matching...' : 'Capturing...'}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{verificationMode === 'verify' ? 'Verify Face' : 'Capture Face'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  disabled={isMatching}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {capturedData && (
          <div className="relative rounded-xl overflow-hidden border-2 border-green-500/40 bg-gradient-to-br from-green-900/20 to-green-800/10 p-4">
            <div className="flex items-center space-x-4">
              <img
                src={capturedData}
                alt="Captured face"
                className="w-24 h-24 rounded-full object-cover border-2 border-green-500"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-400 font-semibold">Face Verified</p>
                </div>
                <p className="text-xs text-gray-400">Your face has been successfully captured and verified</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onCapture(null as any);
                  setShowConsentPopup(true);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Retake
              </button>
            </div>
          </div>
        )}

        {/* Consent Popup */}
        {showConsentPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full p-8 transform transition-all">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500/40">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Camera Access Required</h3>
                  <p className="text-gray-300 text-base leading-relaxed">
                    This app will use your camera to verify your face for security purposes. Your privacy is important to us.
                  </p>
                </div>

                {/* Privacy notice */}
                <div className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-blue-400">Note:</span> Your face data is only used for verification and will be securely stored.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 w-full">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAgree}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
                  >
                    Agree & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Cropper Modal */}
        <ImageCropperModal
          imageSrc={tempImageSrc}
          isOpen={showCropperModal}
          onClose={() => setShowCropperModal(false)}
          onCropComplete={handleCroppedImage}
        />
      </div>
    );
  };

  // Add Profile Modal Component - Memoized to prevent re-renders
  const AddProfileModal = React.memo(() => {
    const [serviceType, setServiceType] = useState<'individual' | 'group'>('individual');
    const [memberCount, setMemberCount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Individual booking form state
    const [individualData, setIndividualData] = useState({
      name: '',
      location: '',
      phoneNumber: '',
      age: '',
      uploadedPhoto: null as string | null,
      faceData: null as string | null,
      amountPerHour: ''
    });

    // Group booking form state
    const [groupData, setGroupData] = useState({
      groupName: '',
      location: '',
      amountPerHour: '',
      groupPhoto: null as File | null
    });

    // Member details for group booking
    const [members, setMembers] = useState(Array(1).fill(null).map((_, index) => ({
      id: index + 1,
      name: '',
      email: '',
      number: '',
      photo: null as File | null
    })));

    // Update member count and adjust members array
    const handleMemberCountChange = (newCount: number) => {
      setMemberCount(newCount);

      if (newCount > members.length) {
        // Add new members
        const newMembers = Array(newCount - members.length).fill(null).map((_, index) => ({
          id: members.length + index + 1,
          name: '',
          email: '',
          number: '',
          photo: null
        }));
        setMembers([...members, ...newMembers]);
      } else if (newCount < members.length) {
        // Remove members
        setMembers(members.slice(0, newCount));
      }
    };

    // Update member field
    const updateMember = (id: number, field: string, value: any) => {
      setMembers(members.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      ));
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowAddProfileModal(false);
      }
    };

    const handleCloseModal = () => {
      setShowAddProfileModal(false);
      // Reset form state
      setServiceType('individual');
      setMemberCount(1);
      setIndividualData({
        name: '',
        location: '',
        phoneNumber: '',
        age: '',
        uploadedPhoto: null,
        faceData: null,
        amountPerHour: ''
      });
      setGroupData({
        groupName: '',
        location: '',
        amountPerHour: '',
        groupPhoto: null
      });
      setMembers([{
        id: 1,
        name: '',
        email: '',
        number: '',
        photo: null
      }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitError('');
      setSubmitSuccess(false);

      try {
        // Validate token exists
        const token = localStorage.getItem('bouncer_access_token');
        if (!token) {
          setSubmitError('Your session has expired. Please log in again.');
          setIsSubmitting(false);
          return;
        }

        // Prepare profile data based on service type
        const profileData: any = {
          profile_type: serviceType
        };

        if (serviceType === 'individual') {
          // Validate required fields
          if (!individualData.name || !individualData.location || !individualData.phoneNumber || !individualData.age || !individualData.amountPerHour) {
            setSubmitError('Please fill in all required fields');
            setIsSubmitting(false);
            return;
          }

          // Validate age
          const ageNum = parseInt(individualData.age);
          if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
            setSubmitError('Please enter a valid age (18-100)');
            setIsSubmitting(false);
            return;
          }

          profileData.name = individualData.name.trim();
          profileData.location = individualData.location.trim();
          profileData.phone_number = individualData.phoneNumber.trim();
          profileData.age = ageNum;
          profileData.face_data = individualData.faceData;
          profileData.amount_per_hour = parseFloat(individualData.amountPerHour) || 0;
        } else {
          // Validate required fields for group
          if (!groupData.groupName || !groupData.location || !groupData.amountPerHour || members.length === 0) {
            setSubmitError('Please fill in all required fields and add at least one member');
            setIsSubmitting(false);
            return;
          }

          profileData.group_name = groupData.groupName.trim();
          profileData.location = groupData.location.trim();
          profileData.amount_per_hour = parseFloat(groupData.amountPerHour) || 0;
          profileData.member_count = memberCount;
          profileData.members = members.map(m => ({
            name: m.name.trim(),
            email: m.email.trim(),
            number: m.number.trim()
          }));
        }

        // Submit to API (Authorization header added automatically by axios interceptor)
        const response = await axios.post('/service-profiles', profileData);

        // Handle successful response
        if (response.data && response.data.success) {
          setSubmitSuccess(true);

          // Show success toast notification
          toast.success('✅ Profile created successfully!', {
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#10b981',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }
          });

          // Refresh profiles list to show the new profile
          fetchMyProfiles();

          // Show success message for 2 seconds then close
          setTimeout(() => {
            // Reset form state
            setServiceType('individual');
            setIndividualData({ name: '', location: '', phoneNumber: '', age: '', uploadedPhoto: null, faceData: null, amountPerHour: '' });
            setGroupData({ groupName: '', location: '', amountPerHour: '', groupPhoto: null });
            setMembers([{
              id: 1,
              name: '',
              email: '',
              number: '',
              photo: null
            }]);
            setMemberCount(1);

            // Close modal
            handleCloseModal();
          }, 2000);
        } else {
          throw new Error('Unexpected response format from server');
        }
      } catch (error: any) {
        console.error('Error saving profile:', error);

        let errorMessage = 'Failed to save profile. Please try again.';

        // Handle different error types (401 is handled by axios interceptor)
        if (error.response?.status === 400) {
          errorMessage = error.response.data?.detail || 'Invalid data. Please check your inputs.';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Show error toast
        toast.error(errorMessage, {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px'
          }
        });

        setSubmitError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
          backdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={handleOverlayClick}
      >
        <div
          className="w-[90vw] sm:w-[85vw] md:w-[75vw] lg:w-[65vw] xl:w-[55vw] 2xl:w-[45vw] transform transition-all duration-300 ease-out my-4"
          style={{
            maxWidth: '900px',
            minWidth: '320px',
            maxHeight: '95vh',
            overflowY: 'auto',
            animation: 'scaleIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Container */}
          <div
            className="rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1F2937 0%, #111827 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #9CA3AF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Add Profile
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Create your service profile</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/30 transition-all duration-200 flex items-center justify-center"
                  style={{ fontSize: '20px', lineHeight: '1' }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Service Type Toggle - Modern Tab Style */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-200 mb-3">
                    Select Service Type <span className="text-red-400 ml-1">*</span>
                  </label>
                  <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-1.5 rounded-xl border border-gray-700/50 shadow-inner">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setServiceType('individual')}
                        className={`relative px-6 py-3.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                          serviceType === 'individual'
                            ? 'text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                        style={{
                          background: serviceType === 'individual'
                            ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                            : 'transparent',
                          boxShadow: serviceType === 'individual'
                            ? '0 4px 12px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.5)'
                            : 'none',
                          transform: serviceType === 'individual' ? 'scale(1.02)' : 'scale(1)'
                        }}
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span>👤</span>
                          <span>Individual</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setServiceType('group')}
                        className={`relative px-6 py-3.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                          serviceType === 'group'
                            ? 'text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                        style={{
                          background: serviceType === 'group'
                            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                            : 'transparent',
                          boxShadow: serviceType === 'group'
                            ? '0 4px 12px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.5)'
                            : 'none',
                          transform: serviceType === 'group' ? 'scale(1.02)' : 'scale(1)'
                        }}
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span>👥</span>
                          <span>Group</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Individual Booking Fields */}
                {serviceType === 'individual' && (
                  <div className="space-y-5">
                    {/* Section Header with Icon */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-gradient-to-r from-blue-500/30 via-blue-400/20 to-transparent">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-500/10 flex items-center justify-center border border-blue-500/30">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Individual Details</h3>
                        <p className="text-xs text-gray-400">Provide your professional information</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={individualData.name}
                          onChange={(e) => setIndividualData({...individualData, name: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-800/80 transition-all duration-300 shadow-sm"
                          placeholder="Enter your full name"
                          style={{
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">
                          Location <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={individualData.location}
                          onChange={(e) => setIndividualData({...individualData, location: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-800/80 transition-all duration-300 shadow-sm"
                          placeholder="City, State"
                          style={{
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">
                          Phone Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          value={individualData.phoneNumber}
                          onChange={(e) => setIndividualData({...individualData, phoneNumber: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-800/80 transition-all duration-300 shadow-sm"
                          placeholder="+91 XXXXX XXXXX"
                          style={{
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">
                          Age <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          min="18"
                          max="100"
                          value={individualData.age}
                          onChange={(e) => setIndividualData({...individualData, age: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-800/80 transition-all duration-300 shadow-sm"
                          placeholder="Enter your age (18+)"
                          style={{
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">
                          Hourly Rate (₹) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                          <input
                            type="number"
                            value={individualData.amountPerHour}
                            onChange={(e) => setIndividualData({...individualData, amountPerHour: e.target.value})}
                            className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-800/80 transition-all duration-300 shadow-sm"
                            placeholder="Enter rate per hour"
                            style={{
                              backdropFilter: 'blur(8px)'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Face Recognition Section with AI Matching */}
                    <FaceRecognitionCapture
                      onCapture={(faceData) => setIndividualData({...individualData, faceData})}
                      capturedData={individualData.faceData}
                      onPhotoUpload={(photoData) => setIndividualData({...individualData, uploadedPhoto: photoData})}
                      uploadedPhoto={individualData.uploadedPhoto}
                    />
                  </div>
                )}

                {/* Group Booking Fields */}
                {serviceType === 'group' && (
                  <div className="space-y-5">
                    {/* Section Header with Icon */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-gradient-to-r from-green-500/30 via-green-400/20 to-transparent">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600/20 to-green-500/10 flex items-center justify-center border border-green-500/30">
                        <span className="text-xl">👥</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Group Details</h3>
                        <p className="text-xs text-gray-400">Provide your team information</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">
                          Group Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={groupData.groupName}
                          onChange={(e) => setGroupData({...groupData, groupName: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-gray-800/80 transition-all duration-300 shadow-sm"
                          placeholder="Enter team name"
                          style={{
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">
                          Location <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={groupData.location}
                          onChange={(e) => setGroupData({...groupData, location: e.target.value})}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-gray-800/80 transition-all duration-300 shadow-sm"
                          placeholder="City, State"
                          style={{
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">
                          Number of Members <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={memberCount}
                          onChange={(e) => handleMemberCountChange(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-gray-800/80 transition-all duration-300 shadow-sm"
                          placeholder="1-50 members"
                          style={{
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">
                          Hourly Rate (₹) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                          <input
                            type="number"
                            value={groupData.amountPerHour}
                            onChange={(e) => setGroupData({...groupData, amountPerHour: e.target.value})}
                            className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-gray-800/80 transition-all duration-300 shadow-sm"
                            placeholder="Enter rate per hour"
                            style={{
                              backdropFilter: 'blur(8px)'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-200">
                        Group Photo <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setGroupData({...groupData, groupPhoto: e.target.files?.[0] || null})}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-300 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-green-600 file:to-green-500 file:text-white hover:file:from-green-700 hover:file:to-green-600 file:shadow-lg file:transition-all file:duration-200 transition-all duration-300 shadow-sm cursor-pointer"
                          style={{
                            backdropFilter: 'blur(8px)'
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">Recommended: Square image, max 5MB</p>
                    </div>

                    {/* Dynamic Member Table */}
                    <div className="mt-7 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-bold text-white">Member Details</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Add information for each team member</p>
                        </div>
                        <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/30">
                          {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                        </span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 shadow-inner">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-gray-700/50 bg-gradient-to-r from-gray-800/60 to-gray-900/60">
                              <th className="text-left py-4 px-4 text-xs font-bold text-gray-300 uppercase tracking-wider">Name</th>
                              <th className="text-left py-4 px-4 text-xs font-bold text-gray-300 uppercase tracking-wider">Email</th>
                              <th className="text-left py-4 px-4 text-xs font-bold text-gray-300 uppercase tracking-wider">Phone</th>
                              <th className="text-left py-4 px-4 text-xs font-bold text-gray-300 uppercase tracking-wider">Photo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700/30">
                            {members.map((member, index) => (
                              <tr key={member.id} className="hover:bg-gray-800/30 transition-colors duration-150">
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-xs font-semibold text-green-400">
                                      {index + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={member.name}
                                      onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                      className="flex-1 px-3 py-2.5 rounded-lg border border-gray-600/30 bg-gray-800/60 text-gray-100 text-sm placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                                      placeholder="Full name"
                                      style={{ backdropFilter: 'blur(4px)' }}
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <input
                                    type="email"
                                    value={member.email}
                                    onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-600/30 bg-gray-800/60 text-gray-100 text-sm placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                                    placeholder="email@example.com"
                                    style={{ backdropFilter: 'blur(4px)' }}
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <input
                                    type="tel"
                                    value={member.number}
                                    onChange={(e) => updateMember(member.id, 'number', e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-600/30 bg-gray-800/60 text-gray-100 text-sm placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                                    placeholder="+91 XXXXX"
                                    style={{ backdropFilter: 'blur(4px)' }}
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => updateMember(member.id, 'photo', e.target.files?.[0] || null)}
                                    className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gradient-to-r file:from-green-600 file:to-green-500 file:text-white hover:file:from-green-700 hover:file:to-green-600 file:transition-all file:duration-200 cursor-pointer"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {submitSuccess && (
                  <div
                    className="p-4 rounded-lg border-2 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
                      borderColor: '#10B981',
                      animation: 'slideInDown 0.5s ease-out'
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-400 text-center font-semibold text-lg">
                        Profile saved successfully!
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div
                    className="p-4 rounded-lg border-2 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
                      borderColor: '#EF4444',
                      animation: 'shake 0.5s ease-out'
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-red-400 text-center font-medium">{submitError}</p>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-2 border-t border-gray-700/50">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3.5 rounded-xl border-2 border-gray-600/40 text-gray-300 hover:bg-gray-700/40 hover:text-white hover:border-gray-500/60 hover:scale-[1.02] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm"
                    style={{
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || submitSuccess}
                    className="flex-1 px-6 py-3.5 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2.5 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden group"
                    style={{
                      background: submitSuccess
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : serviceType === 'individual'
                        ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                        : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      boxShadow: submitSuccess
                        ? '0 10px 30px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.5)'
                        : serviceType === 'individual'
                        ? '0 10px 30px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.5)'
                        : '0 10px 30px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.5)'
                    }}
                  >
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </div>

                    {isSubmitting && (
                      <svg className="animate-spin h-5 w-5 text-white relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {submitSuccess && (
                      <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className="relative z-10 text-base">
                      {isSubmitting ? 'Saving Profile...' : submitSuccess ? 'Profile Saved!' : 'Create Profile'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes shake {
            0%, 100% {
              transform: translateX(0);
            }
            10%, 30%, 50%, 70%, 90% {
              transform: translateX(-5px);
            }
            20%, 40%, 60%, 80% {
              transform: translateX(5px);
            }
          }
        `}</style>
      </div>
    );
  });

  // Book Clients Modal Component - Memoized to prevent re-renders
  const BookClientsModal = React.memo(() => {
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowBookClientsModal(false);
      }
    };

    const handleIndividualBooking = () => {
      // TODO: Implement individual booking logic
      console.log('Individual booking selected');
      setShowBookClientsModal(false);
    };

    const handleGroupBooking = () => {
      // TODO: Implement group booking logic
      console.log('Group booking selected');
      setShowBookClientsModal(false);
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={handleOverlayClick}
      >
        <div
          className="w-full max-w-md transform transition-all duration-300 ease-out"
          style={{
            animation: 'scaleIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Container */}
          <div
            className="rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1F2937 0%, #111827 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #9CA3AF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Book Clients
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Choose your booking preference</p>
                </div>
                <button
                  onClick={() => setShowBookClientsModal(false)}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/30 transition-all duration-200 flex items-center justify-center"
                  style={{ fontSize: '20px', lineHeight: '1' }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Question */}
                <div className="text-center">
                  <p className="text-lg text-gray-300 mb-6">
                    Are you interested in booking individually?
                  </p>
                </div>

                {/* Booking Options */}
                <div className="space-y-4">
                  {/* Individual Booking Option */}
                  <button
                    onClick={handleIndividualBooking}
                    className="w-full p-6 rounded-xl border-2 border-green-600/30 bg-green-600/10 hover:bg-green-600/20 hover:border-green-600/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-green-400 group-hover:text-green-300">
                          Work as Individual
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Work with clients one-on-one for personalized service
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Group Booking Option */}
                  <button
                    onClick={handleGroupBooking}
                    className="w-full p-6 rounded-xl border-2 border-blue-600/30 bg-blue-600/10 hover:bg-blue-600/20 hover:border-blue-600/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-blue-400 group-hover:text-blue-300">
                          Work as Group
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Join a team for larger events and venues
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Additional Info */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Select your preferred booking type to continue
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  // Edit Profile Modal Component - Memoized to prevent re-renders
  const EditProfileModal = React.memo(() => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      name: editingProfile?.name || '',
      group_name: editingProfile?.group_name || '',
      location: editingProfile?.location || '',
      phone_number: editingProfile?.phone_number || '',
      amount_per_hour: editingProfile?.amount_per_hour || '',
      member_count: editingProfile?.member_count || 1
    });

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowEditProfileModal(false);
      }
    };

    const handleCloseModal = () => {
      setShowEditProfileModal(false);
      setEditingProfile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const profileData: any = {
          profile_type: editingProfile.profile_type
        };

        if (editingProfile.profile_type === 'individual') {
          profileData.name = formData.name.trim();
          profileData.location = formData.location.trim();
          profileData.phone_number = formData.phone_number.trim();
          profileData.amount_per_hour = parseFloat(formData.amount_per_hour) || 0;
        } else {
          profileData.group_name = formData.group_name.trim();
          profileData.location = formData.location.trim();
          profileData.amount_per_hour = parseFloat(formData.amount_per_hour) || 0;
          profileData.member_count = parseInt(formData.member_count) || 1;
        }

        const response = await axios.put(`/service-profiles/${editingProfile.id}`, profileData);

        if (response.data.success) {
          toast.success('Profile updated successfully');
          await fetchMyProfiles();
          handleCloseModal();
        }
      } catch (error: any) {
        console.error('Error updating profile:', error);
        toast.error(error.response?.data?.detail || 'Failed to update profile');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!editingProfile) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
          backdropFilter: 'blur(12px)'
        }}
        onClick={handleOverlayClick}
      >
        <div
          className="w-full max-w-2xl transform transition-all duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1F2937 0%, #111827 100%)'
            }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Edit Profile
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {editingProfile.profile_type === 'individual' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      value={formData.group_name}
                      onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Member Count *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.member_count}
                      onChange={(e) => setFormData({ ...formData, member_count: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount Per Hour (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount_per_hour}
                  onChange={(e) => setFormData({ ...formData, amount_per_hour: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  });

  // Delete Confirmation Modal Component - Memoized to prevent re-renders
  const DeleteConfirmModal = React.memo(() => {
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowDeleteConfirmModal(false);
      }
    };

    const handleCloseModal = () => {
      setShowDeleteConfirmModal(false);
      setDeletingProfile(null);
    };

    if (!deletingProfile) return null;

    const profileName = deletingProfile.profile_type === 'individual'
      ? deletingProfile.name
      : deletingProfile.group_name;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={handleOverlayClick}
      >
        <div
          className="w-full max-w-md transform transition-all duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 p-6">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Delete Profile?
            </h2>
            <p className="text-gray-400 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">{profileName}</span>? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProfile}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  });

  // CSS Animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      /* Smooth toast popup animations */
      /* NOTE: These animations ONLY affect the toast popup, NOT the dashboard */
      /* The dashboard remains fully visible - only the welcome toast vanishes */

      @keyframes toastEnter {
        0% {
          opacity: 0;
          transform: translateY(-100%) scale(0.6);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes toastExit {
        0% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-50%) scale(0.8);
        }
      }

      /* Apply smooth animations to react-hot-toast popups only */
      [data-rich-toast] {
        animation: toastEnter 0.4s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Smooth fade-out animation when toast auto-dismisses after 5 seconds */
      [data-rich-toast][data-visible="false"] {
        animation: toastExit 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
      }

      /* Enhance toast hover effect */
      [data-rich-toast]:hover {
        transform: scale(1.02);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.3);
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1117] to-[#1A1D25]">
      {/* Toast Notifications with smooth animations */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Global toast options
          duration: 5000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          },
          // Success toast options
          success: {
            duration: 5000,
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
          // Error toast options
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <TopBar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 overflow-x-hidden">
          <MainContent />
        </div>
      </div>

      {/* Book Clients Modal */}
      {showBookClientsModal && <BookClientsModal />}

      {/* Add Profile Modal */}
      {showAddProfileModal && <AddProfileModal />}

      {/* Edit Profile Modal */}
      {showEditProfileModal && <EditProfileModal />}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && <DeleteConfirmModal />}
    </div>
  );
};

export default BouncerDashboard;
