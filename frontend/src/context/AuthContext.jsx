import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const demoQuery = queryParams ? queryParams.get('demo') : null;

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fraudgraph_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch(e) {}
    }
    // Fallback if demo parameter is present
    if (demoQuery) {
      return {
        username: demoQuery === 'admin' ? 'admin' : 'investigator',
        role: demoQuery === 'admin' ? 'ROLE_ADMIN' : 'ROLE_INVESTIGATOR',
        fullName: demoQuery === 'admin' ? 'System Administrator' : 'Sarah Chen, Senior Anti-Fraud Investigator',
      };
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('fraudgraph_token');
    if (savedToken) return savedToken;
    if (demoQuery) {
      // Temporary placeholder token until async demoLogin completes
      return 'demo-session-token';
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (demoQuery && (!token || token === 'demo-session-token')) {
      demoLogin(demoQuery === 'admin' ? 'admin' : 'investigator');
    }
  }, [demoQuery]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ username, password });
      const data = res.data;
      setToken(data.token);
      const userInfo = {
        username: data.username,
        role: data.role,
        fullName: data.fullName,
      };
      setUser(userInfo);
      localStorage.setItem('fraudgraph_token', data.token);
      localStorage.setItem('fraudgraph_user', JSON.stringify(userInfo));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.error ||
          err.response?.data?.message ||
          (err.message === 'Network Error'
            ? 'Unable to connect to backend server on http://localhost:8080'
            : err.message || 'Invalid username or password'),
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, fullName, role) => {
    setLoading(true);
    try {
      const res = await authAPI.register({
        username,
        email,
        password,
        fullName,
        role: role || 'ROLE_INVESTIGATOR',
      });
      const data = res.data;
      setToken(data.token);
      const userInfo = {
        username: data.username,
        role: data.role,
        fullName: data.fullName,
        email,
      };
      setUser(userInfo);
      localStorage.setItem('fraudgraph_token', data.token);
      localStorage.setItem('fraudgraph_user', JSON.stringify(userInfo));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.error ||
          err.response?.data?.message ||
          (err.message === 'Network Error'
            ? 'Unable to connect to backend server on http://localhost:8080'
            : err.message || 'Registration failed'),
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fraudgraph_token');
    localStorage.removeItem('fraudgraph_user');
  };

  const demoLogin = async (role = 'investigator') => {
    if (role === 'admin') {
      return login('admin', 'admin123');
    }
    return login('investigator', 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        demoLogin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
