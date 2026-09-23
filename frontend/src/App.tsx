import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLanguageProvider } from "@/contexts/AppLanguageContext";
import AppHeader from "@/components/AppHeader";
import TabNav from "@/components/TabNav";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Reels from "./pages/Reels";
import Saved from "./pages/Saved";
import JobDetail from "./pages/JobDetail";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword.tsx";
import PrivacySettings from "./pages/PrivacySettings.tsx";
import CreateProfile from "./pages/CreateProfile";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import RequireAuth from "@/components/RequireAuth";
import AdminModeration from "./pages/AdminModeration";

const Profile = lazy(() => import("./pages/Profile"));

const ProfileRoute = () => (
  <Suspense fallback={<div className="py-10 text-center text-muted-foreground">Chargement du profil...</div>}>
    <Profile />
  </Suspense>
);

const queryClient = new QueryClient();

const AppLayout = () => {
  const { pathname } = useLocation();
  const isProfile = pathname.startsWith("/profile");

  return (
        <div className="w-full min-h-screen bg-background flex flex-col">
          {isProfile ? null : (
            <>
              <AppHeader />
              <TabNav />
            </>
          )}
          <div className={`${isProfile ? "pt-0" : "pt-[108px] sm:pt-[124px] lg:pt-0"} flex-1`}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/job/:title" element={<JobDetail />} />
            <Route path="/explore" element={<Explore />} />
              <Route path="/reels" element={<Reels />} />
              <Route path="/saved" element={<RequireAuth><Saved /></RequireAuth>} />
            <Route path="/profile/:id" element={<ProfileRoute />} />
            <Route path="/profile" element={<RequireAuth><ProfileRoute /></RequireAuth>} />
              <Route path="/login" element={<Login />} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
              <Route path="/privacy-settings" element={<RequireAuth><PrivacySettings /></RequireAuth>} />
              <Route path="/admin/moderation" element={<RequireAuth><AdminModeration /></RequireAuth>} />
              <Route path="/create-profile" element={<CreateProfile />} />
              <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
        </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppLanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
    </AppLanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
