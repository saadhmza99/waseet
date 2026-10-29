import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

type TranslationDict = Record<string, string>;

const translations: Record<string, TranslationDict> = {
  English: {
    profile: "Profile",
    settings: "Settings",
    moderation: "Moderation",
    logout: "Log Out",
    login: "Log In",
    createProfile: "Create Profile",
    feed: "Feed",
    explore: "Explore",
    reels: "Reels",
    saved: "Favorites",
  },
  Francais: {
    profile: "Profil",
    settings: "Paramètres",
    moderation: "Modération",
    logout: "Déconnexion",
    login: "Connexion",
    createProfile: "Créer un profil",
    feed: "Fil d'actualité",
    explore: "Explorer",
    reels: "Vidéos",
    saved: "Favoris",
  },
  Arabic: {
    profile: "الملف الشخصي",
    settings: "الاعدادات",
    moderation: "الاشراف",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    createProfile: "انشاء ملف",
    feed: "المنشورات",
    explore: "استكشاف",
    reels: "ريلز",
    saved: "المفضلة",
  },
};

interface AppLanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, fallback: string) => string;
}

const AppLanguageContext = createContext<AppLanguageContextType | undefined>(undefined);

export const AppLanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<string>(
    localStorage.getItem("app_language") || "Francais"
  );

  const setLanguage = useCallback((next: string) => {
    setLanguageState(next);
    try {
      localStorage.setItem("app_language", next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const htmlLang = language === "English" ? "en" : language === "Arabic" ? "ar" : "fr";
    document.documentElement.lang = htmlLang;
    document.documentElement.dir = language === "Arabic" ? "rtl" : "ltr";
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string, fallback: string) => translations[language]?.[key] || fallback,
    }),
    [language, setLanguage]
  );

  return <AppLanguageContext.Provider value={value}>{children}</AppLanguageContext.Provider>;
};

export const useAppLanguage = () => {
  const ctx = useContext(AppLanguageContext);
  if (!ctx) {
    throw new Error("useAppLanguage must be used within AppLanguageProvider");
  }
  return ctx;
};

