import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Building2, FolderKanban, Images, LayoutGrid, Package, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PartnerDemandDialog, { PAID_PLAN_REQUEST } from "@/components/PartnerDemandDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import { catalogService } from "@/services/catalogService";
import { profileService } from "@/services/profileService";
import { taxonomyService } from "@/services/taxonomyService";
import { sectionsForProfile } from "@/lib/institution";
import { type ProfileSectionVisibility } from "@/lib/taxonomy";
import { visitorService } from "@/services/visitorService";
import { isValidEmail } from "@/lib/visitorContact";
import { isCompletePhone } from "@/lib/phone";
import PhoneInput from "@/components/PhoneInput";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { partitionByUploadLimit, storageService, uploadMaxLabel } from "@/services/storageService";
import { PostType } from "@/services/postService";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import PropertyListingWizard from "@/components/PropertyListingWizard";
import { CityPicker } from "@/components/CityPicker";

export type CreateKind = PostType | "service" | "product";

const createKindAllowed = (kind: CreateKind, sections: ProfileSectionVisibility) => {
  if (kind === "standard") return sections.showPosts;
  if (kind === "realisation") return sections.showRealisations;
  if (kind === "property") return sections.showBiens;
  if (kind === "project") return sections.showProjets;
  if (kind === "service") return sections.showServices;
  if (kind === "product") return sections.showProduits;
  return false;
};

export type PublishDestination = "feed" | "portfolio" | "both";

export type CreatePostPayload = {
  text: string;
  images: string[];
  beforeImage?: string;
  afterImage?: string;
  singleImage?: string;
  postType: CreateKind;
  price?: string;
  surface?: string;
  beds?: number | null;
  baths?: number | null;
  title?: string;
  city?: string;
  propertyDetails?: Record<string, unknown>;
  publishTo?: PublishDestination;
};

interface CreatePostProps {
  onPostCreated?: (post: CreatePostPayload) => void;
  hideLauncher?: boolean;
  startOpen?: boolean;
  onClose?: () => void;
}

const HandGearIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path
      transform="translate(7 -1) scale(.64)"
      d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.08-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.3 7.3 0 0 0-1.69-.98L14.5 2.42A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42L9.13 5.07c-.61.25-1.17.59-1.69.98l-2.49-1a.49.49 0 0 0-.61.22l-2 3.46a.49.49 0 0 0 .12.64l2.11 1.65c-.04.32-.08.66-.08.98s.03.66.08.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.12.22.38.31.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.08.49 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5"
    />
    <rect x="1.25" y="12.1" width="3.6" height="9.2" rx=".65" />
    <path d="M5.5 13.5h2.8c.8 0 1.5.2 2.2.6l2.1 1.2h3.2c1.1 0 2 .8 2.1 1.9h-6.2a.7.7 0 1 0 0 1.4h6.5l3.5-1.7c.8-.4 1.7-.1 2.1.7.4.8.1 1.7-.7 2.1l-7.5 3.7a2.8 2.8 0 0 1-2.5 0l-7.6-3.8z" />
  </svg>
);

const postTypes: { id: CreateKind; label: string; Icon: typeof LayoutGrid | typeof HandGearIcon | typeof Package | typeof Images }[] = [
  { id: "standard", label: "Publication", Icon: LayoutGrid },
  { id: "realisation", label: "Réalisation", Icon: Images },
  { id: "property", label: "Bien", Icon: Building2 },
  { id: "project", label: "Projet", Icon: FolderKanban },
  { id: "service", label: "Service", Icon: HandGearIcon },
  { id: "product", label: "Produit", Icon: Package },
];

const greenBtn = "bg-[#174f43] text-white hover:bg-[#123d34]";

const destinations: { id: PublishDestination; label: string }[] = [
  { id: "feed", label: "Fil" },
  { id: "portfolio", label: "Portfolio" },
  { id: "both", label: "Les deux" },
];

const destinationHint: Record<PublishDestination, string> = {
  feed: "Visible sur le fil, pas dans le portfolio.",
  portfolio: "Visible uniquement dans votre portfolio.",
  both: "Visible sur le fil et dans votre portfolio.",
};

const PARTICULIER_BIEN_LIMIT = 3;

