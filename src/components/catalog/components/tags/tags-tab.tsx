import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/tanstack-react-start'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import { Trash, Save, PlusSignIcon } from '@hugeicons/core-free-icons'
import {
  createTag,
  createTagPreset,
  deleteTagPreset,
  getTagPresets,
  getTags,
} from '@/server/queries/tags'

export function TagsTab() {
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
      <h1 className="text-2xl font-bold">Tag & Preset Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CreateTagForm />
        <CreatePresetForm onCreated={() => refetchPresets()} />
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Metadata Tags</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="px-3 py-1 text-sm flex gap-2 items-center">
                  {tag.name}
                </Badge>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No tags created yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Variant Option Presets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presets.map((preset) => (
            <Card key={preset.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{preset.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive"
                    onClick={async () => {
                      if(confirm('Delete preset?')) {
                        await deleteTagPreset({ data: { presetId: preset.id } })
                        refetchPresets()
                      }
                    }}
                  >
                    <HugeiconsIcon icon={Trash} size={14} />
                  </Button>
                </div>
                <CardDescription>Option Name: {preset.tagName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {preset.options.map((opt, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{opt}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {presets.length === 0 && (
            <p className="text-sm text-muted-foreground italic col-span-2">No presets created yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function CreateTagForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) return
      setIsSubmitting(true)
      try {
        await createTag({ data: { name: value.name } })
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
        <CardTitle className="text-lg">New Metadata Tag</CardTitle>
        <CardDescription>Tags used for filtering (e.g., Organic, Sale).</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex gap-2 items-end"
        >
          <form.Field
            name="name"
            children={({ state, handleChange }) => (
              <div className="flex-1">
                <Input
                  value={state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="e.g., Organic"
                  className="h-9"
                />
              </div>
            )}
          />
          <Button type="submit" disabled={isSubmitting} size="sm">
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function CreatePresetForm({ onCreated }: { onCreated: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [tagName, setTagName] = useState('')
  const [options, setOptions] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !tagName || !options) return
    setIsSubmitting(true)
    try {
      await createTagPreset({
        data: {
          name,
          tagName,
          options: options.split(',').map(o => o.trim()).filter(Boolean),
        }
      })
      setName('')
      setTagName('')
      setOptions('')
      onCreated()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">New Variant Preset</CardTitle>
        <CardDescription>Common options for products (e.g., Standard Sizes).</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-3">
          <Input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Preset Name (e.g., Clothing Sizes)" 
            className="h-9 text-xs"
          />
          <div className="flex gap-2">
            <Input 
              value={tagName} 
              onChange={e => setTagName(e.target.value)} 
              placeholder="Option Name (e.g., Size)" 
              className="h-9 text-xs flex-1"
            />
            <Input 
              value={options} 
              onChange={e => setOptions(e.target.value)} 
              placeholder="Values (S, M, L)" 
              className="h-9 text-xs flex-[2]"
            />
            <Button type="submit" disabled={isSubmitting} size="sm">
              <HugeiconsIcon icon={Save} size={14} />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
