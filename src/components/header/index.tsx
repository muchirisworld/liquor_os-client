import { Link } from '@tanstack/react-router'
import DesktopNav from './desktop-nav'
import MobileNav from './mobile-nav'
import { useScroll } from '@/hooks/use-scroll'
import { Logo } from '@/components/header/logo'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

const Header = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const scrolled = useScroll(10)

  return (
    <header
      className={cn('sticky top-0 z-50 w-full border-transparent border-b', {
        'border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50':
          scrolled,
      })}
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <a className="rounded-md px-3 py-2.5 hover:bg-accent" href="#">
            <Logo className="h-4" />
          </a>
          <DesktopNav />
        </div>
        {isAuthenticated ? (
          <Link to="/dashboard">
            <Button className="cursor-pointer" variant="link">
              Dashboard
            </Button>
          </Link>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline">Sign In</Button>
            <Button>Get Started</Button>
          </div>
        )}
        <MobileNav />
      </nav>
    </header>
  )
}

export default Header
