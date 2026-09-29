import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Building2, FolderKanban, LayoutGrid, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useVisitorGate } from "@/contexts/VisitorGateContext";
import { catalogService } from "@/services/catalogService";
import { visitorService } from "@/services/visitorService";
import { isValidEmail } from "@/lib/visitorContact";
import { isCompletePhone } from "@/lib/phone";
import PhoneInput from "@/components/PhoneInput";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storageService } from "@/services/storageService";
import { PostType } from "@/services/postService";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import PropertyListingWizard from "@/components/PropertyListingWizard";
import { CityPicker } from "@/components/CityPicker";

export type CreateKind = PostType | "service";

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

const postTypes: { id: CreateKind; label: string; Icon: typeof LayoutGrid | typeof HandGearIcon }[] = [
  { id: "standard", label: "Standard", Icon: LayoutGrid },
  { id: "property", label: "Bien", Icon: Building2 },
  { id: "project", label: "Projet", Icon: FolderKanban },
  { id: "service", label: "Service", Icon: HandGearIcon },
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
  const [city, setCity] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmContact, setConfirmContact] = useState({ phone: "", email: "" });
  const [pendingBien, setPendingBien] = useState<CreatePostPayload | null>(null);

  useEffect(() => {
    setIsOpen(Boolean(startOpen));
  }, [startOpen]);

  useEffect(() => {
    if (!particulier || !isOpen) return;
    setPostType("property");
    setPublishTo("portfolio");
  }, [particulier, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const resetForm = () => {
    setPostText("");
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
    const filesArray = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...filesArray]);
    const imageUrls: string[] = [];
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          imageUrls.push(event.target.result as string);
          if (imageUrls.length === filesArray.length) {
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
    if (!postText.trim() && selectedImages.length === 0) {
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
        uploadedImageUrls = await storageService.uploadImages(selectedFiles, "posts");
      }

      onPostCreated?.({
        text: postText,
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
      toast({ title: "Erreur", description: "Erreur lors de la création du post. Veuillez réessayer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    if (hideLauncher) return null;
    return (
      <div className="flex justify-center bg-card py-3">
        <button
          onClick={() => {
            if (!user && !visitorUser) {
              navigate("/login");
              return;
            }
            setIsOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 hover:bg-secondary sm:px-6 sm:py-3"
        >
          <Plus className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-card-foreground sm:text-base">
            {particulier ? "Publier un bien" : user || visitorUser ? "Créer un poste" : "Se connecter pour publier"}
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
            <p className="mb-2 text-sm font-semibold text-card-foreground">Type de post</p>
            <div className="grid grid-cols-4 gap-2">
              {postTypes.map((type) => {
                const locked = particulier && type.id !== "property";
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      if (locked) {
                        toast({ title: "Compte professionnel requis", description: "Un particulier publie un bien dans son portfolio." });
                        return;
                      }
                      setPostType(type.id);
                    }}
                    className={`flex min-w-0 flex-col items-center gap-1.5 rounded-lg border px-1 py-2 text-center transition-colors ${
                      postType === type.id
                        ? "border-[#174f43] bg-[#174f43]/10 text-[#174f43]"
                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50"
                    } ${locked ? "opacity-40" : ""}`}
                  >
                    <type.Icon className="h-6 w-6" />
                    <span className="truncate text-xs font-semibold">{type.label}</span>
                  </button>
                );
              })}
            </div>
            {particulier ? (
              <p className="mt-2 text-xs leading-snug text-muted-foreground">
                Un particulier publie jusqu'à 3 biens, uniquement dans son portfolio.
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
              <div>
                <p className="mb-2 text-sm font-semibold text-card-foreground">Légende</p>
                <textarea
                  value={postText}
                  maxLength={1500}
                  onChange={(e) => setPostText(e.target.value.slice(0, 1500))}
                  placeholder="Écrivez une légende…"
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
