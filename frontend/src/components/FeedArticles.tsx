import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { institutionService, type ArticleRow } from "@/services/institutionService";
import { IosShareIcon } from "@/components/PostActionIcons";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import { resolveAvatarUrl } from "@/lib/avatar";
import { toast } from "@/components/ui/use-toast";

const SAVED_KEY = "sifarah.savedArticles";

const readSaved = () => {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set<string>(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set<string>();
  }
};

const writeSaved = (ids: Set<string>) => {
  localStorage.setItem(SAVED_KEY, JSON.stringify([...ids]));
};

const formatShort = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

const profileOf = (row: ArticleRow) => {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return profile || null;
};

type ArticleProfile = NonNullable<ReturnType<typeof profileOf>>;

export const FeedArticles = () => {
  const { requestVisitor } = useVisitorGate();
  const [rows, setRows] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Set<string>>(() => readSaved());

  useEffect(() => {
    let cancelled = false;
    institutionService
      .listPublicArticles()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((error) => {
        console.error("Error loading articles:", error);
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSave = async (id: string) => {
    const saver = await requestVisitor("save");
    if (!saver) return;
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeSaved(next);
      return next;
    });
  };

  const share = async (row: ArticleRow) => {
    const url = (row.url || "").trim() || window.location.href;
    if (navigator.share) {
      void navigator.share({ title: row.title, text: row.excerpt || row.title, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Lien copié", description: "Le lien de cet article a été copié." });
    } catch {
      toast({ title: "Partage", description: url });
    }
  };

  if (loading) {
    return <p className="py-8 text-center text-neutral-500">Chargement...</p>;
  }
  if (!rows.length) {
    return <p className="py-8 text-center text-neutral-500">Aucun article pour le moment.</p>;
  }

  return (
    <div className="mx-auto grid w-full max-w-[36rem] grid-cols-1 gap-3 px-3 pb-6 lg:px-0">
      {rows.map((row) => {
        const date = formatShort(row.published_on);
        const profile = profileOf(row);
        const href = (row.url || "").trim();
        const isSaved = saved.has(row.id);
        const body = <ArticleBody row={row} />;
        return (
          <article
            key={row.id}
            className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-[#174f43]/40 hover:shadow-md"
          >
            <ArticleAccount profile={profile} date={date} />
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="group block cursor-pointer">
                {body}
              </a>
            ) : (
              <div>{body}</div>
            )}
            <div className="flex items-center gap-3 px-3 pb-2.5 pt-1">
              <button
                type="button"
                onClick={() => void toggleSave(row.id)}
                className={`transition-transform active:scale-90 ${isSaved ? "text-[#174f43]" : "text-neutral-900"}`}
                aria-label="Favoris"
              >
                <Heart className={`h-6 w-6 ${isSaved ? "fill-[#174f43] text-[#174f43]" : ""}`} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => void share(row)}
                className="text-neutral-700 transition-transform active:scale-90"
                aria-label="Partager"
              >
                <IosShareIcon className="h-6 w-6" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
};

const ArticleAccount = ({ profile, date }: { profile: ArticleProfile | null; date: string }) => {
  const name = (profile?.full_name || profile?.username || "").trim();
  const username = (profile?.username || "").trim();
  if (!name && !username) return null;
  const avatar = resolveAvatarUrl(
    profile?.avatar_url,
    profile?.profile_type === "individual" ? "individual" : "enterprise",
  );
  const content = (
    <>
      <img src={avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover bg-neutral-100" />
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate text-sm font-semibold text-neutral-900">{name || username}</span>
          <VerifiedBadge verified={Boolean(profile?.is_verified)} className="h-3.5 w-3.5" />
        </span>
        {date ? <span className="block text-xs text-neutral-500">{date}</span> : null}
      </span>
    </>
  );
  return (
    <div className="px-3 pt-3">
      {username ? (
        <Link to={`/profile/${username}`} className="flex min-w-0 items-center gap-2.5">
          {content}
        </Link>
      ) : (
        <div className="flex min-w-0 items-center gap-2.5">{content}</div>
      )}
    </div>
  );
};

const ArticleBody = ({ row }: { row: ArticleRow }) => (
  <>
    <span className="relative mt-2.5 block aspect-[2/1] w-full overflow-hidden bg-neutral-100">
      {row.cover_url ? (
        <img
          src={row.cover_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      ) : null}
    </span>
    <span className="flex flex-col gap-1 px-3 py-2.5">
      {row.rubrique ? (
        <span className="text-sm font-semibold uppercase tracking-wide text-[#174f43]">{row.rubrique}</span>
      ) : null}
      <span className="text-xl font-semibold leading-snug text-neutral-950 group-hover:underline">{row.title}</span>
      {row.excerpt ? <span className="line-clamp-3 text-base leading-relaxed text-neutral-600">{row.excerpt}</span> : null}
    </span>
  </>
);
