export const passwordRules = [
  { label: "More than 8 characters", test: (p: string) => p.length > 8 },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function isPasswordValid(password: string): boolean {
  return passwordRules.every((rule) => rule.test(password));
}

export function isEmailValid(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
}

export function loginIdError(loginId: string): string | null {
  const value = loginId.trim();
  if (value.length < 6 || value.length > 12) return "Login ID must be 6–12 characters";
  if (/\s/.test(value)) return "Login ID cannot contain spaces";
  return null;
}
