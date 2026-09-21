import { useState } from "react";
import { BedDouble, Bath, Maximize2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PortfolioCardItem = {
  id: string;
  postType: "property" | "project";
  image: string;
  title: string;
  description?: string;
  price?: string | null;
  surface?: string | null;
  beds?: number | null;
  baths?: number | null;
};

interface PortfolioGridProps {
  items: PortfolioCardItem[];
}

const coverFallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-size="18">Photo</text></svg>`
  );

function formatSurface(surface?: string | null) {
  if (!surface) return "";
  return `${surface}${/\d/.test(surface) && !/m/i.test(surface) ? " m²" : ""}`;
}

const PortfolioGrid = ({ items }: PortfolioGridProps) => {
  const [selected, setSelected] = useState<PortfolioCardItem | null>(null);

  if (!items.length) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setSelected(item)}
            className="overflow-hidden rounded-lg border border-border bg-card text-left hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              <img
                src={item.image || coverFallback}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                {item.postType === "property" ? "Bien" : "Projet"}
              </span>
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="mb-1 font-bold text-card-foreground line-clamp-2 break-words">{item.title}</h3>
              {item.postType === "property" ? (
                <>
                  {(item.beds != null || item.baths != null || item.surface) && (
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-card-foreground">
                      {item.beds != null ? (
                        <span className="inline-flex items-center gap-1">
                          <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.beds}
                        </span>
                      ) : null}
                      {item.baths != null ? (
                        <span className="inline-flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.baths}
                        </span>
                      ) : null}
                      {item.surface ? (
                        <span className="inline-flex items-center gap-1">
                          <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatSurface(item.surface)}
                        </span>
                      ) : null}
                    </div>
                  )}
                  {item.description ? (
                    <p className="mb-2 text-sm text-muted-foreground line-clamp-3 break-words">{item.description}</p>
                  ) : null}
                  {item.price ? (
                    <p className="border-t border-border pt-2 text-base font-bold text-card-foreground break-words">
                      {item.price}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground line-clamp-3 break-words">
                  {item.description || item.title}
                </p>
              )}
              <p className="mt-2 text-xs font-medium text-accent">Voir les détails</p>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6 break-words">
                  {selected.title}
                  <span className="ml-2 align-middle rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                    {selected.postType === "property" ? "Bien" : "Projet"}
                  </span>
                </DialogTitle>
              </DialogHeader>
              {selected.image ? (
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="w-full max-h-[50vh] rounded-lg object-cover"
                />
              ) : null}
              {selected.postType === "property" ? (
                <div className="flex flex-wrap gap-3 text-sm text-card-foreground">
                  {selected.price ? <span className="font-bold">{selected.price}</span> : null}
                  {selected.surface ? (
                    <span className="inline-flex items-center gap-1">
                      <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatSurface(selected.surface)}
                    </span>
                  ) : null}
                  {selected.beds != null ? (
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                      {selected.beds} ch.
                    </span>
                  ) : null}
                  {selected.baths != null ? (
                    <span className="inline-flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5 text-muted-foreground" />
                      {selected.baths} sdb
                    </span>
                  ) : null}
                </div>
              ) : null}
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-card-foreground">
                {selected.description || "Pas de description."}
              </p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PortfolioGrid;
