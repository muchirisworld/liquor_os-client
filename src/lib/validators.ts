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
