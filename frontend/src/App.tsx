import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { VisitorGateProvider } from "@/contexts/VisitorGateContext";
import { AppLanguageProvider, useAppLanguage } from "@/contexts/AppLanguageContext";
import I18nApply from "@/components/I18nApply";
import VisitorTracker from "@/components/VisitorTracker";
import { userSettingsService } from "@/services/userSettingsService";
import AppHeader from "@/components/AppHeader";
import FeedDesktopRail from "@/components/FeedDesktopRail";
import TabNav from "@/components/TabNav";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Reels from "./pages/Reels";
import Saved from "./pages/Saved";
import Messages from "./pages/Messages";
import JobDetail from "./pages/JobDetail";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword.tsx";
import PrivacySettings from "./pages/PrivacySettings.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import CreateProfile from "./pages/CreateProfile";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import RequireAuth from "@/components/RequireAuth";
import RequireModerator from "@/components/RequireModerator";
import AdminModeration from "./pages/AdminModeration";
import AdminAnalytics from "./pages/AdminAnalytics";
import BlockedAccounts from "./pages/BlockedAccounts";

import Profile from "./pages/Profile";
import ProjectPage from "./pages/ProjectPage";
import ServicePage from "./pages/ServicePage.tsx";
import PropertyPage from "./pages/PropertyPage";
import CreateProjectWizard from "./components/project/CreateProjectWizard";
import CreateServiceForm from "./components/service/CreateServiceForm";
import CreateProductForm from "./components/product/CreateProductForm";
import VisitorProfile, { JoinChoice } from "./pages/VisitorProfile";
import Welcome, { hasSeenWelcome } from "./pages/Welcome";
import Opportunities from "./pages/Opportunities.tsx";
import Federations from "./pages/Federations";
import Products from "./pages/Products";
import ProductPage from "./pages/ProductPage";
import Tools from "./pages/Tools";
import Courses from "./pages/Courses";
import Hrayfi from "./pages/Hrayfi";
import ProfessionalPreview from "./pages/ProfessionalPreview.tsx";
import Devis from "./pages/Devis";

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
  const { user, visitorUser, loading, loggingOut } = useAuth();
  if (loading || loggingOut) return <div className="py-8 text-center text-muted-foreground">Chargement...</div>;
  if (user) return <Profile />;
  if (visitorUser) return <VisitorProfile />;
  return <Navigate to="/login" replace />;
};

const applyDark = (on: boolean) => {
  document.documentElement.classList.toggle("dark", on);
  try {
    localStorage.setItem("sifarah.dark", on ? "1" : "0");
  } catch {
    /* ignore */
  }
};

if (typeof document !== "undefined") {
  try {
    if (localStorage.getItem("sifarah.dark") === "1") document.documentElement.classList.add("dark");
  } catch {
    /* ignore */
  }
}

const AppLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, visitorUser, loading: authLoading, isPasswordRecovery, loggingOut, acknowledgeLogout } = useAuth();
  const { setLanguage } = useAppLanguage();
  const accountId = user?.id || visitorUser?.id || null;
  const isVisitor = Boolean(visitorUser && !user);

  useEffect(() => {
    if (!accountId) return;
    let cancelled = false;
    const languageAtStart = localStorage.getItem("app_language");
    userSettingsService.loadForAccount(accountId, isVisitor).then((settings) => {
      if (cancelled) return;
      applyDark(Boolean(settings.dark_mode_enabled));
      if (languageAtStart) return;
      if (settings.language && settings.language !== "Francais") {
        setLanguage(settings.language);
      }
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [accountId, isVisitor, setLanguage]);

  useEffect(() => {
    if (!loggingOut || authLoading || user || visitorUser) return;
    acknowledgeLogout();
    if (pathname !== "/") navigate("/", { replace: true });
  }, [loggingOut, authLoading, user, visitorUser, pathname, navigate, acknowledgeLogout]);
  const isProfile = pathname.startsWith("/profile");
  const isReels = pathname.startsWith("/reels");
  const isProjectDetail = pathname.startsWith("/projet/") && !pathname.startsWith("/projet/nouveau") && !pathname.endsWith("/modifier");
  const isServiceDetail = pathname.startsWith("/service/") && !pathname.startsWith("/service/nouveau") && !pathname.endsWith("/modifier");
  const isPropertyDetail = pathname.startsWith("/bien/");
  const [welcomeDone, setWelcomeDone] = useState(() => hasSeenWelcome());
  const lockToReset = isPasswordRecovery;
  const showWelcomeOverlay =
    !authLoading &&
    !user &&
    !welcomeDone &&
    !lockToReset &&
    !pathname.startsWith("/preview") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/join") &&
    !pathname.startsWith("/create-profile") &&
    !pathname.startsWith("/change-password") &&
    !pathname.startsWith("/conditions") &&
    !pathname.startsWith("/confidentialite");

  /** Pages that already render FeedDesktopRail themselves. */
  const pageOwnsDesktopRail =
    pathname === "/" ||
    pathname.startsWith("/explore") ||
    pathname.startsWith("/saved") ||
    pathname.startsWith("/inbox") ||
    pathname.startsWith("/opportunites") ||
    pathname.startsWith("/federations") ||
    pathname.startsWith("/contact") ||
    pathname === "/produits" ||
    pathname.startsWith("/outils") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/hrayfi") ||
    isProjectDetail;

  const isPreview = pathname.startsWith("/preview");
  const hideAppChrome =
    isPreview ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/join") ||
    pathname.startsWith("/create-profile") ||
    pathname.startsWith("/change-password") ||
    pathname.startsWith("/conditions") ||
    pathname.startsWith("/confidentialite") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/privacy-settings") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/projet/nouveau") ||
    /^\/projet\/[^/]+\/modifier$/.test(pathname) ||
    pathname.startsWith("/service/nouveau") ||
    /^\/service\/[^/]+\/modifier$/.test(pathname) ||
    pathname.startsWith("/produit/nouveau") ||
    /^\/produit\/[^/]+\/modifier$/.test(pathname) ||
    pathname.startsWith("/devis");

  /** Inject left rail for pages that don't own one (profile, details, etc.). */
  const injectDesktopRail = !hideAppChrome && !lockToReset && !pageOwnsDesktopRail;

  // Wait for the initial session to be validated/refreshed before mounting
  // pages, so their first queries never go out with a stale token (401s).
  if (authLoading) {
    return <div className="py-8 text-center text-muted-foreground">Chargement...</div>;
  }

  if (lockToReset && pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  const showMobileHeader =
    !isProfile &&
    !isReels &&
    !isProjectDetail &&
    !isServiceDetail &&
    !isPropertyDetail &&
    !lockToReset &&
    !hideAppChrome;
  const showMobileTabNav = !lockToReset && !hideAppChrome && !isProjectDetail;
  const mainPad = showMobileTabNav ? "pb-20 lg:pb-0" : "";

  const routes = (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/welcome" element={<Navigate to="/" replace />} />
      <Route path="/post/:id" element={<PostDetail />} />
      <Route path="/job/:title" element={<JobDetail />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/opportunites" element={<Opportunities />} />
      <Route path="/federations" element={<Federations />} />
      <Route path="/produits" element={<Products />} />
      <Route path="/produits/:id" element={<ProductPage />} />
      <Route path="/outils" element={<Tools />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/hrayfi" element={<Hrayfi />} />
      <Route path="/devis" element={<Devis />} />
          <Route path="/projet/nouveau" element={<CreateProjectWizard />} />
          <Route path="/projet/:id/modifier" element={<SignedIn><CreateProjectWizard /></SignedIn>} />
          <Route path="/service/nouveau" element={<CreateServiceForm />} />
          <Route path="/service/:id/modifier" element={<SignedIn><CreateServiceForm /></SignedIn>} />
      <Route path="/produit/nouveau" element={<SignedIn><CreateProductForm /></SignedIn>} />
      <Route path="/produit/:id/modifier" element={<SignedIn><CreateProductForm /></SignedIn>} />
      <Route path="/service/:id" element={<ServicePage />} />
      <Route path="/projet/:id" element={<ProjectPage />} />
      <Route path="/bien/:id" element={<PropertyPage />} />
      <Route path="/reels" element={<Reels />} />
      <Route path="/saved" element={<Saved />} />
      <Route path="/inbox" element={<Messages />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/profile" element={<OwnProfileRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/settings" element={<SignedIn><Settings /></SignedIn>} />
      <Route path="/settings/blocked" element={<SignedIn><BlockedAccounts /></SignedIn>} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/privacy-settings" element={<SignedIn><PrivacySettings /></SignedIn>} />
      <Route path="/admin/moderation" element={<RequireModerator><AdminModeration /></RequireModerator>} />
      <Route path="/admin/analytics" element={<RequireModerator><AdminAnalytics /></RequireModerator>} />
      <Route path="/create-profile" element={<CreateProfile />} />
      <Route path="/join" element={<JoinChoice />} />
      <Route path="/conditions" element={<TermsOfUse />} />
      <Route path="/confidentialite" element={<PrivacyPolicy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/preview/pros" element={<ProfessionalPreview />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {showMobileHeader ? (
        <div className="lg:hidden">
          <AppHeader />
        </div>
      ) : null}
      {showMobileTabNav ? (
        <div className="lg:hidden">
          <TabNav />
        </div>
      ) : null}
      <div className={`${mainPad} flex-1`}>
        {injectDesktopRail ? (
          <div className="lg:flex lg:min-h-screen lg:w-full">
            <FeedDesktopRail />
            <div className="min-w-0 flex-1">{routes}</div>
          </div>
        ) : (
          routes
        )}
      </div>
      {showWelcomeOverlay ? <Welcome onDone={() => setWelcomeDone(true)} /> : null}
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
            <VisitorGateProvider>
              <Toaster />
              <Sonner />
              <I18nApply />
              <VisitorTracker />
              <AppLayout />
            </VisitorGateProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AppLanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
