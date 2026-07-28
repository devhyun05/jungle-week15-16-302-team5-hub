import { useEffect, useState } from "react"

const MOCK_AUTH_STORAGE_KEY = "jungle-market:mock-user"
const MOCK_AUTH_CHANGE_EVENT = "jungle-market:auth-change"

type MockUser = {
  name: string
  email: string
}

const mockSlackUser: MockUser = {
  name: "이현성",
  email: "devhyun.jungle@gmail.com",
}

const getMockUser = () => {
  const storedUser = localStorage.getItem(MOCK_AUTH_STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  return JSON.parse(storedUser) as MockUser
}

const notifyAuthChange = () => {
  window.dispatchEvent(new Event(MOCK_AUTH_CHANGE_EVENT))
}

export const loginWithMockSlack = () => {
  localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(mockSlackUser))
  notifyAuthChange()
}

export const logoutMockUser = () => {
  localStorage.removeItem(MOCK_AUTH_STORAGE_KEY)
  notifyAuthChange()
}

export const useMockAuth = () => {
  const [user, setUser] = useState<MockUser | null>(() => getMockUser())

  useEffect(() => {
    const syncUser = () => {
      setUser(getMockUser())
    }

    window.addEventListener(MOCK_AUTH_CHANGE_EVENT, syncUser)
    window.addEventListener("storage", syncUser)

    return () => {
      window.removeEventListener(MOCK_AUTH_CHANGE_EVENT, syncUser)
      window.removeEventListener("storage", syncUser)
    }
  }, [])

  return {
    user,
    isLoggedIn: Boolean(user),
    loginWithMockSlack,
    logoutMockUser,
  }
}
