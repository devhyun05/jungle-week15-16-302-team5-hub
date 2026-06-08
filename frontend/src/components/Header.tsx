import { Link, NavLink } from "react-router-dom";

export default function Header() {
  // TODO: 로그인 상태에 따라 로그인/회원가입 또는 닉네임/로그아웃을 보여준다.
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-mark">말</span>
        말랑 연구소
      </Link>
      <nav>
        <NavLink to="/" className="nav-link">홈</NavLink>
        <NavLink to="/posts" className="nav-link">게시글</NavLink>
        <NavLink to="/posts/new" className="nav-link">글쓰기</NavLink>
      </nav>
      <div className="header-actions">
        <Link to="/login" className="ghost-button">로그인</Link>
        <Link to="/posts/new" className="button">글쓰기</Link>
      </div>
    </header>
  );
}
