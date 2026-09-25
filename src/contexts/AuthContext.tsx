import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { supabase } from '../lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  profile: { role: string; is_banned: boolean; ban_reason: string | null; banned_until: string | null } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string, gender?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<{ role: string; is_banned: boolean; ban_reason: string | null; banned_until: string | null } | null>(null);

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data: rawData, error } = await supabase
        .from('profiles')
        .select('role, is_banned, ban_reason, banned_until')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('AuthContext fetchProfile error:', error.message, error);
        setProfile(null);
        return;
      }

      let data = rawData;

      if (data) {
        // Auto-expire bans
        if (data.is_banned && data.banned_until && new Date(data.banned_until) <= new Date()) {
          await supabase.from('profiles').update({
            is_banned: false,
            ban_reason: null,
            banned_until: null,
          }).eq('id', userId);
          data = { ...data, is_banned: false, ban_reason: null, banned_until: null };
        }

        setProfile(data);

        // Store ban info for BannedScreen
        if (data.is_banned) {
          sessionStorage.setItem('ban_reason', data.ban_reason || '');
          sessionStorage.setItem('banned_until', data.banned_until || '');
        } else {
          sessionStorage.removeItem('ban_reason');
          sessionStorage.removeItem('banned_until');
        }
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setProfileLoading(false);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, phone?: string, gender?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phone || '',
          gender: gender || '',
        },
      },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    sessionStorage.removeItem('ban_reason');
    sessionStorage.removeItem('banned_until');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const value = useMemo(() => ({
    user, session, loading, profileLoading, profile, login, register, logout, resetPassword,
  }), [user, session, loading, profileLoading, profile, login, register, logout, resetPassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
