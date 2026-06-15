import { apiRequest, getCookie } from './client'
import type { LoginRequest, SignupRequest, TokenResponse, User } from '../types/auth'

export function signup(payload: SignupRequest) {
    return apiRequest<User>('/api/auth/signup', {
        method: 'POST',
        body: payload,
    })
}

export function login(payload: LoginRequest) {
    return apiRequest<TokenResponse>('/api/auth/login', {
        method: 'POST',
        body: payload,
        credentials: 'include',
        skipRefresh: true,
    })
}

export function getMe(token: string) {
    return apiRequest<User>('/api/auth/me', {
        token,
    })
}

export function logout() {
    const csrfToken = getCookie('csrf_token')

    return apiRequest<void>('/api/auth/logout', {
        method: 'POST',
        csrfToken,
        credentials: 'include',
        skipRefresh: true,
    })
}
