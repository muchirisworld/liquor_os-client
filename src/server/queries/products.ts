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
    variantOptions,
    variantValues,
    stocks,
    tags,
    media,
} from '@/db/schema'
import { db } from '@/db'

const authFn = createServerFn({ method: 'POST' }).middleware([authMiddleware])

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
                        productVariantValues: {
                            with: {
                                variantValue: {
                                    with: {
                                        variantOption: true,
                                    },
                                },
                            },
                        },
                        stocks: true,
                    },
                },
                tags: {
                    with: {
                        tag: true,
                    },
                },
                media: true,
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

// ── Fetch store-level tags ────────────────────────────────────────────
export const getStoreTags = authFn.handler(async ({ context }) => {
    const { orgId } = context.auth

    if (!orgId) {
        throw new Error('Organization ID is required')
    }

    log.info('Fetching tags for orgId:', orgId)

    try {
        const tagsQueried = await db.query.tags.findMany({
            where: eq(tags.storeId, orgId),
        })

        log.info(`Found ${tagsQueried.length} tags`)
        return tagsQueried
    } catch (error: any) {
        log.error('Failed to fetch tags', { message: error?.message, stack: error?.stack, orgId })
        throw new Error('Failed to fetch tags. Please try again.')
    }
})

// ── Create product with variants and media ───────────────────────────

const variantOptionSchema = z.object({
    name: z.string().min(1, 'Option name is required'),
    values: z.array(z.string().min(1, 'Value name is required')).min(1, 'At least one value is required'),
})

const productVariantSchema = z.object({
    name: z.string().optional(),
    sku: z.string().optional(),
    price: z.string().min(1, 'Price is required'),
    inventory: z.number().int().min(0, 'Inventory must be >= 0'),
    optionValues: z.record(z.string(), z.string()), // e.g. { "Color": "Red", "Size": "M" }
})

const mediaSchema = z.object({
    url: z.string().url('Invalid image URL'),
    name: z.string().optional(),
    variantValue: z.object({
        optionName: z.string(),
        value: z.string(),
    }).optional(),
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
    options: z.array(variantOptionSchema).default([]),
    variants: z.array(productVariantSchema).default([]),
    media: z.array(mediaSchema).default([]),
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
                }

                // 3. Insert Variant Options and Values
                const optionMap = new Map<string, { id: string; valueMap: Map<string, string> }>()
                for (let i = 0; i < data.options.length; i++) {
                    const opt = data.options[i]
                    const [newOpt] = await tx
                        .insert(variantOptions)
                        .values({
                            productId: newProduct.id,
                            name: opt.name,
                            position: i,
                        })
                        .returning()

                    const valueMap = new Map<string, string>()
                    for (const valName of opt.values) {
                        const [newVal] = await tx
                            .insert(variantValues)
                            .values({
                                optionId: newOpt.id,
                                value: valName,
                            })
                            .returning()
                        valueMap.set(valName, newVal.id)
                    }
                    optionMap.set(opt.name, { id: newOpt.id, valueMap })
                }

                // 4. Insert Product Variants (SKUs)
                for (const v of data.variants) {
                    const [pv] = await tx
                        .insert(productVariants)
                        .values({
                            productId: newProduct.id,
                            name: v.name,
                            sku: v.sku,
                            price: v.price,
                            inventory: v.inventory,
                        })
                        .returning()

                    // Insert stock record
                    await tx.insert(stocks).values({
                        productVariantId: pv.id,
                        quantity: v.inventory,
                    })

                    // Link to variant values
                    const requiredOptionNames = data.options.map((o) => o.name)
                    for (const reqOpt of requiredOptionNames) {
                        if (!v.optionValues[reqOpt]) {
                            throw new Error(
                                `Variant "${v.name || 'unnamed'}" is missing value for option "${reqOpt}"`,
                            )
                        }
                    }

                    for (const [optName, valName] of Object.entries(v.optionValues)) {
                        const valId = optionMap.get(optName)?.valueMap.get(valName as string)
                        if (!valId) {
                            throw new Error(
                                `Invalid option "${optName}" or value "${valName}" for variant "${v.name || 'unnamed'}"`,
                            )
                        }
                        await tx.insert(productVariantValues).values({
                            productVariantId: pv.id,
                            variantValueId: valId,
                        })
                    }
                }

                // 5. Insert Media
                if (data.media.length > 0) {
                    for (const m of data.media) {
                        let variantValueId: string | undefined
                        if (m.variantValue) {
                            variantValueId = optionMap
                                .get(m.variantValue.optionName)
                                ?.valueMap.get(m.variantValue.value)
                        }

                        await tx.insert(media).values({
                            productId: newProduct.id,
                            url: m.url,
                            name: m.name,
                            variantValueId,
                        })
                    }
                }

                return newProduct
            })

            log.info('Product created successfully:', { id: result.id })
            return result
        } catch (error: any) {
            log.error('Failed to create product', { message: error?.message, stack: error?.stack, name: data.name })
            throw new Error('Failed to create product. Please try again.')
        }
    })
