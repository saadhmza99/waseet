import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { userSettingsService } from "@/services/userSettingsService";

const PrivacySettings = () => {
  const navigate = useNavigate();
  const { user, visitorUser } = useAuth();
  const account = user || visitorUser;
  const isParticulier = Boolean(visitorUser && !user);
  const [showPhone, setShowPhone] = useState(false);
  const [allowDm, setAllowDm] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!account) return;
      try {
        const settings = await userSettingsService.loadForAccount(account.id, isParticulier);
        setShowPhone(settings.show_phone);
        setAllowDm(settings.allow_direct_messages);
        setShowActivity(settings.show_activity_status);
      } catch (error) {
        console.error("Error loading privacy settings:", error);
      }
    };
    load();
  }, [account?.id, isParticulier]);

  const handleSave = async () => {
    if (!account) return;
    setSaving(true);
    try {
      const current = await userSettingsService.loadForAccount(account.id, isParticulier);
      await userSettingsService.saveForAccount(account.id, isParticulier, {
        ...current,
        show_phone: showPhone,
        allow_direct_messages: allowDm,
        show_activity_status: showActivity,
      });
      toast({ title: "Enregistré", description: "Les paramètres de confidentialité ont été mis à jour." });
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer les paramètres de confidentialité." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background px-4 py-3 sm:px-6 sm:py-4 md:px-8">
        <button onClick={() => navigate(-1)} className="text-card-foreground hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-card-foreground">Confidentialité</h1>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-xl mx-auto">
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-phone">Afficher le téléphone sur le profil</Label>
            <Switch id="show-phone" checked={showPhone} onCheckedChange={setShowPhone} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-dm">Autoriser les messages directs</Label>
            <Switch id="allow-dm" checked={allowDm} onCheckedChange={setAllowDm} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-activity">Afficher mon activité</Label>
            <Switch id="show-activity" checked={showActivity} onCheckedChange={setShowActivity} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || !account}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;

