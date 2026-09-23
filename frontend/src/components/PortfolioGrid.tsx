import { useState } from "react";
import { Bath, BedDouble, Heart, Maximize2, MessageCircle, Phone, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { inquiryService } from "@/services/inquiryService";
import FullScreenPopup from "@/components/FullScreenPopup";
import FeatureAmenityGrid from "@/components/FeatureAmenityGrid";
import {
  ALL_FEATURES,
  formatPriceDh,
  formatSurface,
  labelOf,
  PROPERTY_CONDITIONS,
  PROPERTY_KINDS,
  PROPERTY_STANDINGS,
  PROPERTY_STATUSES,
  PropertyDetails,
  toWhatsAppNumber,
} from "@/lib/propertyListing";

export type PortfolioCardItem = {
  id: string;
  postType: "property" | "project";
  image: string;
  images?: string[];
  title: string;
  description?: string;
  price?: string | null;
  surface?: string | null;
  beds?: number | null;
  baths?: number | null;
  details?: Partial<PropertyDetails> | null;
  sellerId?: string;
  sellerPhone?: string | null;
};

interface PortfolioGridProps {
  items: PortfolioCardItem[];
}

const coverFallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e5e7eb"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-size="18">Photo</text></svg>`
  );

const Characteristic = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium text-card-foreground">{value}</p>
    </div>
  );
};

