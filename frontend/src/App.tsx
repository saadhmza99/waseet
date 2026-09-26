import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLanguageProvider } from "@/contexts/AppLanguageContext";
import AppHeader from "@/components/AppHeader";
import TabNav from "@/components/TabNav";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Reels from "./pages/Reels";
import Saved from "./pages/Saved";
import JobDetail from "./pages/JobDetail";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword.tsx";
import PrivacySettings from "./pages/PrivacySettings.tsx";
import CreateProfile from "./pages/CreateProfile";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import RequireAuth from "@/components/RequireAuth";
import AdminModeration from "./pages/AdminModeration";
import BlockedAccounts from "./pages/BlockedAccounts";

import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const AppLayout = () => {
  const { pathname } = useLocation();
  const { isPasswordRecovery } = useAuth();
  const isProfile = pathname.startsWith("/profile");
  const isReels = pathname.startsWith("/reels");
  const lockToReset = isPasswordRecovery;

  const hideAppChrome =
    pathname.startsWith("/login") ||
    pathname.startsWith("/create-profile") ||
    pathname.startsWith("/change-password") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin");

  if (lockToReset && pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return (
        <div className="w-full min-h-screen bg-background flex flex-col">
          {isProfile || isReels || lockToReset || hideAppChrome ? null : <AppHeader />}
          {lockToReset || hideAppChrome ? null : <TabNav />}
          <div className={`${lockToReset || hideAppChrome ? "" : "pb-20"} flex-1`}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/job/:title" element={<JobDetail />} />
            <Route path="/explore" element={<Explore />} />
              <Route path="/reels" element={<Reels />} />
              <Route path="/saved" element={<RequireAuth><Saved /></RequireAuth>} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/login" element={<Login />} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/settings/blocked" element={<RequireAuth><BlockedAccounts /></RequireAuth>} />
              <Route path="/change-password" element={<ChangePassword />} />
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
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
        <Toaster />
        <Sonner />
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
    </AppLanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
