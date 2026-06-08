import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <section className="auth-page">
      <div className="auth-logo">
        <span className="brand-mark">말</span>
        <div>
          <h1>말랑 연구소</h1>
          <p className="muted">슬라임 메이커들의 연구실</p>
        </div>
      </div>
      <form className="auth-card">
        <div className="segmented">
          <span className="active">로그인</span>
          <Link to="/signup">회원가입</Link>
        </div>
        <label className="form-group">
          <span className="form-label">이메일</span>
          <input className="field" type="email" placeholder="이메일 주소 입력" />
        </label>
        <label className="form-group">
          <span className="form-label">비밀번호</span>
          <input className="field" type="password" placeholder="비밀번호 입력" />
        </label>
        <div className="section-title-row">
          <label className="meta">
            <input type="checkbox" /> 로그인 상태 유지
          </label>
          <Link className="feature-link" to="/login">비밀번호 찾기</Link>
        </div>
        <button className="button full-width" type="button">로그인</button>
        <button className="ghost-button full-width" type="button">Google로 로그인</button>
      </form>
    </section>
  );
}
