import { Link } from "react-router-dom";
import AiDiagnosisPanel from "../components/AiDiagnosisPanel";
import TagBadge from "../components/TagBadge";

export default function PostDetailPage() {
  return (
    <section className="page-stack">
      <Link className="feature-link" to="/posts">← 게시판으로 돌아가기</Link>
      <div className="two-column">
        <div>
          <article className="article-card">
            <div className="page-header">
              <div className="post-card-top">
                <span className="badge badge-coral">실패 질문</span>
                <span className="meta">2025.06.06 · 조회 247</span>
              </div>
              <h1>클리어 슬라임 만들었는데 자꾸 거품이 생겨요</h1>
              <div className="comment-item">
                <span className="avatar">민</span>
                <p className="meta"><strong>민트연구원</strong><br />슬라임 입문자 · 게시글 12개</p>
              </div>
            </div>
            <div className="tag-row">
              {["클리어슬라임", "거품", "투명도", "초보질문"].map((tag) => (
                <TagBadge key={tag} label={tag} />
              ))}
            </div>
            <div className="article-body">
              <p>안녕하세요. 슬라임 만든 지 3개월 된 초보입니다.</p>
              <p>
                클리어 슬라임을 여러 번 시도했는데 항상 거품이 잡히지 않아요. 글루에 활성제를 넣는 순서를
                바꿔봤는데도 결과가 비슷합니다.
              </p>
              <p><strong>사용 재료</strong></p>
              <p>Elmer's 클리어 PVA 글루 100ml, 봉사수, 글리터 약간</p>
            </div>
            <div className="surface-card">
              <p className="muted">슬라임 사진 2장</p>
            </div>
            <footer className="post-card-footer">
              <span className="feature-link coral">좋아요 34</span>
              <span className="post-metrics">
                <span>저장</span>
                <span>공유</span>
              </span>
            </footer>
          </article>

          <section className="comments-card">
            <h2>댓글 3개</h2>
            <div className="comment-list">
              {[
                ["슬라임박사", "글루 종류가 중요해요. 활성제는 조금씩 천천히 넣어보세요."],
                ["투명슬라임연구소", "빠르게 저으면 공기가 많이 들어갑니다. 한 방향으로 천천히 저어주세요."],
                ["라벤더공방", "완성 후 24~48시간 두면 거품이 자연스럽게 없어질 때가 많습니다."],
              ].map(([author, comment], index) => (
                <div className="comment-item" key={author}>
                  <span className={index === 0 ? "avatar lavender" : "avatar"}>{author.slice(0, 1)}</span>
                  <div className="comment-body">
                    <p><strong>{author}</strong> <span className="meta">방금 전</span></p>
                    <p className="muted">{comment}</p>
                  </div>
                </div>
              ))}
            </div>
            <textarea className="textarea" aria-label="댓글 입력" placeholder="도움이 되는 댓글을 남겨주세요." />
            <button className="button" type="button">등록</button>
          </section>
        </div>

        <aside className="page-stack">
          <section className="surface-card page-stack">
            <div>
              <span className="badge badge-mint">RAG</span>
              <h3>유사 게시글</h3>
            </div>
            {["클리어 슬라임 거품 제거하는 방법", "거품 없는 클리어 슬라임 기본 레시피", "저도 같은 문제 겪었어요"].map((title) => (
              <div className="result-item" key={title}>
                <span className="badge badge-mint">유사도 90%</span>
                <p className="muted">{title}</p>
              </div>
            ))}
            <button className="ghost-button" type="button">더 많은 사례 찾기</button>
          </section>
          <AiDiagnosisPanel />
        </aside>
      </div>
    </section>
  );
}
