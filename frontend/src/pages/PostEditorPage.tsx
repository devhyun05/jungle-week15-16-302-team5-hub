export default function PostEditorPage() {
  return (
    <section className="page-stack">
      <div className="page-header">
        <h1>새 게시글 작성</h1>
        <p className="muted">슬라임 연구 게시판</p>
      </div>

      <form className="form-card">
        <label className="form-group">
          <span className="form-label">카테고리</span>
          <div className="chip-row">
            <span className="chip is-selected">레시피 공유</span>
            <span className="chip">실패 질문</span>
            <span className="chip">후기</span>
            <span className="chip">팁</span>
          </div>
        </label>

        <label className="form-group">
          <span className="form-label">제목</span>
          <input className="field" placeholder="게시글 제목을 입력하세요" />
        </label>

        <label className="form-group">
          <span className="form-label">재료</span>
          <input className="field" placeholder="예: Elmer's 클리어 글루 100ml, 봉사수 활성제, 글리터" />
          <span className="meta">쉼표로 구분해서 입력해주세요.</span>
        </label>

        <label className="form-group">
          <span className="form-label">점도</span>
          <div className="chip-row">
            {["매우 묽음", "묽음", "보통", "진함", "매우 진함"].map((label) => (
              <span className={label === "보통" ? "chip is-selected" : "chip"} key={label}>{label}</span>
            ))}
          </div>
        </label>

        <label className="form-group">
          <span className="form-label">실패 증상</span>
          <input className="field" placeholder="예: 자꾸 끊김, 너무 끈적함, 거품이 생김, 색이 탁해짐" />
          <span className="meta">실패 질문 카테고리에서 AI 진단을 받을 수 있어요.</span>
        </label>

        <label className="form-group">
          <span className="form-label">본문</span>
          <textarea className="textarea" placeholder="레시피, 과정, 결과, 질문을 자세히 적어주세요." />
        </label>

        <div className="form-group">
          <span className="form-label">태그</span>
          <div className="chip-row">
            <span className="chip is-selected">#클리어슬라임</span>
            <span className="chip">#버터슬라임</span>
            <span className="chip">#크런치슬라임</span>
            <span className="chip">#물먹음</span>
            <span className="chip">#끈적임</span>
          </div>
        </div>

        <div className="surface-card">
          <p className="feature-link">사진을 드래그하거나 클릭해서 업로드</p>
          <p className="meta">PNG, JPG, GIF · 최대 10MB · 최대 5장</p>
        </div>

        <div className="form-actions">
          <button className="ghost-button" type="button">취소</button>
          <button className="button" type="button">게시글 등록</button>
        </div>
      </form>
    </section>
  );
}
