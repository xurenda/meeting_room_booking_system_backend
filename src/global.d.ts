import type { Request as ExpressRequest } from 'express'

declare module 'express' {
  interface Request extends ExpressRequest {
    user: {
      id: number
      username: string
      roles: string[]
      permissions: Record<string, number>
    }
  }
}
