import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Register Service Worker for PWA with scope '/'
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('HOFANTRANO ServiceWorker nisoratra soa aman-tsara:', reg.scope);
      })
      .catch((err) => {
        console.warn('HOFANTRANO ServiceWorker error:', err);
      });
  });
}
