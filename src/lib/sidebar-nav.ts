import { useRouterState } from '@tanstack/react-router'
import { Box, Cart, HomeIcon, Users } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import type { FileRouteTypes } from '@/routeTree.gen'

type DashboardRoute =
  | '/dashboard'
  | Extract<FileRouteTypes['to'], `/dashboard/${string}`>

export type SidebarNavItem =
  | {
      kind: 'item'
      title: string
      url: DashboardRoute
      icon: IconSvgElement
      isActive: boolean
    }
  | {
      kind: 'hidden'
    }

type SidebarNavItemConfig =
  | {
      kind: 'item'
      title: string
      url: DashboardRoute
      icon: IconSvgElement
    }
  | {
      kind: 'hidden'
    }

export const dashboardNavConfig: Record<DashboardRoute, SidebarNavItemConfig> =
  {
    '/dashboard': {
      kind: 'item',
      title: 'Overview',
      url: '/dashboard',
      icon: HomeIcon,
    },
    '/dashboard/orders': {
      kind: 'item',
      title: 'Orders',
      url: '/dashboard/orders',
      icon: Cart,
    },
    '/dashboard/clients': {
      kind: 'item',
      title: 'Clients',
      url: '/dashboard/clients',
      icon: Users,
    },
    '/dashboard/inventory': {
      kind: 'item',
      title: 'Inventory',
      url: '/dashboard/inventory',
      icon: Box,
    },
  }

export function useSidebarItems(): Array<SidebarNavItem> {
  const location = useRouterState({
    select: (s) => s.location.pathname,
  })

  return (
    Object.entries(dashboardNavConfig) as Array<
      [DashboardRoute, SidebarNavItemConfig]
    >
  )
    .filter(([_, x]) => x.kind == 'item')
    .map(([route, item]) => ({
      ...item,
      isActive: location === route,
    }))
}
