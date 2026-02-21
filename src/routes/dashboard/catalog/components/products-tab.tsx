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
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:border-foreground/20 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold line-clamp-1">
                    {product.name}
                  </CardTitle>
                  <Badge
                    variant={
                      product.status === 'active'
                        ? 'default'
                        : product.status === 'draft'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="text-[10px] shrink-0"
                  >
                    {product.status}
                  </Badge>
                </div>
                {product.category && (
                  <CardDescription className="text-xs">
                    {product.category.name}
                    {product.subcategory
                      ? ` / ${product.subcategory.name}`
                      : ''}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono font-semibold text-foreground text-sm">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <span>
                    {product.variants.length} variant
                    {product.variants.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.tags.map((pt) => (
                      <Badge
                        key={pt.tagId}
                        variant="outline"
                        className="text-[10px]"
                      >
                        {pt.tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
