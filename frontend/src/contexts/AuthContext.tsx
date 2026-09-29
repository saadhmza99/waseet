import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const RECOVERY_STORAGE_KEY = "sifarah:password-recovery";

const urlLooksLikeRecovery = () => {
  if (typeof window === "undefined") return false;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  return hash.get("type") === "recovery" || query.get("type") === "recovery";
};

const readStoredRecovery = () => {
  if (typeof window === "undefined") return false;
  if (urlLooksLikeRecovery()) {
    sessionStorage.setItem(RECOVERY_STORAGE_KEY, "1");
    return true;
  }
  return sessionStorage.getItem(RECOVERY_STORAGE_KEY) === "1";
};

export type VisitorDetails = { name: string; phone: string; email?: string };

interface AuthContextType {
  /** Agencies / professionals only (email + password accounts). */
  user: User | null;
  /** Regular-traffic visitor: Supabase anonymous session registered with name + phone. */
  visitorUser: User | null;
  session: Session | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, string>
  ) => Promise<{ error: AuthError | null; needsEmailConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  clearPasswordRecovery: () => void;
  signOut: () => Promise<void>;
  /** `restored` is true when name + phone matched a stored visitor whose saves moved to this session. */
  startVisitorSession: (details: VisitorDetails) => Promise<{ user: User; restored: boolean }>;
  /** Turns this particulier session into an email + password login. Skipped when no password is set. */
  setVisitorPassword: (email: string, password: string) => Promise<{ error: AuthError | null; pendingConfirmation: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // Hide the visitor until register_visitor has run, so nothing loads saves before a
  // returning visitor's saves have been moved onto the new session.
  const [visitorPending, setVisitorPending] = useState(false);
  const isParticulier = Boolean(
    authUser && (authUser.is_anonymous || authUser.user_metadata?.account_type === "particulier"),
  );
  const user = authUser && !isParticulier ? authUser : null;
  const visitorUser = isParticulier && !visitorPending ? authUser : null;
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(readStoredRecovery);

  const markPasswordRecovery = () => {
    sessionStorage.setItem(RECOVERY_STORAGE_KEY, "1");
    setIsPasswordRecovery(true);
  };

  const clearPasswordRecovery = () => {
    sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
    setIsPasswordRecovery(false);
  };

  useEffect(() => {
    const applySession = (next: Session | null) => {
      setSession(next);
      setAuthUser(next?.user ?? null);
    };

    // Each visit renews the visitor's 30-day window; once it has lapsed the
    // server refuses to renew it and the visitor has to fill the form again.
    const ensureActiveVisitor = async (current: Session | null) => {
      if (!current?.user.is_anonymous) return current;
      const { data, error } = await supabase.rpc("touch_visitor");
      if (error) return current;
      if (data === false) {
        await supabase.auth.signOut();
        return null;
      }
      return current;
    };

    const ensureFreshSession = async (current: Session | null) => {
      if (!current) return null;
      const expiresAtMs = (current.expires_at ?? 0) * 1000;
      if (expiresAtMs > Date.now() + 15_000) return current;
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        await supabase.auth.signOut();
        return null;
      }
      return data.session;
    };

    supabase.auth.getSession().then(async ({ data: { session: initial } }) => {
      if (urlLooksLikeRecovery()) markPasswordRecovery();
      applySession(await ensureActiveVisitor(await ensureFreshSession(initial)));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        markPasswordRecovery();
        applySession(nextSession);
        return;
      }
      if (event === "SIGNED_IN" && (urlLooksLikeRecovery() || sessionStorage.getItem(RECOVERY_STORAGE_KEY) === "1")) {
        markPasswordRecovery();
        applySession(nextSession);
        return;
      }
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN" || event === "USER_UPDATED") {
        applySession(nextSession);
        return;
      }
      if (event === "SIGNED_OUT") {
        clearPasswordRecovery();
        applySession(null);
        return;
      }
      void (async () => {
        applySession(await ensureFreshSession(nextSession));
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const dropVisitorSession = async () => {
    if (authUser?.is_anonymous) await supabase.auth.signOut();
  };

  const startVisitorSession = async ({ name, phone, email }: VisitorDetails) => {
    setVisitorPending(true);
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.user) throw error ?? new Error("Anonymous sign-in failed");
      const { data: restored, error: registerError } = await supabase.rpc("register_visitor", {
        p_name: name,
        p_phone: phone,
        p_email: email || null,
      });
      if (registerError) {
        await supabase.auth.signOut();
        throw registerError;
      }
      return { user: data.user, restored: restored === true };
    } finally {
      setVisitorPending(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    await dropVisitorSession();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, string>
  ) => {
    await dropVisitorSession();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    return { error, needsEmailConfirmation: !data.session };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/change-password`,
    });
    return { error };
  };

  const setVisitorPassword = async (email: string, password: string) => {
    const trimmed = email.trim();
    const alreadyPermanent = Boolean(authUser && !authUser.is_anonymous);
    const { data, error } = await supabase.auth.updateUser(
      alreadyPermanent
        ? { password, data: { account_type: "particulier" } }
        : { email: trimmed, password, data: { account_type: "particulier" } },
    );
    if (error || !data.user) return { error: error ?? new Error("Impossible d'enregistrer le mot de passe") as AuthError, pendingConfirmation: false };
    const pendingConfirmation = Boolean(data.user.is_anonymous || data.user.new_email);
    return { error: null, pendingConfirmation };
  };

  const signOut = async () => {
    clearPasswordRecovery();
    await supabase.auth.signOut();
  };

  const value = {
    user,
    visitorUser,
    session,
    loading,
    isPasswordRecovery,
    signIn,
    signUp,
    resetPassword,
    clearPasswordRecovery,
    signOut,
    startVisitorSession,
    setVisitorPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
