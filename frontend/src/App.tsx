import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import TabNav from "@/components/TabNav";
import SearchBar from "@/components/SearchBar";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Reels from "./pages/Reels";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import JobDetail from "./pages/JobDetail";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import CreateProfile from "./pages/CreateProfile";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <div className="w-full min-h-screen bg-background flex flex-col">
          <AppHeader />
          <TabNav />
          <div className="pt-[108px] sm:pt-[124px] lg:pt-0 flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/job/:title" element={<JobDetail />} />
            <Route path="/explore" element={<Explore />} />
              <Route path="/reels" element={<Reels />} />
              <Route path="/saved" element={<Saved />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/create-profile" element={<CreateProfile />} />
              <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
