/**
 * Permission Utilities
 * Provides role-based permission checking for the inventory app
 */

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Role hierarchy - higher number = more permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

/**
 * Check if user has required permission level
 * @param userRole - Current user's role
 * @param requiredRole - Minimum required role for permission
 * @returns true if user has permission, false otherwise
 */
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can create items
 * Requires: member, admin, or owner
 */
export function canCreateItems(role: UserRole): boolean {
  return hasPermission(role, 'member');
}

/**
 * Check if user can edit items
 * Requires: member, admin, or owner
 */
export function canEditItems(role: UserRole): boolean {
  return hasPermission(role, 'member');
}

/**
 * Check if user can delete items
 * Requires: admin or owner
 */
export function canDeleteItems(role: UserRole): boolean {
  return hasPermission(role, 'admin');
}

/**
 * Check if user can manage categories
 * Requires: admin or owner
 */
export function canManageCategories(role: UserRole): boolean {
  return hasPermission(role, 'admin');
}

/**
 * Check if user can manage locations
 * Requires: admin or owner
 */
export function canManageLocations(role: UserRole): boolean {
  return hasPermission(role, 'admin');
}

/**
 * Check if user can manage tags
 * Requires: admin or owner
 */
export function canManageTags(role: UserRole): boolean {
  return hasPermission(role, 'admin');
}

/**
 * Check if user can manage other users and their roles
 * Requires: admin or owner
 */
export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'admin');
}

/**
 * User-friendly role labels
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

/**
 * Detailed role descriptions for UI display
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  owner: 'Full access including user management',
  admin: 'Full access including managing categories, locations, and users',
  member: 'Can add and edit items (cannot delete or manage structure)',
  viewer: 'Read-only access to view inventory',
};
