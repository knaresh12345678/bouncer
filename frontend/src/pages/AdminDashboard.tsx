import React, { useState, useEffect } from 'react';

interface DashboardStats {
  totalUsers: number;
  totalBouncers: number;
  activeBookings: number;
  successRate: number;
  userGrowth: number;
  bouncerGrowth: number;
  bookingGrowth: number;
  rateGrowth: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBouncers: 0,
    activeBookings: 0,
    successRate: 0,
    userGrowth: 0,
    bouncerGrowth: 0,
    bookingGrowth: 0,
    rateGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const [users, setUsers] = useState<any[]>([]);
  const [bouncers, setBouncers] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);


  // Simulate data fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real app, you would fetch data from your API here
        // For now, we start with empty data (zero values)

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const Sidebar = () => (
    <div className="w-64 min-h-screen shadow-lg" style={{backgroundColor: '#450B36'}}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-700 p-2 rounded-xl">
            <span className="text-white font-bold text-xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SecureGuard</h1>
            <p className="text-sm text-purple-200">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 px-4 space-y-3">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: '📊' },
          { id: 'users', name: 'Users', icon: '👥' },
          { id: 'bouncers', name: 'Bouncers', icon: '🛡️' },
          { id: 'bookings', name: 'Bookings', icon: '📅' },
          { id: 'reports', name: 'Reports', icon: '📈' },
          { id: 'settings', name: 'Settings', icon: '⚙️' }
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
              <span className="text-white font-bold text-sm">AD</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Admin User</p>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TopBar = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <p className="text-gray-600">
            {activeTab === 'dashboard' && 'Overview of your security operations'}
            {activeTab === 'users' && 'Manage user accounts and permissions'}
            {activeTab === 'bouncers' && 'Oversee bouncer profiles and verification'}
            {activeTab === 'bookings' && 'Monitor all booking activities'}
            {activeTab === 'reports' && 'View analytics and performance metrics'}
            {activeTab === 'settings' && 'Configure system settings'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <span className="text-xl">🔔</span>
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-700 p-2 rounded-full">
              <span className="text-white font-bold text-sm">AD</span>
            </div>
            <span className="font-medium text-gray-900">Admin User</span>
          </div>
        </div>
      </div>
    </div>
  );

  const MainContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="p-8 space-y-8">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoading ? (
                      <span className="animate-pulse bg-gray-200 h-8 w-16 rounded inline-block"></span>
                    ) : (
                      dashboardStats.totalUsers.toLocaleString()
                    )}
                  </p>
                  <p className="text-sm text-green-600">
                    {isLoading ? (
                      <span className="animate-pulse bg-gray-200 h-4 w-20 rounded inline-block"></span>
                    ) : dashboardStats.userGrowth > 0 ? (
                      `↗ +${dashboardStats.userGrowth}% from last month`
                    ) : dashboardStats.userGrowth < 0 ? (
                      `↘ ${dashboardStats.userGrowth}% from last month`
                    ) : (
                      '— No change from last month'
                    )}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <span className="text-blue-700 text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Bouncers</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoading ? (
                      <span className="animate-pulse bg-gray-200 h-8 w-16 rounded inline-block"></span>
                    ) : (
                      dashboardStats.totalBouncers.toLocaleString()
                    )}
                  </p>
                  <p className="text-sm text-green-600">
                    {isLoading ? (
                      <span className="animate-pulse bg-gray-200 h-4 w-20 rounded inline-block"></span>
                    ) : dashboardStats.bouncerGrowth > 0 ? (
                      `↗ +${dashboardStats.bouncerGrowth}% from last month`
                    ) : dashboardStats.bouncerGrowth < 0 ? (
                      `↘ ${dashboardStats.bouncerGrowth}% from last month`
                    ) : (
                      '— No change from last month'
                    )}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <span className="text-green-700 text-2xl">🛡️</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoading ? (
                      <span className="animate-pulse bg-gray-200 h-8 w-16 rounded inline-block"></span>
                    ) : (
                      dashboardStats.activeBookings.toLocaleString()
                    )}
                  </p>
                  <p className="text-sm text-yellow-600">
                    {isLoading ? (
                      <span className="animate-pulse bg-gray-200 h-4 w-20 rounded inline-block"></span>
                    ) : dashboardStats.bookingGrowth > 0 ? (
                      `↗ +${dashboardStats.bookingGrowth}% from last month`
                    ) : dashboardStats.bookingGrowth < 0 ? (
                      `↘ ${dashboardStats.bookingGrowth}% from last month`
                    ) : (
                      '— No change from last month'
                    )}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <span className="text-yellow-700 text-2xl">📅</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {isLoading ? (
                      <span className="animate-pulse bg-gray-200 h-8 w-16 rounded inline-block"></span>
                    ) : (
                      `${dashboardStats.successRate.toFixed(1)}%`
                    )}
                  </p>
                  <p className="text-sm text-green-600">
                    {isLoading ? (
                      <span className="animate-pulse bg-gray-200 h-4 w-20 rounded inline-block"></span>
                    ) : dashboardStats.rateGrowth > 0 ? (
                      `↗ +${dashboardStats.rateGrowth}% from last month`
                    ) : dashboardStats.rateGrowth < 0 ? (
                      `↘ ${dashboardStats.rateGrowth}% from last month`
                    ) : (
                      '— No change from last month'
                    )}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <span className="text-purple-700 text-2xl">📈</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h3>
              <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <span className="text-4xl mb-2 block">📊</span>
                  <p>Chart Component Placeholder</p>
                  <p className="text-sm">Revenue trends and analytics</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Trends</h3>
              <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <span className="text-4xl mb-2 block">📈</span>
                  <p>Chart Component Placeholder</p>
                  <p className="text-sm">Booking patterns and growth</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="animate-pulse bg-gray-200 p-2 rounded-full w-10 h-10"></div>
                      <div>
                        <div className="animate-pulse bg-gray-200 h-4 w-32 rounded mb-1"></div>
                        <div className="animate-pulse bg-gray-200 h-3 w-24 rounded"></div>
                      </div>
                    </div>
                    <div className="animate-pulse bg-gray-200 h-3 w-16 rounded"></div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'user' ? 'bg-blue-100' :
                        activity.type === 'booking' ? 'bg-green-100' :
                        activity.type === 'bouncer' ? 'bg-yellow-100' : 'bg-purple-100'
                      }`}>
                        <span className="text-sm">
                          {activity.type === 'user' ? '👤' :
                           activity.type === 'booking' ? '📅' :
                           activity.type === 'bouncer' ? '🛡️' : '💳'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.user}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">📊</span>
                  <p className="font-medium">No recent activity</p>
                  <p className="text-sm">Activity will appear here when users interact with the system</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'users') {
      return (
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">User Management</h3>
              <p className="text-gray-600">Manage all user accounts and permissions</p>
            </div>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105">
              Add New User
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="animate-pulse bg-gray-200 p-2 rounded-full w-10 h-10"></div>
                            <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div></td>
                        <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-6 w-16 rounded-full"></div></td>
                        <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-6 w-16 rounded-full"></div></td>
                        <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div></td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                            <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-700 p-2 rounded-full">
                              <span className="text-white text-xs font-bold">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'Bouncer' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.joined}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <span className="text-4xl mb-2 block">👥</span>
                        <p className="font-medium">No users found</p>
                        <p className="text-sm">Users will appear here when they register</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'bouncers') {
      return (
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Bouncer Management</h3>
              <p className="text-gray-600">Oversee bouncer profiles and verification status</p>
            </div>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105">
              Add New Bouncer
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Rating</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Completed Jobs</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Availability</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="animate-pulse bg-gray-200 p-2 rounded-full w-10 h-10"></div>
                            <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <div className="animate-pulse bg-gray-200 h-4 w-4 rounded"></div>
                            <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div></td>
                        <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-6 w-16 rounded-full"></div></td>
                        <td className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-6 w-20 rounded-full"></div></td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                            <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : bouncers.length > 0 ? (
                    bouncers.map((bouncer) => (
                      <tr key={bouncer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-700 p-2 rounded-full">
                              <span className="text-white text-xs font-bold">
                                {bouncer.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{bouncer.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="font-medium text-gray-900">{bouncer.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{bouncer.completedJobs}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bouncer.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bouncer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bouncer.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {bouncer.availability}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">Verify</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <span className="text-4xl mb-2 block">🛡️</span>
                        <p className="font-medium">No bouncers found</p>
                        <p className="text-sm">Bouncers will appear here when they register and get verified</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-center text-gray-500">
            <span className="text-6xl mb-4 block">🚧</span>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Under Development</h3>
            <p>This section is currently being built.</p>
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
        <TopBar />
        <MainContent />
      </div>
    </div>
  );
};

export default AdminDashboard;