const PortfolioGrid = ({ items }: PortfolioGridProps) => {
  const [selected, setSelected] = useState<PortfolioCardItem | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "", needs: "" });
  const [sending, setSending] = useState(false);

  if (!items.length) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Aucun bien ni projet dans le portfolio...
      </p>
    );
  }

  const shareItem = async (item: PortfolioCardItem) => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Lien copié", description: "Le lien a été copié." });
      }
    } catch {
      toast({ title: "Partage", description: "Impossible de partager pour le moment." });
    }
  };

  const phoneOf = (item: PortfolioCardItem) =>
    item.details?.phones?.[0] || item.sellerPhone || "";

  const sendInquiry = async () => {
    if (!selected?.sellerId) return;
    if (!contact.name.trim() || !contact.email.trim() || !contact.phone.trim()) {
      toast({ title: "Contact", description: "Nom, email et téléphone sont requis." });
      return;
    }
    setSending(true);
    try {
      await inquiryService.createInquiry({
        sellerId: selected.sellerId,
        postId: selected.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        needs: contact.needs || (selected.postType === "property" ? "Dites-moi si le prix baisse." : ""),
      });
      toast({ title: "Message envoyé", description: "Le propriétaire a reçu votre demande." });
      setContact({ name: "", email: "", phone: "", needs: "" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer la demande." });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const details = item.details || {};
          const pieces = details.pieces;
          const location = [details.address, details.city].filter(Boolean).join(", ") || details.region;
          return (
            <article key={item.id} className="overflow-hidden rounded-lg border border-border bg-card text-left hover:shadow-lg transition-shadow">
              <button type="button" onClick={() => setSelected(item)} className="block w-full text-left">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img src={item.image || coverFallback} alt={item.title} className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {item.postType === "property" ? labelOf(PROPERTY_KINDS, details.propertyKind) || "Bien" : "Projet"}
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  {item.postType === "property" ? (
                    <>
                      <p className="text-xl font-bold text-card-foreground">{formatPriceDh(item.price)}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-card-foreground">
                        {item.surface ? (
                          <span className="inline-flex items-center gap-1">
                            <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatSurface(item.surface)}
                          </span>
                        ) : null}
                        {pieces ? <span>{pieces} Pièce{pieces > 1 ? "s" : ""}</span> : null}
                        {item.beds != null ? (
                          <span className="inline-flex items-center gap-1">
                            <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.beds} Rooms
                          </span>
                        ) : null}
                        {item.baths != null ? (
                          <span className="inline-flex items-center gap-1">
                            <Bath className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.baths} Bathrooms
                          </span>
                        ) : null}
                      </div>
                      {location ? <p className="mt-2 text-sm font-medium text-card-foreground">{location}</p> : null}
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                    </>
                  ) : (
                    <>
                      <h3 className="mb-1 font-bold text-card-foreground line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{item.description || item.title}</p>
                    </>
                  )}
                </div>
              </button>
              {item.postType === "property" && (
                <div className="flex items-center justify-between border-t border-border px-3 py-2">
                  <button type="button" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent">
                    <Heart className="h-4 w-4" /> Favourite
                  </button>
                  <button type="button" onClick={() => shareItem(item)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(item);
                      setContact((prev) => ({ ...prev, needs: "Dites-moi si le prix baisse." }));
                    }}
                    className="text-xs font-medium text-accent"
                  >
                    Let me know if it lowers!
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <FullScreenPopup open={Boolean(selected)} onClose={() => setSelected(null)}>
          {selected ? (
            selected.postType === "property" ? (
              <div className="grid h-full min-h-0 grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(280px,360px)] overflow-hidden">
                <div className="min-h-0 bg-muted">
                  <img
                    src={selected.image || coverFallback}
                    alt={selected.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-h-0 flex-col overflow-hidden p-5 pr-10">
                  <h2 className="line-clamp-2 pr-8 text-xl font-semibold">{selected.title}</h2>
                  <p className="mt-2 text-2xl font-bold text-card-foreground">{formatPriceDh(selected.price)}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-card-foreground">
                    {selected.surface ? <span>{formatSurface(selected.surface)}</span> : null}
                    {selected.details?.pieces ? <span>{selected.details.pieces} Pièces</span> : null}
                    {selected.beds != null ? <span>{selected.beds} Rooms</span> : null}
                    {selected.baths != null ? <span>{selected.baths} Bathrooms</span> : null}
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-muted-foreground">
                    {[selected.details?.address, selected.details?.city].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-card-foreground">
                    {selected.description}
                  </p>
                  <h4 className="mt-4 mb-2 text-sm font-semibold">General Characteristics</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Characteristic label="Type of property" value={labelOf(PROPERTY_KINDS, selected.details?.propertyKind)} />
                    <Characteristic label="Plot surface" value={formatSurface(selected.details?.plotSurface)} />
                    <Characteristic label="Condition" value={labelOf(PROPERTY_CONDITIONS, selected.details?.condition)} />
                    <Characteristic label="Standing" value={labelOf(PROPERTY_STANDINGS, selected.details?.standing)} />
                    <Characteristic label="Status" value={labelOf(PROPERTY_STATUSES, selected.details?.status)} />
                    <Characteristic label="Delivery" value={selected.details?.delivery} />
                    <Characteristic label="Age" value={selected.details?.age} />
                    <Characteristic label="Orientation" value={selected.details?.orientation} />
                    <Characteristic label="Flooring" value={selected.details?.flooring} />
                    <Characteristic label="Number of floors" value={selected.details?.floors} />
                    <Characteristic label="Garden" value={formatSurface(selected.details?.gardenSurface)} />
                    <Characteristic label="Terrace" value={formatSurface(selected.details?.terraceSurface)} />
                  </div>
                  {selected.details?.features?.length ? (
                    <div className="mt-4">
                      <h4 className="mb-3 text-sm font-semibold">Caractéristiques</h4>
                      <FeatureAmenityGrid
                        items={ALL_FEATURES.filter((item) => selected.details?.features?.includes(item.id))}
                        selected={selected.details.features}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="flex min-h-0 flex-col justify-center gap-3 border-l border-border bg-muted/30 p-5">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const phone = phoneOf(selected);
                        if (!phone) {
                          toast({ title: "Unavailable", description: "Aucun numéro." });
                          return;
                        }
                        window.location.href = `tel:${phone.replace(/\D/g, "")}`;
                      }}
                    >
                      <Phone className="mr-2 h-4 w-4" /> Call
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        const phone = phoneOf(selected);
                        if (!phone) {
                          toast({ title: "Unavailable", description: "Aucun numéro." });
                          return;
                        }
                        window.open(`https://wa.me/${toWhatsAppNumber(phone)}`, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                    </Button>
                  </div>
                  <Input placeholder="Nom" value={contact.name} onChange={(e) => setContact((prev) => ({ ...prev, name: e.target.value }))} />
                  <Input type="email" placeholder="Email" value={contact.email} onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))} />
                  <Input placeholder="Téléphone" value={contact.phone} onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))} />
                  <Textarea placeholder="Besoins spécifiques" rows={3} className="resize-none" value={contact.needs} onChange={(e) => setContact((prev) => ({ ...prev, needs: e.target.value }))} />
                  <Button className="w-full" onClick={sendInquiry} disabled={sending}>
                    {sending ? "Envoi..." : "Contact"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid h-full overflow-hidden grid-cols-2">
                <img src={selected.image || coverFallback} alt={selected.title} className="h-full w-full object-cover" />
                <div className="flex flex-col justify-center p-6 pr-12">
                  <h2 className="text-xl font-semibold">{selected.title}</h2>
                  <p className="mt-4 line-clamp-8 text-sm">{selected.description || "Pas de description."}</p>
                </div>
              </div>
            )
          ) : null}
      </FullScreenPopup>
    </>
  );
};

export default PortfolioGrid;
