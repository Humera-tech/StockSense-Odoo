import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPath, setLastPath] = useState(location.pathname);

  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64 print:pl-0">
        <Header onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
