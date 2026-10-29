import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { moderationService } from "@/services/moderationService";

interface RequireModeratorProps {
  children: ReactNode;
}

/** Login + server-backed moderation_admins check (UI gate; RLS remains the real control). */
const RequireModerator = ({ children }: RequireModeratorProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) {
        if (!cancelled) {
          setAllowed(false);
          setChecking(false);
        }
        return;
      }
      setChecking(true);
      try {
        const ok = await moderationService.isModerator(user.id);
        if (!cancelled) setAllowed(ok);
      } catch {
        if (!cancelled) setAllowed(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading || checking) {
    return <div className="py-8 text-center text-muted-foreground">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowed) {
    return <div className="py-8 text-center text-muted-foreground">Accès modération non autorisé.</div>;
  }

  return <>{children}</>;
};

export default RequireModerator;
