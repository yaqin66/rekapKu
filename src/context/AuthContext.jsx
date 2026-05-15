import { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { apiPost } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser({
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
            token: token
          });
        }
      } catch (err) {
        logout();
      }
    }
    setIsAuthLoading(false);

    const handleUnauthorized = () => logout();
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, []);

  const saveAuthData = (data) => {
    localStorage.setItem('auth_token', data.token);
    setUser({ ...data.user, token: data.token });
  };

  const loginGoogle = async (credentialResponse) => {
    try {
      const data = await apiPost('/auth/google', { credential: credentialResponse.credential });
      saveAuthData(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginEmail = async (email, password) => {
    try {
      const data = await apiPost('/auth/login', { email, password });
      saveAuthData(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const registerEmail = async (name, email, password) => {
    try {
      const data = await apiPost('/auth/register', { name, email, password });
      saveAuthData(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { apiPut } = await import('../utils/api');
      const data = await apiPut('/auth/profile', profileData);
      saveAuthData(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    googleLogout();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, loginGoogle, loginEmail, registerEmail, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
