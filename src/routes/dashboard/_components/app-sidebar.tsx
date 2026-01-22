import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebarItems } from "@/lib/sidebar-nav"
import { Command } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from "@tanstack/react-router"


const AppSidebar = () => {
  const { open } = useSidebar()
  const sidebarNavItems = useSidebarItems()
  const mainNavItems = sidebarNavItems.filter((x) => (x.kind == "item"))

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="cursor-pointer"
            >
              <div>
                <HugeiconsIcon icon={Command} />
              </div>
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
                      <TooltipTrigger className="w-full"
                        render={
                          <SidebarMenuButton
                            isActive={item.isActive}
                            className={`cursor-pointer border ${!item.isActive && "border-transparent"}`}
                          >
                            <HugeiconsIcon icon={item.icon} />
                            {open && <span className="">{item.title}</span>}
                          </SidebarMenuButton>
                        }
                      />
                      {!open && <TooltipContent side="right">{item.title}</TooltipContent>}
                    </SidebarMenuItem>
                  </Tooltip>
                </Link>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
