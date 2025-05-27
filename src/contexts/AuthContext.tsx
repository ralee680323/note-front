'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

interface DecodedToken {
  id: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicPaths = ['/login', '/register', '/'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      if (!publicPaths.includes(pathname)) {
        router.push('/login');
      }
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token has expired
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        if (!publicPaths.includes(pathname)) {
          router.push('/login');
        }
      } else {
        setIsAuthenticated(true);
        if (publicPaths.includes(pathname)) {
          router.push('/notes');
        }
      }
    } catch {
      // Invalid token
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      if (!publicPaths.includes(pathname)) {
        router.push('/login');
      }
    }
  }, [pathname, router]);

  useEffect(() => {
    checkTokenExpiration();
    // Check token expiration every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [pathname, checkTokenExpiration]);

  const login = async (username: string, password: string) => {
    try {
      const response = await auth.login({ username, password });
      localStorage.setItem('token', response.token);
      setIsAuthenticated(true);
      router.push('/notes');
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await auth.register({ username, password });
      localStorage.setItem('token', response.token);
      setIsAuthenticated(true);
      router.push('/notes');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 