import { create } from 'zustand'

type AuthState = {
  token: string | null
  currentUserId: number | null
  currentUserRole: string | null
  login: (token: string, userId: number, userRole: string) => void
  setCurrentUser: (userId: number, userRole: string) => void
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

function getInitialCurrentUserRole(): string | null {
    return localStorage.getItem('current_user_role')
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('access_token'),
    currentUserId: getInitialCurrentUserId(),
    currentUserRole: getInitialCurrentUserRole(),

    login: (token, userId, userRole) => {
        localStorage.setItem('access_token', token)
        localStorage.setItem('current_user_id', String(userId))
        localStorage.setItem('current_user_role', userRole)
        set({ token, currentUserId: userId, currentUserRole: userRole })
    },

    setCurrentUser: (userId, userRole) => {
        localStorage.setItem('current_user_id', String(userId))
        localStorage.setItem('current_user_role', userRole)
        set({ currentUserId: userId, currentUserRole: userRole })
    },

    logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('current_user_id')
        localStorage.removeItem('current_user_role')
        set({ token: null, currentUserId: null, currentUserRole: null })
    },
}))
