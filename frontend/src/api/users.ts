import { apiRequest } from './client'
import type { MyActivity } from '../types/user'


export function getMyActivity(token: string) {
    return apiRequest<MyActivity>('/api/users/me/activity', {
        token,
    })
}
