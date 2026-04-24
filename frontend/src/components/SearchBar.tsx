import { useState } from "react";
import {
  Search,
  Grid3x3,
  MapPin,
  ChevronRight,
  Scale,
  GraduationCap,
  Building2,
  FileText,
  Home,
  Car,
  Users,
  Briefcase,
  Paintbrush,
  Shield,
  Wrench,
  Utensils,
  Languages,
  Stethoscope,
  Smile,
  Glasses,
  Shirt,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LocationModal from "./LocationModal";

const categories = [
  { label: "Toutes les catégories", value: "all", icon: null },
  { label: "Avocat", value: "avocat", icon: Scale },
  { label: "Enseignant", value: "enseignant", icon: GraduationCap },
  { label: "Travaux publiques", value: "travaux_publiques", icon: Building2 },
  { label: "Notaire", value: "notaire", icon: FileText },
  { label: "Location immobilier", value: "location_immobilier", icon: Home },
  { label: "Location véhicules", value: "location_vehicules", icon: Car },
  { label: "Agent immobilier", value: "agent_immobilier", icon: Users },
  { label: "Carreleur", value: "carreleur", icon: Paintbrush },
  { label: "Ferronier", value: "ferronier", icon: Shield },
  { label: "Soudeur", value: "soudeur", icon: Shield },
  { label: "Mecanicien", value: "mecanicien", icon: Wrench },
  { label: "Culinaire", value: "culinaire", icon: Utensils },
  { label: "Translator", value: "translator", icon: Languages },
  { label: "Doctor", value: "doctor", icon: Stethoscope },
  { label: "Dentist", value: "dentist", icon: Smile },
  { label: "Optique", value: "optique", icon: Glasses },
  { label: "Clothing", value: "clothing", icon: Shirt },
  { label: "Autre", value: "autre", icon: Briefcase },
];

const SearchBar = () => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Choisir ville - secteur");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getCategoryLabel = () => {
    const category = categories.find(cat => cat.value === selectedCategory);
    return category ? category.label : "Toutes les catégories";
  };

  return (
    <>
      <div className="bg-background border-b border-border py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Que recherchez-vous ?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base border-2"
              />
            </div>

            {/* Categories Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-11 sm:h-12 px-4 sm:px-6 border-2 whitespace-nowrap"
                >
                  <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{getCategoryLabel()}</span>
                  <span className="sm:hidden">Catégories</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.map((category) => (
                  <DropdownMenuItem 
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.icon && <category.icon className="mr-2 h-4 w-4" />}
                    <span>{category.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Location Button */}
            <Button
              variant="outline"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-2 h-11 sm:h-12 px-4 sm:px-6 border-2 whitespace-nowrap"
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{selectedLocation}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Search Button */}
            <Button className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold whitespace-nowrap">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>
      </div>

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={(location) => {
          setSelectedLocation(location);
          setShowLocationModal(false);
        }}
      />
    </>
  );
};

export default SearchBar;

