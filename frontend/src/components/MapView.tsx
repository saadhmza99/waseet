import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import avatarTony from "@/assets/avatar-tony.jpg";
import avatarMike from "@/assets/avatar-mike.jpg";
import avatarAnna from "@/assets/avatar-anna.jpg";
import avatarMark from "@/assets/avatar-mark.jpg";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarLaura from "@/assets/avatar-laura.jpg";

interface Craftsman {
  id: string;
  username: string;
  avatar: string;
  profession: string;
  lat: number;
  lng: number;
}

interface MapViewProps {
  userLocation?: { lat: number; lng: number };
}

const MapView = ({ userLocation }: MapViewProps) => {
  const navigate = useNavigate();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Sample craftsmen data with coordinates (Dubai area)
  const craftsmen: Craftsman[] = [
    { id: "1", username: "Tony_McBuild", avatar: avatarTony, profession: "General Contractor", lat: 25.2048, lng: 55.2708 },
    { id: "2", username: "Mike_Contractor", avatar: avatarMike, profession: "Plumber", lat: 25.1972, lng: 55.2744 },
    { id: "3", username: "Anna_Designs", avatar: avatarAnna, profession: "Interior Designer", lat: 25.1867, lng: 55.2644 },
    { id: "4", username: "Mark_Johnson", avatar: avatarMark, profession: "Electrician", lat: 25.2167, lng: 55.2833 },
    { id: "5", username: "Sarah_Homeowner", avatar: avatarSarah, profession: "Carpenter", lat: 25.1922, lng: 55.2583 },
    { id: "6", username: "Laura_Painter", avatar: avatarLaura, profession: "Painter", lat: 25.2100, lng: 55.2778 },
  ];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback to Dubai Marina if geolocation fails
          setCurrentLocation({ lat: 25.0772, lng: 55.1392 });
        }
      );
    } else {
      // Fallback to Dubai Marina
      setCurrentLocation({ lat: 25.0772, lng: 55.1392 });
    }
  }, []);

  const handleMarkerClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  if (!currentLocation) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center bg-muted">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-200px)] w-full overflow-hidden">
      {/* Map Container - Using a simple div with background for now */}
      {/* In production, you would use react-leaflet or Google Maps */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
        {/* User Location Marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: "50%",
            top: "50%",
          }}
        >
          <div className="relative">
            <div className="w-4 h-4 bg-accent rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            <div className="absolute inset-0 w-4 h-4 bg-accent rounded-full opacity-30 animate-ping"></div>
          </div>
        </div>

        {/* Craftsmen Markers */}
        {craftsmen.map((craftsman, index) => {
          // Calculate relative position (simplified - in real app use proper map projection)
          // Using a more reasonable scale for visualization
          const offsetX = (craftsman.lng - currentLocation.lng) * 50000;
          const offsetY = (currentLocation.lat - craftsman.lat) * 50000;
          
          // Randomize positions slightly for better visual distribution
          const randomOffsetX = (Math.random() - 0.5) * 30;
          const randomOffsetY = (Math.random() - 0.5) * 30;
          
          return (
            <button
              key={craftsman.id}
              onClick={() => handleMarkerClick(craftsman.username)}
              className="absolute transform -translate-x-1/2 -translate-y-full z-10 hover:scale-110 active:scale-95 transition-transform group cursor-pointer"
              style={{
                left: `calc(50% + ${offsetX + randomOffsetX}px)`,
                top: `calc(50% + ${offsetY + randomOffsetY}px)`,
              }}
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={craftsman.avatar}
                    alt={craftsman.username}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-[3px] border-white shadow-lg object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-white"></div>
                </div>
                <div className="mt-1 bg-card/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  <p className="text-xs sm:text-sm font-semibold text-card-foreground">{craftsman.username}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{craftsman.profession}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Map Instructions Overlay */}
      <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30">
        <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-lg border border-border">
          <p className="text-xs sm:text-sm text-card-foreground mb-2">
            <span className="font-semibold">Tap on profiles</span> to view craftsmen near you
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span>Your location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;

