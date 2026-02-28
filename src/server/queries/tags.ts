import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createLogger, format, transports } from 'winston'
import { authMiddleware } from '@/middleware/authMiddleware'
import { tagPresets, tags } from '@/db/schema'
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
