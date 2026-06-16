import type { User } from './auth'
import type { Comment } from './comment'
import type { Post } from './post'

export type MyActivity = {
    user: User
    posts: Post[]
    comments: Comment[]
}
