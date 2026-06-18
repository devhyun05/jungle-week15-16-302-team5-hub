import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "../lib/authTokens"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"

type ApiRequestOptions = RequestInit & {
  skipRefresh?: boolean
}

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...(refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {}),
    },
  })

  if (response.ok) {
    const data = (await response.json()) as {
      access_token?: string
      refresh_token?: string
    }
    if (data.access_token && data.refresh_token) {
      setAuthTokens(data.access_token, data.refresh_token)
    }
  }

  return response.ok
}

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { skipRefresh = false, headers, body, ...requestOptions } = options
  const accessToken = getAccessToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    credentials: "include",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body,
  })

  if (response.status === 401 && !skipRefresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return apiRequest<T>(path, { ...options, skipRefresh: true })
    }
  }

  if (!response.ok) {
    let message = "요청에 실패했습니다."

    try {
      const data = (await response.json()) as { detail?: string }
      message = data.detail ?? message
    } catch {
      // 응답 본문이 JSON이 아닐 때는 기본 메시지를 사용한다.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
