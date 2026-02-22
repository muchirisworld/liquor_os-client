import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getProducts } from '@/server/queries/products'

export function ProductsTab() {
  const { data: products } = useSuspenseQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} in your
            catalog
          </p>
        </div>
        <Link to="/dashboard/catalog/new">
          <Button>+ New Product</Button>
        </Link>
      </div>

      {/* Product list */}
      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No products yet. Create your first product to get started.
            </p>
            <Link to="/dashboard/catalog/new" className="inline-block mt-4">
              <Button variant="outline">+ Create Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const mainImage = product.media?.[0]?.url
            return (
              <Card
                key={product.id}
                className="group hover:border-foreground/20 transition-all overflow-hidden"
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {mainImage ? (
                    <img 
                      src={mainImage} 
                      alt={product.name} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground/30 text-xs italic">
                      No image
                    </div>
                  )}
                  <Badge
                    variant={
                      product.status === 'active'
                        ? 'default'
                        : product.status === 'draft'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="absolute top-2 right-2 text-[10px] uppercase shadow-sm"
                  >
                    {product.status}
                  </Badge>
                </div>
                <CardHeader className="pb-2 pt-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-bold line-clamp-1">
                      {product.name}
                    </CardTitle>
                  </div>
                  {product.category && (
                    <CardDescription className="text-[10px] uppercase tracking-wider font-medium opacity-70">
                      {product.category.name}
                      {product.subcategory
                        ? ` / ${product.subcategory.name}`
                        : ''}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono font-bold text-foreground text-base">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium">
                      {product.variants.length} variant
                      {product.variants.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {product.tags.map((pt) => (
                        <Badge
                          key={pt.tagId}
                          variant="outline"
                          className="text-[9px] h-4"
                        >
                          {pt.tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
