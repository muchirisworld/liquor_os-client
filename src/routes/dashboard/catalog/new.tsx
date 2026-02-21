import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { getCategories, getStoreTags } from '@/server/queries/products'
import { ProductForm } from './components/product-form'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard/catalog/new')({
  component: CreateProductPage,
})

function CreateProductPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: categories } = useSuspenseQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })

  const { data: storeTags } = useSuspenseQuery({
    queryKey: ['storeTags'],
    queryFn: () => getStoreTags(),
  })

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Product</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ProductForm
            categories={categories}
            storeTags={storeTags}
            onCreated={() => {
              queryClient.invalidateQueries({ queryKey: ['products'] })
              navigate({
                to: '/dashboard/catalog',
                search: { activeTab: 'products' } as any,
              })
            }}
            onCancel={() => {
              navigate({ to: '/dashboard/catalog' })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
