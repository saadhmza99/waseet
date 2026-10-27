import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  profileSectionsForInternalCodes,
  type ProfileSectionVisibility,
} from "@/lib/taxonomy";
import { profileService } from "@/services/profileService";
import { taxonomyService } from "@/services/taxonomyService";

const empty: ProfileSectionVisibility = {
  showPosts: false,
  showRealisations: false,
  showProjets: false,
  showBiens: false,
  showServices: false,
  showProduits: false,
};

/** Own-account section permissions for create CTAs (promoteur → projets, etc.). */
export const useMyCreateCapabilities = () => {
  const { user, loading: authLoading } = useAuth();
  const [sections, setSections] = useState<ProfileSectionVisibility>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setSections(empty);
      setReady(true);
      return;
    }
    let cancelled = false;
    Promise.all([
      taxonomyService.listInternalCategories(),
      taxonomyService.getProfileInternalCategoryIds(user.id),
      profileService.getProfile(user.id),
    ])
      .then(([rows, ids, profile]) => {
        if (cancelled) return;
        const codes = ids
          .map((id) => rows.find((row) => row.id === id)?.code || null)
          .filter(Boolean) as string[];
        setSections(
          profileSectionsForInternalCodes(codes, { isVerified: Boolean(profile?.is_verified) }),
        );
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setSections(empty);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { sections, ready, signedIn: Boolean(user) };
};
