import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export type UserType = 'admin' | 'user' | 'bouncer';

export interface RegisteredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: UserType;
  registeredAt: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserType;
  role: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
  };
}

interface AuthContextType {
  currentUser: AuthUser | null;
  token: string | null;
  login: (email: string, password: string, userType: UserType) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<RegisteredUser, 'id' | 'registeredAt'>) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Configure axios defaults
const API_BASE_URL = 'http://localhost:8000/api';
axios.defaults.baseURL = API_BASE_URL;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load token and user from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('bouncer_access_token');
      const storedUser = localStorage.getItem('bouncer_current_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Basic validation of stored data
          if (parsedUser && parsedUser.email && parsedUser.userType) {
            setToken(storedToken);
            setCurrentUser(parsedUser);

            // Set axios default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          } else {
            // Clear invalid stored data
            localStorage.removeItem('bouncer_access_token');
            localStorage.removeItem('bouncer_refresh_token');
            localStorage.removeItem('bouncer_current_user');
            localStorage.removeItem('bouncer_user_role');
          }
        } catch (error) {
          console.error('Error loading stored auth data:', error);
          // Clear invalid stored data
          localStorage.removeItem('bouncer_access_token');
          localStorage.removeItem('bouncer_refresh_token');
          localStorage.removeItem('bouncer_current_user');
          localStorage.removeItem('bouncer_user_role');
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const register = async (userData: Omit<RegisteredUser, 'id' | 'registeredAt'>): Promise<boolean> => {
    try {
      // Create form data for the backend
      const formData = new FormData();
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('first_name', userData.firstName);
      formData.append('last_name', userData.lastName);
      formData.append('phone', userData.phone || '');

      const response = await axios.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);

      // Provide more detailed error information
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.response?.status === 400) {
        throw new Error('Invalid registration data. Please check your inputs.');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please check your connection.');
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  };

  const login = async (email: string, password: string, userType?: UserType): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { email, userType });

      // Create form data for OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', email); // FastAPI OAuth2 uses 'username' field
      formData.append('password', password);

      console.log('Sending login request to:', '/auth/login');
      const response = await axios.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Login response status:', response.status);
      console.log('Login response data:', response.data);

      if (response.status === 200) {
        const tokenData: TokenResponse = response.data;

        // Get user role from backend response
        let userRole = tokenData.user.role?.toLowerCase();

        // For development/testing, fall back to email-based role detection if role is null
        if (!userRole) {
          if (email.startsWith('admin@')) {
            userRole = 'admin';
          } else if (email.startsWith('bouncer@')) {
            userRole = 'bouncer';
          } else if (email.startsWith('user@')) {
            userRole = 'user';
          } else {
            userRole = 'user'; // Default to user
          }
        }

        console.log('User role determined as:', userRole);

        // Check if user role matches the requested userType (if provided)
        if (userType && userRole !== userType) {
          throw new Error('Invalid user type for this account');
        }

        // Create auth user
        const authUser: AuthUser = {
          id: tokenData.user.id,
          firstName: tokenData.user.first_name,
          lastName: tokenData.user.last_name,
          email: tokenData.user.email,
          userType: userRole as UserType,
          role: tokenData.user.role || userRole,
          isActive: tokenData.user.is_active,
          isVerified: tokenData.user.is_verified
        };

        console.log('Created auth user:', authUser);

        // Store tokens and user data
        setToken(tokenData.access_token);
        setCurrentUser(authUser);

        localStorage.setItem('bouncer_access_token', tokenData.access_token);
        localStorage.setItem('bouncer_refresh_token', tokenData.refresh_token);
        localStorage.setItem('bouncer_current_user', JSON.stringify(authUser));
        localStorage.setItem('bouncer_user_role', userRole); // Store role for redirection

        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.access_token}`;

        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });

      // Handle specific error messages from backend
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.detail || 'Invalid email or password';
        throw new Error(errorMessage);
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.detail || 'Invalid request format';
        throw new Error(errorMessage);
      } else if (error.message === 'Invalid user type for this account') {
        throw new Error('This account type does not match the selected login portal');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please check your connection.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }

      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);

    localStorage.removeItem('bouncer_access_token');
    localStorage.removeItem('bouncer_refresh_token');
    localStorage.removeItem('bouncer_current_user');
    localStorage.removeItem('bouncer_user_role');

    // Remove axios default authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    currentUser,
    token,
    login,
    logout,
    register,
    isAuthenticated: !!currentUser && !!token,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider };