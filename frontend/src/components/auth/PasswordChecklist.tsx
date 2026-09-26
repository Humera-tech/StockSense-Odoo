import { passwordRules } from "../../lib/validation";

export default function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
      {passwordRules.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.label} className={ok ? "text-emerald-600" : "text-slate-400"}>
            {ok ? "✓" : "○"} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
