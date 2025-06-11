"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supportedLanguages } from "@/lib/translation";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  supportedLanguages: typeof supportedLanguages;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en");
  const router = useRouter();
  const pathname = usePathname();

  // Initialize language from URL or localStorage
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    const pathLanguage = pathname.split("/")[1];
    
    const lang = supportedLanguages.some(l => l.code === pathLanguage)
      ? pathLanguage
      : storedLanguage || "en";
      
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }, [pathname]);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    
    // Update URL without full page reload
    const newPath = pathname.replace(/^\/(en|es|fr|de|hi|ja)/, `/${lang}`);
    router.push(newPath);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        supportedLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}