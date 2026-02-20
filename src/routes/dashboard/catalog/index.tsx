import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState, useEffect, useMemo } from 'react'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@clerk/tanstack-react-start'
import type { TCreateTagSchema } from '@/lib/validators'
import { createTagSchema } from '@/lib/validators'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputList,
} from '@/components/ui/tags-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  createTag,
  createTagOptions,
  createTagPreset,
  deleteTagOption,
  deleteTagPreset,
  getTagOptions,
  getTagPresets,
  getTags,
} from '@/server/queries/tags'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Trash } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  getProducts,
  getCategories,
  getStoreVariants,
  getStoreTags,
  createProduct,
} from '@/server/queries/products'

export const Route = createFileRoute('/dashboard/catalog/')({
  component: RouteComponent,
  loader: async () => {
    const tags = await getTags()
    return { tags }
  },
})

// ════════════════════════════════════════════════════════════════════════
// Root page component with tabs
// ════════════════════════════════════════════════════════════════════════
function RouteComponent() {
  const [activeTab, setActiveTab] = useState<'products' | 'tags'>('products')

  return (
    <div className="p-6 max-w-6xl w-full">
      {/* Tab navigation */}
      <div className="flex items-center gap-1 mb-6 border-b">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${activeTab === 'products'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground/80'
            }`}
        >
          Products
          {activeTab === 'products' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${activeTab === 'tags'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground/80'
            }`}
        >
          Tags
          {activeTab === 'tags' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
      </div>

      {activeTab === 'products' ? <ProductsTab /> : <TagsTab />}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// Products tab
// ════════════════════════════════════════════════════════════════════════
function ProductsTab() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const queryClient = useQueryClient()

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
            {products.length} product{products.length !== 1 ? 's' : ''} in your catalog
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>+ New Product</Button>
      </div>

      {/* Product list */}
      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No products yet. Create your first product to get started.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setWizardOpen(true)}
            >
              + Create Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="group hover:border-foreground/20 transition-colors">
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
                    {product.subcategory ? ` / ${product.subcategory.name}` : ''}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono font-semibold text-foreground text-sm">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <span>
                    {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.tags.map((pt) => (
                      <Badge key={pt.tagId} variant="outline" className="text-[10px]">
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

      {/* Product creation wizard */}
      <ProductWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] })
          setWizardOpen(false)
        }}
      />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// Product creation wizard (Sheet)
// ════════════════════════════════════════════════════════════════════════
type WizardStep = 1 | 2 | 3 | 4 | 5

interface VariantValue {
  value: string
  price: string
  quantity: number
  selected: boolean
}

interface VariantAxis {
  variantId: string
  variantName: string
  values: VariantValue[]
}

interface WizardData {
  // Step 1
  name: string
  description: string
  categoryId: string
  subcategoryId: string
  status: 'active' | 'draft' | 'archived'
  // Step 2
  price: string
  originalPrice: string
  // Step 3
  tagIds: string[]
  // Step 4
  variantAxes: VariantAxis[]
}

const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Basic Info',
  2: 'Pricing',
  3: 'Tags',
  4: 'Variants',
  5: 'Review',
}

