import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer.jsx';

/**
 * Wraps all main routes so the marketing footer appears on every page.
 */
export default function AppShell() {
  const location = useLocation();

  useLayoutEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.hash, location.key]);

  return (
    <div className="app-shell">
      <div className="app-shell-main">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
