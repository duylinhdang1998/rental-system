import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LocaleToggle() {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language !== 'en';
  const changeLocale = async () => {
    const locale = isVietnamese ? 'en' : 'vi';
    window.localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
    const url = new URL(window.location.href);
    url.searchParams.set('lang', locale);
    window.history.replaceState(null, '', url);
    await i18n.changeLanguage(locale);
  };
  return (
    <button
      className="button-base border border-line bg-panel text-sm text-ink"
      onClick={() => void changeLocale()}
      type="button"
    >
      <Languages aria-hidden className="size-4" />
      {isVietnamese ? 'English' : 'Tiếng Việt'}
    </button>
  );
}
