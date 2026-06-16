import type { TokenResponse } from '../types/auth'
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

type ApiOptions = {
    method?: string
    body?: unknown
    token?: string | null
    csrfToken?: string | null
    credentials?: RequestCredentials
    skipRefresh?: boolean
}

let refreshPromise: Promise<TokenResponse> | null = null

export function getCookie(name: string): string | null {
    const cookies = document.cookie.split('; ')

    for (const cookie of cookies) {
        const [key, ...valueParts] = cookie.split('=')

        if (key === name) {
            return decodeURIComponent(valueParts.join('='))
        }
    }

    return null
}

async function refreshAccessToken(): Promise<TokenResponse> {
    if (refreshPromise) {
        return refreshPromise
    }

    const csrfToken = getCookie('csrf_token')

    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
        credentials: 'include',
    }).then(async (response) => {
        if (!response.ok) {
            throw new Error(`Refresh failed: ${response.status}`)
        }

        return response.json() as Promise<TokenResponse>
    }).finally(() => {
        refreshPromise = null
    })

    return refreshPromise
}


export async function apiRequest<T>(
    path: string,
    options: ApiOptions = {},
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    }

    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`
    }

    if (options.csrfToken) {
        headers['X-CSRF-Token'] = options.csrfToken
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        credentials: options.credentials,
    })

    if (response.status === 401 && !options.skipRefresh) {
        try {
            const currentToken = useAuthStore.getState().token

            if (currentToken && currentToken !== options.token) {
                return apiRequest<T>(path, {
                    ...options,
                    token: currentToken,
                    skipRefresh: true,
                })
            }

            const refreshResult = await refreshAccessToken()
            useAuthStore.getState().login(
                refreshResult.access_token,
                refreshResult.user.id,
            )

            return apiRequest<T>(path, {
                ...options,
                token: refreshResult.access_token,
                skipRefresh: true,
            })
        } catch {
            useAuthStore.getState().logout()
            throw new Error('Session expired')
        }
    }

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
    }

    if (response.status === 204) {
        return undefined as T
    }

    return response.json() as Promise<T>
}
