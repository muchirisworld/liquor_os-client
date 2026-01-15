import { createFileRoute } from '@tanstack/react-router'
import Header from './_components/header'
import { ComponentExample } from '@/components/component-example'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <>
      <Header />
      <ComponentExample />
    </>
  )
}
