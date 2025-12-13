'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import {
  saveToken,
  saveUser,
  getToken,
  getUser,
  clearAuth,
  User,
} from '@/lib/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'teacher'; // Admin không được đăng ký
}

interface AuthResponse {
  token: string;
  user: User;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    if (token && userData) {
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiClient.post<AuthResponse>(
        '/auth/signin',
        credentials
      );
      const { token, user: userData } = response.data;
      
      saveToken(token);
      saveUser(userData);
      setUser(userData);
      
      // Use setTimeout to ensure state is updated before redirect
      setTimeout(() => {
        // Redirect based on role
        if (userData.role === 'admin') {
          router.replace('/admin/system');
        } else if (userData.role === 'teacher') {
          router.replace('/instructor/courses');
        } else {
          router.replace('/');
        }
      }, 100);
      
      return userData;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiClient.post<AuthResponse>('/auth/signup', {
        ...data,
        role: data.role || 'student',
      });
      const { token, user: userData } = response.data;
      saveToken(token);
      saveUser(userData);
      setUser(userData);
      router.push('/');
      return userData;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    clearAuth();
    setUser(null);
    router.push('/auth/login');
  };

  /**
   * Get current user info from server
   */
  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      const userData = response.data.user;
      saveUser(userData);
      setUser(userData);
      return userData;
    } catch (err: any) {
      clearAuth();
      setUser(null);
      throw err;
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchCurrentUser,
    isAuthenticated: !!user,
  };
}
