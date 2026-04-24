import { MapPin } from "lucide-react";

interface MapViewProps {
  userLocation?: { lat: number; lng: number } | null;
}

const MapView = ({ userLocation }: MapViewProps) => {
  return (
    <div className="h-[calc(100vh-200px)] w-full bg-muted/40 rounded-lg border border-border flex items-center justify-center">
      <div className="text-center px-4">
        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-card-foreground font-medium mb-1">Vue carte indisponible</p>
        <p className="text-sm text-muted-foreground">
          Cette section affichera les annonces géolocalisées réelles une fois les coordonnées stockées.
        </p>
        {userLocation && (
          <p className="text-xs text-muted-foreground mt-2">
            Position actuelle détectée: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        )}
      </div>
    </div>
  );
};

export default MapView;

