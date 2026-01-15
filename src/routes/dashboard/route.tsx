import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import AppSidebar from './_components/app-sidebar'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <Outlet />
    </SidebarProvider>
  )
}
