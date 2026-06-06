import { Link } from "react-router-dom";

export default function Header() {
  // TODO: 로그인 상태에 따라 로그인/회원가입 또는 닉네임/로그아웃을 보여준다.
  return (
    <header className="site-header">
      <Link to="/" className="brand">말랑 연구소</Link>
      <nav>
        <Link to="/posts">게시글</Link>
        <Link to="/posts/new">글쓰기</Link>
        <Link to="/login">로그인</Link>
      </nav>
    </header>
  );
}
