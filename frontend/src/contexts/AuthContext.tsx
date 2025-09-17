import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserType = 'admin' | 'user' | 'bouncer';

export interface RegisteredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // In a real app, this would be hashed
  userType: UserType;
  registeredAt: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserType;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  registeredUsers: RegisteredUser[];
  login: (email: string, password: string, userType: UserType) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<RegisteredUser, 'id' | 'registeredAt'>) => Promise<boolean>;
  isUserRegistered: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple password hashing function
const hashPassword = (password: string): string => {
  // In a real application, use a proper hashing library like bcrypt
  return btoa(password + 'secureguard_salt');
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);


  // Load stored users and current user from localStorage on app start
  useEffect(() => {
    const storedUsers = localStorage.getItem('bouncer_registered_users');
    const storedCurrentUser = localStorage.getItem('bouncer_current_user');

    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        setRegisteredUsers(parsedUsers);
      } catch (error) {
        console.error('Error loading stored users:', error);
        setRegisteredUsers([]);
      }
    } else {
      setRegisteredUsers([]);
    }

    if (storedCurrentUser) {
      try {
        const parsedUser = JSON.parse(storedCurrentUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    }
  }, []);

  const saveUsersToStorage = (users: RegisteredUser[]) => {
    const customUsers = users;
    localStorage.setItem('bouncer_registered_users', JSON.stringify(customUsers));
  };

  const register = async (userData: Omit<RegisteredUser, 'id' | 'registeredAt'>): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = registeredUsers.find(user => user.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user with hashed password
      const newUser: RegisteredUser = {
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        password: hashPassword(userData.password),
        registeredAt: new Date().toISOString()
      };

      const updatedUsers = [...registeredUsers, newUser];
      setRegisteredUsers(updatedUsers);
      saveUsersToStorage(updatedUsers);

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string, userType: UserType): Promise<boolean> => {
    try {
      // Find user by email and userType
      const user = registeredUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.userType === userType
      );

      if (!user) {
        return false;
      }

      // Verify password
      if (!verifyPassword(password, user.password)) {
        return false;
      }

      // Create auth user (without password)
      const authUser: AuthUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType
      };

      setCurrentUser(authUser);
      localStorage.setItem('bouncer_current_user', JSON.stringify(authUser));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bouncer_current_user');
  };

  const isUserRegistered = (email: string): boolean => {
    return registeredUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
  };

  const value: AuthContextType = {
    currentUser,
    registeredUsers,
    login,
    logout,
    register,
    isUserRegistered
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};