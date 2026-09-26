export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M30 5 7 18v40" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" className="text-ink" />
      <path d="M34 5 57 18v40" fill="none" stroke="var(--brand)" strokeWidth="6" strokeLinejoin="round" />
      <path d="M15 57V25l17-9.5L49 25" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" className="text-ink" />
      <rect x="21" y="30" width="15" height="12" rx="1.5" fill="#e9bd93" />
      <rect x="26" y="30" width="4" height="4" fill="#8a4a20" opacity="0.55" />
      <rect x="31" y="43" width="16" height="14" rx="1.5" fill="#d99760" />
      <rect x="37" y="43" width="4" height="4" fill="#7a3f18" opacity="0.55" />
      <rect x="19" y="44" width="11" height="13" rx="1.5" fill="#b8672f" />
    </svg>
  );
}

export default function Logo({
  size = "md",
  tagline = true,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  tagline?: boolean;
  className?: string;
}) {
  const mark = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" }[size];
  const word = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" }[size];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className={`${mark} shrink-0`} />
      <div className="leading-none">
        <p className={`${word} font-extrabold tracking-tight`}>
          <span className="text-ink">Stock</span>
          <span className="text-brand">Sense</span>
        </p>
        {tagline && (
          <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.28em] text-muted">
            Inventory · Operations · Clarity
          </p>
        )}
      </div>
    </div>
  );
}
