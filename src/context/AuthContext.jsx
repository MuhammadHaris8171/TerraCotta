import React, { createContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../utils/apiClient';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('tt_token'));

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      try {
        const { exp } = jwt_decode(token);
        if (Date.now() >= exp * 1000) {
          logout();
        } else {
          // fetch fresh user info
          api.get('/auth/me').then(res => setUser(res.data.user)).catch(() => logout());
        }
      } catch (err) {
        logout();
      }
    } else {
      setUser(null);
      setAuthToken(null);
    }
  }, [token]);

  function login(token, user) {
    localStorage.setItem('tt_token', token);
    setToken(token);
    setUser(user);
    setAuthToken(token);
  }

  function logout() {
    localStorage.removeItem('tt_token');
    setToken(null);
    setUser(null);
    setAuthToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
