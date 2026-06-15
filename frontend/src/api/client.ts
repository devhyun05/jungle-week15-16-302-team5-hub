const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const TOKEN_KEY = "malang_access_token";
const USER_KEY = "malang_user";
export const AUTH_CHANGE_EVENT = "malang-auth-change";

interface SessionResponse<TUser = unknown> {
  access_token: string;
  user: TUser;
}

let refreshPromise: Promise<boolean> | null = null;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser<TUser = unknown>() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as TUser;
  } catch {
    return null;
  }
}

export function storeSession<TUser>(token: string, user: TUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function isRefreshablePath(path: string) {
  return !["/auth/login", "/auth/signup", "/auth/refresh", "/auth/logout"].some((authPath) => path.startsWith(authPath));
}

function redirectToLogin() {
  if (window.location.pathname === "/login" || window.location.pathname === "/signup") {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.assign(`/login?redirect=${encodeURIComponent(currentPath)}`);
}

function createHeaders(options: RequestInit) {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

function getErrorMessage(body: unknown, fallback: string) {
  if (typeof body === "object" && body !== null && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (typeof item === "object" && item !== null && "msg" in item) {
            return String((item as { msg: unknown }).msg);
          }
          return "";
        })
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join(", ");
      }
    }
  }

  return fallback;
}

async function parseResponse<TResponse>(response: Response): Promise<TResponse> {
  if (!response.ok) {
    let message = "API 요청에 실패했습니다.";
    try {
      const body = await response.json();
      message = getErrorMessage(body, message);
    } catch {
      message = response.statusText || message;
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          return false;
        }

        const data = await response.json() as SessionResponse;
        storeSession(data.access_token, data.user);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function fetchWithAuth(path: string, options: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: createHeaders(options),
    credentials: options.credentials ?? "include",
  });
}

export async function apiRequest<TResponse = unknown>(path: string, options: RequestInit = {}): Promise<TResponse> {
  const response = await fetchWithAuth(path, options);

  if (response.status === 401 && isRefreshablePath(path)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      const retryResponse = await fetchWithAuth(path, options);
      return parseResponse<TResponse>(retryResponse);
    }

    clearSession();
    redirectToLogin();
  }

  return parseResponse<TResponse>(response);
}
