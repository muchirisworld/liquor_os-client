import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createLogger, format, transports } from 'winston'
import { authMiddleware } from '@/middleware/authMiddleware'
import { tagOptions, tagPresets, tags } from '@/db/schema'
import { db } from '@/db'

const authFn = createServerFn({ method: 'POST' }).middleware([authMiddleware])

const log = createLogger({
  defaultMeta: { service: 'tags' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.printf(({ level, message, timestamp, ...metadata }) => {
          const meta = Object.keys(metadata).length
            ? JSON.stringify(metadata)
            : ''
          return `${timestamp} [tags] ${level.toUpperCase()}: ${message} ${meta}`
        }),
      ),
    }),
  ],
})

export const getTags = authFn.handler(async ({ context }) => {
  const { orgId } = context.auth

  if (!orgId) {
    log.error('Organization ID is required')
    throw new Error('Organization ID is required')
  }

  log.info('Fetching tags for orgId:', orgId)

  try {
    const tagsQueried = await db
      .select()
      .from(tags)
      .where(eq(tags.storeId, orgId))

    log.info(`Found ${tagsQueried.length} tags`)
    return tagsQueried
  } catch (error) {
    log.error('Failed to fetch tags', { error, orgId })
    throw new Error('Failed to fetch tags. Please try again.')
  }
})

const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  storeId: z.string().min(1, 'Store ID is required'),
})

export const createTag = authFn
  .inputValidator(createTagSchema)
  .handler(async ({ data, context }) => {
    const { name } = data
    const { orgId } = context.auth

    if (!orgId) {
      throw new Error('Organization ID is required')
    }

    const storeId = orgId

    log.info('Creating tag:', { name, storeId })

    try {
      const [newTag] = await db
        .insert(tags)
        .values({ name, storeId })
        .returning()

      log.info('Created tag:', { id: newTag.id, name: newTag.name })
      return newTag
    } catch (error: any) {
      log.error('Failed to create tag', { error, name, storeId })

      if (error?.cause?.code === '23503') {
        throw new Error(
          `Store with ID "${storeId}" does not exist. Please create the store first.`,
        )
      }

      throw new Error('Failed to create tag. Please try again.')
    }
  })

const createTagOptionsSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  options: z.array(z.string().min(1, 'Option name cannot be empty')),
})

export const createTagOptions = authFn
  .inputValidator(createTagOptionsSchema)
  .handler(async ({ data }) => {
    const { tagId, options } = data

    log.info(`Creating ${options.length} options for tag:`, tagId)

    try {
      const values = options.map((name) => ({ tagId, name }))

      const newOptions = await db.insert(tagOptions).values(values).returning()

      log.info(`Created ${newOptions.length} options`)
      return newOptions
    } catch (error) {
      log.error('Failed to create tag options', {
        error,
        tagId,
        optionCount: options.length,
      })
      throw new Error('Failed to create tag options. Please try again.')
    }
  })

const deleteTagOptionSchema = z.object({
  optionId: z.string().min(1, 'Option ID is required'),
})

export const deleteTagOption = authFn
  .inputValidator(deleteTagOptionSchema)
  .handler(async ({ data, context }) => {
    const { optionId } = data
    const { orgId } = context.auth

    if (!orgId) {
      throw new Error('Organization ID is required')
    }

    log.info('Deleting tag option:', optionId)

    try {
      const result = await db
        .delete(tagOptions)
        .where(eq(tagOptions.id, optionId))
        .returning({ tagId: tagOptions.tagId })

      if (result.length === 0) {
        throw new Error('Tag option not found')
      }

      const tag = await db
        .select({ storeId: tags.storeId })
        .from(tags)
        .where(eq(tags.id, result[0].tagId))
        .limit(1)

      if (tag.length === 0 || tag[0].storeId !== orgId) {
        throw new Error('Unauthorized: Tag option does not belong to your organization')
      }

      log.info('Deleted tag option:', optionId)
      return { success: true }
    } catch (error) {
      log.error('Failed to delete tag option', { error, optionId })
      throw new Error('Failed to delete tag option. Please try again.')
    }
  })

const getTagOptionsSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
})

export const getTagOptions = authFn
  .inputValidator(getTagOptionsSchema)
  .handler(async ({ data }) => {
    const { tagId } = data

    log.info('Fetching options for tag:', tagId)

    try {
      const options = await db
        .select()
        .from(tagOptions)
        .where(eq(tagOptions.tagId, tagId))

      log.info(`Found ${options.length} options for tag:`, tagId)
      return options
    } catch (error) {
      log.error('Failed to fetch tag options', { error, tagId })
      throw new Error('Failed to fetch tag options. Please try again.')
    }
  })

export const getTagPresets = authFn.handler(async ({ context }) => {
  const { orgId } = context.auth

  if (!orgId) {
    log.error('Organization ID is required')
    throw new Error('Organization ID is required')
  }

  log.info('Fetching tag presets for orgId:', orgId)

  try {
    const presetsQueried = await db
      .select()
      .from(tagPresets)
      .where(eq(tagPresets.storeId, orgId))

    log.info(`Found ${presetsQueried.length} tag presets`)
    return presetsQueried
  } catch (error) {
    log.error('Failed to fetch tag presets', { error, orgId })
    throw new Error('Failed to fetch tag presets. Please try again.')
  }
})

const createTagPresetSchema = z.object({
  name: z.string().min(1, 'Preset name is required'),
  tagName: z.string().min(1, 'Tag name is required'),
  options: z.array(z.string().min(1, 'Option name cannot be empty')),
})

export const createTagPreset = authFn
  .inputValidator(createTagPresetSchema)
  .handler(async ({ data, context }) => {
    const { name, tagName, options } = data
    const { orgId } = context.auth

    if (!orgId) {
      throw new Error('Organization ID is required')
    }

    log.info('Creating tag preset:', { name, tagName, options, orgId })

    try {
      const [newPreset] = await db
        .insert(tagPresets)
        .values({
          name,
          tagName,
          options,
          storeId: orgId,
        })
        .returning()

      log.info('Created tag preset:', { id: newPreset.id, name: newPreset.name })
      return newPreset
    } catch (error) {
      log.error('Failed to create tag preset', { error, name, orgId })
      throw new Error('Failed to create tag preset. Please try again.')
    }
  })

const deleteTagPresetSchema = z.object({
  presetId: z.string().min(1, 'Preset ID is required'),
})

export const deleteTagPreset = authFn
  .inputValidator(deleteTagPresetSchema)
  .handler(async ({ data }) => {
    const { presetId } = data

    log.info('Deleting tag preset:', presetId)

    try {
      await db.delete(tagPresets).where(eq(tagPresets.id, presetId))

      log.info('Deleted tag preset:', presetId)
      return { success: true }
    } catch (error) {
      log.error('Failed to delete tag preset', { error, presetId })
      throw new Error('Failed to delete tag preset. Please try again.')
    }
  })
