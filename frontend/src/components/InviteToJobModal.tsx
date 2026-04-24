import { useState } from "react";
import { X, Image, MapPin, DollarSign, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/services/notificationService";

interface InviteToJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalName: string;
  professionalUserId?: string;
}

// Mock data for user's job listings
const mockUserListings = [
  {
    id: 1,
    title: "Rénovation de cuisine complète",
    location: "Marrakech, Sidi Ghanem",
    budget: "15000 - 25000 DH",
    description: "Rénovation complète d'une cuisine avec nouveaux équipements et design moderne",
  },
  {
    id: 2,
    title: "Installation de salle de bain",
    location: "Casablanca, Maarif",
    budget: "8000 - 12000 DH",
    description: "Installation complète d'une nouvelle salle de bain avec carrelage et sanitaires",
  },
  {
    id: 3,
    title: "Peinture intérieure appartement",
    location: "Rabat, Agdal",
    budget: "3000 - 5000 DH",
    description: "Peinture complète d'un appartement 3 pièces avec finition soignée",
  },
];

const InviteToJobModal = ({ isOpen, onClose, professionalName, professionalUserId }: InviteToJobModalProps) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<"listings" | "custom">("listings");
  const [selectedListing, setSelectedListing] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageUrls: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            imageUrls.push(event.target.result as string);
            if (imageUrls.length === files.length) {
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
  };

  const formatWhatsAppMessage = () => {
    let message = `Bonjour ${professionalName},\n\n`;
    message += `Je souhaite vous inviter à un projet :\n\n`;
    
    if (mode === "listings" && selectedListing !== null) {
      const listing = mockUserListings.find(l => l.id === selectedListing);
      if (listing) {
        message += `*${listing.title}*\n\n`;
        message += `${listing.description}\n\n`;
        message += `📍 Localisation: ${listing.location}\n`;
        message += `💰 Budget: ${listing.budget}\n`;
      }
    } else {
      message += `*${title}*\n\n`;
      message += `${description}\n\n`;
      message += `📍 Localisation: ${location}\n`;
      if (budget) {
        message += `💰 Budget: ${budget}\n`;
      }
    }
    
    message += `\nMerci de me contacter si vous êtes intéressé(e).`;
    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "listings" && selectedListing === null) {
      return;
    }
    
    if (mode === "custom" && (!title || !description || !location)) {
      return;
    }

    // Open WhatsApp with formatted message
    const phoneNumber = "212612345678"; // Replace with actual phone number
    const message = formatWhatsAppMessage();
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');

    if (user?.id && professionalUserId && user.id !== professionalUserId) {
      try {
        await notificationService.createNotification({
          actorUserId: user.id,
          targetUserId: professionalUserId,
          type: "job_invite",
          entityType: "job_invite",
          message: "vous a envoyé une invitation de job.",
        });
      } catch (error) {
        console.error("Error creating job invite notification:", error);
      }
    }
    
    // Reset form
    setTitle("");
    setDescription("");
    setLocation("");
    setBudget("");
    setSelectedImages([]);
    setSelectedListing(null);
    setMode("listings");
    onClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setBudget("");
    setSelectedImages([]);
    setSelectedListing(null);
    setMode("listings");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-foreground/40 backdrop-blur-sm">
      <div className="absolute inset-0 bg-foreground/40" onClick={handleClose} />
      <div
        className="relative bg-card rounded-t-2xl sm:rounded-xl w-full max-w-2xl p-5 sm:p-6 animate-in slide-in-from-bottom sm:zoom-in-90 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-card-foreground">
              Inviter {professionalName} à un job
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choisissez une annonce existante ou créez une invitation personnalisée
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2 mb-4 sm:mb-6 p-1 bg-secondary rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode("listings");
              setSelectedListing(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "listings"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Choisir parmi ses annonces
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("custom");
              setSelectedListing(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "custom"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Image className="w-4 h-4" />
            Personnaliser votre propre
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Listings Mode */}
          {mode === "listings" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Sélectionnez une annonce *
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mockUserListings.map((listing) => (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => setSelectedListing(listing.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedListing === listing.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <h3 className="font-semibold text-card-foreground mb-1">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{listing.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {listing.budget}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Mode */}
          {mode === "custom" && (
            <>
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-card-foreground mb-2">
              Titre du job *
            </label>
            <Input
              id="title"
              type="text"
              placeholder="Ex: Rénovation de cuisine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-2">
              Description *
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-none"
              placeholder="Décrivez le projet en détail..."
              required
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-card-foreground mb-2">
              Localisation *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="location"
                type="text"
                placeholder="Ex: Marrakech, Sidi Ghanem"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10"
                required
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-card-foreground mb-2">
              Budget (optionnel)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="budget"
                type="text"
                placeholder="Ex: 5000 - 10000 DH"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Photos du projet
            </label>
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
              <Image className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-card-foreground font-medium">
                Ajouter des photos
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
            {selectedImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 sm:h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-foreground/70 hover:bg-foreground/90 text-background rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 text-card-foreground border-border hover:bg-secondary hover:text-card-foreground"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                mode === "listings"
                  ? selectedListing === null
                  : !title || !description || !location
              }
            >
              Envoyer via WhatsApp
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteToJobModal;

