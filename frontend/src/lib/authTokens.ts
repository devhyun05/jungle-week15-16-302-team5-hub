const ACCESS_TOKEN_KEY = "jungle-market-access-token"
const REFRESH_TOKEN_KEY = "jungle-market-refresh-token"

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export const captureAuthTokensFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get("accessToken")
  const refreshToken = params.get("refreshToken")

  if (!accessToken || !refreshToken) {
    return
  }

  setAuthTokens(accessToken, refreshToken)
  params.delete("accessToken")
  params.delete("refreshToken")

  const queryString = params.toString()
  const cleanUrl = `${window.location.pathname}${
    queryString ? `?${queryString}` : ""
  }${window.location.hash}`

  window.history.replaceState(null, "", cleanUrl)
}
