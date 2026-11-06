import { z } from 'zod';

/** Query-string boolean: only the literal `true` enables the flag. */
export const booleanQuery = z.enum(['true', 'false']).transform((value) => value === 'true');

/** Shared list flag; honoured only for admin requests. */
export const listQuerySchema = z.object({
  includeInactive: booleanQuery.optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
