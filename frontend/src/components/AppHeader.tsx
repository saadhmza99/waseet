import { useEffect, useState } from "react";
import { Bell, Wrench, User, LogIn, LogOut, Settings, UserPlus, Home, MapPin, Video, Bookmark } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { moderationService } from "@/services/moderationService";
import { getDefaultAvatar } from "@/lib/avatar";
import { notificationService } from "@/services/notificationService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const tabs = [
  { label: "Fil d'actualité", icon: Home, path: "/" },
  { label: "Explorer", icon: MapPin, path: "/explore" },
  { label: "Reels", icon: Video, path: "/reels" },
  { label: "Enregistrés", icon: Bookmark, path: "/saved" },
];

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const isLoggedIn = Boolean(user);
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || getDefaultAvatar(profile?.profile_type);
  const accountLabel = profile?.username || user?.email || "Mon compte";
  const [isModerator, setIsModerator] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setIsModerator(false);
      return;
    }
    moderationService.isModerator(user.id).then(setIsModerator).catch(() => setIsModerator(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const loadNotifications = async () => {
      try {
        const [items, unread] = await Promise.all([
          notificationService.getNotifications(user.id, 20),
          notificationService.getUnreadCount(user.id),
        ]);
        setNotifications(items);
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleMarkAllNotificationsRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const formatNotificationTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    } catch {
      return "récemment";
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className="bg-nav text-nav-foreground border-b border-nav-foreground/10 fixed lg:sticky top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
        {/* Mobile Layout: Grid with centered logo */}
        <div className="grid grid-cols-3 items-center lg:hidden">
          <div className="flex justify-start">
            {/* Empty space for centering */}
          </div>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Wrench className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Sefarah</span>
          </div>
          <div className="flex justify-end items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="relative opacity-80 hover:opacity-100 transition-opacity"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-muted-foreground">Aucune notification</div>
                ) : (
                  notifications.map((item) => (
                    <DropdownMenuItem key={item.id} className="py-2">
                      <div className="flex items-start gap-2 w-full">
                        <img
                          src={item.actor?.avatar_url || getDefaultAvatar(item.actor?.profile_type)}
                          alt={item.actor?.username || "Utilisateur"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground whitespace-normal break-words">
                            <span className="font-semibold">{item.actor?.username || "Utilisateur"}</span>{" "}
                            {item.message}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatNotificationTime(item.created_at)}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 border-nav-foreground/30 object-cover"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{accountLabel}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Voir mon profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </DropdownMenuItem>
                  {isModerator && (
                    <DropdownMenuItem onClick={() => navigate("/admin/moderation")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Modération</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                          <button className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 border-nav-foreground/30 hover:opacity-80 transition-opacity">
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogin}>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Connexion</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/create-profile")}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Créer un profil</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Desktop Layout: Flex with navigation tabs */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <Wrench className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Sefarah</span>
            </div>
            {/* Desktop Navigation - next to logo */}
            <nav className="flex items-center gap-2">
              {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                return (
                  <button
                    key={tab.label}
                    onClick={() => navigate(tab.path)}
                    className={`flex items-center gap-2 px-6 py-3 text-base font-medium transition-colors rounded-lg ${
                      isActive
                        ? "text-nav-foreground bg-nav-foreground/10"
                        : "text-nav-foreground/70 hover:text-nav-foreground hover:bg-nav-foreground/5"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
      
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="relative opacity-80 hover:opacity-100 transition-opacity"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-muted-foreground">Aucune notification</div>
                ) : (
                  notifications.map((item) => (
                    <DropdownMenuItem key={item.id} className="py-2">
                      <div className="flex items-start gap-2 w-full">
                        <img
                          src={item.actor?.avatar_url || getDefaultAvatar(item.actor?.profile_type)}
                          alt={item.actor?.username || "Utilisateur"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground whitespace-normal break-words">
                            <span className="font-semibold">{item.actor?.username || "Utilisateur"}</span>{" "}
                            {item.message}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatNotificationTime(item.created_at)}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {isLoggedIn ? (
        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <img
                              src={avatarUrl}
                              alt="Profile"
                              className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 border-nav-foreground/30 object-cover"
                            />
                          </button>
                        </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{accountLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>View my profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            {isModerator && (
              <DropdownMenuItem onClick={() => navigate("/admin/moderation")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Moderation</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
                          <button className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 border-nav-foreground/30 hover:opacity-80 transition-opacity">
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogin}>
              <LogIn className="mr-2 h-4 w-4" />
              <span>Log In</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/create-profile")}>
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Create Profile</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
