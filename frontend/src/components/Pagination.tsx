interface PaginationProps {
  page?: number;
  totalPages?: number;
  onChange?: (page: number) => void;
}

export default function Pagination({ page = 1, totalPages = 1, onChange }: PaginationProps) {
  // TODO: 이전/다음 버튼, 현재 페이지, 전체 페이지를 표시한다.
  return (
    <div className="pagination">
      <button type="button" onClick={() => onChange?.(page - 1)}>이전</button>
      <span>{page} / {totalPages}</span>
      <button type="button" onClick={() => onChange?.(page + 1)}>다음</button>
    </div>
  );
}
