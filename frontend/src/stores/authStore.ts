import { create } from 'zustand'

type AuthState = {
  token: string | null
  currentUserId: number | null
  login: (token: string, userId: number) => void
  logout: () => void
}

function getInitialCurrentUserId(): number | null {
    const storedUserId = localStorage.getItem('current_user_id')

    if (!storedUserId) {
        return null
    }

    const userId = Number(storedUserId)

    if (Number.isNaN(userId)) {
        return null
    }

    return userId
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('access_token'),
    currentUserId: getInitialCurrentUserId(),

    login: (token, userId) => {
        localStorage.setItem('access_token', token)
        localStorage.setItem('current_user_id', String(userId))
        set({ token, currentUserId: userId })
    },

    logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('current_user_id')
        set({ token: null, currentUserId: null })
    },
}))