import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Shield, Moon, Globe, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { profileService } from "@/services/profileService";
import { storageService } from "@/services/storageService";
import { getDefaultAvatar } from "@/lib/avatar";
import { toast } from "@/components/ui/use-toast";
import { userSettingsService } from "@/services/userSettingsService";
import { useAppLanguage } from "@/contexts/AppLanguageContext";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState("English");
  const [region, setRegion] = useState("UAE");
  const [showPhone, setShowPhone] = useState(false);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const MAX_BIO_LENGTH = 165;
  const { setLanguage: setAppLanguage } = useAppLanguage();
  const languageOptions = [
    "English",
    "Francais",
    "Arabic",
    "Spanish",
    "German",
    "Italian",
    "Portuguese",
    "Chinese",
    "Japanese",
    "Korean",
    "Hindi",
    "Turkish",
    "Russian",
  ];
  const regionOptions = [
    "UAE",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Bahrain",
    "Oman",
    "Morocco",
    "Algeria",
    "Tunisia",
    "Egypt",
    "France",
    "Spain",
    "United Kingdom",
    "United States",
    "Canada",
    "India",
    "China",
    "Japan",
    "Brazil",
    "Australia",
  ];

  useEffect(() => {
    if (!profile) return;
    setUsername(profile.username || "");
    setFullName(profile.full_name || "");
    setBio(profile.bio || "");
  }, [profile]);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      try {
        const settings = await userSettingsService.getSettings(user.id);
        setNotifications(settings.notifications_enabled);
        setEmailNotifications(settings.email_notifications_enabled);
        setDarkMode(settings.dark_mode_enabled);
        setLanguage(settings.language);
        setRegion(settings.region);
        setShowPhone(settings.show_phone);
        setAllowDirectMessages(settings.allow_direct_messages);
        setShowActivityStatus(settings.show_activity_status);
        setAppLanguage(settings.language);
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };

    loadPreferences();
  }, [user?.id, setAppLanguage]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : profile?.avatar_url || getDefaultAvatar(profile?.profile_type);

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        avatarUrl = await storageService.uploadImage(avatarFile, "avatars");
      }

      await profileService.updateProfile(user.id, {
        username: username.trim() || profile.username,
        full_name: fullName.trim(),
        bio: bio.slice(0, MAX_BIO_LENGTH),
        profession: profile.profession,
        location: profile.location,
        phone: profile.phone,
        profile_type: profile.profile_type,
        avatar_url: avatarUrl,
      });

      setAvatarFile(null);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont bien été enregistrées.",
      });
    } catch (error) {
      console.error("Error updating settings profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setIsSavingPreferences(true);
    try {
      await userSettingsService.saveSettings(user.id, {
        notifications_enabled: notifications,
        email_notifications_enabled: emailNotifications,
        dark_mode_enabled: darkMode,
        language,
        region,
        show_phone: showPhone,
        allow_direct_messages: allowDirectMessages,
        show_activity_status: showActivityStatus,
      });
      setAppLanguage(language);
      toast({
        title: "Préférences sauvegardées",
        description: "Vos paramètres ont été enregistrés en base.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences.",
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  if (profileLoading) {
    return <div className="py-10 text-center text-muted-foreground">Chargement des paramètres...</div>;
  }

  return (
    <div className="pb-20">
      <div className="sticky top-[57px] sm:top-[60px] z-40 bg-background border-b border-border px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-card-foreground hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-card-foreground">Settings</h1>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-2xl mx-auto space-y-6 sm:space-y-8">
        {/* Profile Section */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Profile</h2>
          </div>
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border border-border"
              />
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  />
                  <span className="inline-flex h-9 items-center rounded-md bg-secondary px-3 text-sm font-medium">
                    Take photo
                  </span>
                </label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  />
                  <span className="inline-flex h-9 items-center rounded-md bg-secondary px-3 text-sm font-medium">
                    Upload photo
                  </span>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="username" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre username"
              />
            </div>

            <div>
              <Label htmlFor="fullname" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Nom complet
              </Label>
              <Input
                id="fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Bio
              </Label>
              <div className="relative">
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= MAX_BIO_LENGTH) {
                      setBio(value);
                    }
                  }}
                  className="min-h-[100px] resize-none pr-16"
                  maxLength={MAX_BIO_LENGTH}
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {bio.length}/{MAX_BIO_LENGTH}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isSaving || !user}>
                {isSaving ? "Enregistrement..." : "Enregistrer le profil"}
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Notifications</h2>
          </div>
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="notifications" className="text-sm sm:text-base font-medium text-card-foreground">
                  Push Notifications
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Receive notifications about new jobs and messages
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="email-notifications" className="text-sm sm:text-base font-medium text-card-foreground">
                  Email Notifications
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Get updates via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSavePreferences} disabled={isSavingPreferences || !user}>
                {isSavingPreferences ? "Enregistrement..." : "Enregistrer préférences"}
              </Button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Privacy & Security</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/change-password")}>
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/privacy-settings")}>
              Privacy Settings
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              Two-Factor Authentication
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="dark-mode" className="text-sm sm:text-base font-medium text-card-foreground">
                Dark Mode
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Switch to dark theme
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </div>

        {/* Language & Region */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Language & Region</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="language" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Language
              </Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="region" className="text-sm sm:text-base font-medium text-card-foreground mb-2 block">
                Region
              </Label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSavePreferences} disabled={isSavingPreferences || !user}>
                {isSavingPreferences ? "Enregistrement..." : "Appliquer langue et region"}
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card rounded-lg border border-destructive/50 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
            <h2 className="text-lg sm:text-xl font-semibold text-destructive">Danger Zone</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <Button variant="destructive" className="w-full justify-start">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

