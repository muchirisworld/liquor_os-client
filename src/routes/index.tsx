import { createFileRoute } from '@tanstack/react-router'
import Header from '@/components/header'
import { ComponentExample } from '@/components/component-example'
import { checkAuth } from '@/server/auth/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    return checkAuth()
  },
  component: App,
})

function App() {
  const { isAuthenticated } = Route.useRouteContext()
  return (
    <>
      <Header isAuthenticated={isAuthenticated} />
      <ComponentExample />
    </>
  )
}
