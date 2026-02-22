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
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { createProduct } from '@/server/queries/products'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, Delete02Icon, ImageAdd01Icon } from '@hugeicons/core-free-icons'

export type WizardStep = 1 | 2 | 3 | 4 | 5

export interface VariantOptionInput {
  name: string
  values: string[]
}

export interface VariantCombination {
  sku: string
  parts: Record<string, string> // e.g. { "Color": "Red", "Size": "M" }
  label: string
  price: string
  inventory: number
  selected: boolean
}

export interface MediaInput {
  url: string
  name?: string
  variantValue?: {
    optionName: string
    value: string
  }
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
  options: VariantOptionInput[]
  combinations: VariantCombination[]
  media: MediaInput[]
}

const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Basic Info',
  2: 'Pricing',
  3: 'Tags',
  4: 'Variants & Media',
  5: 'Review',
}

export function ProductForm({
  categories,
  storeTags,
  tagPresets = [],
  onCreated,
  onCancel,
}: {
  categories: any[]
  storeTags: any[]
  tagPresets?: any[]
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
    options: [],
    combinations: [],
    media: [],
  })

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
        return data.price.trim().length > 0 && Number(data.price) >= 0
      case 3:
        return true
      case 4:
        return true
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
          options: data.options,
          variants: data.combinations
            .filter((c) => c.selected)
            .map((combo) => ({
              name: combo.label,
              sku: combo.sku || undefined,
              price: combo.price || data.price,
              inventory: combo.inventory,
              optionValues: combo.parts,
            })),
          media: data.media,
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
          <StepVariants data={data} onChange={update} tagPresets={tagPresets} />
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
  }>
}) {
  if (storeTags.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No tags created yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Select tags to attach to this product.
      </p>
      <div className="flex flex-wrap gap-2">
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
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                isSelected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground/30'
              }`}
            >
              {tag.name}
            </button>
          )
        })}
      </div>
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

function StepVariants({
  data,
  onChange,
  tagPresets = [],
}: {
  data: WizardData
  onChange: (p: Partial<WizardData>) => void
  tagPresets?: any[]
}) {
  const [newOptionName, setNewOptionName] = useState('')
  const [newOptionValues, setNewOptionValues] = useState('')

  const addOption = () => {
    if (!newOptionName || !newOptionValues) return
    const values = newOptionValues.split(',').map((v) => v.trim()).filter(Boolean)
    if (values.length === 0) return

    const nextOptions = [...data.options, { name: newOptionName, values }]
    const combos = generateCombinations(nextOptions, data.price)
    onChange({ options: nextOptions, combinations: combos })
    setNewOptionName('')
    setNewOptionValues('')
  }

  const usePreset = (preset: any) => {
    const nextOptions = [...data.options, { name: preset.tagName, values: preset.options }]
    const combos = generateCombinations(nextOptions, data.price)
    onChange({ options: nextOptions, combinations: combos })
  }

  const removeOption = (index: number) => {
    const nextOptions = data.options.filter((_, i) => i !== index)
    const combos = generateCombinations(nextOptions, data.price)
    onChange({ options: nextOptions, combinations: combos })
  }

  const generateCombinations = (options: VariantOptionInput[], basePrice: string): VariantCombination[] => {
    if (options.length === 0) return []

    const valueArrays = options.map((opt) => 
      opt.values.map((v) => ({ optionName: opt.name, value: v }))
    )

    const product = cartesianProduct(valueArrays)

    return product.map((parts) => {
      const partsMap: Record<string, string> = {}
      parts.forEach((p) => {
        partsMap[p.optionName] = p.value
      })

      const label = parts.map((p) => p.value).join(' / ')
      return {
        sku: '',
        parts: partsMap,
        label,
        price: basePrice || '0',
        inventory: 0,
        selected: true,
      }
    })
  }

  const updateCombination = (index: number, partial: Partial<VariantCombination>) => {
    const nextCombos = [...data.combinations]
    nextCombos[index] = { ...nextCombos[index], ...partial }
    onChange({ combinations: nextCombos })
  }

  const addMedia = () => {
    onChange({ media: [...data.media, { url: '' }] })
  }

  const updateMedia = (index: number, partial: Partial<MediaInput>) => {
    const nextMedia = [...data.media]
    nextMedia[index] = { ...nextMedia[index], ...partial }
    onChange({ media: nextMedia })
  }

  const removeMedia = (index: number) => {
    onChange({ media: data.media.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-8">
      {/* Options Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Product Options</Label>
          <span className="text-[10px] text-muted-foreground">e.g., Color, Size</span>
        </div>

        <div className="space-y-3">
          {data.options.map((opt, i) => (
            <Card key={i} className="p-3 relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeOption(i)}
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </Button>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold">{opt.name}</span>
                <div className="flex flex-wrap gap-1">
                  {opt.values.map((v, vi) => (
                    <Badge key={vi} variant="secondary" className="text-[10px]">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          {data.options.length < 3 && (
            <div className="space-y-4">
              <div className="flex gap-2 items-end border p-3 rounded-md bg-muted/30">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px]">Option Name</Label>
                  <Input
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    placeholder="Size"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex-[2] space-y-1">
                  <Label className="text-[10px]">Values (comma separated)</Label>
                  <Input
                    value={newOptionValues}
                    onChange={(e) => setNewOptionValues(e.target.value)}
                    placeholder="S, M, L"
                    className="h-8 text-xs"
                  />
                </div>
                <Button onClick={addOption} size="sm" className="h-8">
                  <HugeiconsIcon icon={PlusSignIcon} size={14} />
                </Button>
              </div>

              {tagPresets.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">Use a Preset:</Label>
                  <div className="flex flex-wrap gap-1">
                    {tagPresets.map((p) => (
                      <Button
                        key={p.id}
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2 rounded-full"
                        onClick={() => usePreset(p)}
                      >
                        {p.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Combinations Section */}
      {data.combinations.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Variants ({data.combinations.length})</Label>
          <div className="border rounded-md overflow-hidden text-xs">
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-2 px-3 py-2 bg-muted/50 border-b font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>Label</span>
              <span>SKU</span>
              <span>Price</span>
              <span>Inventory</span>
              <span></span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {data.combinations.map((combo, i) => (
                <div key={i} className={`grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-2 items-center px-3 py-2 border-b last:border-b-0 ${!combo.selected ? 'opacity-40' : ''}`}>
                  <span className="font-medium truncate">{combo.label}</span>
                  <Input
                    value={combo.sku}
                    onChange={(e) => updateCombination(i, { sku: e.target.value })}
                    placeholder="SKU-123"
                    className="h-7 text-[10px]"
                    disabled={!combo.selected}
                  />
                  <Input
                    type="number"
                    value={combo.price}
                    onChange={(e) => updateCombination(i, { price: e.target.value })}
                    className="h-7 text-[10px]"
                    disabled={!combo.selected}
                  />
                  <Input
                    type="number"
                    value={combo.inventory}
                    onChange={(e) => updateCombination(i, { inventory: parseInt(e.target.value) || 0 })}
                    className="h-7 text-[10px]"
                    disabled={!combo.selected}
                  />
                  <input
                    type="checkbox"
                    checked={combo.selected}
                    onChange={(e) => updateCombination(i, { selected: e.target.checked })}
                    className="h-3.5 w-3.5 rounded accent-foreground"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Media Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Media</Label>
          <Button variant="outline" size="sm" onClick={addMedia} className="h-7 text-[10px]">
            <HugeiconsIcon icon={ImageAdd01Icon} size={14} className="mr-1" />
            Add Image URL
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {data.media.map((m, i) => (
            <Card key={i} className="p-3 flex gap-4 items-start">
              <div className="h-16 w-16 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {m.url ? (
                  <img src={m.url} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <HugeiconsIcon icon={ImageAdd01Icon} size={20} className="text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px]">Image URL</Label>
                  <Input
                    value={m.url}
                    onChange={(e) => updateMedia(i, { url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Link to Option (Optional)</Label>
                  <Select
                    value={m.variantValue?.optionName || "none"}
                    onValueChange={(v) => {
                      if (v === "none") {
                        updateMedia(i, { variantValue: undefined })
                      } else {
                        updateMedia(i, { variantValue: { optionName: v, value: "" } })
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-[10px]">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {data.options.map((opt) => (
                        <SelectItem key={opt.name} value={opt.name}>
                          {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {m.variantValue && (
                  <div className="space-y-1">
                    <Label className="text-[10px]">Value</Label>
                    <Select
                      value={m.variantValue.value}
                      onValueChange={(v) => 
                        updateMedia(i, { variantValue: { ...m.variantValue!, value: v } })
                      }
                    >
                      <SelectTrigger className="h-8 text-[10px]">
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.options
                          .find((o) => o.name === m.variantValue?.optionName)
                          ?.values.map((val) => (
                            <SelectItem key={val} value={val}>
                              {val}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMedia(i)}
                className="h-8 w-8 text-destructive"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepReview({
  data,
  categories,
  storeTags,
}: {
  data: WizardData
  categories: any[]
  storeTags: any[]
}) {
  const category = categories.find((c) => c.id === data.categoryId)
  const subcategory = category?.subcategories.find((s: any) => s.id === data.subcategoryId)
  const selectedTags = storeTags.filter((t) => data.tagIds.includes(t.id))
  const activeVariants = data.combinations.filter((c) => c.selected)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4 text-xs">
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Product Name</span>
            <span className="font-semibold">{data.name}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Base Price</span>
            <span className="font-semibold">${Number(data.price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Category</span>
            <span>{category?.name} {subcategory ? `/ ${subcategory.name}` : ''}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className="text-[10px] capitalize">{data.status}</Badge>
          </div>
          {selectedTags.length > 0 && (
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Tags</span>
              <div className="flex gap-1">
                {selectedTags.map(t => (
                  <Badge key={t.id} variant="secondary" className="text-[10px]">{t.name}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Label className="text-xs font-semibold">Images ({data.media.length})</Label>
          <div className="flex flex-wrap gap-2">
            {data.media.map((m, i) => (
              <div key={i} className="h-12 w-12 rounded border bg-muted overflow-hidden">
                <img src={m.url} alt="review" className="h-full w-full object-cover" />
              </div>
            ))}
            {data.media.length === 0 && <span className="text-xs text-muted-foreground">No images added</span>}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-semibold">Variants ({activeVariants.length})</Label>
        <div className="border rounded-md overflow-hidden text-[10px]">
          <div className="grid grid-cols-4 gap-2 px-3 py-1.5 bg-muted/50 border-b font-medium text-muted-foreground">
            <span>Label</span>
            <span>SKU</span>
            <span>Price</span>
            <span>Inventory</span>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {activeVariants.map((v, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 px-3 py-1.5 border-b last:border-b-0">
                <span className="font-medium">{v.label}</span>
                <span className="text-muted-foreground">{v.sku || '—'}</span>
                <span>${Number(v.price).toFixed(2)}</span>
                <span>{v.inventory}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
