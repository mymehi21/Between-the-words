import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, checkIsApprovedAdmin } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isApprovedAdmin: boolean;
  needsPasswordChange: boolean;
  isBossAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkPasswordChangeStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApprovedAdmin, setIsApprovedAdmin] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [isBossAdmin, setIsBossAdmin] = useState(false);

  const checkPasswordChangeStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('admin_users')
        .select('needs_password_change, is_boss')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setNeedsPasswordChange(data.needs_password_change || false);
        setIsBossAdmin(data.is_boss || false);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const approved = await checkIsApprovedAdmin();
        setIsApprovedAdmin(approved);
        await checkPasswordChangeStatus();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const approved = await checkIsApprovedAdmin();
          setIsApprovedAdmin(approved);
          await checkPasswordChangeStatus();
        } else {
          setIsApprovedAdmin(false);
          setNeedsPasswordChange(false);
          setIsBossAdmin(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }

    if (data.user) {
      const approved = await checkIsApprovedAdmin();
      setIsApprovedAdmin(approved);
      await checkPasswordChangeStatus();
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw error;
    }

    if (data.user) {
      const approved = await checkIsApprovedAdmin();
      setIsApprovedAdmin(approved);
      await checkPasswordChangeStatus();
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isApprovedAdmin,
      needsPasswordChange,
      isBossAdmin,
      signIn,
      signUp,
      signOut,
      checkPasswordChangeStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
