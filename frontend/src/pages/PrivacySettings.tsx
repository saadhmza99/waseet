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
  const { user } = useAuth();
  const [showPhone, setShowPhone] = useState(false);
  const [allowDm, setAllowDm] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const settings = await userSettingsService.getSettings(user.id);
        setShowPhone(settings.show_phone);
        setAllowDm(settings.allow_direct_messages);
        setShowActivity(settings.show_activity_status);
      } catch (error) {
        console.error("Error loading privacy settings:", error);
      }
    };
    load();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const current = await userSettingsService.getSettings(user.id);
      await userSettingsService.saveSettings(user.id, {
        ...current,
        show_phone: showPhone,
        allow_direct_messages: allowDm,
        show_activity_status: showActivity,
      });
      toast({ title: "Saved", description: "Privacy settings updated." });
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast({ title: "Error", description: "Unable to save privacy settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-[57px] sm:top-[60px] z-40 bg-background border-b border-border px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-card-foreground hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-card-foreground">Privacy Settings</h1>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-xl mx-auto">
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-phone">Show phone on profile</Label>
            <Switch id="show-phone" checked={showPhone} onCheckedChange={setShowPhone} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-dm">Allow direct messages</Label>
            <Switch id="allow-dm" checked={allowDm} onCheckedChange={setAllowDm} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-activity">Show my activity status</Label>
            <Switch id="show-activity" checked={showActivity} onCheckedChange={setShowActivity} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || !user}>
              {saving ? "Saving..." : "Save privacy settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;

