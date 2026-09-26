import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import AuthLayout, { AuthField, AuthMessage, PasswordField } from "../../components/auth/AuthLayout";
import { ArrowRightIcon, LockIcon, UserIcon } from "../../components/ui/icons";
import { useAuth } from "../../context/auth";
import { errorMessage } from "../../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const state = location.state as { from?: string; notice?: string } | null;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={state?.from ?? "/dashboard"} replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(identifier.trim(), password, rememberMe);
      navigate(state?.from ?? "/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome"
      accent="back"
      subtitle="Log in to manage your inventory and operations."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-brand hover:text-brand-strong">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {state?.notice && <AuthMessage tone="success">{state.notice}</AuthMessage>}
        {error && <AuthMessage tone="error">{error}</AuthMessage>}

        <AuthField
          icon={<UserIcon />}
          aria-label="Login ID or email"
          placeholder="Login ID or email"
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <PasswordField
          icon={<LockIcon />}
          aria-label="Password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between gap-4 pt-1 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-muted">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-[var(--brand)]"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-brand hover:text-brand-strong">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary h-13 w-full text-base">
          {submitting ? "Logging in…" : "Log in"}
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </form>
    </AuthLayout>
  );
}
