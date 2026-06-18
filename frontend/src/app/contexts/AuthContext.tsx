import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getCurrentUser,
  logoutCurrentUser,
  refreshAuthSession,
  startGoogleLogin,
  type CurrentUser,
} from "../api/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: CurrentUser | null;
  status: AuthStatus;
  isLoading: boolean;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<CurrentUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refreshCurrentUser = async () => {
    // 1. 먼저 /auth/me로 현재 access token이 유효한지 확인한다.
    const currentUser = await getCurrentUser();

    if (currentUser) {
      setUser(currentUser);
      setStatus("authenticated");
      return currentUser;
    }

    // 2. access token이 없거나 만료됐으면 refresh token으로 한 번 재발급을 시도한다.
    const refreshed = await refreshAuthSession();

    if (!refreshed) {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }

    // 3. refresh가 성공하면 새 access token cookie가 생겼으므로 사용자 정보를 다시 읽는다.
    const refreshedUser = await getCurrentUser();

    setUser(refreshedUser);
    setStatus(refreshedUser ? "authenticated" : "unauthenticated");

    return refreshedUser;
  };

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const currentUser = await refreshCurrentUser();

        if (!isMounted) {
          return;
        }

        setUser(currentUser);
        setStatus(currentUser ? "authenticated" : "unauthenticated");
      } catch {
        if (!isMounted) {
          return;
        }

        setUser(null);
        setStatus("unauthenticated");
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    await logoutCurrentUser();
    setUser(null);
    setStatus("unauthenticated");
  };

  const value = useMemo(
    () => ({
      user,
      status,
      isLoading: status === "loading",
      loginWithGoogle: startGoogleLogin,
      logout,
      refreshCurrentUser,
    }),
    [user, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
}