const CreatePost = ({ onPostCreated, hideLauncher = false, startOpen = false, onClose }: CreatePostProps) => {
  const { user, visitorUser } = useAuth();
  const { visitorProfile, refreshVisitorProfile } = useVisitorGate();
  const particulier = Boolean(visitorUser && !user);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(startOpen);
  const [postType, setPostType] = useState<CreateKind>("standard");
  const [publishTo, setPublishTo] = useState<PublishDestination>("both");
  const [postText, setPostText] = useState("");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmContact, setConfirmContact] = useState({ phone: "", email: "" });
  const [pendingBien, setPendingBien] = useState<CreatePostPayload | null>(null);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const isGuest = !user && !visitorUser;

  useEffect(() => {
    setIsOpen(Boolean(startOpen) && !isGuest);
  }, [startOpen, isGuest]);

  useEffect(() => {
    if (!particulier || !isOpen) return;
    setPostType("property");
    setPublishTo("portfolio");
  }, [particulier, isOpen]);

  const [profileSections, setProfileSections] = useState<ProfileSectionVisibility | null>(null);
  useEffect(() => {
    if (!isOpen || !user) {
      setProfileSections(null);
      return;
    }
    let cancelled = false;
    Promise.all([
      taxonomyService.listInternalCategories(),
      taxonomyService.getProfileInternalCategoryIds(user.id),
      profileService.getProfile(user.id),
    ])
      .then(([rows, ids, profile]) => {
        if (cancelled) return;
        const codes = ids
          .map((id) => rows.find((row) => row.id === id)?.code || null)
          .filter(Boolean) as string[];
        setProfileSections(sectionsForProfile(profile, codes));
      })
      .catch((error) => {
        console.error("Error loading create-type visibility:", error);
        if (!cancelled) setProfileSections(sectionsForProfile(null, []));
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, user]);

  const visiblePostTypes = useMemo(() => {
    if (particulier) return postTypes.filter((type) => type.id === "property");
    if (!profileSections) return [];
    return postTypes.filter((type) => createKindAllowed(type.id, profileSections));
  }, [particulier, profileSections]);

  useEffect(() => {
    if (!visiblePostTypes.length) return;
    if (!visiblePostTypes.some((type) => type.id === postType)) {
      setPostType(visiblePostTypes[0].id);
    }
  }, [visiblePostTypes, postType]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const resetForm = () => {
    setPostText("");
    setTitle("");
    setCity("");
    setSelectedImages([]);
    setSelectedFiles([]);
    setPostType("standard");
    setPublishTo("both");
    setIsOpen(false);
    onClose?.();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const { accepted, rejected } = partitionByUploadLimit(Array.from(files));
    if (rejected.length) {
      toast({ title: "Image", description: `Chaque fichier doit faire ${uploadMaxLabel} maximum.` });
    }
    if (!accepted.length) return;
    setSelectedFiles((prev) => [...prev, ...accepted]);
    const imageUrls: string[] = [];
    accepted.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          imageUrls.push(event.target.result as string);
          if (imageUrls.length === accepted.length) {
            setSelectedImages((prev) => [...prev, ...imageUrls]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (isSubmitting || !user) return;

    if (postType === "property") {
      toast({ title: "Bien", description: "Complétez les étapes du bien." });
      return;
    }
    if (postType === "realisation") {
      if (!title.trim()) {
        toast({ title: "Titre requis", description: "Donnez un titre à cette réalisation." });
        return;
      }
      if (selectedFiles.length === 0 && selectedImages.length === 0) {
        toast({ title: "Photo requise", description: "Ajoutez au moins une photo." });
        return;
      }
    } else if (!postText.trim() && selectedImages.length === 0) {
      toast({ title: "Contenu requis", description: "Ajoute un texte ou une photo." });
      return;
    }
    if (postType === "project" && selectedFiles.length === 0) {
      toast({ title: "Photo requise", description: "Un projet doit avoir une photo." });
      return;
    }
    if (postType === "project" && !postText.trim()) {
      toast({ title: "Légende requise", description: "Ajoute une légende pour ce projet." });
      return;
    }
    if (!city.trim()) {
      toast({ title: "Ville requise", description: "Indiquez la ville." });
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedImageUrls = await storageService.uploadImages(
          selectedFiles,
          postType === "realisation" ? "realisations" : "posts",
        );
      }

      onPostCreated?.({
        text: postText,
        title: title.trim() || undefined,
        images: uploadedImageUrls,
        singleImage: uploadedImageUrls[0],
        postType,
        city: city.trim(),
        propertyDetails: { city: city.trim() },
        publishTo: postType === "project" ? publishTo : undefined,
      });

      resetForm();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Erreur", description: "Erreur lors de la création de la publication. Veuillez réessayer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    if (hideLauncher) return null;
    if (isGuest) {
      return (
        <div className="border-b border-neutral-200 bg-white px-3 py-3 sm:px-4 sm:py-4">
          <div className="mx-auto max-w-2xl space-y-2.5 rounded-xl border border-[#174f43]/20 bg-[#174f43]/5 p-3 sm:space-y-3.5 sm:p-5">
            <p className="px-0.5 text-[15px] leading-relaxed text-neutral-700 sm:text-base">
              {PAID_PLAN_REQUEST}
            </p>
            <button
              type="button"
              onClick={() => setPartnerOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-xl bg-[#174f43] px-3.5 py-2.5 text-left text-white shadow-sm transition hover:bg-[#123d34] sm:gap-3.5 sm:px-5 sm:py-4"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 sm:h-12 sm:w-12">
                <Plus className="h-4 w-4 sm:h-6 sm:w-6" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold sm:text-lg">Demander les détails du plan</span>
              </span>
            </button>
          </div>
          <PartnerDemandDialog open={partnerOpen} onOpenChange={setPartnerOpen} />
        </div>
      );
    }
    return (
      <div className="border-b border-neutral-200 bg-white px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mx-auto flex w-full max-w-2xl items-center gap-3 rounded-xl bg-[#174f43] px-4 py-3 text-left text-white shadow-sm transition hover:bg-[#123d34]"
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold sm:text-base">
              {particulier ? "Publier un bien" : "Créer une publication"}
            </span>
            <span className="block truncate text-xs text-white/80">
              {particulier ? "Jusqu’à 3 biens dans votre portfolio" : "Publication, projet, service, produit…"}
            </span>
          </span>
        </button>
      </div>
    );
  }

  const publishBien = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pendingBien || !visitorUser || !visitorProfile) return;
    if (!isCompletePhone(confirmContact.phone) || !isValidEmail(confirmContact.email)) {
      toast({ title: "Coordonnées à vérifier", description: "Confirmez un email valide et un numéro de téléphone corrects." });
      return;
    }
    setIsSubmitting(true);
    try {
      await visitorService.updateMine({
        name: visitorProfile.name,
        phone: confirmContact.phone,
        email: confirmContact.email.trim(),
        bio: visitorProfile.bio || "",
        avatarUrl: visitorProfile.avatar_url,
      });
      await refreshVisitorProfile();
      onPostCreated?.(pendingBien);
      setConfirmOpen(false);
      setPendingBien(null);
      resetForm();
    } catch (error) {
      console.error("Error confirming contact:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer ces coordonnées." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <>
    <div className="fixed inset-0 z-[220] flex flex-col bg-background">
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center border-b border-border px-3 py-3">
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-center text-base font-bold text-card-foreground sm:text-lg">
          {particulier ? "Publier un bien" : "Créer une publication"}
        </h1>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-full text-foreground hover:bg-muted"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8">
        <div className="mx-auto max-w-2xl space-y-5">
          {!particulier ? (
          <div>
            <p className="mb-2 text-sm font-semibold text-card-foreground">Ajouter des photos</p>
            <div className="flex flex-wrap gap-2">
              {selectedImages.map((image, index) => (
                <div key={`${image}-${index}`} className="relative h-20 w-20 overflow-hidden rounded-lg">
                  <img src={image} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white"
                    aria-label="Retirer la photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted">
                <Plus className="h-6 w-6" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
              </label>
            </div>
          </div>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-semibold text-card-foreground">Type de publication</p>
            <div
              className={`grid gap-1.5 sm:gap-2 ${
                visiblePostTypes.length <= 2
                  ? "grid-cols-2"
                  : visiblePostTypes.length === 3
                    ? "grid-cols-3"
                    : visiblePostTypes.length === 4
                      ? "grid-cols-4"
                      : visiblePostTypes.length === 5
                        ? "grid-cols-5"
                        : "grid-cols-3 sm:grid-cols-6"
              }`}
            >
              {visiblePostTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    if (type.id === "project") {
                      resetForm();
                      navigate("/projet/nouveau");
                      return;
                    }
                    if (type.id === "service") {
                      resetForm();
                      navigate("/service/nouveau");
                      return;
                    }
                    if (type.id === "product") {
                      resetForm();
                      navigate("/produit/nouveau");
                      return;
                    }
                    setPostType(type.id);
                  }}
                  className={`flex min-w-0 flex-col items-center gap-1.5 rounded-lg border px-1 py-2 text-center transition-colors ${
                    postType === type.id
                      ? "border-[#174f43] bg-[#174f43]/10 text-[#174f43]"
                      : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50"
                  }`}
                >
                  <type.Icon className="h-6 w-6" />
                  <span className="truncate text-xs font-semibold">{type.label}</span>
                </button>
              ))}
            </div>
            {particulier ? (
              <p className="mt-2 text-xs leading-snug text-muted-foreground">
                Un particulier publie jusqu'à 3 biens, uniquement dans son portfolio.
              </p>
            ) : !profileSections ? (
              <p className="mt-2 text-xs leading-snug text-muted-foreground">Chargement des types disponibles…</p>
            ) : !visiblePostTypes.length ? (
              <p className="mt-2 text-xs leading-snug text-muted-foreground">
                La publication sur le fil est réservée aux profils vérifiés (badge bleu). Les autres types dépendent de vos spécialités.
              </p>
            ) : visiblePostTypes.length <= 1 ? (
              <p className="mt-2 text-xs leading-snug text-muted-foreground">
                Types alignés sur les onglets de votre profil. La publication sur le fil nécessite un badge vérifié.
              </p>
            ) : null}
          </div>

          {!particulier && (postType === "property" || postType === "project") ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-card-foreground">Où publier ?</p>
              <div className="grid grid-cols-3 gap-2">
                {destinations.map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => setPublishTo(dest.id)}
                    className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold transition-colors ${
                      publishTo === dest.id
                        ? "border-[#174f43] bg-[#174f43]/10 text-[#174f43]"
                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    {dest.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{destinationHint[publishTo]}</p>
            </div>
          ) : null}

          {postType === "property" ? (
            <PropertyListingWizard
              onCancel={resetForm}
              submitLabel="Publier"
              stepTitle={particulier ? "Publier un bien" : "Créer service"}
              onComplete={async ({ details, files }) => {
                setIsSubmitting(true);
                try {
                  if (particulier && visitorUser) {
                    const count = await catalogService.countPropertiesByUser(visitorUser.id);
                    if (count >= PARTICULIER_BIEN_LIMIT) {
                      toast({ title: "Limite atteinte", description: "Un particulier peut publier 3 biens dans son portfolio." });
                      return;
                    }
                  }
                  const uploaded = await storageService.uploadImages(files, "posts");
                  const payload: CreatePostPayload = {
                    text: details.description,
                    title: details.title,
                    images: uploaded,
                    singleImage: uploaded[0],
                    postType: "property",
                    city: details.city,
                    price: details.priceDh,
                    surface: details.builtSurface,
                    beds: details.beds,
                    baths: details.baths,
                    propertyDetails: details,
                    publishTo: particulier ? "portfolio" : publishTo,
                  };
                  if (particulier) {
                    setConfirmContact({ phone: visitorProfile?.phone || "", email: visitorProfile?.email || "" });
                    setPendingBien(payload);
                    setConfirmOpen(true);
                    return;
                  }
                  onPostCreated?.(payload);
                  resetForm();
                } catch (error) {
                  console.error("Error creating property listing:", error);
                  toast({ title: "Erreur", description: "Impossible de publier le bien." });
                } finally {
                  setIsSubmitting(false);
                }
              }}
            />
          ) : (
            <>
              {postType === "realisation" ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-card-foreground">Titre</p>
                  <Input
                    value={title}
                    maxLength={120}
                    onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                    placeholder="Ex. Villa moderne — Marrakech"
                    className="h-11"
                  />
                </div>
              ) : null}

              <div>
                <p className="mb-2 text-sm font-semibold text-card-foreground">
                  {postType === "realisation" ? "Description" : "Légende"}
                </p>
                <textarea
                  value={postText}
                  maxLength={1500}
                  onChange={(e) => setPostText(e.target.value.slice(0, 1500))}
                  placeholder={
                    postType === "realisation"
                      ? "Décrivez cette réalisation…"
                      : "Écrivez une légende…"
                  }
                  rows={5}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#174f43]"
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">{postText.length}/1500</p>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-card-foreground">Localisation</p>
                <CityPicker value={city} onChange={setCity} placeholder="Choisir une ville" required />
              </div>
            </>
          )}
        </div>
      </div>

      {postType !== "property" ? (
        <div className="border-t border-border px-4 py-4 sm:px-8">
          <div className="mx-auto flex max-w-2xl items-center justify-center gap-3">
            <Button type="button" variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="button" className={greenBtn} onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Publication..." : "Publier"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
    <Dialog open={confirmOpen} onOpenChange={(next) => !isSubmitting && setConfirmOpen(next)}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Vérifiez vos coordonnées</DialogTitle>
          <DialogDescription>
            Pour publier un bien, confirmez que votre email et votre téléphone sont corrects.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={publishBien} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="bien-phone">Téléphone</Label>
            <PhoneInput id="bien-phone" required value={confirmContact.phone} onChange={(phone) => setConfirmContact((prev) => ({ ...prev, phone }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bien-email">Email</Label>
            <Input id="bien-email" type="email" required value={confirmContact.email} onChange={(event) => setConfirmContact((prev) => ({ ...prev, email: event.target.value }))} />
          </div>
          <button type="submit" disabled={isSubmitting} className="flex h-11 w-full items-center justify-center rounded-xl bg-[#174f43] text-sm font-semibold text-white disabled:opacity-60">
            {isSubmitting ? "Publication..." : "Ces coordonnées sont correctes"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
    </>,
    document.body
  );
};

export default CreatePost;
