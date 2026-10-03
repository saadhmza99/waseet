import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { VisitorGateProvider } from "@/contexts/VisitorGateContext";
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
import ProjectPage from "./pages/ProjectPage";
import ServicePage from "./pages/ServicePage.tsx";
import PropertyPage from "./pages/PropertyPage";
import CreateProjectWizard from "./components/project/CreateProjectWizard";
import CreateServiceForm from "./components/service/CreateServiceForm";
import VisitorProfile, { JoinChoice } from "./pages/VisitorProfile";
import Welcome, { hasSeenWelcome } from "./pages/Welcome";

const queryClient = new QueryClient();

// Agencies / professionals get their profile; visitors (or nobody yet) get the visitor page.
const SignedIn = ({ children }: { children: ReactNode }) => {
  const { user, visitorUser, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="py-8 text-center text-muted-foreground">Chargement...</div>;
  if (!user && !visitorUser) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
};

const OwnProfileRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-8 text-center text-muted-foreground">Chargement...</div>;
  return user ? <Profile /> : <VisitorProfile />;
};

const AppLayout = () => {
  const { pathname } = useLocation();
  const { user, loading: authLoading, isPasswordRecovery } = useAuth();
  const isProfile = pathname.startsWith("/profile");
  const isReels = pathname.startsWith("/reels");
  const isProjectDetail = pathname.startsWith("/projet/") && !pathname.startsWith("/projet/nouveau");
  const isServiceDetail = pathname.startsWith("/service/") && !pathname.startsWith("/service/nouveau");
  const isPropertyDetail = pathname.startsWith("/bien/");
  const isWelcome = pathname === "/welcome";
  const [welcomeDone, setWelcomeDone] = useState(() => hasSeenWelcome());
  const lockToReset = isPasswordRecovery;

  const hideAppChrome =
    isWelcome ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/create-profile") ||
    pathname.startsWith("/change-password") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/projet/nouveau") ||
    pathname.startsWith("/service/nouveau");

  if (!authLoading && !user && !welcomeDone && !lockToReset && !pathname.startsWith("/login") && !pathname.startsWith("/create-profile") && !pathname.startsWith("/change-password")) {
    return <Welcome onDone={() => setWelcomeDone(true)} />;
  }

  if (lockToReset && pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return (
        <div className="w-full min-h-screen bg-background flex flex-col">
          {isProfile || isReels || isProjectDetail || isServiceDetail || isPropertyDetail || lockToReset || hideAppChrome ? null : <AppHeader />}
          {lockToReset || hideAppChrome ? null : <TabNav />}
          <div className={`${lockToReset || hideAppChrome ? "" : "pb-20"} flex-1`}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<Welcome onDone={() => setWelcomeDone(true)} />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/job/:title" element={<JobDetail />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/projet/nouveau" element={<CreateProjectWizard />} />
            <Route path="/service/nouveau" element={<CreateServiceForm />} />
            <Route path="/service/:id" element={<ServicePage />} />
            <Route path="/projet/:id" element={<ProjectPage />} />
            <Route path="/bien/:id" element={<PropertyPage />} />
              <Route path="/reels" element={<Reels />} />
              <Route path="/saved" element={<Saved />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile" element={<OwnProfileRoute />} />
              <Route path="/login" element={<Login />} />
              <Route path="/settings" element={<SignedIn><Settings /></SignedIn>} />
              <Route path="/settings/blocked" element={<SignedIn><BlockedAccounts /></SignedIn>} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/privacy-settings" element={<SignedIn><PrivacySettings /></SignedIn>} />
              <Route path="/admin/moderation" element={<RequireAuth><AdminModeration /></RequireAuth>} />
              <Route path="/create-profile" element={<CreateProfile />} />
              <Route path="/join" element={<JoinChoice />} />
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
      <VisitorGateProvider>
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
      </VisitorGateProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
