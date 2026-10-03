import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import { App } from '@/App';
import '@/shared/i18n/i18n';
import '@/styles.css';
import { restorePrimaryColor } from '@/shared/theme/primary-color';

restorePrimaryColor();
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element is missing');
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
