import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout, { AuthField, AuthMessage, PasswordField } from "../../components/auth/AuthLayout";
import PasswordChecklist from "../../components/auth/PasswordChecklist";
import { ArrowRightIcon, KeyIcon, LockIcon, MailIcon, UserIcon } from "../../components/ui/icons";
import { isEmailValid, isPasswordValid, loginIdError } from "../../lib/validation";
import { ApiError, errorMessage } from "../../services/api";
import { authService } from "../../services/authService";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const mismatch = confirmPassword !== "" && password !== confirmPassword;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Enter your name";
    const loginIdProblem = loginIdError(loginId);
    if (loginIdProblem) next.login_id = loginIdProblem;
    if (!isEmailValid(email)) next.email = "Enter a valid email";
    if (!isPasswordValid(password)) next.password = "Password does not meet all the rules below";
    if (password !== confirmPassword) next.confirm_password = "Passwords do not match";
    if (!agreeTerms) next.terms = "Please accept the terms to continue";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await authService.signup({
        login_id: loginId.trim(),
        email: email.trim(),
        name: name.trim(),
        password,
        confirm_password: confirmPassword,
      });
      navigate("/login", { state: { notice: "Account created. Log in with your Login ID." } });
    } catch (err) {
      setErrors(err instanceof ApiError && err.field ? { [err.field]: err.message } : { form: errorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create"
      accent="account"
      subtitle="Set up your StockSense workspace in a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand hover:text-brand-strong">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {errors.form && <AuthMessage tone="error">{errors.form}</AuthMessage>}

        <AuthField
          icon={<UserIcon />}
          aria-label="Full name"
          placeholder="Full name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <AuthField
          icon={<KeyIcon />}
          aria-label="Login ID"
          placeholder="Login ID (6–12 characters)"
          autoComplete="username"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          error={errors.login_id}
        />
        <AuthField
          icon={<MailIcon />}
          type="email"
          aria-label="Email address"
          placeholder="Email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <div>
          <PasswordField
            icon={<LockIcon />}
            aria-label="Password"
            placeholder="Password"
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
          error={mismatch ? "Passwords do not match" : errors.confirm_password}
        />

        <div>
          <label className="flex cursor-pointer items-start gap-2 pt-1 text-xs leading-5 text-muted">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-[var(--brand)]"
            />
            <span>
              I agree to the StockSense <span className="font-semibold text-brand">Terms of Service</span> and{" "}
              <span className="font-semibold text-brand">Privacy Policy</span>.
            </span>
          </label>
          {errors.terms && <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{errors.terms}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary h-13 w-full text-base">
          {submitting ? "Creating account…" : "Create account"}
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </form>
    </AuthLayout>
  );
}
