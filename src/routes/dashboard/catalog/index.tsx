import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@clerk/tanstack-react-start'
import type { TCreateTagSchema } from '@/lib/validators';
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

export const Route = createFileRoute('/dashboard/catalog/')({
  component: RouteComponent,
  loader: async () => {
    const tags = await getTags()
    return { tags }
  },
})

function RouteComponent() {
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
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Tag Management</h1>

      <div className="space-y-8">
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
            <Select value={selectedPresetId} onValueChange={handleLoadPreset}>
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
