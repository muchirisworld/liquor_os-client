import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createProduct } from '@/server/queries/products'

export type WizardStep = 1 | 2 | 3 | 4 | 5

export interface SelectedAxis {
  id: string
  name: string
  values: Array<{ id: string; name: string }> // tag options with IDs
}

export interface VariantCombination {
  key: string
  parts: Array<{ axisName: string; value: string; tagOptionId: string }>
  label: string
  price: string
  quantity: number
  selected: boolean
}

export interface WizardData {
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
  selectedAxes: SelectedAxis[]
  combinations: VariantCombination[]
}

const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Basic Info',
  2: 'Pricing',
  3: 'Tags',
  4: 'Variants',
  5: 'Review',
}

export function ProductForm({
  categories,
  storeTags,
  onCreated,
  onCancel,
}: {
  categories: any[]
  storeTags: any[]
  onCreated: () => void
  onCancel?: () => void
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
    selectedAxes: [],
    combinations: [],
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
          variants: data.combinations
            .filter((c) => c.selected)
            .map((combo) => ({
              price: combo.price || data.price,
              quantity: combo.quantity,
              tagOptionIds: combo.parts.map((p) => p.tagOptionId),
            })),
        },
      })
      onCreated()
    } catch (error) {
      alert('Failed to create product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">{STEP_LABELS[step]}</h2>
        <div className="flex gap-1">
          {([1, 2, 3, 4, 5] as WizardStep[]).map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-foreground' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
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
          <StepVariants data={data} onChange={update} storeTags={storeTags} />
        )}
        {step === 5 && (
          <StepReview
            data={data}
            categories={categories}
            storeTags={storeTags}
          />
        )}
      </div>

      <div className="flex justify-between border-t pt-6">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1) as WizardStep)}
            disabled={step === 1}
          >
            Back
          </Button>
          {onCancel && step === 1 && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        {step < 5 ? (
          <Button
            onClick={() => setStep((s) => Math.min(5, s + 1) as WizardStep)}
            disabled={!canNext()}
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting || !canNext()}>
            {isSubmitting ? 'Creating…' : 'Create Product'}
          </Button>
        )}
      </div>
    </div>
  )
}

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
            <SelectValue>
              {data.categoryId
                ? categories.find((c) => c.id === data.categoryId)?.name
                : 'Select category'}
            </SelectValue>
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
              <SelectValue>
                {data.subcategoryId
                  ? subcategories.find((s) => s.id === data.subcategoryId)?.name
                  : 'Select subcategory'}
              </SelectValue>
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
            Customers will see the compare-at price crossed out next to the
            actual price.
          </p>
        )}
      </div>
    </div>
  )
}

function StepTags({
  data,
  onChange,
  storeTags,
}: {
  data: WizardData
  onChange: (p: Partial<WizardData>) => void
  storeTags: Array<{
    id: string
    name: string
    tagOptions: Array<{ id: string; name: string }>
  }>
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
            className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors ${
              isSelected
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

function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]]
  return arrays.reduce<T[][]>(
    (acc, arr) => acc.flatMap((combo) => arr.map((item) => [...combo, item])),
    [[]],
  )
}

function generateCombinations(
  axes: SelectedAxis[],
  basePrice: string,
): VariantCombination[] {
  if (axes.length === 0) return []

  const valueArrays = axes.map((axis) =>
    axis.values.map((v) => ({ axisName: axis.name, value: v.name, tagOptionId: v.id })),
  )

  const product = cartesianProduct(valueArrays)

  return product.map((parts) => ({
    key: parts.map((p) => `${p.axisName}:${p.tagOptionId}`).join('|'),
    parts,
    label: parts.map((p) => p.value).join(' / '),
    price: basePrice || '0',
    quantity: 0,
    selected: true,
  }))
}

