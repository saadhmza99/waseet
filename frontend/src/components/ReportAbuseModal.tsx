import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReportAbuseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const abuseTypes = [
  "fraude",
  "doublon",
  "mauvais prix",
  "mauvaise categorie",
  "mauvaise photo",
  "faux numero",
];

const ReportAbuseModal = ({ isOpen, onClose }: ReportAbuseModalProps) => {
  const [email, setEmail] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ email, selectedType, message });
    onClose();
    // Reset form
    setEmail("");
    setSelectedType("");
    setMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-foreground/40 backdrop-blur-sm">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div
        className="relative bg-card rounded-t-2xl sm:rounded-xl w-full max-w-md p-5 sm:p-6 animate-in slide-in-from-bottom sm:zoom-in-90 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">
            Quel est le problème avec cette annonce?
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@domaine.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Abuse Type */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Sélectionner le type d'abus:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {abuseTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selectedType === type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-card-foreground border-border hover:bg-secondary"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-card-foreground mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 80))}
              maxLength={80}
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Décrivez le problème..."
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-muted-foreground">
                {message.length}/80
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!email || !selectedType}
            >
              Envoyer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportAbuseModal;

