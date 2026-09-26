import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/auth";
import { errorMessage } from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const state = location.state as { from?: string; notice?: string } | null;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={state?.from ?? "/dashboard"} replace />;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(identifier, password, rememberMe);
      navigate(state?.from ?? "/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* =====================================================
          LEFT SIDE — DARK THEME
      ===================================================== */}
      <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
        {/* Dark theme background glow effects */}
        <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-10 xl:p-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm">
              S
            </div>

            <span className="text-base font-semibold text-white">
              StockSense
            </span>
          </Link>

          {/* Main content */}
          <div className="max-w-md">
            <p className="mb-4 text-sm font-medium text-indigo-400">
              Inventory management
            </p>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
              Keep your inventory
              <span className="block text-slate-400">
                simple and organized.
              </span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              Manage products, stock levels and inventory operations from one
              organized workspace.
            </p>

            {/* Minimal visual */}
            <div className="mt-10 flex items-center gap-3">
              <div className="h-1.5 w-16 rounded-full bg-indigo-500" />
              <div className="h-1.5 w-8 rounded-full bg-slate-800" />
              <div className="h-1.5 w-4 rounded-full bg-slate-800" />
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-500">
            © 2026 StockSense
          </p>
        </div>
      </section>

      {/* =====================================================
          RIGHT SIDE — LIGHT THEME (LOGIN FORM)
      ===================================================== */}
      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm">
                S
              </div>

              <span className="text-base font-semibold text-slate-900">
                StockSense
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Welcome back
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Sign in to StockSense
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your credentials to access your inventory workspace.
            </p>
          </div>

          {state?.notice && (
            <p role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {state.notice}
            </p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            {/* Login ID */}
            <div>
              <label
                htmlFor="login-id"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Login ID or email
              </label>

              <input
                id="login-id"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Your Login ID"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-sm font-semibold text-slate-800"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remember me
            </label>

            {/* Login button */}
            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Signup link card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?
            </p>

            <Link
              to="/signup"
              className="mt-1 inline-block text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Create your StockSense account →
            </Link>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs font-medium text-slate-400 transition hover:text-slate-700"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;