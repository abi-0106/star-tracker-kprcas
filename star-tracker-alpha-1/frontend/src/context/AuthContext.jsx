import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('star_tracker_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.getMe();
      if (res.authenticated && res.user) {
        setUser(res.user);
        localStorage.setItem('star_tracker_user', JSON.stringify(res.user));
      } else {
        setUser(null);
        localStorage.removeItem('star_tracker_user');
        localStorage.removeItem('star_tracker_token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('star_tracker_user');
      localStorage.removeItem('star_tracker_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    const res = await api.login(email, password, role);
    if (res.token) {
      localStorage.setItem('star_tracker_token', res.token);
    }
    if (res.user) {
      setUser(res.user);
      localStorage.setItem('star_tracker_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      localStorage.removeItem('star_tracker_user');
      localStorage.removeItem('star_tracker_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
