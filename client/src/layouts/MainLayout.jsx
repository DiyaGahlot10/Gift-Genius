import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function MainLayout() {
  const { pathname } = useLocation();

  // Start every page at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Navbar />
      <main id="main" key={pathname} className="page-enter flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
