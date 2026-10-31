import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Inter selbst gehostet (keine Anfragen an Google Fonts, Datenschutz).
import '@fontsource-variable/inter';
import 'katex/dist/katex.min.css';
import './index.css';
import App from './App';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from './config/brand';

// Seitentitel aus der Markenkonstante (index.html enthält nur den Fallback für den ersten Paint).
document.title = `${PRODUCT_NAME} – ${PRODUCT_TAGLINE}`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
