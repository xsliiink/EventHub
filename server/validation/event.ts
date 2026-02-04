import { z } from 'zod';

export const updateEventSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
    location: z.string().min(1).optional()
})

export const createEventSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    location: z.string().min(1),
    selectedHobbies: z.array(z.string()).optional(),
})

export type UpdateEventDTO = z.infer<typeof updateEventSchema>
export type CreateEventDTO = z.infer<typeof createEventSchema>