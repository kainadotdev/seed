'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, setAccessToken } from './api';
import { User } from './types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  register: (data: { name: string; username: string; password: string }) => Promise<void>;
  login: (data: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Ao montar, tenta renovar a sessão via refresh token (cookie httpOnly),
  // recuperando um novo access token sem exigir novo login.
  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await api.post<{ accessToken: string }>(
          '/auth/refresh',
          undefined,
          { auth: false },
        );
        setAccessToken(accessToken);
        const me = await api.get<User>('/auth/me');
        setUser(me);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistSession = useCallback((newUser: User, token: string) => {
    setAccessToken(token);
    setUser(newUser);
  }, []);

  const register = useCallback(
    async (data: { name: string; username: string; password: string }) => {
      const res = await api.post<{ user: User; accessToken: string }>(
        '/auth/register',
        data,
        { auth: false },
      );
      persistSession(res.user, res.accessToken);
      router.push('/home');
    },
    [persistSession, router],
  );

  const login = useCallback(
    async (data: { username: string; password: string }) => {
      const res = await api.post<{ user: User; accessToken: string }>(
        '/auth/login',
        data,
        { auth: false },
      );
      persistSession(res.user, res.accessToken);
      router.push('/home');
    },
    [persistSession, router],
  );

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => undefined);
    setAccessToken(null);
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
