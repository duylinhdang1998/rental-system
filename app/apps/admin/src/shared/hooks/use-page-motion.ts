import { useEffect, useState, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function usePageMotion() {
  const { pathname } = useLocation();
  const [target, setTarget] = useState<string | null>(null);
  useEffect(() => {
    const reset = () => setTarget(null);
    window.addEventListener('popstate', reset);
    return () => window.removeEventListener('popstate', reset);
  }, []);
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[href]');
    if (!link || isModifiedClick(event)) return;
    const url = new URL(link.getAttribute('href') ?? '', window.location.href);
    if (url.origin !== window.location.origin || url.pathname === pathname) return;
    setTarget(event.detail > 0 ? url.pathname : null);
  };
  return { pathname, animate: target === pathname, onClickCapture };
}
