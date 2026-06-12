import { cn } from "../styles/ui";

interface TagBadgeProps {
  label: string;
  selected?: boolean;
}

export default function TagBadge({ label, selected = false }: TagBadgeProps) {
  const className = cn(
    "inline-flex min-h-8 items-center rounded-full border px-3.5 text-base font-bold leading-none transition",
    selected
      ? "border-mint bg-mint text-white"
      : "border-line bg-white text-muted hover:border-mint/50 hover:text-mint-dark",
  );
  const displayLabel = String(label || "태그");

  return <span className={className}>{displayLabel.startsWith("#") ? displayLabel : `#${displayLabel}`}</span>;
}
