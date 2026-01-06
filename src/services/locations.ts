import { supabase } from '../lib/supabase';
import type { Location, LocationWithChildren } from '../types/supabase';

// Fetch all locations
export async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch locations as tree structure
export async function fetchLocationTree(): Promise<LocationWithChildren[]> {
  const locations = await fetchLocations();
  
  // Build tree
  const locationMap = new Map<string, LocationWithChildren>();
  const rootLocations: LocationWithChildren[] = [];

  locations.forEach(loc => {
    locationMap.set(loc.id, { ...loc, children: [] });
  });

  locations.forEach(loc => {
    const location = locationMap.get(loc.id)!;
    if (loc.parent_id && locationMap.has(loc.parent_id)) {
      locationMap.get(loc.parent_id)!.children!.push(location);
    } else {
      rootLocations.push(location);
    }
  });

  return rootLocations;
}

// Get flat list with full paths for dropdowns
export async function fetchLocationOptions(): Promise<{ id: string; name: string; path: string; depth: number }[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('id, name, path_cache, depth')
    .order('path_cache', { ascending: true });

  if (error) throw error;
  
  return (data || []).map(loc => ({
    id: loc.id,
    name: loc.name,
    path: loc.path_cache || loc.name || 'Unknown',
    depth: loc.depth || 0,
  }));
}

// Create location
export async function createLocation(
  location: Omit<Location, 'id' | 'created_at' | 'updated_at' | 'path_cache' | 'depth'>
): Promise<Location> {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('locations')
    .insert({
      ...location,
      created_by: user.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update location
export async function updateLocation(
  id: string,
  updates: Partial<Location>
): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete location
export async function deleteLocation(id: string): Promise<void> {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
