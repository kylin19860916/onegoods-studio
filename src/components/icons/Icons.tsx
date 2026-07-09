import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return <IconBase {...props}><path d="M7 9h10l-.8 10H7.8L7 9Z" /><path d="M9 9a3 3 0 0 1 6 0" /></IconBase>;
}

export function ArrowIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></IconBase>;
}

export function HeartIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.4A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z" /></IconBase>;
}

export function PressIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 4v8" /><path d="M8 8l4 4 4-4" /><path d="M5 17c2.2 1.5 11.8 1.5 14 0" /></IconBase>;
}

export function SpinIcon(props: IconProps) {
  return <IconBase {...props}><path d="M7 7a7 7 0 0 1 10 0" /><path d="M17 7h-4" /><path d="M17 7v-4" /><path d="M17 17a7 7 0 0 1-10 0" /><path d="M7 17h4" /><path d="M7 17v4" /></IconBase>;
}

export function PushIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 12h10" /><path d="m10 8 4 4-4 4" /><path d="M19 5v14" /></IconBase>;
}

export function DeskIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 7h16v9H4z" /><path d="M9 20h6" /><path d="M12 16v4" /></IconBase>;
}

export function GiftIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 10h16v10H4z" /><path d="M12 10v10" /><path d="M3 7h18v3H3z" /><path d="M12 7c-2.8 0-4-1-4-2.2C8 3.8 8.8 3 9.8 3 11.5 3 12 7 12 7Z" /><path d="M12 7s.5-4 2.2-4C15.2 3 16 3.8 16 4.8 16 6 14.8 7 12 7Z" /></IconBase>;
}

export function PrinterIcon(props: IconProps) {
  return <IconBase {...props}><path d="M7 8V4h10v4" /><path d="M6 18H4v-7h16v7h-2" /><path d="M7 14h10v6H7z" /><path d="M17 12h.01" /></IconBase>;
}

export function FlaskIcon(props: IconProps) {
  return <IconBase {...props}><path d="M9 3h6" /><path d="M10 3v5l-4 9a3 3 0 0 0 2.8 4h6.4A3 3 0 0 0 18 17l-4-9V3" /><path d="M8 15h8" /></IconBase>;
}
