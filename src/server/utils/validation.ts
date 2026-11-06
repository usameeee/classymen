import { z } from 'zod';
import { ApiError } from './http';

/** Reads a Zod error into a single readable message. */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join('; ');
}

/** Parses input with `schema`, throwing a 400 `ApiError` when invalid. */
export function parseOrThrow<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError(400, formatZodError(result.error));
  }
  return result.data;
}
