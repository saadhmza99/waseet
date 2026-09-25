import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export const blockedAccountsToast = (accountName: string) => {
  const name = (accountName || "this").trim() || "this";
  toast({
    title: `You blocked ${name} account`,
    description: (
      <Link to="/settings/blocked" className="font-semibold underline underline-offset-2">
        Manage blocked accounts
      </Link>
    ),
  });
};
