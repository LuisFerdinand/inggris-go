// app/(home)/blog/blog-theme.ts
// Shared per-tag color theme, used by the public blog detail page AND the
// dashboard editor's preview so both places render the same accent colors.

export const TAG_THEME: Record<
  string,
  { gradient: string; border: string; accent: string; text: string; pill: string }
> = {
  beginner:          { gradient: "from-blue-600 to-indigo-700",    border: "border-l-blue-500",   accent: "#1e6eee", text: "text-blue-600",   pill: "bg-blue-50 text-blue-700 border-blue-200" },
  "daily-conversation": { gradient: "from-teal-500 to-cyan-700",   border: "border-l-teal-500",   accent: "#2db8b0", text: "text-teal-600",   pill: "bg-teal-50 text-teal-700 border-teal-200" },
  "grammar-basics":  { gradient: "from-teal-500 to-cyan-700",      border: "border-l-teal-500",   accent: "#2db8b0", text: "text-teal-600",   pill: "bg-teal-50 text-teal-700 border-teal-200" },
  confidence:        { gradient: "from-violet-500 to-purple-700",  border: "border-l-violet-500", accent: "#8b5cf6", text: "text-violet-600", pill: "bg-violet-50 text-violet-700 border-violet-200" },
  vocabulary:        { gradient: "from-orange-500 to-red-600",     border: "border-l-orange-500", accent: "#ff6b35", text: "text-orange-600", pill: "bg-orange-50 text-orange-700 border-orange-200" },
  "speaking-tips":   { gradient: "from-blue-600 to-indigo-700",    border: "border-l-blue-500",   accent: "#1e6eee", text: "text-blue-600",   pill: "bg-blue-50 text-blue-700 border-blue-200" },
  "study-habits":    { gradient: "from-emerald-500 to-teal-600",   border: "border-l-emerald-500",accent: "#10b981", text: "text-emerald-600",pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export const DEFAULT_THEME = {
  gradient: "from-slate-600 to-slate-800",
  border: "border-l-slate-400",
  accent: "#64748b",
  text: "text-slate-600",
  pill: "bg-slate-50 text-slate-600 border-slate-200",
};

export function getTheme(slug?: string) {
  if (!slug) return DEFAULT_THEME;
  return TAG_THEME[slug] ?? DEFAULT_THEME;
}
