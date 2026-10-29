import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { moderationService } from "@/services/moderationService";
import { resolveAvatarUrl } from "@/lib/avatar";
import { INSTITUTION_KINDS, institutionKindLabel } from "@/lib/institution";
import { profileService } from "@/services/profileService";
import { toast } from "@/components/ui/use-toast";

type InstitutionAccount = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  is_verified: boolean | null;
  institution_kind: string | null;
};

const TABS = [
  { id: "all", label: "Accueil" },
  { id: "projets", label: "Projets" },
  { id: "marche", label: "Matériaux" },
  { id: "opportunites", label: "Opportunités" },
  { id: "federations", label: "Fédérations" },
  { id: "contact", label: "Contactez-nous" },
] as const;

const Federations = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [adminChecked, setAdminChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState<InstitutionAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<string>("all");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAllowed(false);
      setAdminChecked(true);
      return;
    }
    let cancelled = false;
    moderationService
      .isModerator(user.id)
      .then((ok) => {
        if (!cancelled) setAllowed(ok);
      })
      .catch(() => {
        if (!cancelled) setAllowed(false);
      })
      .finally(() => {
        if (!cancelled) setAdminChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    profileService
      .listInstitutions()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) {
          toast({ title: "Erreur", description: "Impossible de charger les fédérations." });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  const openTab = (id: (typeof TABS)[number]["id"]) => {
    if (id === "federations") return;
    if (id === "contact") {
      navigate("/contact");
      return;
    }
    if (id === "opportunites") {
      navigate("/opportunites");
      return;
    }
    if (id === "marche") {
      navigate("/produits");
      return;
    }
    if (id === "all") {
      navigate("/");
      return;
    }
    navigate(`/?vue=${id}`);
  };

  if (authLoading || !adminChecked) {
    return <div className="py-8 text-center text-muted-foreground">Chargement...</div>;
  }
  if (!allowed) return <Navigate to="/" replace />;

  const visible = kind === "all" ? rows : rows.filter((account) => account.institution_kind === kind);

  return (
    <DesktopRailFrame className="min-h-screen bg-white pb-20 lg:pb-0">
      <div className="mb-4 hidden border-b border-neutral-200 lg:block">
        <div className="flex min-w-0 items-end gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((item) => {
            const active = item.id === "federations";
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openTab(item.id)}
                className={`flex shrink-0 items-center justify-center whitespace-nowrap border-b-2 px-3.5 py-3.5 text-lg font-semibold ${
                  active ? "border-[#174f43] text-[#174f43]" : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-2 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] lg:px-0 [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setKind("all")}
          className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold ${
            kind === "all" ? "bg-[#174f43] text-white" : "bg-neutral-100 text-neutral-700"
          }`}
        >
          Tous
        </button>
        {INSTITUTION_KINDS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setKind(item.id)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold ${
              kind === item.id ? "bg-[#174f43] text-white" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-neutral-500">Chargement...</p>
      ) : visible.length === 0 ? (
        <p className="py-8 text-center text-neutral-500">
          {kind === "all" ? "Aucune institution pour le moment." : "Aucun compte pour ce type."}
        </p>
      ) : (
        <div>
          {visible.map((account) => {
            const name = (account.full_name || account.username || "Institution").trim();
            const city = (account.location || "").trim();
            const typeLabel = institutionKindLabel(account.institution_kind);
            return (
              <div key={account.id} className="flex items-center gap-4 border-b border-neutral-100 px-3 py-4 sm:gap-5 sm:py-5 lg:px-0">
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${account.id}`)}
                  className="flex min-w-0 flex-1 items-center gap-4 text-left sm:gap-5"
                >
                  <img
                    src={resolveAvatarUrl(account.avatar_url, "institution")}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-2xl bg-neutral-100 object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
                  />
                  <span className="min-w-0">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-lg font-semibold text-neutral-950 sm:text-xl">{name}</span>
                      <VerifiedBadge verified={account.is_verified} className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <span className="mt-1 block truncate text-base text-neutral-400 sm:text-lg">
                      {typeLabel}{city ? ` · ${city}` : ""}
                    </span>
                    {account.bio ? (
                      <span className="mt-0.5 block truncate text-sm text-neutral-500">{account.bio}</span>
                    ) : null}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DesktopRailFrame>
  );
};

export default Federations;
