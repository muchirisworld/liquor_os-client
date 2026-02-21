import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { getTags } from '@/server/queries/tags'
import { ProductsTab } from './components/products-tab'
import { CategoriesTab } from './components/categories-tab'
import { TagsTab } from './components/tags-tab'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/dashboard/catalog/')({
  component: RouteComponent,
  loader: async () => {
    const tags = await getTags()
    return { tags }
  },
})

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<
    'products' | 'categories' | 'tags'
  >('products')

  return (
    <div className="p-6 max-w-6xl w-full">
      {/* Tab navigation */}
      <div className="flex items-center gap-1 mb-6 border-b">
        <Button
          variant={activeTab === 'products' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('products')}
          className={'px-4 py-2.5 text-sm font-medium transition-colors relative'}
        >
          Products
          {activeTab === 'products' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </Button>
        <Button
          variant={activeTab === 'categories' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('categories')}
          className={'px-4 py-2.5 text-sm font-medium transition-colors relative'}
        >
          Categories
          {activeTab === 'categories' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </Button>
        <Button
          variant={activeTab === 'tags' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('tags')}
          className={'px-4 py-2.5 text-sm font-medium transition-colors relative'}
        >
          Tags
          {activeTab === 'tags' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </Button>
      </div>

      {activeTab === 'products' && <ProductsTab />}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'tags' && <TagsTab />}
    </div>
  )
}
