import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Hammer, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PhoneInput from "@/components/PhoneInput";
import { CityPicker, RegionSelect } from "@/components/CityPicker";
import { isCompletePhone } from "@/lib/phone";
import { citiesForRegion } from "@/lib/moroccoPlaces";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { supabase } from "@/lib/supabase";
import { lookupSignupGeo } from "@/lib/signupGeo";
import { toast } from "sonner";

const CreateProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useAuth();
  const typeParam = searchParams.get("type");
  const profileType: "individual" | "enterprise" | null =
    typeParam === "individual" || typeParam === "enterprise" ? typeParam : null;
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    region: "",
    location: "",
    profession: "",
    bio: "",
  });
  const MAX_BIO_LENGTH = 450;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const buildDefaultUsername = (baseName: string) => {
    const seed = Math.random().toString(36).slice(2, 8);
    const normalized = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    return normalized ? `${normalized}_${seed}` : `user_${seed}`;
  };

  const showEmailConfirmation = (email: string) => {
    setEmailSent(true);
    toast.success("Check your email to confirm your account", {
      description: `We sent a confirmation link to ${email}.`,
      duration: 10000,
    });
  };

  const handleResendConfirmation = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Confirmation email sent again", {
        description: `Check inbox and spam for ${formData.email}.`,
        duration: 8000,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend email");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isCompletePhone(formData.phone)) {
      setError("Entrez un numéro de téléphone valide pour l'indicatif choisi.");
      toast.error("Numéro de téléphone incomplet");
      return;
    }
    setIsLoading(true);

    try {
      const username = formData.username.trim() || buildDefaultUsername(formData.name);
      const geo = await lookupSignupGeo();
      const { error: signUpError, needsEmailConfirmation } = await signUp(
        formData.email,
        formData.password,
        {
          username,
          full_name: formData.name,
          profession: formData.profession,
          location: formData.location,
          bio: formData.bio,
          phone: formData.phone,
          profile_type: profileType!,
          signup_ip: geo.ip || "",
          signup_country: geo.country || "",
          signup_country_code: geo.countryCode || "",
        }
      );

      if (signUpError) {
        setError(signUpError.message);
        toast.error(signUpError.message);
        return;
      }

      if (needsEmailConfirmation) {
        showEmailConfirmation(formData.email);
        return;
      }

      const { data: { user: newUser } } = await (await import("@/lib/supabase")).supabase.auth.getUser();
      if (newUser) {
        await profileService.updateProfile(newUser.id, {
          username,
          full_name: formData.name,
          profession: formData.profession,
          location: formData.location,
          bio: formData.bio,
          phone: formData.phone,
          profile_type: profileType!,
        });
      }

      toast.success("Profile created successfully!");
      navigate("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profileType) {
    return <Navigate to="/join" replace />;
  }

  const goBack = () => {
    // Opened directly (no in-app history): go to the account-type choice instead of leaving the app.
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate("/join", { replace: true });
  };

  return (
    <div className="pb-20">
      <div className="sticky top-[57px] sm:top-[60px] z-40 bg-background border-b border-border px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center gap-3">
        <button onClick={goBack} className="text-card-foreground hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-card-foreground">
          {profileType === "individual" ? "Compte professionnel indépendant" : "Compte agence"}
        </h1>
      </div>

      <AlertDialog open={emailSent} onOpenChange={setEmailSent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Check your email to confirm</AlertDialogTitle>
            <AlertDialogDescription>
              We sent a confirmation link to <span className="font-medium text-foreground">{formData.email}</span>.
              Open that email and confirm your account before you log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isResending}
              onClick={handleResendConfirmation}
            >
              {isResending ? "Sending..." : "Resend email"}
            </Button>
            <AlertDialogAction onClick={() => navigate("/login")}>
              Go to login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <PhoneInput
              id="phone"
              required
              value={formData.phone}
              onChange={(phone) => setFormData({ ...formData, phone })}
              inputClassName="h-11 sm:h-12"
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium text-card-foreground mb-2">
              Région
            </label>
            <RegionSelect
              id="region"
              required
              value={formData.region}
              onChange={(region) => {
                const nextCity = citiesForRegion(region).includes(formData.location) ? formData.location : "";
                setFormData({ ...formData, region, location: nextCity });
              }}
              className="h-11 sm:h-12"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-card-foreground mb-2">
              Ville
            </label>
            <CityPicker
              id="location"
              required
              region={formData.region}
              value={formData.location}
              onChange={(location) => setFormData({ ...formData, location })}
              placeholder="Ville"
              className="h-11 sm:h-12"
            />
          </div>

          {profileType === "individual" && (
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
              className="w-full h-11 sm:h-12 bg-[#174f43] text-base font-semibold text-white hover:bg-[#123d34]"
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

