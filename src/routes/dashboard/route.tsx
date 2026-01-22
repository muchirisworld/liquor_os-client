import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import AppSidebar from './_components/app-sidebar'
import { requireAuth } from '@/server/auth/auth'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  beforeLoad: async () => {
    await requireAuth()
  }
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
