import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import PasswordChecklist from "../../components/auth/PasswordChecklist";
import { isPasswordValid } from "../../lib/validation";
import { ApiError, errorMessage } from "../../services/api";
import { authService } from "../../services/authService";

const inputClass = (invalid: boolean) =>
  `w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
    invalid
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
  }`;

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; devOtp?: string | null } | null;

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devOtp, setDevOtp] = useState(state?.devOtp ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!state?.email) return <Navigate to="/forgot-password" replace />;
  const email = state.email;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!/^\d{6}$/.test(otp.trim())) errs.otp = "Enter the 6-digit code";
    if (!isPasswordValid(password)) errs.password = "Password does not meet all the rules below";
    if (password !== confirmPassword) errs.confirm_password = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await authService.reset({ email, otp: otp.trim(), password, confirm_password: confirmPassword });
      navigate("/login", { replace: true, state: { notice: "Password updated. Sign in with your new password." } });
    } catch (err) {
      setErrors(err instanceof ApiError && err.field ? { [err.field]: err.message } : { form: errorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setErrors({});
    try {
      const response = await authService.forgot(email);
      setDevOtp(response.dev_otp);
      setInfo("A new code has been sent.");
    } catch (err) {
      setErrors({ form: errorMessage(err) });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            S
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-950">StockSense</span>
        </Link>

        <p className="text-sm font-medium text-indigo-600">Reset password</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Enter your code</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          If <span className="font-semibold text-slate-700">{email}</span> is registered, a 6-digit code was sent to it.
          It expires in 10 minutes.
        </p>

        {devOtp && (
          <p className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            Offline demo mode — your code is <span className="font-mono font-bold tracking-widest">{devOtp}</span>
          </p>
        )}
        {info && <p className="mt-4 text-sm text-emerald-600">{info}</p>}

        <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
          {errors.form && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {errors.form}
            </p>
          )}

          <div>
            <label htmlFor="otp" className="mb-2 block text-sm font-medium text-slate-800">
              Verification code
            </label>
            <input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className={`${inputClass(!!errors.otp)} font-mono tracking-[0.4em]`}
            />
            {errors.otp && <p className="mt-2 text-xs font-medium text-red-500">{errors.otp}</p>}
          </div>

          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-800">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass(!!errors.password)}
            />
            {errors.password && <p className="mt-2 text-xs font-medium text-red-500">{errors.password}</p>}
            <PasswordChecklist password={password} />
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="mb-2 block text-sm font-medium text-slate-800">
              Re-enter password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass(!!errors.confirm_password)}
            />
            {errors.confirm_password && (
              <p className="mt-2 text-xs font-medium text-red-500">{errors.confirm_password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60"
          >
            {submitting ? "Updating…" : "Reset password"}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <button type="button" onClick={resend} className="font-semibold text-indigo-600 hover:text-indigo-700">
            Resend code
          </button>
          <Link to="/login" className="text-slate-400 hover:text-slate-700">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
