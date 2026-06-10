import { apiRequest } from './client'
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
    })
}

export function getMe(token: string) {
    return apiRequest<User>('/api/auth/me', {
        token,
    })
}