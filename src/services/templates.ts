import { supabase } from '../lib/supabase';
import type { ItemTemplate } from '../types/supabase';

// Fetch all templates
export async function fetchTemplates(): Promise<ItemTemplate[]> {
  const { data, error } = await supabase
    .from('item_templates')
    .select(`
      *,
      category:categories(name)
    `)
    .order('use_count', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Create template
export async function createTemplate(
  template: Omit<ItemTemplate, 'id' | 'created_at' | 'updated_at' | 'use_count' | 'is_system'>
): Promise<ItemTemplate> {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('item_templates')
    .insert({
      ...template,
      is_system: false,
      use_count: 0,
      created_by: user.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update template
export async function updateTemplate(
  id: string,
  updates: Partial<ItemTemplate>
): Promise<ItemTemplate> {
  const { data, error } = await supabase
    .from('item_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete template
export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('item_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Increment use count when template is used
export async function incrementTemplateUseCount(id: string): Promise<void> {
  const { data: template } = await supabase
    .from('item_templates')
    .select('use_count')
    .eq('id', id)
    .single();

  if (template) {
    await supabase
      .from('item_templates')
      .update({ use_count: (template.use_count || 0) + 1 })
      .eq('id', id);
  }
}
