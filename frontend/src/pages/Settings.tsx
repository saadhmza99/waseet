import { useState } from "react";
import { ArrowLeft, Bell, Shield, Moon, Globe, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [bio, setBio] = useState("Entrepreneur général agréé avec plus de 12 ans d'expérience dans les rénovations résidentielles et commerciales. Spécialisé dans les rénovations de cuisine");
  const MAX_BIO_LENGTH = 165;

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
            <Button variant="outline" className="w-full justify-start">
              Privacy Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
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
            <Button variant="outline" className="w-full justify-between">
              <span>Language</span>
              <span className="text-muted-foreground">English</span>
            </Button>
            <Button variant="outline" className="w-full justify-between">
              <span>Region</span>
              <span className="text-muted-foreground">UAE</span>
            </Button>
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

