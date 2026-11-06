/**
 * Flat, hierarchical admin roles.
 * `super_admin` can manage other admins; `admin` manages catalog and orders.
 */
export const USER_ROLES = ['admin', 'super_admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const DEFAULT_USER_ROLE: UserRole = 'admin';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  super_admin: 'Super Admin',
};

/** Roles ordered from least to most privileged. */
const ROLE_RANK: Record<UserRole, number> = {
  admin: 1,
  super_admin: 2,
};

export function hasRoleAtLeast(role: UserRole, minimum: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
