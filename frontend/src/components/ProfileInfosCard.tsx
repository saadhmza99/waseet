import { useState } from "react";
import { BadgeCheck, Briefcase, Globe, Mail, MapPin, Pencil, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const websiteLinksFrom = (value?: string | null) =>
  (value || "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const hrefForWebsite = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

export const locationsFrom = (value?: string | null) =>
  (value || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

export type InfosField = "profession" | "location" | "email" | "phone" | "website";

type ProfileInfosCardProps = {
  profile: any;
  isOwnProfile: boolean;
  userEmail?: string | null;
  rating: number;
  reviewCount: number;
  layout?: "sidebar" | "wide";
  onEdit: (field?: InfosField) => void;
  onReviewsClick?: () => void;
  reviewsActive?: boolean;
};

const ProfileInfosCard = ({
  profile,
  isOwnProfile,
  userEmail,
  rating,
  reviewCount,
  layout = "sidebar",
  onEdit,
  onReviewsClick,
  reviewsActive = false,
}: ProfileInfosCardProps) => {
  const wide = layout === "wide";
  const email = (profile.email || (isOwnProfile ? userEmail : "") || "").trim();
  const websites = websiteLinksFrom(profile.website_url);
  const lieux = locationsFrom(profile.location);
  const [showAllLieux, setShowAllLieux] = useState(false);
  const visibleLieux = showAllLieux ? lieux : lieux.slice(0, 1);

  return (
    <div className="min-w-0 overflow-hidden border-b border-border bg-card p-4 sm:rounded-lg sm:border">
      {isOwnProfile ? (
        <div className="mb-3 flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Modifier
          </Button>
        </div>
      ) : null}

      <div className={`min-w-0 break-words text-sm ${wide ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}`}>
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Profession & lieu
          </h3>
          <ul className="space-y-2.5 text-card-foreground">
            <li className="flex items-start gap-2">
              <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              {profile.profession ? (
                <span>{profile.profession}</span>
              ) : isOwnProfile ? (
                <button type="button" onClick={() => onEdit("profession")} className="text-left text-accent hover:underline">
                  Ajouter une profession
                </button>
              ) : (
                <span className="text-muted-foreground">Profession non renseignée</span>
              )}
            </li>
            {lieux.length > 0 ? (
              <li className="space-y-1.5">
                {visibleLieux.map((lieu, index) => (
                  <div key={`${lieu}-${index}`} className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{lieu}</span>
                  </div>
                ))}
                {lieux.length > 1 && !showAllLieux ? (
                  <div className="pl-6">
                    <span className="text-muted-foreground">...</span>
                    <button
                      type="button"
                      onClick={() => setShowAllLieux(true)}
                      className="ml-1 font-semibold text-accent hover:underline"
                    >
                      Voir plus
                    </button>
                  </div>
                ) : null}
                {lieux.length > 1 && showAllLieux ? (
                  <div className="pl-6">
                    <button
                      type="button"
                      onClick={() => setShowAllLieux(false)}
                      className="font-semibold text-accent hover:underline"
                    >
                      Voir moins
                    </button>
                  </div>
                ) : null}
                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => onEdit("location")}
                    className="pl-6 text-left text-xs text-accent hover:underline"
                  >
                    Ajouter un lieu
                  </button>
                ) : null}
              </li>
            ) : (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                {isOwnProfile ? (
                  <button type="button" onClick={() => onEdit("location")} className="text-left text-accent hover:underline">
                    Ajouter un lieu
                  </button>
                ) : (
                  <span className="text-muted-foreground">Localisation non renseignée</span>
                )}
              </li>
            )}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</h3>
          <ul className="space-y-2.5 text-card-foreground">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              {email ? (
                <a href={`mailto:${email}`} className="break-all text-accent hover:underline">
                  {email}
                </a>
              ) : isOwnProfile ? (
                <button type="button" onClick={() => onEdit("email")} className="text-left text-accent hover:underline">
                  Ajouter un email
                </button>
              ) : (
                <span className="text-muted-foreground">Email non renseigné</span>
              )}
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              {profile.phone ? (
                <a href={`tel:${profile.phone}`} className="text-accent hover:underline">
                  {profile.phone}
                </a>
              ) : isOwnProfile ? (
                <button type="button" onClick={() => onEdit("phone")} className="text-left text-accent hover:underline">
                  Ajouter un téléphone
                </button>
              ) : (
                <span className="text-muted-foreground">Téléphone non renseigné</span>
              )}
            </li>
            {websites.length > 0 ? (
              websites.map((link) => (
                <li key={link} className="flex items-start gap-2">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <a
                    href={hrefForWebsite(link)}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-accent hover:underline"
                  >
                    {link}
                  </a>
                </li>
              ))
            ) : (
              <li className="flex items-start gap-2">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                {isOwnProfile ? (
                  <button type="button" onClick={() => onEdit("website")} className="text-left text-accent hover:underline">
                    Ajouter un site web
                  </button>
                ) : (
                  <span className="text-muted-foreground">Aucun lien</span>
                )}
              </li>
            )}
          </ul>
        </section>

        <button
          type="button"
          onClick={() => onReviewsClick?.()}
          className={`z-10 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${
            reviewsActive
              ? "border-accent bg-accent/15 text-accent"
              : "border-border bg-secondary/50 text-card-foreground hover:border-accent/60 hover:bg-secondary hover:text-accent"
          }`}
        >
          <BadgeCheck className="h-5 w-5 shrink-0" />
          <Star className="h-4 w-4 shrink-0 fill-star text-star" />
          <span>
            {rating} · {reviewCount} avis
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProfileInfosCard;
