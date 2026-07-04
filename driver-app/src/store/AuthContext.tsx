import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, loadToken, setToken } from '../api/client';
import { connectSocket, disconnectSocket } from '../realtime/socket';

interface AuthState {
  token: string | null;
  initializing: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    loadToken().then((t) => {
      if (t) {
        setTokenState(t);
        connectSocket(t);
      }
      setInitializing(false);
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      initializing,
      async requestOtp(phone) {
        await api.post('/auth/request-otp', { phone });
      },
      async verifyOtp(phone, otp) {
        const { data } = await api.post('/auth/driver/verify-otp', { phone, otp });
        await setToken(data.token);
        setTokenState(data.token);
        connectSocket(data.token);
      },
      async logout() {
        await setToken(null);
        setTokenState(null);
        disconnectSocket();
      },
    }),
    [token, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
