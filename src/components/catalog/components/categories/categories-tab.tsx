import { useState, useEffect } from 'react'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Save,
  Trash,
  PencilIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Add01Icon,
} from '@hugeicons/core-free-icons'
import {
  getCategoriesWithSubs,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '@/server/queries/categories'

export function CategoriesTab() {
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{
    id: string
    name: string
    description: string | null
  } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: categoriesData } = useSuspenseQuery({
    queryKey: ['categoriesWithSubs'],
    queryFn: () => getCategoriesWithSubs(),
  })

  const openCreate = () => {
    setEditingCategory(null)
    setSheetOpen(true)
  }

  const openEdit = (cat: {
    id: string
    name: string
    description: string | null
  }) => {
    setEditingCategory(cat)
    setSheetOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await deleteCategory({ data: { id } })
      queryClient.invalidateQueries({ queryKey: ['categoriesWithSubs'] })
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categoriesData.length} categor
            {categoriesData.length !== 1 ? 'ies' : 'y'} in your store
          </p>
        </div>
        <Button onClick={openCreate}>+ New Category</Button>
      </div>

      {categoriesData.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No categories yet. Create your first category to organize
              products.
            </p>
            <Button className="mt-4" variant="outline" onClick={openCreate}>
              + Create Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categoriesData.map((cat) => {
            const isExpanded = expandedId === cat.id
            return (
              <Card key={cat.id} className="transition-colors">
                {/* Category header */}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-left flex-1 min-w-0"
                      onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                    >
                      <HugeiconsIcon
                        icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon}
                        strokeWidth={2}
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">
                          {cat.name}
                        </CardTitle>
                        {cat.description && (
                          <CardDescription className="text-xs line-clamp-1 mt-0.5">
                            {cat.description}
                          </CardDescription>
                        )}
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-[10px]">
                        {cat.subcategories.length} sub
                        {cat.subcategories.length !== 1 ? 's' : ''}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          openEdit({
                            id: cat.id,
                            name: cat.name,
                            description: cat.description,
                          })
                        }
                      >
                        <HugeiconsIcon
                          icon={PencilIcon}
                          strokeWidth={2}
                          className="size-3.5"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <HugeiconsIcon
                          icon={Trash}
                          strokeWidth={2}
                          className="size-3.5 text-destructive"
                        />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded: subcategories */}
                {isExpanded && (
                  <CardContent className="pt-0 border-t mt-2">
                    <SubcategoryList
                      categoryId={cat.id}
                      subcategories={cat.subcategories}
                    />
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit sheet */}
      <CategorySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editingCategory}
      />
    </div>
  )
}

function SubcategoryList({
  categoryId,
  subcategories: subs,
}: {
  categoryId: string
  subcategories: Array<{ id: string; name: string; description: string | null }>
}) {
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = async () => {
    if (!newName.trim()) return
    try {
      await createSubcategory({ data: { name: newName.trim(), categoryId } })
      setNewName('')
      queryClient.invalidateQueries({ queryKey: ['categoriesWithSubs'] })
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    try {
      await updateSubcategory({ data: { id, name: editName.trim() } })
      setEditingId(null)
      queryClient.invalidateQueries({ queryKey: ['categoriesWithSubs'] })
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleDeleteSub = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return
    try {
      await deleteSubcategory({ data: { id } })
      queryClient.invalidateQueries({ queryKey: ['categoriesWithSubs'] })
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="space-y-2 py-3">
      {subs.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No subcategories yet
        </p>
      )}
      {subs.map((sub) => (
        <div key={sub.id} className="flex items-center gap-2 group">
          {editingId === sub.id ? (
            <>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-7 text-xs flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(sub.id)}
                autoFocus
              />
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => handleUpdate(sub.id)}
              >
                <HugeiconsIcon
                  icon={Save}
                  strokeWidth={2}
                  className="size-3.5"
                />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setEditingId(null)}
              >
                ✕
              </Button>
            </>
          ) : (
            <>
              <span className="text-xs flex-1 truncate">{sub.name}</span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(sub.id)
                    setEditName(sub.name)
                  }}
                >
                  <HugeiconsIcon
                    icon={PencilIcon}
                    strokeWidth={2}
                    className="size-3"
                  />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => handleDeleteSub(sub.id)}
                >
                  <HugeiconsIcon
                    icon={Trash}
                    strokeWidth={2}
                    className="size-3 text-destructive"
                  />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Add subcategory inline */}
      <div className="flex items-center gap-2 pt-1">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New subcategory…"
          className="h-7 text-xs flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button
          size="icon-sm"
          variant="outline"
          onClick={handleAdd}
          disabled={!newName.trim()}
        >
          <HugeiconsIcon
            icon={Add01Icon}
            strokeWidth={2}
            className="size-3.5"
          />
        </Button>
      </div>
    </div>
  )
}

function CategorySheet({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: { id: string; name: string; description: string | null } | null
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setDescription(editing?.description ?? '')
    }
  }, [open, editing])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await updateCategory({
          data: {
            id: editing.id,
            name: name.trim(),
            description: description.trim() || undefined,
          },
        })
      } else {
        await createCategory({
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
          },
        })
      }
      queryClient.invalidateQueries({ queryKey: ['categoriesWithSubs'] })
      onOpenChange(false)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit Category' : 'New Category'}</SheetTitle>
          <SheetDescription>
            {editing
              ? 'Update the category name and description.'
              : 'Add a new category to organize your products.'}
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Whisky, Wines, Beer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
