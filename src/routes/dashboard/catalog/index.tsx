import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'

import { useAuth } from '@clerk/tanstack-react-start'
import type {TCreateTagSchema} from '@/lib/validators';
import {  createTagSchema } from '@/lib/validators'
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
  deleteTagOption,
  getTagOptions,
  getTags,
} from '@/server/queries/tags'

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

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Tag Management</h1>

      <div className="space-y-8">
        <CreateTagForm storeId={orgId!} />

        {tags.length > 0 && (
          <div className="space-y-6">
            {tags.map((tag) => (
              <TagOptionsManager key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CreateTagForm({ storeId }: { storeId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

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

function TagOptionsManager({ tag }: { tag: { id: string; name: string } }) {
  const [options, setOptions] = useState<Array<TagOption>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load existing options
  useState(() => {
    getTagOptions({ data: { tagId: tag.id } }).then((opts) => {
      setOptions(opts.map((o: TagOption) => ({ id: o.id, name: o.name })))
    })
  })

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">
          {tag.name}
          {isLoading && <span className="text-sm text-muted">Saving...</span>}
        </CardTitle>
        <CardDescription>Options for {tag.name}</CardDescription>
      </CardHeader>

      <CardContent>
        <TagsInput
          value={options.map((o) => o.name)}
          onValueChange={handleSaveOptions}
          editable
          addOnPaste
        >
          <TagsInputList className="rounded-none">
            {options.map((option) => (
              <TagsInputItem
                key={option.id}
                value={option.name}
                className="rounded-none"
              >
                {option.name}
              </TagsInputItem>
            ))}
            <TagsInputInput
              placeholder={`Add ${tag.name.toLowerCase()} option...`}
            />
          </TagsInputList>
        </TagsInput>
      </CardContent>
    </Card>
  )
}
