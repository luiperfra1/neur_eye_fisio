import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { login as loginRequest, type AuthUser } from '@/services/authService';
import { setApiAccessToken, setUnauthorizedHandler } from '@/services/apiClient';
import { clearAccessToken, loadAccessToken, saveAccessToken } from '@/services/tokenStorage';

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    void (async () => {
      const token = await loadAccessToken();
      setAccessToken(token);
      setApiAccessToken(token);
      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearAccessToken();
      setApiAccessToken(null);
      setAccessToken(null);
      setUser(null);
    });
    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await loginRequest(username, password);
    await saveAccessToken(response.accessToken);
    setApiAccessToken(response.accessToken);
    setAccessToken(response.accessToken);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await clearAccessToken();
    setApiAccessToken(null);
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: !!accessToken,
      accessToken,
      user,
      login,
      logout,
    }),
    [accessToken, isReady, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
