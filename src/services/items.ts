import { supabase } from '../lib/supabase';
import type { Item, ItemWithRelations, ItemFilters, ItemLocation } from '../types/supabase';

// Fetch all items with optional filters
export async function fetchItems(filters?: ItemFilters): Promise<ItemWithRelations[]> {
  let query = supabase
    .from('items')
    .select(`
      *,
      category:categories(*),
      locations:item_locations(
        *,
        location:locations(*)
      ),
      tags:item_tags(
        tag:tags(*)
      )
    `)
    .eq('is_archived', filters?.is_archived ?? false)
    .order('updated_at', { ascending: false });

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.is_essential !== undefined) {
    query = query.eq('is_essential', filters.is_essential);
  }

  if (filters?.is_favorite !== undefined) {
    query = query.eq('is_favorite', filters.is_favorite);
  }

  // Filter by location - need to check if item has a location relationship
  if (filters?.location_id) {
    const { data: itemsInLocation } = await supabase
      .from('item_locations')
      .select('item_id')
      .eq('location_id', filters.location_id);

    const itemIds = itemsInLocation?.map(il => il.item_id) || [];
    if (itemIds.length > 0) {
      query = query.in('id', itemIds);
    } else {
      // No items in this location, return empty array
      return [];
    }
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform the data to flatten tags
  return (data || []).map(item => ({
    ...item,
    tags: item.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    primary_location: item.locations?.find((l: any) => l.is_primary)?.location?.path_cache || 
                      item.locations?.[0]?.location?.path_cache || null
  }));
}

// Fetch single item by ID
export async function fetchItem(id: string): Promise<ItemWithRelations | null> {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      category:categories(*),
      locations:item_locations(
        *,
        location:locations(*)
      ),
      tags:item_tags(
        tag:tags(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return data ? {
    ...data,
    tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    primary_location: data.locations?.find((l: any) => l.is_primary)?.location?.path_cache || 
                      data.locations?.[0]?.location?.path_cache || null
  } : null;
}

// Create new item
export async function createItem(
  item: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'status'>,
  locationId?: string,
  tagIds?: string[]
): Promise<Item> {
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('items')
    .insert({
      ...item,
      created_by: user.user?.id,
      updated_by: user.user?.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Add location if provided
  if (locationId && data) {
    await supabase.from('item_locations').insert({
      item_id: data.id,
      location_id: locationId,
      is_primary: true,
      quantity_at_location: item.quantity,
    });
  }

  // Add tags if provided
  if (tagIds && tagIds.length > 0 && data) {
    await supabase.from('item_tags').insert(
      tagIds.map(tag_id => ({ item_id: data.id, tag_id }))
    );
  }

  // Log the creation
  await logChange('item', data.id, data.name, 'create', null, null, null, data);

  return data;
}

// Update item
export async function updateItem(
  id: string,
  updates: Partial<Item>,
  newLocationId?: string,
  newTagIds?: string[]
): Promise<Item> {
  const { data: user } = await supabase.auth.getUser();
  
  // Get current item for history
  const { data: oldItem } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('items')
    .update({
      ...updates,
      updated_by: user.user?.id,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Update location if provided
  if (newLocationId !== undefined) {
    // Remove old primary location
    await supabase
      .from('item_locations')
      .delete()
      .eq('item_id', id)
      .eq('is_primary', true);

    if (newLocationId) {
      await supabase.from('item_locations').insert({
        item_id: id,
        location_id: newLocationId,
        is_primary: true,
        quantity_at_location: data.quantity,
      });
    }
  }

  // Update tags if provided
  if (newTagIds !== undefined) {
    await supabase.from('item_tags').delete().eq('item_id', id);
    
    if (newTagIds.length > 0) {
      await supabase.from('item_tags').insert(
        newTagIds.map(tag_id => ({ item_id: id, tag_id }))
      );
    }
  }

  // Log changes
  if (oldItem) {
    for (const [key, newValue] of Object.entries(updates)) {
      const oldValue = oldItem[key as keyof typeof oldItem];
      if (oldValue !== newValue) {
        await logChange(
          'item',
          id,
          data.name,
          'update',
          key,
          String(oldValue ?? ''),
          String(newValue ?? ''),
          data
        );
      }
    }
  }

  return data;
}

// Update item quantity (quick action)
export async function updateItemQuantity(id: string, newQuantity: number): Promise<Item> {
  return updateItem(id, { quantity: newQuantity });
}

// Toggle favorite
export async function toggleItemFavorite(id: string): Promise<Item> {
  const { data: item } = await supabase
    .from('items')
    .select('is_favorite')
    .eq('id', id)
    .single();

  return updateItem(id, { is_favorite: !item?.is_favorite });
}

// Delete item (soft delete - archive)
export async function archiveItem(id: string): Promise<void> {
  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  await supabase
    .from('items')
    .update({ is_archived: true })
    .eq('id', id);

  if (item) {
    await logChange('item', id, item.name, 'delete', null, null, null, item);
  }
}

// Restore item
export async function restoreItem(id: string): Promise<void> {
  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  await supabase
    .from('items')
    .update({ is_archived: false })
    .eq('id', id);

  if (item) {
    await logChange('item', id, item.name, 'restore', null, null, null, item);
  }
}

// Permanently delete item
export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Get low stock items
export async function fetchLowStockItems(): Promise<ItemWithRelations[]> {
  return fetchItems({ status: 'low_stock', is_essential: true });
}

// Get favorite items
export async function fetchFavoriteItems(): Promise<ItemWithRelations[]> {
  return fetchItems({ is_favorite: true });
}

// Get recently updated items
export async function fetchRecentItems(limit: number = 10): Promise<ItemWithRelations[]> {
  const items = await fetchItems();
  return items.slice(0, limit);
}

// Batch update multiple items
export async function batchUpdateItems(
  ids: string[],
  updates: { category_id?: string; location_id?: string }
): Promise<void> {
  const { data: user } = await supabase.auth.getUser();

  // Update items in parallel
  const updatePromises = ids.map(async (id) => {
    // Update item fields if category changed
    if (updates.category_id !== undefined) {
      await supabase
        .from('items')
        .update({
          category_id: updates.category_id || null,
          updated_by: user.user?.id
        })
        .eq('id', id);
    }

    // Update location if provided
    if (updates.location_id !== undefined) {
      // Remove old primary location
      await supabase
        .from('item_locations')
        .delete()
        .eq('item_id', id)
        .eq('is_primary', true);

      // Add new location if not empty
      if (updates.location_id) {
        await supabase.from('item_locations').insert({
          item_id: id,
          location_id: updates.location_id,
          is_primary: true,
        });
      }
    }
  });

  await Promise.all(updatePromises);
}

// Helper to log changes
async function logChange(
  entityType: 'item' | 'category' | 'location' | 'tag',
  entityId: string,
  entityName: string | null,
  action: 'create' | 'update' | 'delete' | 'restore',
  fieldName: string | null,
  oldValue: string | null,
  newValue: string | null,
  snapshot: any
): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('id', user.user?.id)
    .single();

  await supabase.from('change_history').insert({
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    action,
    field_name: fieldName,
    old_value: oldValue,
    new_value: newValue,
    snapshot_before: action === 'create' ? null : snapshot,
    snapshot_after: action === 'delete' ? null : snapshot,
    changed_by: user.user?.id,
    changed_by_name: profile?.display_name || 'Unknown',
  });
}
