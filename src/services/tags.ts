import { supabase } from '../lib/supabase';
import type { Tag, TagWithCount } from '../types/supabase';

// Fetch all tags with counts
export async function fetchTags(): Promise<TagWithCount[]> {
  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;

  // Get counts
  const { data: itemTags } = await supabase
    .from('item_tags')
    .select('tag_id');

  const countMap = new Map<string, number>();
  itemTags?.forEach(it => {
    countMap.set(it.tag_id, (countMap.get(it.tag_id) || 0) + 1);
  });

  return (tags || []).map(tag => ({
    ...tag,
    count: countMap.get(tag.id) || 0,
  }));
}

// Create tag
export async function createTag(
  tag: Omit<Tag, 'id' | 'created_at'>
): Promise<Tag> {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('tags')
    .insert({
      ...tag,
      created_by: user.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update tag
export async function updateTag(
  id: string,
  updates: Partial<Tag>
): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete tag
export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
