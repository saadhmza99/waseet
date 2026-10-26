import { MapPin, Phone } from "lucide-react";

export const websiteLinksFrom = (value?: string | null) =>
  (value || "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

export const preferredWebsiteFrom = (value?: string | null) => websiteLinksFrom(value)[0] || "";

const INFO_LINK_CLASS =
  "inline-block origin-left text-accent transition duration-150 hover:scale-[0.97] hover:text-[#174f43] hover:underline active:scale-95";

export const locationsFrom = (value?: string | null) =>
  (value || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

export type InfosField = "location" | "phone" | "website";

export const ProfileDetailsFields = ({
  profile,
  isOwnProfile,
  onEdit,
}: {
  profile: any;
  isOwnProfile: boolean;
  userEmail?: string | null;
  onEdit: (field?: InfosField) => void;
}) => {
  const addresses = locationsFrom(profile.location);

  return (
    <div className="min-w-0 break-words text-lg">
      <section className="min-w-0">
        <h3 className="mb-3 text-base font-semibold uppercase tracking-wide text-muted-foreground">Contact</h3>
        <ul className="space-y-3 text-card-foreground">
          <li className="flex items-start gap-2.5">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
            {addresses.length ? (
              <div className="min-w-0 space-y-1">
                {addresses.map((line) => (
                  <p key={line} className="break-words">
                    {line}
                  </p>
                ))}
              </div>
            ) : isOwnProfile ? (
              <button type="button" onClick={() => onEdit("location")} className="text-left text-accent hover:underline">
                Ajouter une adresse
              </button>
            ) : (
              <span className="text-muted-foreground">Adresse non renseignée</span>
            )}
          </li>
          <li className="flex items-start gap-2.5">
            <Phone className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
            {profile.phone ? (
              <a href={`tel:${profile.phone}`} className={INFO_LINK_CLASS}>
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
        </ul>
      </section>
    </div>
  );
};
