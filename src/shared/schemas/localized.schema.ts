import { z } from 'zod';

const optionalText = z.string().trim().default('');

/** Brand label: Arabic is required as the default market language. */
export const localizedNameSchema = z.object({
  ar: z.string().trim().min(1),
  fr: optionalText,
  en: optionalText,
});

/** Free-form localized copy where any locale may be empty. */
export const localizedTextSchema = z.object({
  ar: optionalText,
  fr: optionalText,
  en: optionalText,
});

export type LocalizedNameInput = z.infer<typeof localizedNameSchema>;
export type LocalizedTextInput = z.infer<typeof localizedTextSchema>;
