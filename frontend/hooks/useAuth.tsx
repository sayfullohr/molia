'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, pass: string) => Promise<void>;
  register: (username: string, pass: string, confirm: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (username: string, pass: string) => {
    setError(null);
    try {
      const res = await api.login({ username, password: pass });
      if (res.data?.token) {
        api.setToken(res.data.token);
      }
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Kirishda xatolik yuz berdi');
      throw err;
    }
  };

  const register = async (username: string, pass: string, confirm: string) => {
    setError(null);
    try {
      const res = await api.register({
        username,
        password: pass,
        confirmPassword: confirm,
      });
      if (res.data?.token) {
        api.setToken(res.data.token);
      }
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      api.setToken(null);
      setUser(null);
    } catch (err) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
