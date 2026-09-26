import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout, { AuthField, AuthMessage } from "../../components/auth/AuthLayout";
import { ArrowRightIcon, MailIcon } from "../../components/ui/icons";
import { isEmailValid } from "../../lib/validation";
import { errorMessage } from "../../services/api";
import { authService } from "../../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
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
    <AuthLayout
      title="Forgot"
      accent="password?"
      subtitle="Enter your registered email and we'll send you a 6-digit code to reset it."
      footer={
        <>
          Remember it?{" "}
          <Link to="/login" className="font-semibold text-brand hover:text-brand-strong">
            Back to log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && <AuthMessage tone="error">{error}</AuthMessage>}
        <AuthField
          icon={<MailIcon />}
          type="email"
          aria-label="Email address"
          placeholder="Email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={submitting} className="btn btn-primary h-13 w-full text-base">
          {submitting ? "Sending…" : "Send code"}
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </form>
    </AuthLayout>
  );
}
