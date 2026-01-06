import { supabase } from '../lib/supabase';
import type { Category, CategoryWithChildren } from '../types/supabase';

// Fetch all categories
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch categories as tree structure
export async function fetchCategoryTree(): Promise<CategoryWithChildren[]> {
  const categories = await fetchCategories();
  
  // Get item counts per category
  const { data: itemCounts } = await supabase
    .from('items')
    .select('category_id')
    .eq('is_archived', false);

  const countMap = new Map<string, number>();
  itemCounts?.forEach(item => {
    if (item.category_id) {
      countMap.set(item.category_id, (countMap.get(item.category_id) || 0) + 1);
    }
  });

  // Build tree
  const categoryMap = new Map<string, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  categories.forEach(cat => {
    categoryMap.set(cat.id, { 
      ...cat, 
      children: [],
      item_count: countMap.get(cat.id) || 0
    });
  });

  categories.forEach(cat => {
    const category = categoryMap.get(cat.id)!;
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      categoryMap.get(cat.parent_id)!.children!.push(category);
    } else {
      rootCategories.push(category);
    }
  });

  return rootCategories;
}

// Create category
export async function createCategory(
  category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'is_system'>
): Promise<Category> {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...category,
      is_system: false,
      created_by: user.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update category
export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete category
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
