import { IconKey, ICONS } from "@/lib/icons";

const DEFAULT_ICON: IconKey = "circle";

export function Icon({
  name,
  fallback = DEFAULT_ICON,
  className,
  style,
}: {
  name?: IconKey;
  fallback?: IconKey;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (name && !ICONS[name]) {
    console.warn(`Icon "${name}" not found in ICONS`);
  }

  const LucideIcon =
    (name && ICONS[name]) || ICONS[fallback] || ICONS[DEFAULT_ICON];

  return <LucideIcon className={className} style={style} />;
}
