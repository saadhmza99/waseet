import { createContext, ReactNode, useContext, useMemo, useState } from "react";

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
    saved: "Saved",
  },
  Francais: {
    profile: "Profil",
    settings: "Parametres",
    moderation: "Moderation",
    logout: "Deconnexion",
    login: "Connexion",
    createProfile: "Creer un profil",
    feed: "Fil d'actualite",
    explore: "Explorer",
    reels: "Reels",
    saved: "Enregistres",
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
    saved: "المحفوظات",
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
    localStorage.getItem("app_language") || "English"
  );

  const setLanguage = (next: string) => {
    setLanguageState(next);
    localStorage.setItem("app_language", next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "Arabic" ? "rtl" : "ltr";
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string, fallback: string) => translations[language]?.[key] || fallback,
    }),
    [language]
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

