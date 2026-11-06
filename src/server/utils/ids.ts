import { randomBytes } from 'node:crypto';

/** Short, human-friendly order reference, e.g. `CMR-7F3K9Q`. */
export function generateOrderNumber(): string {
  const suffix = randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `CMR-${suffix}`;
}
