import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthUser } from '../services/authService';

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore authenticated session safely on boot
  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      try {
        const session = await authService.verifySession();
        if (isMounted) {
          if (session.isAuthenticated && session.isAdmin) {
            setUser(session.user);
            setIsAuthenticated(true);
            setIsAdmin(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuthSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authService.login(username, password);
    if (res.success && res.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      setIsAdmin(true);
      return { success: true };
    }
    return {
      success: false,
      error: res.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.'
    };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
