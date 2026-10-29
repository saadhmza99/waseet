import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  institutionService,
  type ArticleRow,
  type FormationRow,
} from "@/services/institutionService";
import { storageService } from "@/services/storageService";

type Mode = "articles" | "formations";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};

const PublicationCard = ({
  href,
  cover,
  kicker,
  title,
  excerpt,
  meta,
  onDelete,
}: {
  href?: string | null;
  cover?: string | null;
  kicker?: string | null;
  title: string;
  excerpt?: string | null;
  meta?: string | null;
  onDelete?: () => void;
}) => {
  const body = (
    <>
      {cover ? (
        <img src={cover} alt="" className="aspect-video w-full object-cover sm:w-64 sm:shrink-0" />
      ) : (
        <span className="aspect-video w-full bg-neutral-100 sm:w-64 sm:shrink-0" />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
        {kicker ? <span className="text-sm font-semibold uppercase tracking-wide text-[#174f43]">{kicker}</span> : null}
        <span className="text-xl font-semibold leading-snug text-neutral-950">{title}</span>
        {excerpt ? <span className="line-clamp-3 text-base leading-relaxed text-neutral-600">{excerpt}</span> : null}
        {meta ? <span className="mt-auto pt-2 text-xs text-neutral-500">{meta}</span> : null}
      </span>
    </>
  );
  return (
    <div className="flex overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-1 flex-col sm:flex-row">
          {body}
        </a>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col sm:flex-row">{body}</div>
      )}
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="self-start p-3 text-neutral-400 hover:text-neutral-800"
          aria-label="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
};

export const InstitutionLibrary = ({
  mode,
  userId,
  isOwn,
  onCount,
}: {
  mode: Mode;
  userId: string;
  isOwn: boolean;
  onCount?: (count: number) => void;
}) => {
  const articles = mode === "articles";
  const [rows, setRows] = useState<Array<ArticleRow | FormationRow>>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [rubrique, setRubrique] = useState("");
  const [place, setPlace] = useState("");
  const [when, setWhen] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = articles ? institutionService.listArticles(userId) : institutionService.listFormations(userId);
    load
      .then((list) => {
        if (cancelled) return;
        setRows(list);
        onCount?.(list.length);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) onCount?.(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [articles, userId, onCount]);

  const reset = () => {
    setTitle("");
    setExcerpt("");
    setRubrique("");
    setPlace("");
    setWhen("");
    setUrl("");
    setFile(null);
    setOpen(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const cover = file ? await storageService.uploadFile(file, articles ? "articles" : "formations") : null;
      if (articles) {
        const created = await institutionService.createArticle(userId, {
          title,
          excerpt,
          rubrique,
          published_on: when || null,
          url,
          cover_url: cover,
        });
        setRows((current) => {
          const next = [created, ...current];
          onCount?.(next.length);
          return next;
        });
      } else {
        const created = await institutionService.createFormation(userId, {
          title,
          excerpt,
          place,
          starts_on: when || null,
          url,
          cover_url: cover,
        });
        setRows((current) => {
          const next = [created, ...current];
          onCount?.(next.length);
          return next;
        });
      }
      reset();
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      if (articles) await institutionService.deleteArticle(id);
      else await institutionService.deleteFormation(id);
      setRows((current) => {
        const next = current.filter((row) => row.id !== id);
        onCount?.(next.length);
        return next;
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de supprimer." });
    }
  };

  return (
    <div className="px-3 py-4 sm:px-4">
      {isOwn ? (
        <div className="mb-4">
          {open ? (
            <form onSubmit={(event) => void submit(event)} className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titre" required maxLength={180} />
              {articles ? (
                <Input value={rubrique} onChange={(event) => setRubrique(event.target.value)} placeholder="Rubrique" maxLength={80} />
              ) : (
                <Input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="Lieu" maxLength={120} />
              )}
              <Textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="Extrait" rows={3} maxLength={400} />
              <Input type="date" value={when} onChange={(event) => setWhen(event.target.value)} />
              <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Lien" maxLength={400} />
              <Input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="bg-[#174f43] text-white hover:bg-[#174f43]/90">
                  {saving ? "Enregistrement…" : "Publier"}
                </Button>
                <Button type="button" variant="outline" onClick={reset}>
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <Button type="button" onClick={() => setOpen(true)} className="h-8 bg-[#174f43] px-3 text-white hover:bg-[#174f43]/90">
              <Plus className="mr-1.5 h-4 w-4" />
              {articles ? "Ajouter un article" : "Ajouter une formation"}
            </Button>
          )}
        </div>
      ) : null}
      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-base text-neutral-500">
          {articles ? "Aucun article pour le moment." : "Aucune formation pour le moment."}
        </p>
      ) : (
        <ul className="grid gap-3">
          {rows.map((row) =>
            articles ? (
              <li key={row.id}>
                <PublicationCard
                  href={(row as ArticleRow).url}
                  cover={row.cover_url}
                  kicker={(row as ArticleRow).rubrique}
                  title={row.title}
                  excerpt={row.excerpt}
                  meta={formatDate((row as ArticleRow).published_on)}
                  onDelete={isOwn ? () => void remove(row.id) : undefined}
                />
              </li>
            ) : (
              <li key={row.id}>
                <PublicationCard
                  href={(row as FormationRow).url}
                  cover={row.cover_url}
                  kicker={(row as FormationRow).place}
                  title={row.title}
                  excerpt={row.excerpt}
                  meta={formatDate((row as FormationRow).starts_on)}
                  onDelete={isOwn ? () => void remove(row.id) : undefined}
                />
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
};
