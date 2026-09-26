import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import AuthLayout, { AuthField, AuthMessage, PasswordField } from "../../components/auth/AuthLayout";
import PasswordChecklist from "../../components/auth/PasswordChecklist";
import { ArrowRightIcon, KeyIcon, LockIcon } from "../../components/ui/icons";
import { isPasswordValid } from "../../lib/validation";
import { ApiError, errorMessage } from "../../services/api";
import { authService } from "../../services/authService";

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!/^\d{6}$/.test(otp.trim())) next.otp = "Enter the 6-digit code";
    if (!isPasswordValid(password)) next.password = "Password does not meet all the rules below";
    if (password !== confirmPassword) next.confirm_password = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await authService.reset({ email, otp: otp.trim(), password, confirm_password: confirmPassword });
      navigate("/login", { replace: true, state: { notice: "Password updated. Log in with your new password." } });
    } catch (err) {
      setErrors(err instanceof ApiError && err.field ? { [err.field]: err.message } : { form: errorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setErrors({});
    setInfo(null);
    try {
      const response = await authService.forgot(email);
      setDevOtp(response.dev_otp);
      setInfo("A new code has been sent.");
    } catch (err) {
      setErrors({ form: errorMessage(err) });
    }
  };

  return (
    <AuthLayout
      title="Enter your"
      accent="code"
      subtitle={`If ${email} is registered, a 6-digit code was sent to it. It expires in 10 minutes.`}
      footer={
        <div className="flex items-center justify-between">
          <button type="button" onClick={resend} className="font-semibold text-brand hover:text-brand-strong">
            Resend code
          </button>
          <Link to="/login" className="hover:text-ink">
            Back to log in
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {devOtp && (
          <AuthMessage tone="info">
            Offline demo mode — your code is <span className="font-mono font-bold tracking-widest">{devOtp}</span>
          </AuthMessage>
        )}
        {info && <AuthMessage tone="success">{info}</AuthMessage>}
        {errors.form && <AuthMessage tone="error">{errors.form}</AuthMessage>}

        <AuthField
          icon={<KeyIcon />}
          aria-label="Verification code"
          placeholder="6-digit code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="font-mono tracking-[0.4em]"
          error={errors.otp}
        />
        <div>
          <PasswordField
            icon={<LockIcon />}
            aria-label="New password"
            placeholder="New password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <PasswordChecklist password={password} />
        </div>
        <PasswordField
          icon={<LockIcon />}
          aria-label="Re-enter password"
          placeholder="Re-enter password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirm_password}
        />
        <button type="submit" disabled={submitting} className="btn btn-primary h-13 w-full text-base">
          {submitting ? "Updating…" : "Reset password"}
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </form>
    </AuthLayout>
  );
}
