import { useTacticsStore } from '../store/useTacticsStore';
import { translations, Translations } from './translations';

export const useTranslation = () => {
  const language = useTacticsStore((s) => s.language);
  const setLanguage = useTacticsStore((s) => s.setLanguage);

  const t = (key: keyof Translations): string => {
    const currentDict = translations[language] || translations.id;
    return currentDict[key] || translations.id[key] || (key as string);
  };

  return {
    t,
    language,
    setLanguage,
  };
};
