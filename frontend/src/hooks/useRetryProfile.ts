import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ProfileData {
  success: boolean;
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

interface UseRetryProfileOptions {
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: (data: ProfileData) => void;
  onError?: (error: any) => void;
  onAuthError?: () => void;
}

export const useRetryProfile = (options: UseRetryProfileOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    onAuthError
  } = options;

  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (attemptNumber: number = 1): Promise<ProfileData | null> => {
    try {
      console.log(`[PROFILE] Fetch attempt ${attemptNumber}/${maxRetries}`);

      const token = localStorage.getItem('bouncer_access_token');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await axios.get('/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log('[PROFILE] Successfully fetched profile data');
        setProfileData(response.data);
        setError(null);
        setRetryCount(0);

        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err: any) {
      console.error(`[PROFILE] Attempt ${attemptNumber} failed:`, err);

      // Check for authentication errors
      if (err.response?.status === 401 || err.response?.status === 404) {
        const errorMsg = err.response?.data?.detail || 'Authentication failed';
        setError(errorMsg);

        // If it's an auth error, don't retry, just call the handler
        if (onAuthError) {
          onAuthError();
        }

        return null;
      }

      // For other errors, retry if we haven't exceeded max retries
      if (attemptNumber < maxRetries) {
        console.log(`[PROFILE] Retrying in ${retryDelay}ms...`);

        await new Promise(resolve => setTimeout(resolve, retryDelay));

        setRetryCount(attemptNumber);
        return await fetchProfile(attemptNumber + 1);
      }

      // Max retries exceeded
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load profile';
      setError(errorMsg);

      if (onError) {
        onError(err);
      }

      return null;
    }
  }, [maxRetries, retryDelay, onSuccess, onError, onAuthError]);

  const retry = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      await fetchProfile(1);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  const fetchWithRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      await fetchProfile(1);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  return {
    loading,
    retryCount,
    profileData,
    error,
    retry,
    fetchWithRetry
  };
};
