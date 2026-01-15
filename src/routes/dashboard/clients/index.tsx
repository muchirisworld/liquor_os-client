import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/clients/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/clients/"!</div>
}
