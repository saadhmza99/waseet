import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RESET_COOLDOWN_MS = 60_000;

const messageForAuthError = (message: string) => {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("over_email_send_rate_limit")) {
    return "Trop de demandes. Attendez quelques minutes, puis réessayez avec un seul clic.";
  }
  return message;
};

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetCooldownUntil, setResetCooldownUntil] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        const message = messageForAuthError(error.message);
        setError(message);
        toast.error(message);
      } else {
        toast.success("Logged in successfully!");
        navigate(searchParams.get("redirect") || "/");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      const message = "Enter your email to reset your password.";
      setError(message);
      toast.error(message);
      return;
    }

    if (Date.now() < resetCooldownUntil) {
      const message = "Un email a déjà été demandé. Vérifiez votre boîte de réception, ou attendez une minute.";
      setError(message);
      toast.error(message);
      return;
    }

    setError(null);
    setResettingPassword(true);
    try {
      const { error: resetError } = await resetPassword(trimmed);
      if (resetError) {
        const message = messageForAuthError(resetError.message);
        setError(message);
        toast.error(message);
        if (message !== resetError.message) {
          setResetCooldownUntil(Date.now() + RESET_COOLDOWN_MS);
        }
        return;
      }
      setResetCooldownUntil(Date.now() + RESET_COOLDOWN_MS);
      toast.success("Check your email for a password reset link.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to send reset email.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 rounded-full mb-4 mx-auto">
            <LogIn className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">Welcome Back</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Log in to your Sifarah account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-border" />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resettingPassword}
              className="text-accent hover:underline font-medium disabled:opacity-60"
            >
              {resettingPassword ? "Sending..." : "Forgot password?"}
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 sm:h-12 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/create-profile")}
              className="text-accent hover:underline font-medium"
            >
              Create Profile
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

