import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT, clearSession, getStoredUser } from "../api/client";
import { button, cn, ghostButton } from "../styles/ui";
import type { User } from "../types";

const navLink =
  "inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-lg font-bold text-muted transition hover:bg-mint-soft hover:text-mint-dark";

export default function Header() {
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser<User>());
    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 grid gap-4 border-b border-line bg-white/95 px-5 py-4 shadow-[0_1px_3px_rgba(36,48,68,0.08)] md:grid-cols-[1fr_auto_1fr] md:items-center md:px-12">
      <Link to="/" className="inline-flex items-center justify-self-center gap-2.5 text-xl font-extrabold md:justify-self-start">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-mint text-sm font-black text-white shadow-subtle">
          말
        </span>
        말랑 연구소
      </Link>
      <nav className="flex flex-wrap items-center justify-center gap-2 md:justify-self-center">
        <NavLink to="/" className={({ isActive }) => cn(navLink, isActive && "bg-mint-soft text-mint-dark")}>
          홈
        </NavLink>
        <NavLink to="/posts" className={({ isActive }) => cn(navLink, isActive && "bg-mint-soft text-mint-dark")}>
          게시글
        </NavLink>
        <NavLink to="/agent" className={({ isActive }) => cn(navLink, isActive && "bg-mint-soft text-mint-dark")}>
          AI Agent
        </NavLink>
      </nav>
      <div className="flex flex-wrap items-center justify-center gap-2 md:justify-self-end">
        {user ? (
          <>
            <span className="inline-flex min-h-[42px] items-center rounded-lg px-4 text-base font-bold text-muted">
              {user.nickname}
            </span>
            <button className={ghostButton} type="button" onClick={clearSession}>로그아웃</button>
            <Link to="/posts/new" className={button}>글쓰기</Link>
          </>
        ) : (
          <>
            <Link to="/login" className={ghostButton}>로그인</Link>
            <Link to="/signup" className={ghostButton}>회원가입</Link>
            <Link to="/posts/new" className={button}>글쓰기</Link>
          </>
        )}
      </div>
    </header>
  );
}
