import { useState } from "react";
import { X, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
}

const cities = [
  "Marrakech",
  "Tanger",
  "Casablanca",
  "Fès",
  "Safi",
  "Agadir",
  "Temara",
  "Mohammedia",
  "Salé",
  "Rabat",
  "Meknès",
  "Oujda",
  "Kenitra",
  "Tétouan",
  "El Jadida",
];

const LocationModal = ({ isOpen, onClose, onSelect }: LocationModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const handleConfirm = () => {
    if (selectedCities.length > 0) {
      onSelect(selectedCities.join(", "));
    }
    onClose();
  };

  const handleClear = () => {
    setSelectedCities([]);
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-card w-full max-w-md h-full shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Ville - Secteur</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher dans Ville - Secteur"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-11"
            />
          </div>
        </div>

        {/* Cities List */}
        <div className="flex-1 overflow-y-auto pb-20">
          {filteredCities.map((city) => {
            const isSelected = selectedCities.includes(city);
            return (
              <button
                key={city}
                onClick={() => toggleCity(city)}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-secondary transition-colors border-b border-border"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCity(city)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm sm:text-base text-card-foreground font-medium">{city}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-card border-t border-border flex gap-3">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1 h-11 sm:h-12"
          >
            Effacer
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 h-11 sm:h-12"
            disabled={selectedCities.length === 0}
          >
            Confirmer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;

