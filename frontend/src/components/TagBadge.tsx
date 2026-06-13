import { cn } from "../styles/ui";

interface TagBadgeProps {
  label: string;
  selected?: boolean;
}

export default function TagBadge({ label, selected = false }: TagBadgeProps) {
  const className = cn(
    "inline-flex min-h-8 items-center rounded-md border px-3 text-base font-medium leading-none transition",
    selected
      ? "border-mint bg-mint text-white"
      : "border-line bg-white text-muted hover:border-mint/50 hover:text-mint-dark",
  );
  const displayLabel = String(label || "태그");

  return <span className={className}>{displayLabel.startsWith("#") ? displayLabel : `#${displayLabel}`}</span>;
}
