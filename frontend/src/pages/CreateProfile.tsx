import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, UserPlus, Hammer, Building2, Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { toast } from "sonner";

const CreateProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, user } = useAuth();
  const [profileType, setProfileType] = useState<"craftsman" | "hunter" | null>(
    searchParams.get("type") === "craftsman" ? "craftsman" : searchParams.get("type") === "hunter" ? "hunter" : null
  );
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    profession: "",
    bio: "",
  });
  const MAX_BIO_LENGTH = 165;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildDefaultUsername = (baseName: string) => {
    const seed = Math.random().toString(36).slice(2, 8);
    const normalized = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    return normalized ? `${normalized}_${seed}` : `user_${seed}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Sign up user
      const { error: signUpError } = await signUp(formData.email, formData.password);
      
      if (signUpError) {
        setError(signUpError.message);
        toast.error(signUpError.message);
        setIsLoading(false);
        return;
      }

      // Wait for user to be available
      if (!user) {
        // User will be created by trigger, but we need to wait a bit
        setTimeout(async () => {
          const currentUser = (await import('@/lib/supabase')).supabase.auth.getUser();
          const { data: { user: newUser } } = await currentUser;
          
          if (newUser) {
            // Create profile with additional data
            await profileService.updateProfile(newUser.id, {
              username: formData.username.trim() || buildDefaultUsername(formData.name),
              full_name: formData.name,
              profession: formData.profession,
              location: formData.location,
              bio: formData.bio,
              phone: formData.phone,
              profile_type: profileType!,
            });
            
            toast.success("Profile created successfully!");
            navigate("/");
          }
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  if (!profileType) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 rounded-full mb-4 mx-auto">
              <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">Create Your Profile</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Choose your account type to get started</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <button
              onClick={() => setProfileType("craftsman")}
              className="bg-card border-2 border-border rounded-lg p-6 sm:p-8 hover:border-accent hover:bg-accent/5 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Hammer className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">Craftsman</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Showcase your work, find jobs, and connect with clients. Perfect for individual professionals and contractors.
              </p>
            </button>

            <button
              onClick={() => setProfileType("hunter")}
              className="bg-card border-2 border-border rounded-lg p-6 sm:p-8 hover:border-accent hover:bg-accent/5 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">Craftsman Hunter</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Post jobs, find skilled professionals, and manage projects. Ideal for businesses and enterprises.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="sticky top-[57px] sm:top-[60px] z-40 bg-background border-b border-border px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center gap-3">
        <button onClick={() => profileType ? setProfileType(null) : navigate(-1)} className="text-card-foreground hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-card-foreground">
          Create {profileType === "craftsman" ? "Craftsman" : "Craftsman Hunter"} Profile
        </h1>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-card-foreground mb-2">
              Username (unique)
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Choose username (optional)"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="h-11 sm:h-12"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Si vide, un username par défaut unique sera généré automatiquement.
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10 sm:pl-12 h-11 sm:h-12"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 sm:pl-12 h-11 sm:h-12"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 sm:pl-12 h-11 sm:h-12"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-card-foreground mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10 sm:pl-12 h-11 sm:h-12"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-card-foreground mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                id="location"
                type="text"
                placeholder="Enter your location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="pl-10 sm:pl-12 h-11 sm:h-12"
                required
              />
            </div>
          </div>

          {profileType === "craftsman" && (
            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-card-foreground mb-2">
                Profession
              </label>
              <div className="relative">
                <Hammer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="profession"
                  type="text"
                  placeholder="e.g., Plumber, Carpenter, Electrician"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="pl-10 sm:pl-12 h-11 sm:h-12"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-card-foreground mb-2">
              Bio
            </label>
            <div className="relative">
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_BIO_LENGTH) {
                    setFormData({ ...formData, bio: value });
                  }
                }}
                className="min-h-[100px] resize-none"
                maxLength={MAX_BIO_LENGTH}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {formData.bio.length}/{MAX_BIO_LENGTH}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-11 sm:h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Creating Profile..." : "Create Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;

