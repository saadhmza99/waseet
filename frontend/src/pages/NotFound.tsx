import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] px-4 pb-20">
      <h1 className="text-6xl font-bold text-card-foreground mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-card-foreground mb-2">Page Not Found</h2>
      <p className="text-muted-foreground text-center mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate("/")} className="flex items-center gap-2">
        <Home className="w-4 h-4" />
        Go Home
      </Button>
    </div>
  );
};

export default NotFound;

