// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate session on page load
  useEffect(() => {
    const token = localStorage.getItem('fin_token');
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('fin_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('fin_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fin_token');
    setUser(null);
  }, []);

  // Convenience permission helpers
  const isAdmin   = user?.role === 'admin';
  const isAnalyst = user?.role === 'analyst' || isAdmin;
  const canWrite  = isAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isAnalyst, canWrite }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
