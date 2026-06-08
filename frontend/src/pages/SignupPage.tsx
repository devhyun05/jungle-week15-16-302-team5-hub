import { Link } from "react-router-dom";

export default function SignupPage() {
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
          <Link to="/login">로그인</Link>
          <span className="active">회원가입</span>
        </div>
        <label className="form-group">
          <span className="form-label">닉네임</span>
          <input className="field" placeholder="연구원 이름을 정해주세요" />
        </label>
        <label className="form-group">
          <span className="form-label">이메일</span>
          <input className="field" type="email" placeholder="이메일 주소 입력" />
        </label>
        <label className="form-group">
          <span className="form-label">비밀번호</span>
          <input className="field" type="password" placeholder="8자 이상, 숫자와 특수문자 포함" />
        </label>
        <label className="meta">
          <input type="checkbox" /> 이용약관과 개인정보 처리방침에 동의합니다.
        </label>
        <button className="button full-width" type="button">말랑 연구소 가입하기</button>
        <button className="ghost-button full-width" type="button">Google로 가입하기</button>
      </form>
    </section>
  );
}
