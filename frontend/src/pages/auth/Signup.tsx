import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PasswordChecklist from "../../components/auth/PasswordChecklist";
import { isEmailValid, isPasswordValid, loginIdError } from "../../lib/validation";
import { ApiError, errorMessage } from "../../services/api";
import { authService } from "../../services/authService";

const inputClass = (invalid: boolean) =>
  `w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
    invalid
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
  }`;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-2 text-xs font-medium text-red-500">{message}</p> : null;
}

function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.name = "Enter your name";
    const loginIdProblem = loginIdError(loginId);
    if (loginIdProblem) errs.login_id = loginIdProblem;
    if (!isEmailValid(email)) errs.email = "Enter a valid email";
    if (!isPasswordValid(password)) errs.password = "Password does not meet all the rules below";
    if (password !== confirmPassword) errs.confirm_password = "Passwords do not match";
    if (!agreeTerms) errs.terms = "Please accept the terms to continue";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await authService.signup({
        login_id: loginId.trim(),
        email,
        name: fullName,
        password,
        confirm_password: confirmPassword,
      });
      navigate("/login", { state: { notice: "Account created. Sign in with your Login ID." } });
    } catch (err) {
      setErrors(err instanceof ApiError && err.field ? { [err.field]: err.message } : { form: errorMessage(err) });
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
              Manage your inventory
              <span className="block text-slate-400">
                with confidence.
              </span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              Create your workspace and keep products, stock levels and
              operations organized in one place.
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
          RIGHT SIDE — LIGHT THEME (SIGNUP FORM)
      ===================================================== */}
      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
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
              Get started
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Create your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Set up your StockSense workspace and start managing inventory.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            {errors.form && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errors.form}
              </p>
            )}

            {/* Full name */}
            <div>
              <label
                htmlFor="full-name"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Full name
              </label>

              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                required
                className={inputClass(!!errors.name)}
              />
              <FieldError message={errors.name} />
            </div>

            {/* Login ID */}
            <div>
              <label
                htmlFor="login-id"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Login ID
              </label>

              <input
                id="login-id"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="6–12 characters"
                autoComplete="username"
                required
                className={inputClass(!!errors.login_id)}
              />
              <FieldError message={errors.login_id} />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Email address
              </label>

              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className={inputClass(!!errors.email)}
              />
              <FieldError message={errors.email} />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
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

              <FieldError message={errors.password} />
              <PasswordChecklist password={password} />
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
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

              {confirmPassword && password !== confirmPassword ? (
                <FieldError message="Passwords do not match" />
              ) : (
                <FieldError message={errors.confirm_password} />
              )}
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-2 pt-1 text-xs leading-5 text-slate-500">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />

              <span>
                I agree to the StockSense{" "}
                <span className="font-semibold text-indigo-600">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="font-semibold text-indigo-600">
                  Privacy Policy
                </span>
                .
              </span>
            </label>
            <FieldError message={errors.terms} />

            {/* Signup button */}
            <button
              type="submit"
              disabled={submitting}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create account"}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Login link card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="mt-1 inline-block text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Sign in to StockSense →
            </Link>
          </div>

          {/* Back link */}
          <div className="mt-5 text-center">
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

export default Signup;