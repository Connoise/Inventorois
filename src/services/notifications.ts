import { supabase } from '../lib/supabase';
import type { Notification } from '../types/supabase';

// Fetch notifications for current user
export async function fetchNotifications(): Promise<Notification[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

// Fetch unread count
export async function fetchUnreadCount(): Promise<number> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.user.id)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

// Mark notification as read
export async function markAsRead(id: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', id);
}

// Mark all as read
export async function markAllAsRead(): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return;

  await supabase
    .from('notifications')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', user.user.id)
    .eq('is_read', false);
}

// Delete notification
export async function deleteNotification(id: string): Promise<void> {
  await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
}

// Subscribe to real-time notifications
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void
) {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();
}
