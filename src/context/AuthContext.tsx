import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { services } from '../services';
import type { Session } from '../types';

interface AuthState {
  session: Session | null;
  loading: boolean;
  /** Sitzung neu laden, z. B. nach der Einwilligung (Profil hat sich geändert, ohne dass ein Auth-Ereignis kommt). */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({ session: null, loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, 'refresh'>>({ session: null, loading: true });
  useEffect(() => {
    let active = true;
    void services.auth.getSession().then((session) => active && setState({ session, loading: false }));
    const off = services.auth.onAuthChange((session) => active && setState({ session, loading: false }));
    return () => {
      active = false;
      off();
    };
  }, []);
  const refresh = useCallback(async () => {
    const session = await services.auth.getSession();
    setState({ session, loading: false });
  }, []);
  return <AuthContext.Provider value={{ ...state, refresh }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
