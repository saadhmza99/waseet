import { useState } from "react";
import { MapPin, X, Check, Wrench, Zap, Paintbrush, Hammer, Home as HomeIcon, User, Building2 } from "lucide-react";

interface JobFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const professions = [
  { label: "Plombier", icon: Wrench },
  { label: "Menuisier", icon: Hammer },
  { label: "Électricien", icon: Zap },
  { label: "Peintre", icon: Paintbrush },
  { label: "Bricoleur", icon: Wrench },
  { label: "Couvreur", icon: HomeIcon },
  { label: "Maçon", icon: Hammer },
];

const JobFilterModal = ({ isOpen, onClose }: JobFilterModalProps) => {
  const [locationValue, setLocationValue] = useState("Chicago");
  const [selected, setSelected] = useState<string[]>(["Plombier"]);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [accountType, setAccountType] = useState<"individual" | "enterprise" | "all">("all");

  const toggleProfession = (prof: string) => {
    setSelected((prev) =>
      prev.includes(prof) ? prev.filter((p) => p !== prof) : [...prev, prof]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-t-2xl w-full max-w-md p-5 pb-6 animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-card-foreground">Filtre</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
            setSelected([]);
            setLocationValue("");
            setMinBudget("");
            setMaxBudget("");
                setAccountType("all");
              }} 
              className="text-accent font-medium text-sm hover:underline"
            >
              Réinitialiser
            </button>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
          </button>
          </div>
        </div>

        {/* Location */}
        <label className="text-sm font-semibold text-card-foreground mb-1.5 block">Localisation</label>
        <div className="relative mb-4">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={locationValue}
            onChange={(e) => setLocationValue(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground"
          />
        </div>

        {/* Account Type */}
        <label className="text-sm font-semibold text-card-foreground mb-2 block">Type de compte</label>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAccountType("all")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              accountType === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-card-foreground border-border hover:bg-secondary"
            }`}
          >
            <span>Tous</span>
          </button>
          <button
            onClick={() => setAccountType("individual")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              accountType === "individual"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-card-foreground border-border hover:bg-secondary"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Individuel</span>
          </button>
          <button
            onClick={() => setAccountType("enterprise")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              accountType === "enterprise"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-card-foreground border-border hover:bg-secondary"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Entreprise</span>
          </button>
        </div>

        {/* Profession */}
        <label className="text-sm font-semibold text-card-foreground mb-2 block">Profession</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {professions.map((prof) => {
            const isSelected = selected.includes(prof.label);
            return (
              <button
                key={prof.label}
                onClick={() => toggleProfession(prof.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-card-foreground border-border"
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <prof.icon className="w-3.5 h-3.5" />
                )}
                {prof.label}
              </button>
            );
          })}
        </div>

        {/* Budget */}
        <label className="text-sm font-semibold text-card-foreground mb-1.5 block">Budget</label>
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">DH</span>
            <input
              type="text"
              placeholder="Min"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground"
            />
          </div>
          <span className="text-muted-foreground">—</span>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">DH</span>
            <input
              type="text"
              placeholder="Max"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-accent text-accent-foreground font-bold py-3 rounded-full text-base"
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
};

export default JobFilterModal;
