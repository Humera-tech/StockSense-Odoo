import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/auth";

interface MenuItem {
  label: string;
  to?: string;
  children?: { label: string; to: string }[];
}

const MENU: MenuItem[] = [
  { label: "Dashboard", to: "/dashboard" },
  {
    label: "Operations",
    children: [
      { label: "Receipts", to: "/receipts" },
      { label: "Deliveries", to: "/deliveries" },
    ],
  },
  { label: "Stock", to: "/stock" },
  {
    label: "Settings",
    children: [
      { label: "Warehouses", to: "/settings/warehouses" },
      { label: "Locations", to: "/settings/locations" },
    ],
  },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPath, setLastPath] = useState(location.pathname);
  const navRef = useRef<HTMLDivElement>(null);

  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const initials = (user?.name ?? "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isGroupActive = (item: MenuItem) => item.children?.some((child) => location.pathname.startsWith(child.to));

  return (
    <header ref={navRef} className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            S
          </div>
          <span className="text-base font-semibold text-slate-900">StockSense</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {MENU.map((item) =>
            item.to ? (
              <NavLink key={item.label} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ) : (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  aria-expanded={openMenu === item.label}
                  onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                  className={linkClass({ isActive: !!isGroupActive(item) })}
                >
                  {item.label} <span className="text-xs">▾</span>
                </button>
                {openMenu === item.label && (
                  <div className="absolute left-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    {item.children!.map((child) => (
                      <NavLink key={child.to} to={child.to} className={(s) => `block ${linkClass(s)}`}>
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </nav>

        <div className="relative ml-auto hidden md:block">
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={openMenu === "account"}
            onClick={() => setOpenMenu(openMenu === "account" ? null : "account")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white"
          >
            {initials}
          </button>
          {openMenu === "account" && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.login_id}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Log out
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="ml-auto rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-200 px-4 py-3 md:hidden">
          {MENU.flatMap((item) => (item.to ? [{ label: item.label, to: item.to }] : item.children!)).map((link) => (
            <NavLink key={link.to} to={link.to} className={(s) => `block ${linkClass(s)}`}>
              {link.label}
            </NavLink>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 px-3 pt-3">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-sm font-semibold text-rose-600"
            >
              Log out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
