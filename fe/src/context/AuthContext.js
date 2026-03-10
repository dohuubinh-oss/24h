'use client';

import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api, { setupInterceptors } from '../lib/api';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const accessTokenRef = useRef(null);

  const logout = useCallback(async () => {
    console.log('Attempting to log out...');
    try {
      await api.post('/auth/logout');
      console.log('Server has processed logout. Initiating redirect and clearing client state.');

      // CRITICAL: Initiate redirect BEFORE clearing local state.
      // This prevents re-renders on the current (protected) page from interrupting the navigation.
      router.push('/');
      
      setUser(null);
      accessTokenRef.current = null;

    } catch (error) {
      console.error('Logout API call failed. Forcing client-side cleanup and redirect:', error);
      // As a fallback, still redirect and clear local state, in the correct order.
      router.push('/');
      setUser(null);
      accessTokenRef.current = null;
    }
  }, [router]);

  const setAuthState = useCallback(({ accessToken, user }) => {
    accessTokenRef.current = accessToken;
    setUser(user);
  }, []);

  useEffect(() => {
    setupInterceptors({
      getToken: () => accessTokenRef.current,
      logout,
      setAuthState,
    });
  }, [logout, setAuthState]);

  // This effect runs ONCE on mount to check for an existing session.
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Attempting to initialize auth session...');
        
        const { data } = await api.post('/auth/refresh-token', {}, {
          headers: { 'X-Skip-Interceptor-Refresh': 'true' }
        });
        
        if (data.accessToken && data.user) {
          console.log('Auth session initialized successfully.');
          setAuthState(data);
        } else {
           setUser(null);
           accessTokenRef.current = null;
        }
      } catch (error) {
        console.log('No active session found. User needs to log in.');
        setUser(null);
        accessTokenRef.current = null;
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [setAuthState]);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    if (data.accessToken && data.user) {
      setAuthState(data);
      return data;
    } else {
      throw new Error('Invalid response from server');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);