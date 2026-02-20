import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createLogger, format, transports } from 'winston'
import { authMiddleware } from '@/middleware/authMiddleware'
import { categories, subcategories } from '@/db/schema'
import { db } from '@/db'

const authFn = createServerFn().middleware([authMiddleware])

const log = createLogger({
    defaultMeta: { service: 'categories' },
    transports: [
        new transports.Console({
            format: format.combine(
                format.timestamp(),
                format.printf(({ level, message, timestamp, ...metadata }) => {
                    const meta = Object.keys(metadata).length
                        ? JSON.stringify(metadata)
                        : ''
                    return `${timestamp} [categories] ${level.toUpperCase()}: ${message} ${meta}`
                }),
            ),
        }),
    ],
})

// ── Helpers ───────────────────────────────────────────────────────────

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

// ── Fetch all categories with subcategories ───────────────────────────

export const getCategoriesWithSubs = authFn.handler(async () => {
    log.info('Fetching categories with subcategories')

    try {
        const result = await db.query.categories.findMany({
            with: {
                subcategories: {
                    orderBy: (subcategories, { asc }) => [asc(subcategories.name)],
                },
            },
            orderBy: (categories, { asc }) => [asc(categories.name)],
        })

        log.info(`Found ${result.length} categories`)
        return result
    } catch (error: any) {
        log.error('Failed to fetch categories', {
            message: error?.message,
            stack: error?.stack,
        })
        throw new Error('Failed to fetch categories. Please try again.')
    }
})

// ── Create category ──────────────────────────────────────────────────

const createCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
})

export const createCategory = authFn
    .inputValidator(createCategorySchema)
    .handler(async ({ data }) => {
        const { name, description } = data
        const slug = slugify(name)

        log.info('Creating category:', { name, slug })

        try {
            const [newCategory] = await db
                .insert(categories)
                .values({ name, slug, description: description || null })
                .returning()

            log.info('Created category:', { id: newCategory.id, name: newCategory.name })
            return newCategory
        } catch (error: any) {
            log.error('Failed to create category', {
                message: error?.message,
                stack: error?.stack,
                name,
            })

            if (error?.cause?.code === '23505') {
                throw new Error(
                    `Category "${name}" already exists. Please choose a different name.`,
                )
            }

            throw new Error('Failed to create category. Please try again.')
        }
    })

// ── Update category ──────────────────────────────────────────────────

const updateCategorySchema = z.object({
    id: z.string().min(1, 'Category ID is required'),
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
})

export const updateCategory = authFn
    .inputValidator(updateCategorySchema)
    .handler(async ({ data }) => {
        const { id, name, description } = data
        const slug = slugify(name)

        log.info('Updating category:', { id, name })

        try {
            const [updated] = await db
                .update(categories)
                .set({ name, slug, description: description || null, updatedAt: new Date() })
                .where(eq(categories.id, id))
                .returning()

            if (!updated) {
                throw new Error('Category not found')
            }

            log.info('Updated category:', { id: updated.id })
            return updated
        } catch (error: any) {
            log.error('Failed to update category', {
                message: error?.message,
                stack: error?.stack,
                id,
            })

            if (error?.cause?.code === '23505') {
                throw new Error(
                    `Category "${name}" already exists. Please choose a different name.`,
                )
            }

            throw new Error('Failed to update category. Please try again.')
        }
    })

// ── Delete category ──────────────────────────────────────────────────

const deleteCategorySchema = z.object({
    id: z.string().min(1, 'Category ID is required'),
})

export const deleteCategory = authFn
    .inputValidator(deleteCategorySchema)
    .handler(async ({ data }) => {
        const { id } = data

        log.info('Deleting category:', id)

        try {
            await db.delete(categories).where(eq(categories.id, id))

            log.info('Deleted category:', id)
            return { success: true }
        } catch (error: any) {
            log.error('Failed to delete category', {
                message: error?.message,
                stack: error?.stack,
                id,
            })
            throw new Error('Failed to delete category. Please try again.')
        }
    })

// ── Create subcategory ───────────────────────────────────────────────

const createSubcategorySchema = z.object({
    name: z.string().min(1, 'Subcategory name is required'),
    categoryId: z.string().min(1, 'Category ID is required'),
    description: z.string().optional(),
})

export const createSubcategory = authFn
    .inputValidator(createSubcategorySchema)
    .handler(async ({ data }) => {
        const { name, categoryId, description } = data
        const slug = slugify(name)

        log.info('Creating subcategory:', { name, categoryId })

        try {
            const [newSub] = await db
                .insert(subcategories)
                .values({
                    name,
                    slug,
                    categoryId,
                    description: description || null,
                })
                .returning()

            log.info('Created subcategory:', { id: newSub.id, name: newSub.name })
            return newSub
        } catch (error: any) {
            log.error('Failed to create subcategory', {
                message: error?.message,
                stack: error?.stack,
                name,
                categoryId,
            })

            if (error?.cause?.code === '23505') {
                throw new Error(
                    `Subcategory "${name}" already exists. Please choose a different name.`,
                )
            }

            throw new Error('Failed to create subcategory. Please try again.')
        }
    })

// ── Update subcategory ───────────────────────────────────────────────

const updateSubcategorySchema = z.object({
    id: z.string().min(1, 'Subcategory ID is required'),
    name: z.string().min(1, 'Subcategory name is required'),
    description: z.string().optional(),
})

export const updateSubcategory = authFn
    .inputValidator(updateSubcategorySchema)
    .handler(async ({ data }) => {
        const { id, name, description } = data
        const slug = slugify(name)

        log.info('Updating subcategory:', { id, name })

        try {
            const [updated] = await db
                .update(subcategories)
                .set({ name, slug, description: description || null, updatedAt: new Date() })
                .where(eq(subcategories.id, id))
                .returning()

            if (!updated) {
                throw new Error('Subcategory not found')
            }

            log.info('Updated subcategory:', { id: updated.id })
            return updated
        } catch (error: any) {
            log.error('Failed to update subcategory', {
                message: error?.message,
                stack: error?.stack,
                id,
            })

            if (error?.cause?.code === '23505') {
                throw new Error(
                    `Subcategory "${name}" already exists. Please choose a different name.`,
                )
            }

            throw new Error('Failed to update subcategory. Please try again.')
        }
    })

// ── Delete subcategory ───────────────────────────────────────────────

const deleteSubcategorySchema = z.object({
    id: z.string().min(1, 'Subcategory ID is required'),
})

export const deleteSubcategory = authFn
    .inputValidator(deleteSubcategorySchema)
    .handler(async ({ data }) => {
        const { id } = data

        log.info('Deleting subcategory:', id)

        try {
            await db.delete(subcategories).where(eq(subcategories.id, id))

            log.info('Deleted subcategory:', id)
            return { success: true }
        } catch (error: any) {
            log.error('Failed to delete subcategory', {
                message: error?.message,
                stack: error?.stack,
                id,
            })
            throw new Error('Failed to delete subcategory. Please try again.')
        }
    })
