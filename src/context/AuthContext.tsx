import {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProvider } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  userProviders: UserProvider[];
  loadingProviders: boolean;
  filterActive: boolean;
  setFilterActive: (v: boolean) => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveProviders: (providers: UserProvider[]) => Promise<void>;
  refreshProviders: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProviders, setUserProviders] = useState<UserProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [filterActive, setFilterActiveState] = useState<boolean>(() => {
    return localStorage.getItem('streamfinder_filter') === 'true';
  });

  const setFilterActive = useCallback((v: boolean) => {
    setFilterActiveState(v);
    localStorage.setItem('streamfinder_filter', String(v));
  }, []);

  const fetchProviders = useCallback(async (userId: string) => {
    if (!supabase) return;
    setLoadingProviders(true);
    try {
      const { data, error } = await supabase
        .from('user_providers')
        .select('provider_id, provider_name, logo_path')
        .eq('user_id', userId);
      if (!error && data) setUserProviders(data as UserProvider[]);
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProviders(u.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProviders(u.id);
      else setUserProviders([]);
    });

    return () => subscription.unsubscribe();
  }, [fetchProviders]);

  const signUp = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase non configuré.');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase non configuré.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserProviders([]);
  };

  const saveProviders = async (providers: UserProvider[]) => {
    if (!supabase || !user) throw new Error('Non connecté.');

    // Delete all existing, then insert new ones
    const { error: delErr } = await supabase
      .from('user_providers')
      .delete()
      .eq('user_id', user.id);
    if (delErr) throw delErr;

    if (providers.length > 0) {
      const rows = providers.map(p => ({
        user_id: user.id,
        provider_id: p.provider_id,
        provider_name: p.provider_name,
        logo_path: p.logo_path,
      }));
      const { error: insErr } = await supabase.from('user_providers').insert(rows);
      if (insErr) throw insErr;
    }

    setUserProviders(providers);
  };

  const refreshProviders = useCallback(async () => {
    if (user) await fetchProviders(user.id);
  }, [user, fetchProviders]);

  return (
    <AuthContext.Provider value={{
      user, loading, userProviders, loadingProviders,
      filterActive, setFilterActive,
      signUp, signIn, signOut, saveProviders, refreshProviders,
      isConfigured: isSupabaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
