import { Types } from 'mongoose';

/** URL-safe slug, keeping Arabic/Latin letters and digits. */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Minimal shape used to check slug collisions. Typed structurally because
 * Mongoose 9 models are not assignable to a generic `Model<T>` parameter.
 */
interface SlugQueryable {
  collection: {
    findOne(filter: Record<string, unknown>): Promise<unknown>;
  };
}

/**
 * Returns `base`, or `base-2`, `base-3`… until the slug is free in `model`.
 */
export async function ensureUniqueSlug(
  model: SlugQueryable,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || 'item';

  for (let suffix = 1; ; suffix += 1) {
    const candidate = suffix === 1 ? root : `${root}-${suffix}`;
    const filter: Record<string, unknown> = { slug: candidate };
    if (excludeId) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }

    if (!(await model.collection.findOne(filter))) {
      return candidate;
    }
  }
}
