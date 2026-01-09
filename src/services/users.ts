import { supabase } from '../lib/supabase';

export interface UserWithRole {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
}

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Fetch all users for household members list
 * Returns array of users ordered by creation date
 */
export async function fetchUsers(): Promise<UserWithRole[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    // Handle case where role column doesn't exist yet (migration not run)
    return (data || []).map(user => ({
      ...user,
      role: user.role || 'viewer' as any, // Default to viewer if role is missing
    }));
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}

/**
 * Fetch current user's profile with role
 * Returns null if user is not authenticated
 */
export async function fetchCurrentUserProfile(): Promise<UserWithRole | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching current user profile:', error);
      throw error;
    }

    // Handle case where role column doesn't exist yet (migration not run)
    if (data && !data.role) {
      return {
        ...data,
        role: 'viewer', // Default to viewer if role is missing
      };
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch current user profile:', error);
    throw error;
  }
}

/**
 * Update user role (admin only - enforced by RLS)
 * @param userId - ID of user to update
 * @param newRole - New role to assign
 * @throws Error if user is not admin or RLS policy blocks the update
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Update user profile (non-role fields)
 * @param userId - ID of user to update
 * @param updates - Fields to update (display_name, avatar_url)
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserWithRole, 'display_name' | 'avatar_url'>>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}
