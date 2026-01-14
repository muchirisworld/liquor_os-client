import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/tanstack-react-start'
import { SocialAuthButtons } from '@/components/elements/social-auth-provider'

export const Route = createFileRoute('/auth/sign-in/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignIn />
}
