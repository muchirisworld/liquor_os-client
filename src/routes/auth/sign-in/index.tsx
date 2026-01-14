import { createFileRoute } from '@tanstack/react-router'
import SignInForm from '@/components/forms/sign-in-form'
import { SocialAuthButtons } from '@/components/elements/social-auth-provider'

export const Route = createFileRoute('/auth/sign-in/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="mx-auto space-y-4 sm:w-sm">
      <div className="flex flex-col space-y-1">
        <h1 className="font-bold text-2xl tracking-wide">Sign In!</h1>
        <p className="text-base text-muted-foreground">
          Login to your LiquorOS account.
        </p>
      </div>

      <SignInForm />

      <div className="flex w-full items-center justify-center">
        <div className="h-px w-full bg-border" />
        <span className="px-2 text-muted-foreground text-xs">OR</span>
        <div className="h-px w-full bg-border" />
      </div>

      <SocialAuthButtons className="gap-2" />
    </div>
  )
}
