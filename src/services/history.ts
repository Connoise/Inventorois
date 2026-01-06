import { supabase } from '../lib/supabase';
import type { ChangeHistory } from '../types/supabase';

// Fetch change history
export async function fetchHistory(limit: number = 50): Promise<ChangeHistory[]> {
  const { data, error } = await supabase
    .from('change_history')
    .select('*')
    .order('changed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Fetch history for specific entity
export async function fetchEntityHistory(
  entityType: 'item' | 'category' | 'location' | 'tag',
  entityId: string
): Promise<ChangeHistory[]> {
  const { data, error } = await supabase
    .from('change_history')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('changed_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Undo a change
export async function undoChange(historyId: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  
  const { data: history, error: fetchError } = await supabase
    .from('change_history')
    .select('*')
    .eq('id', historyId)
    .single();

  if (fetchError) throw fetchError;
  if (!history || history.is_undone) return;

  // Restore the previous state based on action type
  if (history.entity_type === 'item') {
    if (history.action === 'update' && history.field_name && history.old_value !== null) {
      await supabase
        .from('items')
        .update({ [history.field_name]: history.old_value })
        .eq('id', history.entity_id);
    } else if (history.action === 'delete' && history.snapshot_before) {
      // Restore deleted item
      await supabase
        .from('items')
        .update({ is_archived: false })
        .eq('id', history.entity_id);
    } else if (history.action === 'create') {
      // Archive created item
      await supabase
        .from('items')
        .update({ is_archived: true })
        .eq('id', history.entity_id);
    }
  }

  // Mark as undone
  await supabase
    .from('change_history')
    .update({
      is_undone: true,
      undone_by: user.user?.id,
      undone_at: new Date().toISOString(),
    })
    .eq('id', historyId);
}

// Get recent changes grouped by time
export function groupHistoryByTime(history: ChangeHistory[]): Record<string, ChangeHistory[]> {
  const now = new Date();
  const groups: Record<string, ChangeHistory[]> = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'This Month': [],
    'Older': [],
  };

  history.forEach(item => {
    const date = new Date(item.changed_at);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      groups['Today'].push(item);
    } else if (diffDays === 1) {
      groups['Yesterday'].push(item);
    } else if (diffDays < 7) {
      groups['This Week'].push(item);
    } else if (diffDays < 30) {
      groups['This Month'].push(item);
    } else {
      groups['Older'].push(item);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}
