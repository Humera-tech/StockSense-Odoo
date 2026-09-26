import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import bgDark from "../../assets/auth-bg-dark.webp";
import bgLight from "../../assets/auth-bg-light.webp";
import { useTheme } from "../../context/theme";
import Logo from "../brand/Logo";
import { BoxIcon, ChartIcon, EyeIcon, EyeOffIcon, MoonIcon, ReceiptIcon, SunIcon, SwapIcon } from "../ui/icons";

const FEATURES = [
  { icon: BoxIcon, title: "Real-time", subtitle: "Stock Tracking" },
  { icon: ReceiptIcon, title: "Receipts &", subtitle: "Delivery Orders" },
  { icon: SwapIcon, title: "Multi-warehouse", subtitle: "Support" },
  { icon: ChartIcon, title: "Insights &", subtitle: "Smart Alerts" },
];

export default function AuthLayout({
  title,
  accent,
  subtitle,
  children,
  footer,
}: {
  title: string;
  accent?: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <img src={bgLight} alt="" className="absolute inset-0 h-full w-full object-cover dark:hidden" />
      <img src={bgDark} alt="" className="absolute inset-0 hidden h-full w-full object-cover dark:block" />
      <div className="absolute inset-0 bg-gradient-to-b from-canvas/95 via-canvas/80 to-canvas/60 lg:bg-gradient-to-r lg:from-canvas lg:via-canvas/85 lg:to-canvas/10" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <Logo size="md" />
          <div className="flex items-center gap-5">
            <p className="hidden text-right text-[11px] font-medium uppercase leading-5 tracking-[0.3em] text-muted xl:block">
              Smart inventory
              <br />
              Stronger business
            </p>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface/70 text-muted backdrop-blur transition hover:text-ink"
            >
              {isLight ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </div>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16">
          <section className="hidden max-w-xl lg:block">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-ink xl:text-6xl">
              From Stock
              <br />
              to <span className="text-brand">Smarter</span>
              <br />
              Business
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-muted">
              Manage inventory, track operations and keep your business moving — all in one place.
            </p>
            <div className="mt-10 grid max-w-lg grid-cols-2 gap-5">
              {FEATURES.map(({ icon: FeatureIcon, title: t, subtitle: s }) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-surface/70 text-brand backdrop-blur">
                    <FeatureIcon className="h-6 w-6" />
                  </div>
                  <p className="text-sm leading-5 text-ink/85">
                    {t}
                    <br />
                    {s}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-md rounded-3xl border border-line bg-surface/90 p-7 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-9 lg:max-w-none">
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {title} {accent && <span className="text-brand">{accent}</span>}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-7 text-center text-sm text-muted">{footer}</div>}
          </section>
        </div>
      </div>
    </div>
  );
}

export function AuthMessage({ tone, children }: { tone: "error" | "success" | "info"; children: ReactNode }) {
  const styles = {
    error: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    info: "border-brand/30 bg-brand-soft text-ink",
  }[tone];
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}>
      {children}
    </p>
  );
}

export function AuthField({
  icon,
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode; error?: string }) {
  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        <input
          {...props}
          aria-invalid={!!error || undefined}
          className={`input h-13 pl-12 text-[15px] ${error ? "input-invalid" : ""} ${className}`}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}

export function PasswordField({
  icon,
  error,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { icon: ReactNode; error?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        <input
          {...props}
          type={visible ? "text" : "password"}
          aria-invalid={!!error || undefined}
          className={`input h-13 pl-12 pr-12 text-[15px] ${error ? "input-invalid" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:text-ink"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
