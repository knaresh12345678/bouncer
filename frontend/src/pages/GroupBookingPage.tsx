import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, Users, RefreshCw } from 'lucide-react';

const GroupBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groupProfiles, setGroupProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch group profiles from backend
  const fetchGroupProfiles = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('[GROUP] Fetching group profiles from API...');

      const response = await axios.get('/service-profiles');

      console.log('[GROUP] API Response:', response.data);

      if (response.data && response.data.success) {
        const profiles = response.data.group_profiles || [];
        setGroupProfiles(profiles);
        console.log(`[GROUP] Loaded ${profiles.length} group profiles`);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err: any) {
      console.error('[GROUP] Error fetching profiles:', err);

      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please check your connection.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.detail || 'Failed to load profiles. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load profiles on component mount
  useEffect(() => {
    fetchGroupProfiles();
  }, []);

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Header */}
      <div className="dashboard-nav h-16 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/user')}
            className="p-2 rounded-lg dashboard-glass-card hover:border-blue-500/40 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" style={{color: 'var(--dashboard-text-muted)'}} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{color: 'var(--dashboard-text)'}}>Group Booking</h1>
            <p className="text-xs" style={{color: 'var(--dashboard-text-muted)'}}>Browse and book bouncer teams</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={fetchGroupProfiles}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg dashboard-glass-card hover:border-blue-500/40 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            style={{color: 'var(--dashboard-text)'}}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>

          <div className="flex items-center space-x-3 pl-4 pr-4 py-2 rounded-lg dashboard-glass-card">
            <div className="p-1 rounded-full" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>
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

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="dashboard-glass-card p-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{color: 'var(--dashboard-text)'}}>Group Bouncers</h2>
                <p style={{color: 'var(--dashboard-text-muted)'}}>Hire professional security teams for larger events</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="dashboard-glass-card p-4 mb-6 border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <span className="ml-3" style={{color: 'var(--dashboard-text-muted)'}}>Loading group profiles...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && groupProfiles.length === 0 && (
            <div className="dashboard-glass-card p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--dashboard-text)'}}>No Group Profiles Available</h3>
              <p className="mb-6" style={{color: 'var(--dashboard-text-muted)'}}>
                No bouncer groups have posted profiles yet. Check back later or try individual booking!
              </p>
              <button
                onClick={() => navigate('/user/browse/bouncers/individual-booking')}
                className="px-6 py-3 dashboard-neon-btn"
              >
                Browse Individual Booking
              </button>
            </div>
          )}

          {/* Profiles Grid */}
          {!isLoading && !error && groupProfiles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="dashboard-glass-card p-6 transition-all duration-300 hover:scale-105 hover:border-green-500/40 cursor-pointer"
                >
                  {/* Profile Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 rounded-full" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                      <span className="text-white font-bold text-lg">
                        {profile.group_name ? profile.group_name.substring(0, 2).toUpperCase() : '??'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg" style={{color: 'var(--dashboard-text)'}}>
                        {profile.group_name || 'Unknown Group'}
                      </h4>
                      <span className="dashboard-badge dashboard-badge-success text-xs">
                        {profile.member_count || 0} Members
                      </span>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-2 mb-4" style={{color: 'var(--dashboard-text-muted)'}}>
                    <p className="text-sm flex items-center space-x-2">
                      <span>📍</span>
                      <span>{profile.location || 'Location not specified'}</span>
                    </p>
                    <p className="text-sm flex items-center space-x-2">
                      <span>💰</span>
                      <span className="font-semibold" style={{color: '#10b981'}}>
                        ₹{profile.amount_per_hour || '0'}/hour per member
                      </span>
                    </p>

                    {/* Team Members */}
                    {profile.members && profile.members.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700/30">
                        <p className="text-xs font-medium mb-2" style={{color: 'var(--dashboard-text)'}}>Team Members:</p>
                        <div className="space-y-1">
                          {profile.members.slice(0, 3).map((member: any, idx: number) => (
                            <p key={idx} className="text-xs flex items-center space-x-2" style={{color: 'var(--dashboard-text-muted)'}}>
                              <span>👤</span>
                              <span>{member.name || 'Unknown'}</span>
                            </p>
                          ))}
                          {profile.members.length > 3 && (
                            <p className="text-xs" style={{color: 'var(--dashboard-text-muted)'}}>
                              +{profile.members.length - 3} more members
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking Info */}
                  <div className="pt-4 border-t border-gray-700/30">
                    <p className="text-xs mb-3" style={{color: 'var(--dashboard-text-muted)'}}>
                      Posted: {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => {
                        alert(`Booking ${profile.group_name} for your event! Full booking flow will be implemented soon.`);
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
                </div>
              ))}
            </div>
          )}

          {/* Stats Footer */}
          {!isLoading && !error && groupProfiles.length > 0 && (
            <div className="dashboard-glass-card p-4 mt-6 text-center">
              <p style={{color: 'var(--dashboard-text-muted)'}}>
                Showing <span className="font-bold" style={{color: '#10b981'}}>{groupProfiles.length}</span> bouncer group{groupProfiles.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupBookingPage;
