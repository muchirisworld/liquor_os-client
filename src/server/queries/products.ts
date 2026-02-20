import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createLogger, format, transports } from 'winston'
import { authMiddleware } from '@/middleware/authMiddleware'
import {
    products,
    productTags,
    productVariants,
    productVariantValues,
    stocks,
    variants,
    tags,
} from '@/db/schema'
import { db } from '@/db'

const authFn = createServerFn().middleware([authMiddleware])

const log = createLogger({
    defaultMeta: { service: 'products' },
    transports: [
        new transports.Console({
            format: format.combine(
                format.timestamp(),
                format.printf(({ level, message, timestamp, ...metadata }) => {
                    const meta = Object.keys(metadata).length
                        ? JSON.stringify(metadata)
                        : ''
                    return `${timestamp} [products] ${level.toUpperCase()}: ${message} ${meta} `
                }),
            ),
        }),
    ],
})

// ── Fetch products for current store ──────────────────────────────────
export const getProducts = authFn.handler(async ({ context }) => {
    const { orgId } = context.auth

    if (!orgId) {
        log.error('Organization ID is required')
        throw new Error('Organization ID is required')
    }

    log.info('Fetching products for orgId:', orgId)

    try {
        const productsQueried = await db.query.products.findMany({
            where: eq(products.storeId, orgId),
            with: {
                category: true,
                subcategory: true,
                variants: {
                    with: {
                        variant: true,
                        productVariantValues: true,
                    },
                },
                tags: {
                    with: {
                        tag: true,
                    },
                },
            },
            orderBy: (products, { desc }) => [desc(products.createdAt)],
        })

        log.info(`Found ${productsQueried.length} products`)
        return productsQueried
    } catch (error: any) {
        log.error('Failed to fetch products', {
            message: error?.message,
            stack: error?.stack,
            orgId
        })
        throw new Error('Failed to fetch products. Please try again.')
    }
})

// ── Fetch categories with subcategories ───────────────────────────────
export const getCategories = authFn.handler(async () => {
    log.info('Fetching categories')

    try {
        const categoriesQueried = await db.query.categories.findMany({
            with: {
                subcategories: true,
            },
            orderBy: (categories, { asc }) => [asc(categories.name)],
        })

        log.info(`Found ${categoriesQueried.length} categories`)
        return categoriesQueried
    } catch (error: any) {
        log.error('Failed to fetch categories', { message: error?.message, stack: error?.stack })
        throw new Error('Failed to fetch categories. Please try again.')
    }
})

// ── Fetch store-level variant definitions (e.g. Size, Color) ──────────
export const getStoreVariants = authFn.handler(async ({ context }) => {
    const { orgId } = context.auth

    if (!orgId) {
        throw new Error('Organization ID is required')
    }

    log.info('Fetching variants for orgId:', orgId)

    try {
        const variantsQueried = await db
            .select()
            .from(variants)
            .where(eq(variants.storeId, orgId))

        log.info(`Found ${variantsQueried.length} variants`)
        return variantsQueried
    } catch (error: any) {
        log.error('Failed to fetch variants', { message: error?.message, stack: error?.stack, orgId })
        throw new Error('Failed to fetch store variants. Please try again.')
    }
})

// ── Fetch tag options for store tags ──────────────────────────────────
export const getStoreTags = authFn.handler(async ({ context }) => {
    const { orgId } = context.auth

    if (!orgId) {
        throw new Error('Organization ID is required')
    }

    log.info('Fetching tags with options for orgId:', orgId)

    try {
        const tagsQueried = await db.query.tags.findMany({
            where: eq(tags.storeId, orgId),
            with: {
                tagOptions: true,
            },
        })

        log.info(`Found ${tagsQueried.length} tags with options`)
        return tagsQueried
    } catch (error: any) {
        log.error('Failed to fetch tags with options', { message: error?.message, stack: error?.stack, orgId })
        throw new Error('Failed to fetch tags. Please try again.')
    }
})

// ── Create product with variants ──────────────────────────────────────

const variantValueSchema = z.object({
    value: z.string().min(1, 'Value is required'),
    price: z.string().min(1, 'Price is required'),
    quantity: z.number().int().min(0, 'Quantity must be >= 0'),
})

const variantAxisSchema = z.object({
    variantId: z.string().uuid('Invalid variant ID'),
    values: z.array(variantValueSchema).min(1, 'At least one value is required'),
})

const createProductSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    categoryId: z.string().uuid('Category is required'),
    subcategoryId: z.string().uuid().optional(),
    price: z.string().min(1, 'Price is required'),
    originalPrice: z.string().optional(),
    status: z.enum(['active', 'draft', 'archived']).default('draft'),
    tagIds: z.array(z.string().uuid()).default([]),
    variants: z.array(variantAxisSchema).default([]),
})

export const createProduct = authFn
    .inputValidator(createProductSchema)
    .handler(async ({ data, context }) => {
        const { orgId } = context.auth

        if (!orgId) {
            throw new Error('Organization ID is required')
        }

        log.info('Creating product:', { name: data.name, storeId: orgId })

        try {
            const result = await db.transaction(async (tx) => {
                // 1. Insert product
                const [newProduct] = await tx
                    .insert(products)
                    .values({
                        name: data.name,
                        description: data.description,
                        categoryId: data.categoryId,
                        subcategoryId: data.subcategoryId,
                        price: data.price,
                        originalPrice: data.originalPrice,
                        status: data.status,
                        storeId: orgId,
                    })
                    .returning()

                log.info('Created product:', { id: newProduct.id })

                // 2. Insert product tags
                if (data.tagIds.length > 0) {
                    await tx.insert(productTags).values(
                        data.tagIds.map((tagId) => ({
                            productId: newProduct.id,
                            tagId,
                        })),
                    )
                    log.info(`Attached ${data.tagIds.length} tags`)
                }

                // 3. Insert product variants + values + stocks
                for (const axis of data.variants) {
                    const [pv] = await tx
                        .insert(productVariants)
                        .values({
                            productId: newProduct.id,
                            variantId: axis.variantId,
                        })
                        .returning()

                    for (const val of axis.values) {
                        // Create stock entry
                        const [stockEntry] = await tx
                            .insert(stocks)
                            .values({
                                productVariantId: pv.id,
                                quantity: val.quantity,
                            })
                            .returning()

                        // Create variant value
                        await tx.insert(productVariantValues).values({
                            productVariantId: pv.id,
                            value: val.value,
                            price: val.price,
                            stockId: stockEntry.id,
                        })
                    }

                    log.info(`Created variant axis with ${axis.values.length} values`)
                }

                return newProduct
            })

            log.info('Product created successfully:', { id: result.id })
            return result
        } catch (error: any) {
            log.error('Failed to create product', { message: error?.message, stack: error?.stack, name: data.name })

            if (error?.cause?.code === '23503') {
                throw new Error(
                    'A referenced entity (store, category, tag, or variant) does not exist.',
                )
            }

            throw new Error('Failed to create product. Please try again.')
        }
    })
