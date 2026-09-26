import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, className = "h-5 w-5", ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export const DashboardIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h5v-6h4v6h5V9.5" />
  </Icon>
);

export const BoxIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5" />
    <path d="M12 13v8" />
  </Icon>
);

export const ReceiptIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Icon>
);

export const TruckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h11v10H3z" />
    <path d="M14 10h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </Icon>
);

export const WarehouseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 21V9l9-5 9 5v12" />
    <path d="M7 21v-8h10v8M7 17h10" />
  </Icon>
);

export const PinIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Icon>
);

export const SwapIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8h14l-3-3M20 16H6l3 3" />
  </Icon>
);

export const ChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Icon>
);

export const AlertIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 10v4M12 17h.01" />
  </Icon>
);

export const ClockIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const LayersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Icon>
);

export const CoinsIcon = (p: IconProps) => (
  <Icon {...p}>
    <ellipse cx="12" cy="6" rx="7" ry="3" />
    <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
    <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
  </Icon>
);

export const UserIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </Icon>
);

export const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);

export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Icon>
);

export const KeyIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 9-9M17 6l3 3" />
  </Icon>
);

export const EyeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const EyeOffIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.5" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </Icon>
);

export const SunIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);

export const MoonIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </Icon>
);

export const LogoutIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H3" />
  </Icon>
);

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const ResetIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </Icon>
);
