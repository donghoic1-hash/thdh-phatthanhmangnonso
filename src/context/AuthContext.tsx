import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { authService, checkIsAdmin } from '../services/authService';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; errorCode?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; errorCode?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  login: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Subscribe to real Firebase Authentication State changes (Requirement 6)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const adminAuthorized = await checkIsAdmin(firebaseUser);
          if (adminAuthorized) {
            setUser(firebaseUser);
            setIsAdmin(true);
          } else {
            setUser(null);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('[Auth State Error]:', err);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string) => {
    const result = await authService.loginAdmin(username, password);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAdmin(true);
      return { success: true };
    }
    return {
      success: false,
      error: result.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      errorCode: result.errorCode
    };
  };

  const loginWithGoogle = async () => {
    const result = await authService.loginWithGoogle();
    if (result.success && result.user) {
      setUser(result.user);
      setIsAdmin(true);
      return { success: true };
    }
    return {
      success: false,
      error: result.error || 'Đăng nhập Google không thành công.',
      errorCode: result.errorCode
    };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAdmin(false);
  };

  const isAuthenticated = Boolean(user && isAdmin);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
