export type User = {
    id: number
    email: string
    display_name: string
    role: string
    created_at: string
}

export type SignupRequest = {
    email: string
    display_name: string
    password: string
}

export type LoginRequest = {
    email: string
    password: string
}

export type TokenResponse = {
    access_token: string
    token_type: string
    user: User
}
