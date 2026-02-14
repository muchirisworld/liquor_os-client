import { Command } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { OrganizationSwitcher, useUser } from '@clerk/tanstack-react-start'
import { UserProfile } from '../elements/user-profile'
import { useSidebarItems } from '@/lib/sidebar-nav'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const AppSidebar = () => {
  const { user } = useUser()
  const { open } = useSidebar()
  const sidebarNavItems = useSidebarItems()
  const mainNavItems = sidebarNavItems.filter((x) => x.kind == 'item')

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-pointer">
              {open ?
              <OrganizationSwitcher />
              : <div>
                <HugeiconsIcon icon={Command} />
              </div>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <Link to={item.url} key={item.title} className="mb-1">
                  <Tooltip key={item.title}>
                    <SidebarMenuItem>
                      <TooltipTrigger
                        className="w-full"
                        render={
                          <SidebarMenuButton
                            isActive={item.isActive}
                            className={`cursor-pointer border ${!item.isActive && 'border-transparent'}`}
                          >
                            <HugeiconsIcon icon={item.icon} />
                            {open && <span className="">{item.title}</span>}
                          </SidebarMenuButton>
                        }
                      />
                      {!open && (
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      )}
                    </SidebarMenuItem>
                  </Tooltip>
                </Link>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* <UserButton /> */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <SidebarMenuButton
                  className={cn(
                    'cursor-pointer border border-transparent hover:border-border',
                    open ? 'py-6' : 'p-0 m-0',
                  )}
                >
                  <Avatar>
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={user?.fullName || 'User Avatar'}
                      className={'border rounded-xs'}
                    />
                    <AvatarFallback className={'border rounded-xs'}>
                      {user?.fullName?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {open && (
                    <div className="flex flex-col justify-center items-start">
                      <span className="font-bold">
                        {user?.fullName || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress || 'No Email'}
                      </span>
                    </div>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <UserProfile />
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
