import { useEffect, useState } from "react"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"
const AUTH_CHANGE_EVENT = "jungle-market:auth-change"

type AuthUser = {
  id: number
  name: string
  email: string
  profileImageUrl: string | null
  role: string
}

type UserMeResponse = {
  id: number
  email: string
  username: string
  profile_image_url: string | null
  role: string
}

const toAuthUser = (user: UserMeResponse): AuthUser => ({
  id: user.id,
  name: user.username,
  email: user.email,
  profileImageUrl: user.profile_image_url,
  role: user.role,
})

const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })

  return response.ok
}

const fetchCurrentUser = async () => {
  try {
    let response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: "include",
    })

    if (response.status === 401) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
        })
      }
    }

    if (!response.ok) {
      return null
    }

    const user = (await response.json()) as UserMeResponse
    return toAuthUser(user)
  } catch {
    return null
  }
}

export const logoutMockUser = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
  } finally {
    notifyAuthChange()
  }
}

export const useMockAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    let isMounted = true

    const syncUser = async () => {
      setIsCheckingAuth(true)

      const currentUser = await fetchCurrentUser()

      if (isMounted) {
        setUser(currentUser)
        setIsCheckingAuth(false)
      }
    }

    syncUser()
    window.addEventListener(AUTH_CHANGE_EVENT, syncUser)

    return () => {
      isMounted = false
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser)
    }
  }, [])

  return {
    user,
    isLoggedIn: Boolean(user),
    isCheckingAuth,
    logoutMockUser,
  }
}
