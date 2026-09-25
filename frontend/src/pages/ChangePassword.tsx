import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, loading, isPasswordRecovery, clearPasswordRecovery } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    if (newPassword.length < 8) {
      toast({ title: "Erreur", description: "Le mot de passe doit avoir au moins 8 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas." });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      const wasRecovery = isPasswordRecovery;
      clearPasswordRecovery();
      toast({ title: "Succes", description: "Mot de passe modifie avec succes." });
      if (wasRecovery) navigate("/", { replace: true });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({ title: "Erreur", description: "Impossible de modifier le mot de passe." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || (isPasswordRecovery && !user)) {
    return <div className="py-10 text-center text-muted-foreground">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-40 bg-background border-b border-border px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center gap-3">
        {isPasswordRecovery ? null : (
          <button onClick={() => navigate(-1)} className="text-card-foreground hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-card-foreground">
          {isPasswordRecovery ? "Nouveau mot de passe" : "Change Password"}
        </h1>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-xl mx-auto">
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6 space-y-4">
          {isPasswordRecovery ? (
            <p className="text-sm text-muted-foreground">
              Choisissez un nouveau mot de passe pour terminer la réinitialisation.
            </p>
          ) : null}
          <div>
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : isPasswordRecovery ? "Enregistrer le mot de passe" : "Save new password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
