import { Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';

/**
 * Wraps all main routes so the marketing footer appears on every page.
 */
export default function AppShell() {
  return (
    <div className="app-shell">
      <div className="app-shell-main">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
