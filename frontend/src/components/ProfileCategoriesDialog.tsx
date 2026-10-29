import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { FEED_CATEGORIES } from "@/lib/taxonomy";
import { profileService } from "@/services/profileService";
import { taxonomyService, type InternalCategory } from "@/services/taxonomyService";

const MAX_CATEGORIES = 5;

export const ProfileCategoriesDialog = ({
  open,
  onOpenChange,
  profileId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  onSaved: () => void;
}) => {
  const [rows, setRows] = useState<InternalCategory[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [openFeeds, setOpenFeeds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      taxonomyService.listInternalCategories(),
      taxonomyService.getProfileInternalCategoryIds(profileId),
    ])
      .then(([list, ids]) => {
        if (cancelled) return;
        const next = ids.slice(0, MAX_CATEGORIES);
        setRows(list);
        setSelected(next);
        const chosen = new Set(next);
        setOpenFeeds(
          FEED_CATEGORIES.filter((feed) => list.some((row) => row.category_id === feed.id && chosen.has(row.id))).map(
            (feed) => feed.id,
          ),
        );
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) toast({ title: "Erreur", description: "Impossible de charger les catégories." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, profileId]);

  const groups = useMemo(() => {
    return FEED_CATEGORIES.map((feed) => ({
      feed,
      items: rows.filter((row) => row.category_id === feed.id),
    })).filter((group) => group.items.length);
  }, [rows]);

  const toggleFeed = (id: number) => {
    setOpenFeeds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleCategory = (id: number) => {
    setSelected((current) => {
      if (current.includes(id)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_CATEGORIES) {
        toast({ title: "Limite atteinte", description: `Jusqu'à ${MAX_CATEGORIES} catégories internes.` });
        return current;
      }
      return [...current, id];
    });
  };

  const makePrimary = (id: number) => {
    setSelected((current) => [id, ...current.filter((item) => item !== id)]);
  };

  const save = async () => {
    if (!selected.length) return;
    setSaving(true);
    try {
      await taxonomyService.setProfileInternalCategoryIds(profileId, selected);
      const primary = rows.find((row) => row.id === selected[0]);
      if (primary) {
        const feed = FEED_CATEGORIES.find((item) => item.id === primary.category_id);
        await profileService.updateProfile(profileId, {
          profession: primary.sub_category || feed?.label || primary.detailed_sub_category,
        });
      }
      onSaved();
      onOpenChange(false);
      toast({ title: "Catégories mises à jour" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer les catégories." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Catégories</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-neutral-600">
          Choisissez les catégories, puis les catégories internes qui s'affichent sous la bio. La première est la
          catégorie principale. Les onglets du profil suivent ces catégories internes.
        </p>
        {loading ? (
          <p className="py-6 text-center text-sm text-neutral-500">Chargement…</p>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => {
              const openGroup = openFeeds.includes(group.feed.id);
              const picked = group.items.filter((item) => selected.includes(item.id)).length;
              return (
                <div key={group.feed.id} className="rounded-lg border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => toggleFeed(group.feed.id)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-semibold"
                  >
                    <span>{group.feed.label}</span>
                    <span className="text-xs font-medium text-neutral-500">{picked ? `${picked} interne${picked > 1 ? "s" : ""}` : "Ouvrir"}</span>
                  </button>
                  {openGroup ? (
                    <ul className="space-y-1 border-t border-neutral-100 px-2 py-2">
                      {group.items.map((item) => {
                        const checked = selected.includes(item.id);
                        const primary = selected[0] === item.id;
                        return (
                          <li key={item.id} className="flex items-center gap-2 rounded-md px-1 py-1">
                            <label className="flex min-w-0 flex-1 items-start gap-2 text-sm">
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={checked}
                                onChange={() => toggleCategory(item.id)}
                              />
                              <span className="min-w-0">
                                <span className="block font-medium text-neutral-900">{item.detailed_sub_category}</span>
                                <span className="block text-xs text-neutral-500">
                                  {item.sub_category} · {item.code}
                                </span>
                              </span>
                            </label>
                            {checked && !primary ? (
                              <button
                                type="button"
                                onClick={() => makePrimary(item.id)}
                                className="shrink-0 text-xs font-semibold text-[#174f43]"
                              >
                                Principale
                              </button>
                            ) : null}
                            {primary ? <span className="shrink-0 text-xs font-semibold text-[#174f43]">Principale</span> : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => onOpenChange(false)} className="h-10 rounded-lg border border-neutral-300 px-4 text-sm font-semibold">
            Annuler
          </button>
          <button
            type="button"
            disabled={saving || loading || !selected.length}
            onClick={() => void save()}
            className="h-10 rounded-lg bg-[#174f43] px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            Enregistrer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
