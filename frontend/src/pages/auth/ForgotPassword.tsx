import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { isEmailValid } from "../../lib/validation";
import { errorMessage } from "../../services/api";
import { authService } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEmailValid(email)) {
      setError("Enter a valid email");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const response = await authService.forgot(email);
      navigate("/verify-otp", { state: { email: email.trim(), devOtp: response.dev_otp } });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* LEFT — Dark */}
      <section className="relative hidden overflow-hidden bg-[#0f172a] lg:flex">
        <div className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                S
              </div>

              <span className="text-xl font-semibold tracking-tight text-white">
                StockSense
              </span>
            </div>

            <div className="mt-28 max-w-md">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
                Account Recovery
              </p>

              <h1 className="text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Get back into
                <span className="block text-slate-400">
                  your StockSense account.
                </span>
              </h1>

              <p className="mt-6 max-w-sm text-base leading-7 text-slate-400">
                Enter your registered email address and we'll send you a
                one-time verification code to reset your password.
              </p>

              <div className="mt-10 flex items-center gap-2">
                <div className="h-1.5 w-14 rounded-full bg-indigo-500" />
                <div className="h-1.5 w-7 rounded-full bg-slate-700" />
                <div className="h-1.5 w-7 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            Inventory visibility. Smarter operations.
          </p>
        </div>
      </section>

      {/* RIGHT — Light */}
      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              S
            </div>

            <span className="text-xl font-semibold tracking-tight text-slate-950">
              StockSense
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-indigo-600">
              Reset password
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Forgot your password?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              No worries. Enter your email address and we'll send you a
              one-time password to verify your identity.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send OTP"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Login */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Back */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-sm text-slate-400 transition hover:text-slate-700"
            >
              ← Back to StockSense
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}