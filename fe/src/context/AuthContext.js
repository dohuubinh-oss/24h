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
    console.log('Logging out...');
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed, but proceeding with client-side cleanup:', error);
    } finally {
      setUser(null);
      accessTokenRef.current = null;
      // Use window.location to force a full page reload to the login page
      // This is more robust than router.push in clearing all state.
      window.location.href = '/login';
    }
  }, []);

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
        
        // This initial call is to check for a valid refresh token (in the httpOnly cookie).
        // We add a special header to tell our API interceptor to NOT try and refresh the token
        // if this specific call fails, as that would cause a loop.
        const { data } = await api.post('/auth/refresh-token', {}, {
          headers: { 'X-Skip-Interceptor-Refresh': 'true' }
        });
        
        if (data.accessToken && data.user) {
          console.log('Auth session initialized successfully.');
          setAuthState(data);
        } else {
           // Should not happen, but as a fallback, clear user state
           setUser(null);
           accessTokenRef.current = null;
        }
      } catch (error) {
        // This is the expected path when no valid session/cookie is found.
        console.log('No active session found. User needs to log in.');
        setUser(null);
        accessTokenRef.current = null;
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [setAuthState]); // setAuthState is stable due to useCallback

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
      {/* Show a loading indicator or nothing while checking auth state */}
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);