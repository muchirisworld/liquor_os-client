import { DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@clerk/tanstack-react-start';
import { Bell, Card, LogoutIcon, SettingsIcon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { Label } from '@/components/ui/label';

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
        <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <HugeiconsIcon icon={SettingsIcon} className="w-5 h-5 mr-2" />
              <span>Theme</span>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <RadioGroup className={"gap-0"}>
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
            </DropdownMenuSubTrigger>
          </DropdownMenuSub>
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
