import type { ComponentType, SVGProps } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/auth";
import { initialsOf } from "../../lib/format";
import Logo from "../brand/Logo";
import {
  BoxIcon,
  CloseIcon,
  DashboardIcon,
  LogoutIcon,
  PinIcon,
  ReceiptIcon,
  TruckIcon,
  WarehouseIcon,
} from "../ui/icons";

type NavItem = { label: string; to: string; icon: ComponentType<SVGProps<SVGSVGElement>> };

const NAV: { section?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: "Dashboard", to: "/dashboard", icon: DashboardIcon },
      { label: "Products", to: "/stock", icon: BoxIcon },
      { label: "Receipts", to: "/receipts", icon: ReceiptIcon },
      { label: "Delivery Orders", to: "/deliveries", icon: TruckIcon },
    ],
  },
  {
    section: "Configuration",
    items: [
      { label: "Warehouses", to: "/settings/warehouses", icon: WarehouseIcon },
      { label: "Locations", to: "/settings/locations", icon: PinIcon },
    ],
  },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden print:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-200 lg:translate-x-0 print:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-18 items-center justify-between border-b border-line px-5">
          <Logo size="sm" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-muted hover:bg-subtle hover:text-ink lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAV.map((group, i) => (
            <div key={group.section ?? i}>
              {group.section && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted/80">
                  {group.section}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(({ label, to, icon: ItemIcon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-brand-soft font-semibold text-brand"
                          : "text-ink/75 hover:bg-subtle hover:text-ink"
                      }`
                    }
                  >
                    <ItemIcon className="h-5 w-5 shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundImage: "linear-gradient(135deg, var(--brand-from), var(--brand-to))" }}
            >
              {initialsOf(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-xs text-muted">{user?.login_id}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              aria-label="Log out"
              title="Log out"
              className="rounded-lg p-2 text-muted transition hover:bg-rose-500/10 hover:text-rose-600"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
