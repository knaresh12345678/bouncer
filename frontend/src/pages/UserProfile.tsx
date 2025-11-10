import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Edit,
  Save,
  X,
  Calendar,
  DollarSign,
  Camera,
  Loader,
  RefreshCw,
  ArrowLeft,
  Check,
  LogOut
} from 'lucide-react';

interface UserProfile {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    lastLogin: string;
    role: string;
  };
  profile: {
    bio: string;
    locationAddress: string;
    locationLat: number | null;
    locationLng: number | null;
    emergencyContactName: string;
    emergencyContactPhone: string;
  };
  stats: {
    totalBookings: number;
    acceptedBookings: number;
    pendingBookings: number;
    rejectedBookings: number;
  };
}

interface Booking {
  id: string;
  eventName: string;
  eventLocation: string;
  eventDate: string;
  eventTime: string;
  budget: string;
  status: string;
  createdAt: string;
  bookingType: string;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'personal' | 'address' | 'account' | 'bookings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    locationAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    console.log('[PROFILE] Component mounted, fetching profile data...');
    fetchProfileData();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (profileData) {
      console.log('[PROFILE] Profile data received, updating form:', profileData);
      setFormData({
        firstName: profileData.user.firstName,
        lastName: profileData.user.lastName,
        phone: profileData.user.phone,
        bio: profileData.profile.bio,
        locationAddress: profileData.profile.locationAddress,
        emergencyContactName: profileData.profile.emergencyContactName,
        emergencyContactPhone: profileData.profile.emergencyContactPhone,
      });
      setAvatarPreview(profileData.user.avatarUrl);
    }
  }, [profileData]);

  const fetchProfileData = async (attempt: number = 1) => {
    try {
      console.log(`[PROFILE] Fetching profile data (attempt ${attempt}/3)...`);
      setLoading(true);

      const token = localStorage.getItem('bouncer_access_token');
      console.log('[PROFILE] Token exists:', !!token);

      if (!token) {
        toast.error('No authentication token found. Please login again.');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
        return;
      }

      const response = await axios.get('/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[PROFILE] API Response:', response.data);

      if (response.data.success) {
        setProfileData(response.data);
        setRetryCount(0);
        console.log('[PROFILE] Profile data set successfully');
        toast.success('Profile loaded successfully');
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error: any) {
      console.error('[PROFILE] Error fetching profile:', error);
      console.error('[PROFILE] Error details:', error.response?.data);

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 404) {
        const errorMsg = error.response?.data?.detail || 'Authentication failed';

        // If this was a user not found error (404), show helpful message
        if (error.response?.status === 404) {
          toast.error('User not found. This usually means you need to logout and login again.');
        } else {
          toast.error('Session expired. Please login again.');
        }

        setTimeout(() => {
          logout();
          navigate('/login');
        }, 3000);
        return;
      }

      // Retry logic for other errors
      if (attempt < 3) {
        console.log(`[PROFILE] Retrying in 1 second... (attempt ${attempt + 1}/3)`);
        setRetryCount(attempt);
        setTimeout(() => {
          fetchProfileData(attempt + 1);
        }, 1000);
      } else {
        toast.error(error.response?.data?.detail || 'Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (filter?: string) => {
    try {
      console.log('[PROFILE] Fetching bookings with filter:', filter);
      const params = filter && filter !== 'all' ? { status: filter } : {};
      const token = localStorage.getItem('bouncer_access_token');

      const response = await axios.get('/user/bookings', {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[PROFILE] Bookings response:', response.data);

      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error: any) {
      console.error('[PROFILE] Error fetching bookings:', error);
      // Don't show error toast for bookings as it's not critical
    }
  };

  const handleUpdateProfile = async () => {
    try {
      console.log('[PROFILE] Updating profile with data:', formData);
      setSaving(true);

      const token = localStorage.getItem('bouncer_access_token');
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.firstName);
      formDataToSend.append('last_name', formData.lastName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('location_address', formData.locationAddress);
      formDataToSend.append('emergency_contact_name', formData.emergencyContactName);
      formDataToSend.append('emergency_contact_phone', formData.emergencyContactPhone);

      const response = await axios.put('/user/profile', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('[PROFILE] Update response:', response.data);

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);

        // Refresh profile data to show latest changes
        console.log('[PROFILE] Refreshing profile data after update...');
        await fetchProfileData();

        // Update localStorage with new user data
        const storedUser = localStorage.getItem('bouncer_current_user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            userData.firstName = formData.firstName;
            userData.lastName = formData.lastName;
            localStorage.setItem('bouncer_current_user', JSON.stringify(userData));
            console.log('[PROFILE] Updated localStorage user data');
          } catch (e) {
            console.error('[PROFILE] Error updating localStorage:', e);
          }
        }
      }
    } catch (error: any) {
      console.error('[PROFILE] Error updating profile:', error);
      console.error('[PROFILE] Error details:', error.response?.data);
      toast.error(error.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      console.log('[PROFILE] Changing password...');
      const token = localStorage.getItem('bouncer_access_token');
      const formDataToSend = new FormData();
      formDataToSend.append('current_password', passwordData.currentPassword);
      formDataToSend.append('new_password', passwordData.newPassword);
      formDataToSend.append('confirm_password', passwordData.confirmPassword);

      const response = await axios.post('/user/change-password', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('[PROFILE] Password change response:', response.data);

      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error: any) {
      console.error('[PROFILE] Error changing password:', error);
      console.error('[PROFILE] Error details:', error.response?.data);
      toast.error(error.response?.data?.detail || 'Failed to change password. Please check your current password.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      console.log('[PROFILE] Uploading avatar...');
      setUploadingAvatar(true);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        console.log('[PROFILE] Avatar converted to base64, length:', base64String.length);

        // Show preview immediately
        setAvatarPreview(base64String);

        try {
          const token = localStorage.getItem('bouncer_access_token');
          const formData = new FormData();
          formData.append('avatar_data', base64String);

          const response = await axios.post('/user/upload-avatar', formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });

          console.log('[PROFILE] Avatar upload response:', response.data);

          if (response.data.success) {
            toast.success('Profile picture updated!');
            // Refresh profile to get the updated avatar URL
            await fetchProfileData();
          }
        } catch (error: any) {
          console.error('[PROFILE] Error uploading avatar:', error);
          toast.error(error.response?.data?.detail || 'Failed to upload image');
          // Reset preview on error
          setAvatarPreview(profileData?.user.avatarUrl || '');
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('[PROFILE] Error reading file:', error);
      toast.error('Failed to read image file');
      setUploadingAvatar(false);
    }
  };

  const handleBookingFilterChange = (filter: 'all' | 'pending' | 'accepted' | 'rejected') => {
    console.log('[PROFILE] Changing booking filter to:', filter);
    setBookingFilter(filter);
    fetchBookings(filter);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original profile data
    if (profileData) {
      setFormData({
        firstName: profileData.user.firstName,
        lastName: profileData.user.lastName,
        phone: profileData.user.phone,
        bio: profileData.profile.bio,
        locationAddress: profileData.profile.locationAddress,
        emergencyContactName: profileData.profile.emergencyContactName,
        emergencyContactPhone: profileData.profile.emergencyContactPhone,
      });
    }
    setIsEditing(false);
  };

  // Loading state
  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <div className="text-white text-xl">Loading profile...</div>
          {retryCount > 0 && (
            <div className="text-gray-400 text-sm mt-2">
              Retry attempt {retryCount}/3
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state with retry
  if (!profileData && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-red-400 mb-2">Failed to Load Profile</h3>
            <p className="text-gray-300 mb-4">
              User not found. This usually means you need to logout and login again with a fresh token.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => fetchProfileData()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry</span>
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Logout and Login Again
            </button>

            <button
              onClick={() => navigate('/user')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/user')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">My Profile</h1>
            </div>
            <button
              onClick={() => navigate('/user')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 sticky top-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'overview' ? 'bg-indigo-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <User className="inline w-5 h-5 mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveSection('personal')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'personal' ? 'bg-indigo-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <Edit className="inline w-5 h-5 mr-2" />
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveSection('address')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'address' ? 'bg-indigo-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <MapPin className="inline w-5 h-5 mr-2" />
                  Address & Emergency Contact
                </button>
                <button
                  onClick={() => setActiveSection('account')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'account' ? 'bg-indigo-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <Lock className="inline w-5 h-5 mr-2" />
                  Account Security
                </button>
                <button
                  onClick={() => setActiveSection('bookings')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'bookings' ? 'bg-indigo-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <Calendar className="inline w-5 h-5 mr-2" />
                  Booking History
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-gray-700">
                        {uploadingAvatar ? (
                          <Loader className="w-8 h-8 text-white animate-spin" />
                        ) : avatarPreview ? (
                          <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-16 h-16 text-white" />
                        )}
                      </div>
                      <label className={`absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 rounded-full p-3 cursor-pointer transition-all shadow-lg ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Camera className="w-5 h-5 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-1">
                        {profileData?.user.firstName} {profileData?.user.lastName}
                      </h2>
                      <p className="text-gray-400 mb-3">Client / Event Organizer</p>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{profileData?.user.email}</span>
                        </div>
                        {profileData?.user.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{profileData.user.phone}</span>
                          </div>
                        )}
                        {profileData?.user.isVerified && (
                          <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/50">
                            <Check className="w-4 h-4 mr-1" />
                            Verified User
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-indigo-500/50 transition-all">
                    <div className="text-gray-400 text-sm mb-2">Total Bookings</div>
                    <div className="text-3xl font-bold">{profileData?.stats.totalBookings || 0}</div>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-green-700/50 p-6 hover:border-green-500/50 transition-all">
                    <div className="text-gray-400 text-sm mb-2">Accepted</div>
                    <div className="text-3xl font-bold text-green-400">{profileData?.stats.acceptedBookings || 0}</div>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-yellow-700/50 p-6 hover:border-yellow-500/50 transition-all">
                    <div className="text-gray-400 text-sm mb-2">Pending</div>
                    <div className="text-3xl font-bold text-yellow-400">{profileData?.stats.pendingBookings || 0}</div>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-red-700/50 p-6 hover:border-red-500/50 transition-all">
                    <div className="text-gray-400 text-sm mb-2">Rejected</div>
                    <div className="text-3xl font-bold text-red-400">{profileData?.stats.rejectedBookings || 0}</div>
                  </div>
                </div>

                {/* Bio */}
                {profileData?.profile.bio && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-indigo-400" />
                      About Me
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{profileData.profile.bio}</p>
                  </div>
                )}
              </div>
            )}

            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold">Personal Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileData?.user.email}
                        disabled
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white opacity-50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Address & Location Section */}
            {activeSection === 'address' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold">Address & Emergency Contact</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Current Address
                    </label>
                    <textarea
                      value={formData.locationAddress}
                      onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter your full address"
                    />
                  </div>

                  <div className="border-t border-gray-600 pt-6">
                    <h4 className="text-lg font-semibold mb-4 text-red-400 flex items-center">
                      <Phone className="w-5 h-5 mr-2" />
                      Emergency Contact
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Contact Name</label>
                        <input
                          type="text"
                          value={formData.emergencyContactName}
                          onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="Emergency contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Contact Phone</label>
                        <input
                          type="tel"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                          disabled={!isEditing}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="Emergency contact phone"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Settings Section */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <h3 className="text-2xl font-semibold mb-6 flex items-center">
                    <Lock className="w-6 h-6 mr-2 text-indigo-400" />
                    Change Password
                  </h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 8 characters with uppercase, lowercase, and number
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-semibold flex items-center space-x-2"
                    >
                      <Lock className="w-5 h-5" />
                      <span>Change Password</span>
                    </button>
                  </form>
                </div>

                {/* Account Actions */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <h3 className="text-2xl font-semibold mb-6">Account Actions</h3>
                  <div className="space-y-4">
                    <button
                      onClick={logout}
                      className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold text-left flex items-center justify-between group"
                    >
                      <span>Logout from this device</span>
                      <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Booking History Section */}
            {activeSection === 'bookings' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <h3 className="text-2xl font-semibold">Booking History</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleBookingFilterChange('all')}
                      className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                        bookingFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleBookingFilterChange('pending')}
                      className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                        bookingFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleBookingFilterChange('accepted')}
                      className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                        bookingFilter === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      Accepted
                    </button>
                    <button
                      onClick={() => handleBookingFilterChange('rejected')}
                      className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                        bookingFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      Rejected
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-16">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-500" />
                      <p className="text-gray-400 text-lg">No bookings found</p>
                      <p className="text-gray-500 text-sm mt-2">
                        {bookingFilter !== 'all' ? `No ${bookingFilter} bookings` : 'Start by creating a new booking'}
                      </p>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gray-700/50 rounded-lg p-5 border border-gray-600 hover:border-indigo-500/50 transition-all group"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start space-y-3 sm:space-y-0">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
                              {booking.eventName}
                            </h4>
                            <div className="space-y-1 text-sm text-gray-400">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.eventLocation}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{booking.eventDate} at {booking.eventTime}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 flex-shrink-0" />
                                <span>Budget: ₹{booking.budget}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end space-y-2">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                              {booking.bookingType}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
