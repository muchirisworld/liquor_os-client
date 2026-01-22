import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { authMiddleware } from '@/middleware/authMiddleware'

export const authFunction = createServerFn().middleware([authMiddleware])

export const checkAuth = authFunction.handler(({ context }) => {
  return {
    isAuthenticated: context.auth.isAuthenticated,
  }
})

export const requireAuth = authFunction.handler(({ context }) => {
  if (!context.auth.isAuthenticated) {
    throw redirect({
      to: '/auth/sign-in',
    })
  }

  return {
    userId: context.auth.userId,
    orgId: context.auth.orgId,
    permissions: context.auth.orgPermissions,
    sessionId: context.auth.sessionId,
  }
})
