import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/catalog/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/catalog/"!</div>
}
