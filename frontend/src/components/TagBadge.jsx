export default function TagBadge({ label }) {
  // TODO: tag_type에 따라 슬라임 종류, 실패 증상, 질감 태그 스타일을 다르게 표시한다.
  return <span className="tag-badge">{label}</span>;
}
