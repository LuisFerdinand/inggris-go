import * as Icons from "lucide-react";

const DEFAULT_ICON = "Circle";

function toPascalCase(str: string) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export function Icon({
  name,
  className,
  style,
}: {
  name?: string | null;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!name) {
    const Fallback = (Icons as any)[DEFAULT_ICON];
    return <Fallback className={className} style={style} />;
  }

  const formatted = toPascalCase(name);
  const LucideIcon = (Icons as any)[formatted];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`);
    const Fallback = (Icons as any)[DEFAULT_ICON];
    return <Fallback className={className} style={style} />;
  }

  return <LucideIcon className={className} style={style} />;
}