function StepVariants({
  data,
  onChange,
  storeTags,
}: {
  data: WizardData
  onChange: (p: Partial<WizardData>) => void
  storeTags: Array<{
    id: string
    name: string
    tagOptions: Array<{ id: string; name: string }>
  }>
}) {
  const availableAxes = storeTags.filter(
    (t) => t.tagOptions.length > 0 && data.tagIds.includes(t.id),
  )

  if (availableAxes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <p>No variant attributes available.</p>
        <p className="mt-1">
          Select tags with options in Step 3 to create variant combinations.
        </p>
      </div>
    )
  }

  const toggleAxis = (tag: {
    id: string
    name: string
    tagOptions: Array<{ id: string; name: string }>
  }) => {
    const isActive = data.selectedAxes.some((a) => a.id === tag.id)
    let nextAxes: SelectedAxis[]

    if (isActive) {
      nextAxes = data.selectedAxes.filter((a) => a.id !== tag.id)
    } else {
      nextAxes = [
        ...data.selectedAxes,
        {
          id: tag.id,
          name: tag.name,
          values: tag.tagOptions.map((o) => ({ id: o.id, name: o.name })),
        },
      ]
    }

    const combos = generateCombinations(nextAxes, data.price)
    onChange({ selectedAxes: nextAxes, combinations: combos })
  }

  const updateCombination = (
    key: string,
    partial: Partial<VariantCombination>,
  ) => {
    onChange({
      combinations: data.combinations.map((c) =>
        c.key === key ? { ...c, ...partial } : c,
      ),
    })
  }

  const toggleAll = (selected: boolean) => {
    onChange({
      combinations: data.combinations.map((c) => ({ ...c, selected })),
    })
  }

  const selectedCount = data.combinations.filter((c) => c.selected).length

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium">Select Variant Attributes</label>
        <p className="text-xs text-muted-foreground">
          Choose which tag attributes to combine into product variants.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {availableAxes.map((tag) => {
            const isActive = data.selectedAxes.some((a) => a.id === tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleAxis(tag)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  isActive
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border hover:border-foreground/30'
                }`}
              >
                {tag.name}
                <span className="ml-1 opacity-60">
                  ({tag.tagOptions.length})
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {data.combinations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">
              Variant Combinations ({selectedCount} of{' '}
              {data.combinations.length} selected)
            </label>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => toggleAll(true)}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => toggleAll(false)}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div
              className="grid gap-2 text-[10px] text-muted-foreground font-medium px-3 py-2 bg-muted/50 border-b"
              style={{
                gridTemplateColumns: `auto ${data.selectedAxes.map(() => '1fr').join(' ')} 80px 80px`,
              }}
            >
              <span></span>
              {data.selectedAxes.map((axis) => (
                <span key={axis.id}>{axis.name}</span>
              ))}
              <span>Price ($)</span>
              <span>Stock</span>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {data.combinations.map((combo) => (
                <div
                  key={combo.key}
                  className={`grid gap-2 items-center px-3 py-1.5 border-b last:border-b-0 transition-opacity ${combo.selected ? '' : 'opacity-40'}`}
                  style={{
                    gridTemplateColumns: `auto ${data.selectedAxes.map(() => '1fr').join(' ')} 80px 80px`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={combo.selected}
                    onChange={(e) =>
                      updateCombination(combo.key, {
                        selected: e.target.checked,
                      })
                    }
                    className="h-3.5 w-3.5 rounded accent-foreground"
                  />
                  {combo.parts.map((part) => (
                    <span key={part.axisName} className="text-xs truncate">
                      {part.value}
                    </span>
                  ))}
                  <Input
                    type="number"
                    step="0.01"
                    value={combo.price}
                    onChange={(e) =>
                      updateCombination(combo.key, { price: e.target.value })
                    }
                    className="h-7 text-xs py-0"
                    disabled={!combo.selected}
                  />
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={combo.quantity}
                    onChange={(e) =>
                      updateCombination(combo.key, {
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-7 text-xs py-0"
                    disabled={!combo.selected}
                  />
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-right">
            {selectedCount} variant{selectedCount !== 1 ? 's' : ''} will be
            created
          </p>
        </div>
      )}
    </div>
  )
}

function StepReview({
  data,
  categories,
  storeTags,
}: {
  data: WizardData
  categories: Array<{
    id: string
    name: string
    subcategories: Array<{ id: string; name: string }>
  }>
  storeTags: Array<{ id: string; name: string }>
}) {
  const category = categories.find((c) => c.id === data.categoryId)
  const subcategory = category?.subcategories.find(
    (s) => s.id === data.subcategoryId,
  )
  const selectedTags = storeTags.filter((t) => data.tagIds.includes(t.id))
  const selectedCombinations = data.combinations.filter((c) => c.selected)

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
            {selectedCombinations.length} combination
            {selectedCombinations.length !== 1 ? 's' : ''} across{' '}
            {data.selectedAxes.length} attribute
            {data.selectedAxes.length !== 1 ? 's' : ''}
          </span>
        </div>

        {selectedCombinations.length > 0 && (
          <div className="pl-4 space-y-1">
            {selectedCombinations.map((combo) => (
              <div
                key={combo.key}
                className="flex justify-between py-1 border-b"
              >
                <div className="flex flex-col">
                  <span>{combo.label}</span>
                  <div className="flex gap-1">
                    {combo.parts.map((p) => (
                      <span key={p.tagOptionId} className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                        {p.axisName}: {p.value}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="font-mono text-muted-foreground">
                  ${Number(combo.price).toFixed(2)} · {combo.quantity} qty
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
