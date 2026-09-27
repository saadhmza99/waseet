import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export const blockedAccountsToast = (accountName: string) => {
  const name = (accountName || "").trim();
  toast({
    title: name ? `Vous avez bloqué ${name}` : "Compte bloqué",
    description: (
      <Link to="/settings/blocked" className="mt-1 inline-block font-semibold text-[#7fd9b4] transition-transform hover:scale-[0.97]">
        Gérer les comptes bloqués
      </Link>
    ),
  });
};
