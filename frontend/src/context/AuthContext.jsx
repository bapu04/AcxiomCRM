import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('acxiom_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('acxiom_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('acxiom_token');
      if (storedToken) {
        try {
          const res = await axiosClient.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('acxiom_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('acxiom_token');
          localStorage.removeItem('acxiom_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('acxiom_token', newToken);
    localStorage.setItem('acxiom_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const register = async (userData) => {
    const res = await axiosClient.post('/auth/register', userData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('acxiom_token', newToken);
    localStorage.setItem('acxiom_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (err) {
      // Ignore logout API failures
    } finally {
      localStorage.removeItem('acxiom_token');
      localStorage.removeItem('acxiom_user');
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
