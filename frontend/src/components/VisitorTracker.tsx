import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { setActivityActor } from "@/lib/activityLog";
import {
  getOrCreateVisitorId,
  setVisitorTrackIdentity,
  startVisitorClickCapture,
  startVisitorDwellHeartbeat,
  trackVisitorPage,
} from "@/lib/visitorTrack";

/** Sets visitor cookies and logs page hits, dwell time, and clicks. */
const VisitorTracker = () => {
  const { pathname } = useLocation();
  const { user, visitorUser } = useAuth();

  useEffect(() => {
    getOrCreateVisitorId();
    startVisitorDwellHeartbeat();
    startVisitorClickCapture();
  }, []);

  useEffect(() => {
    if (user) {
      const label =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.username as string | undefined) ||
        user.email ||
        user.id;
      setVisitorTrackIdentity({ accountKind: "member", userId: user.id });
      setActivityActor({ actorKind: "member", actorLabel: label });
    } else if (visitorUser) {
      const label = visitorUser.email || visitorUser.id;
      setVisitorTrackIdentity({ accountKind: "visitor", userId: visitorUser.id });
      setActivityActor({ actorKind: "visitor", actorLabel: label });
    } else {
      setVisitorTrackIdentity({ accountKind: "anon", userId: null });
      setActivityActor({ actorKind: "anon", actorLabel: null });
    }
  }, [user?.id, visitorUser?.id, user?.email, visitorUser?.email]);

  useEffect(() => {
    // Pathname only — never log query strings (tokens, codes, etc.).
    void trackVisitorPage(pathname || "/");
  }, [pathname, user?.id, visitorUser?.id]);

  return null;
};

export default VisitorTracker;
