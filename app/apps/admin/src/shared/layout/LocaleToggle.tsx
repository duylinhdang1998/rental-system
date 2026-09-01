import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
    <Button onClick={() => void changeLocale()} type="button" variant="outline">
      <Languages aria-hidden data-icon="inline-start" />
      {isVietnamese ? 'English' : 'Tiếng Việt'}
    </Button>
  );
}
