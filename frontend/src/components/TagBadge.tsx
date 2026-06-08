interface TagBadgeProps {
  label: string;
  selected?: boolean;
}

export default function TagBadge({ label, selected = false }: TagBadgeProps) {
  const className = selected ? "tag-badge is-selected" : "tag-badge";
  const displayLabel = String(label || "태그");

  return <span className={className}>{displayLabel.startsWith("#") ? displayLabel : `#${displayLabel}`}</span>;
}
