import {
  SUPPORTED_OAUTH_PROVIDERS,
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
} from '../../lib/o-auth-providers'
import type { HTMLAttributes } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TSocialAuthButtons = HTMLAttributes<HTMLDivElement>

export const SocialAuthButtons: React.FC<TSocialAuthButtons> = (props) => {
  const { className, ...rest } = props
  return (
    <div className={cn('flex items-center', className)} {...rest}>
      {SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
        const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon

        return (
          <Button
            variant="outline"
            className="cursor-pointer flex-1"
            key={provider}
            onClick={() => {}}
          >
            <Icon />
            {SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}
          </Button>
        )
      })}
    </div>
  )
}
