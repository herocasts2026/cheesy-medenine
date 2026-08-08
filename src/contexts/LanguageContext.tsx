import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '@/data/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (typeof translations)['fr'];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  t: translations['fr'],
  isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('cheesy-lang') as Language) || 'fr';
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('cheesy-lang', l);
  };

  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang], isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
