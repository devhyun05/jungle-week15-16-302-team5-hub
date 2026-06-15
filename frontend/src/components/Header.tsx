import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../api/auth";
import { AUTH_CHANGE_EVENT, clearSession, getStoredUser } from "../api/client";
import { cn } from "../styles/ui";
import type { User } from "../types";

const navLink =
  "inline-flex min-h-10 items-center justify-center border-b-2 border-transparent px-1 text-base font-bold text-muted transition hover:text-mint-dark";
const headerAction =
  "inline-flex min-h-9 items-center justify-center rounded-md border border-line bg-white px-2 text-sm font-bold text-ink transition hover:border-mint hover:bg-mint-soft hover:text-mint-dark md:px-3 md:text-base";

export default function Header() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());
  const boardActive = location.pathname === "/" || location.pathname.startsWith("/posts");

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser<User>());
    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Local logout should still happen even if the server session is already gone.
    } finally {
      clearSession();
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-[1fr_auto] gap-3 px-4 py-3 md:grid-cols-[auto_1fr_auto] md:items-center md:px-8">
        <Link to="/" className="inline-flex items-center justify-self-start gap-2 text-lg font-extrabold md:text-xl">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-mint text-sm font-black text-white shadow-subtle" aria-hidden="true">
            말
          </span>
          말랑 연구소
        </Link>
        <nav className="order-3 col-span-2 flex flex-wrap items-center gap-5 md:order-none md:col-span-1 md:justify-self-center">
          <Link to="/" className={cn(navLink, boardActive && "border-mint text-ink")}>
            게시판
          </Link>
          <NavLink to="/agent" className={({ isActive }) => cn(navLink, isActive && "border-mint text-ink")}>
            AI Agent
          </NavLink>
        </nav>
        <div className="flex flex-wrap items-center justify-end gap-2 md:justify-self-end">
          {user ? (
            <>
              <span className="inline-flex min-h-10 items-center rounded-md px-2 text-sm font-bold text-muted">
                {user.nickname}
              </span>
              <button className={headerAction} type="button" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className={headerAction}>로그인</Link>
              <Link to="/signup" className={headerAction}>회원가입</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
