import { useAuth } from "../../context/auth";
import { useTheme } from "../../context/theme";
import Logo from "../brand/Logo";
import { MenuIcon, MoonIcon, SunIcon } from "../ui/icons";

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function Header({ onMenu }: { onMenu: () => void }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open menu"
          className="rounded-lg p-2 text-muted hover:bg-subtle hover:text-ink lg:hidden"
        >
          <MenuIcon />
        </button>
        <div className="lg:hidden">
          <Logo size="sm" tagline={false} />
        </div>

        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-ink">Hello, {user?.name?.split(" ")[0]}</p>
          <p className="text-xs text-muted">{today}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
            title={isLight ? "Switch to dark theme" : "Switch to light theme"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition hover:bg-subtle hover:text-ink"
          >
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
