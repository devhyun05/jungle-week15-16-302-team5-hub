type AccessTokenPayload = {
    sub?: string | number | null
}

export function getCurrentUserIdFromToken(): number | null {
    const token = localStorage.getItem('access_token')

    if (!token) {
        return null
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1])) as AccessTokenPayload
        const userId = Number(payload.sub)

        return Number.isNaN(userId) ? null : userId
    } catch {
        return null
    }
}
