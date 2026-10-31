import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Inter selbst gehostet (keine Anfragen an Google Fonts, Datenschutz).
import '@fontsource-variable/inter';
import 'katex/dist/katex.min.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
