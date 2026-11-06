import { Schema } from 'mongoose';
import { LOCALES, type Locale } from '@shared/constants/locales';

/** A single field translated into every supported locale. */
export type LocalizedString = Record<Locale, string>;

export const localizedStringSchema = new Schema<LocalizedString>(
  {
    ar: { type: String, default: '', trim: true },
    fr: { type: String, default: '', trim: true },
    en: { type: String, default: '', trim: true },
  },
  { _id: false },
);

export function emptyLocalizedString(): LocalizedString {
  return LOCALES.reduce((acc, locale) => {
    acc[locale] = '';
    return acc;
  }, {} as LocalizedString);
}
