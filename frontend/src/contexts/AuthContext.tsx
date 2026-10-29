import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

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
  signInWithOAuth: (provider: "google" | "apple") => Promise<{ error: AuthError | null }>;
  verifySignupOtp: (email: string, token: string) => Promise<{ error: AuthError | null }>;
  resendSignupEmail: (email: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  clearPasswordRecovery: () => void;
  signOut: () => Promise<void>;
  /** True from the logout click until the app has returned to the feed. */
  loggingOut: boolean;
  acknowledgeLogout: () => void;
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
  // Guards against notifying twice when several auth checks drop the same
  // dead session; reset whenever a live session is applied again.
  const sessionEndedNotified = useRef(false);
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
      if (next) sessionEndedNotified.current = false;
      setSession(next);
      setAuthUser(next?.user ?? null);
    };

    // When a stored session turns out to be dead server-side we drop it and
    // fall back to guest; tell real accounts why they were logged off.
    // Anonymous visitor sessions end silently (they just re-register).
    const dropDeadSession = async (current: Session | null) => {
      await supabase.auth.signOut({ scope: "local" });
      if (!current || current.user.is_anonymous || sessionEndedNotified.current) return;
      sessionEndedNotified.current = true;
      toast({
        title: "Session expirée",
        description: "Vous avez été déconnecté. Veuillez vous reconnecter pour continuer.",
        duration: 8000,
      });
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
        await dropDeadSession(current);
        return null;
      }
      return data.session;
    };

    // A stored session can look unexpired locally while the server already
    // rejects its token (revoked session, project restore, rotated JWT
    // secret). PostgREST then answers 401 to every authed request while
    // anon/guest requests keep working — the app looks logged in but every
    // list stays empty. Validate the token against GoTrue once on load:
    // refresh if possible, otherwise drop to guest instead of staying stuck.
    const ensureValidSession = async (current: Session | null) => {
      const fresh = await ensureFreshSession(current);
      if (!fresh) return null;
      // Never let a hanging network call block the app: on timeout keep the
      // stored session as-is.
      const validation = await Promise.race([
        supabase.auth.getUser().then(({ error }) => error),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
      ]);
      if (!validation) return fresh;
      const error = validation;
      // Only treat explicit auth rejections as a dead session; on network
      // errors keep the stored session and let queries retry later.
      if (error.status && error.status !== 401 && error.status !== 403) return fresh;
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !data.session) {
        await dropDeadSession(fresh);
        return null;
      }
      return data.session;
    };

    supabase.auth.getSession().then(async ({ data: { session: initial } }) => {
      if (urlLooksLikeRecovery()) markPasswordRecovery();
      applySession(await ensureActiveVisitor(await ensureValidSession(initial)));
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
        applySession(await ensureValidSession(nextSession));
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
        emailRedirectTo: `${window.location.origin}/create-profile?verified=1`,
      },
    });
    return { error, needsEmailConfirmation: !data.session };
  };

  const signInWithOAuth = async (provider: "google" | "apple") => {
    await dropVisitorSession();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/create-profile?oauth=1`,
      },
    });
    return { error };
  };

  const verifySignupOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: "signup",
    });
    return { error };
  };

  const resendSignupEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/create-profile?verified=1`,
      },
    });
    return { error };
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

  const [loggingOut, setLoggingOut] = useState(false);

  const acknowledgeLogout = useCallback(() => setLoggingOut(false), []);

  const signOut = async () => {
    clearPasswordRecovery();
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      setLoggingOut(false);
      throw error;
    }
  };

  const value = {
    user,
    visitorUser,
    session,
    loading,
    isPasswordRecovery,
    signIn,
    signUp,
    signInWithOAuth,
    verifySignupOtp,
    resendSignupEmail,
    resetPassword,
    clearPasswordRecovery,
    signOut,
    loggingOut,
    acknowledgeLogout,
    startVisitorSession,
    setVisitorPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