function ProductWizard({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: () => void
}) {
  const [step, setStep] = useState<WizardStep>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [data, setData] = useState<WizardData>({
    name: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    status: 'draft',
    price: '',
    originalPrice: '',
    tagIds: [],
    variantAxes: [],
  })

  // Fetch supporting data
  const { data: categories } = useSuspenseQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })

  const { data: storeVariants } = useSuspenseQuery({
    queryKey: ['storeVariants'],
    queryFn: () => getStoreVariants(),
  })

  const { data: storeTags } = useSuspenseQuery({
    queryKey: ['storeTags'],
    queryFn: () => getStoreTags(),
  })

  // Subcategories for the selected category
  const subcategories = useMemo(() => {
    if (!data.categoryId) return []
    const cat = categories.find((c) => c.id === data.categoryId)
    return cat?.subcategories || []
  }, [data.categoryId, categories])

  const update = (partial: Partial<WizardData>) =>
    setData((prev) => ({ ...prev, ...partial }))

  const canNext = (): boolean => {
    switch (step) {
      case 1:
        return data.name.trim().length > 0 && data.categoryId.length > 0
      case 2:
        return data.price.trim().length > 0 && Number(data.price) > 0
      case 3:
        return true // tags are optional
      case 4:
        return true // variants are optional
      case 5:
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await createProduct({
        data: {
          name: data.name,
          description: data.description || undefined,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId || undefined,
          price: data.price,
          originalPrice: data.originalPrice || undefined,
          status: data.status,
          tagIds: data.tagIds,
          variants: data.variantAxes
            .filter((a) => a.values.some((v) => v.selected))
            .map((a) => ({
              variantId: a.variantId,
              values: a.values
                .filter((v) => v.selected)
                .map((v) => ({
                  value: v.value,
                  price: v.price || data.price,
                  quantity: v.quantity,
                })),
            })),
        },
      })
      // Reset wizard
      setStep(1)
      setData({
        name: '',
        description: '',
        categoryId: '',
        subcategoryId: '',
        status: 'draft',
        price: '',
        originalPrice: '',
        tagIds: [],
        variantAxes: [],
      })
      onCreated()
    } catch (error) {
      console.error('Failed to create product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset step when closing
  useEffect(() => {
    if (!open) {
      setStep(1)
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Product</SheetTitle>
          <SheetDescription>
            Step {step} of 5 — {STEP_LABELS[step]}
          </SheetDescription>
          {/* Step indicator */}
          <div className="flex gap-1 pt-2">
            {([1, 2, 3, 4, 5] as WizardStep[]).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-foreground' : 'bg-muted'
                  }`}
              />
            ))}
          </div>
        </SheetHeader>

        <div className="p-4 flex-1 space-y-4">
          {step === 1 && (
            <StepBasicInfo
              data={data}
              onChange={update}
              categories={categories}
              subcategories={subcategories}
            />
          )}
          {step === 2 && <StepPricing data={data} onChange={update} />}
          {step === 3 && (
            <StepTags data={data} onChange={update} storeTags={storeTags} />
          )}
          {step === 4 && (
            <StepVariants
              data={data}
              onChange={update}
              storeVariants={storeVariants}
              storeTags={storeTags}
            />
          )}
          {step === 5 && (
            <StepReview
              data={data}
              categories={categories}
              storeTags={storeTags}
            />
          )}
        </div>

        <SheetFooter className="flex-row justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1) as WizardStep)}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < 5 ? (
            <Button
              onClick={() => setStep((s) => Math.min(5, s + 1) as WizardStep)}
              disabled={!canNext()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !canNext()}
            >
              {isSubmitting ? 'Creating…' : 'Create Product'}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ── Step 1: Basic Info ────────────────────────────────────────────────
function StepBasicInfo({
  data,
  onChange,
  categories,
  subcategories,
}: {
  data: WizardData
  onChange: (p: Partial<WizardData>) => void
  categories: Array<{ id: string; name: string }>
  subcategories: Array<{ id: string; name: string }>
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium">
          Product Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g., Johnnie Walker Black Label"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">Description</label>
        <Textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Product description…"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">
          Category <span className="text-destructive">*</span>
        </label>
        <Select
          value={data.categoryId || undefined}
          onValueChange={(v) =>
            onChange({ categoryId: v ?? '', subcategoryId: '' })
          }
        >
          <SelectTrigger>
            <SelectValue>{data.categoryId ? categories.find(c => c.id === data.categoryId)?.name : 'Select category'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {subcategories.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium">Subcategory</label>
          <Select
            value={data.subcategoryId || undefined}
            onValueChange={(v) => onChange({ subcategoryId: v ?? '' })}
          >
            <SelectTrigger>
              <SelectValue>{data.subcategoryId ? subcategories.find(s => s.id === data.subcategoryId)?.name : 'Select subcategory'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium">Status</label>
        <Select
          value={data.status}
          onValueChange={(v) =>
            onChange({ status: (v ?? 'draft') as WizardData['status'] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// ── Step 2: Pricing ──────────────────────────────────────────────────
function StepPricing({
  data,
  onChange,
}: {
  data: WizardData
  onChange: (p: Partial<WizardData>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium">
          Price <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={data.price}
            onChange={(e) => onChange({ price: e.target.value })}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">
          Compare-at Price{' '}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={data.originalPrice}
            onChange={(e) => onChange({ originalPrice: e.target.value })}
            placeholder="0.00"
            className="pl-7"
          />
        </div>
        {data.originalPrice && Number(data.originalPrice) > 0 && data.price && (
          <p className="text-xs text-muted-foreground">
            Customers will see the compare-at price crossed out next to the actual price.
          </p>
        )}
      </div>
    </div>
  )
}

// ── Step 3: Tags ─────────────────────────────────────────────────────
function StepTags({
  data,
  onChange,
  storeTags,
}: {
  data: WizardData
  onChange: (p: Partial<WizardData>) => void
  storeTags: Array<{ id: string; name: string; tagOptions: Array<{ id: string; name: string }> }>
}) {
  if (storeTags.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No tags created yet. Go to the Tags tab to create some first.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Select tags to attach to this product.
      </p>
      {storeTags.map((tag) => {
        const isSelected = data.tagIds.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => {
              if (isSelected) {
                onChange({ tagIds: data.tagIds.filter((id) => id !== tag.id) })
              } else {
                onChange({ tagIds: [...data.tagIds, tag.id] })
              }
            }}
            className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors ${isSelected
              ? 'border-foreground bg-foreground/5'
              : 'border-border hover:border-foreground/30'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{tag.name}</span>
              {isSelected && (
                <span className="text-[10px] font-medium text-foreground/60">
                  ✓ Selected
                </span>
              )}
            </div>
            {tag.tagOptions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tag.tagOptions.slice(0, 8).map((opt) => (
                  <Badge key={opt.id} variant="outline" className="text-[10px]">
                    {opt.name}
                  </Badge>
                ))}
                {tag.tagOptions.length > 8 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{tag.tagOptions.length - 8} more
                  </Badge>
                )}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Step 4: Variants ─────────────────────────────────────────────────
function StepVariants({
  data,
  onChange,
  storeVariants,
  storeTags,
}: {
  data: WizardData
  onChange: (p: Partial<WizardData>) => void
  storeVariants: Array<{ id: string; name: string }>
  storeTags: Array<{ id: string; name: string; tagOptions: Array<{ id: string; name: string }> }>
}) {
  // Find tags that have options and are selected for this product
  const tagsWithOptions = storeTags.filter(
    (t) => t.tagOptions.length > 0 && data.tagIds.includes(t.id),
  )

  if (storeVariants.length === 0 && tagsWithOptions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <p>No variant attributes or tag options available.</p>
        <p className="mt-1">
          Create store variants in the Tags tab, or select tags with options in Step 3.
        </p>
      </div>
    )
  }

  // Toggle a variant axis on/off
  const toggleAxis = (variantId: string, variantName: string) => {
    const existing = data.variantAxes.find((a) => a.variantId === variantId)
    if (existing) {
      onChange({
        variantAxes: data.variantAxes.filter((a) => a.variantId !== variantId),
      })
    } else {
      // Find tag options that match this variant name
      const matchingTag = storeTags.find(
        (t) => t.name.toLowerCase() === variantName.toLowerCase(),
      )
      const tagValues =
        matchingTag?.tagOptions.map((o) => ({
          value: o.name,
          price: data.price || '0',
          quantity: 0,
          selected: true,
        })) || []

      onChange({
        variantAxes: [
          ...data.variantAxes,
          { variantId, variantName, values: tagValues },
        ],
      })
    }
  }

  // Add a value to an axis
  const addValue = (variantId: string, value: string) => {
    onChange({
      variantAxes: data.variantAxes.map((a) =>
        a.variantId === variantId
          ? {
            ...a,
            values: [
              ...a.values,
              {
                value,
                price: data.price || '0',
                quantity: 0,
                selected: true,
              },
            ],
          }
          : a,
      ),
    })
  }

  // Update a value in an axis
  const updateValue = (
    variantId: string,
    index: number,
    partial: Partial<VariantValue>,
  ) => {
    onChange({
      variantAxes: data.variantAxes.map((a) =>
        a.variantId === variantId
          ? {
            ...a,
            values: a.values.map((v, i) =>
              i === index ? { ...v, ...partial } : v,
            ),
          }
          : a,
      ),
    })
  }

  // Count selected
  const totalSelected = data.variantAxes.reduce(
    (sum, a) => sum + a.values.filter((v) => v.selected).length,
    0,
  )

  return (
    <div className="space-y-4">
      {/* Variant axis selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium">
          Select Variant Attributes
        </label>
        <p className="text-xs text-muted-foreground">
          Choose which attributes define the variants for this product.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {storeVariants.map((sv) => {
            const isActive = data.variantAxes.some(
              (a) => a.variantId === sv.id,
            )
            return (
              <button
                key={sv.id}
                type="button"
                onClick={() => toggleAxis(sv.id, sv.name)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${isActive
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border hover:border-foreground/30'
                  }`}
              >
                {sv.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Per-axis value configuration */}
      {data.variantAxes.map((axis) => (
        <div key={axis.variantId} className="border rounded-md p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{axis.variantName}</h4>
            <span className="text-[10px] text-muted-foreground">
              {axis.values.filter((v) => v.selected).length} of{' '}
              {axis.values.length} selected
            </span>
          </div>

          {/* Values table */}
          {axis.values.length > 0 && (
            <div className="space-y-1">
              <div className="grid grid-cols-[auto_1fr_80px_80px] gap-2 text-[10px] text-muted-foreground font-medium px-1">
                <span></span>
                <span>Value</span>
                <span>Price ($)</span>
                <span>Stock</span>
              </div>
              {axis.values.map((val, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[auto_1fr_80px_80px] gap-2 items-center px-1 py-1 rounded ${val.selected ? '' : 'opacity-40'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={val.selected}
                    onChange={(e) =>
                      updateValue(axis.variantId, i, {
                        selected: e.target.checked,
                      })
                    }
                    className="h-3.5 w-3.5 rounded accent-foreground"
                  />
                  <span className="text-xs truncate">{val.value}</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={val.price}
                    onChange={(e) =>
                      updateValue(axis.variantId, i, {
                        price: e.target.value,
                      })
                    }
                    className="h-7 text-xs py-0"
                    disabled={!val.selected}
                  />
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={val.quantity}
                    onChange={(e) =>
                      updateValue(axis.variantId, i, {
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-7 text-xs py-0"
                    disabled={!val.selected}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add custom value */}
          <AddValueInput onAdd={(v) => addValue(axis.variantId, v)} />
        </div>
      ))}

      {data.variantAxes.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {totalSelected} variant{totalSelected !== 1 ? 's' : ''} will be
          created
        </p>
      )}
    </div>
  )
}

function AddValueInput({ onAdd }: { onAdd: (value: string) => void }) {
  const [inputVal, setInputVal] = useState('')
  return (
    <div className="flex gap-2">
      <Input
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        placeholder="Add custom value…"
        className="h-7 text-xs"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && inputVal.trim()) {
            e.preventDefault()
            onAdd(inputVal.trim())
            setInputVal('')
          }
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs px-2"
        onClick={() => {
          if (inputVal.trim()) {
            onAdd(inputVal.trim())
            setInputVal('')
          }
        }}
      >
        Add
      </Button>
    </div>
  )
}

// ── Step 5: Review ───────────────────────────────────────────────────
function StepReview({
  data,
  categories,
  storeTags,
}: {
  data: WizardData
  categories: Array<{ id: string; name: string; subcategories: Array<{ id: string; name: string }> }>
  storeTags: Array<{ id: string; name: string }>
}) {
  const category = categories.find((c) => c.id === data.categoryId)
  const subcategory = category?.subcategories.find(
    (s) => s.id === data.subcategoryId,
  )
  const selectedTags = storeTags.filter((t) => data.tagIds.includes(t.id))
  const totalVariants = data.variantAxes.reduce(
    (sum, a) => sum + a.values.filter((v) => v.selected).length,
    0,
  )

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Review your product</h3>

      <div className="space-y-3 text-xs">
        <div className="flex justify-between py-1.5 border-b">
          <span className="text-muted-foreground">Name</span>
          <span className="font-medium">{data.name}</span>
        </div>

        {data.description && (
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Description</span>
            <span className="font-medium text-right max-w-[200px] line-clamp-2">
              {data.description}
            </span>
          </div>
        )}

        <div className="flex justify-between py-1.5 border-b">
          <span className="text-muted-foreground">Category</span>
          <span className="font-medium">
            {category?.name || '—'}
            {subcategory ? ` / ${subcategory.name}` : ''}
          </span>
        </div>

        <div className="flex justify-between py-1.5 border-b">
          <span className="text-muted-foreground">Status</span>
          <Badge
            variant={data.status === 'active' ? 'default' : 'secondary'}
            className="text-[10px]"
          >
            {data.status}
          </Badge>
        </div>

        <div className="flex justify-between py-1.5 border-b">
          <span className="text-muted-foreground">Price</span>
          <span className="font-mono font-semibold">
            ${Number(data.price).toFixed(2)}
          </span>
        </div>

        {data.originalPrice && Number(data.originalPrice) > 0 && (
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Compare-at</span>
            <span className="font-mono line-through text-muted-foreground">
              ${Number(data.originalPrice).toFixed(2)}
            </span>
          </div>
        )}

        {selectedTags.length > 0 && (
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Tags</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {selectedTags.map((t) => (
                <Badge key={t.id} variant="outline" className="text-[10px]">
                  {t.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between py-1.5 border-b">
          <span className="text-muted-foreground">Variants</span>
          <span className="font-medium">
            {totalVariants} variant{totalVariants !== 1 ? 's' : ''} across{' '}
            {data.variantAxes.length} attribute
            {data.variantAxes.length !== 1 ? 's' : ''}
          </span>
        </div>

        {data.variantAxes
          .filter((a) => a.values.some((v) => v.selected))
          .map((axis) => (
            <div key={axis.variantId} className="pl-4 py-1.5 border-b">
              <span className="text-muted-foreground">{axis.variantName}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {axis.values
                  .filter((v) => v.selected)
                  .map((v, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      {v.value} · ${Number(v.price).toFixed(2)} · {v.quantity}{' '}
                      qty
                    </Badge>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// Tags tab (existing functionality, extracted into its own section)
// ════════════════════════════════════════════════════════════════════════
function TagsTab() {
  const { orgId } = useAuth()
  const { data: tags } = useSuspenseQuery({
    queryKey: ['tags'],
    queryFn: () => getTags(),
  })

  const { data: presets, refetch: refetchPresets } = useSuspenseQuery({
    queryKey: ['tagPresets'],
    queryFn: () => getTagPresets(),
  })

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">Tag Management</h1>

      <CreateTagForm storeId={orgId!} />

      {tags.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Active Tags</h2>
          {tags.map((tag) => (
            <TagOptionsManager
              key={tag.id}
              tag={tag}
              presets={presets}
              onPresetChange={() => refetchPresets()}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CreateTagForm({ storeId }: { storeId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm({
    validators: {
      onSubmit: createTagSchema,
    },
    defaultValues: {
      name: '',
      storeId,
    } as TCreateTagSchema,
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        await createTag({ data: value })
        await queryClient.invalidateQueries({ queryKey: ['tags'] })
        form.reset()
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Tag</CardTitle>
        <CardDescription>(e.g., Color, Size).</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex gap-4 items-end"
        >
          <form.Field
            name="name"
            children={({ state, handleChange, handleBlur }) => (
              <div className="flex-1 space-y-2">
                <Input
                  type="text"
                  value={state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="e.g., Color, Size, Material"
                />
                {state.meta.errors.length > 0 && state.meta.isTouched && (
                  <p className="text-sm text-red-500">
                    {state.meta.errors[0]?.message}
                  </p>
                )}
              </div>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Tag'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

interface TagOption {
  id: string
  name: string
}

function TagOptionsManager({
  tag,
  presets,
  onPresetChange,
}: {
  tag: { id: string; name: string }
  presets: any[]
  onPresetChange: () => void
}) {
  const [options, setOptions] = useState<Array<TagOption>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [isSavingPreset, setIsSavingPreset] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)

  // Load existing options
  useEffect(() => {
    getTagOptions({ data: { tagId: tag.id } }).then((opts) => {
      setOptions(opts.map((o: TagOption) => ({ id: o.id, name: o.name })))
    })
  }, [tag.id])

  const handleSaveOptions = async (newOptionNames: Array<string>) => {
    setIsLoading(true)
    try {
      const currentNames = options.map((o) => o.name)

      // Find new options that weren't there before
      const addedNames = newOptionNames.filter(
        (name) => !currentNames.includes(name),
      )

      // Find removed options (including edited ones)
      const removedOptions = options.filter(
        (o) => !newOptionNames.includes(o.name),
      )

      // Delete removed/edited options from database
      if (removedOptions.length > 0) {
        await Promise.all(
          removedOptions.map((opt) =>
            deleteTagOption({ data: { optionId: opt.id } }),
          ),
        )
      }

      // Create new options in database
      if (addedNames.length > 0) {
        await createTagOptions({
          data: {
            tagId: tag.id,
            options: addedNames,
          },
        })
      }

      // Refresh options from database to get new IDs
      const refreshedOptions = await getTagOptions({ data: { tagId: tag.id } })
      setOptions(
        refreshedOptions.map((o: TagOption) => ({ id: o.id, name: o.name })),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAsPreset = async () => {
    if (!presetName.trim() || options.length === 0) return
    setIsSavingPreset(true)
    try {
      await createTagPreset({
        data: {
          name: presetName,
          tagName: tag.name,
          options: options.map((o) => o.name),
        },
      })
      setPresetName('')
      onPresetChange()
    } finally {
      setIsSavingPreset(false)
    }
  }

  const handleLoadPreset = async (presetId: string | null) => {
    if (!presetId) return
    const preset = presets.find((p) => p.id === presetId)
    if (!preset) return
    setSelectedPresetId(presetId)
    setIsLoading(true)
    try {
      await handleSaveOptions(preset.options)
    } finally {
      setIsLoading(false)
      setSelectedPresetId(null)
    }
  }

  const handleDeletePreset = async (presetId: string) => {
    if (!confirm('Are you sure you want to delete this preset?')) return
    try {
      await deleteTagPreset({ data: { presetId } })
      onPresetChange()
    } catch (e) {
      console.error(e)
    }
  }

  const filteredPresets = presets.filter((p) => p.tagName === tag.name)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-bold text-xl">
            {tag.name}
            {isLoading && <span className="ml-2 text-sm text-muted animate-pulse font-normal italic">Saving...</span>}
          </CardTitle>
          <CardDescription>Options for {tag.name}</CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {filteredPresets.length > 0 && (
            <Select value={selectedPresetId ?? undefined} onValueChange={handleLoadPreset}>
              <SelectTrigger className="w-[180px]">
                <SelectValue>Load Preset</SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filteredPresets.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    className="cursor-pointer group flex items-start justify-between gap-4 py-2"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">
                        {p.options.join(', ')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePreset(p.id)
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity shrink-0"
                    >
                      <HugeiconsIcon icon={Trash} size={14} />
                    </button>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        <TagsInput
          value={options.map((o) => o.name)}
          onValueChange={handleSaveOptions}
          editable
          addOnPaste
        >
          <TagsInputList className="rounded-none min-h-[100px] border-2">
            {options.map((option) => (
              <TagsInputItem
                key={option.id}
                value={option.name}
                className="rounded-none border-primary/20"
              >
                {option.name}
              </TagsInputItem>
            ))}
            <TagsInputInput
              placeholder={`Add ${tag.name.toLowerCase()} option...`}
            />
          </TagsInputList>
        </TagsInput>

        <div className="flex gap-2 items-center pt-4 border-t">
          <Input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset Name (e.g. Standard Sizes)"
            className="max-w-[250px]"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveAsPreset}
            disabled={isSavingPreset || !presetName || options.length === 0}
            className="gap-2"
          >
            <HugeiconsIcon icon={Save} size={16} />
            {isSavingPreset ? 'Saving...' : 'Save as Preset'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
