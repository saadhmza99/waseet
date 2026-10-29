import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { moderationService } from "@/services/moderationService";

/** True only when the signed-in account is in moderation_admins. */
export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    moderationService
      .isModerator(user.id)
      .then((ok) => {
        if (!cancelled) setIsAdmin(ok);
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return isAdmin;
};
