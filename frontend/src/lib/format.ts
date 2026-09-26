export function formatDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMoney(value: number): string {
  return value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
}

export function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function productLabel(product: { sku: string; name: string }): string {
  return `[${product.sku}] ${product.name}`;
}

export function initialsOf(name: string | undefined): string {
  return (name ?? "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
