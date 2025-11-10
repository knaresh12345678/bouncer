import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Calendar,
  Users,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Navigation: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = React.useMemo(() => {
    const items = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        roles: ['admin', 'bouncer', 'user']
      }
    ];

    if (hasRole('admin')) {
      items.push(
        {
          name: 'Users',
          href: '/admin/users',
          icon: Users,
          roles: ['admin']
        },
        {
          name: 'Bouncers',
          href: '/admin/bouncers',
          icon: Shield,
          roles: ['admin']
        },
        {
          name: 'All Bookings',
          href: '/admin/bookings',
          icon: Calendar,
          roles: ['admin']
        },
        {
          name: 'Reports',
          href: '/admin/reports',
          icon: BarChart3,
          roles: ['admin']
        }
      );
    }

    if (hasRole('bouncer')) {
      items.push(
        {
          name: 'My Bookings',
          href: '/bouncer/bookings',
          icon: Calendar,
          roles: ['bouncer']
        },
        {
          name: 'Availability',
          href: '/bouncer/availability',
          icon: Settings,
          roles: ['bouncer']
        }
      );
    }

    if (hasRole('user')) {
      items.push(
        {
          name: 'My Bookings',
          href: '/user/bookings',
          icon: Calendar,
          roles: ['user']
        },
        {
          name: 'Book Bouncer',
          href: '/user/book',
          icon: Shield,
          roles: ['user']
        },
        {
          name: 'Profile',
          href: '/user/profile',
          icon: Settings,
          roles: ['user']
        }
      );
    }

    if (hasRole('bouncer')) {
      items.push({
        name: 'Profile',
        href: '/bouncer/profile',
        icon: Settings,
        roles: ['bouncer']
      });
    }

    if (hasRole('admin')) {
      items.push({
        name: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        roles: ['admin']
      });
    }

    return items;
  }, [hasRole]);

  const filteredItems = navigationItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-white">Bouncer App</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-300 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-white">Bouncer App</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="bg-gray-900 border-b border-gray-700">
            <div className="px-2 py-3 space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${
                      isActive(item.href)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-3 py-2 text-base font-medium rounded-md`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full text-left group flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navigation;