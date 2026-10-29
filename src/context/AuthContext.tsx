import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { services } from '../services';
import type { Session } from '../types';

interface AuthState {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, loading: true });
  useEffect(() => {
    let active = true;
    void services.auth.getSession().then((session) => active && setState({ session, loading: false }));
    const off = services.auth.onAuthChange((session) => active && setState({ session, loading: false }));
    return () => {
      active = false;
      off();
    };
  }, []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
