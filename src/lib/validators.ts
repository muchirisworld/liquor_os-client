import { z } from 'zod'

export const signInFormSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  storeId: z.string().min(1, 'Store is required'),
})

export type TCreateTagSchema = z.infer<typeof createTagSchema>

export const createTagOptionsSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
  options: z.array(z.string().min(1, 'Option name cannot be empty')),
})

export type TCreateTagOptionsSchema = z.infer<typeof createTagOptionsSchema>
