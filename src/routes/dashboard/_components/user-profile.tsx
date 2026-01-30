import { DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@clerk/tanstack-react-start';
import { Bell, Card, LogoutIcon, SettingsIcon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

type ProfileDropdownItem = {
  icon: IconSvgElement,
  name: string,
  action: () => void
}

const profileDropdownItems: ProfileDropdownItem[] = [
  {
    icon: UserIcon,
    name: 'Profile',
    action: () => {
      console.log('Profile clicked');
    }
  },
  {
    icon: SettingsIcon,
    name: 'Settings',
    action: () => {
      console.log('Settings clicked');
    }
  },
  {
    icon: Card,
    name: 'Billing',
    action: () => {
      console.log('Billing clicked');
    }
  },
  {
    icon: Bell,
    name: 'Notifications',
    action: () => {
      console.log('Notification clicked');
    }
  },
];

export function UserProfile() {
    const { signOut } = useAuth();
  return (
    <DropdownMenuContent className={"w-full"} side='right'>
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
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem
          className="flex items-center px-4 py-2 cursor-pointer"
          variant='destructive'
          onClick={() => signOut()}
        >
          <HugeiconsIcon icon={LogoutIcon} className="w-5 h-5 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  )
}
