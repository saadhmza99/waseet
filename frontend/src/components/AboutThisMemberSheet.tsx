import { format } from "date-fns";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type AboutThisMemberSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createdAt?: string | null;
  contactUpdatedAt?: string | null;
  avatarUpdatedAt?: string | null;
  signupCountry?: string | null;
  isVerified?: boolean | null;
  verifiedAt?: string | null;
};

const formatDay = (value?: string | null) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return format(date, "MMMM d, yyyy");
};

const AboutThisMemberSheet = ({
  open,
  onOpenChange,
  createdAt,
  contactUpdatedAt,
  avatarUpdatedAt,
  signupCountry,
  isVerified,
  verifiedAt,
}: AboutThisMemberSheetProps) => {
  const verified = Boolean(isVerified);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="z-[210] max-h-[85vh]">
        <DrawerHeader className="relative px-5 pb-2 pt-1">
          <DrawerTitle className="pr-10 text-center text-lg">À propos de ce membre</DrawerTitle>
          <DrawerClose asChild>
            <button
              type="button"
              className="absolute right-3 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>
        <div className="space-y-5 overflow-y-auto px-5 pb-8 pt-2">
          <section>
            <h3 className="text-sm font-semibold text-card-foreground">Historique du compte</h3>
            <p className="mt-1 text-sm text-muted-foreground">A rejoint Sifarah le {formatDay(createdAt)}</p>
            {signupCountry?.trim() ? (
              <p className="mt-1 text-sm text-muted-foreground">Créé depuis {signupCountry.trim()}</p>
            ) : null}
          </section>
          <section>
            <h3 className="text-sm font-semibold text-card-foreground">Coordonnées</h3>
            <p className="mt-1 text-sm text-muted-foreground">Mises à jour le {formatDay(contactUpdatedAt || createdAt)}</p>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-card-foreground">Photo de profil</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Dernière mise à jour le {formatDay(avatarUpdatedAt || createdAt)}
            </p>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-card-foreground">Vérifications</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {verified
                ? `Vérifié${verifiedAt ? ` le ${formatDay(verifiedAt)}` : ""}`
                : "Pas encore vérifié"}
            </p>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AboutThisMemberSheet;
