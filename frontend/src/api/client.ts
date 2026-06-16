const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"

type ApiRequestOptions = RequestInit & {
  skipRefresh?: boolean
}

const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })

  return response.ok
}

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { skipRefresh = false, headers, body, ...requestOptions } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    credentials: "include",
    headers: {
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
    throw new Error("요청에 실패했습니다.")
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
