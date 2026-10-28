import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";
import { CreateAndBell } from "@/components/AppHeader";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import { resolveAvatarUrl } from "@/lib/avatar";
import { followService } from "@/services/followService";
import { profileService } from "@/services/profileService";
import { toast } from "@/components/ui/use-toast";

type FederationAccount = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  is_verified: boolean | null;
};

const TABS = [
  { id: "all", label: "Accueil" },
  { id: "projets", label: "Projets" },
  { id: "services", label: "Services" },
  { id: "marche", label: "Matériaux" },
  { id: "opportunites", label: "Opportunités" },
  { id: "federations", label: "Fédérations" },
] as const;

const Federations = () => {
  const navigate = useNavigate();
  const { user, visitorUser } = useAuth();
  const { requestVisitor } = useVisitorGate();
  const [rows, setRows] = useState<FederationAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    profileService
      .listFederations()
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
  }, []);

  useEffect(() => {
    const actorId = user?.id || visitorUser?.id;
    if (!actorId || !rows.length) return;
    let cancelled = false;
    followService
      .getFollowing(actorId)
      .then((list) => {
        if (cancelled) return;
        const next: Record<string, boolean> = {};
        for (const row of list || []) {
          if (row.following_id) next[row.following_id] = true;
        }
        setFollowed(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id, visitorUser?.id, rows.length]);

  const openTab = (id: (typeof TABS)[number]["id"]) => {
    if (id === "federations") return;
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

  const toggleFollow = async (account: FederationAccount) => {
    const actor = user || visitorUser || (await requestVisitor("profile"));
    if (!actor || actor.id === account.id) return;
    const isOn = Boolean(followed[account.id]);
    setFollowed((current) => ({ ...current, [account.id]: !isOn }));
    try {
      if (isOn) await followService.unfollowUser(actor.id, account.id);
      else await followService.followUser(actor.id, account.id);
    } catch {
      setFollowed((current) => ({ ...current, [account.id]: isOn }));
      toast({ title: "Erreur", description: "Impossible de mettre à jour le suivi." });
    }
  };

  return (
    <DesktopRailFrame className="min-h-screen bg-white pb-20 lg:pb-0">
      <div className="mb-4 hidden items-end justify-between gap-4 border-b border-neutral-200 lg:flex">
        <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        <CreateAndBell calm showBell={false} className="self-center" pillClassName="h-[3.25rem] px-4 text-base" />
      </div>

      {loading ? (
        <p className="py-8 text-center text-neutral-500">Chargement...</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-neutral-500">Aucune fédération pour le moment.</p>
      ) : (
        <div>
          {rows.map((account) => {
            const name = (account.full_name || account.username || "Fédération").trim();
            const city = (account.location || "").trim();
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
                      Fédération{city ? ` · ${city}` : ""}
                    </span>
                    {account.bio ? (
                      <span className="mt-0.5 block truncate text-sm text-neutral-500">{account.bio}</span>
                    ) : null}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void toggleFollow(account)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-base font-semibold transition sm:px-5 sm:text-lg ${
                    followed[account.id] ? "bg-[#174f43] text-white" : "border border-[#174f43] text-[#174f43]"
                  }`}
                >
                  {followed[account.id] ? "Suivi" : "Suivre"}
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
