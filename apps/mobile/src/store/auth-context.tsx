import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { login as loginRequest, type AuthUser } from '@/services/authService';
import { setApiAccessToken, setUnauthorizedHandler } from '@/services/apiClient';
import { clearAccessToken, loadAccessToken, saveAccessToken } from '@/services/tokenStorage';

// ── Decodifica el payload del JWT sin verificar firma (solo en cliente) ──────
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    // atob no existe en React Native — usamos Buffer o base64 manual
    const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function userFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const id = typeof payload.sub === 'string' ? payload.sub : String(payload.sub ?? '');
  const username = typeof payload.username === 'string' ? payload.username : '';
  if (!id || !username) return null;
  return { id, username };
}

// ────────────────────────────────────────────────────────────────────────────

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

  // Al arrancar: restaura token Y reconstruye user desde el payload JWT
  useEffect(() => {
    void (async () => {
      const token = await loadAccessToken();
      if (token) {
        const restoredUser = userFromToken(token);
        setAccessToken(token);
        setApiAccessToken(token);
        setUser(restoredUser); // ← antes esto no ocurría
      }
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
    // El navigator detecta isAuthenticated === false y redirige solo
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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}