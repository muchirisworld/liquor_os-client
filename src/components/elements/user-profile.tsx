import { useEffect } from 'react'
import { useAuth } from '@clerk/tanstack-react-start'
import {
  Bell,
  Card,
  LogoutIcon,
  SettingsIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon  } from '@hugeicons/react'
import useThemeStore from '../../lib/themeStore'
import type {IconSvgElement} from '@hugeicons/react';
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

type ProfileDropdownItem = {
  icon: IconSvgElement
  name: string
  action: () => void
}

const profileDropdownItems: Array<ProfileDropdownItem> = [
  {
    icon: UserIcon,
    name: 'Profile',
    action: () => {
      console.log('Profile clicked')
    },
  },
  {
    icon: SettingsIcon,
    name: 'Settings',
    action: () => {
      console.log('Settings clicked')
    },
  },
  {
    icon: Card,
    name: 'Billing',
    action: () => {
      console.log('Billing clicked')
    },
  },
  {
    icon: Bell,
    name: 'Notifications',
    action: () => {
      console.log('Notification clicked')
    },
  },
]

export function UserProfile() {
  const { signOut } = useAuth()
  const theme = useThemeStore((s: any) => s.theme)
  const setTheme = useThemeStore((s: any) => s.setTheme)

  useEffect(() => {
    // initialize theme on mount (reads localStorage and applies class)
    try {
      useThemeStore.getState().init()
    } catch (e) {}
  }, [])

  const handleThemeChange = (value: unknown) => {
    const strValue = String(value)
    switch (strValue) {
      case '1':
        setTheme('light')
        break
      case '2':
        setTheme('dark')
        break
      case '3':
        setTheme('system')
        break
      default:
        setTheme('light')
    }
  }

  const radioValue = theme === 'light' ? '1' : theme === 'dark' ? '2' : '3'

  return (
    <DropdownMenuContent className={'w-full'} side="right">
      <DropdownMenuGroup>
        {profileDropdownItems.map((item) => (
          <DropdownMenuItem
            key={item.name}
            className="flex items-center px-4 py-2 cursor-pointer"
            onClick={item.action}
          >
            <HugeiconsIcon icon={item.icon} className="w-5 h-5 mr-2" />
            <span>{item.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <HugeiconsIcon icon={SettingsIcon} className="w-5 h-5 mr-2" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <RadioGroup
                className={'gap-0'}
                value={radioValue}
                onValueChange={handleThemeChange}
              >
                <DropdownMenuItem className="flex items-center hover:bg-muted">
                  <RadioGroupItem id="theme-1" value="1" />
                  <Label htmlFor="theme-1">Light</Label>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center hover:bg-muted">
                  <RadioGroupItem id="theme-2" value="2" />
                  <Label htmlFor="theme-2">Dark</Label>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center hover:bg-muted">
                  <RadioGroupItem id="theme-3" value="3" />
                  <Label htmlFor="theme-3">System</Label>
                </DropdownMenuItem>
              </RadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem
          className="flex items-center px-4 py-2 cursor-pointer"
          variant="destructive"
          onClick={() => signOut()}
        >
          <HugeiconsIcon icon={LogoutIcon} className="w-5 h-5 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  )
}
