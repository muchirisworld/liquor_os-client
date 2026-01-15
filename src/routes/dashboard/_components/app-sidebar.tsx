import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSidebarItems } from "@/lib/sidebar-nav"
import { Command } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from "@tanstack/react-router"


const AppSidebar = () => {
  const sidebarNavItems = useSidebarItems()
  const mainNavItems = sidebarNavItems.filter((x) => (x.kind == "item"))

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              size="icon"
              className="cursor-pointer"
            >
              <div>
                <HugeiconsIcon icon={Command} />
              </div>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <Link to={item.url} key={item.title} className="mb-1">
                  <SidebarMenuItem className="flex items-center">
                    <SidebarMenuButton
                      isActive={item.isActive}
                      className={item.isActive ? "border" : "border border-transparent"}
                    >
                      <HugeiconsIcon icon={item.icon} />
                      <p className="">{item.title}</p>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
