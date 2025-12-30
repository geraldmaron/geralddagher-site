'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, User } from './types';
import { AuthClientService } from './client-service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);
  const operationInProgress = useRef(false);

  const persistUser = useCallback((value: User | null) => {
    if (typeof window === 'undefined') return;
    if (value) {
      try {
        window.sessionStorage.setItem('auth:user', JSON.stringify(value));
      } catch (e) {
        console.error('Failed to persist user to sessionStorage:', e);
      }
    } else {
      window.sessionStorage.removeItem('auth:user');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (operationInProgress.current) {
      return;
    }

    try {
      operationInProgress.current = true;
      setLoading(true);

      const authService = AuthClientService;
      let user = await authService.getCurrentUser();

      if (!user) {
        try {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include'
          });

          if (refreshResponse.ok) {
            user = await authService.getCurrentUser();
          }
        } catch (refreshErr) {
          console.error('Token refresh failed:', refreshErr);
        }
      }

      if (user) {
        setUser(user);
        persistUser(user);
        setError(null);
      } else {
        setUser(null);
        persistUser(null);
        setError(null);
      }

    } catch (err: any) {
      setUser(null);
      persistUser(null);
      setError('Failed to load user data. Please try again.');
    } finally {
      operationInProgress.current = false;
      setLoading(false);
    }
  }, [persistUser]);

  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    if (operationInProgress.current) {

      return;
    }

    try {
      operationInProgress.current = true;
      setError(null);
      setLoading(true);

      const normalizedEmail = email.toLowerCase().trim();


      if (!normalizedEmail.includes('@') || password.length < 1) {
        throw new Error('Invalid email or password');
      }

      const authService = AuthClientService;
      await authService.signIn(normalizedEmail, password, rememberMe);



      operationInProgress.current = false;
      setLoading(false);

      await refreshUser();

    } catch (err: any) {
      const errorMessage = err.message || 'Sign in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      operationInProgress.current = false;
      setLoading(false);
    }
  }, [refreshUser]);

  const signOut = useCallback(async (redirectTo: string = '/login') => {
    if (operationInProgress.current) return;
    
    try {
      operationInProgress.current = true;
      setLoading(true);
      setError(null);
      
      const authService = AuthClientService;
      await authService.signOut();
      
      setUser(null);
      persistUser(null);
      setError(null);
      router.push(redirectTo);
      
    } catch (err: any) {
      setUser(null);
      persistUser(null);
      setError(err?.message || 'Failed to sign out');
      router.push(redirectTo);
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, [router, persistUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryAuth = useCallback(async () => {
    setError(null);
    setLoading(true);
    await refreshUser();
  }, [refreshUser]);

  // Initialize auth on mount
  useEffect(() => {
    if (isInitialized.current) return;

    isInitialized.current = true;
    const hydrateAndRefresh = async () => {
      if (typeof window !== 'undefined') {
        const cachedUser = window.sessionStorage.getItem('auth:user');
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser) as User;
            setUser(parsedUser);
            await refreshUser();
          } catch {
            window.sessionStorage.removeItem('auth:user');
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    hydrateAndRefresh();
  }, [refreshUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.location.pathname.startsWith('/admin')) return;

    const handleVisibility = () => {
      if (!document.hidden) {
        refreshUser();
      }
    };

    const handleFocus = () => refreshUser();

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return;
    if (typeof window === 'undefined') return;
    if (!window.location.pathname.startsWith('/admin')) return;

    const refreshToken = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        if (!response.ok) {
          await signOut();
        }
      } catch (error) {
        await signOut();
      }
    };

    refreshToken();
    const interval = setInterval(refreshToken, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, signOut]);
  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signOut,
    refreshUser,
    clearError,
    retryAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
