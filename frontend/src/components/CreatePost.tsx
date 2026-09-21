import { useState } from "react";
import { Image, Smile, MapPin, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { storageService } from "@/services/storageService";
import { PostType } from "@/services/postService";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { getDefaultAvatar } from "@/lib/avatar";

export type CreatePostPayload = {
  text: string;
  images: string[];
  beforeImage?: string;
  afterImage?: string;
  singleImage?: string;
  postType: PostType;
  price?: string;
  surface?: string;
  beds?: number | null;
  baths?: number | null;
};

interface CreatePostProps {
  onPostCreated?: (post: CreatePostPayload) => void;
}

const postTypes: { id: PostType; label: string; hint: string }[] = [
  { id: "standard", label: "Standard", hint: "Post classique dans le fil" },
  { id: "property", label: "Bien", hint: "Ajouté au portfolio (prix, surface, chambres…)" },
  { id: "project", label: "Projet", hint: "Ajouté au portfolio (photo + légende)" },
];

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [postType, setPostType] = useState<PostType>("standard");
  const [postText, setPostText] = useState("");
  const [price, setPrice] = useState("");
  const [surface, setSurface] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageTags, setImageTags] = useState<{ [key: number]: "avant" | "après" | null }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setPostText("");
    setPrice("");
    setSurface("");
    setBeds("");
    setBaths("");
    setSelectedImages([]);
    setSelectedFiles([]);
    setImageTags({});
    setPostType("standard");
    setIsOpen(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
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
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImageTags((prev) => {
      const newTags = { ...prev };
      delete newTags[index];
      const reindexed: { [key: number]: "avant" | "après" | null } = {};
      Object.keys(newTags).forEach((key) => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = newTags[oldIndex];
        } else if (oldIndex < index) {
          reindexed[oldIndex] = newTags[oldIndex];
        }
      });
      return reindexed;
    });
  };

  const toggleImageTag = (index: number, tag: "avant" | "après") => {
    setImageTags((prev) => {
      const newTags = { ...prev };
      if (newTags[index] === tag) {
        newTags[index] = null;
      } else {
        Object.keys(newTags).forEach((key) => {
          const keyIndex = parseInt(key);
          if (keyIndex !== index && newTags[keyIndex] === tag) {
            newTags[keyIndex] = null;
          }
        });
        newTags[index] = tag;
      }
      return newTags;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting || !user) return;

    if (postType === "standard" && !postText.trim() && selectedImages.length === 0) {
      toast({ title: "Contenu requis", description: "Ajoute un texte ou une photo." });
      return;
    }
    if (postType === "property") {
      if (selectedFiles.length === 0) {
        toast({ title: "Photo requise", description: "Un bien doit avoir au moins une photo." });
        return;
      }
      if (!price.trim() || !surface.trim()) {
        toast({ title: "Détails requis", description: "Indique le prix et la surface du bien." });
        return;
      }
    }
    if (postType === "project") {
      if (selectedFiles.length === 0) {
        toast({ title: "Photo requise", description: "Un projet doit avoir une photo." });
        return;
      }
      if (!postText.trim()) {
        toast({ title: "Légende requise", description: "Ajoute une légende pour ce projet." });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrls: string[] = [];
      let beforeImageUrl: string | undefined;
      let afterImageUrl: string | undefined;
      let singleImageUrl: string | undefined;

      if (selectedFiles.length > 0) {
        uploadedImageUrls = await storageService.uploadImages(selectedFiles, "posts");

        if (selectedImages.length === 2) {
          const beforeIndex = imageTags[0] === "avant" ? 0 : imageTags[1] === "avant" ? 1 : -1;
          const afterIndex = imageTags[0] === "après" ? 0 : imageTags[1] === "après" ? 1 : -1;

          if (beforeIndex >= 0) beforeImageUrl = uploadedImageUrls[beforeIndex];
          if (afterIndex >= 0) afterImageUrl = uploadedImageUrls[afterIndex];
        } else if (uploadedImageUrls.length === 1) {
          singleImageUrl = uploadedImageUrls[0];
        }
      }

      onPostCreated?.({
        text: postText,
        images: uploadedImageUrls,
        beforeImage: beforeImageUrl,
        afterImage: afterImageUrl,
        singleImage: singleImageUrl,
        postType,
        price: postType === "property" ? price.trim() : undefined,
        surface: postType === "property" ? surface.trim() : undefined,
        beds: postType === "property" && beds !== "" ? Number(beds) : null,
        baths: postType === "property" && baths !== "" ? Number(baths) : null,
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
    return (
      <div className="my-4 sm:my-6 flex justify-center">
        <button
          onClick={() => {
            if (!user) {
              navigate("/login");
              return;
            }
            setIsOpen(true);
          }}
          className="bg-card border border-border rounded-lg px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 hover:bg-secondary transition-colors"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          </div>
          <span className="text-sm sm:text-base text-card-foreground font-medium">
            {user ? "Créer un poste" : "Se connecter pour publier"}
          </span>
        </button>
      </div>
    );
  }

  const placeholder =
    postType === "property"
      ? "Description du bien"
      : postType === "project"
        ? "Légende du projet"
        : "Créer un poste";

  return (
    <div className="bg-card border-b border-border my-4 sm:my-6">
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-start gap-3">
          <img
            src={user?.user_metadata?.avatar_url || getDefaultAvatar("craftsman")}
            alt="Profile"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="mb-2 text-sm font-medium text-card-foreground">Type de post</p>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {postTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPostType(type.id)}
                  className={`rounded-lg border px-2 py-2 text-left transition-colors ${
                    postType === type.id
                      ? "border-accent bg-accent/10 text-card-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50"
                  }`}
                >
                  <span className="block text-sm font-semibold">{type.label}</span>
                  <span className="mt-0.5 hidden text-[10px] leading-tight sm:block">{type.hint}</span>
                </button>
              ))}
            </div>

            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-background border border-border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-card-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent min-h-[100px] max-h-[200px]"
              rows={4}
              autoFocus
            />

            {postType === "property" && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Prix"
                />
                <Input
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  placeholder="Surface (m²)"
                />
                <Input
                  type="number"
                  min={0}
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
                  placeholder="Chambres"
                />
                <Input
                  type="number"
                  min={0}
                  value={baths}
                  onChange={(e) => setBaths(e.target.value)}
                  placeholder="Salles de bain"
                />
              </div>
            )}

            {selectedImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 sm:h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-foreground/70 hover:bg-foreground/90 text-background rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {postType === "standard" && selectedImages.length === 2 && (
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImageTag(index, "avant");
                          }}
                          className={`flex-1 px-2 py-1 text-xs font-semibold rounded ${
                            imageTags[index] === "avant"
                              ? "bg-accent text-accent-foreground"
                              : "bg-foreground/80 text-background hover:bg-foreground/90"
                          } transition-colors`}
                        >
                          Avant
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImageTag(index, "après");
                          }}
                          className={`flex-1 px-2 py-1 text-xs font-semibold rounded ${
                            imageTags[index] === "après"
                              ? "bg-accent text-accent-foreground"
                              : "bg-foreground/80 text-background hover:bg-foreground/90"
                          } transition-colors`}
                        >
                          Après
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2 sm:gap-4">
                <label className="flex items-center gap-2 text-muted-foreground hover:text-accent cursor-pointer transition-colors">
                  <Image className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <button type="button" className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                  <Smile className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Émoji</span>
                </button>
                <button type="button" className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                  <MapPin className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Localisation</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={resetForm} className="text-sm">
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="text-sm">
                  {isSubmitting ? "Publication..." : "Publier"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
