const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

type ApiOptions = {
    method?: string
    body?: unknown
    token?: string | null
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

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
    }

    if (response.status === 204) {
        return undefined as T
    }

    return response.json() as Promise<T>
}
